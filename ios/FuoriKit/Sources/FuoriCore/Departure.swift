import Foundation

/// Platform and seat for a trip from one city to another, the same as the
/// server's departureFor (lib/travel/departure.ts), so the ticket and the
/// ticket seller agree: the server tells the seller the platform from the same
/// ids. Deterministic: the same route always uses the same platform. No
/// departure time (Josh, 2026-10-14): the seller is free to talk times.
public struct Departure: Equatable, Hashable, Sendable {
    public let platform: Int
    public let seat: Int

    public init(from fromId: String, to toId: String) {
        // h = h * 31 + code unit, kept to 32 bits, as the server's hash
        var h: UInt32 = 0
        for unit in "\(fromId)>\(toId)".utf16 { h = h &* 31 &+ UInt32(unit) }
        platform = 1 + Int(h % 12)
        seat = 11 + Int((h >> 5) % 78)
    }
}
