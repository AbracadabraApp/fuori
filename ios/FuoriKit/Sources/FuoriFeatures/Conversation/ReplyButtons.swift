import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Beginner levels 1–3 (docs/beginner-scaffolding.md, test only): the learner's
/// turn is a tap on one of two whole-line replies, which take the mic pill's
/// place. Level 1 shows each reply's English under it. The tapped reply stays
/// marked until the character answers; there's no right or wrong.
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
        VStack(spacing: 8) {
            if let replies = model.replies {
                ForEach(replies, id: \.self) { reply in button(reply) }
            } else {
                // Still being written (usually done before the character finishes)
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .background(Tokens.Colors.card.opacity(0.96), in: RoundedRectangle(cornerRadius: 14))
                    .accessibilityLabel("Getting your replies")
            }
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
                if showEnglish {
                    Text(reply.en)
                        .font(.system(size: englishSize))
                        .foregroundStyle(chosen ? Tokens.Colors.card : Tokens.Colors.muted)
                }
            }
            .multilineTextAlignment(.leading)
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            .background(chosen ? Tokens.Colors.green : Tokens.Colors.card.opacity(0.96), in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(Tokens.Colors.green.opacity(chosen ? 0 : 0.35), lineWidth: 2))
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
            // Once one is tapped, the other steps back
            .opacity(model.chosen != nil && !chosen ? 0.5 : 1)
        }
        .buttonStyle(PressableStyle())
        .disabled(model.phase != .choosing)
        .accessibilityLabel(spoken(reply, english: showEnglish))
        .accessibilityAddTraits(chosen ? .isSelected : [])
        .accessibilityHint(chosen ? "" : "Says this to \(model.character.name)")
    }

    /// The reply read by VoiceOver in the language being learned, then its English
    private func spoken(_ reply: APIClient.ReplyOption, english: Bool) -> Text {
        var line = AttributedString(reply.line)
        line.languageIdentifier = model.speechLanguage
        return english ? Text("\(Text(line)). \(reply.en)") : Text(line)
    }
}
