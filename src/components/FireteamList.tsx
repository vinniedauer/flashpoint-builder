import type { Fireteam, GameData } from '../types/game'
import { useFireteamStore } from '../store/fireteamStore'
import { fireteamPoints } from '../utils/points'
import { v4 as uuidv4 } from 'uuid'
import SwipeToDelete from './SwipeToDelete'

interface Props {
  gameData: GameData
  userId: string | null
  onSelect: (fireteam: Fireteam) => void
  onNew: () => void
}

export default function FireteamList({ gameData, userId, onSelect, onNew }: Props) {
  const { fireteams, deleteFireteam, addFireteam } = useFireteamStore()

  const handleClone = (ft: Fireteam) => {
    const now = new Date().toISOString()
    addFireteam({ ...ft, id: uuidv4(), name: `Copy of ${ft.name}`, createdAt: now, modifiedAt: now }, userId)
  }

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
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center anim-fade-up">
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
        <div className="flex-1 overflow-y-auto pl-4 pr-4 md:pr-16 pb-4 space-y-2">
          {fireteams.map((ft, index) => {
            const faction = getFaction(ft.factionId)
            const pts = fireteamPoints(ft, gameData)
            const pct = Math.min((pts / ft.pointBudget) * 100, 100)
            const over = pts > ft.pointBudget

            return (
              <SwipeToDelete
                key={ft.id}
                onDelete={() => deleteFireteam(ft.id, userId)}
                className="rounded-xl group anim-fade-up"
                style={{ animationDelay: `${index * 55}ms` } as React.CSSProperties}
                cornerRadius={12}
              >
                <button
                  onClick={() => onSelect(ft)}
                  className="w-full text-left bg-surface border border-border rounded-xl px-4 py-4 hover:bg-surface-hover hover:border-text-muted transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 mr-2">
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
                      className="font-mono text-sm shrink-0"
                      style={{ color: over ? '#C0392B' : faction?.colorHex ?? '#D8DCF0' }}
                    >
                      {pts} / {ft.pointBudget}
                    </span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#C0392B' : faction?.colorHex ?? '#3A7CA5',
                        boxShadow: `0 0 6px ${over ? '#C0392B' : faction?.colorHex ?? '#3A7CA5'}`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-text-muted font-display uppercase tracking-wider">
                    {ft.entries.length} soldier{ft.entries.length !== 1 ? 's' : ''}
                  </div>
                </button>

                {/* Desktop-only clone button on hover */}
                <div className="hover-only absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button
                    onClick={() => handleClone(ft)}
                    className="text-text-muted hover:text-text-secondary text-xs font-display uppercase tracking-wider transition-colors px-1"
                    title="Clone fireteam"
                  >
                    Clone
                  </button>
                </div>
              </SwipeToDelete>
            )
          })}
        </div>
      )}
    </div>
  )
}
