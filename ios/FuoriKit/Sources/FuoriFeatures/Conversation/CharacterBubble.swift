import FuoriNetworking

/// What the character's side of the screen shows for the turn being said: the intro's subtitle while the intro
/// plays, then the character's bubble. The rules are in docs/dialogue-model.md → "What the screen shows"; this is
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
        /// The intro's sentences, the question last
        var intro: [APIClient.IntroSentence]?
        /// The intro's first sentence, before the reply has come
        var introHead: APIClient.IntroSentence?
        /// The Beginner one-line reply's question, with its English (lib/beginner-2.ts → questionOf)
        var question: APIClient.IntroSentence?
        /// Characters of `line` spoken so far; nil when it's all out
        var shown: Int?
        /// The character is speaking
        var speaking: Bool
        /// A Beginner one-line reply whose first sentence has come but not its question: nothing printed yet
        var awaitingQuestion: Bool
        /// The new Beginner (not the old one behind the hidden switch)
        var newBeginner: Bool
    }

    /// The words in the bubble; nil: no bubble
    var line: String?
    /// Typewriter progress within `line`; nil when it's all out
    var shown: Int?
    /// The English under the words (before the level's English setting is applied)
    var english: String?

    /// Where each intro sentence starts in the line (the server joins them with one space)
    static func introStarts(_ intro: [APIClient.IntroSentence]?) -> [Int] {
        guard let intro else { return [] }
        var starts: [Int] = []
        var at = 0
        for s in intro { starts.append(at); at += s.text.count + 1 }
        return starts
    }

    /// The intro sentence the voice is on, while it's before the last one (the question); nil once the question
    /// starts, or when the line is all out
    static func introIndex(_ t: Turn) -> Int? {
        guard let intro = t.intro, intro.count > 1, let shown = t.shown, t.speaking else { return nil }
        let starts = introStarts(intro)
        let i = (starts.lastIndex { $0 <= shown }) ?? 0
        return i < intro.count - 1 ? i : nil
    }

    /// The intro is playing (its sheet is up), until the question starts and the chat takes over
    static func inIntro(_ t: Turn) -> Bool {
        if t.intro != nil { return introIndex(t) != nil }
        return t.introHead != nil && t.speaking
    }

    /// The intro's subtitle: the sentence being said, and how much of it is out
    static func introSubtitle(_ t: Turn) -> (text: String, en: String, shown: Int?)? {
        if let intro = t.intro, let i = introIndex(t) {
            let start = introStarts(intro)[i]
            return (intro[i].text, intro[i].en, t.shown.map { max(0, $0 - start) })
        }
        if let head = t.introHead, t.intro == nil, t.speaking { return (head.text, head.en, t.shown) }
        return nil
    }

    /// Where the question starts in the line
    static func questionStart(_ t: Turn) -> Int? {
        guard let question = t.question, let line = t.line, let r = line.range(of: question.text) else { return nil }
        return line.distance(from: line.startIndex, to: r.lowerBound)
    }

    /// A Beginner one-line reply (the English frame with the language slotted in): its parts are only the answers to
    /// say back. Only its question is printed, and nothing when it has none (Josh, 2026-11-12: "we shouldn't put
    /// english/frame in bubble")
    static func frameTurn(_ t: Turn) -> Bool {
        guard t.newBeginner, t.intro == nil, let parts = t.parts else { return false }
        return parts.allSatisfy(\.isAnswer)
    }

    /// The character's bubble: the question only, after an intro or on a Beginner one-line reply (nothing until the
    /// voice reaches it); nothing on a Beginner turn with no question; the whole line otherwise (Intermediate, and
    /// the parts reply's own bubbles are BeginnerBubbles)
    static func of(_ t: Turn) -> CharacterBubble {
        if t.awaitingQuestion { return CharacterBubble(line: nil, shown: nil, english: nil) }
        if let intro = t.intro, let last = intro.last {
            return CharacterBubble(line: last.text, shown: t.shown.map { max(0, $0 - (introStarts(intro).last ?? 0)) }, english: last.en)
        }
        if let question = t.question {
            let start = questionStart(t)
            if let shown = t.shown, let start, shown < start { return CharacterBubble(line: nil, shown: nil, english: question.en) }
            return CharacterBubble(line: question.text, shown: t.shown.map { s in start.map { max(0, s - $0) } ?? s }, english: question.en)
        }
        if frameTurn(t) { return CharacterBubble(line: nil, shown: nil, english: nil) }
        return CharacterBubble(line: t.line, shown: t.shown, english: t.english)
    }
}
