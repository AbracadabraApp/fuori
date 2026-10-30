import Foundation
#if os(iOS)
import AVFoundation
#endif
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio

/// Flashcards (docs/flashcards.md; Josh, 2026-10-28): an endless feed, like
/// Instagram's, where every word moves along only when you say it.
///
///   1 · Meet it: picture, word and English; the word is said and the mic
///       opens (Ripeti). Not heard: the word again, and the mic again
///   2 · Recall it: picture + English (Come si dice?). Say the word
///   3 · Say it: picture and a blank line (Che cos'è?). Say it with the
///       article; it appears on the line and the word is yours
///
/// Two outcomes, as the learner sees it (Josh, 2026-10-29): I said it, or I
/// need help. Help comes from a pause (about 4 s), a tap on the card, or a
/// word that wasn't heard (wrong or misheard: never "wrong"): first the hint
/// (article and first letters, il ca___), then the word played; then you say
/// it. Said with no help, the card moves on; after help it stays at its
/// stage and comes back a few cards later.
///
/// Hands-free (Josh, 2026-10-29): when a card stops in the middle of the
/// screen it starts by itself (stage 1 plays the word, then listens; stages
/// 2 and 3 listen); scrolling on closes the mic. A tap still works. With
/// VoiceOver on, or after a call, Siri or headphones coming out, it waits
/// for a tap, as in conversations. No auto-advance: you scroll.
///
/// What comes next is `FlashcardSchedule`: new words keep coming, and words
/// come back after gaps that stretch as they get easier (about 12 cards, 25,
/// 50, then days). A card scrolled past untried waits its turn in the deck.
/// Progress is kept on the phone, per country (the server keeps nothing yet).
@MainActor
@Observable
final class FlashcardsModel {
    typealias Stage = FlashcardSchedule.Stage

    /// One card in the feed. The same word can be in it more than once
    struct Item: Identifiable, Equatable {
        /// passed: said with no help; helped: said after help (it comes back)
        enum Outcome: Equatable { case passed, helped }
        let id = UUID()
        let card: Flashcard
        /// Once answered: how, and at which stage (the card stays as it was)
        var done: (outcome: Outcome, stage: Stage)?

        static func == (a: Item, b: Item) -> Bool {
            a.id == b.id && a.done?.outcome == b.done?.outcome && a.done?.stage == b.done?.stage
        }
    }

    private(set) var feed: [Item] = []
    private(set) var schedule: FlashcardSchedule
    /// Cards whose word is showing (after help, or once said)
    private(set) var revealed: Set<UUID> = []
    /// Help given on a card: 1 the hint, 2 the word played
    private(set) var help: [UUID: Int] = [:]
    private(set) var listening: UUID?
    private(set) var checking: UUID?
    /// Just passed: the card's moment
    private(set) var passed: UUID?
    private(set) var note: String?

    let speechLanguage: String
    /// Each stage's instruction, in the language (from /v1/content)
    let words: CardWords?
    /// The master deck's tall 2:3 cards (false: the old 2:1 starter words)
    let tall: Bool
    private let pool: [Flashcard]
    private let api: APIClient
    private let voice = Voice()
    private let recorder = Recorder()
    private let gate = GateBox()
    private var listenTask: Task<Void, Never>?
    /// Silence after the word ends the turn, as in the game; shorter, since
    /// it's one word
    private let endOfWord: TimeInterval = 1.2
    /// Nothing said for this long: the mic closes and the card waits for a
    /// tap. Longer than a conversation's 5 s: recalling a word takes thought
    private let firstSoundWait: TimeInterval = 8
    /// Whatever it hears (a room, a TV), the mic never stays open longer
    private let longest: TimeInterval = 8
    private let storeKey: String
    /// The card that has stopped in the middle of the screen (hands-free
    /// starts it once; it isn't started again until you scroll away and back)
    private var settled: UUID?
    @ObservationIgnored private var observers: [NSObjectProtocol] = []

