import Foundation

/// The intro's English in pieces that fit the band (Josh, 2026-11-12: at most two lines, "2"): a long sentence ran
/// past the band's lines and was cut off with "…" while the voice went on (Raymundo, Don Isidro). The words are
/// wrapped as the band wraps them, the lines taken two at a time, and each piece shows while the voice is on its
/// share of the spoken sentence. Works in any language: it only measures words.
enum SubtitleChunks {
    /// `text` wrapped into lines no wider than `maxWidth` (by `width`), taken `lines` at a time
    static func split(_ text: String, maxWidth: CGFloat, lines: Int = 2, width: (String) -> CGFloat) -> [String] {
        let words = text.split(whereSeparator: \.isWhitespace).map(String.init)
        guard !words.isEmpty, maxWidth > 0, lines > 0 else { return [text] }
        var wrapped: [String] = []
        var current = ""
        for word in words {
            let candidate = current.isEmpty ? word : current + " " + word
            if current.isEmpty || width(candidate) <= maxWidth {
                current = candidate
            } else {
                wrapped.append(current)
                current = word
            }
        }
        if !current.isEmpty { wrapped.append(current) }
        return stride(from: 0, to: wrapped.count, by: lines).map { wrapped[$0..<min($0 + lines, wrapped.count)].joined(separator: " ") }
    }

    /// The piece to show when `progress` (0...1) of the spoken sentence is out: each piece gets the share of the
    /// sentence its characters have
    static func index(_ chunks: [String], progress: Double) -> Int {
        guard chunks.count > 1 else { return 0 }
        let total = Double(chunks.reduce(0) { $0 + $1.count })
        guard total > 0 else { return 0 }
        var end = 0.0
        for (i, chunk) in chunks.enumerated() {
            end += Double(chunk.count) / total
            if progress < end { return i }
        }
        return chunks.count - 1
    }
}
