import { useState } from 'react'
import type { UnitStats, KeywordEntry, WeaponUpgrade, WeaponProfile } from '../types/game'
import KeywordModal from './KeywordModal'

interface Props {
  stats: UnitStats
  factionColor: string
  keywords?: KeywordEntry[]
  selectedRangedWeapon?: WeaponUpgrade
  selectedMeleeWeapon?: WeaponUpgrade
  extraWeaponProfiles?: WeaponProfile[]
}

function baseKeyword(kw: string): string {
  return kw.replace(/\s*\(\d+\)$/, '').trim()
}

function WeaponProfileRow({ profile: p, factionColor }: { profile: WeaponProfile; factionColor: string }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-sm" style={{ color: factionColor }}>{p.name}</span>
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-mono text-xs text-text-muted">{p.range}</span>
          {p.ap !== '-' && <span className="font-mono text-xs text-text-muted">AP{p.ap}</span>}
        </div>
      </div>
      {p.special && (
        <p className="font-display text-xs text-text-muted italic">{p.special}</p>
      )}
    </div>
  )
}

export default function UnitStatPanel({ stats, factionColor, keywords, selectedRangedWeapon, selectedMeleeWeapon, extraWeaponProfiles }: Props) {
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null)

  const handleBadgeClick = (kw: string) => {
    if (!keywords) return
    const base = baseKeyword(kw)
    const entry = keywords.find((k) => k.name.toLowerCase() === base.toLowerCase())
    if (entry) setActiveKeyword(kw)
  }

  const activeEntry = activeKeyword
    ? keywords?.find((k) => k.name.toLowerCase() === baseKeyword(activeKeyword).toLowerCase())
    : null

  return (
    <>
      <div className="border-t border-border px-4 py-3" style={{ backgroundColor: factionColor + '0C' }}>
        {/* Stat grid */}
        <div className="grid grid-cols-6 gap-1 mb-3">
          {[
            { label: 'HP', value: stats.hp },
            { label: 'RA', value: stats.ra },
            { label: 'FI', value: stats.fi },
            { label: 'SV', value: stats.sv },
            { label: 'SH', value: stats.shields },
            { label: 'MV', value: `${stats.advance}-${stats.sprint}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-mono text-sm font-bold" style={{ color: factionColor }}>
                {value}
              </span>
              <span className="font-display text-xs uppercase tracking-widest text-text-muted mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Keywords */}
        {stats.keywords.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {stats.keywords.map((kw) => {
              const hasDesc = keywords?.some(
                (k) => k.name.toLowerCase() === baseKeyword(kw).toLowerCase()
              )
              return (
                <button
                  key={kw}
                  onClick={() => handleBadgeClick(kw)}
                  disabled={!hasDesc}
                  className="font-display text-xs uppercase tracking-wider px-1.5 py-0.5 rounded border transition-opacity"
                  style={{
                    borderColor: factionColor + '90',
                    color: '#FFFFFF',
                    backgroundColor: factionColor + '55',
                    cursor: hasDesc ? 'pointer' : 'default',
                  }}
                >
                  {kw}
                </button>
              )
            })}
          </div>
        )}

        {/* Weapons — only from selections, never from default stats.weapons */}
        <div className="space-y-1.5">
          {/* Selected weapon upgrade profiles (weapon_ranged / weapon_melee slots) */}
          {[selectedRangedWeapon, selectedMeleeWeapon].flatMap((wu) =>
            (wu?.profiles ?? []).map((p) => (
              <WeaponProfileRow key={`${wu!.id}-${p.name}`} profile={p} factionColor={factionColor} />
            ))
          )}
          {/* Extra profiles from loadout / CCW / grenade options */}
          {(extraWeaponProfiles ?? []).map((p, i) => (
            <WeaponProfileRow key={`extra-${i}-${p.name}`} profile={p} factionColor={factionColor} />
          ))}
        </div>
      </div>

      {activeEntry && (
        <KeywordModal
          name={activeEntry.name}
          description={activeEntry.description}
          factionColor={factionColor}
          onClose={() => setActiveKeyword(null)}
        />
      )}
    </>
  )
}
