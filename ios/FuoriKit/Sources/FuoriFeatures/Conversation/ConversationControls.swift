import SwiftUI
import FuoriDesign

/// The bottom of the person screen: the turn pill, and Pause (always there) on the right.
/// The pill shows the state by its shape (waveform, dots, pause, warning), not
/// colour alone (docs/13-ios-conventions.md R4); VoiceOver reads it as words.
/// No label under it (Josh, 2026-10-15: a pill on a pill). During the
/// learner's turn a ring fills with the silence that ends it, and a tap ends
/// the turn at once. Errors and "mic off" show in the note above.
struct ConversationControls: View {
    let model: ConversationModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var typing = false
    @State private var typed = ""

    var body: some View {
        VStack(spacing: 8) {
            if showsReplies { ReplyButtons(model: model) }
            HStack {
                // Type a reply (accessibility only, D6); otherwise empty, balancing
                // the pause button so the pill stays centred
                if model.canType { typeButton } else { Color.clear.frame(width: 44, height: 44) }
                Spacer()
                // On levels 1–3 the two replies take the pill's place
                if showsReplies { Color.clear.frame(width: 112, height: 52) } else { pill }
                Spacer()
                pauseButton // on the right (Josh, 2026-10-15)
            }
        }
        .padding(.bottom, 8)
        .sensoryFeedback(trigger: model.phase) { _, new in
            switch new {
            case .listening, .tapToTalk, .choosing: .impact(weight: .light)
            case .thinking: .impact(weight: .heavy) // the tap that sends the turn
            case .paused: .impact(weight: .medium)
            case .failed, .micDenied: .error
            default: nil
            }
        }
    }

    /// The reply buttons, from the moment the turn opens until the character
    /// answers the one tapped
    private var showsReplies: Bool {
        guard model.scaffoldLevel != nil else { return false }
        return model.phase == .choosing || (model.phase == .thinking && model.chosen != nil)
    }

    // MARK: Type

    /// Only when the mic is off or VoiceOver / Switch Control is on (D6)
    private var typeButton: some View {
        Button { typed = ""; typing = true } label: {
            Image(systemName: "keyboard")
        }
        .accessibilityLabel("Type your reply")
        .font(.title3)
        .frame(width: 44, height: 44)
        .buttonStyle(.glass)
        .buttonBorderShape(.circle)
        .alert("Your reply", isPresented: $typing) {
            TextField("Type what you'd say", text: $typed)
            Button("Send") { Task { await model.send(typed: typed) } }
            Button("Cancel", role: .cancel) {}
        }
    }

    // MARK: Pause

    /// One button that toggles: pause while running, play while paused
    /// (Josh, 2026-10-15). The paused state shows only here, not on the pill.
    private var pauseButton: some View {
        let isPaused = model.phase == .paused || model.phase.isFailed || model.phase == .micDenied
        return Button {
            if isPaused { Task { await model.resume() } } else { model.pause() }
        } label: {
            Image(systemName: isPaused ? "play.fill" : "pause.fill")
                .contentTransition(.symbolEffect(.replace))
        }
        .accessibilityLabel(isPaused ? "Resume" : "Pause")
        .font(.title3)
        .frame(width: 44, height: 44)
        .buttonStyle(.glass)
        .buttonBorderShape(.circle)
    }

    // MARK: Pill

