import SwiftUI

struct ArmyListRow: View {
    let list: ArmyList

    @Environment(GameDataStore.self) private var gameData

    private var totalPoints: Int { gameData.listPoints(list) }
    private var faction: Faction? { gameData.faction(list.factionId) }
    private var factionColor: Color { Color(hex: faction?.colorHex ?? "#888888") }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(list.name)
                    .font(.headline)
                Spacer()
                Text("\(list.entries.count) unit\(list.entries.count == 1 ? "" : "s")")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack {
                if let faction {
                    Label(faction.name, systemImage: "shield.fill")
                        .font(.caption)
                        .foregroundStyle(factionColor)
                }
                Spacer()
                Text("\(totalPoints) / \(list.pointBudget) pts")
                    .font(.caption.bold())
                    .foregroundStyle(totalPoints > list.pointBudget ? .red : .secondary)
            }

            PointBudgetBar(current: totalPoints, budget: list.pointBudget, color: factionColor)
                .frame(height: 4)
        }
        .padding(.vertical, 4)
    }
}
