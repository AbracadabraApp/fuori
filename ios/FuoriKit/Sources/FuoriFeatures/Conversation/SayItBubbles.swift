import SwiftUI
import FuoriDesign

/// Say it in English (docs/beginner-scaffolding.md, canvas row G2; Josh,
/// 2026-10-23): what the learner said in English in a grey bubble, then the
/// line in the language to read out loud, on the learner's side (right).
/// The two labels are styled alike so the pair reads English → language:
/// "Come si dice: I'd like…" then "Say this: Vorrei…". The language line has
/// no English repeated in it (Josh: "It doesn't repeat in the bubble to
/// read"). A speaker plays the line (hear it); nothing sits above the mic.
struct SayItBubbles: View {
    let model: ConversationModel
    let sayIt: ConversationModel.SayIt
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = 18
    @Environment(\.legibilityWeight) private var legibilityWeight

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            // What they said, in English
            labelled(model.howToSay, Text(sayIt.english))
                .foregroundStyle(Tokens.Colors.muted)
                .padding(.vertical, 10)
                .padding(.horizontal, 14)
                .background(Tokens.Colors.sand.opacity(0.6), in: Self.bubble)
                .accessibilityElement(children: .combine)
            // The line to read, with hear it
            HStack(alignment: .center, spacing: 10) {
                labelled("Say this:", Text(spoken).font(.custom(Tokens.FontFamily.label, size: lineSize).weight(legibilityWeight == .bold ? .bold : .semibold)).foregroundStyle(Tokens.Colors.text))
                Button { Task { await model.hearLine() } } label: {
                    Image(systemName: model.hearingLine ? "speaker.wave.2.fill" : "speaker.wave.2")
                        .font(.body)
                        .foregroundStyle(Tokens.Colors.green)
                        .frame(width: 44, height: 44)
                        .contentShape(.rect)
                }
                .buttonStyle(PressableStyle())
                .disabled(model.hearingLine)
                .accessibilityLabel("Hear it")
            }
            .padding(.leading, 14)
            .padding(.trailing, 4)
            .padding(.vertical, 4)
            .background(Tokens.Colors.card, in: Self.bubble)
            .shadow(color: .black.opacity(Tokens.Shadow.card.opacity), radius: Tokens.Shadow.card.radius, y: Tokens.Shadow.card.y)
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.leading, 40)
    }

    /// The learner's side: the corner by the speaker is the sharp one
    private static let bubble = UnevenRoundedRectangle(
        topLeadingRadius: 20, bottomLeadingRadius: 20, bottomTrailingRadius: 20, topTrailingRadius: 6)

    /// A small muted label inline before the words, the same for both bubbles
    private func labelled(_ label: String?, _ words: Text) -> some View {
        let lead = label.map { Text("\($0) ").font(.footnote).foregroundStyle(Tokens.Colors.muted) } ?? Text("")
        return Text("\(lead)\(words)").multilineTextAlignment(.leading)
    }

    /// The line read by VoiceOver in the language being learned
    private var spoken: AttributedString {
        var line = AttributedString(sayIt.line)
        line.languageIdentifier = model.speechLanguage
        return line
    }
}
