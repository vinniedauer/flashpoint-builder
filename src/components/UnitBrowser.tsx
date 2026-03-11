import { useState } from 'react'
import type { GameData, Unit, Faction } from '../types/game'
import UnitDetailModal from './UnitDetailModal'

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
              onClick={() => setSelectedFactionId(f.id)}
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
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {Object.entries(grouped).map(([type, units]) => (
          <div key={type}>
            <div className="text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
              {TYPE_LABELS[type as UnitType]}
            </div>
            <div className="space-y-1">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit({ unit, faction: faction! })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-hover hover:border-text-muted transition-all text-left"
                >
                  <div>
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
              ))}
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
