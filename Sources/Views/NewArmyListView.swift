import SwiftUI

struct NewArmyListView: View {
    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var selectedFactionId = ""
    @State private var pointBudget = 200

    private var isValid: Bool { !selectedFactionId.isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                Section("Fireteam Details") {
                    TextField("Name (optional)", text: $name)
                    Picker("Faction", selection: $selectedFactionId) {
                        ForEach(gameData.factions) { faction in
                            Text(faction.name).tag(faction.id)
                        }
                    }
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
        .onAppear {
            if selectedFactionId.isEmpty {
                selectedFactionId = gameData.factions.first?.id ?? ""
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