    private struct Saved: Codable {
        var words: [String: FlashcardSchedule.Word]?
        /// Before 2026-10-29: stages of words in progress, and words that
        /// were "yours" (as ids before 2026-10-28, then with their days)
        var stages: [String: Stage]?
        var own: [String]?
        var mine: [String: Mine]?
        struct Mine: Codable { var due: Date; var step: Int }
    }

    init(cards: [Flashcard], language: Language, country: String, api: APIClient, tall: Bool = false) {
        self.pool = cards
        self.tall = tall
        self.speechLanguage = language.speechLang
        self.words = language.ui.cards
        self.api = api
        self.storeKey = "flashcards.\(country)"
        self.schedule = FlashcardSchedule()
        load()
        more()
        observeInterruptions()
    }

    // MARK: Hands-free

    /// A card has stopped in the middle: stage 1 plays the word and listens; stages 2 and 3 listen. Once per arrival
    func settle(_ item: Item, voiceOver: Bool) async {
        guard settled != item.id else { return }
        settled = item.id
        guard !voiceOver, item.done == nil, checking == nil, listening == nil else { return }
        if stage(item) == .meet {
            await say(item.card)
            // Scrolled on while the word played: no mic
            guard settled == item.id else { return }
        }
        await listen(item)
    }

    /// Scrolling: the mic closes without checking and the voice stops
    func unsettle() {
        settled = nil
        note = nil
        voice.stop()
        if listening != nil { closeMic("flashcard, scrolled") }
    }

