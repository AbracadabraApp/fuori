import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// The level up (docs/glossary.md; docs/bugs.md B42, the mockups Josh worked
/// through on 2026-11-16): after N conversations at the learner's step, the
/// game asks whether to move on. The welcome's character asks, the way the
/// learner is used to being asked: the conversation screen's paper band
/// ("Checking in!"), their portrait, their question in the game's own speech
/// bubble, a bar of the steps with now and next marked, and two buttons side
/// by side in the bar's colours, Stay on the left and Next on the right. The
/// page's colour comes from the words' theme, so nothing here assumes a
/// country. (Before it: two example lines with play buttons under bunting,
/// which Josh found didn't explain its purpose.)
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
    @ScaledMetric(relativeTo: .body) private var buttonSize: CGFloat = 20
    @ScaledMetric(relativeTo: .body) private var buttonHeight: CGFloat = 56
    @ScaledMetric(relativeTo: .subheadline) private var segment: CGFloat = 22

    var body: some View {
        VStack(spacing: 0) {
            band
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // The conversation screen's framing of the portrait, in a
                    // shorter window so the question and buttons fit under it
                    Portrait(url: portrait, name: askerName)
                        .aspectRatio(390 / 380, contentMode: .fit)
                    VStack(alignment: .leading, spacing: 24) {
                        SpeechBubble(speaker: .her) {
                            Text(asked)
                                .font(.system(size: lineSize))
                                .foregroundStyle(Tokens.Colors.ink)
                        }
                        bar
                        choices
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 20)
                    .padding(.bottom, 28)
                }
            }
        }
        .background(page.ignoresSafeArea())
    }

    // MARK: - Colours: the country's page, and what sits on it

    private var awning: Bool { words.theme == "awning" }
    private var page: Color { awning ? Tokens.Colors.terracottaInk : Tokens.Colors.levelUpTeal }
    /// A step not reached and not next
    private var rest: Color { awning ? Tokens.Colors.levelUpTerracottaRest : Tokens.Colors.levelUpTealRest }
    private var onPage: Color { Tokens.Colors.card }

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

    /// What they say: the reason, then the question in bold
    private var asked: AttributedString {
        var text = AttributedString(words.line.map { $0 + " " } ?? "")
        var question = AttributedString(words.question ?? words.headline)
        question.swiftUI.font = .system(size: lineSize, weight: .bold)
        text.append(question)
        return text
    }

    private var total: Int { max(offer.bar?.total ?? 0, offer.nextStep, 2) }
    private var now: Int { offer.bar?.now ?? offer.step }
    private var next: Int { offer.bar?.next ?? offer.nextStep }

    /// The steps as a bar: reached ones in Stay's grey, the next in Next's
    /// yellow with a ring, the rest quiet; "Now" and "Next" under their steps
    private var bar: some View {
        VStack(spacing: 6) {
            HStack {
                Text(words.barFrom ?? "")
                Spacer(minLength: 8)
                Text(words.barTo ?? "")
            }
            .typeface(.label, 15, relativeTo: .subheadline, weight: .bold)
            .foregroundStyle(onPage)
            HStack(alignment: .top, spacing: 6) {
                ForEach(1...total, id: \.self) { step in
                    VStack(spacing: 6) {
                        Capsule()
                            .fill(step <= now ? Tokens.Colors.levelUpStay : (step == next ? Tokens.Colors.lemon : rest))
                            .overlay(Capsule().strokeBorder(step == next ? onPage : Color.clear, lineWidth: 3))
                            .frame(height: segment)
                        Text(step == now ? (words.barNow ?? words.now) : (step == next ? (words.barNext ?? words.next) : " "))
                            .typeface(.label, 15, relativeTo: .subheadline, weight: .heavy)
                            .foregroundStyle(onPage)
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(barReading)
    }

    private var barReading: String {
        (words.barLabel ?? "")
            .replacingOccurrences(of: "{now}", with: "\(now)")
            .replacingOccurrences(of: "{total}", with: "\(total)")
            .replacingOccurrences(of: "{next}", with: "\(next)")
    }

    /// Stay on the left, Next on the right, as the bar runs
    private var choices: some View {
        HStack(alignment: .top, spacing: 14) {
            choice(words.stay ?? words.notYet, icon: "pause.fill", iconLeads: true, fill: Tokens.Colors.levelUpStay, edge: Tokens.Colors.levelUpStayEdge) { answer(false) }
            choice(words.go ?? words.yesLabel, icon: "play.fill", iconLeads: false, fill: Tokens.Colors.lemon, edge: Tokens.Colors.levelUpGoEdge) { answer(true) }
        }
        .disabled(answering)
    }

    /// One raised button: its sign on the outer side, its word centred
    private func choice(_ title: String, icon: String, iconLeads: Bool, fill: Color, edge: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if iconLeads { Image(systemName: icon).accessibilityHidden(true) }
                Text(title)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .frame(maxWidth: .infinity)
                if !iconLeads { Image(systemName: icon).accessibilityHidden(true) }
            }
            .font(.system(size: buttonSize, weight: .bold))
            .foregroundStyle(Tokens.Colors.levelUpCardInk)
            .padding(.horizontal, 18)
            .frame(maxWidth: .infinity, minHeight: buttonHeight)
            .background(fill, in: Capsule())
            // The darker edge under it, so it reads as something to press
            .background(edge, in: Capsule().offset(y: 5))
            .padding(.bottom, 5)
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
