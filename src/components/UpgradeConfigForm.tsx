import type { Unit, UpgradeSlot, WeaponUpgrade } from '../types/game'

interface Props {
  unit: Unit
  weaponUpgrades: WeaponUpgrade[]
  selectedUpgrades: Record<string, string[]>
  factionColor: string
  totalPoints: number
  onChange: (slotId: string, selectedIds: string[]) => void
}

export default function UpgradeConfigForm({
  unit,
  weaponUpgrades,
  selectedUpgrades,
  factionColor,
  totalPoints,
  onChange,
}: Props) {
  const isRadioSlot = (slot: UpgradeSlot) =>
    slot.required && slot.maxSelections === 1 && !slot.slotType

  const toggleOption = (slot: UpgradeSlot, optionId: string) => {
    const current = selectedUpgrades[slot.id] ?? []
    const isSelected = current.includes(optionId)

    if (isRadioSlot(slot)) {
      // Radio: can't deselect, only swap
      if (!isSelected) onChange(slot.id, [optionId])
    } else {
      // Checkbox: toggle on/off, respect maxSelections
      if (isSelected) {
        onChange(slot.id, current.filter((id) => id !== optionId))
      } else if (current.length < slot.maxSelections) {
        onChange(slot.id, [...current, optionId])
      }
    }
  }

  const getSlotOptions = (slot: UpgradeSlot) => {
    if (slot.slotType === 'weapon_melee') {
      return weaponUpgrades
        .filter((w) => w.category === 'melee')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '' }))
    }
    if (slot.slotType === 'weapon_ranged') {
      return weaponUpgrades
        .filter((w) => w.category === 'ranged')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '' }))
    }
    return slot.options
  }

  return (
    <div>
      {/* Live point total */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
          {unit.name}
        </span>
        <span className="font-mono text-2xl" style={{ color: factionColor }}>
          {totalPoints} pts
        </span>
      </div>

      {unit.upgradeSlots.map((slot) => {
        const options = getSlotOptions(slot)
        if (options.length === 0) return null

        const current = selectedUpgrades[slot.id] ?? []
        const radio = isRadioSlot(slot)

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
                  {current.length}/{slot.maxSelections}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {options.map((option) => {
                const selected = current.includes(option.id)
                const atMax = !radio && !selected && current.length >= slot.maxSelections

                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(slot, option.id)}
                    disabled={atMax}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      borderColor: selected ? factionColor : 'var(--color-input-border)',
                      backgroundColor: selected ? factionColor + '18' : 'var(--color-input-bg)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {radio ? (
                        /* Radio circle */
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: selected ? factionColor : 'var(--color-radio-border)',
                            backgroundColor: selected ? factionColor : 'transparent',
                          }}
                        >
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      ) : (
                        /* Checkbox square */
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: selected ? factionColor : 'var(--color-radio-border)',
                            backgroundColor: selected ? factionColor : 'transparent',
                          }}
                        >
                          {selected && (
                            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                              <polyline points="1,3.5 3.5,6 8,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="font-display text-sm text-text-primary text-left">
                        {option.name}
                      </span>
                    </div>
                    <span
                      className="font-mono text-xs ml-2 flex-shrink-0"
                      style={{ color: option.pointCost > 0 ? factionColor : 'var(--color-radio-border)' }}
                    >
                      {option.pointCost > 0 ? `+${option.pointCost}` : 'free'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
