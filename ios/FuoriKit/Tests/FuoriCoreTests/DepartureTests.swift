import Testing
@testable import FuoriCore

/// The ticket's platform must be the one the server tells the seller
/// (lib/travel/departure.ts → departureFor); values from the server's function
@Suite struct DepartureTests {
    @Test func matchesTheServer() {
        let cases: [(String, String, Int, Int)] = [
            ("roma-nuova", "firenze", 5, 65),
            ("matera", "napoli", 6, 82),
            ("ciudad-de-mexico", "oaxaca", 8, 63),
            ("san-miguel-de-allende", "guadalajara", 12, 84),
            ("venezia", "bologna", 5, 70),
        ]
        for (from, to, platform, seat) in cases {
            let d = Departure(from: from, to: to)
            #expect(d.platform == platform && d.seat == seat, "\(from) → \(to): got \(d.platform), \(d.seat)")
        }
    }

    @Test func sameRouteSamePlatform() {
        #expect(Departure(from: "roma-nuova", to: "napoli") == Departure(from: "roma-nuova", to: "napoli"))
    }
}
