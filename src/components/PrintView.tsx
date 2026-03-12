import type { Fireteam, GameData } from '../types/game'
import { fireteamPoints, entryPoints } from '../utils/points'

interface Props {
  fireteam: Fireteam
  gameData: GameData
}

function baseKeyword(kw: string): string {
  return kw.replace(/\s*\(\d+\)$/, '').trim()
}

const mono: React.CSSProperties = { fontFamily: 'Courier New, Courier, monospace' }
const label: React.CSSProperties = { fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#666', marginBottom: 3 }
const rule: React.CSSProperties = { borderBottom: '1px solid #ccc', marginBottom: 6, paddingBottom: 4 }

export default function PrintView({ fireteam, gameData }: Props) {
  const faction = gameData.factions.find((f) => f.id === fireteam.factionId)
  const total = fireteamPoints(fireteam, gameData)

  const specialOrders = fireteam.selectedSpecialOrderIds
    .map((id) => faction?.specialOrders.find((o) => o.id === id))
    .filter(Boolean) as NonNullable<typeof faction>['specialOrders']

  const commandUpgrades = fireteam.selectedCommandUpgradeIds
    .map((id) => gameData.commandUpgrades.find((c) => c.id === id))
    .filter(Boolean) as typeof gameData.commandUpgrades

  // Collect unique base keywords used across all units in this fireteam
  const usedBaseNames = new Set<string>()
  for (const entry of fireteam.entries) {
    const unit = gameData.factions.flatMap((f) => f.units).find((u) => u.id === entry.unitId)
    for (const kw of unit?.stats?.keywords ?? []) usedBaseNames.add(baseKeyword(kw))
  }
  const glossary = gameData.keywords
    .filter((k) => usedBaseNames.has(k.name))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div
      className="print-only"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        color: '#000',
        padding: '1in',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '9px',
        lineHeight: 1.45,
        zIndex: 9999,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #000', paddingBottom: 6, marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {fireteam.name}
          </span>
          <span style={{ marginLeft: 10, fontSize: '10px', color: '#444' }}>
            {faction?.name ?? fireteam.factionId} · Halo Flashpoint
          </span>
        </div>
        <span style={{ ...mono, fontSize: '13px', fontWeight: 700 }}>
          {total} / {fireteam.pointBudget} pts
        </span>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'grid', gridTemplateColumns: glossary.length > 0 ? '3fr 2fr' : '1fr', gap: '0.35in', alignItems: 'start' }}>

        {/* ── Left: orders + soldiers ── */}
        <div>
          {/* Special Orders */}
          {specialOrders.length > 0 && (
            <div style={{ ...rule, marginBottom: 8 }}>
              <div style={label}>Special Orders</div>
              {specialOrders.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 6 }}>
                  <span style={{ fontWeight: 600 }}>{o.name}</span>
                  <span style={mono}>+{o.pointCost} pts</span>
                </div>
              ))}
            </div>
          )}

          {/* Command Upgrades */}
          {commandUpgrades.length > 0 && (
            <div style={{ ...rule, marginBottom: 8 }}>
              <div style={label}>Command Upgrades</div>
              {commandUpgrades.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 6 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={mono}>+{c.pointCost} pts</span>
                </div>
              ))}
            </div>
          )}

          {/* Soldiers */}
          <div style={label}>Soldiers ({fireteam.entries.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '7px' }}>
            {fireteam.entries.map((entry) => {
              const unit = gameData.factions.flatMap((f) => f.units).find((u) => u.id === entry.unitId)
              if (!unit) return null
              const pts = entryPoints(entry, unit, gameData.weaponUpgrades)

              const upgradeLines: string[] = []
              for (const slot of unit.upgradeSlots) {
                const ids = entry.selectedUpgrades[slot.id] ?? []
                if (ids.length === 0) continue
                let names: string[]
                if (slot.slotType === 'weapon_melee' || slot.slotType === 'weapon_ranged') {
                  names = ids.map((id) => gameData.weaponUpgrades.find((w) => w.id === id)?.name ?? id)
                } else {
                  names = ids.map((id) => slot.options.find((o) => o.id === id)?.name ?? id)
                }
                upgradeLines.push(`${slot.name}: ${names.join(', ')}`)
              }

              const s = unit.stats

              return (
                <div key={entry.id} style={{ border: '1.5px solid #999', borderRadius: 4, overflow: 'hidden', breakInside: 'avoid' }}>

                  {/* Name bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: '#111', color: '#fff', padding: '4px 7px' }}>
                    <span style={{ fontWeight: 800, fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{unit.name}</span>
                    <span style={{ ...mono, fontSize: '9px', fontWeight: 700 }}>{pts} pts</span>
                  </div>

                  <div style={{ padding: '5px 7px' }}>

                    {/* Upgrades */}
                    {upgradeLines.length > 0 && (
                      <div style={{ fontSize: '7.5px', color: '#444', marginBottom: 5, paddingBottom: 4, borderBottom: '1px solid #e0e0e0' }}>
                        {upgradeLines.join(' · ')}
                      </div>
                    )}

                    {/* Stats grid */}
                    {s && (
                      <div style={{ display: 'flex', marginBottom: 5, border: '1px solid #ddd', borderRadius: 3, overflow: 'hidden' }}>
                        {[
                          { l: 'HP', v: String(s.hp) },
                          { l: 'RA', v: s.ra },
                          { l: 'FI', v: s.fi },
                          { l: 'SV', v: s.sv },
                          { l: 'SH', v: String(s.shields) },
                          { l: 'MV', v: `${s.advance}-${s.sprint}` },
                        ].map(({ l, v }, i) => (
                          <div key={l} style={{ flex: 1, textAlign: 'center', padding: '2px 0', borderLeft: i > 0 ? '1px solid #ddd' : 'none' }}>
                            <div style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>{l}</div>
                            <div style={{ ...mono, fontSize: '10px', fontWeight: 800, color: '#000' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Weapons */}
                    {(s?.weapons.length ?? 0) > 0 && (
                      <div style={{ marginBottom: (s?.keywords.length ?? 0) > 0 ? 4 : 0 }}>
                        <div style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 2 }}>Weapons</div>
                        {s!.weapons.map((w) => (
                          <div key={w.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '8px', marginBottom: 1 }}>
                            <span style={{ fontWeight: 600 }}>{w.name}</span>
                            <span style={{ ...mono, color: '#333', fontSize: '7.5px', whiteSpace: 'nowrap', marginLeft: 4 }}>
                              {w.range} · A{w.attacks}{w.special ? ` · ${w.special}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Keywords */}
                    {(s?.keywords.length ?? 0) > 0 && (
                      <div style={{ fontSize: '7px', color: '#555', fontStyle: 'italic', borderTop: '1px solid #e8e8e8', paddingTop: 3 }}>
                        {s!.keywords.join(', ')}
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: keyword glossary ── */}
        {glossary.length > 0 && (
          <div>
            <div style={label}>Keyword Reference</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {glossary.map((kw) => (
                <div key={kw.name} style={{ borderLeft: '2px solid #ccc', paddingLeft: 5 }}>
                  <span style={{ fontWeight: 700, fontSize: '8.5px' }}>{kw.name}</span>
                  <span style={{ fontSize: '8px', color: '#333' }}> — {kw.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
