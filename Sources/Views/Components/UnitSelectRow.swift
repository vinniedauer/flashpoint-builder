import SwiftUI

struct UnitSelectRow: View {
    let unit: Unit
    let factionColor: Color

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: unit.type.systemImage)
                .foregroundStyle(factionColor)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(unit.name)
                    .font(.headline)
                if unit.upgradeSlots.isEmpty {
                    Text("No upgrades")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                } else {
                    Text("\(unit.upgradeSlots.count) upgrade slot\(unit.upgradeSlots.count == 1 ? "" : "s")")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Text("\(unit.pointCost) pts")
                .font(.subheadline.bold())
                .foregroundStyle(factionColor)
        }
        .padding(.vertical, 2)
    }
}
