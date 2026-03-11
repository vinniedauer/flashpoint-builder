import Foundation
import Observation

@Observable
final class GameDataStore {
    let gameData: GameData

    init() {
        guard let url = Bundle.main.url(forResource: "game_data", withExtension: "json") else {
            print("❌ game_data.json not found in bundle")
            self.gameData = GameData(factions: [], weaponUpgrades: [], commandUpgrades: [])
            return
        }
        guard let data = try? Data(contentsOf: url) else {
            print("❌ Failed to read game_data.json")
            self.gameData = GameData(factions: [], weaponUpgrades: [], commandUpgrades: [])
            return
        }
        do {
            self.gameData = try JSONDecoder().decode(GameData.self, from: data)
            print("✅ Loaded \(self.gameData.factions.count) factions, \(self.gameData.weaponUpgrades.count) weapons")
        } catch {
            print("❌ JSON decode error: \(error)")
            self.gameData = GameData(factions: [], weaponUpgrades: [], commandUpgrades: [])
        }
    }

    var factions: [Faction] { gameData.factions }
    var weaponUpgrades: [WeaponUpgrade] { gameData.weaponUpgrades }
    var commandUpgrades: [CommandUpgrade] { gameData.commandUpgrades }

    func faction(_ id: String) -> Faction? { gameData.faction(id: id) }
    func unit(_ id: String) -> Unit? { gameData.unit(id: id) }

    func weapons(for slotType: WeaponSlotType) -> [WeaponUpgrade] {
        gameData.weaponUpgrades.filter { $0.category.rawValue == slotType.rawValue.replacingOccurrences(of: "weapon_", with: "") }
    }

    // MARK: - Point calculations

    func entryPoints(_ entry: ArmyEntry) -> Int {
        guard let unit = unit(entry.unitId) else { return 0 }
        var total = unit.pointCost
        for slot in unit.upgradeSlots {
            let selectedIds = entry.selectedUpgrades[slot.id] ?? []
            if let slotType = slot.slotType {
                // Weapon slots: look up cost from the global weapon upgrades list
                let pool = weapons(for: slotType)
                for id in selectedIds {
                    total += pool.first { $0.id == id }?.pointCost ?? 0
                }
            } else {
                // Normal upgrade slot
                for upgrade in slot.options where selectedIds.contains(upgrade.id) {
                    total += upgrade.pointCost
                }
            }
        }
        return total
    }

    func specialOrderPoints(_ list: ArmyList) -> Int {
        guard let faction = faction(list.factionId) else { return 0 }
        return list.selectedSpecialOrderIds.reduce(0) { total, id in
            total + (faction.specialOrders.first { $0.id == id }?.pointCost ?? 0)
        }
    }

    func commandUpgradePoints(_ list: ArmyList) -> Int {
        list.selectedCommandUpgradeIds.reduce(0) { total, id in
            total + (gameData.commandUpgrades.first { $0.id == id }?.pointCost ?? 0)
        }
    }

    func listPoints(_ list: ArmyList) -> Int {
        list.entries.reduce(0) { $0 + entryPoints($1) } + specialOrderPoints(list) + commandUpgradePoints(list)
    }

    // MARK: - Uniqueness

    /// Returns true if this unit is unique and already present in the list.
    func isUniqueConflict(unitId: String, in list: ArmyList) -> Bool {
        guard unit(unitId)?.unique == true else { return false }
        return list.entries.contains { $0.unitId == unitId }
    }
}
