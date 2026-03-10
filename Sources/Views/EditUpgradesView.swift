import SwiftUI

struct EditUpgradesView: View {
    let listId: UUID
    let entryId: UUID

    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @Environment(\.dismiss) private var dismiss

    @State private var selectedUpgrades: [String: [String]] = [:]

    private var list: ArmyList? { store.lists.first { $0.id == listId } }
    private var entry: ArmyEntry? { list?.entries.first { $0.id == entryId } }
    private var unit: Unit? { entry.flatMap { gameData.unit($0.unitId) } }
    private var faction: Faction? { list.flatMap { gameData.faction($0.factionId) } }
    private var factionColor: Color { Color(hex: faction?.colorHex ?? "#888888") }

    var body: some View {
        NavigationStack {
            Group {
                if let unit {
                    UpgradeConfigForm(
                        unit: unit,
                        factionColor: factionColor,
                        selectedUpgrades: $selectedUpgrades
                    )
                } else {
                    ContentUnavailableView("Unit Not Found", systemImage: "questionmark.circle")
                }
            }
            .navigationTitle(unit?.name ?? "Upgrades")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveChanges() }
                }
            }
        }
        .onAppear {
            selectedUpgrades = entry?.selectedUpgrades ?? [:]
        }
    }

    private func saveChanges() {
        guard var list else { return }
        if let idx = list.entries.firstIndex(where: { $0.id == entryId }) {
            list.entries[idx].selectedUpgrades = selectedUpgrades
            store.updateList(list)
        }
        dismiss()
    }
}
