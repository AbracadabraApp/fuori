import SwiftUI
import FuoriDesign

/// How do I say it (docs/beginner-scaffolding.md, canvas row G2; Josh,
/// 2026-10-23): what the learner said in English, then the line in the
/// language to read out loud, both in the learner's bubble on the right
/// (SpeechBubble; docs/dialogue-model.md → Who is talking). The English is
/// led by how you ask it ("Come si dice: I'd like…"); the line has no label,
/// like every answer the learner can say (Josh, 2026-11-05: no instruction
/// words), and no English repeated in it (Josh: "It doesn't repeat in the
/// bubble to read"). A speaker plays the line (hear it).
struct SayItBubbles: View {
    let model: ConversationModel
    let sayIt: ConversationModel.SayIt
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = Tokens.Size.bubbleText

    var body: some View {
        VStack(spacing: 8) {
            // What they said, in English
            SpeechBubble(speaker: .you) {
                Text("\(Text(model.howToSay.map { "\($0) " } ?? "").font(.footnote))\(Text(sayIt.english))")
                    .foregroundStyle(Tokens.Colors.youInk)
            }
            .accessibilityElement(children: .combine)
            // The line to read, with hear it
            SpeechBubble(speaker: .you) {
                HStack(alignment: .center, spacing: 6) {
                    Text(spoken)
                        .font(.system(size: lineSize))
                        .foregroundStyle(Tokens.Colors.ink)
                    Button { Task { await model.hearLine() } } label: {
                        Image(systemName: model.hearingLine ? "speaker.wave.2.fill" : "speaker.wave.2")
                            .font(.body)
                            .foregroundStyle(Tokens.Colors.youInk)
                            .frame(width: 44, height: 44)
                            .contentShape(.rect)
                    }
                    .buttonStyle(PressableStyle())
                    .disabled(model.hearingLine)
                    .accessibilityLabel("Hear it")
                }
                .padding(.vertical, -10)
                .padding(.trailing, -10)
            }
        }
    }

    /// The line read by VoiceOver in the language being learned
    private var spoken: AttributedString {
        var line = AttributedString(sayIt.line)
        line.languageIdentifier = model.speechLanguage
        return line
    }
}
