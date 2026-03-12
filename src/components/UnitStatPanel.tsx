import { useState } from 'react'
import type { UnitStats, KeywordEntry } from '../types/game'
import KeywordModal from './KeywordModal'

interface Props {
  stats: UnitStats
  factionColor: string
  keywords?: KeywordEntry[]
}

function baseKeyword(kw: string): string {
  return kw.replace(/\s*\(\d+\)$/, '').trim()
}

export default function UnitStatPanel({ stats, factionColor, keywords }: Props) {
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
                    borderColor: factionColor + '60',
                    color: factionColor,
                    backgroundColor: factionColor + '1E',
                    cursor: hasDesc ? 'pointer' : 'default',
                  }}
                >
                  {kw}
                </button>
              )
            })}
          </div>
        )}

        {/* Weapons */}
        <div className="space-y-1.5">
          {stats.weapons.map((w) => (
            <div key={w.name} className="flex items-baseline justify-between gap-2">
              <span className="font-display text-sm text-text-secondary truncate">{w.name}</span>
              <div className="flex items-baseline gap-2 shrink-0">
                <span className="font-mono text-xs text-text-muted">{w.range}</span>
                <span className="font-mono text-xs text-text-muted">A{w.attacks}</span>
                {w.special && (
                  <span className="font-display text-xs text-text-muted italic">{w.special}</span>
                )}
              </div>
            </div>
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
