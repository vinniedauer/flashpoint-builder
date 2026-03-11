import type { FireteamEntry, Unit, WeaponUpgrade, Fireteam, GameData } from '../types/game'

export function entryPoints(
  entry: FireteamEntry,
  unit: Unit,
  weaponUpgrades: WeaponUpgrade[]
): number {
  let total = unit.pointCost

  for (const slot of unit.upgradeSlots) {
    const selectedIds = entry.selectedUpgrades[slot.id] ?? []

    if (slot.slotType === 'weapon_melee' || slot.slotType === 'weapon_ranged') {
      const category = slot.slotType === 'weapon_melee' ? 'melee' : 'ranged'
      for (const id of selectedIds) {
        const weapon = weaponUpgrades.find(
          (w) => w.id === id && w.category === category
        )
        if (weapon) {
          total += weapon.pointCost
        }
      }
    } else {
      for (const id of selectedIds) {
        const upgrade = slot.options.find((o) => o.id === id)
        if (upgrade) {
          total += upgrade.pointCost
        }
      }
    }
  }

  return total
}

export function fireteamPoints(fireteam: Fireteam, gameData: GameData): number {
  const faction = gameData.factions.find((f) => f.id === fireteam.factionId)
  if (!faction) return 0

  let total = 0

  for (const entry of fireteam.entries) {
    const unit = faction.units.find((u) => u.id === entry.unitId)
    if (unit) {
      total += entryPoints(entry, unit, gameData.weaponUpgrades)
    }
  }

  for (const orderId of fireteam.selectedSpecialOrderIds) {
    const order = faction.specialOrders.find((o) => o.id === orderId)
    if (order) {
      total += order.pointCost
    }
  }

  for (const upgradeId of fireteam.selectedCommandUpgradeIds) {
    const upgrade = gameData.commandUpgrades.find((c) => c.id === upgradeId)
    if (upgrade) {
      total += upgrade.pointCost
    }
  }

  return total
}
