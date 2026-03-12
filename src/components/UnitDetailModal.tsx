import type { Unit, GameData } from '../types/game'

interface Props {
  unit: Unit
  gameData: GameData
  factionColor: string
  onClose: () => void
}

export default function UnitDetailModal({ unit, gameData, factionColor, onClose }: Props) {
  const getSlotOptions = (slot: import('../types/game').UpgradeSlot) => {
    if (slot.slotType === 'weapon_melee') {
      return gameData.weaponUpgrades
        .filter((w) => w.category === 'melee')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '' }))
    }
    if (slot.slotType === 'weapon_ranged') {
      return gameData.weaponUpgrades
        .filter((w) => w.category === 'ranged')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '' }))
    }
    return slot.options
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-display font-semibold uppercase tracking-widest text-text-primary">
              {unit.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-sm" style={{ color: factionColor }}>
                {unit.pointCost} pts base
              </span>
              {unit.unique && (
                <span className="text-xs text-text-muted font-display uppercase tracking-wider">
                  · Unique
                </span>
              )}
            </div>
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
          {unit.description && (
            <p className="text-text-secondary font-display text-sm leading-relaxed mb-5">
              {unit.description}
            </p>
          )}

          {unit.upgradeSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted font-display text-xs uppercase tracking-wider">
                No upgrade slots
              </p>
            </div>
          ) : (
            unit.upgradeSlots.map((slot) => {
              const options = getSlotOptions(slot)
              if (options.length === 0) return null

              return (
                <div key={slot.id} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
                      {slot.name}
                    </span>
                    {slot.required && (
                      <span className="text-xs text-[#C0392B] font-display uppercase tracking-wider">
                        Required
                      </span>
                    )}
                    {slot.maxSelections > 1 && (
                      <span className="text-xs text-text-muted font-display ml-auto">
                        Max {slot.maxSelections}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-surface-hi border border-border"
                      >
                        <div>
                          <span className="font-display text-sm text-text-primary">
                            {option.name}
                          </span>
                          {option.description && (
                            <p className="text-text-muted font-display text-xs mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                        <span
                          className="font-mono text-xs ml-2 flex-shrink-0"
                          style={{ color: option.pointCost > 0 ? factionColor : 'var(--color-radio-border)' }}
                        >
                          {option.pointCost > 0 ? `+${option.pointCost}` : 'free'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
