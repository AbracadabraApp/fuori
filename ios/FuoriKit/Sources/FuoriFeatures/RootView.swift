import SwiftUI
import FuoriDesign

/// Loading, then the city list; a failure shows the server's message and a retry.
public struct RootView: View {
    @Environment(AppModel.self) private var model

    public init() {}

    public var body: some View {
        NavigationStack {
            switch model.phase {
            case .loading:
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Tokens.Colors.paper)
            case .failed(let message):
                VStack(spacing: Tokens.Space.gutter) {
                    Text(message)
                        .font(.label(Tokens.Size.body))
                        .foregroundStyle(Tokens.Colors.errorInk)
                        .multilineTextAlignment(.center)
                    Button("Try again") { Task { await model.load() } }
                        .font(.label(Tokens.Size.body, weight: .medium))
                        .foregroundStyle(Tokens.Colors.green)
                }
                .padding(Tokens.Space.gutter)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Tokens.Colors.errorBg)
            case .ready:
                if let content = model.content {
                    CityListView(content: content)
                }
            }
        }
        .tint(Tokens.Colors.green)
        .task { if model.content == nil { await model.load() } }
    }
}
