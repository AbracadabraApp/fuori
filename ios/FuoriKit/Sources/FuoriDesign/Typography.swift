import SwiftUI

/// The app's two typefaces (design/tokens.json), bundled with the app
/// (ios/Fuori/Resources/Fonts, UIAppFonts in project.yml).
///
/// Every size is tied to a system text style, so it grows and shrinks with the
/// learner's text size setting (Dynamic Type), and the weight steps up when
/// Bold Text is on, which custom fonts don't get by themselves
/// (docs/13-ios-conventions.md → Typography).
public enum Typeface: Sendable {
    /// Alegreya: names of cities, places and people
    case display
    /// Alegreya Sans: captions, labels, buttons
    case label

    var family: String {
        switch self {
        case .display: Tokens.FontFamily.display
        case .label: Tokens.FontFamily.label
        }
    }
}

struct TypefaceModifier: ViewModifier {
    let typeface: Typeface
    let size: CGFloat
    let style: Font.TextStyle
    let weight: Font.Weight
    @Environment(\.legibilityWeight) private var legibilityWeight

    func body(content: Content) -> some View {
        content.font(
            .custom(typeface.family, size: size, relativeTo: style)
                .weight(legibilityWeight == .bold ? weight.bolder : weight)
        )
    }
}

public extension View {
    /// Text in one of the app's typefaces, at a size that scales like `style`
    func typeface(_ typeface: Typeface, _ size: CGFloat, relativeTo style: Font.TextStyle, weight: Font.Weight = .regular) -> some View {
        modifier(TypefaceModifier(typeface: typeface, size: size, style: style, weight: weight))
    }
}

extension Font.Weight {
    /// One step heavier, for Bold Text
    var bolder: Font.Weight {
        switch self {
        case .ultraLight: .light
        case .thin, .light: .regular
        case .regular: .semibold
        case .medium, .semibold: .bold
        case .bold: .heavy
        default: .black
        }
    }
}
