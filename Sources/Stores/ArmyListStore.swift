import Foundation
import Observation

@Observable
final class ArmyListStore {
    var lists: [ArmyList] = []

    private static var saveURL: URL {
        URL.documentsDirectory.appending(path: "army_lists.json")
    }

    init() {
        load()
    }

    // MARK: - Persistence

    func save() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        guard let data = try? encoder.encode(lists) else { return }
        try? data.write(to: Self.saveURL, options: .atomic)
    }

    private func load() {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        guard
            let data = try? Data(contentsOf: Self.saveURL),
            let loaded = try? decoder.decode([ArmyList].self, from: data)
        else { return }
        lists = loaded
    }

    // MARK: - Mutations

    func addList(_ list: ArmyList) {
        lists.append(list)
        save()
    }

    func updateList(_ list: ArmyList) {
        guard let idx = lists.firstIndex(where: { $0.id == list.id }) else { return }
        var updated = list
        updated.modifiedAt = Date()
        lists[idx] = updated
        save()
    }

    func deleteList(_ list: ArmyList) {
        lists.removeAll { $0.id == list.id }
        save()
    }

    func deleteLists(at offsets: IndexSet, in sorted: [ArmyList]) {
        let toDelete = offsets.map { sorted[$0] }
        for list in toDelete { deleteList(list) }
    }
}
