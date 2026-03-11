import SwiftUI

struct ArmyListDetailView: View {
    let listId: UUID

    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @State private var showingAddUnit = false
    @State private var editingEntry: ArmyEntry?
    @State private var showingSpecialOrders = false
    @State private var showingCommandUpgrades = false

    private var list: ArmyList? {
        store.lists.first { $0.id == listId }
    }

    var body: some View {
        Group {
            if let list {
                listContent(list)
            } else {
                ContentUnavailableView("Fireteam Not Found", systemImage: "questionmark.circle")
            }
        }
    }

    @ViewBuilder
    private func listContent(_ list: ArmyList) -> some View {
        let totalPoints = gameData.listPoints(list)
        let faction = gameData.faction(list.factionId)
        let factionColor = Color(hex: faction?.colorHex ?? "#888888")

        // Bindable proxy — we mutate via store methods
        List {
            // Budget summary
            Section {
                BudgetSummaryView(
                    totalPoints: totalPoints,
                    budget: list.pointBudget,
                    factionColor: factionColor
                )
                .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16))
                .listRowBackground(Color.clear)
            }

            // Special Orders
            Section {
                if list.selectedSpecialOrderIds.isEmpty {
                    Text("None selected — at least 1 required")
                        .foregroundStyle(.orange)
                        .font(.subheadline)
                } else if let faction {
                    ForEach(list.selectedSpecialOrderIds, id: \.self) { id in
                        if let order = faction.specialOrders.first(where: { $0.id == id }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(order.name)
                                    Text(order.restriction)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(order.pointCost) pts")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(factionColor)
                            }
                        }
                    }
                }

                Button {
                    showingSpecialOrders = true
                } label: {
                    Label("Edit Special Orders", systemImage: "pencil.circle.fill")
                        .foregroundStyle(factionColor)
                }
            } header: {
                HStack {
                    Text("Special Orders")
                    Spacer()
                    Text("\(gameData.specialOrderPoints(list)) pts")
                        .font(.caption.bold())
                        .foregroundStyle(factionColor)
                }
            }

            // Command Upgrades
            Section {
                if list.selectedCommandUpgradeIds.isEmpty {
                    Text("None selected")
                        .foregroundStyle(.secondary)
                        .font(.subheadline)
                } else {
                    ForEach(list.selectedCommandUpgradeIds, id: \.self) { id in
                        if let upgrade = gameData.commandUpgrades.first(where: { $0.id == id }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(upgrade.name)
                                    Text(upgrade.detail)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("\(upgrade.pointCost) pts")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(factionColor)
                            }
                        }
                    }
                }

                Button {
                    showingCommandUpgrades = true
                } label: {
                    Label("Edit Command Upgrades", systemImage: "pencil.circle.fill")
                        .foregroundStyle(factionColor)
                }
            } header: {
                HStack {
                    Text("Command Upgrades")
                    Spacer()
                    Text("\(gameData.commandUpgradePoints(list)) pts")
                        .font(.caption.bold())
                        .foregroundStyle(factionColor)
                }
            }

            // Units
            Section {
                ForEach(list.entries) { entry in
                    Button {
                        editingEntry = entry
                    } label: {
                        ArmyEntryRow(entry: entry, factionColor: factionColor)
                    }
                    .buttonStyle(.plain)
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) {
                            removeEntry(entry, from: list)
                        } label: {
                            Label("Remove", systemImage: "trash")
                        }
                    }
                }

                Button {
                    showingAddUnit = true
                } label: {
                    Label("Add Soldier", systemImage: "plus.circle.fill")
                        .foregroundStyle(factionColor)
                }
            } header: {
                Text("Soldiers (\(list.entries.count))")
            } footer: {
                if list.entries.isEmpty {
                    Text("Tap \"Add Soldier\" to start building your fireteam.")
                }
            }
        }
        .navigationTitle(list.name)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showingAddUnit = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddUnit) {
            AddUnitView(listId: listId)
        }
        .sheet(item: $editingEntry) { entry in
            EditUpgradesView(listId: listId, entryId: entry.id)
        }
        .sheet(isPresented: $showingSpecialOrders) {
            if let faction = gameData.faction(list.factionId) {
                SpecialOrdersSheetWrapper(listId: listId, faction: faction)
            }
        }
        .sheet(isPresented: $showingCommandUpgrades) {
            CommandUpgradesSheetWrapper(listId: listId, factionColor: factionColor)
        }
    }

    private func removeEntry(_ entry: ArmyEntry, from list: ArmyList) {
        var updated = list
        updated.entries.removeAll { $0.id == entry.id }
        store.updateList(updated)
    }
}

// MARK: - Sheet Wrappers (read list from store, bind changes back)

private struct SpecialOrdersSheetWrapper: View {
    let listId: UUID
    let faction: Faction

    @Environment(ArmyListStore.self) private var store
    @State private var selectedIds: [String] = []

    private var list: ArmyList? { store.lists.first { $0.id == listId } }

    var body: some View {
        SpecialOrdersView(faction: faction, selectedIds: $selectedIds)
            .onAppear { selectedIds = list?.selectedSpecialOrderIds ?? [] }
            .onChange(of: selectedIds) { _, newIds in
                guard var updated = list else { return }
                updated.selectedSpecialOrderIds = newIds
                store.updateList(updated)
            }
    }
}

private struct CommandUpgradesSheetWrapper: View {
    let listId: UUID
    let factionColor: Color

    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @State private var selectedIds: [String] = []

    private var list: ArmyList? { store.lists.first { $0.id == listId } }

    var body: some View {
        CommandUpgradesView(
            upgrades: gameData.commandUpgrades,
            factionColor: factionColor,
            selectedIds: $selectedIds
        )
        .onAppear { selectedIds = list?.selectedCommandUpgradeIds ?? [] }
        .onChange(of: selectedIds) { _, newIds in
            guard var updated = list else { return }
            updated.selectedCommandUpgradeIds = newIds
            store.updateList(updated)
        }
    }
}

// MARK: - Budget Summary

private struct BudgetSummaryView: View {
    let totalPoints: Int
    let budget: Int
    let factionColor: Color

    private var remaining: Int { budget - totalPoints }
    private var isOver: Bool { totalPoints > budget }

    var body: some View {
        VStack(spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(totalPoints)")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundStyle(isOver ? .red : factionColor)
                    Text("of \(budget) pts")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(isOver ? "+\(-remaining)" : "\(remaining)")
                        .font(.title.bold())
                        .foregroundStyle(isOver ? .red : .primary)
                    Text(isOver ? "over budget" : "remaining")
                        .font(.caption)
                        .foregroundStyle(isOver ? .red : .secondary)
                }
            }
            PointBudgetBar(current: totalPoints, budget: budget, color: factionColor)
                .frame(height: 8)
        }
    }
}
