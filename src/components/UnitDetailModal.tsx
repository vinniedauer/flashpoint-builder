import { useState } from 'react'
import type { Unit, GameData, WeaponProfile, KeywordEntry, Upgrade, WeaponUpgrade } from '../types/game'
import KeywordModal from './KeywordModal'

interface Props {
  unit: Unit
  gameData: GameData
  factionColor: string
  onClose: () => void
}

function baseKeyword(kw: string): string {
  return kw.replace(/\s*\(\d+\)$/, '').trim()
}

function WeaponProfileRow({
  profile: p,
  factionColor,
  keywords,
  onKeywordClick,
}: {
  profile: WeaponProfile
  factionColor: string
  keywords: KeywordEntry[]
  onKeywordClick: (kw: string) => void
}) {
  const specialKeywords = p.special ? p.special.split(',').map((s) => s.trim()) : []
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-xs font-semibold" style={{ color: factionColor }}>{p.name}</span>
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-mono text-xs text-text-muted">{p.range}</span>
          {p.ap !== '-' && <span className="font-mono text-xs text-text-muted">AP{p.ap}</span>}
        </div>
      </div>
      {specialKeywords.length > 0 && (
        <p className="font-display text-xs text-text-muted italic">
          {specialKeywords.map((kw, i) => {
            const hasDesc = keywords.some((k) => k.name.toLowerCase() === baseKeyword(kw).toLowerCase())
            return (
              <span key={kw}>
                {i > 0 && ', '}
                {hasDesc ? (
                  <button
                    onClick={() => onKeywordClick(kw)}
                    className="italic underline decoration-dotted underline-offset-2 hover:opacity-80 transition-opacity"
                  >
                    {kw}
                  </button>
                ) : (
                  <span>{kw}</span>
                )}
              </span>
            )
          })}
        </p>
      )}
    </div>
  )
}

/** Merges profiles from the full weaponUpgrades list into a slot option (for weapon pool slots). */
function mergeProfiles(option: Upgrade, weaponUpgrades: WeaponUpgrade[]): WeaponProfile[] {
  if (option.weaponProfiles?.length) return option.weaponProfiles
  const match = weaponUpgrades.find((w) => w.id === option.id)
  return match?.profiles ?? []
}

export default function UnitDetailModal({ unit, gameData, factionColor, onClose }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleKeywordClick = (kw: string) => {
    const base = baseKeyword(kw)
    const entry = gameData.keywords.find((k) => k.name.toLowerCase() === base.toLowerCase())
    if (entry) setActiveKeyword(kw)
  }

  const activeEntry = activeKeyword
    ? gameData.keywords.find((k) => k.name.toLowerCase() === baseKeyword(activeKeyword).toLowerCase())
    : null

  const getSlotOptions = (slot: import('../types/game').UpgradeSlot): (Upgrade & { profiles: WeaponProfile[] })[] => {
    if (slot.slotType === 'weapon_melee') {
      return gameData.weaponUpgrades
        .filter((w) => w.category === 'melee')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '', weaponProfiles: w.profiles, profiles: w.profiles ?? [] }))
    }
    if (slot.slotType === 'weapon_ranged') {
      return gameData.weaponUpgrades
        .filter((w) => w.category === 'ranged')
        .map((w) => ({ id: w.id, name: w.name, pointCost: w.pointCost, description: '', weaponProfiles: w.profiles, profiles: w.profiles ?? [] }))
    }
    return slot.options.map((o) => ({ ...o, profiles: mergeProfiles(o, gameData.weaponUpgrades) }))
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
                    {options.map((option) => {
                      const expanded = expandedIds.has(option.id)
                      const hasExpandable = !!(option.description || option.profiles.length > 0)

                      return (
                        <div key={option.id}>
                          <div
                            className="flex rounded-lg border overflow-hidden"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            {/* Name + cost (non-interactive) */}
                            <div className="flex-1 flex items-center justify-between px-4 py-3 bg-surface-hi min-w-0">
                              <span className="font-display text-sm text-text-primary">{option.name}</span>
                              <span
                                className="font-mono text-xs ml-2 flex-shrink-0"
                                style={{ color: option.pointCost > 0 ? factionColor : 'var(--color-radio-border)' }}
                              >
                                {option.pointCost > 0 ? `+${option.pointCost}` : 'free'}
                              </span>
                            </div>

                            {/* Chevron */}
                            {hasExpandable && (
                              <button
                                onClick={() => toggleExpanded(option.id)}
                                className="px-3 border-l border-border flex items-center justify-center shrink-0 hover:bg-surface-hover transition-all bg-surface-hi"
                              >
                                <svg
                                  width="14" height="14" viewBox="0 0 24 24"
                                  fill="none" stroke="currentColor" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round"
                                  style={{
                                    transform: expanded ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.2s',
                                    color: expanded ? factionColor : 'var(--color-chevron)',
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {expanded && hasExpandable && (
                            <div
                              className="mt-1 px-4 py-2.5 rounded-lg"
                              style={{ backgroundColor: factionColor + '0C', border: `1px solid ${factionColor}30` }}
                            >
                              {option.description && (
                                <p className="font-display text-xs text-text-secondary leading-relaxed mb-2 last:mb-0">
                                  {option.description}
                                </p>
                              )}
                              {option.profiles.map((p, i) => (
                                <WeaponProfileRow
                                  key={i}
                                  profile={p}
                                  factionColor={factionColor}
                                  keywords={gameData.keywords}
                                  onKeywordClick={handleKeywordClick}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {activeEntry && (
        <KeywordModal
          name={activeEntry.name}
          description={activeEntry.description}
          factionColor={factionColor}
          onClose={() => setActiveKeyword(null)}
        />
      )}
    </div>
  )
}
