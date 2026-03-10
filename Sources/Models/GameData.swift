import Foundation

struct GameData: Codable {
    let factions: [Faction]
    let weaponUpgrades: [WeaponUpgrade]

    func faction(id: String) -> Faction? {
        factions.first { $0.id == id }
    }

    func unit(id: String) -> Unit? {
        for faction in factions {
            if let unit = faction.units.first(where: { $0.id == id }) {
                return unit
            }
        }
        return nil
    }

    func weaponUpgrade(id: String) -> WeaponUpgrade? {
        weaponUpgrades.first { $0.id == id }
    }
}

struct Faction: Codable, Identifiable {
    let id: String
    let name: String
    let colorHex: String
    let units: [Unit]
    let specialOrders: [SpecialOrder]
}

struct SpecialOrder: Codable, Identifiable {
    let id: String
    let name: String
    let pointCost: Int
    let restriction: String
}

struct WeaponUpgrade: Codable, Identifiable {
    let id: String
    let name: String
    let pointCost: Int
    let category: WeaponCategory
}

enum WeaponCategory: String, Codable {
    case melee
    case ranged
}

struct Unit: Codable, Identifiable {
    let id: String
    let name: String
    let pointCost: Int
    let type: UnitType
    let description: String
    let upgradeSlots: [UpgradeSlot]
    /// If true, only one of this unit may be included in a fireteam.
    let unique: Bool?
}

enum UnitType: String, Codable, CaseIterable {
    case hero
    case infantry
    case vehicle
    case support

    var displayName: String {
        switch self {
        case .hero: return "Hero"
        case .infantry: return "Infantry"
        case .vehicle: return "Vehicle"
        case .support: return "Support"
        }
    }

    var systemImage: String {
        switch self {
        case .hero: return "crown.fill"
        case .infantry: return "figure.walk"
        case .vehicle: return "car.fill"
        case .support: return "wrench.fill"
        }
    }
}

struct UpgradeSlot: Codable, Identifiable {
    let id: String
    let name: String
    let required: Bool
    let maxSelections: Int
    let options: [Upgrade]
    /// When set, options are pulled from the global weapon upgrades list instead of `options`.
    let slotType: WeaponSlotType?
}

enum WeaponSlotType: String, Codable {
    case melee = "weapon_melee"
    case ranged = "weapon_ranged"
}

struct Upgrade: Codable, Identifiable {
    let id: String
    let name: String
    let pointCost: Int
    let description: String
}
