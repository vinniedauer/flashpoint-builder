import { useState } from 'react'
import type { FireteamEntry, Unit, WeaponUpgrade } from '../types/game'
import { entryPoints } from '../utils/points'
import SwipeToDelete from './SwipeToDelete'

interface Props {
  entry: FireteamEntry
  unit: Unit
  weaponUpgrades: WeaponUpgrade[]
  factionColor: string
  onClick: () => void
  onDelete: () => void
}

export default function EntryRow({ entry, unit, weaponUpgrades, factionColor, onClick, onDelete }: Props) {
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

          {/* Stats toggle — only if stats exist */}
          {stats && (
            <button
              onClick={() => setShowStats((v) => !v)}
              className="px-3 border-l border-border flex items-center justify-center shrink-0 hover:bg-surface-hover transition-all"
              title="Unit stats"
              style={{ color: showStats ? factionColor : undefined }}
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
                className="transition-transform"
                style={{ transform: showStats ? 'rotate(180deg)' : 'none', color: showStats ? factionColor : '#60607A' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats panel */}
        {stats && showStats && (
          <div className="border-t border-border px-4 py-3" style={{ backgroundColor: factionColor + '0C' }}>
            {/* Stat grid */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {[
                { label: 'HP', value: stats.hp },
                { label: 'RA', value: stats.ra },
                { label: 'FI', value: stats.fi },
                { label: 'SV', value: stats.sv },
                { label: 'SH', value: (() => { const m = stats.keywords.find(k => k.startsWith('Energy Shield')); return m ? m.match(/\((\d+)\)/)?.[1] ?? '—' : '—' })() },
                { label: 'CR', value: stats.courage },
                { label: 'RNG', value: stats.range },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="font-mono text-xs font-bold" style={{ color: factionColor }}>
                    {value}
                  </span>
                  <span className="font-display text-[9px] uppercase tracking-widest text-text-muted mt-0.5">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Keywords */}
            {stats.keywords.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {stats.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="font-display text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
                    style={{ borderColor: factionColor + '40', color: factionColor + 'CC', backgroundColor: factionColor + '10' }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Weapons */}
            <div className="space-y-1">
              {stats.weapons.map((w) => (
                <div key={w.name} className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-xs text-text-secondary truncate">{w.name}</span>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-text-muted">{w.range}</span>
                    <span className="font-mono text-[10px] text-text-muted">A{w.attacks}</span>
                    {w.special && (
                      <span className="font-display text-[9px] text-text-muted italic">{w.special}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop-only hover × — hidden on touch devices */}
      <button
        onClick={onDelete}
        className="hover-only absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-[#C0392B] text-xl leading-none transition-all px-1 z-20"
        title="Remove"
      >
        ×
      </button>
    </SwipeToDelete>
  )
}
