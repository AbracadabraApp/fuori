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
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = Tokens.Size.bubbleText

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
    /// Hear it (D40): the speaker on each bubble plays its line; `hearing` is the line playing
    var onHear: ((String) -> Void)? = nil
    var hearing: String? = nil

    var body: some View {
        VStack(spacing: 8) {
            ForEach(Array(answers.enumerated()), id: \.offset) { i, answer in
                if i > 0 { OrMark() }
                AnswerBubble(text: answer.text, english: answer.en, speechLanguage: speechLanguage, onTap: onSay.map { say in { say(answer) } },
                             onHear: onHear.map { hear in { hear(answer.text) } }, hearing: hearing != nil, playing: hearing == answer.text)
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
    /// Hear it (D40, variant A): a speaker after the line, as Say it's; not where the bubble itself is a tap
    var onHear: (() -> Void)? = nil
    /// A line is playing (any bubble's): the speakers wait
    var hearing = false
    /// This bubble's line is the one playing
    var playing = false
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = Tokens.Size.bubbleText

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
            if let onHear, onTap == nil {
                HStack(alignment: .center, spacing: 6) {
                    lines
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel(Text(target))
                        .accessibilityValue(english)
                    Button(action: onHear) {
                        Image(systemName: playing ? "speaker.wave.2.fill" : "speaker.wave.2")
                            .font(.body)
                            .foregroundStyle(Tokens.Colors.youInk)
                            .frame(width: 44, height: 44)
                            .contentShape(.rect)
                    }
                    .buttonStyle(PressableStyle())
                    .disabled(hearing)
                    .accessibilityLabel("Hear it")
                }
                .padding(.vertical, -10)
                .padding(.trailing, -10)
            } else {
                lines
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel(Text(target))
                    .accessibilityValue(english)
            }
        }
    }

    private var lines: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(target)
                .font(.system(size: size))
                .foregroundStyle(Tokens.Colors.ink)
            if !english.isEmpty { BubbleEnglish(text: english, speaker: .you) }
        }
    }

    /// The line, tagged so VoiceOver reads it in the language
    private var target: AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = speechLanguage
        return s
    }
}
