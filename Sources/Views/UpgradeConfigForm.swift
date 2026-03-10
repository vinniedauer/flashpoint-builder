import SwiftUI

/// Shared form for configuring upgrades on a unit.
/// Used by both AddUnitView and EditUpgradesView.
struct UpgradeConfigForm: View {
    let unit: Unit
    let factionColor: Color
    @Binding var selectedUpgrades: [String: [String]]

    @Environment(GameDataStore.self) private var gameData

    private var previewEntry: ArmyEntry {
        ArmyEntry(unitId: unit.id, selectedUpgrades: selectedUpgrades)
    }

    private var totalPoints: Int {
        gameData.entryPoints(previewEntry)
    }

    var body: some View {
        Form {
            // Header: unit name + live point total
            Section {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Label(unit.type.displayName, systemImage: unit.type.systemImage)
                            .font(.caption)
                            .foregroundStyle(factionColor)
                        Text(unit.description)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(totalPoints)")
                            .font(.system(size: 32, weight: .bold, design: .rounded))
                            .foregroundStyle(factionColor)
                            .contentTransition(.numericText())
                            .animation(.easeInOut(duration: 0.2), value: totalPoints)
                        Text("pts")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }

            if unit.upgradeSlots.isEmpty {
                Section {
                    Text("No upgrades available for this unit.")
                        .foregroundStyle(.secondary)
                        .italic()
                }
            } else {
                ForEach(unit.upgradeSlots) { slot in
                    upgradeSlotSection(slot)
                }
            }
        }
    }

    @ViewBuilder
    private func upgradeSlotSection(_ slot: UpgradeSlot) -> some View {
        let headerText = slot.name + (slot.required ? " (Required)" : "")
        let footerText = slot.maxSelections > 1
            ? "Pick up to \(slot.maxSelections)"
            : "Pick one"

        Section {
            if let slotType = slot.slotType {
                ForEach(gameData.weapons(for: slotType)) { weapon in
                    weaponRow(weapon, in: slot)
                }
            } else {
                ForEach(slot.options) { upgrade in
                    upgradeRow(upgrade, in: slot)
                }
            }
        } header: {
            Text(headerText)
        } footer: {
            Text(footerText)
                .font(.caption)
        }
    }

    @ViewBuilder
    private func upgradeRow(_ upgrade: Upgrade, in slot: UpgradeSlot) -> some View {
        let isSelected = selectedUpgrades[slot.id]?.contains(upgrade.id) ?? false

        Button {
            toggle(upgrade.id, in: slot)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? factionColor : Color.secondary)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 2) {
                    Text(upgrade.name)
                        .foregroundStyle(.primary)
                    if !upgrade.description.isEmpty {
                        Text(upgrade.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                if upgrade.pointCost > 0 {
                    Text("+\(upgrade.pointCost)")
                        .font(.subheadline.bold())
                        .foregroundStyle(factionColor)
                } else {
                    Text("Free")
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private func weaponRow(_ weapon: WeaponUpgrade, in slot: UpgradeSlot) -> some View {
        let isSelected = selectedUpgrades[slot.id]?.contains(weapon.id) ?? false

        Button {
            toggle(weapon.id, in: slot)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? factionColor : Color.secondary)
                    .font(.title3)

                Text(weapon.name)
                    .foregroundStyle(.primary)

                Spacer()

                if weapon.pointCost > 0 {
                    Text("+\(weapon.pointCost)")
                        .font(.subheadline.bold())
                        .foregroundStyle(factionColor)
                } else {
                    Text("Free")
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private func toggle(_ upgradeId: String, in slot: UpgradeSlot) {
        var current = selectedUpgrades[slot.id] ?? []
        if current.contains(upgradeId) {
            current.removeAll { $0 == upgradeId }
        } else if slot.maxSelections == 1 {
            current = [upgradeId]
        } else if current.count < slot.maxSelections {
            current.append(upgradeId)
        }
        if current.isEmpty {
            selectedUpgrades.removeValue(forKey: slot.id)
        } else {
            selectedUpgrades[slot.id] = current
        }
    }
}
