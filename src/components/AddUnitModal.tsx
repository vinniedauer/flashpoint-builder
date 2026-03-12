import { useState } from 'react'
import type { Unit, Faction, FireteamEntry, GameData } from '../types/game'
import { entryPoints } from '../utils/points'
import UpgradeConfigForm from './UpgradeConfigForm'
import UnitStatPanel from './UnitStatPanel'

interface Props {
  faction: Faction
  gameData: GameData
  existingEntries: FireteamEntry[]
  factionColor: string
  onClose: () => void
  onAdd: (entry: FireteamEntry) => void
}

type UnitType = 'hero' | 'infantry' | 'vehicle' | 'support'
const TYPE_ORDER: UnitType[] = ['hero', 'infantry', 'vehicle', 'support']
const TYPE_LABELS: Record<UnitType, string> = {
  hero: 'Heroes',
  infantry: 'Infantry',
  vehicle: 'Vehicles',
  support: 'Support',
}

export default function AddUnitModal({ faction, gameData, existingEntries, factionColor, onClose, onAdd }: Props) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedUpgrades, setSelectedUpgrades] = useState<Record<string, string[]>>({})
  const [expandedStatId, setExpandedStatId] = useState<string | null>(null)

  const isUniqueConflict = (unit: Unit) => {
    if (!unit.unique) return false
    return existingEntries.some((e) => e.unitId === unit.id)
  }

  const handleSelectUnit = (unit: Unit) => {
    setSelectedUnit(unit)
    setSelectedUpgrades({})
  }

  const handleAdd = () => {
    if (!selectedUnit) return
    const entry: FireteamEntry = {
      id: crypto.randomUUID(),
      unitId: selectedUnit.id,
      selectedUpgrades,
    }
    onAdd(entry)
  }

  const totalPoints = selectedUnit
    ? entryPoints(
        { id: '', unitId: selectedUnit.id, selectedUpgrades },
        selectedUnit,
        gameData.weaponUpgrades
      )
    : 0

  const grouped = TYPE_ORDER.reduce<Record<string, Unit[]>>((acc, type) => {
    const units = faction.units.filter((u) => u.type === type)
    if (units.length) acc[type] = units
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl max-h-[90vh] flex flex-col anim-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {selectedUnit && (
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-text-secondary hover:text-text-primary font-display text-sm uppercase tracking-wider transition-colors"
              >
                ← Back
              </button>
            )}
            <h2 className="text-lg font-display font-semibold uppercase tracking-widest text-text-primary">
              {selectedUnit ? selectedUnit.name : 'Add Soldier'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!selectedUnit ? (
            // Unit picker
            <div className="space-y-5">
              {Object.entries(grouped).map(([type, units]) => (
                <div key={type}>
                  <div className="text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
                    {TYPE_LABELS[type as UnitType]}
                  </div>
                  <div className="space-y-1">
                    {units.map((unit) => {
                      const conflict = isUniqueConflict(unit)
                      const statsOpen = expandedStatId === unit.id
                      return (
                        <div
                          key={unit.id}
                          className="rounded-lg border border-border bg-surface-hi overflow-hidden"
                          style={{ opacity: conflict ? 0.4 : 1 }}
                        >
                          <div className="flex items-stretch">
                            <button
                              onClick={() => !conflict && handleSelectUnit(unit)}
                              disabled={conflict}
                              className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-all disabled:cursor-not-allowed text-left"
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
                                {conflict && (
                                  <span className="ml-2 text-xs text-[#C0392B] font-display uppercase tracking-wider">
                                    Already in list
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-sm shrink-0 ml-2" style={{ color: factionColor }}>
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
                                  style={{ transform: statsOpen ? 'rotate(180deg)' : 'none', color: statsOpen ? factionColor : '#60607A', transition: 'transform 0.2s, color 0.2s' }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {unit.stats && statsOpen && (
                            <UnitStatPanel stats={unit.stats} factionColor={factionColor} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Upgrade config
            <UpgradeConfigForm
              unit={selectedUnit}
              weaponUpgrades={gameData.weaponUpgrades}
              selectedUpgrades={selectedUpgrades}
              factionColor={factionColor}
              totalPoints={totalPoints}
              onChange={(slotId, ids) =>
                setSelectedUpgrades((prev) => ({ ...prev, [slotId]: ids }))
              }
            />
          )}
        </div>

        {/* Footer */}
        {selectedUnit && (
          <div className="px-6 pb-8 pt-4 border-t border-border flex-shrink-0">
            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-lg font-display font-semibold uppercase tracking-wider text-base text-white transition-all"
              style={{ backgroundColor: factionColor }}
            >
              Add to List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
