import Foundation
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio

/// Flashcards (docs/flashcards.md; Josh, 2026-10-27: three stages). Five
/// cards in play from the country's starter words; each card has a stage:
///
///   1 · Meet it: picture + word. Tap: the English shows and the word is
///       said; then say it once on the mic (lenient: a miss is a retry)
///   2 · Recall it: picture + English. Tap: the word shows and is said
///   3 · Say it: picture only, with the mic. The one real test: a pass moves
///       the word to your own words and the next word joins at stage 1
///
/// One card at a time (Josh, 2026-10-27: "i don't like the 5 at a time"):
/// five words rotate behind the scenes, and each step on a card moves on to
/// the next of the five, so a whole round passes at one stage before a word
/// comes back at its next (docs/flashcards.md → The deck: spacing).
///
/// Progress is kept on the phone, per country (the server keeps nothing yet).
@MainActor
@Observable
final class FlashcardsModel {
    enum Stage: Int, Codable { case meet = 1, recall = 2, say = 3 }

    /// The cards in play, in order
    private(set) var deck: [Flashcard] = []
    /// Which of the five is showing
    private(set) var index = 0
    /// The one card on screen
    var current: Flashcard? { deck.isEmpty ? nil : deck[index % deck.count] }
    private(set) var stages: [String: Stage] = [:]
    /// Words that passed stage 3
    private(set) var own: [Flashcard] = []
    /// Cards whose answer is showing (stage 1's English, stage 2's word, a missed stage 3)
    private(set) var revealed: Set<String> = []
    /// Stage 1: said once, so the card can move on
    private(set) var listening: String?
    private(set) var checking: String?
    /// A miss on this card (stage 3, or stage 1's retry)
    private(set) var missed: String?
    /// Just passed stage 3: the card's moment before it leaves
    private(set) var passed: String?
    private(set) var note: String?

    let speechLanguage: String
    private let pool: [Flashcard]
    private let api: APIClient
    private let voice = Voice()
    private let recorder = Recorder()
    private let storeKey: String
    static let inPlay = 5

    private struct Saved: Codable {
        var stages: [String: Stage]
        var own: [String]
    }

    init(cards: [Flashcard], language: Language, country: String, api: APIClient) {
        self.pool = cards
        self.speechLanguage = language.speechLang
        self.api = api
        self.storeKey = "flashcards.\(country)"
        load()
    }

    func stage(_ card: Flashcard) -> Stage { stages[card.id] ?? .meet }

    // MARK: Taps

    /// Tapping the card: stage 1 shows the English and says the word; stage 2
    /// shows the word, says it and moves the card to stage 3
    func tap(_ card: Flashcard) async {
        switch stage(card) {
        case .meet:
            revealed.insert(card.id)
            await say(card)
        case .recall:
            revealed.insert(card.id)
            await say(card)
            stages[card.id] = .say
            save()
            await next()
        case .say:
            break
        }
    }

    /// The mic: first tap listens, second checks what was heard
    func mic(_ card: Flashcard) async {
        if listening == card.id {
            await check(card)
        } else if listening == nil {
            guard await AudioSession.requestMicrophone() else {
                note = "The microphone is off. Turn it on in Settings."
                return
            }
            do {
                try AudioSession.activate()
                try recorder.start { _, _ in }
                listening = card.id
                missed = nil
                note = nil
            } catch {
                note = "The microphone didn't start. Try again."
            }
        }
    }

    private func check(_ card: Flashcard) async {
        let url = recorder.stop("flashcard")
        listening = nil
        guard let url, let audio = try? Data(contentsOf: url) else { return }
        try? FileManager.default.removeItem(at: url)
        checking = card.id
        defer { checking = nil }
        let heard = (try? await api.transcribe(audio: audio)) ?? ""
        let stage = stage(card)
        if Self.matches(heard: heard, said: card.said, needArticle: stage == .say) {
            missed = nil
            if stage == .meet {
                stages[card.id] = .recall
                save()
                await next()
            } else {
                passed = card.id
                try? await Task.sleep(for: .milliseconds(900))
                passed = nil
                pass(card)
                save()
            }
        } else {
            missed = card.id
            if stage == .say {
                // The answer shows and is said; the card stays at stage 3 and
                // comes back next round
                revealed.insert(card.id)
                await say(card)
                try? await Task.sleep(for: .milliseconds(700))
                await next()
            }
        }
    }

    /// The next of the five, after a short beat so the step registers
    private func next() async {
        try? await Task.sleep(for: .milliseconds(400))
        if let card = current { revealed.remove(card.id) }
        missed = nil
        guard !deck.isEmpty else { return }
        index = (index + 1) % deck.count
    }

    /// A word passes stage 3: it goes to your words, and the next word from
    /// the pool takes its place in the rotation, at stage 1
    private func pass(_ card: Flashcard) {
        stages[card.id] = nil
        revealed.remove(card.id)
        own.insert(card, at: 0)
        guard let at = deck.firstIndex(where: { $0.id == card.id }) else { return }
        deck.remove(at: at)
        let owned = Set(own.map(\.id))
        if let fresh = pool.first(where: { !owned.contains($0.id) && !deck.contains($0) }) {
            deck.insert(fresh, at: at)
            stages[fresh.id] = .meet
        }
        index = deck.isEmpty ? 0 : (at + 1) % deck.count
    }

    // MARK: Matching

    /// Lenient: accents and case ignored, close spellings accepted. Stage 3
    /// wants the article too; stage 1 counts the word alone
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

    /// The word in a native voice (the greeter's), the phone's own if that fails
    func say(_ card: Flashcard) async {
        voice.stop()
        do {
            try AudioSession.activate()
            let audio = try await api.speak(text: card.said, characterId: "guide", speed: 0.9)
            try await voice.play(audio)
        } catch {
            await voice.speak(card.said, language: speechLanguage, rate: 0.9)
        }
    }

    func stop() {
        voice.stop()
        if listening != nil { _ = recorder.stop("flashcards closed"); listening = nil }
    }

    // MARK: Saving

    private func load() {
        if let data = UserDefaults.standard.data(forKey: storeKey), let saved = try? JSONDecoder().decode(Saved.self, from: data) {
            stages = saved.stages
            own = saved.own.compactMap { id in pool.first { $0.id == id } }
            deck = pool.filter { stages[$0.id] != nil }
        }
        refill()
    }

    /// Five in play: the next words from the pool join at stage 1
    private func refill() {
        let owned = Set(own.map(\.id))
        for card in pool where deck.count < Self.inPlay && !owned.contains(card.id) && !deck.contains(where: { $0.id == card.id }) {
            deck.append(card)
            if stages[card.id] == nil { stages[card.id] = .meet }
        }
        save()
    }

    private func save() {
        let saved = Saved(stages: stages, own: own.map(\.id))
        if let data = try? JSONEncoder().encode(saved) { UserDefaults.standard.set(data, forKey: storeKey) }
    }
}
