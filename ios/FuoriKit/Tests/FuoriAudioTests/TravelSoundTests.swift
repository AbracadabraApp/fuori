import Testing
@testable import FuoriAudio

/// The trip's sounds (Josh, 2026-11-16: a train on rails; "you need road
/// noise for mx bus") ship inside the app, under the names content sends
@Suite struct TravelSoundTests {
    @Test func theAppCarriesBothTrips() {
        #expect(TravelSound.has("rails"))
        #expect(TravelSound.has("road"))
        #expect(!TravelSound.has("hovercraft"))
    }
}
