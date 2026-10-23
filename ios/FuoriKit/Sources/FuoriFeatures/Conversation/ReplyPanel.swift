import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Scaffolding (docs/reply-panel.md, docs/glossary.md): two suggested answers
/// as text in one panel at the bottom, an instruction, and the usual mic
/// centred under it. The learner reads one out loud; the mic works as
/// everywhere and what was heard goes to the character (Josh, 2026-10-22:
/// tap-only went; answers as text, not buttons). Under VoiceOver or with the
/// mic off, the answers become buttons that send the line.
///
/// Hierarchy is the point (Josh: "things are too equal"): her line, then the
/// answers (largest here, underlined), then the how-to (small, muted, by the
/// mic). No Pause or Learn link in this state. Kept compact (Josh,
/// 2026-10-22: "the mic sheet takes up a lot of room"): body-size answers,
/// tight spacing, the how-to beside nothing but the mic.
struct ReplyPanel<Mic: View>: View {
    let model: ConversationModel
    @ViewBuilder let mic: () -> Mic
    @ScaledMetric(relativeTo: .body) private var glyph: CGFloat = 14

    var body: some View {
        // At the largest text sizes the panel scrolls within a capped height
        // rather than push the portrait off; the mic stays in reach below
        VStack(spacing: 8) {
            ViewThatFits(in: .vertical) {
                answers.fixedSize(horizontal: false, vertical: true)
                ScrollView { answers }.scrollBounceBehavior(.basedOnSize)
            }
            .frame(maxHeight: 280)
            .fixedSize(horizontal: false, vertical: true)
            if let instruction = model.instruction {
                Text(instruction)
                    .font(.footnote)
                    .foregroundStyle(Tokens.Colors.muted)
                    .multilineTextAlignment(.center)
                    .padding(.top, 4)
            }
            mic()
        }
        .padding(.horizontal, 16)
        .padding(.top, 14)
        .padding(.bottom, 10)
        .background(Tokens.Colors.card, in: .rect(cornerRadius: 22))
        .shadow(color: .black.opacity(0.12), radius: 10, y: 3)
    }

    private var answers: some View {
        VStack(alignment: .leading, spacing: 6) {
            if model.firstTime {
                Text("To get you started, here are two answers.")
                    .font(.footnote)
                    .foregroundStyle(Tokens.Colors.muted)
            }
            if let replies = model.replies, replies.count == 2 {
                answer(replies[0])
                or
                answer(replies[1])
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    /// A plain "or" looks like an accident (Josh): small spaced capitals
    /// with a hairline out to each side
    private var or: some View {
        HStack(spacing: 12) {
            Rectangle().fill(Tokens.Colors.muted.opacity(0.25)).frame(height: 1)
            Text("OR")
                .font(.caption2.weight(.bold))
                .tracking(1)
                .foregroundStyle(Tokens.Colors.muted)
            Rectangle().fill(Tokens.Colors.muted.opacity(0.25)).frame(height: 1)
        }
        .accessibilityHidden(true)
    }

    @ViewBuilder private func answer(_ reply: APIClient.ReplyOption) -> some View {
        if model.answersAreButtons {
            Button { Task { await model.choose(reply) } } label: { answerText(reply, chosen: model.chosen == reply) }
                .buttonStyle(PressableStyle())
                .disabled(model.phase != .choosing && model.phase != .micDenied)
                .accessibilityLabel(spoken(reply))
                .accessibilityAddTraits(model.chosen == reply ? .isSelected : [])
                .accessibilityHint(model.chosen == reply ? "" : "Says this to \(model.character.name)")
        } else {
            answerText(reply, chosen: false)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(spoken(reply))
        }
    }

    private func answerText(_ reply: APIClient.ReplyOption, chosen: Bool) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Image(systemName: chosen ? "bubble.left.fill" : "bubble.left")
                .font(.system(size: glyph))
                .foregroundStyle(Tokens.Colors.green)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(reply.line)
                    .typeface(.label, 17, relativeTo: .body, weight: .semibold)
                    .foregroundStyle(Tokens.Colors.text)
                    .underline(true, color: Tokens.Colors.text.opacity(0.42))
                Text(reply.en)
                    .font(.caption)
                    .foregroundStyle(Tokens.Colors.muted)
            }
            .multilineTextAlignment(.leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(minHeight: 44, alignment: .leading)
        .contentShape(.rect)
    }

    /// The answer read by VoiceOver in the language being learned, then its English
    private func spoken(_ reply: APIClient.ReplyOption) -> Text {
        var line = AttributedString(reply.line)
        line.languageIdentifier = model.speechLanguage
        return Text("\(Text(line)). \(reply.en)")
    }
}