    private var pill: some View {
        Button { Task { await model.tapTurn() } } label: {
            ZStack {
                Capsule().fill(pillFill)
                Capsule().strokeBorder(ringColour.opacity(0.35), lineWidth: 2)
                if model.phase == .hearing && !model.tapMode {
                    Capsule()
                        .trim(from: 0, to: model.ring)
                        .stroke(Tokens.Colors.card, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .padding(1.5)
                }
                pillContent
            }
            .frame(width: 112, height: 52)
            .shadow(color: .black.opacity(0.18), radius: 4, y: 2)
            .opacity(model.phase == .paused ? 0.5 : 1)
        }
        .buttonStyle(PressableStyle())
        .disabled(!canTapTurn)
        .accessibilityLabel(status.text)
        .accessibilityHint(hint)
    }

    @ViewBuilder private var pillContent: some View {
        switch model.phase {
        case .speaking:
            Image(systemName: "waveform")
                .font(.title2)
                .foregroundStyle(Tokens.Colors.text)
                .symbolEffect(.variableColor.iterative, isActive: !reduceMotion)
        case .listening, .hearing:
            HStack(spacing: 10) {
                LevelDots(level: model.level, colour: Tokens.Colors.card)
                if model.tapMode {
                    // Tap mode: the learner ends the turn, so show how
                    Image(systemName: "stop.fill").font(.footnote).foregroundStyle(Tokens.Colors.card)
                }
            }
        case .thinking:
            // Sent: solid terracotta with white dots, unmistakably not listening
            // any more (Josh, 2026-10-15: the submit tap should clearly change state)
            LevelDots(level: reduceMotion ? 0.3 : nil, colour: Tokens.Colors.card)
        case .tapToTalk:
            Image(systemName: "mic.fill").font(.title2).foregroundStyle(Tokens.Colors.text)
        case .paused, .choosing:
            EmptyView() // paused: shown by the pause button alone; choosing: the replies replace the pill
        case .starting:
            ProgressView()
        case .micDenied, .failed:
            Image(systemName: "exclamationmark.triangle.fill").font(.title3).foregroundStyle(Tokens.Colors.errorInk)
        }
    }

    private var canTapTurn: Bool {
        [.speaking, .listening, .hearing, .tapToTalk].contains(model.phase)
    }

    private var hint: String {
        switch model.phase {
        case .speaking: "Stops \(model.character.name) and starts your turn"
        case .tapToTalk: "Starts your turn"
        case .listening, .hearing: "Ends your turn"
        default: ""
        }
    }

    /// One colour per state, so the tap plainly registers (Josh, 2026-10-18):
    /// green while you talk, terracotta once it's sent, cream otherwise
    private var pillFill: Color {
        switch model.phase {
        case .listening, .hearing: Tokens.Colors.green
        case .thinking: Tokens.Colors.terracotta
        default: Tokens.Colors.card
        }
    }

    private var ringColour: Color {
        switch model.phase {
        case .thinking: Tokens.Colors.terracotta
        case .listening, .hearing: Tokens.Colors.card
        default: Tokens.Colors.green
        }
    }

    // MARK: Words for each state, for VoiceOver (English: app chrome, docs/13 D5)

    private var status: (text: String, symbol: String) {
        switch model.phase {
        case .starting: ("Arriving…", "figure.walk")
        case .speaking: (model.character.name, "waveform")
        case .listening, .hearing: (model.tapMode ? "Listening. Tap when you've finished" : "Your turn", "mic.fill")
        case .thinking: ("\(model.character.name) is thinking", "ellipsis")
        case .tapToTalk: ("Tap to speak", "hand.tap.fill")
        case .choosing: ("Choose your reply", "hand.tap.fill")
        case .paused: ("Paused", "pause.fill")
        case .micDenied: ("Microphone off in Settings", "mic.slash.fill")
        case .failed(let message): (message, "exclamationmark.triangle.fill")
        }
    }
}

/// Five dots: driven by the mic level while listening, gently pulsing while
/// thinking (still under Reduce Motion)
private struct LevelDots: View {
    /// 0...1, or nil to pulse on its own
    let level: Double?
    let colour: Color

    var body: some View {
        TimelineView(.animation(paused: level != nil)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            HStack(spacing: 6) {
                ForEach(0..<5, id: \.self) { i in
                    let scale = level.map { 0.35 + 0.65 * $0 * [0.6, 0.85, 1, 0.85, 0.6][i] }
                        ?? (0.5 + 0.5 * abs(sin(t * 3 + Double(i) * 0.4)))
                    Capsule()
                        .fill(colour)
                        .frame(width: 6, height: 26 * scale)
                }
            }
            .frame(height: 30)
        }
    }
}
