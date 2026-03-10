import SwiftUI

struct ArmyEntryRow: View {
    let entry: ArmyEntry
    let factionColor: Color

    @Environment(GameDataStore.self) private var gameData

    private var unit: Unit? { gameData.unit(entry.unitId) }
    private var totalPoints: Int { gameData.entryPoints(entry) }

    private var selectedUpgradeNames: [String] {
        guard let unit else { return [] }
        var names: [String] = []
        for slot in unit.upgradeSlots {
            let selectedIds = entry.selectedUpgrades[slot.id] ?? []
            for upgrade in slot.options where selectedIds.contains(upgrade.id) {
                names.append(upgrade.name)
            }
        }
        return names
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(unit?.name ?? "Unknown Unit")
                    .font(.headline)
                if selectedUpgradeNames.isEmpty {
                    Text("No upgrades")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                } else {
                    Text(selectedUpgradeNames.joined(separator: " · "))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("\(totalPoints)")
                    .font(.title3.bold())
                    .foregroundStyle(factionColor)
                Text("pts")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 2)
    }
}
