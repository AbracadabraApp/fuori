import SwiftUI

/// The app's two typefaces (design/tokens.json). The font files are bundled
/// with the app (ios/Fuori/Resources/Fonts, UIAppFonts in project.yml).
public extension Font {
    /// Alegreya: names of cities, places and people
    static func display(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .custom(Tokens.FontFamily.display, size: size).weight(weight)
    }

    /// Alegreya Sans: captions, labels, buttons
    static func label(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(Tokens.FontFamily.label, size: size).weight(weight)
    }
}
