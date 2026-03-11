import { useState } from 'react'
import type { CommandUpgrade } from '../types/game'

interface Props {
  commandUpgrades: CommandUpgrade[]
  selectedIds: string[]
  factionColor: string
  onClose: () => void
  onSave: (ids: string[]) => void
}

export default function CommandUpgradesModal({ commandUpgrades, selectedIds, factionColor, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>(selectedIds)

  const toggleUpgrade = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  const totalCost = commandUpgrades
    .filter((c) => selected.includes(c.id))
    .reduce((sum, c) => sum + c.pointCost, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl max-h-[90vh] flex flex-col anim-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-display font-semibold uppercase tracking-widest text-text-primary">
            Command Upgrades
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm" style={{ color: factionColor }}>
              +{totalCost} pts
            </span>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl leading-none font-light"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {commandUpgrades.map((upgrade) => {
            const isSelected = selected.includes(upgrade.id)

            return (
              <button
                key={upgrade.id}
                onClick={() => toggleUpgrade(upgrade.id)}
                className="w-full text-left px-4 py-4 rounded-lg border transition-all"
                style={{
                  borderColor: isSelected ? factionColor : '#2C2C40',
                  backgroundColor: isSelected ? factionColor + '18' : '#1C1C2C',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: isSelected ? factionColor : '#40405A',
                        backgroundColor: isSelected ? factionColor : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-display font-semibold text-text-primary text-sm uppercase tracking-wide">
                      {upgrade.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm" style={{ color: factionColor }}>
                    +{upgrade.pointCost}
                  </span>
                </div>
                {upgrade.detail && (
                  <p className="text-text-muted font-display text-xs ml-7 leading-relaxed">
                    {upgrade.detail}
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4 border-t border-border flex-shrink-0">
          <button
            onClick={() => onSave(selected)}
            className="w-full py-4 rounded-lg font-display font-semibold uppercase tracking-wider text-base text-white transition-all"
            style={{ backgroundColor: factionColor }}
          >
            Save Upgrades
          </button>
        </div>
      </div>
    </div>
  )
}
