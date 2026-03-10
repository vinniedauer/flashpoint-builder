import Foundation

struct ArmyList: Codable, Identifiable {
    var id: UUID
    var name: String
    var factionId: String
    var pointBudget: Int
    var entries: [ArmyEntry]
    var selectedSpecialOrderIds: [String]
    var createdAt: Date
    var modifiedAt: Date

    init(
        name: String,
        factionId: String,
        pointBudget: Int,
        entries: [ArmyEntry] = [],
        selectedSpecialOrderIds: [String] = []
    ) {
        self.id = UUID()
        self.name = name
        self.factionId = factionId
        self.pointBudget = pointBudget
        self.entries = entries
        self.selectedSpecialOrderIds = selectedSpecialOrderIds
        self.createdAt = Date()
        self.modifiedAt = Date()
    }

    // Custom decoder for backward compatibility with any previously saved lists
    private enum CodingKeys: String, CodingKey {
        case id, name, factionId, pointBudget, entries, createdAt, modifiedAt
        case selectedSpecialOrderIds
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(UUID.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        factionId = try c.decode(String.self, forKey: .factionId)
        pointBudget = try c.decode(Int.self, forKey: .pointBudget)
        entries = try c.decode([ArmyEntry].self, forKey: .entries)
        createdAt = try c.decode(Date.self, forKey: .createdAt)
        modifiedAt = try c.decode(Date.self, forKey: .modifiedAt)
        selectedSpecialOrderIds = try c.decodeIfPresent([String].self, forKey: .selectedSpecialOrderIds) ?? []
    }
}

struct ArmyEntry: Codable, Identifiable {
    var id: UUID
    var unitId: String
    /// slotId → array of selected upgradeIds (or weaponUpgrade IDs for weapon slots)
    var selectedUpgrades: [String: [String]]

    init(unitId: String, selectedUpgrades: [String: [String]] = [:]) {
        self.id = UUID()
        self.unitId = unitId
        self.selectedUpgrades = selectedUpgrades
    }
}
