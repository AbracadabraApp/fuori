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

    private let intro: [APIClient.IntroSentence] = [
        .init(text: "Soy Raymundo, chofer de este camión.", en: "I'm Raymundo, driver of this bus."),
        .init(text: "Este túnel era el cauce del río.", en: "This tunnel was the riverbed."),
        .init(text: "¿Sube conmigo o mira desde aquí?", en: "Will you ride with me or watch from here?"),
    ]
    private var introLine: String { intro.map(\.text).joined(separator: " ") }

    private func turn(line: String? = nil, english: String? = nil, parts: [APIClient.TurnPart]? = nil, intro: [APIClient.IntroSentence]? = nil,
                      introHead: APIClient.IntroSentence? = nil, question: APIClient.IntroSentence? = nil, shown: Int? = nil,
                      speaking: Bool = true, awaitingQuestion: Bool = false, newBeginner: Bool = true) -> CharacterBubble.Turn {
        .init(line: line, english: english, parts: parts, intro: intro, introHead: introHead, question: question, shown: shown,
              speaking: speaking, awaitingQuestion: awaitingQuestion, newBeginner: newBeginner)
    }

    // MARK: The intro

    @Test func theIntroSheetShowsTheEnglishOfTheSentenceBeingSaid() {
        let second = intro[0].text.count + 1 + 3
        let t = turn(line: introLine, parts: parts(twoAnswers), intro: intro, shown: second)
        #expect(CharacterBubble.inIntro(t))
        #expect(CharacterBubble.introSubtitle(t)?.en == "This tunnel was the riverbed.")
    }

    @Test func theIntroEndsWhenTheQuestionStartsAndTheQuestionTypesInTheBubble() {
        let questionAt = CharacterBubble.introStarts(intro).last!
        let t = turn(line: introLine, parts: parts(twoAnswers), intro: intro, shown: questionAt + 4)
        #expect(!CharacterBubble.inIntro(t))
        let bubble = CharacterBubble.of(t)
        #expect(bubble.line == "¿Sube conmigo o mira desde aquí?")
        #expect(bubble.shown == 4)
        #expect(bubble.english == "Will you ride with me or watch from here?")
    }

    @Test func theFirstSentenceShowsBeforeTheReplyHasCome() {
        let t = turn(introHead: intro[0], shown: 5)
        #expect(CharacterBubble.inIntro(t))
        #expect(CharacterBubble.introSubtitle(t)?.en == "I'm Raymundo, driver of this bus.")
    }

    @Test func anInterruptedIntroGoesStraightToTheQuestion() {
        let t = turn(line: introLine, parts: parts(twoAnswers), intro: intro, shown: nil, speaking: false)
        #expect(!CharacterBubble.inIntro(t))
        #expect(CharacterBubble.of(t).line == "¿Sube conmigo o mira desde aquí?")
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
        let t = turn(line: line, english: "This tunnel was the riverbed. Do you want to get on?", shown: 12, newBeginner: false)
        let bubble = CharacterBubble.of(t)
        #expect(bubble.line == line)
        #expect(bubble.shown == 12)
    }
}
