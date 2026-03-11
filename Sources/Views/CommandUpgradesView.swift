import SwiftUI

struct CommandUpgradesView: View {
    let upgrades: [CommandUpgrade]
    let factionColor: Color
    @Binding var selectedIds: [String]

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(upgrades) { upgrade in
                        let isSelected = selectedIds.contains(upgrade.id)

                        Button {
                            if isSelected {
                                selectedIds.removeAll { $0 == upgrade.id }
                            } else {
                                selectedIds.append(upgrade.id)
                            }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(isSelected ? factionColor : .secondary)
                                    .font(.title3)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(upgrade.name)
                                        .foregroundStyle(.primary)
                                    Text(upgrade.detail)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }

                                Spacer()

                                Text("\(upgrade.pointCost) pts")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(factionColor)
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                } header: {
                    Text("Each upgrade may be taken once")
                } footer: {
                    Text("Command upgrades apply to the whole fireteam, not individual soldiers.")
                        .font(.caption)
                }
            }
            .navigationTitle("Command Upgrades")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
