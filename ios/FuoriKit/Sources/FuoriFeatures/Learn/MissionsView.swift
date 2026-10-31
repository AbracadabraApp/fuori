import SwiftUI
import FuoriDesign

/// Missions, a placeholder (Josh, 2026-10-30: "link the missions chips mockup
/// to the missions learn area - just a placeholder"): the chip wall mockup
/// (design/missions/chip-wall.dc.html) as a picture, from the app's asset
/// catalog (MissionsMockup), until the real screen is built
/// (docs/diario.md → Prototype first). It shows Italy's mockup in both
/// countries; nothing on it can be tapped.
struct MissionsView: View {
    var body: some View {
        ScrollView {
            Image("MissionsMockup")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 600)
                .frame(maxWidth: .infinity)
                .accessibilityLabel("A mockup of missions: one chip per topic, warming from grey to gold as you use its phrases with people")
        }
        .background(Color(red: 0.949, green: 0.949, blue: 0.965))
        .navigationTitle("Missions")
    }
}
