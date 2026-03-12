import { useState } from 'react'
import type { FireteamEntry, Unit, WeaponUpgrade, KeywordEntry } from '../types/game'
import { entryPoints } from '../utils/points'
import { getDefaultUpgrades, resolveWeapons } from '../utils/upgrades'
import SwipeToDelete from './SwipeToDelete'
import UnitStatPanel from './UnitStatPanel'

interface Props {
  entry: FireteamEntry
  unit: Unit
  weaponUpgrades: WeaponUpgrade[]
  factionColor: string
  keywords?: KeywordEntry[]
  onClick: () => void
  onDelete: () => void
}

export default function EntryRow({ entry, unit, weaponUpgrades, factionColor, keywords, onClick, onDelete }: Props) {
  const [showStats, setShowStats] = useState(false)
  const pts = entryPoints(entry, unit, weaponUpgrades)

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

  const stats = unit.stats

  // Merge default selections (single-option required slots) with explicit selections
  const effectiveUpgrades = { ...getDefaultUpgrades(unit), ...entry.selectedUpgrades }
  const { selectedRangedWeapon, selectedMeleeWeapon, extraWeaponProfiles } =
    resolveWeapons(unit, effectiveUpgrades, weaponUpgrades)

  return (
    <SwipeToDelete onDelete={onDelete} className="rounded-lg group">
      <div className="bg-surface-hi border border-border rounded-lg overflow-hidden">
        {/* Main row */}
        <div className="flex items-stretch">
            <button
            onClick={onClick}
            className="flex-1 text-left px-4 py-3 hover:bg-surface-hover transition-all min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-text-primary uppercase tracking-wide text-sm">
                {unit.name}
              </span>
              <span className="font-mono text-sm shrink-0 ml-2" style={{ color: factionColor }}>
                {pts} pts
              </span>
            </div>
            {upgradeNames.length > 0 && (
              <p className="text-text-muted font-display text-xs mt-1 truncate">
                {upgradeNames.join(' · ')}
              </p>
            )}
          </button>

          {/* Stats toggle */}
          {stats && (
            <button
              onClick={() => setShowStats((v) => !v)}
              className="px-3 border-l border-border flex items-center justify-center shrink-0 hover:bg-surface-hover transition-all"
              title="Unit stats"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: showStats ? 'rotate(180deg)' : 'none', color: showStats ? factionColor : 'var(--color-chevron)', transition: 'transform 0.2s, color 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats panel */}
        {stats && showStats && (
          <UnitStatPanel
            stats={stats}
            factionColor={factionColor}
            keywords={keywords}
            selectedRangedWeapon={selectedRangedWeapon}
            selectedMeleeWeapon={selectedMeleeWeapon}
            extraWeaponProfiles={extraWeaponProfiles}
          />
        )}
      </div>
    </SwipeToDelete>
  )
}
