import SwiftUI
import FuoriCore
import FuoriDesign
import FuoriNetworking
import FuoriAudio

/// The level up (docs/glossary.md; sketches/level-up/, Josh's approved
/// mockups, 2026-11-10; "lets use the level up pages as designed",
/// 2026-11-11): after N conversations at the learner's step, the game offers
/// the next one. The character's last line as said, the same line at the
/// next step, each with a play button, the yes in the language, "Not yet"
/// under it. The country's decoration (papel picado or the awning) comes from
/// the words' theme, so nothing here assumes a country.
struct LevelUpView: View {
    let offer: APIClient.LevelUp
    let words: LevelUpWords
    let language: Language
    let api: APIClient
    /// The learner's choice: true for the next step
    let onAnswer: (Bool) async -> Void

    @State private var voice = Voice()
    @State private var saying: String?
    @State private var answering = false
    @ScaledMetric(relativeTo: .body) private var lineSize: CGFloat = 16
    @ScaledMetric(relativeTo: .caption) private var labelSize: CGFloat = 12
    @ScaledMetric(relativeTo: .body) private var buttonSize: CGFloat = 44

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                decoration
                who
                    .padding(.horizontal, Tokens.Space.gutter)
                    .padding(.top, 14)
                VStack(alignment: .leading, spacing: 14) {
                    Text(fill(words.kicker))
                        .typeface(.label, 14, relativeTo: .subheadline, weight: .bold)
                        .foregroundStyle(words.theme == "awning" ? Tokens.Colors.awningGreen : Tokens.Colors.magentaInk)
                    Text(words.headline)
                        .typeface(.display, 36, relativeTo: .largeTitle, weight: .heavy)
                        .lineSpacing(4)
                        .foregroundStyle(Tokens.Colors.ink)
                        .accessibilityAddTraits(.isHeader)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(fill(words.how).uppercased())
                            .typeface(.label, 12, relativeTo: .caption, weight: .bold)
                            .tracking(1)
                            .foregroundStyle(Tokens.Colors.muted)
                        card(label: words.now, line: offer.now.line, next: false)
                        card(label: words.next, line: offer.next.line, next: true)
                        Text(words.answers)
                            .typeface(.label, 15, relativeTo: .subheadline)
                            .lineSpacing(3)
                            .foregroundStyle(Tokens.Colors.levelUpBody)
                            .padding(.top, 2)
                    }
                    .padding(.top, 10)
                }
                .padding(.horizontal, 20)
                .padding(.top, 34)
                choices
                    .padding(.horizontal, Tokens.Space.gutter)
                    .padding(.top, 22)
                foot
                    .frame(maxWidth: .infinity)
                    .padding(.top, 16)
                    .padding(.bottom, 24)
            }
        }
        .background(Tokens.Colors.paper)
        .onDisappear { voice.stop() }
    }

    private func fill(_ text: String) -> String {
        text.replacingOccurrences(of: "{name}", with: offer.character.name)
    }

    // MARK: - Pieces

    private var who: some View {
        HStack(spacing: 10) {
            Text(String(offer.character.name.prefix(1)))
                .typeface(.display, 17, relativeTo: .body, weight: .bold)
                .foregroundStyle(Tokens.Colors.terracottaInk)
                .frame(width: 40, height: 40)
                .background(Tokens.Colors.sand, in: Circle())
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 0) {
                Text(offer.character.name)
                    .typeface(.display, 17, relativeTo: .body, weight: .bold)
                    .foregroundStyle(Tokens.Colors.ink)
                Text("\(offer.place) · \(offer.city)")
                    .typeface(.label, 13, relativeTo: .footnote)
                    .foregroundStyle(Tokens.Colors.muted)
            }
        }
    }

    /// One of the two lines: the play button, the label and the line
    private func card(label: String, line: String, next: Bool) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Button {
                Task { await say(line) }
            } label: {
                Image(systemName: saying == line ? "stop.fill" : "play.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(next ? Tokens.Colors.levelUpAccentInk : Tokens.Colors.green)
                    .frame(width: buttonSize, height: buttonSize)
                    .background(next ? Tokens.Colors.levelUpAccent : Tokens.Colors.paper, in: Circle())
            }
            .buttonStyle(PressableStyle())
            .accessibilityLabel("\(words.play): \(label)")
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .typeface(.label, 12, relativeTo: .caption, weight: .bold)
                    .foregroundStyle(next ? Tokens.Colors.levelUpCardLabel : Tokens.Colors.muted)
                Text(tagged(line))
                    .font(.system(size: lineSize))
                    .lineSpacing(lineSize * 0.35)
                    .foregroundStyle(next ? Tokens.Colors.levelUpCardInk : Tokens.Colors.text)
            }
            .padding(.top, 2)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(next ? Tokens.Colors.levelUpCard : Tokens.Colors.card, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Tokens.Colors.levelUpAccent, lineWidth: next ? 2 : 0))
    }

    private var choices: some View {
        VStack(spacing: 10) {
            Button {
                answer(true)
            } label: {
                Text(tagged(words.yes))
                    .typeface(.label, 18, relativeTo: .body, weight: .bold)
                    .foregroundStyle(Tokens.Colors.card)
                    .frame(maxWidth: .infinity, minHeight: 54)
                    .background(Tokens.Colors.green, in: Capsule())
            }
            .buttonStyle(PressableStyle())
            .accessibilityLabel(words.yesLabel)
            Button {
                answer(false)
            } label: {
                Text(words.notYet)
                    .typeface(.display, 26, relativeTo: .title2, weight: .medium)
                    .underline()
                    .foregroundStyle(Tokens.Colors.youInk)
                    .frame(maxWidth: .infinity, minHeight: 48)
            }
            .buttonStyle(PressableStyle())
        }
        .disabled(answering)
    }

    @ViewBuilder private var decoration: some View {
        if words.theme == "awning" { AwningBand() } else { PennantsBand() }
    }

    @ViewBuilder private var foot: some View {
        if words.theme == "awning" { LemonsMark() } else { ColibriMark() }
    }

    // MARK: - Actions

    private func tagged(_ text: String) -> AttributedString {
        var s = AttributedString(text)
        s.languageIdentifier = language.speechLang
        return s
    }

    /// The character says the line (the hosted voice, the phone's if it fails); a second tap stops it
    private func say(_ text: String) async {
        if saying == text {
            voice.stop()
            saying = nil
            return
        }
        voice.stop()
        saying = text
        do {
            let audio = try await api.speak(text: text, characterId: offer.character.id, speed: 0.9)
            guard saying == text else { return }
            try AudioSession.activate()
            try await voice.play(audio)
        } catch {
            guard saying == text else { return }
            await voice.speak(text, language: language.speechLang, rate: 0.9)
        }
        if saying == text { saying = nil }
    }

    private func answer(_ yes: Bool) {
        guard !answering else { return }
        answering = true
        voice.stop()
        Task {
            await onAnswer(yes)
            answering = false
        }
    }
}

