export interface KeywordEntry {
  name: string
  description: string
}

export interface GameData {
  factions: Faction[]
  weaponUpgrades: WeaponUpgrade[]
  commandUpgrades: CommandUpgrade[]
  keywords: KeywordEntry[]
}

export interface Faction {
  id: string
  name: string
  colorHex: string
  units: Unit[]
  specialOrders: SpecialOrder[]
}

export interface UnitWeapon {
  name: string
  range: string
  attacks: string
  piercing?: string
  special?: string
}

export interface UnitStats {
  hp: number
  ra: string
  fi: string
  sv: string
  shields: number
  advance: number
  sprint: number
  keywords: string[]
  weapons: UnitWeapon[]
}

export interface Unit {
  id: string
  name: string
  pointCost: number
  type: 'hero' | 'infantry' | 'vehicle' | 'support'
  description: string
  upgradeSlots: UpgradeSlot[]
  unique?: boolean
  stats?: UnitStats
  defaultMeleeProfiles?: WeaponProfile[]
  defaultRangedProfiles?: WeaponProfile[]
}

export interface UpgradeSlot {
  id: string
  name: string
  required: boolean
  maxSelections: number
  options: Upgrade[]
  slotType?: 'weapon_melee' | 'weapon_ranged'
}

export interface Upgrade {
  id: string
  name: string
  pointCost: number
  description: string
  weaponProfiles?: WeaponProfile[]
}

export interface WeaponProfile {
  name: string
  range: string
  ap: string      // '-' or '1','2','3','4'
  special?: string
}

export interface WeaponUpgrade {
  id: string
  name: string
  pointCost: number
  category: 'melee' | 'ranged'
  profiles?: WeaponProfile[]
}

export interface CommandUpgrade {
  id: string
  name: string
  pointCost: number
  detail: string
}

export interface SpecialOrder {
  id: string
  name: string
  pointCost: number
  restriction: string
  description?: string
}

export interface Fireteam {
  id: string
  name: string
  factionId: string
  pointBudget: number
  entries: FireteamEntry[]
  selectedSpecialOrderIds: string[]
  selectedCommandUpgradeIds: string[]
  createdAt: string
  modifiedAt: string
}

export interface FireteamEntry {
  id: string
  unitId: string
  selectedUpgrades: Record<string, string[]>
}
