import SwiftUI
import FuoriCore
import FuoriDesign

/// Settings → How people address you (docs/onboarding-design.md → Name and
/// address): for learners who were already playing when the greeter started
/// asking. The two words come from the server, in the language being learned.
/// Shown only while the server saves the choice (/v1/me addressOn).
struct AddressSection: View {
    let lines: Onboarding.AddressLines
    @Environment(AppModel.self) private var model

    var body: some View {
        let choice = Binding<String?>(
            get: { model.addressedAs },
            set: { new in if let new { Task { await model.chooseAddress(new) } } }
        )
        Section {
            Picker("How people address you", selection: choice) {
                option(lines.asWoman).tag(String?.some("f"))
                option(lines.asMan).tag(String?.some("m"))
            }
            .pickerStyle(.inline)
            .labelsHidden()
        } header: {
            Text("How people address you")
        } footer: {
            Text(model.addressError ?? "In \(model.content?.language.name ?? "this language"), some words change for a woman or a man. Everyone you meet will use this.")
                .foregroundStyle(model.addressError == nil ? Tokens.Colors.muted : Tokens.Colors.errorInk)
        }
    }

    private func option(_ said: Onboarding.Line) -> some View {
        var word = AttributedString(said.line)
        word.languageIdentifier = model.content?.language.speechLang
        return VStack(alignment: .leading, spacing: 2) {
            Text(word)
            Text(said.en)
                .font(.footnote)
                .foregroundStyle(Tokens.Colors.muted)
        }
    }
}