// MARK: - The decorations, ported from the mockups' SVG (sketches/level-up/)

/// Mexico: seven papel picado pennants across the top on a string
struct PennantsBand: View {
    var body: some View {
        Canvas { ctx, size in
            let s = size.width / 390
            ctx.scaleBy(x: s, y: s)
            ctx.stroke(SVGPath("M-4 18 Q195 40 394 18").path, with: .color(Tokens.Colors.flapTile), lineWidth: 1.5)
            let pennants: [(String, Color, [String])] = [
                ("M8 20 L58 24 L58 72 L50 80 L42 72 L33 80 L25 72 L16 80 L8 72 Z", Tokens.Colors.magenta, ["circle 33 40 5", "M20 54 l5 -5 l5 5 l-5 5 Z M36 54 l5 -5 l5 5 l-5 5 Z"]),
                ("M64 25 L114 29 L114 76 L106 84 L98 76 L89 84 L81 76 L72 84 L64 76 Z", Tokens.Colors.levelUpAccent, ["M89 38 l7 7 l-7 7 l-7 -7 Z", "circle 76 62 3.5", "circle 102 62 3.5"]),
                ("M120 29 L170 31 L170 78 L162 86 L154 78 L145 86 L137 78 L128 86 L120 78 Z", Tokens.Colors.teal, ["ring 145 46 7", "line 132 64 158 64"]),
                ("M176 31 L226 31 L226 79 L218 87 L210 79 L201 87 L193 79 L184 87 L176 79 Z", Tokens.Colors.green, ["M201 40 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 Z"]),
                ("M232 31 L282 29 L282 78 L274 86 L266 78 L257 86 L249 78 L240 86 L232 78 Z", Tokens.Colors.terracotta, ["circle 257 46 5", "M243 60 l5 -5 l5 5 l-5 5 Z M261 60 l5 -5 l5 5 l-5 5 Z"]),
                ("M288 29 L338 25 L338 76 L330 84 L322 76 L313 84 L305 76 L296 84 L288 76 Z", Tokens.Colors.purple, ["M313 37 l7 7 l-7 7 l-7 -7 Z", "circle 300 60 3.5", "circle 326 60 3.5"]),
                ("M344 24 L394 20 L394 72 L386 80 L378 72 L369 80 L361 72 L352 80 L344 72 Z", Tokens.Colors.magenta, ["ring 369 42 7"]),
            ]
            for (d, color, cuts) in pennants {
                ctx.fill(SVGPath(d).path, with: .color(color))
                for cut in cuts {
                    let parts = cut.split(separator: " ").map(String.init)
                    switch parts.first {
                    case "circle":
                        let (x, y, r) = (Double(parts[1])!, Double(parts[2])!, Double(parts[3])!)
                        ctx.fill(Path(ellipseIn: CGRect(x: x - r, y: y - r, width: 2 * r, height: 2 * r)), with: .color(Tokens.Colors.paper))
                    case "ring":
                        let (x, y, r) = (Double(parts[1])!, Double(parts[2])!, Double(parts[3])!)
                        ctx.stroke(Path(ellipseIn: CGRect(x: x - r, y: y - r, width: 2 * r, height: 2 * r)), with: .color(Tokens.Colors.paper), lineWidth: 3)
                    case "line":
                        var p = Path()
                        p.move(to: CGPoint(x: Double(parts[1])!, y: Double(parts[2])!))
                        p.addLine(to: CGPoint(x: Double(parts[3])!, y: Double(parts[4])!))
                        ctx.stroke(p, with: .color(Tokens.Colors.paper), style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    default:
                        ctx.fill(SVGPath(cut).path, with: .color(Tokens.Colors.paper))
                    }
                }
            }
        }
        .frame(height: 96)
        .accessibilityHidden(true)
    }
}

/// Italy: a green-and-cream awning with scalloped edge and a terracotta rail
struct AwningBand: View {
    var body: some View {
        Canvas { ctx, size in
            let s = size.width / 390
            ctx.scaleBy(x: s, y: s)
            for i in 0..<13 {
                let x = Double(i) * 30
                let color = i % 2 == 0 ? Tokens.Colors.awningGreen : Tokens.Colors.chip
                ctx.fill(Path(CGRect(x: x, y: 0, width: 30, height: 58)), with: .color(color))
                var scallop = Path()
                scallop.addArc(center: CGPoint(x: x + 15, y: 58), radius: 15, startAngle: .degrees(0), endAngle: .degrees(180), clockwise: false)
                scallop.closeSubpath()
                ctx.fill(scallop, with: .color(color))
            }
            ctx.fill(Path(CGRect(x: 0, y: 0, width: 390, height: 6)), with: .color(Tokens.Colors.terracotta))
            var rule = Path()
            rule.move(to: CGPoint(x: 0, y: 58))
            rule.addLine(to: CGPoint(x: 390, y: 58))
            ctx.stroke(rule, with: .color(Tokens.Colors.chipBorder), lineWidth: 1)
        }
        .frame(height: 96)
        .accessibilityHidden(true)
    }
}

/// Mexico's foot: the colibrí at a flower
struct ColibriMark: View {
    var body: some View {
        Canvas { ctx, _ in
            ctx.stroke(SVGPath("M86 92 C84 76 82 66 78 58").path, with: .color(Tokens.Colors.green), style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
            ctx.fill(SVGPath("M80 70 C70 68 66 74 64 80 C72 80 78 76 80 70 Z").path, with: .color(Tokens.Colors.rollNew))
            ctx.fill(SVGPath("M78 58 C70 50 70 40 76 36 C80 42 82 50 78 58 Z").path, with: .color(Tokens.Colors.magenta))
            ctx.fill(SVGPath("M78 58 C86 50 92 44 98 46 C94 54 86 58 78 58 Z").path, with: .color(Tokens.Colors.magenta))
            ctx.fill(SVGPath("M78 58 C76 48 80 40 86 38 C88 46 84 54 78 58 Z").path, with: .color(Tokens.Colors.pink))
            ctx.fill(Path(ellipseIn: CGRect(x: 76, y: 52, width: 6, height: 6)), with: .color(Tokens.Colors.levelUpAccent))
            ctx.fill(SVGPath("M30 38 C18 22 22 6 34 2 C38 14 38 28 30 38 Z").path, with: .color(Tokens.Colors.teal))
            ctx.fill(SVGPath("M34 40 C30 24 38 10 50 10 C50 22 44 34 34 40 Z").path, with: .color(Tokens.Colors.tealLight))
            ctx.fill(SVGPath("M14 46 C20 36 32 32 42 36 C48 38 52 44 50 50 C46 58 34 60 24 56 Z").path, with: .color(Tokens.Colors.leafGreen))
            ctx.fill(SVGPath("M42 36 C48 34 54 38 54 44 C54 48 50 50 47 49 C46 44 44 40 42 36 Z").path, with: .color(Tokens.Colors.magentaInk))
            ctx.fill(SVGPath("M14 46 L2 56 L8 58 L4 66 L20 54 Z").path, with: .color(Tokens.Colors.leafDark))
            ctx.fill(Path(ellipseIn: CGRect(x: 46.8, y: 37.8, width: 4.4, height: 4.4)), with: .color(Tokens.Colors.ink))
            ctx.fill(Path(ellipseIn: CGRect(x: 49, y: 38.6, width: 1.4, height: 1.4)), with: .color(Tokens.Colors.card))
            ctx.stroke(SVGPath("M54 42 L74 50").path, with: .color(Tokens.Colors.flapTile), style: StrokeStyle(lineWidth: 2, lineCap: .round))
        }
        .frame(width: 104, height: 92)
        .accessibilityHidden(true)
    }
}

/// Italy's foot: two lemons on a branch
struct LemonsMark: View {
    var body: some View {
        Canvas { ctx, _ in
            ctx.stroke(SVGPath("M6 30 C40 20 80 22 144 34").path, with: .color(Tokens.Colors.lessonsAreaInk), style: StrokeStyle(lineWidth: 3, lineCap: .round))
            ctx.fill(SVGPath("M30 26 C24 12 34 4 44 6 C44 16 38 24 30 26 Z").path, with: .color(Tokens.Colors.green))
            ctx.fill(SVGPath("M62 23 C70 8 84 8 88 16 C80 22 70 24 62 23 Z").path, with: .color(Tokens.Colors.rollNew))
            ctx.fill(SVGPath("M104 26 C100 12 110 4 120 8 C118 18 112 24 104 26 Z").path, with: .color(Tokens.Colors.green))
            ctx.fill(SVGPath("M126 31 C134 20 146 22 148 30 C140 34 132 34 126 31 Z").path, with: .color(Tokens.Colors.rollNew))
            ctx.stroke(SVGPath("M50 27 L50 36").path, with: .color(Tokens.Colors.lessonsAreaInk), lineWidth: 2)
            ctx.fill(Path(ellipseIn: CGRect(x: 33, y: 34, width: 34, height: 40)), with: .color(Tokens.Colors.lemon))
            ctx.fill(SVGPath("M50 34 l-3 -4 h6 Z M50 74 l-2 4 h4 Z").path, with: .color(Tokens.Colors.lemon))
            ctx.fill(Path(ellipseIn: CGRect(x: 40, y: 42, width: 8, height: 12)), with: .color(Tokens.Colors.lemonLight))
            ctx.stroke(SVGPath("M92 29 L92 36").path, with: .color(Tokens.Colors.lessonsAreaInk), lineWidth: 2)
            ctx.fill(Path(ellipseIn: CGRect(x: 77, y: 34, width: 30, height: 36)), with: .color(Tokens.Colors.lemonDeep))
            ctx.fill(SVGPath("M92 34 l-3 -4 h6 Z M92 70 l-2 4 h4 Z").path, with: .color(Tokens.Colors.lemonDeep))
            ctx.fill(Path(ellipseIn: CGRect(x: 83.5, y: 41, width: 7, height: 10)), with: .color(Tokens.Colors.lemonLight))
        }
        .frame(width: 150, height: 84)
        .accessibilityHidden(true)
    }
}

/// A small reader for the SVG path data the mockups use (M, L, H, V, C, Q, Z,
/// absolute and relative), so the drawings carry over as drawn
struct SVGPath {
    let path: Path

