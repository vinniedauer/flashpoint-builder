import { useState } from 'react'
import type { Faction } from '../types/game'

interface Props {
  faction: Faction
  selectedIds: string[]
  factionColor: string
  onClose: () => void
  onSave: (ids: string[]) => void
}

export default function SpecialOrdersModal({ faction, selectedIds, factionColor, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>(selectedIds)

  const toggleOrder = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id))
    } else if (selected.length < 3) {
      setSelected([...selected, id])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-display font-semibold uppercase tracking-widest text-text-primary">
              Special Orders
            </h2>
            <p className="text-xs text-text-muted font-display mt-0.5">
              Select 1–3 orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm" style={{ color: factionColor }}>
              {selected.length}/3
            </span>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl leading-none font-light"
            >
              ×
            </button>
          </div>
        </div>

        {/* Warning */}
        {selected.length === 0 && (
          <div className="mx-6 mt-4 px-4 py-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-lg flex-shrink-0">
            <p className="text-[#C0392B] font-display text-xs uppercase tracking-wider">
              At least 1 special order must be selected
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {faction.specialOrders.map((order) => {
            const isSelected = selected.includes(order.id)
            const atMax = !isSelected && selected.length >= 3

            return (
              <button
                key={order.id}
                onClick={() => toggleOrder(order.id)}
                disabled={atMax}
                className="w-full text-left px-4 py-4 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                      {order.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm" style={{ color: factionColor }}>
                    +{order.pointCost}
                  </span>
                </div>
                {order.restriction && (
                  <p className="text-text-muted font-display text-xs ml-7">
                    {order.restriction}
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
            Save Orders
          </button>
        </div>
      </div>
    </div>
  )
}
