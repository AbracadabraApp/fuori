import SwiftUI
import FuoriDesign

/// Who is talking, at a glance (docs/dialogue-model.md → Who is talking; Josh,
/// 2026-11-05: "I'm interested in if a user can tell who is talking";
/// "Beginner always being different is not a goal"). The one bubble every
/// screen and level uses: hers on the left in warm parchment, the learner's on
/// the right in olive. Solid with a thin edge, so it reads over any picture;
/// no tail ("the left and right are clear and the tails look messy").
enum Speaker {
    case her, you
}

struct SpeechBubble<Content: View>: View {
    let speaker: Speaker
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .multilineTextAlignment(.leading)
            .padding(.vertical, 10)
            .padding(.horizontal, 14)
            .frame(minHeight: 44)
            .background(fill, in: Self.shape)
            .overlay(Self.shape.strokeBorder(edge, lineWidth: 1))
            // Hugs its words on the speaker's side, leaving room on the other
            .frame(maxWidth: .infinity, alignment: speaker == .you ? .trailing : .leading)
            .padding(speaker == .you ? .leading : .trailing, 40)
    }

    static var shape: RoundedRectangle { RoundedRectangle(cornerRadius: Tokens.Radius.bubble) }
    private var fill: Color { speaker == .you ? Tokens.Colors.youBubble : Tokens.Colors.herBubble }
    private var edge: Color { speaker == .you ? Tokens.Colors.youEdge : Tokens.Colors.herEdge }
}

/// The English under a line in a bubble: light italic, in the bubble's own ink
struct BubbleEnglish: View {
    let text: String
    let speaker: Speaker
    @ScaledMetric(relativeTo: .callout) private var size: CGFloat = Tokens.Size.bubbleEnglish

    var body: some View {
        Text(text)
            .font(.system(size: size, weight: .light))
            .italic()
            .foregroundStyle(speaker == .you ? Tokens.Colors.youInk : Tokens.Colors.muted)
    }
}

/// Between two answers on the learner's side: they choose one (Josh,
/// 2026-11-05: two bubbles alone weren't clear)
struct OrMark: View {
    var body: some View {
        Text("or")
            .font(.footnote.weight(.semibold))
            .foregroundStyle(Tokens.Colors.youInk)
            .padding(.horizontal, 10)
            .padding(.vertical, 2)
            .background(Tokens.Colors.youBubble, in: Capsule())
            .frame(maxWidth: .infinity, alignment: .trailing)
            .padding(.trailing, 60)
            .accessibilityHidden(true)
    }
}
