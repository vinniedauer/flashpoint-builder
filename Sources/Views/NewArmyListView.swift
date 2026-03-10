import SwiftUI

struct NewArmyListView: View {
    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @Environment(\.dismiss) private var dismiss

    let defaultFactionId: String

    @State private var name = ""
    @State private var selectedFactionId: String
    @State private var pointBudget = 200

    init(defaultFactionId: String) {
        self.defaultFactionId = defaultFactionId
        _selectedFactionId = State(initialValue: defaultFactionId)
    }

    private var isValid: Bool { !selectedFactionId.isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                Section("Fireteam Details") {
                    TextField("Name (optional)", text: $name)
                }

                Section("Faction") {
                    HStack(spacing: 12) {
                        ForEach(gameData.factions) { faction in
                            Button {
                                selectedFactionId = faction.id
                            } label: {
                                Text(faction.name)
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .tint(selectedFactionId == faction.id ? .accentColor : .secondary)
                        }
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                }

                Section {
                    Stepper("Budget: \(pointBudget) pts", value: $pointBudget, in: 100...500, step: 25)
                } header: {
                    Text("Point Budget")
                } footer: {
                    Text("Common game sizes: 150 (small), 200 (standard), 250 (large)")
                }

                Section {
                    HStack(spacing: 12) {
                        ForEach([150, 200, 250], id: \.self) { preset in
                            Button {
                                pointBudget = preset
                            } label: {
                                Text("\(preset)")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .tint(pointBudget == preset ? .accentColor : .secondary)
                        }
                    }
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                }
            }
            .navigationTitle("New Fireteam")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") { createList() }
                        .disabled(!isValid)
                }
            }
        }
    }

    private func createList() {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        let factionName = gameData.faction(selectedFactionId)?.name ?? "New"
        let finalName = trimmed.isEmpty ? "\(factionName) Fireteam" : trimmed
        let list = ArmyList(name: finalName, factionId: selectedFactionId, pointBudget: pointBudget)
        store.addList(list)
        dismiss()
    }
}
