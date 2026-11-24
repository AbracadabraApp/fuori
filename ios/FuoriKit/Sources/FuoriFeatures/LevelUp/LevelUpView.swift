import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The level up (docs/glossary.md; docs/bugs.md B42): after N conversations at
/// the learner's step, the game asks whether to move on. The welcome's
/// character asks, the way the learner is used to being asked: the
/// conversation screen's paper band ("Checking in!"), their portrait, their
/// question in the game's own speech bubble, and two plain buttons pinned to
/// the bottom: stay on the left, the next step on the right (their words come
/// from /v1/content).
/// Layout A of the mock-ups Josh picked on 2026-11-23
/// (https://claude.ai/artifact/A6HiWaZLucsAS5PrkZdPAv): the portrait takes the
/// space left; the buttons are always on screen, and at large text sizes the
/// portrait and question scroll above them; no step
/// bar (Josh: "id delete the timeline"). The page's colour comes from the
/// words' theme, so nothing here assumes a country.
struct LevelUpView: View {
    let offer: APIClient.LevelUp
    let words: LevelUpWords
    /// Who asks: the offer's asker, or the character just talked with when the server names none
    let askerName: String
    let portrait: URL?
    /// The learner's choice: true for the next step
    let onAnswer: (Bool) async -> Void

    @State private var answering = false
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = Tokens.Size.bubbleText
    @ScaledMetric(relativeTo: .body) private var buttonSize: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var buttonHeight: CGFloat = 52
    /// The least of the portrait that stays in view: fixed, not scaled, so large text doesn't make it grow
    private let portraitMin: CGFloat = 140

    var body: some View {
        VStack(spacing: 0) {
            band
            // The portrait takes what the question leaves, with nothing measured; when even its floor
            // doesn't fit (large text), the portrait and question scroll. The buttons stay pinned under
            // them either way
            ViewThatFits(in: .vertical) {
                VStack(spacing: 0) {
                    Portrait(url: portrait, name: askerName)
                        .frame(minHeight: portraitMin, maxHeight: .infinity)
                    question
                }
                ScrollView {
                    VStack(spacing: 0) {
                        Portrait(url: portrait, name: askerName)
                            .frame(height: portraitMin)
                        question
                    }
                }
            }
            choices
                .padding(.horizontal, Tokens.Space.gutter)
                .padding(.bottom, 18)
        }
        .background(page.ignoresSafeArea())
    }

    // MARK: - Colours: the country's page

    private var awning: Bool { words.theme == "awning" }
    private var page: Color { awning ? Tokens.Colors.terracottaInk : Tokens.Colors.levelUpTeal }

    // MARK: - Pieces

    /// The conversation screen's band (PersonView.band), with the page's words where the name goes
    private var band: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(words.band ?? words.headline)
                .typeface(.display, Tokens.Size.personName, relativeTo: .largeTitle, weight: .bold)
                .foregroundStyle(Tokens.Colors.ink)
                .accessibilityAddTraits(.isHeader)
            Text(askerName)
                .typeface(.label, Tokens.Size.personRole, relativeTo: .title3)
                .foregroundStyle(Tokens.Colors.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Tokens.Space.gutter)
        .padding(.top, 22)
        .padding(.bottom, Tokens.Space.band)
        .background(Tokens.Colors.paper.ignoresSafeArea(edges: .top))
        .overlay(alignment: .bottom) { Divider() }
    }

    /// The question in the character's bubble
    private var question: some View {
        SpeechBubble(speaker: .her) {
            Text(asked)
                .font(.system(size: lineSize))
                .foregroundStyle(Tokens.Colors.ink)
        }
        .padding(.horizontal, Tokens.Space.gutter)
        .padding(.vertical, 18)
    }

    /// What they say: the reason, then the question in bold
    private var asked: AttributedString {
        var text = AttributedString(words.line.map { $0 + " " } ?? "")
        var question = AttributedString(words.question ?? words.headline)
        question.swiftUI.font = .system(size: lineSize, weight: .bold)
        text.append(question)
        return text
    }

    /// Stay on the left, the next step on the right: plain words, no icons
    private var choices: some View {
        HStack(spacing: 12) {
            choice(words.stay ?? words.notYet, fill: Tokens.Colors.levelUpStay) { answer(false) }
            choice(words.go ?? words.yesLabel, fill: Tokens.Colors.lemon) { answer(true) }
                // Where the learner is and what's next, which the step bar used to say (the bar went:
                // Josh, "id delete the timeline"; VoiceOver kept its reading)
                .accessibilityValue(stepReading)
        }
        .disabled(answering)
        // B61: the answer takes a few seconds to send; the buttons dim so the tap shows
        .opacity(answering ? 0.5 : 1)
        .animation(.easeOut(duration: 0.15), value: answering)
    }

    private var stepReading: String {
        let total = max(offer.bar?.total ?? 0, offer.nextStep, 2)
        return (words.barLabel ?? "")
            .replacingOccurrences(of: "{now}", with: "\(offer.bar?.now ?? offer.step)")
            .replacingOccurrences(of: "{total}", with: "\(total)")
            .replacingOccurrences(of: "{next}", with: "\(offer.bar?.next ?? offer.nextStep)")
    }

    private func choice(_ title: String, fill: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: buttonSize, weight: .bold))
                .foregroundStyle(Tokens.Colors.levelUpCardInk)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
                .padding(.horizontal, 14)
                .frame(maxWidth: .infinity, minHeight: buttonHeight)
                .background(fill, in: Capsule())
        }
        .buttonStyle(PressableStyle())
    }

    // MARK: - Actions

    private func answer(_ yes: Bool) {
        guard !answering else { return }
        answering = true
        Task {
            await onAnswer(yes)
            answering = false
        }
    }
}
