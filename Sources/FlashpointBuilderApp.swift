import SwiftUI

@main
struct FlashpointBuilderApp: App {
    @State private var gameDataStore = GameDataStore()
    @State private var armyListStore = ArmyListStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(gameDataStore)
                .environment(armyListStore)
        }
    }
}
