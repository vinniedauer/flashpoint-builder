import { useState, useEffect } from 'react'
import type { GameData, Fireteam } from './types/game'
import { useFireteamStore } from './store/fireteamStore'
import { useAuthStore } from './store/authStore'
import { v4 as uuidv4 } from 'uuid'
import FireteamList from './components/FireteamList'
import FireteamDetail from './components/FireteamDetail'
import NewFireteamModal from './components/NewFireteamModal'
import UnitBrowser from './components/UnitBrowser'
import AuthButton from './components/AuthButton'

type Tab = 'fireteams' | 'units'

export default function App() {
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('fireteams')
  const [selectedFireteam, setSelectedFireteam] = useState<Fireteam | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const { addFireteam, fireteams, syncWithAuth } = useFireteamStore()
  const { user } = useAuthStore()

  // Sync fireteam store when auth state changes
  useEffect(() => {
    syncWithAuth(user?.id ?? null)
  }, [user?.id])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}game_data.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load game data')
        return r.json()
      })
      .then((data: GameData) => {
        setGameData(data)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Unknown error')
        setLoading(false)
      })
  }, [])

  // Keep selectedFireteam in sync with store updates
  useEffect(() => {
    if (selectedFireteam) {
      const updated = fireteams.find((f) => f.id === selectedFireteam.id)
      if (updated) setSelectedFireteam(updated)
    }
  }, [fireteams, selectedFireteam?.id])

  const handleCreateFireteam = (name: string, factionId: string, pointBudget: number) => {
    const now = new Date().toISOString()
    const ft: Fireteam = {
      id: uuidv4(),
      name,
      factionId,
      pointBudget,
      entries: [],
      selectedSpecialOrderIds: [],
      selectedCommandUpgradeIds: [],
      createdAt: now,
      modifiedAt: now,
    }
    addFireteam(ft, user?.id ?? null)
    setShowNewModal(false)
    setSelectedFireteam(ft)
    setActiveTab('fireteams')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-text-muted border-t-text-secondary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted font-display uppercase tracking-widest text-sm">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-8">
        <div className="text-center">
          <p className="text-[#C0392B] font-display uppercase tracking-widest text-sm mb-2">
            Error
          </p>
          <p className="text-text-secondary font-display text-base">
            {error ?? 'Failed to load game data'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col w-full max-w-2xl mx-auto">
      {/* Top header with auth */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <span className="text-xs font-display font-semibold uppercase tracking-widest text-text-muted">
          Flashpoint Builder
        </span>
        <AuthButton />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col pb-16">
        {activeTab === 'fireteams' && !selectedFireteam && (
          <FireteamList
            gameData={gameData}
            userId={user?.id ?? null}
            onSelect={(ft) => setSelectedFireteam(ft)}
            onNew={() => setShowNewModal(true)}
          />
        )}
        {activeTab === 'fireteams' && selectedFireteam && (
          <FireteamDetail
            fireteam={selectedFireteam}
            gameData={gameData}
            userId={user?.id ?? null}
            onBack={() => setSelectedFireteam(null)}
          />
        )}
        {activeTab === 'units' && (
          <UnitBrowser gameData={gameData} />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-surface border-t border-border flex z-40">
        <button
          onClick={() => { setActiveTab('fireteams'); setSelectedFireteam(null) }}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          style={{ color: activeTab === 'fireteams' ? '#3A7CA5' : '#6870A0' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-xs font-display font-semibold uppercase tracking-widest">
            Fireteams
          </span>
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors"
          style={{ color: activeTab === 'units' ? '#3A7CA5' : '#6870A0' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-display font-semibold uppercase tracking-widest">
            Units
          </span>
        </button>
      </nav>

      {/* New Fireteam Modal */}
      {showNewModal && (
        <NewFireteamModal
          factions={gameData.factions}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateFireteam}
        />
      )}
    </div>
  )
}
