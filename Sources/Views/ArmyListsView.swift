import SwiftUI

struct ArmyListsView: View {
    @Environment(ArmyListStore.self) private var store
    @Environment(GameDataStore.self) private var gameData
    @State private var showingNewList = false

    private var sortedLists: [ArmyList] {
        store.lists.sorted { $0.modifiedAt > $1.modifiedAt }
    }

    var body: some View {
        Group {
            if store.lists.isEmpty {
                emptyState
            } else {
                listContent
            }
        }
        .navigationTitle("My Fireteams")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showingNewList = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingNewList) {
            NewArmyListView()
        }
    }

    private var emptyState: some View {
        ContentUnavailableView {
            Label("No Fireteams", systemImage: "person.3")
        } description: {
            Text("Create your first fireteam to get started.")
        } actions: {
            Button("New Fireteam") {
                showingNewList = true
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private var listContent: some View {
        List {
            ForEach(sortedLists) { list in
                NavigationLink {
                    ArmyListDetailView(listId: list.id)
                } label: {
                    ArmyListRow(list: list)
                }
            }
            .onDelete { offsets in
                store.deleteLists(at: offsets, in: sortedLists)
            }
        }
    }
}
