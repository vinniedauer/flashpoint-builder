import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack {
                ArmyListsView()
            }
            .tabItem {
                Label("Fireteams", systemImage: "list.bullet.clipboard.fill")
            }

            NavigationStack {
                UnitBrowserView()
            }
            .tabItem {
                Label("Units", systemImage: "person.3.fill")
            }
        }
    }
}
