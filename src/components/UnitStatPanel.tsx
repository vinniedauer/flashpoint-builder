import type { UnitStats } from '../types/game'

interface Props {
  stats: UnitStats
  factionColor: string
}

export default function UnitStatPanel({ stats, factionColor }: Props) {
  return (
    <div className="border-t border-border px-4 py-3" style={{ backgroundColor: factionColor + '0C' }}>
      {/* Stat grid */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {[
          { label: 'HP', value: stats.hp },
          { label: 'RA', value: stats.ra },
          { label: 'FI', value: stats.fi },
          { label: 'SV', value: stats.sv },
          { label: 'CR', value: stats.courage },
          { label: 'ADV', value: stats.advance },
          { label: 'SPR', value: stats.sprint },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="font-mono text-sm font-bold" style={{ color: factionColor }}>
              {value}
            </span>
            <span className="font-display text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
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
  )
}
