import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// A lesson on the conversation screen (docs/learn.md → A lesson; lib/lesson.ts;
/// N6 item 4, pass 1): Magda teaches one step, three short practice dialogues
/// with characters whose role fits, then her review. Each part ends on a
/// button in place of the mic, which opens the next part. Leaving partway
/// (back, swipe) saves what was said, and the lesson starts over next time
/// (Josh, 2026-11-02).
@MainActor
@Observable
final class LessonFlow {
    enum Stage: Equatable { case loading, part(Int), failed(String), done }
    private(set) var stage: Stage = .loading
    /// The conversation on screen
    private(set) var current: ConversationModel?

    let step: LessonStep
    private let app: AppModel
    private var plan: APIClient.LessonPlan?
    /// The practice dialogues' conversations, for her review
    private var practiceIds: [String] = []
    private var index = 0

    init(step: LessonStep, app: AppModel) {
        self.step = step
        self.app = app
    }

    func start() async {
        guard stage == .loading, plan == nil, let api = app.api else { return }
        do {
            plan = try await api.lessonStart(stepId: step.id)
            open(0)
        } catch {
            stage = .failed((error as? APIError)?.message ?? "Couldn't start the lesson. Try again.")
        }
    }

    /// The parts in order: 0 Magda teaches, 1…n practice, n+1 her review
    private func open(_ k: Int) {
        guard let plan, let content = app.content, let words = content.language.ui.lesson else { return }
        index = k
        let practice = plan.practice.count
        let scene: APIClient.LessonPlan.Scene
        let turn: APIClient.LessonTurn
        let button: Onboarding.Line
        if k == 0 {
            scene = plan.magda
            turn = .init(stepId: step.id, part: "teach")
            button = .init(line: words.go, en: words.goLabel)
        } else if k <= practice {
            scene = plan.practice[k - 1]
            turn = .init(stepId: step.id, part: "practice", scene: k - 1)
            button = k < practice ? .init(line: words.next, en: words.nextLabel) : .init(line: words.back, en: words.backLabel)
        } else {
            scene = plan.magda
            turn = .init(stepId: step.id, part: "review", practiceIds: practiceIds)
            button = .init(line: words.done, en: words.doneLabel)
        }
        guard let character = content.character(scene.characterId) else { stage = .failed("Someone in this lesson is missing."); return }
        current = app.lessonConversation(city: scene.city, place: scene.place, character: character, lesson: turn, button: button) { [weak self] model in
            self?.next(after: model)
        }
        stage = .part(k)
    }

    /// The end button: keep a practice dialogue for the review, save, open the next part
    private func next(after model: ConversationModel) {
        if model.lesson?.part == "practice", let id = model.conversationId { practiceIds.append(id) }
        model.leave()
        guard let plan else { return }
        if index > plan.practice.count {
            current = nil
            stage = .done
        } else {
            open(index + 1)
        }
    }
}

/// The lesson's screens: the conversation screen for each part, one after another
struct LessonFlowView: View {
    @State private var flow: LessonFlow
    @Environment(\.dismiss) private var dismiss

    init(step: LessonStep, app: AppModel) {
        _flow = State(initialValue: LessonFlow(step: step, app: app))
    }

    var body: some View {
        Group {
            switch flow.stage {
            case .loading:
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            case .part(let k):
                if let model = flow.current {
                    // A new screen for each part: the old one's leave() saves it
                    PersonView(model: model).id(k)
                }
            case .failed(let message):
                ContentUnavailableView {
                    Label("Lesson", systemImage: "exclamationmark.bubble")
                } description: {
                    Text(message)
                }
            case .done:
                Color.clear
            }
        }
        .background(Tokens.Colors.paper)
        .task { await flow.start() }
        .onChange(of: flow.stage) { _, stage in
            if stage == .done { dismiss() }
        }
    }
}
