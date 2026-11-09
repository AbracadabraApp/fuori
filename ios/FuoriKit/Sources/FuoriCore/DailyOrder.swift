import Foundation

/// The order cities and places are shown in, new each day (Josh, 2026-11-08:
/// "places don't need to stay in 1 order - not cities not places"). The
/// server's fixed order put a bar or a bakery first in five of the eight
/// first-screen cities, and players start at the top. Each day:
/// - places and cities not visited yet come first, the visited ones after;
/// - within each, a shuffle seeded by the day, so the order holds all day;
/// - no kind of place within three cards of the same kind (as the server did);
/// - an open space or landmark in the first three cards.
/// No words of any language here: kinds are compared as given, and which
/// kinds are open spaces comes from the server (`Place.open`).
public enum DailyOrder {
    /// The cards up to which an open space must appear
    static let openWithin = 3
    /// No kind repeated within this many cards
    static let recentKinds = 3

    public static func places(_ places: [Place], visits: [String: Int], day: String, cityId: String) -> [Place] {
        var rng = SeededGenerator(seed: "\(day)|\(cityId)")
        var fresh = places.filter { (visits[$0.id] ?? 0) == 0 }.shuffled(using: &rng)
        var visited = places.filter { (visits[$0.id] ?? 0) > 0 }.shuffled(using: &rng)
        // An open space near the top: one not visited yet if there is one,
        // otherwise a visited one (the only exception to unvisited first)
        let open: Place?
        if let i = fresh.firstIndex(where: { $0.open == true }) {
            open = fresh.remove(at: i)
        } else if let i = visited.firstIndex(where: { $0.open == true }) {
            open = visited.remove(at: i)
        } else {
            open = nil
        }
        var out = spread(fresh) + spread(visited)
        if let open {
            out.insert(open, at: Int.random(in: 0..<openWithin, using: &rng) % (out.count + 1))
        }
        return out
    }

    public static func cities(_ cities: [City], visits: [String: Int], day: String) -> [City] {
        var rng = SeededGenerator(seed: day)
        let visited: (City) -> Bool = { $0.places.contains { (visits[$0.id] ?? 0) > 0 } }
        return cities.filter { !visited($0) }.shuffled(using: &rng) + cities.filter(visited).shuffled(using: &rng)
    }

    /// Takes the first place whose kind wasn't in the last few cards; failing
    /// that, one that differs from the card before; the same kind twice in a
    /// row only when nothing else is left
    static func spread(_ places: [Place]) -> [Place] {
        var queue = places
        var out: [Place] = []
        while !queue.isEmpty {
            let recent = out.suffix(recentKinds).map(\.kind)
            let i = queue.firstIndex { !recent.contains($0.kind) }
                ?? queue.firstIndex { $0.kind != out.last?.kind }
                ?? 0
            out.append(queue.remove(at: i))
        }
        return out
    }

    /// Today in the phone's time zone, as the seed
    public static func today(_ date: Date = Date(), calendar: Calendar = .current) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }
}

/// A random generator that gives the same numbers for the same seed on every
/// launch (Swift's own hashing changes per launch): FNV-1a of the seed, then SplitMix64
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: String) {
        var hash: UInt64 = 0xcbf2_9ce4_8422_2325
        for byte in seed.utf8 {
            hash ^= UInt64(byte)
            hash = hash &* 0x0000_0100_0000_01b3
        }
        state = hash
    }

    mutating func next() -> UInt64 {
        state &+= 0x9e37_79b9_7f4a_7c15
        var z = state
        z = (z ^ (z >> 30)) &* 0xbf58_476d_1ce4_e5b9
        z = (z ^ (z >> 27)) &* 0x94d0_49bb_1331_11eb
        return z ^ (z >> 31)
    }
}
