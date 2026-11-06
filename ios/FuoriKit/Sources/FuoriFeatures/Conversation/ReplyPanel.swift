import SwiftUI
import FuoriDesign
import FuoriNetworking

/// Scaffolding (docs/reply-panel.md, docs/glossary.md): two suggested answers
/// in the learner's bubbles on the right with "or" between, and the usual mic
/// centred under them, the same as Beginner dialogue's answers (docs/
/// dialogue-model.md → Who is talking; Josh, 2026-11-05: one UI, no
/// instruction words). The learner reads one out loud; the mic works as
/// everywhere and what was heard goes to the character. Under VoiceOver or
/// with the mic off, the answers become buttons that send the line.
struct ReplyPanel<Mic: View>: View {
    let model: ConversationModel
    @ViewBuilder let mic: () -> Mic

    var body: some View {
        // At the largest text sizes the answers scroll within a capped height
        // rather than push the portrait off; the mic stays in reach below
        VStack(spacing: 8) {
            ViewThatFits(in: .vertical) {
                answers.fixedSize(horizontal: false, vertical: true)
                ScrollView { answers }.scrollBounceBehavior(.basedOnSize)
            }
            .frame(maxHeight: 280)
            .fixedSize(horizontal: false, vertical: true)
            mic()
        }
    }

    private var answers: some View {
        VStack(spacing: 8) {
            if let replies = model.replies, replies.count == 2 {
                answer(replies[0])
                OrMark()
                answer(replies[1])
            }
        }
    }

    @ViewBuilder private func answer(_ reply: APIClient.ReplyOption) -> some View {
        let chosen = model.chosen == reply
        AnswerBubble(text: reply.line, english: reply.en, speechLanguage: model.speechLanguage,
                     onTap: model.answersAreButtons && (model.phase == .choosing || model.phase == .micDenied) ? { Task { await model.choose(reply) } } : nil)
            .opacity(model.chosen != nil && !chosen ? 0.5 : 1)
            .accessibilityAddTraits(chosen ? .isSelected : [])
    }
}
