import SwiftUI
import FuoriDesign

/// The bottom bar (docs/bottom-bar.md; Josh, 2026-10-22): one circle in two
/// colours, green for the learner (mic, then their wave) and terracotta for
/// the character (sending, then her wave), and the Learn link on the right.
/// No Pause or Resume: a call, Siri, AirPods out or backgrounding leave the
/// learner on their turn with the mic closed, and a failed step shows its
/// message above and leaves them there too.
/// The circle keeps its size and place; only its fill and glyph change, so
/// the state shows by shape as well as colour (docs/13-ios-conventions.md R4);
/// VoiceOver reads it as words. In hands-free a ring fills with the silence
/// that ends the turn.
struct ConversationControls: View {
    let model: ConversationModel
    /// Opens the Learn sheet; nil hides the Learn link
    var onLearn: (() -> Void)? = nil
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @ScaledMetric(relativeTo: .title2) private var circleSize: CGFloat = 68

    var body: some View {
        Group {
            // Scaffolding: the answers panel, with the same circle centred in it
            // (docs/reply-panel.md)
            if model.showsAnswers {
                ReplyPanel(model: model) { circle }
            } else {
                controls
            }
        }
        .padding(.bottom, 8)
        .sensoryFeedback(trigger: model.phase) { _, new in
            switch new {
            case .listening, .tapToTalk, .choosing: .impact(weight: .light)
            case .thinking: .impact(weight: .heavy) // the tap that sends the turn
            case .micDenied: .error
            default: nil
            }
        }
    }

    private var controls: some View {
        ZStack {
            circle
            HStack {
                Spacer()
                // Bottom right, centred on the circle's line, the same place in
                // every state; empty until there's something to learn
                if let onLearn, model.hasSomethingToLearn {
                    learnLink(onLearn).transition(.opacity)
                }
            }
            .padding(.horizontal, 6)
        }
    }

    // MARK: Learn

    /// The Learn link (docs/glossary.md): the book in a 48 pt glass circle; it
    /// opens the Learn sheet for the conversation so far
    private func learnLink(_ open: @escaping () -> Void) -> some View {
        Button(action: open) {
            Image(systemName: "character.book.closed")
        }
        .accessibilityLabel("Learn")
        .accessibilityHint("Goes over this conversation so far")
        .font(.title3)
        .frame(width: 48, height: 48)
        .buttonStyle(.glass)
        .buttonBorderShape(.circle)
    }

    // MARK: Circle

    /// Green is the learner, terracotta the character
    private var isTheirs: Bool { [.starting, .speaking, .thinking].contains(model.phase) }

    private var circle: some View {
        Button { Task { await model.tapTurn() } } label: {
            ZStack {
                Circle().fill(isTheirs ? Tokens.Colors.terracotta : Tokens.Colors.green)
                if model.phase == .hearing && !model.tapMode {
                    Circle()
                        .trim(from: 0, to: model.ring)
                        .rotation(.degrees(-90))
                        .stroke(Tokens.Colors.card, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .padding(3)
                }
                glyph
            }
            .frame(width: circleSize, height: circleSize)
            .shadow(color: .black.opacity(0.18), radius: 5, y: 2)
        }
        .buttonStyle(PressableStyle())
        .disabled(!canTap)
        .accessibilityLabel(label)
        .accessibilityHint(hint)
    }

    @ViewBuilder private var glyph: some View {
        switch model.phase {
        case .tapToTalk, .choosing:
            Image(systemName: "mic.fill").font(.title).foregroundStyle(Tokens.Colors.card)
        case .micDenied:
            Image(systemName: "mic.slash.fill").font(.title).foregroundStyle(Tokens.Colors.card)
        case .listening, .hearing:
            // The learner's wave, moving with their voice
            Wave(level: { model.level }, still: reduceMotion)
        case .thinking:
            SendingDots(still: reduceMotion)
        case .speaking:
            // Her wave, moving with her voice (the phone's voice can't be
            // measured, so then it moves by itself)
            Wave(level: { model.voiceLevel }, still: reduceMotion)
        case .starting:
            ProgressView().tint(Tokens.Colors.card)
        }
    }

    private var canTap: Bool {
        [.speaking, .listening, .hearing, .tapToTalk, .micDenied].contains(model.phase)
    }

    // MARK: Words for VoiceOver (English: app chrome, docs/13 D5)

    private var label: String {
        switch model.phase {
        case .starting: "Arriving"
        case .speaking: "\(model.character.name) is speaking"
        case .listening, .hearing: model.tapMode ? "Tap to send" : "Listening"
        case .thinking: "Sending"
        case .tapToTalk: "Tap to talk"
        case .choosing: "Choose an answer"
        case .micDenied: "Microphone off in Settings"
        }
    }

    private var hint: String {
        switch model.phase {
        case .speaking: "Stops \(model.character.name) and starts your turn"
        case .tapToTalk, .micDenied: "Starts your turn"
        case .listening, .hearing: "Ends your turn"
        default: ""
        }
    }
}

/// Five bars moving with a voice's level, read every frame; with no level
/// (the phone's own voice) they move by themselves. Still under Reduce Motion.
private struct Wave: View {
    let level: () -> Double?
    let still: Bool

    var body: some View {
        TimelineView(.animation(paused: still)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            let measured = still ? 0.4 : level()
            HStack(spacing: 4) {
                ForEach(0..<5, id: \.self) { i in
                    let shape = [0.55, 0.8, 1, 0.8, 0.55][i]
                    let scale = measured.map { 0.25 + 0.75 * $0 * shape }
                        ?? (0.35 + 0.5 * abs(sin(t * 4 + Double(i) * 0.7)) * shape)
                    Capsule()
                        .fill(Tokens.Colors.card)
                        .frame(width: 4, height: 30 * scale)
                }
            }
            .frame(height: 32)
        }
    }
}

/// Three dots pulsing in turn while the line is sent; still under Reduce Motion
private struct SendingDots: View {
    let still: Bool

    var body: some View {
        TimelineView(.animation(paused: still)) { context in
            let t = context.date.timeIntervalSinceReferenceDate
            HStack(spacing: 6) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Tokens.Colors.card)
                        .frame(width: 8, height: 8)
                        .opacity(still ? 1 : 0.35 + 0.65 * max(0, sin(t * 5 - Double(i) * 0.9)))
                }
            }
        }
    }
}
