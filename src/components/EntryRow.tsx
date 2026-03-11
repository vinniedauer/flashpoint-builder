import type { FireteamEntry, Unit, WeaponUpgrade } from '../types/game'
import { entryPoints } from '../utils/points'

interface Props {
  entry: FireteamEntry
  unit: Unit
  weaponUpgrades: WeaponUpgrade[]
  factionColor: string
  onClick: () => void
  onDelete: () => void
}

export default function EntryRow({ entry, unit, weaponUpgrades, factionColor, onClick, onDelete }: Props) {
  const pts = entryPoints(entry, unit, weaponUpgrades)

  // Collect all selected upgrade names for display
  const upgradeNames: string[] = []
  for (const slot of unit.upgradeSlots) {
    const selectedIds = entry.selectedUpgrades[slot.id] ?? []
    if (slot.slotType === 'weapon_melee' || slot.slotType === 'weapon_ranged') {
      const category = slot.slotType === 'weapon_melee' ? 'melee' : 'ranged'
      for (const id of selectedIds) {
        const w = weaponUpgrades.find((wu) => wu.id === id && wu.category === category)
        if (w) upgradeNames.push(w.name)
      }
    } else {
      for (const id of selectedIds) {
        const u = slot.options.find((o) => o.id === id)
        if (u) upgradeNames.push(u.name)
      }
    }
  }

  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onClick}
        className="flex-1 text-left bg-surface-hi border border-border rounded-lg px-4 py-3 hover:bg-surface-hover hover:border-text-muted transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-text-primary uppercase tracking-wide text-sm">
            {unit.name}
          </span>
          <span className="font-mono text-sm" style={{ color: factionColor }}>
            {pts} pts
          </span>
        </div>
        {upgradeNames.length > 0 && (
          <p className="text-text-muted font-display text-xs mt-1 truncate">
            {upgradeNames.join(' · ')}
          </p>
        )}
      </button>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-[#C0392B] text-xl leading-none transition-all px-1"
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}
