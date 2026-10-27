import Foundation
import Observation
import FuoriCore
import FuoriNetworking
import FuoriAudio

/// Flashcards (docs/flashcards.md; Josh, 2026-10-27: three stages). Every
/// starter word is a card, each at its own stage:
///
///   1 · Meet it: picture + word. Tap: the English shows and the word is
///       said; then say it once on the mic (lenient: a miss is a retry)
///   2 · Recall it: picture + English. Tap: the word shows and is said
///   3 · Say it: picture only, with the mic. The one real test: a pass makes
///       the word yours
///
/// All the cards in one weighted shuffle (Josh, 2026-10-27): the further a
/// word has got, the more it comes up, so words in progress get finished
/// before new ones crowd in; once it's yours it comes up rarely, as a check.
/// Weights (see `weight`): not met 1, met 2, recalled 3, missed at "say it" 4,
/// yours ¼. A miss on a check takes a word back to stage 3.
///
/// Progress is kept on the phone, per country (the server keeps nothing yet).
@MainActor
@Observable
final class FlashcardsModel {
    enum Stage: Int, Codable { case meet = 1, recall = 2, say = 3 }

    /// What's on screen: every card, in a weighted shuffle
    private(set) var shown: [Flashcard] = []
    private(set) var stages: [String: Stage] = [:]
    /// Words that passed stage 3, newest first
    private(set) var own: [Flashcard] = []
    /// Words missed at stage 3 since their last pass: they weigh most
    private(set) var missedSay: Set<String> = []
    /// Cards whose answer is showing (stage 1's English, stage 2's word, a missed stage 3)
    private(set) var revealed: Set<String> = []
    private(set) var listening: String?
    private(set) var checking: String?
    /// A miss on this card just now (stage 3, or stage 1's retry)
    private(set) var missed: String?
    /// Just passed stage 3: the card's moment
    private(set) var passed: String?
    private(set) var note: String?

    let speechLanguage: String
    private let pool: [Flashcard]
    private let api: APIClient
    private let voice = Voice()
    private let recorder = Recorder()
    private let storeKey: String

    private struct Saved: Codable {
        var stages: [String: Stage]
        var own: [String]
        var missedSay: [String]?
    }

    init(cards: [Flashcard], language: Language, country: String, api: APIClient) {
        self.pool = cards
        self.speechLanguage = language.speechLang
        self.api = api
        self.storeKey = "flashcards.\(country)"
        load()
    }

    func isOwn(_ card: Flashcard) -> Bool { own.contains(card) }

    /// A word that's yours comes back as a check, at "say it"
    func stage(_ card: Flashcard) -> Stage { isOwn(card) ? .say : (stages[card.id] ?? .meet) }

    /// How much a card weighs in the shuffle (Josh, 2026-10-27): the further
    /// along, the more it comes up; a missed "say it" most; yours rarely
    func weight(_ card: Flashcard) -> Double {
        if isOwn(card) { return 0.25 }
        if missedSay.contains(card.id) { return 4 }
        switch stage(card) {
        case .meet: return 1
        case .recall: return 2
        case .say: return 3
        }
    }

    /// A new weighted shuffle of every card (opening the deck, or pulling to
    /// refresh). Weighted random order: each card's key is u^(1/weight),
    /// highest first, so a heavier card tends to come nearer the top
    func shuffle() {
        shown = pool
            .map { card in (card, pow(Double.random(in: 0.0001...1), 1 / weight(card))) }
            .sorted { $0.1 > $1.1 }
            .map(\.0)
    }

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
                revealed.remove(card.id)
            } else {
                passed = card.id
                try? await Task.sleep(for: .milliseconds(900))
                passed = nil
                missedSay.remove(card.id)
                revealed.remove(card.id)
                if !isOwn(card) {
                    stages[card.id] = nil
                    own.insert(card, at: 0)
                }
            }
            save()
        } else {
            missed = card.id
            if stage == .say {
                // The answer shows and is said. A word that was yours goes
                // back to stage 3; either way it now weighs most
                if isOwn(card) {
                    own.removeAll { $0 == card }
                    stages[card.id] = .say
                }
                missedSay.insert(card.id)
                revealed.insert(card.id)
                save()
                await say(card)
            }
        }
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
            missedSay = Set(saved.missedSay ?? [])
        }
        shuffle()
    }

    private func save() {
        let saved = Saved(stages: stages, own: own.map(\.id), missedSay: Array(missedSay))
        if let data = try? JSONEncoder().encode(saved) { UserDefaults.standard.set(data, forKey: storeKey) }
    }
}
