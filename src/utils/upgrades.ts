import type { Unit, WeaponUpgrade, WeaponProfile } from '../types/game'

/** Returns pre-selected upgrade IDs for required slots that have exactly one option. */
export function getDefaultUpgrades(unit: Unit): Record<string, string[]> {
  const defaults: Record<string, string[]> = {}
  for (const slot of unit.upgradeSlots) {
    if (slot.required && slot.options.length === 1) {
      defaults[slot.id] = [slot.options[0].id]
    }
  }
  return defaults
}

/** Resolves which weapons are active given a unit's upgrade selections. */
export function resolveWeapons(
  unit: Unit,
  selectedUpgrades: Record<string, string[]>,
  weaponUpgrades: WeaponUpgrade[]
): {
  selectedRangedWeapon?: WeaponUpgrade
  selectedMeleeWeapon?: WeaponUpgrade
  extraWeaponProfiles: WeaponProfile[]
} {
  const rangedSlot = unit.upgradeSlots.find((s) => s.slotType === 'weapon_ranged')
  const meleeSlot = unit.upgradeSlots.find((s) => s.slotType === 'weapon_melee')
  const selectedRangedId = rangedSlot ? (selectedUpgrades[rangedSlot.id] ?? [])[0] : undefined
  const selectedMeleeId = meleeSlot ? (selectedUpgrades[meleeSlot.id] ?? [])[0] : undefined
  const selectedRangedWeapon = selectedRangedId
    ? weaponUpgrades.find((w) => w.id === selectedRangedId && w.category === 'ranged')
    : undefined
  const selectedMeleeWeapon = selectedMeleeId
    ? weaponUpgrades.find((w) => w.id === selectedMeleeId && w.category === 'melee')
    : undefined
  const extraWeaponProfiles = unit.upgradeSlots
    .filter((s) => s.slotType !== 'weapon_ranged' && s.slotType !== 'weapon_melee')
    .flatMap((s) =>
      (selectedUpgrades[s.id] ?? []).flatMap(
        (id) => s.options.find((o) => o.id === id)?.weaponProfiles ?? []
      )
    )
  return { selectedRangedWeapon, selectedMeleeWeapon, extraWeaponProfiles }
}
