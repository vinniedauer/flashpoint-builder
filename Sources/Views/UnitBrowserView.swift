import SwiftUI

struct UnitBrowserView: View {
    @Environment(GameDataStore.self) private var gameData
    @State private var selectedFactionId = ""

    private var selectedFaction: Faction? { gameData.faction(selectedFactionId) }

    var body: some View {
        VStack(spacing: 0) {
            if gameData.factions.count > 1 {
                Picker("Faction", selection: $selectedFactionId) {
                    ForEach(gameData.factions) { faction in
                        Text(faction.name).tag(faction.id)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
            }

            List {
                if let faction = selectedFaction {
                    let grouped = Dictionary(grouping: faction.units, by: { $0.type })
                    let order: [UnitType] = [.hero, .infantry, .vehicle, .support]

                    ForEach(order, id: \.self) { type in
                        if let units = grouped[type], !units.isEmpty {
                            Section(type.displayName) {
                                ForEach(units) { unit in
                                    NavigationLink {
                                        UnitDetailView(unit: unit, faction: faction)
                                    } label: {
                                        UnitSelectRow(unit: unit, factionColor: Color(hex: faction.colorHex))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Units")
        .onAppear {
            if selectedFactionId.isEmpty {
                selectedFactionId = gameData.factions.first?.id ?? ""
            }
        }
    }
}
