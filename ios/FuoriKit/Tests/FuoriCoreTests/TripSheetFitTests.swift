import Testing
@testable import FuoriCore

/// B37 (Josh, 2026-11-16: "the city key is missing on the mexico map"): on a
/// numbered sheet the ticket, the map and the key all show at once. The map
/// takes the height the other two leave, so the key can't end up under the
/// bottom of the sheet.
@Suite struct TripSheetFitTests {
    /// A standard iPhone's large sheet, Mexico's ticket and its 14-city key
    let room = 700.0, ticket = 140.0, key = 190.0, gaps = 64.0

    @Test func ticketMapAndKeyFitTheSheet() throws {
        let map = try #require(TravelMap.fittedHeight(room: room, ticket: ticket, key: key, gaps: gaps))
        #expect(ticket + map + key + gaps <= room)
        // And the map uses all the room there is, no more
        #expect(map == room - ticket - key - gaps)
    }

    /// Mexico's map at full width on a 393 pt phone is about 314 pt tall, which
    /// with this ticket and key overflows the sheet: the fitted height is less
    @Test func theMapGivesUpHeightWhenFullWidthWouldHideTheKey() throws {
        let fullWidth = (393.0 - 32) / 1.1513
        #expect(ticket + fullWidth + key + gaps > room)
        let map = try #require(TravelMap.fittedHeight(room: room, ticket: ticket, key: key, gaps: gaps))
        #expect(map < fullWidth)
    }

    @Test func nothingIsCappedUntilTheTicketAndKeyAreMeasured() {
        #expect(TravelMap.fittedHeight(room: room, ticket: 0, key: key, gaps: gaps) == nil)
        #expect(TravelMap.fittedHeight(room: room, ticket: ticket, key: 0, gaps: gaps) == nil)
        #expect(TravelMap.fittedHeight(room: 0, ticket: ticket, key: key, gaps: gaps) == nil)
    }

    /// Very large text: the three can't fit, so the map keeps a readable
    /// height and the sheet scrolls
    @Test func theMapKeepsALeastHeight() {
        #expect(TravelMap.fittedHeight(room: 500, ticket: 220, key: 320, gaps: gaps) == 180)
    }

    /// The page leaves by itself after 3.5 s (Josh, 2026-11-16), but never
    /// while VoiceOver is reading it
    @Test func thePageBoardsByItselfExceptWithVoiceOver() {
        #expect(TravelMap.boardsAfter(voiceOver: false) == 3.5)
        #expect(TravelMap.boardsAfter(voiceOver: true) == nil)
    }
}
