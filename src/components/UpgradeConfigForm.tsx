import { useState } from 'react'
import type { Unit, UpgradeSlot, WeaponUpgrade, WeaponProfile, KeywordEntry } from '../types/game'
import KeywordModal from './KeywordModal'

interface Props {
  unit: Unit
  weaponUpgrades: WeaponUpgrade[]
  selectedUpgrades: Record<string, string[]>
  factionColor: string
  totalPoints: number
  keywords?: KeywordEntry[]
  onChange: (slotId: string, selectedIds: string[]) => void
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
  keywords?: KeywordEntry[]
  onKeywordClick?: (kw: string) => void
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
            const hasDesc = keywords?.some(
              (k) => k.name.toLowerCase() === baseKeyword(kw).toLowerCase()
            )
            return (
              <span key={kw}>
                {i > 0 && ', '}
                {hasDesc && onKeywordClick ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onKeywordClick(kw) }}
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

export default function UpgradeConfigForm({
  unit,
  weaponUpgrades,
  selectedUpgrades,
  factionColor,
  totalPoints,
  keywords,
  onChange,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null)

  const isRadioSlot = (slot: UpgradeSlot) =>
    slot.required && slot.maxSelections === 1 && !slot.slotType

  const toggleOption = (slot: UpgradeSlot, optionId: string) => {
    const current = selectedUpgrades[slot.id] ?? []
    const isSelected = current.includes(optionId)

    if (isRadioSlot(slot)) {
      if (!isSelected) onChange(slot.id, [optionId])
    } else {
      if (isSelected) {
        onChange(slot.id, current.filter((id) => id !== optionId))
      } else if (current.length < slot.maxSelections) {
        onChange(slot.id, [...current, optionId])
      }
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleKeywordClick = (kw: string) => {
    if (!keywords) return
    const base = baseKeyword(kw)
    const entry = keywords.find((k) => k.name.toLowerCase() === base.toLowerCase())
    if (entry) setActiveKeyword(kw)
  }

  const activeEntry = activeKeyword
    ? keywords?.find((k) => k.name.toLowerCase() === baseKeyword(activeKeyword).toLowerCase())
    : null

  const getWeaponPool = (slot: UpgradeSlot): WeaponUpgrade[] => {
    if (slot.slotType === 'weapon_melee') return weaponUpgrades.filter((w) => w.category === 'melee')
    if (slot.slotType === 'weapon_ranged') return weaponUpgrades.filter((w) => w.category === 'ranged')
    return []
  }

  const getSlotOptions = (slot: UpgradeSlot) => {
    if (slot.slotType) return []
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
        const isWeaponPool = !!slot.slotType
        const weaponPool = isWeaponPool ? getWeaponPool(slot) : []
        const options = isWeaponPool ? [] : getSlotOptions(slot)

        if (isWeaponPool && weaponPool.length === 0) return null
        if (!isWeaponPool && options.length === 0) return null

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
              {isWeaponPool ? (
                /* ── Weapon pool options with expandable stats ── */
                weaponPool.map((weapon) => {
                  const selected = current.includes(weapon.id)
                  const expanded = expandedIds.has(weapon.id)
                  const hasProfiles = (weapon.profiles?.length ?? 0) > 0

                  return (
                    <div key={weapon.id}>
                      <div
                        className="flex rounded-lg border overflow-hidden transition-all"
                        style={{ borderColor: selected ? factionColor : 'var(--color-input-border)' }}
                      >
                        {/* Selection button */}
                        <button
                          onClick={() => toggleOption(slot, weapon.id)}
                          className="flex-1 flex items-center gap-3 px-4 py-3 text-left transition-all min-w-0"
                          style={{ backgroundColor: selected ? factionColor + '18' : 'var(--color-input-bg)' }}
                        >
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
                          <span className="font-display text-sm text-text-primary">{weapon.name}</span>
                          <span
                            className="font-mono text-xs ml-auto shrink-0"
                            style={{ color: weapon.pointCost > 0 ? factionColor : 'var(--color-radio-border)' }}
                          >
                            {weapon.pointCost > 0 ? `+${weapon.pointCost}` : 'free'}
                          </span>
                        </button>

                        {/* Chevron — only if weapon has profiles */}
                        {hasProfiles && (
                          <button
                            onClick={() => toggleExpanded(weapon.id)}
                            className="px-3 border-l flex items-center justify-center shrink-0 transition-all"
                            style={{
                              borderColor: selected ? factionColor + '40' : 'var(--color-input-border)',
                              backgroundColor: selected ? factionColor + '18' : 'var(--color-input-bg)',
                            }}
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

                      {/* Expanded weapon profiles */}
                      {expanded && hasProfiles && (
                        <div
                          className="mt-1 px-4 py-2.5 rounded-lg"
                          style={{ backgroundColor: factionColor + '0C', border: `1px solid ${factionColor}30` }}
                        >
                          {weapon.profiles!.map((p, i) => (
                            <WeaponProfileRow
                              key={i}
                              profile={p}
                              factionColor={factionColor}
                              keywords={keywords}
                              onKeywordClick={handleKeywordClick}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                /* ── Regular upgrade options ── */
                options.map((option) => {
                  const selected = current.includes(option.id)
                  const atMax = !radio && !selected && current.length >= slot.maxSelections
                  const expanded = expandedIds.has(option.id)
                  const hasProfiles = (option.weaponProfiles?.length ?? 0) > 0

                  if (hasProfiles) {
                    /* Split layout: selection button + chevron */
                    return (
                      <div key={option.id}>
                        <div
                          className="flex rounded-lg border overflow-hidden transition-all"
                          style={{
                            borderColor: selected ? factionColor : 'var(--color-input-border)',
                            opacity: atMax ? 0.4 : 1,
                          }}
                        >
                          {/* Selection button */}
                          <button
                            onClick={() => toggleOption(slot, option.id)}
                            disabled={atMax}
                            className="flex-1 flex items-center gap-3 px-4 py-3 text-left transition-all disabled:cursor-not-allowed min-w-0"
                            style={{ backgroundColor: selected ? factionColor + '18' : 'var(--color-input-bg)' }}
                          >
                            {radio ? (
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
                            <span className="font-display text-sm text-text-primary">{option.name}</span>
                            <span
                              className="font-mono text-xs ml-auto shrink-0"
                              style={{ color: option.pointCost > 0 ? factionColor : 'var(--color-radio-border)' }}
                            >
                              {option.pointCost > 0 ? `+${option.pointCost}` : 'free'}
                            </span>
                          </button>

                          {/* Chevron */}
                          <button
                            onClick={() => toggleExpanded(option.id)}
                            className="px-3 border-l flex items-center justify-center shrink-0 transition-all"
                            style={{
                              borderColor: selected ? factionColor + '40' : 'var(--color-input-border)',
                              backgroundColor: selected ? factionColor + '18' : 'var(--color-input-bg)',
                            }}
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
                        </div>

                        {/* Expanded profiles */}
                        {expanded && (
                          <div
                            className="mt-1 px-4 py-2.5 rounded-lg"
                            style={{ backgroundColor: factionColor + '0C', border: `1px solid ${factionColor}30` }}
                          >
                            {option.weaponProfiles!.map((p, i) => (
                              <WeaponProfileRow
                                key={i}
                                profile={p}
                                factionColor={factionColor}
                                keywords={keywords}
                                onKeywordClick={handleKeywordClick}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  /* Full-width button (no profiles) */
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
                })
              )}
            </div>
          </div>
        )
      })}

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
