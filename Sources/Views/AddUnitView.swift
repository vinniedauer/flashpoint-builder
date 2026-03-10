import SwiftUI

struct AddUnitView: View {
    let listId: UUID

    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @Environment(\.dismiss) private var dismiss

    @State private var configuringUnit: Unit?
    @State private var selectedUpgrades: [String: [String]] = [:]

    private var list: ArmyList? { store.lists.first { $0.id == listId } }
    private var faction: Faction? { list.flatMap { gameData.faction($0.factionId) } }

    var body: some View {
        NavigationStack {
            Group {
                if let unit = configuringUnit {
                    UpgradeConfigForm(
                        unit: unit,
                        factionColor: Color(hex: faction?.colorHex ?? "#888888"),
                        selectedUpgrades: $selectedUpgrades
                    )
                } else {
                    unitPickerList
                }
            }
            .navigationTitle(configuringUnit == nil ? "Add Unit" : (configuringUnit?.name ?? ""))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if configuringUnit != nil {
                        Button("Back") {
                            configuringUnit = nil
                            selectedUpgrades = [:]
                        }
                    } else {
                        Button("Cancel") { dismiss() }
                    }
                }
                if configuringUnit != nil {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Add to List") { addUnit() }
                    }
                }
            }
        }
    }

    private var unitPickerList: some View {
        List {
            if let faction {
                let grouped = Dictionary(grouping: faction.units, by: { $0.type })
                let order: [UnitType] = [.hero, .infantry, .vehicle, .support]

                ForEach(order, id: \.self) { type in
                    if let units = grouped[type], !units.isEmpty {
                        Section(type.displayName) {
                            ForEach(units) { unit in
                                let isConflict = list.map { gameData.isUniqueConflict(unitId: unit.id, in: $0) } ?? false
                                Button {
                                    if !isConflict {
                                        configuringUnit = unit
                                        selectedUpgrades = [:]
                                    }
                                } label: {
                                    HStack {
                                        UnitSelectRow(unit: unit, factionColor: Color(hex: faction.colorHex))
                                        if isConflict {
                                            Spacer()
                                            Text("Unique — already in list")
                                                .font(.caption)
                                                .foregroundStyle(.orange)
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                                .disabled(isConflict)
                            }
                        }
                    }
                }
            }
        }
    }

    private func addUnit() {
        guard let unit = configuringUnit, var list else { return }
        let entry = ArmyEntry(unitId: unit.id, selectedUpgrades: selectedUpgrades)
        list.entries.append(entry)
        store.updateList(list)
        dismiss()
    }
}
