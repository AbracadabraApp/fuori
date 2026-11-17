import Foundation
import Testing
import FuoriNetworking
@testable import FuoriFeatures

/// What the character's side shows, turn by turn (docs/dialogue-model.md → What the screen shows). Real turns from
/// Josh's Raymundo visit (409863b2, Guanajuato, 2026-11-12), where the bubble printed the English frame, sat empty
/// while the character spoke, or showed the English as the question
@Suite struct CharacterBubbleTests {
    private func parts(_ json: String) -> [APIClient.TurnPart] { try! JSONDecoder().decode([APIClient.TurnPart].self, from: Data(json.utf8)) }
    private let twoAnswers = #"[{"kind":"answer","text":"Sí, me gustan mucho.","en":"Yes, I like them a lot."},{"kind":"answer","text":"Son muy bonitos.","en":"They're very pretty."}]"#
    private let twoQuestions = #"[{"kind":"answer","text":"¿Cuánto cuesta el pasaje?","en":"How much is the fare?"},{"kind":"answer","text":"¿Adónde llega este camión?","en":"Where does this bus go?"}]"#

    private func turn(line: String? = nil, english: String? = nil, parts: [APIClient.TurnPart]? = nil,
                      question: APIClient.IntroSentence? = nil, shown: Int? = nil,
                      speaking: Bool = true, awaitingQuestion: Bool = false, beginner: Bool = true) -> CharacterBubble.Turn {
        .init(line: line, english: english, parts: parts, question: question, shown: shown,
              speaking: speaking, awaitingQuestion: awaitingQuestion, beginner: beginner)
    }

    // MARK: Beginner turns (the one-line reply)

    private let tunnels = "Muy bien, we'll get you to la plaza. Look at those stone arches over us. ¿Le gustan los túneles? Do you like the tunnels?"

    @Test func noBubbleWhileTheEnglishFrameIsSpoken() {
        let t = turn(line: tunnels, english: "…", parts: parts(twoAnswers), question: .init(text: "¿Le gustan los túneles?", en: "Do you like the tunnels?"), shown: 20)
        // The English is known already, but there are no words yet: no bubble (the empty oval)
        #expect(CharacterBubble.of(t).line == nil)
    }

    @Test func onlyTheSpanishQuestionIsPrintedOnceTheVoiceReachesIt() {
        let start = tunnels.distance(from: tunnels.startIndex, to: tunnels.range(of: "¿Le gustan")!.lowerBound)
        let t = turn(line: tunnels, english: "…", parts: parts(twoAnswers), question: .init(text: "¿Le gustan los túneles?", en: "Do you like the tunnels?"), shown: start + 2)
        let bubble = CharacterBubble.of(t)
        #expect(bubble.line == "¿Le gustan los túneles?")
        #expect(bubble.shown == 2)
        #expect(bubble.english == "Do you like the tunnels?")
    }

    // B49 (Josh, 2026-11-17: "never does the screen show moment 2 with transtation"): the question's English shows
    // once the Italian question has been said, while the voice goes on into its English aloud, not with the bubbles
    @Test @MainActor func theQuestionsEnglishShowsOnceTheQuestionHasBeenSaid() {
        let q = APIClient.IntroSentence(text: "¿Le gustan los túneles?", en: "Do you like the tunnels?")
        let start = tunnels.distance(from: tunnels.startIndex, to: tunnels.range(of: "¿Le gustan")!.lowerBound)
        let mid = CharacterBubble.of(turn(line: tunnels, english: "…", parts: parts(twoAnswers), question: q, shown: start + 5))
        #expect(!Subtitles(line: mid.line, shown: mid.shown, english: mid.english, note: nil).lineSaid)
        let past = CharacterBubble.of(turn(line: tunnels, english: "…", parts: parts(twoAnswers), question: q, shown: start + q.text.count + 3))
        #expect(Subtitles(line: past.line, shown: past.shown, english: past.english, note: nil).lineSaid)
        #expect(Subtitles(line: "Ciao.", shown: nil, english: "Hi.", note: nil).lineSaid)
    }

    @Test func aTurnWithQuestionsToAskPrintsNothing() {
        let line = "Perfect, then climb up, \"suba, suba\", watch the step. It's a short ride, \"es un ratito\"."
        let t = turn(line: line, english: line, parts: parts(twoQuestions), question: nil, shown: nil, speaking: false)
        let bubble = CharacterBubble.of(t)
        #expect(bubble.line == nil)
        #expect(bubble.english == nil)
    }

    @Test func aGoodbyeWithNoAnswersPrintsNothing() {
        let t = turn(line: "Está bien, Joshua. Adiós, que le vaya muy bien, and enjoy the plaza.", english: "…", parts: [], shown: nil, speaking: false)
        #expect(CharacterBubble.of(t).line == nil)
    }

    @Test func nothingIsPrintedUntilTheQuestionComesWithTheReply() {
        let t = turn(line: "Muy bien, we'll get you to la plaza. ", shown: 10, awaitingQuestion: true)
        #expect(CharacterBubble.of(t) == CharacterBubble(line: nil, shown: nil, english: nil))
    }

    // MARK: Intermediate

    @Test func intermediatePrintsTheWholeLine() {
        let line = "Questo tunnel era il letto del fiume. Vuole salire?"
        let t = turn(line: line, english: "This tunnel was the riverbed. Do you want to get on?", shown: 12, beginner: false)
        let bubble = CharacterBubble.of(t)
        #expect(bubble.line == line)
        #expect(bubble.shown == 12)
    }

    // MARK: The learner's reply sent (B12)

    /// Josh, 2026-11-14: "when the reply is given, the reply bubbles disaappear. The revious character bubble hanges
    /// there until new dialogue arrives -- they should both go afteer reply"
    @Test func theCharactersBubbleGoesWhenTheReplyIsSentAtEveryLevel() {
        var beginner = turn(line: tunnels, english: "…", parts: parts(twoAnswers), question: .init(text: "¿Le gustan los túneles?", en: "Do you like the tunnels?"), shown: nil, speaking: false)
        #expect(CharacterBubble.of(beginner).line != nil)
        beginner.replied = true
        #expect(CharacterBubble.of(beginner) == CharacterBubble(line: nil, shown: nil, english: nil))

        let line = "Questo tunnel era il letto del fiume. Vuole salire?"
        var intermediate = turn(line: line, english: "This tunnel was the riverbed. Do you want to get on?", shown: nil, speaking: false, beginner: false)
        #expect(CharacterBubble.of(intermediate).line == line)
        intermediate.replied = true
        #expect(CharacterBubble.of(intermediate) == CharacterBubble(line: nil, shown: nil, english: nil))
    }
}
