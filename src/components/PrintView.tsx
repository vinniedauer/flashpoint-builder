import type { Fireteam, GameData } from '../types/game'
import { fireteamPoints, entryPoints } from '../utils/points'

interface Props {
  fireteam: Fireteam
  gameData: GameData
}

export default function PrintView({ fireteam, gameData }: Props) {
  const faction = gameData.factions.find((f) => f.id === fireteam.factionId)
  const total = fireteamPoints(fireteam, gameData)

  const lines: string[] = []

  lines.push('HALO FLASHPOINT')
  lines.push(`${fireteam.name} — ${faction?.name ?? fireteam.factionId}`)
  lines.push(`${total} / ${fireteam.pointBudget} pts`)
  lines.push('')

  if (fireteam.selectedSpecialOrderIds.length > 0) {
    lines.push('SPECIAL ORDERS')
    for (const id of fireteam.selectedSpecialOrderIds) {
      const order = faction?.specialOrders.find((o) => o.id === id)
      if (order) lines.push(`  ${order.name} — ${order.pointCost} pts`)
    }
    lines.push('')
  }

  if (fireteam.selectedCommandUpgradeIds.length > 0) {
    lines.push('COMMAND UPGRADES')
    for (const id of fireteam.selectedCommandUpgradeIds) {
      const upgrade = gameData.commandUpgrades.find((c) => c.id === id)
      if (upgrade) lines.push(`  ${upgrade.name} — ${upgrade.pointCost} pts`)
    }
    lines.push('')
  }

  lines.push(`SOLDIERS (${fireteam.entries.length})`)
  for (const entry of fireteam.entries) {
    const unit = gameData.factions.flatMap((f) => f.units).find((u) => u.id === entry.unitId)
    if (!unit) continue
    const pts = entryPoints(entry, unit, gameData.weaponUpgrades)
    lines.push(`  ${unit.name} — ${pts} pts`)
    for (const slot of unit.upgradeSlots) {
      const ids = entry.selectedUpgrades[slot.id] ?? []
      if (ids.length === 0) continue
      let names: string[]
      if (slot.slotType === 'weapon_melee' || slot.slotType === 'weapon_ranged') {
        names = ids.map((id) => gameData.weaponUpgrades.find((w) => w.id === id)?.name ?? id)
      } else {
        names = ids.map((id) => slot.options.find((o) => o.id === id)?.name ?? id)
      }
      lines.push(`    ${slot.name}: ${names.join(', ')}`)
    }
  }

  return (
    <div
      className="print-only hidden"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        color: 'black',
        padding: '2rem',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        zIndex: 9999,
      }}
    >
      {lines.join('\n')}
    </div>
  )
}
