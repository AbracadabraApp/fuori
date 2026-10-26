import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Beginner level dialogue (docs/beginner-scaffolding.md; Josh, 2026-10-25):
/// her English is heard, not shown; what she says in the language shows as
/// bubbles as it's said, each its own bubble: the words to keep, then her
/// question. A tap on a bubble shows its English. Her side, on the left.
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
/// each answer in its own bubble, its English a tap away
struct AnswersToSay: View {
    let answers: [APIClient.TurnPart]
    let speechLanguage: String

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            ForEach(Array(answers.enumerated()), id: \.offset) { _, answer in
                PartBubble(part: answer, speechLanguage: speechLanguage, question: false, label: "Say:")
            }
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.leading, 40)
    }
}

/// One part in the language; a tap shows or hides its English
private struct PartBubble: View {
    let part: APIClient.TurnPart
    let speechLanguage: String
    let question: Bool
    var label: String? = nil
    @State private var showsEnglish = false
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 18
    @ScaledMetric(relativeTo: .callout) private var englishSize: CGFloat = 15

    var body: some View {
        Button { showsEnglish.toggle() } label: {
            VStack(alignment: .leading, spacing: 4) {
                (label.map { Text("\($0) ").foregroundStyle(Tokens.Colors.muted).font(.system(size: englishSize)) } ?? Text(""))
                    + Text(target(part.text))
                    .font(.system(size: size, weight: question ? .semibold : .regular))
                    .foregroundStyle(Tokens.Colors.ink)
                if showsEnglish, !part.en.isEmpty {
                    Text(part.en)
                        .font(.system(size: englishSize))
                        .foregroundStyle(Tokens.Colors.muted)
                }
            }
            .multilineTextAlignment(.leading)
            .padding(.vertical, 10)
            .padding(.horizontal, 14)
            .frame(minHeight: 44)
            .background(label == nil ? Tokens.Colors.paper : Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(target(part.text)))
        .accessibilityHint(showsEnglish ? "Hides the English" : "Shows the English")
    }

    /// Words in the language being learned, tagged so VoiceOver reads them in it
    private func target(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = speechLanguage
        return s
    }
}
