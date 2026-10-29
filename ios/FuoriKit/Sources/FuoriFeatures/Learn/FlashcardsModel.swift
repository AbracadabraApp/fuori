import Foundation
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio

/// Flashcards (docs/flashcards.md; Josh, 2026-10-28): an endless feed, like
/// Instagram's, where every word moves along only when you say it.
///
///   1 · Meet it: picture + word, no mic. Tap: the English shows, the word is
///       said, then the mic opens by itself; say it to move on (a miss: the
///       word again, and the mic again)
///   2 · Recall it: picture + English, and the mic. Say the word; tapping the
///       card shows it, and counts as a miss
///   3 · Say it: picture only, and the mic, with the article. A pass makes the
///       word yours
///
/// What comes next is `FlashcardSchedule`: words come back a few cards later,
/// a step further along; words that are yours after 1, 3, 7… days. Scrolling
/// past a card is fine: it comes back. Progress is kept on the phone, per
/// country (the server keeps nothing yet).
@MainActor
@Observable
final class FlashcardsModel {
    typealias Stage = FlashcardSchedule.Stage

    /// One card in the feed. The same word can be in it more than once
    struct Item: Identifiable, Equatable {
        enum Outcome: Equatable { case passed, missed }
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
    /// Cards whose answer is showing (stage 1's English, a missed or asked-for word)
    private(set) var revealed: Set<UUID> = []
    private(set) var listening: UUID?
    private(set) var checking: UUID?
    /// A miss on this card just now (stage 1, which tries again)
    private(set) var missed: UUID?
    /// Just passed: the card's moment
    private(set) var passed: UUID?
    private(set) var note: String?

    let speechLanguage: String
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
    /// Nothing said for this long: the mic closes and the card waits for a tap
    private let firstSoundWait: TimeInterval = 5
    /// Whatever it hears (a room, a TV), the mic never stays open longer
    private let longest: TimeInterval = 8
    private let storeKey: String

    private struct Saved: Codable {
        var stages: [String: Stage]
        /// Before 2026-10-28: the ids of words that are yours, without days
        var own: [String]?
        var mine: [String: FlashcardSchedule.Own]?
    }

    init(cards: [Flashcard], language: Language, country: String, api: APIClient, tall: Bool = false) {
        self.pool = cards
        self.tall = tall
        self.speechLanguage = language.speechLang
        self.api = api
        self.storeKey = "flashcards.\(country)"
        self.schedule = FlashcardSchedule()
        load()
        more()
    }

    func stage(_ item: Item) -> Stage { item.done?.stage ?? schedule.stage(item.card.id) }

    /// Words that are yours, soonest check first
    var own: [Flashcard] {
        pool.filter { schedule.isOwn($0.id) }
            .sorted { (schedule.own[$0.id]?.due ?? .distantPast) < (schedule.own[$1.id]?.due ?? .distantPast) }
    }

    /// A few more cards at the end of the feed (it never runs out)
    func more(_ count: Int = 3) {
        let ids = pool.map(\.id)
        for _ in 0..<count {
            let recent = feed.suffix(FlashcardSchedule.apart).map(\.card.id)
            guard let id = schedule.next(from: ids, recent: recent, slot: feed.count, now: .now),
                  let card = pool.first(where: { $0.id == id }) else { return }
            schedule.shown(id, slot: feed.count)
            feed.append(Item(card: card))
        }
        save()
    }

    // MARK: Taps

    /// Tapping the card. Stage 1: the English shows, the word is said, and the
    /// mic opens. Stage 2: the word shows and is said, a miss. Stage 3: nothing
    func tap(_ item: Item) async {
        guard item.done == nil, listening != item.id, checking == nil else { return }
        switch stage(item) {
        case .meet:
            revealed.insert(item.id)
            await say(item.card)
            await listen(item)
        case .recall:
            finish(item, .missed)
            revealed.insert(item.id)
            await say(item.card)
        case .say:
            break
        }
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
                if !snap.hasSpoken, open >= self.firstSoundWait {
                    // Nothing said: the mic closes; the card waits for a tap
                    self.closeMic("flashcard, nothing said")
                    self.note = "Didn't catch that. Tap the mic to try again."
                    return
                }
            }
        }
    }

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
            missed = nil
            finish(item, .passed)
            passed = item.id
            try? await Task.sleep(for: .milliseconds(900))
            if passed == item.id { passed = nil }
        } else if stage == .meet {
            // Stage 1 tries again at once: the word, then the mic
            missed = item.id
            await say(item.card)
            await listen(item)
        } else {
            // The answer shows and is said; the word comes back soon
            finish(item, .missed)
            revealed.insert(item.id)
            await say(item.card)
        }
    }

    /// The card is answered: it stays in the feed as it was, and the word is
    /// scheduled again
    private func finish(_ item: Item, _ outcome: Item.Outcome) {
        guard let index = feed.firstIndex(where: { $0.id == item.id }) else { return }
        let stage = stage(item)
        feed[index].done = (outcome, stage)
        if outcome == .passed {
            schedule.passed(item.card.id, end: feed.count, now: .now)
        } else {
            schedule.missed(item.card.id, end: feed.count)
        }
        if missed == item.id { missed = nil }
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
    }

    // MARK: Saving

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storeKey),
              let saved = try? JSONDecoder().decode(Saved.self, from: data) else { return }
        var mine = saved.mine ?? [:]
        // Words that were yours before the days came in: checked at once
        for id in saved.own ?? [] where mine[id] == nil { mine[id] = .init(due: .now, step: 0) }
        let ids = Set(pool.map(\.id))
        schedule = FlashcardSchedule(stages: saved.stages.filter { ids.contains($0.key) && mine[$0.key] == nil }, own: mine.filter { ids.contains($0.key) })
    }

    private func save() {
        let saved = Saved(stages: schedule.stages, own: nil, mine: schedule.own)
        if let data = try? JSONEncoder().encode(saved) { UserDefaults.standard.set(data, forKey: storeKey) }
    }
}
