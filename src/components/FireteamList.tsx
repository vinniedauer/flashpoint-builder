import { useState } from 'react'
import type { Fireteam, GameData } from '../types/game'
import { useFireteamStore } from '../store/fireteamStore'
import { fireteamPoints } from '../utils/points'

interface Props {
  gameData: GameData
  userId: string | null
  onSelect: (fireteam: Fireteam) => void
  onNew: () => void
}

export default function FireteamList({ gameData, userId, onSelect, onNew }: Props) {
  const { fireteams, deleteFireteam } = useFireteamStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const getFaction = (factionId: string) =>
    gameData.factions.find((f) => f.id === factionId)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold uppercase tracking-widest text-text-primary">
          Fireteams
        </h1>
        <button
          onClick={onNew}
          className="px-4 py-2 rounded-lg border border-border bg-surface-hi text-text-secondary hover:text-text-primary hover:border-text-secondary font-display font-semibold uppercase tracking-wider text-xs transition-all"
        >
          + New
        </button>
      </div>

      {fireteams.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-hi border border-border flex items-center justify-center mb-4">
            <span className="text-2xl text-text-muted">⊕</span>
          </div>
          <p className="text-text-secondary font-display text-base mb-2 uppercase tracking-wider">
            No Fireteams Yet
          </p>
          <p className="text-text-muted font-display text-sm mb-6">
            Build your first army list
          </p>
          <button
            onClick={onNew}
            className="px-6 py-3 rounded-lg bg-[#3A7CA5] text-white font-display font-semibold uppercase tracking-wider text-sm hover:bg-[#4a8cb5] transition-all"
          >
            Create Fireteam
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {fireteams.map((ft) => {
            const faction = getFaction(ft.factionId)
            const pts = fireteamPoints(ft, gameData)
            const pct = Math.min((pts / ft.pointBudget) * 100, 100)
            const over = pts > ft.pointBudget

            return (
              <div key={ft.id} className="relative group">
                <button
                  onClick={() => onSelect(ft)}
                  className="w-full text-left bg-surface border border-border rounded-xl px-4 py-4 hover:bg-surface-hover hover:border-text-muted transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-display font-semibold text-base text-text-primary uppercase tracking-wide">
                        {ft.name}
                      </span>
                      {faction && (
                        <span
                          className="ml-2 text-xs font-display uppercase tracking-wider"
                          style={{ color: faction.colorHex }}
                        >
                          {faction.name}
                        </span>
                      )}
                    </div>
                    <span
                      className="font-mono text-sm"
                      style={{ color: over ? '#C0392B' : faction?.colorHex ?? '#D8DCF0' }}
                    >
                      {pts} / {ft.pointBudget}
                    </span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#C0392B' : faction?.colorHex ?? '#3A7CA5',
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-text-muted font-display uppercase tracking-wider">
                    {ft.entries.length} soldier{ft.entries.length !== 1 ? 's' : ''}
                  </div>
                </button>

                {confirmDelete === ft.id ? (
                  <div className="absolute inset-0 bg-surface/95 border border-[#C0392B] rounded-xl flex items-center justify-center gap-3 z-10">
                    <span className="text-text-secondary font-display text-sm uppercase tracking-wider">
                      Delete?
                    </span>
                    <button
                      onClick={() => { deleteFireteam(ft.id, userId); setConfirmDelete(null) }}
                      className="px-3 py-1 rounded bg-[#C0392B] text-white font-display font-semibold uppercase tracking-wider text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1 rounded bg-surface-hi border border-border text-text-secondary font-display font-semibold uppercase tracking-wider text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(ft.id)}
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-[#C0392B] text-lg leading-none transition-all"
                    title="Delete fireteam"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
