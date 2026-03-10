import SwiftUI

struct UnitDetailView: View {
    let unit: Unit
    let faction: Faction

    private var factionColor: Color { Color(hex: faction.colorHex) }

    var body: some View {
        List {
            // Unit header
            Section {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Label(unit.type.displayName, systemImage: unit.type.systemImage)
                            .font(.caption.bold())
                            .foregroundStyle(factionColor)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(factionColor.opacity(0.12))
                            .clipShape(Capsule())

                        Text(unit.description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    Spacer(minLength: 16)

                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(unit.pointCost)")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundStyle(factionColor)
                        Text("base pts")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }

            // Upgrades
            if unit.upgradeSlots.isEmpty {
                Section("Upgrades") {
                    Text("No upgrades available.")
                        .foregroundStyle(.secondary)
                        .italic()
                }
            } else {
                ForEach(unit.upgradeSlots) { slot in
                    Section {
                        ForEach(slot.options) { upgrade in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(upgrade.name)
                                        .font(.body)
                                    if !upgrade.description.isEmpty {
                                        Text(upgrade.description)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                Spacer()
                                if upgrade.pointCost > 0 {
                                    Text("+\(upgrade.pointCost) pts")
                                        .font(.subheadline.bold())
                                        .foregroundStyle(factionColor)
                                } else {
                                    Text("Free")
                                        .font(.subheadline)
                                        .foregroundStyle(.tertiary)
                                }
                            }
                        }
                    } header: {
                        HStack {
                            Text(slot.name)
                            Spacer()
                            if slot.required {
                                Text("Required")
                                    .font(.caption)
                                    .foregroundStyle(.red)
                            } else {
                                Text("Optional · pick \(slot.maxSelections == 1 ? "one" : "up to \(slot.maxSelections)")")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle(unit.name)
        .navigationBarTitleDisplayMode(.large)
    }
}
