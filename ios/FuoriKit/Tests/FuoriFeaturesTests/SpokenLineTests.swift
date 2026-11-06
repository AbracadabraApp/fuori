import Testing
@testable import FuoriFeatures

/// Her bubble shows each part as the voice reaches it in the line; the server
/// ends every spoken piece on a sentence break (lib/beginner.ts → sentence),
/// so the app counts the full stop it adds, or the parts show early
@Suite struct SpokenLineTests {
    @Test func countsTheAddedFullStop() {
        #expect(ConversationModel.spokenLength("first, the cashier") == "first, the cashier.".count)
        #expect(ConversationModel.spokenLength("Prima la cassa, per favore.") == "Prima la cassa, per favore.".count)
        #expect(ConversationModel.spokenLength("¿Quiere probar un chapulín?") == "¿Quiere probar un chapulín?".count)
        #expect(ConversationModel.spokenLength("«Grazie»!") == "«Grazie»!".count)
    }
}
