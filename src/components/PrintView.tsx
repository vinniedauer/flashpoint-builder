import type { Fireteam, GameData } from '../types/game'
import { fireteamPoints, entryPoints } from '../utils/points'

interface Props {
  fireteam: Fireteam
  gameData: GameData
}

export default function PrintView({ fireteam, gameData }: Props) {
  const faction = gameData.factions.find((f) => f.id === fireteam.factionId)
  const total = fireteamPoints(fireteam, gameData)

  return (
    <div className="print-only hidden print:block p-8 bg-white text-black font-sans text-sm">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-0.5">Halo Flashpoint</div>
          <h1 className="text-2xl font-bold uppercase tracking-wide">{fireteam.name}</h1>
          <div className="text-sm text-gray-600 mt-0.5">{faction?.name ?? fireteam.factionId}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold font-mono">{total}</div>
          <div className="text-xs uppercase tracking-widest text-gray-500">of {fireteam.pointBudget} pts</div>
        </div>
      </div>

      {/* Special Orders */}
      {fireteam.selectedSpecialOrderIds.length > 0 && (
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Special Orders</div>
          {fireteam.selectedSpecialOrderIds.map((id) => {
            const order = faction?.specialOrders.find((o) => o.id === id)
            if (!order) return null
            return (
              <div key={id} className="flex justify-between border-b border-gray-200 py-1">
                <div>
                  <span className="font-medium">{order.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{order.restriction}</span>
                </div>
                <span className="font-mono">{order.pointCost} pts</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Command Upgrades */}
      {fireteam.selectedCommandUpgradeIds.length > 0 && (
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Command Upgrades</div>
          {fireteam.selectedCommandUpgradeIds.map((id) => {
            const upgrade = gameData.commandUpgrades.find((c) => c.id === id)
            if (!upgrade) return null
            return (
              <div key={id} className="flex justify-between border-b border-gray-200 py-1">
                <div>
                  <span className="font-medium">{upgrade.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{upgrade.detail}</span>
                </div>
                <span className="font-mono">{upgrade.pointCost} pts</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Soldiers */}
      <div>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
          Soldiers ({fireteam.entries.length})
        </div>
        {fireteam.entries.map((entry) => {
          const unit = gameData.factions.flatMap((f) => f.units).find((u) => u.id === entry.unitId)
          if (!unit) return null
          const pts = entryPoints(entry, unit, gameData.weaponUpgrades)

          // Collect selected upgrade names
          const upgradeLines: string[] = []
          for (const slot of unit.upgradeSlots) {
            const ids = entry.selectedUpgrades[slot.id] ?? []
            if (ids.length === 0) continue
            let optionNames: string[]
            if (slot.slotType === 'weapon_melee' || slot.slotType === 'weapon_ranged') {
              optionNames = ids.map((id) => {
                const w = gameData.weaponUpgrades.find((wu) => wu.id === id)
                return w ? w.name : id
              })
            } else {
              optionNames = ids.map((id) => {
                const o = slot.options.find((op) => op.id === id)
                return o ? o.name : id
              })
            }
            upgradeLines.push(`${slot.name}: ${optionNames.join(', ')}`)
          }

          return (
            <div key={entry.id} className="border-t border-gray-300 pt-2 pb-2 mt-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold uppercase tracking-wide">{unit.name}</span>
                <span className="font-mono text-sm">{pts} pts</span>
              </div>
              {upgradeLines.map((line, i) => (
                <div key={i} className="text-gray-600 text-xs ml-2">{line}</div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-2 border-t border-gray-200 text-xs text-gray-400 text-center">
        Built with Flashpoint Builder · haloflashpoint.manticgames.com
      </div>
    </div>
  )
}
