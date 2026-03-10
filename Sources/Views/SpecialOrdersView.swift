import SwiftUI

struct SpecialOrdersView: View {
    let faction: Faction
    @Binding var selectedIds: [String]

    @Environment(\.dismiss) private var dismiss

    private let max = 3

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(faction.specialOrders) { order in
                        let isSelected = selectedIds.contains(order.id)
                        let atMax = selectedIds.count >= max && !isSelected

                        Button {
                            if isSelected {
                                selectedIds.removeAll { $0 == order.id }
                            } else if !atMax {
                                selectedIds.append(order.id)
                            }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(isSelected ? Color(hex: faction.colorHex) : .secondary)
                                    .font(.title3)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(order.name)
                                        .foregroundStyle(.primary)
                                    Text(order.restriction)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }

                                Spacer()

                                Text("\(order.pointCost) pts")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(Color(hex: faction.colorHex))
                            }
                            .contentShape(Rectangle())
                            .opacity(atMax ? 0.4 : 1)
                        }
                        .buttonStyle(.plain)
                    }
                } header: {
                    Text("Select 1–3 Special Orders")
                } footer: {
                    if selectedIds.isEmpty {
                        Label("At least one Special Order is required.", systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Special Orders")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
