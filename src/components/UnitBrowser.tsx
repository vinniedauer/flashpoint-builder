import { useState } from 'react'
import type { GameData, Unit, Faction } from '../types/game'
import UnitDetailModal from './UnitDetailModal'
import UnitStatPanel from './UnitStatPanel'

interface Props {
  gameData: GameData
}

type UnitType = 'hero' | 'infantry' | 'vehicle' | 'support'
const TYPE_ORDER: UnitType[] = ['hero', 'infantry', 'vehicle', 'support']
const TYPE_LABELS: Record<UnitType, string> = {
  hero: 'Heroes',
  infantry: 'Infantry',
  vehicle: 'Vehicles',
  support: 'Support',
}

export default function UnitBrowser({ gameData }: Props) {
  const [selectedFactionId, setSelectedFactionId] = useState(gameData.factions[0]?.id ?? '')
  const [selectedUnit, setSelectedUnit] = useState<{ unit: Unit; faction: Faction } | null>(null)
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null)

  const faction = gameData.factions.find((f) => f.id === selectedFactionId)

  const grouped = faction
    ? TYPE_ORDER.reduce<Record<string, Unit[]>>((acc, type) => {
        const units = faction.units.filter((u) => u.type === type)
        if (units.length) acc[type] = units
        return acc
      }, {})
    : {}

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-text-primary mb-4">
          Units
        </h1>

        {/* Faction toggle */}
        <div className="flex gap-2">
          {gameData.factions.map((f) => (
            <button
              key={f.id}
              onClick={() => { setSelectedFactionId(f.id); setExpandedStatId(null) }}
              className="flex-1 py-2.5 rounded-lg border font-display font-semibold uppercase tracking-wider text-sm transition-all"
              style={{
                borderColor: selectedFactionId === f.id ? f.colorHex : '#2C2C40',
                backgroundColor: selectedFactionId === f.id ? f.colorHex + '22' : '#1C1C2C',
                color: selectedFactionId === f.id ? f.colorHex : '#6870A0',
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Units list */}
      <div className="flex-1 overflow-y-auto pl-4 pr-4 md:pr-16 pb-4 space-y-5">
        {Object.entries(grouped).map(([type, units]) => (
          <div key={type}>
            <div className="text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
              {TYPE_LABELS[type as UnitType]}
            </div>
            <div className="space-y-1">
              {units.map((unit) => {
                const statsOpen = expandedStatId === unit.id
                return (
                  <div
                    key={unit.id}
                    className="rounded-lg border border-border bg-surface overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      <button
                        onClick={() => setSelectedUnit({ unit, faction: faction! })}
                        className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-all text-left min-w-0"
                      >
                        <div className="min-w-0">
                          <span className="font-display font-semibold text-text-primary text-sm uppercase tracking-wide">
                            {unit.name}
                          </span>
                          {unit.unique && (
                            <span className="ml-2 text-xs text-text-muted font-display uppercase tracking-wider">
                              Unique
                            </span>
                          )}
                          {unit.description && (
                            <p className="text-text-muted font-display text-xs mt-0.5 line-clamp-1">
                              {unit.description}
                            </p>
                          )}
                        </div>
                        <span
                          className="font-mono text-sm flex-shrink-0 ml-3"
                          style={{ color: faction?.colorHex }}
                        >
                          {unit.pointCost} pts
                        </span>
                      </button>

                      {unit.stats && (
                        <button
                          onClick={() => setExpandedStatId(statsOpen ? null : unit.id)}
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
                            style={{ transform: statsOpen ? 'rotate(180deg)' : 'none', color: statsOpen ? faction?.colorHex : '#60607A', transition: 'transform 0.2s, color 0.2s' }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {unit.stats && statsOpen && (
                      <UnitStatPanel stats={unit.stats} factionColor={faction!.colorHex} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedUnit && (
        <UnitDetailModal
          unit={selectedUnit.unit}
          gameData={gameData}
          factionColor={selectedUnit.faction.colorHex}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </div>
  )
}
