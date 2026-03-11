import { useState } from 'react'
import type { Fireteam, GameData, FireteamEntry } from '../types/game'
import { fireteamPoints } from '../utils/points'
import { useFireteamStore } from '../store/fireteamStore'
import EntryRow from './EntryRow'
import AddUnitModal from './AddUnitModal'
import EditUpgradesModal from './EditUpgradesModal'
import SpecialOrdersModal from './SpecialOrdersModal'
import CommandUpgradesModal from './CommandUpgradesModal'
import PrintView from './PrintView'

interface Props {
  fireteam: Fireteam
  gameData: GameData
  userId: string | null
  onBack: () => void
}

export default function FireteamDetail({ fireteam, gameData, userId, onBack }: Props) {
  const { updateFireteam } = useFireteamStore()
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FireteamEntry | null>(null)
  const [showSpecialOrders, setShowSpecialOrders] = useState(false)
  const [showCommandUpgrades, setShowCommandUpgrades] = useState(false)
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<string | null>(null)

  const faction = gameData.factions.find((f) => f.id === fireteam.factionId)
  if (!faction) return null

  const factionColor = faction.colorHex
  const pts = fireteamPoints(fireteam, gameData)
  const pct = Math.min((pts / fireteam.pointBudget) * 100, 100)
  const over = pts > fireteam.pointBudget

  const specialOrdersCost = fireteam.selectedSpecialOrderIds.reduce((sum, id) => {
    const o = faction.specialOrders.find((o) => o.id === id)
    return sum + (o?.pointCost ?? 0)
  }, 0)

  const commandUpgradesCost = fireteam.selectedCommandUpgradeIds.reduce((sum, id) => {
    const c = gameData.commandUpgrades.find((c) => c.id === id)
    return sum + (c?.pointCost ?? 0)
  }, 0)

  const save = (updated: Partial<Fireteam>) => {
    updateFireteam({
      ...fireteam,
      ...updated,
      modifiedAt: new Date().toISOString(),
    }, userId)
  }

  const handleAddEntry = (entry: FireteamEntry) => {
    save({ entries: [...fireteam.entries, entry] })
    setShowAddUnit(false)
  }

  const handleUpdateEntry = (updated: FireteamEntry) => {
    save({
      entries: fireteam.entries.map((e) => (e.id === updated.id ? updated : e)),
    })
    setEditingEntry(null)
  }

  const handleDeleteEntry = (id: string) => {
    save({ entries: fireteam.entries.filter((e) => e.id !== id) })
    setConfirmDeleteEntry(null)
  }

  const handleSaveSpecialOrders = (ids: string[]) => {
    save({ selectedSpecialOrderIds: ids })
    setShowSpecialOrders(false)
  }

  const handleSaveCommandUpgrades = (ids: string[]) => {
    save({ selectedCommandUpgradeIds: ids })
    setShowCommandUpgrades(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="text-text-secondary hover:text-text-primary font-display text-sm uppercase tracking-wider transition-colors"
          >
            ← Back
          </button>
          <span className="text-text-muted">|</span>
          <span
            className="text-xs font-display uppercase tracking-wider font-semibold"
            style={{ color: factionColor }}
          >
            {faction.name}
          </span>
          <span className="flex-1" />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-surface-hi hover:bg-surface-hover text-text-secondary hover:text-text-primary font-display text-xs uppercase tracking-wider transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>

        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-text-primary mb-3">
          {fireteam.name}
        </h1>

        {/* Point counter */}
        <div className="flex items-end justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
            Points
          </span>
          <span
            className="font-mono text-3xl"
            style={{ color: over ? '#C0392B' : factionColor }}
          >
            {pts}
            <span className="text-lg text-text-muted"> / {fireteam.pointBudget}</span>
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: over ? '#C0392B' : factionColor,
            }}
          />
        </div>
        {over && (
          <p className="text-[#C0392B] font-display text-xs uppercase tracking-wider mt-1">
            Over budget by {pts - fireteam.pointBudget} pts
          </p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Special Orders */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
              Special Orders
              {specialOrdersCost > 0 && (
                <span className="ml-2 font-mono" style={{ color: factionColor }}>
                  +{specialOrdersCost}
                </span>
              )}
            </span>
            <button
              onClick={() => setShowSpecialOrders(true)}
              className="text-xs uppercase tracking-wider font-display font-semibold transition-colors"
              style={{ color: factionColor }}
            >
              Edit
            </button>
          </div>

          {fireteam.selectedSpecialOrderIds.length === 0 ? (
            <div className="bg-surface-hi border border-border rounded-lg px-4 py-3">
              <p className="text-text-muted font-display text-xs uppercase tracking-wider">
                No orders selected
              </p>
            </div>
          ) : (
            <div className="bg-surface-hi border border-border rounded-lg px-4 py-2 space-y-1">
              {fireteam.selectedSpecialOrderIds.map((id) => {
                const order = faction.specialOrders.find((o) => o.id === id)
                return order ? (
                  <div key={id} className="flex items-center justify-between py-1">
                    <span className="font-display text-sm text-text-primary">
                      {order.name}
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      +{order.pointCost}
                    </span>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Command Upgrades */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
              Command Upgrades
              {commandUpgradesCost > 0 && (
                <span className="ml-2 font-mono" style={{ color: factionColor }}>
                  +{commandUpgradesCost}
                </span>
              )}
            </span>
            <button
              onClick={() => setShowCommandUpgrades(true)}
              className="text-xs uppercase tracking-wider font-display font-semibold transition-colors"
              style={{ color: factionColor }}
            >
              Edit
            </button>
          </div>

          {fireteam.selectedCommandUpgradeIds.length === 0 ? (
            <div className="bg-surface-hi border border-border rounded-lg px-4 py-3">
              <p className="text-text-muted font-display text-xs uppercase tracking-wider">
                No upgrades selected
              </p>
            </div>
          ) : (
            <div className="bg-surface-hi border border-border rounded-lg px-4 py-2 space-y-1">
              {fireteam.selectedCommandUpgradeIds.map((id) => {
                const upgrade = gameData.commandUpgrades.find((c) => c.id === id)
                return upgrade ? (
                  <div key={id} className="flex items-center justify-between py-1">
                    <span className="font-display text-sm text-text-primary">
                      {upgrade.name}
                    </span>
                    <span className="font-mono text-xs text-text-muted">
                      +{upgrade.pointCost}
                    </span>
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Soldiers */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-text-secondary font-display">
              Soldiers
              <span className="ml-2 text-text-muted">
                {fireteam.entries.length}
              </span>
            </span>
          </div>

          <div className="space-y-2">
            {fireteam.entries.map((entry) => {
              const unit = faction.units.find((u) => u.id === entry.unitId)
              if (!unit) return null

              if (confirmDeleteEntry === entry.id) {
                return (
                  <div
                    key={entry.id}
                    className="bg-surface-hi border border-[#C0392B] rounded-lg px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <span className="text-text-secondary font-display text-sm uppercase tracking-wider">
                      Remove {unit.name}?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="px-3 py-1 rounded bg-[#C0392B] text-white font-display font-semibold uppercase tracking-wider text-xs"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setConfirmDeleteEntry(null)}
                        className="px-3 py-1 rounded bg-surface border border-border text-text-secondary font-display font-semibold uppercase tracking-wider text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  unit={unit}
                  weaponUpgrades={gameData.weaponUpgrades}
                  factionColor={factionColor}
                  onClick={() => setEditingEntry(entry)}
                  onDelete={() => setConfirmDeleteEntry(entry.id)}
                />
              )
            })}
          </div>

          <button
            onClick={() => setShowAddUnit(true)}
            className="mt-3 w-full py-3 rounded-lg border border-dashed font-display font-semibold uppercase tracking-wider text-sm transition-all"
            style={{
              borderColor: factionColor + '60',
              color: factionColor,
            }}
          >
            + Add Soldier
          </button>
        </div>
      </div>

      {/* Print view (hidden on screen, visible when printing) */}
      <PrintView fireteam={fireteam} gameData={gameData} />

      {/* Modals */}
      {showAddUnit && (
        <AddUnitModal
          faction={faction}
          gameData={gameData}
          existingEntries={fireteam.entries}
          factionColor={factionColor}
          onClose={() => setShowAddUnit(false)}
          onAdd={handleAddEntry}
        />
      )}

      {editingEntry && (() => {
        const unit = faction.units.find((u) => u.id === editingEntry.unitId)
        return unit ? (
          <EditUpgradesModal
            entry={editingEntry}
            unit={unit}
            gameData={gameData}
            factionColor={factionColor}
            onClose={() => setEditingEntry(null)}
            onSave={handleUpdateEntry}
          />
        ) : null
      })()}

      {showSpecialOrders && (
        <SpecialOrdersModal
          faction={faction}
          selectedIds={fireteam.selectedSpecialOrderIds}
          factionColor={factionColor}
          onClose={() => setShowSpecialOrders(false)}
          onSave={handleSaveSpecialOrders}
        />
      )}

      {showCommandUpgrades && (
        <CommandUpgradesModal
          commandUpgrades={gameData.commandUpgrades}
          selectedIds={fireteam.selectedCommandUpgradeIds}
          factionColor={factionColor}
          onClose={() => setShowCommandUpgrades(false)}
          onSave={handleSaveCommandUpgrades}
        />
      )}
    </div>
  )
}
