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
        public static let flashcards = Color(red: 0.2471, green: 0.3020, blue: 0.3608) // #3f4d5c
        public static let receipt = Color(red: 1.0000, green: 0.9922, blue: 0.9686) // #fffdf7
        public static let rollNew = Color(red: 0.4902, green: 0.5490, blue: 0.2745) // #7d8c46
        public static let rollRegular = Color(red: 0.8863, green: 0.3412, blue: 0.2980) // #e2574c
        public static let terracottaInk = Color(red: 0.6588, green: 0.3098, blue: 0.1725) // #a84f2c
        public static let lessonsField = Color(red: 0.9333, green: 0.9020, blue: 0.8392) // #eee6d6
        public static let lessonsFieldInk = Color(red: 0.2902, green: 0.2275, blue: 0.0196) // #4a3a05
        public static let lessonsAreaInk = Color(red: 0.3608, green: 0.2902, blue: 0.0627) // #5c4a10
        public static let chip = Color(red: 0.9843, green: 0.9725, blue: 0.9490) // #fbf8f2
        public static let chipBorder = Color(red: 0.8392, green: 0.7922, blue: 0.7020) // #d6cab3
        public static let flapTile = Color(red: 0.2275, green: 0.2118, blue: 0.2039) // #3a3634
        public static let flapInk = Color(red: 0.9608, green: 0.9451, blue: 0.9294) // #f5f1ed
        public static let flapHinge = Color(red: 0.3020, green: 0.2824, blue: 0.2706) // #4d4845
        public static let cultureChip = Color(red: 0.9098, green: 0.9255, blue: 0.9059) // #e8ece7
        public static let cultureEdge = Color(red: 0.6784, green: 0.7373, blue: 0.6980) // #adbcb2
        public static let cultureInk = Color(red: 0.1725, green: 0.2392, blue: 0.2118) // #2c3d36
        public static let cultureDone = Color(red: 0.2941, green: 0.3882, blue: 0.3451) // #4b6358
        public static let cultureGem = Color(red: 0.7373, green: 0.7961, blue: 0.7529) // #bccbc0
        public static let cultureGemDone = Color(red: 0.8039, green: 0.8471, blue: 0.8157) // #cdd8d0
        public static let historyField = Color(red: 0.9137, green: 0.8667, blue: 0.8157) // #e9ddd0
        public static let historyInk = Color(red: 0.2902, green: 0.2275, blue: 0.1882) // #4a3a30
        public static let herBubble = Color(red: 0.9333, green: 0.9020, blue: 0.8392) // #eee6d6
        public static let herEdge = Color(red: 0.8392, green: 0.7922, blue: 0.7020) // #d6cab3
        public static let youBubble = Color(red: 0.8588, green: 0.8902, blue: 0.7686) // #dbe3c4
        public static let youEdge = Color(red: 0.7098, green: 0.7608, blue: 0.5765) // #b5c293
        public static let youInk = Color(red: 0.2471, green: 0.2902, blue: 0.1333) // #3f4a22
        public static let cinemaGlow = Color(red: 1.0000, green: 0.8392, blue: 0.0000) // #ffd600
        public static let levelUpCard = Color(red: 1.0000, green: 0.9098, blue: 0.6392) // #ffe8a3
        public static let levelUpAccent = Color(red: 0.9490, green: 0.6627, blue: 0.0000) // #f2a900
        public static let levelUpAccentInk = Color(red: 0.2275, green: 0.1647, blue: 0.0000) // #3a2a00
        public static let levelUpCardInk = Color(red: 0.1686, green: 0.1333, blue: 0.0000) // #2b2200
        public static let levelUpCardLabel = Color(red: 0.2902, green: 0.2275, blue: 0.0196) // #4a3a05
        public static let levelUpBody = Color(red: 0.3333, green: 0.3333, blue: 0.3333) // #555555
        public static let magenta = Color(red: 0.8784, green: 0.1882, blue: 0.4353) // #e0306f
        public static let magentaInk = Color(red: 0.7216, green: 0.1373, blue: 0.3529) // #b8235a
        public static let awningGreen = Color(red: 0.1843, green: 0.4196, blue: 0.2706) // #2f6b45
        public static let teal = Color(red: 0.1137, green: 0.6235, blue: 0.7020) // #1d9fb3
        public static let tealLight = Color(red: 0.3686, green: 0.7686, blue: 0.8196) // #5ec4d1
        public static let purple = Color(red: 0.4824, green: 0.2471, blue: 0.6275) // #7b3fa0
        public static let pink = Color(red: 1.0000, green: 0.3569, blue: 0.5765) // #ff5b93
        public static let leafGreen = Color(red: 0.1020, green: 0.5412, blue: 0.3529) // #1a8a5a
        public static let leafDark = Color(red: 0.0784, green: 0.3608, blue: 0.2392) // #145c3d
        public static let lemon = Color(red: 0.9686, green: 0.7765, blue: 0.0000) // #f7c600
        public static let lemonDeep = Color(red: 0.9490, green: 0.7176, blue: 0.0196) // #f2b705
        public static let lemonLight = Color(red: 1.0000, green: 0.8902, blue: 0.4510) // #ffe373
    }

    public enum FontFamily {
        /// names (cities, places, people)
        public static let display = "Alegreya"
        /// bands, captions, buttons
        public static let label = "Alegreya Sans"
        /// the Learn page's split-flap numbers (Josh, 2026-11-03)
        public static let flip = "Oswald"
    }

    public enum Size {
        public static let cardTitle: CGFloat = 32
        public static let cardSubtitle: CGFloat = 17
        public static let body: CGFloat = 17
        public static let personName: CGFloat = 31
        public static let personRole: CGFloat = 19
        public static let badge: CGFloat = 15
        public static let stamp: CGFloat = 76
        public static let stampWord: CGFloat = 11
        public static let stampLabel: CGFloat = 12
        public static let stampStripe: CGFloat = 7
    }

    public enum Space {
        public static let gutter: CGFloat = 16
        public static let cardGap: CGFloat = 20
        public static let captionPadding: CGFloat = 16
        public static let band: CGFloat = 12
    }

    public enum Radius {
        public static let card: CGFloat = 8
        public static let poster: CGFloat = 16
    }

    public enum Shadow {
        public static let card = (x: CGFloat(0), y: CGFloat(2), radius: CGFloat(4), opacity: 0.1)
        public static let stamp = (x: CGFloat(0), y: CGFloat(3), radius: CGFloat(4), opacity: 0.25)
    }
}
