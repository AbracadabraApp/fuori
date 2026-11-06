import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Beginner level dialogue (docs/beginner-scaffolding.md; Josh, 2026-10-25):
/// her English is heard, not shown (Josh, 2026-11-05: "if english is needed it
/// should be spoken by the character or listed underneath the italian within
/// the answer bubble"); what she says in the language shows in her one bubble
/// as it's said, her question in bold (Josh, 2026-11-05: three bubbles for one
/// turn covered the screen). Nothing happens on a tap.
struct BeginnerBubbles: View {
    let parts: [APIClient.TurnPart]
    let speechLanguage: String
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 18

    var body: some View {
        if !parts.isEmpty {
            SpeechBubble(speaker: .her) {
                Text(words)
                    .font(.system(size: size))
                    .foregroundStyle(Tokens.Colors.ink)
            }
            .padding(.bottom, 10)
            .animation(.easeOut(duration: 0.25), value: parts)
        }
    }

    /// Her parts in order, one after another; the question bold. Tagged with
    /// the language so VoiceOver reads them in it
    private var words: AttributedString {
        parts.enumerated().reduce(into: AttributedString()) { all, item in
            var s = AttributedString((item.offset > 0 ? " " : "") + item.element.text)
            s.languageIdentifier = speechLanguage
            if item.element.kind == "question" { s.inlinePresentationIntent = .stronglyEmphasized }
            all += s
        }
    }
}

/// The answers to say back, on the learner's side, on their turn: each in the
/// learner's bubble with its English always under it, "or" between two (docs/
/// dialogue-model.md → English in answer bubbles; Who is talking)
struct AnswersToSay: View {
    let answers: [APIClient.TurnPart]
    let speechLanguage: String
    /// Where the answer is a tap (mic refused, VoiceOver, the welcome's buttons): a tap says it
    var onSay: ((APIClient.TurnPart) -> Void)? = nil

    var body: some View {
        VStack(spacing: 8) {
            ForEach(Array(answers.enumerated()), id: \.offset) { i, answer in
                if i > 0 { OrMark() }
                AnswerBubble(text: answer.text, english: answer.en, speechLanguage: speechLanguage, onTap: onSay.map { say in { say(answer) } })
            }
        }
    }
}

/// One answer the learner can say: the line, its English under it. A button
/// only where answers are taps
struct AnswerBubble: View {
    let text: String
    let english: String
    let speechLanguage: String
    var onTap: (() -> Void)? = nil
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 18

    var body: some View {
        if let onTap {
            Button(action: onTap) { bubble }
                .buttonStyle(PressableStyle())
                .accessibilityHint("Says it")
        } else {
            bubble
        }
    }

    private var bubble: some View {
        SpeechBubble(speaker: .you) {
            VStack(alignment: .leading, spacing: 2) {
                Text(target)
                    .font(.system(size: size))
                    .foregroundStyle(Tokens.Colors.ink)
                if !english.isEmpty { BubbleEnglish(text: english, speaker: .you) }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(target))
        .accessibilityValue(english)
    }

    /// The line, tagged so VoiceOver reads it in the language
    private var target: AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = speechLanguage
        return s
    }
}