    init(_ d: String) {
        var p = Path()
        var cur = CGPoint.zero
        var start = CGPoint.zero
        var cmd = "M"
        var nums: [Double] = []
        let tokens = SVGPath.tokens(d)
        var i = 0
        func take(_ n: Int) -> [Double]? {
            guard i + n <= tokens.count else { return nil }
            let out = tokens[i..<i + n].compactMap { Double($0) }
            guard out.count == n else { return nil }
            i += n
            return out
        }
        while i < tokens.count {
            let t = tokens[i]
            if t.count == 1, t.first!.isLetter {
                cmd = t
                i += 1
                if cmd == "Z" || cmd == "z" {
                    p.closeSubpath()
                    cur = start
                    continue
                }
            }
            let rel = cmd == cmd.lowercased() && cmd != cmd.uppercased()
            switch cmd.uppercased() {
            case "M":
                guard let v = take(2) else { i = tokens.count; break }
                cur = rel ? CGPoint(x: cur.x + v[0], y: cur.y + v[1]) : CGPoint(x: v[0], y: v[1])
                p.move(to: cur)
                start = cur
                cmd = rel ? "l" : "L"
            case "L":
                guard let v = take(2) else { i = tokens.count; break }
                cur = rel ? CGPoint(x: cur.x + v[0], y: cur.y + v[1]) : CGPoint(x: v[0], y: v[1])
                p.addLine(to: cur)
            case "H":
                guard let v = take(1) else { i = tokens.count; break }
                cur = CGPoint(x: rel ? cur.x + v[0] : v[0], y: cur.y)
                p.addLine(to: cur)
            case "V":
                guard let v = take(1) else { i = tokens.count; break }
                cur = CGPoint(x: cur.x, y: rel ? cur.y + v[0] : v[0])
                p.addLine(to: cur)
            case "C":
                guard let v = take(6) else { i = tokens.count; break }
                let o = rel ? cur : .zero
                let c1 = CGPoint(x: o.x + v[0], y: o.y + v[1]), c2 = CGPoint(x: o.x + v[2], y: o.y + v[3])
                cur = CGPoint(x: o.x + v[4], y: o.y + v[5])
                p.addCurve(to: cur, control1: c1, control2: c2)
            case "Q":
                guard let v = take(4) else { i = tokens.count; break }
                let o = rel ? cur : .zero
                let c1 = CGPoint(x: o.x + v[0], y: o.y + v[1])
                cur = CGPoint(x: o.x + v[2], y: o.y + v[3])
                p.addQuadCurve(to: cur, control: c1)
            default:
                i = tokens.count
            }
            nums.removeAll()
        }
        path = p
    }

    private static func tokens(_ d: String) -> [String] {
        var out: [String] = []
        var cur = ""
        for ch in d {
            if ch.isLetter {
                if !cur.isEmpty { out.append(cur); cur = "" }
                out.append(String(ch))
            } else if ch == " " || ch == "," {
                if !cur.isEmpty { out.append(cur); cur = "" }
            } else if ch == "-" && !cur.isEmpty {
                out.append(cur)
                cur = "-"
            } else {
                cur.append(ch)
            }
        }
        if !cur.isEmpty { out.append(cur) }
        return out
    }
}