    /// Calls, Siri and headphones coming out: the mic closes and the card
    /// waits for a tap (it stays settled, so nothing reopens by itself)
    private func observeInterruptions() {
        #if os(iOS)
        let center = NotificationCenter.default
        observers.append(center.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: .main) { [weak self] note in
            let began = (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt) == AVAudioSession.InterruptionType.began.rawValue
            if began { MainActor.assumeIsolated { self?.pause() } }
        })
        observers.append(center.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: .main) { [weak self] note in
            let reason = note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
            if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                MainActor.assumeIsolated { self?.pause() }
            }
        })
        #endif
    }

    /// Stops sound and mic but keeps the card settled: it waits for a tap
    func pause() {
        voice.stop()
        if listening != nil { closeMic("flashcard, interrupted") }
    }

    func stage(_ item: Item) -> Stage { item.done?.stage ?? schedule.stage(item.card.id) }

    /// A few more cards at the end of the feed (it never runs out)
    func more(_ count: Int = 3) {
        let ids = pool.map(\.id)
        for _ in 0..<count {
            guard let id = schedule.next(from: ids, slot: feed.count, now: .now, random: { Double.random(in: 0..<1) }),
                  let card = pool.first(where: { $0.id == id }) else { return }
            feed.append(Item(card: card))
            // Fetched before the card is reached, so its word plays at once
            if let url = card.audio, recordings[url] == nil { Task { _ = await recording(url) } }
        }
        save()
    }

    // MARK: Taps

    /// Tapping the card asks for help: stage 1 plays the word again; stages
    /// 2 and 3 give the next help (the hint, then the word). Then it listens
    func tap(_ item: Item) async {
        guard item.done == nil, checking == nil else { return }
        if listening == item.id { closeMic("flashcard, asked for help") }
        if stage(item) == .meet {
            await say(item.card)
        } else {
            await giveHelp(item)
        }
        guard settled == nil || settled == item.id else { return }
        await listen(item)
    }

    /// The mic: a tap listens (a short silence after the word checks it);
    /// tapping it again while listening checks at once
    func mic(_ item: Item) async {
        guard item.done == nil, checking == nil else { return }
        if listening == item.id {
            listenTask?.cancel()
            listenTask = nil
            await check(item)
        } else {
            await listen(item)
        }
    }

    /// The hint: the article and the word's first two letters ("il ca___",
    /// "l'au___", "el ca___"); a word with no article, its first letters
    nonisolated static func hint(for said: String) -> String {
        var article = "", word = said
        if let r = said.range(of: "'", options: .backwards) {
            article = String(said[..<r.upperBound]); word = String(said[r.upperBound...])
        } else if let space = said.firstIndex(of: " ") {
            article = String(said[...space]); word = String(said[said.index(after: space)...])
        }
        return article + String(word.prefix(2)) + "___"
    }

    /// The next help on a stage 2 or 3 card: the hint, then the word shown
    /// and played (again, if it was already)
    private func giveHelp(_ item: Item) async {
        let level = min((help[item.id] ?? 0) + 1, 2)
        help[item.id] = level
        if level == 2 {
            revealed.insert(item.id)
            await say(item.card)
        }
    }

    /// Words not heard on a card in a row, after the word was played: past
    /// this the mic stops reopening (a TV in the room) and the card waits
    private var unheard: [UUID: Int] = [:]
    private let unheardLimit = 3

    private func listen(_ item: Item) async {
        // Another card's mic closes without checking
        if listening != nil { closeMic("flashcard, another card") }
        guard await AudioSession.requestMicrophone() else {
            note = "The microphone is off. Turn it on in Settings."
            return
        }
        do {
            voice.stop()
            try AudioSession.activate()
            gate.reset()
            try recorder.start { [gate] level, time in gate.process(level: level, at: time) }
        } catch {
            note = "The microphone didn't start. Try again."
            return
        }
        listening = item.id
        note = nil
        let started = ProcessInfo.processInfo.systemUptime
        listenTask = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(100))
                guard !Task.isCancelled, let self, self.listening == item.id else { return }
                let snap = self.gate.snapshot()
                let open = ProcessInfo.processInfo.systemUptime - started
                if snap.hasSpoken, snap.silence >= self.endOfWord || open >= self.longest {
                    self.listenTask = nil
                    await self.check(item)
                    return
                }
                // A pause at stages 2 and 3 brings help, then it listens again
                if !snap.hasSpoken, open >= self.helpAfter, self.stage(item) != .meet, (self.help[item.id] ?? 0) < 2 {
                    self.closeMic("flashcard, help after a pause")
                    await self.giveHelp(item)
                    guard self.settled == nil || self.settled == item.id else { return }
                    await self.listen(item)
                    return
                }
                if !snap.hasSpoken, open >= self.firstSoundWait {
                    // Nothing said: the mic closes; the card waits for a tap
                    self.closeMic("flashcard, nothing said")
                    return
                }
            }
        }
    }

    /// A pause this long at stages 2 and 3 brings the next help
    private let helpAfter: TimeInterval = 4

    private func closeMic(_ why: String) {
        listenTask?.cancel()
        listenTask = nil
        _ = recorder.stop(why)
        listening = nil
    }

    private func check(_ item: Item) async {
        let url = recorder.stop("flashcard")
        listening = nil
        guard let url, let audio = try? Data(contentsOf: url) else { return }
        try? FileManager.default.removeItem(at: url)
        checking = item.id
        let heard = (try? await api.transcribe(audio: audio)) ?? ""
        checking = nil
        let stage = stage(item)
        if Self.matches(heard: heard, said: item.card.said, needArticle: stage == .say) {
            // Said it. Stage 1 always moves on (it's meeting the word); later
            // stages move on only without help
            revealed.insert(item.id)
            unheard[item.id] = nil
            finish(item, stage == .meet || (help[item.id] ?? 0) == 0 ? .passed : .helped)
            passed = item.id
            try? await Task.sleep(for: .milliseconds(900))
            if passed == item.id { passed = nil }
            return
        }
        // Not heard (a wrong word or misheard: the same to the learner): help
        if stage == .meet || (help[item.id] ?? 0) >= 2 {
            unheard[item.id, default: 0] += 1
            guard unheard[item.id]! < unheardLimit else { unheard[item.id] = nil; return }
            await say(item.card)
        } else {
            await giveHelp(item)
        }
        guard settled == nil || settled == item.id else { return }
        await listen(item)
    }

    /// The card is answered: it stays in the feed as it was, and the word is
    /// scheduled again (after help: same stage, back soon)
    private func finish(_ item: Item, _ outcome: Item.Outcome) {
        guard let index = feed.firstIndex(where: { $0.id == item.id }) else { return }
        feed[index].done = (outcome, stage(item))
        schedule.answered(item.card.id, helped: outcome == .helped, slot: index, now: .now, random: { Double.random(in: 0..<1) })
        save()
    }

    // MARK: Matching

    /// Lenient: accents and case ignored, close spellings accepted. Stage 3
    /// wants the article too; stages 1 and 2 count the word alone
    nonisolated static func matches(heard: String, said: String, needArticle: Bool) -> Bool {
        let h = normal(heard), s = normal(said)
        guard !h.isEmpty else { return false }
        if h.contains(s) || distance(h, s) <= max(1, s.count / 5) { return true }
        guard !needArticle else { return false }
        // The word without its article: after "l'" or the last space
        var w = s
        if let r = s.range(of: "'", options: .backwards) { w = String(s[r.upperBound...]) } else if let last = s.split(separator: " ").last { w = String(last) }
        return h.contains(w) || distance(h, w) <= max(1, w.count / 5)
    }

    nonisolated static func normal(_ text: String) -> String {
        text.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: nil)
            .components(separatedBy: CharacterSet.letters.union(.whitespaces).union(CharacterSet(charactersIn: "'")).inverted).joined()
            .trimmingCharacters(in: .whitespaces)
    }

    nonisolated static func distance(_ a: String, _ b: String) -> Int {
        let a = Array(a), b = Array(b)
        if a.isEmpty { return b.count }
        var row = Array(0...b.count)
        for i in 1...a.count {
            var prev = row[0]
            row[0] = i
            for j in stride(from: 1, through: b.count, by: 1) {
                let cur = row[j]
                row[j] = min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] == b[j - 1] ? 0 : 1))
                prev = cur
            }
        }
        return row[b.count]
    }

    // MARK: Voice

    /// The word as recorded once for the deck (a native male voice, Josh's
    /// pick); without a recording, or if it fails, the server's voice, then
    /// the phone's own
    func say(_ card: Flashcard) async {
        voice.stop()
        do {
            try AudioSession.activate()
            let audio: Data
            if let url = card.audio, let recorded = await recording(url) {
                audio = recorded
            } else {
                audio = try await api.speak(text: card.said, characterId: "guide", speed: 0.9)
            }
            try await voice.play(audio)
        } catch {
            await voice.speak(card.said, language: speechLanguage, rate: 0.9)
        }
    }

    /// Recordings fetched this session (a word comes back several times)
    @ObservationIgnored private var recordings: [URL: Data] = [:]

    private func recording(_ url: URL) async -> Data? {
        if let data = recordings[url] { return data }
        guard let (data, response) = try? await URLSession.shared.data(from: url),
              (response as? HTTPURLResponse)?.statusCode == 200 else { return nil }
        recordings[url] = data
        return data
    }

    func stop() {
        voice.stop()
        if listening != nil { closeMic("flashcards closed") }
        settled = nil
    }

    // MARK: Saving

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storeKey),
              let saved = try? JSONDecoder().decode(Saved.self, from: data) else { return }
        var words = saved.words ?? [:]
        // The older format: words in progress keep their stage; words that
        // were "yours" go on days, due now if they had no day
        if saved.words == nil {
            for (id, stage) in saved.stages ?? [:] { words[id] = .init(stage: stage, step: stage.rawValue - 1) }
            for id in saved.own ?? [] { words[id] = .init(stage: .say, step: FlashcardSchedule.gaps.count, due: .now) }
            for (id, mine) in saved.mine ?? [:] { words[id] = .init(stage: .say, step: FlashcardSchedule.gaps.count + mine.step, due: mine.due) }
        }
        let ids = Set(pool.map(\.id))
        schedule = FlashcardSchedule(words: words.filter { ids.contains($0.key) })
    }

    private func save() {
        let saved = Saved(words: schedule.words)
        if let data = try? JSONEncoder().encode(saved) { UserDefaults.standard.set(data, forKey: storeKey) }
    }
}
