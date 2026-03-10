import SwiftUI

struct WeaponPoolView: View {
    let factionColor: Color
    let allWeapons: [WeaponUpgrade]
    @Binding var selectedIds: [String]

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(allWeapons) { weapon in
                        let isSelected = selectedIds.contains(weapon.id)

                        Button {
                            if isSelected {
                                selectedIds.removeAll { $0 == weapon.id }
                            } else {
                                selectedIds.append(weapon.id)
                            }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(isSelected ? factionColor : .secondary)
                                    .font(.title3)

                                Text(weapon.name)
                                    .foregroundStyle(.primary)

                                Spacer()

                                Text("\(weapon.pointCost) pts")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(factionColor)
                            }
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                } header: {
                    Text("Each weapon can be used by one soldier per game")
                } footer: {
                    Text("Weapons are assigned to soldiers at deployment, not list-building time.")
                        .font(.caption)
                }
            }
            .navigationTitle("Weapon Pool")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
