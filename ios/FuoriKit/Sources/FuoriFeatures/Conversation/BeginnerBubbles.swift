import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Beginner level dialogue (docs/beginner-scaffolding.md; Josh, 2026-10-25):
/// her English is heard, not shown; what she says in the language shows as
/// bubbles as it's said, each its own bubble: the words that matter, then her
/// question. Her English is spoken, never shown (Josh, 2026-11-05: "if english
/// is needed it should be spoken by the character or listed underneath the
/// italian within the answer bubble"); nothing shows on a tap. Her side, on the left.
struct BeginnerBubbles: View {
    let parts: [APIClient.TurnPart]
    let speechLanguage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(Array(parts.enumerated()), id: \.offset) { _, part in
                PartBubble(part: part, speechLanguage: speechLanguage, question: part.kind == "question")
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.trailing, 40)
        .padding(.bottom, 10)
        .animation(.easeOut(duration: 0.25), value: parts)
    }
}

/// The answers to say back, on the learner's side, on their turn: "Say:" and
/// each answer in its own bubble, its English always under it, in light
/// italics (docs/dialogue-model.md → English in answer bubbles)
struct AnswersToSay: View {
    let answers: [APIClient.TurnPart]
    let speechLanguage: String
    /// Where the answer is a tap (mic refused, VoiceOver, the welcome's buttons): a tap says it
    var onSay: ((APIClient.TurnPart) -> Void)? = nil

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            ForEach(Array(answers.enumerated()), id: \.offset) { _, answer in
                PartBubble(part: answer, speechLanguage: speechLanguage, question: false, label: onSay == nil ? "Say:" : "Tap:", onTap: onSay.map { say in { say(answer) } })
            }
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.leading, 40)
    }
}

/// One part in the language. An answer (`label`) shows its English under it,
/// always; a tap does something only where the answer is a tap (`onTap`)
private struct PartBubble: View {
    let part: APIClient.TurnPart
    let speechLanguage: String
    let question: Bool
    var label: String? = nil
    /// Where answers are taps: say it (AnswersToSay.onSay)
    var onTap: (() -> Void)? = nil
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 18
    @ScaledMetric(relativeTo: .callout) private var englishSize: CGFloat = 15

    /// Answers show their English; her bubbles don't (she says it)
    private var english: String? { label != nil && !part.en.isEmpty ? part.en : nil }

    var body: some View {
        if let onTap {
            Button(action: onTap) { bubble }
                .buttonStyle(.plain)
                .accessibilityHint("Says it")
        } else {
            bubble
        }
    }

    private var bubble: some View {
        VStack(alignment: .leading, spacing: 4) {
            (label.map { Text("\($0) ").foregroundStyle(Tokens.Colors.muted).font(.system(size: englishSize)) } ?? Text(""))
                + Text(target(part.text))
                .font(.system(size: size, weight: question ? .semibold : .regular))
                .foregroundStyle(Tokens.Colors.ink)
            if let english {
                // Light italics in the muted ink, no parentheses (Josh, 2026-11-05: "light italics or parentheses or both")
                Text(english)
                    .font(.system(size: englishSize, weight: .light))
                    .italic()
                    .foregroundStyle(Tokens.Colors.muted)
            }
        }
        .multilineTextAlignment(.leading)
        .padding(.vertical, 10)
        .padding(.horizontal, 14)
        .frame(minHeight: 44)
        .background(label == nil ? Tokens.Colors.paper : Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(target(part.text)))
        .accessibilityValue(english ?? "")
    }

    /// Words in the language being learned, tagged so VoiceOver reads them in it
    private func target(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = speechLanguage
        return s
    }
}
