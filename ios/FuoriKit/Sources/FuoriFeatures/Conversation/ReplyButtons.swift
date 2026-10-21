import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Beginner levels 1–3 (docs/beginner-scaffolding.md, test only): the learner's
/// turn is a tap on one of two whole-line replies, which take the mic pill's
/// place. Level 1 shows each reply's English under it. The tapped reply stays
/// marked until the character answers; there's no right or wrong.
///
/// The replies are controls, so they're Liquid Glass, not the card material
/// her line uses (Josh, 2026-10-21: the white cards read as more dialogue).
/// Clear glass at rest, solid ink once chosen; no border, no shadow. They sit
/// on the right and hug their text, the learner's side of the exchange. The
/// Italian gets a hairline underline, lighter than the teaching underline.
/// Mockups: "Reply buttons" canvas, C1 and D3.
struct ReplyButtons: View {
    let model: ConversationModel
    @ScaledMetric(relativeTo: .callout) private var englishSize: CGFloat = 15

    var body: some View {
        // At the largest text sizes the two replies scroll within a capped
        // height rather than push the portrait off (docs → Settled, AX5)
        ViewThatFits(in: .vertical) {
            buttons.fixedSize(horizontal: false, vertical: true)
            ScrollView { buttons }.scrollBounceBehavior(.basedOnSize)
        }
        .frame(maxHeight: 300)
        .fixedSize(horizontal: false, vertical: true)
    }

    private var buttons: some View {
        GlassEffectContainer(spacing: 8) {
            VStack(alignment: .trailing, spacing: 8) {
                if let replies = model.replies {
                    ForEach(replies, id: \.self) { reply in
                        HStack(spacing: 0) {
                            Spacer(minLength: 40)
                            button(reply)
                        }
                    }
                } else {
                    // Still being written (usually done before the character finishes)
                    ProgressView()
                        .frame(minWidth: 88, minHeight: 52)
                        .glassEffect(.regular.tint(Tokens.Colors.card.opacity(0.5)), in: .rect(cornerRadius: Self.radius))
                        .accessibilityLabel("Getting your replies")
                }
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }

    private func button(_ reply: APIClient.ReplyOption) -> some View {
        let chosen = model.chosen == reply
        let showEnglish = model.scaffoldLevel == 1
        return Button { Task { await model.choose(reply) } } label: {
            VStack(alignment: .leading, spacing: 4) {
                Text(reply.line)
                    .typeface(.label, 18, relativeTo: .body, weight: .semibold) // scales with the text size itself
                    .foregroundStyle(chosen ? Tokens.Colors.card : Tokens.Colors.text)
                    .underline(true, color: (chosen ? Tokens.Colors.card : Tokens.Colors.text).opacity(0.45))
                if showEnglish {
                    Text(reply.en)
                        .font(.system(size: englishSize))
                        .foregroundStyle(chosen ? Tokens.Colors.card : Tokens.Colors.muted)
                }
            }
            .multilineTextAlignment(.leading)
            .frame(minHeight: 44, alignment: .leading)
            .padding(.vertical, 12)
            .padding(.horizontal, 20)
            .modifier(ReplyMaterial(chosen: chosen))
            // Once one is tapped, the other steps back
            .opacity(model.chosen != nil && !chosen ? 0.5 : 1)
        }
        .buttonStyle(PressableStyle())
        .disabled(model.phase != .choosing)
        .accessibilityLabel(spoken(reply, english: showEnglish))
        .accessibilityAddTraits(chosen ? .isSelected : [])
        .accessibilityHint(chosen ? "" : "Says this to \(model.character.name)")
    }

    static let radius: CGFloat = 22

    /// The reply read by VoiceOver in the language being learned, then its English
    private func spoken(_ reply: APIClient.ReplyOption, english: Bool) -> Text {
        var line = AttributedString(reply.line)
        line.languageIdentifier = model.speechLanguage
        return english ? Text("\(Text(line)). \(reply.en)") : Text(line)
    }
}

/// Clear glass at rest (lightly whitened so text stays readable over a dark
/// patch of portrait), solid ink once chosen. Green is kept for Tap to talk.
private struct ReplyMaterial: ViewModifier {
    let chosen: Bool

    func body(content: Content) -> some View {
        if chosen {
            content.background(Tokens.Colors.text, in: .rect(cornerRadius: ReplyButtons.radius))
        } else {
            content.glassEffect(.regular.tint(Tokens.Colors.card.opacity(0.5)).interactive(), in: .rect(cornerRadius: ReplyButtons.radius))
        }
    }
}
