// swift-tools-version: 6.2
// Fuori's app code as local packages (docs/12-native-app.md → iOS client).
// FuoriCore and FuoriNetworking use Foundation only, so `swift test` runs them
// in seconds without a simulator. FuoriDesign and FuoriFeatures are SwiftUI.
import PackageDescription

let package = Package(
    name: "FuoriKit",
    platforms: [.iOS(.v26), .macOS(.v26)],
    products: [
        .library(name: "FuoriCore", targets: ["FuoriCore"]),
        .library(name: "FuoriNetworking", targets: ["FuoriNetworking"]),
        .library(name: "FuoriDesign", targets: ["FuoriDesign"]),
        .library(name: "FuoriAudio", targets: ["FuoriAudio"]),
        .library(name: "FuoriFeatures", targets: ["FuoriFeatures"]),
    ],
    targets: [
        .target(name: "FuoriCore"),
        .target(name: "FuoriNetworking", dependencies: ["FuoriCore"]),
        .target(name: "FuoriDesign"),
        .target(name: "FuoriAudio"),
        .target(name: "FuoriFeatures", dependencies: ["FuoriCore", "FuoriNetworking", "FuoriDesign", "FuoriAudio"]),
        .testTarget(name: "FuoriCoreTests", dependencies: ["FuoriCore"], resources: [.copy("Fixtures")]),
        .testTarget(name: "FuoriNetworkingTests", dependencies: ["FuoriNetworking"]),
        .testTarget(name: "FuoriAudioTests", dependencies: ["FuoriAudio"]),
    ]
)
