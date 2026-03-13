import { useState } from 'react'
import type { FireteamEntry, Unit, GameData } from '../types/game'
import { entryPoints } from '../utils/points'
import UpgradeConfigForm from './UpgradeConfigForm'

interface Props {
  entry: FireteamEntry
  unit: Unit
  gameData: GameData
  factionColor: string
  onClose: () => void
  onSave: (updated: FireteamEntry) => void
}

export default function EditUpgradesModal({ entry, unit, gameData, factionColor, onClose, onSave }: Props) {
  const [selectedUpgrades, setSelectedUpgrades] = useState<Record<string, string[]>>(
    entry.selectedUpgrades
  )

  const totalPoints = entryPoints(
    { ...entry, selectedUpgrades },
    unit,
    gameData.weaponUpgrades
  )

  const handleSave = () => {
    onSave({ ...entry, selectedUpgrades })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl max-h-[90vh] flex flex-col anim-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-display font-semibold uppercase tracking-widest text-text-primary">
            Edit Upgrades
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <UpgradeConfigForm
            unit={unit}
            weaponUpgrades={gameData.weaponUpgrades}
            selectedUpgrades={selectedUpgrades}
            factionColor={factionColor}
            totalPoints={totalPoints}
            keywords={gameData.keywords}
            onChange={(slotId, ids) =>
              setSelectedUpgrades((prev) => ({ ...prev, [slotId]: ids }))
            }
          />
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-lg font-display font-semibold uppercase tracking-wider text-base text-white transition-all"
            style={{ backgroundColor: factionColor }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
