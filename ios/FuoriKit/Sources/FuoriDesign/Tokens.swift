// Generated from design/tokens.json by scripts/tokens.mjs (npm run tokens). Don't edit by hand.
import SwiftUI

public enum Tokens {
    public enum Colors {
        public static let paper = Color(red: 0.9608, green: 0.9451, blue: 0.9294) // #f5f1ed
        public static let card = Color(red: 1.0000, green: 1.0000, blue: 1.0000) // #ffffff
        public static let green = Color(red: 0.3373, green: 0.3882, blue: 0.1882) // #566330
        public static let sand = Color(red: 0.9098, green: 0.8353, blue: 0.7686) // #e8d5c4
        public static let ink = Color(red: 0.0000, green: 0.0000, blue: 0.0000) // #000000
        public static let text = Color(red: 0.2000, green: 0.2000, blue: 0.2000) // #333333
        public static let muted = Color(red: 0.4000, green: 0.4000, blue: 0.4000) // #666666
        public static let record = Color(red: 0.8627, green: 0.2078, blue: 0.2706) // #dc3545
        public static let terracotta = Color(red: 0.7529, green: 0.3765, blue: 0.2275) // #c0603a
        public static let errorBg = Color(red: 0.9725, green: 0.8431, blue: 0.8549) // #f8d7da
        public static let errorInk = Color(red: 0.4471, green: 0.1098, blue: 0.1412) // #721c24
        public static let lessons = Color(red: 0.8235, green: 0.0392, blue: 0.0392) // #d20a0a
        public static let missions = Color(red: 1.0000, green: 0.8235, blue: 0.0000) // #ffd200
        public static let flashcards = Color(red: 0.0000, green: 0.2431, blue: 0.5059) // #003e81
    }

    public enum FontFamily {
        /// names (cities, places, people)
        public static let display = "Alegreya"
        /// bands, captions, buttons
        public static let label = "Alegreya Sans"
    }

    public enum Size {
        public static let cardTitle: CGFloat = 32
        public static let cardSubtitle: CGFloat = 17
        public static let body: CGFloat = 17
        public static let personName: CGFloat = 31
        public static let personRole: CGFloat = 19
        public static let badge: CGFloat = 15
    }

    public enum Space {
        public static let gutter: CGFloat = 16
        public static let cardGap: CGFloat = 20
        public static let captionPadding: CGFloat = 16
        public static let band: CGFloat = 12
    }

    public enum Radius {
        public static let card: CGFloat = 8
    }

    public enum Shadow {
        public static let card = (x: CGFloat(0), y: CGFloat(2), radius: CGFloat(4), opacity: 0.1)
    }
}
