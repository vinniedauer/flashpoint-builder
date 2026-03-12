import { useState } from 'react'
import type { Faction } from '../types/game'

interface Props {
  factions: Faction[]
  onClose: () => void
  onCreate: (name: string, factionId: string, pointBudget: number) => void
}

export default function NewFireteamModal({ factions, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [factionId, setFactionId] = useState(factions[0]?.id ?? '')
  const [pointBudget, setPointBudget] = useState(200)
  const [customBudget, setCustomBudget] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const presets = [150, 200, 250]

  const selectedFaction = factions.find((f) => f.id === factionId)

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed || !factionId) return
    const budget = useCustom ? parseInt(customBudget) || pointBudget : pointBudget
    onCreate(trimmed, factionId, budget)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-t-2xl p-6 pb-8 max-h-[90vh] overflow-y-auto anim-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold uppercase tracking-widest text-text-primary">
            New Fireteam
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl leading-none font-light"
          >
            ×
          </button>
        </div>

        {/* Name input */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fireteam name..."
            className="w-full bg-surface-hi border border-border rounded-lg px-4 py-3 text-text-primary font-display text-base focus:outline-none focus:border-text-secondary placeholder-text-muted"
            autoFocus
          />
        </div>

        {/* Faction selector */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
            Faction
          </label>
          <div className="flex gap-3">
            {factions.map((faction) => (
              <button
                key={faction.id}
                onClick={() => setFactionId(faction.id)}
                className="flex-1 py-3 rounded-lg border font-display font-semibold uppercase tracking-wider text-sm transition-all"
                style={{
                  borderColor: factionId === faction.id ? faction.colorHex : 'var(--color-input-border)',
                  backgroundColor: factionId === faction.id ? faction.colorHex + '22' : 'var(--color-input-bg)',
                  color: factionId === faction.id ? faction.colorHex : 'var(--color-inactive)',
                }}
              >
                {faction.name}
              </button>
            ))}
          </div>
        </div>

        {/* Point budget */}
        <div className="mb-7">
          <label className="block text-xs uppercase tracking-widest text-text-secondary font-display mb-2">
            Point Budget
          </label>
          <div className="flex gap-2 mb-3">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => { setPointBudget(p); setUseCustom(false) }}
                className="flex-1 py-3 rounded-lg border font-mono text-sm transition-all"
                style={{
                  borderColor: !useCustom && pointBudget === p ? selectedFaction?.colorHex : 'var(--color-input-border)',
                  backgroundColor: !useCustom && pointBudget === p ? (selectedFaction?.colorHex ?? '#3A7CA5') + '22' : 'var(--color-input-bg)',
                  color: !useCustom && pointBudget === p ? selectedFaction?.colorHex : 'var(--color-inactive)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-xs uppercase tracking-widest font-display transition-colors"
              style={{ color: useCustom ? selectedFaction?.colorHex : 'var(--color-inactive)' }}
            >
              Custom
            </button>
            {useCustom && (
              <input
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder="Enter pts..."
                className="flex-1 bg-surface-hi border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-text-secondary placeholder-text-muted"
              />
            )}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || !factionId}
          className="w-full py-4 rounded-lg font-display font-semibold uppercase tracking-wider text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: selectedFaction?.colorHex ?? '#3A7CA5',
            color: '#fff',
          }}
        >
          Create Fireteam
        </button>
      </div>
    </div>
  )
}
