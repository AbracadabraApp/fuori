import FuoriNetworking

/// What the character's side of the screen shows for the turn being said: the character's bubble. The rules are in docs/dialogue-model.md → "What the screen shows"; this is
/// them in one place, without the voice or the network, so tests can feed it real turns (FuoriFeaturesTests →
/// CharacterBubbleTests). Moved here unchanged from ConversationModel's properties (2026-11-12): four of the day's
/// bugs lived in them with no test (the empty oval, the printed frame, the question finder's two).
struct CharacterBubble: Equatable {
    /// The turn as the model holds it
    struct Turn {
        /// The whole spoken line
        var line: String?
        /// Its English
        var english: String?
        /// Beginner parts (the parts reply), or only the answers to say back (the one-line reply)
        var parts: [APIClient.TurnPart]?
        /// The Beginner one-line reply's question, with its English (lib/beginner-2.ts → questionOf)
        var question: APIClient.IntroSentence?
        /// Characters of `line` spoken so far; nil when it's all out
        var shown: Int?
        /// The character is speaking
        var speaking: Bool
        /// A Beginner one-line reply whose first sentence has come but not its question: nothing printed yet
        var awaitingQuestion: Bool
        /// The learner is a Beginner
        var beginner: Bool
        /// The learner's reply has gone and the character's next line hasn't started: the bubble goes with the
        /// answers to say back (B12; Josh, 2026-11-14: "they should both go afteer reply")
        var replied = false
    }

    /// The words in the bubble; nil: no bubble
    var line: String?
    /// Typewriter progress within `line`; nil when it's all out
    var shown: Int?
    /// The English under the words (before the level's English setting is applied)
    var english: String?

    /// Where the question starts in the line
    static func questionStart(_ t: Turn) -> Int? {
        guard let question = t.question, let line = t.line, let r = line.range(of: question.text) else { return nil }
        return line.distance(from: line.startIndex, to: r.lowerBound)
    }

    /// A Beginner one-line reply (the English frame with the language slotted in): its parts are only the answers to
    /// say back. Only its question is printed, and nothing when it has none (Josh, 2026-11-12: "we shouldn't put
    /// english/frame in bubble")
    static func frameTurn(_ t: Turn) -> Bool {
        guard t.beginner, let parts = t.parts else { return false }
        return parts.allSatisfy(\.isAnswer)
    }

    /// The character's bubble: the question only on a Beginner one-line reply (nothing until the
    /// voice reaches it); nothing on a Beginner turn with no question; the whole line otherwise (Intermediate, and
    /// the parts reply's own bubbles are BeginnerBubbles)
    static func of(_ t: Turn) -> CharacterBubble {
        if t.replied || t.awaitingQuestion { return CharacterBubble(line: nil, shown: nil, english: nil) }
        if let question = t.question {
            let start = questionStart(t)
            // Steps 4–6 send the question with no English (heard, not printed: the ladder, D10): nothing under it
            let english: String? = question.en.isEmpty ? nil : question.en
            if let shown = t.shown, let start, shown < start { return CharacterBubble(line: nil, shown: nil, english: english) }
            return CharacterBubble(line: question.text, shown: t.shown.map { s in start.map { max(0, s - $0) } ?? s }, english: english)
        }
        if frameTurn(t) { return CharacterBubble(line: nil, shown: nil, english: nil) }
        return CharacterBubble(line: t.line, shown: t.shown, english: t.english)
    }
}
