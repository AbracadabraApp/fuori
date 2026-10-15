import SwiftUI
import FuoriDesign

/// The bottom of the person screen: Pause (always there), the turn pill and a
/// word for the state, so the state never depends on colour alone
/// (docs/13-ios-conventions.md R4). The pill shows who's talking; during the
/// learner's turn a ring fills with the silence that ends it, and a tap ends
/// the turn at once.
struct ConversationControls: View {
    let model: ConversationModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                pauseButton
                Spacer()
                pill
                Spacer()
                // Balances the pause button so the pill stays centred
                Color.clear.frame(width: 44, height: 44)
            }
            Label(status.text, systemImage: status.symbol)
                .typeface(.label, 15, relativeTo: .footnote, weight: .medium)
                .foregroundStyle(Tokens.Colors.text)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Tokens.Colors.card.opacity(0.9), in: Capsule())
                .accessibilityHidden(true) // the pill carries the same words for VoiceOver
        }
        .padding(.bottom, 8)
        .sensoryFeedback(trigger: model.phase) { _, new in
            switch new {
            case .listening, .tapToTalk: .impact(weight: .light)
            case .paused: .impact(weight: .medium)
            case .failed, .micDenied: .error
            default: nil
            }
        }
    }

    // MARK: Pause

    private var pauseButton: some View {
        Group {
            if model.phase == .paused || model.phase.isFailed {
                Button { Task { await model.resume() } } label: {
                    Image(systemName: "play.fill")
                }
                .accessibilityLabel("Resume")
            } else {
                Button { model.pause() } label: {
                    Image(systemName: "pause.fill")
                }
                .accessibilityLabel("Pause")
                .disabled(model.phase == .starting || model.phase == .micDenied)
            }
        }
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
                if model.phase == .hearing {
                    Capsule()
                        .trim(from: 0, to: model.ring)
                        .stroke(Tokens.Colors.green, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .padding(1.5)
                }
                pillContent
            }
            .frame(width: 112, height: 52)
            .shadow(color: .black.opacity(0.18), radius: 4, y: 2)
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
                .foregroundStyle(Tokens.Colors.card)
                .symbolEffect(.variableColor.iterative, isActive: !reduceMotion)
        case .listening, .hearing:
            LevelDots(level: model.level, colour: Tokens.Colors.green)
        case .thinking:
            LevelDots(level: reduceMotion ? 0.3 : nil, colour: Tokens.Colors.terracotta)
        case .tapToTalk:
            Image(systemName: "mic.fill").font(.title2).foregroundStyle(Tokens.Colors.card)
        case .paused:
            Image(systemName: "pause.fill").font(.title3).foregroundStyle(Tokens.Colors.muted)
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

    private var pillFill: Color {
        switch model.phase {
        case .speaking, .tapToTalk: Tokens.Colors.green
        default: Tokens.Colors.card
        }
    }

    private var ringColour: Color {
        model.phase == .thinking ? Tokens.Colors.terracotta : Tokens.Colors.green
    }

    // MARK: Words for each state (English: app chrome, docs/13 D5)

    private var status: (text: String, symbol: String) {
        switch model.phase {
        case .starting: ("Arriving…", "figure.walk")
        case .speaking: (model.character.name, "waveform")
        case .listening, .hearing: ("Your turn", "mic.fill")
        case .thinking: ("\(model.character.name) is thinking", "ellipsis")
        case .tapToTalk: ("Tap to speak", "hand.tap.fill")
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
