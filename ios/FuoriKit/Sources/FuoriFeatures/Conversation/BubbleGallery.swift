#if DEBUG
import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking

/// Debug only: every bubble the conversation screen draws, with the real
/// components over a real portrait, for screenshots in the simulator
/// (Josh, 2026-11-05: "Show me each bubble (left & right)").
/// Launch with -FuoriBubbles her|you. The mic in 5 is a stand-in circle.
struct BubbleGallery: View {
    let page: String
    let model: ConversationModel
    let language: String

    var body: some View {
        ZStack(alignment: .bottom) {
            Portrait(url: model.character.portrait, name: model.character.name)
                .ignoresSafeArea()
            VStack(alignment: .leading, spacing: 10) {
                if page == "her" { her } else { you }
            }
            .padding(.horizontal, Tokens.Space.gutter)
            .padding(.bottom, 20)
        }
    }

    private static func parts(_ json: String) -> [APIClient.TurnPart] {
        (try? JSONDecoder().decode([APIClient.TurnPart].self, from: Data(json.utf8))) ?? []
    }

    private func caption(_ text: String) -> some View {
        Text(text)
            .font(.caption.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(.black.opacity(0.75), in: Capsule())
    }

    /// Her side
    @ViewBuilder private var her: some View {
        caption("1. Her line, said in parts")
        BeginnerBubbles(parts: Self.parts(#"[{"kind":"word","text":"Buongiorno!","en":"Good morning!"},{"kind":"word","text":"Prima alla cassa, per favore.","en":"First at the till, please."},{"kind":"question","text":"Vuole un caffè o un cappuccino?","en":"Would you like a coffee or a cappuccino?"}]"#), speechLanguage: language)
        caption("2. Her line, with its English")
        Subtitles(line: "Buongiorno! Prima alla cassa, per favore. Vuole un caffè o un cappuccino?", shown: nil, english: "Good morning! First at the till, please. Would you like a coffee or a cappuccino?", note: nil)
    }

    /// The learner's side
    @ViewBuilder private var you: some View {
        caption("3. Your answers to say")
        AnswersToSay(answers: Self.parts(#"[{"kind":"answer","text":"Un caffè, per favore.","en":"A coffee, please."},{"kind":"answer","text":"Un cappuccino, per favore.","en":"A cappuccino, please."}]"#), speechLanguage: language)
        caption("4. How do I say it")
        SayItBubbles(model: model, sayIt: .init(english: "A coffee, please", line: "Un caffè, per favore.", en: "A coffee, please."))
        caption("5. Suggested replies")
        ReplyPanel(model: model) {
            Circle().fill(Tokens.Colors.green).frame(width: 68, height: 68)
        }
    }
}
#endif
