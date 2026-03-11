import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Fireteam } from '../types/game'

interface FireteamStore {
  fireteams: Fireteam[]
  addFireteam: (fireteam: Fireteam) => void
  updateFireteam: (fireteam: Fireteam) => void
  deleteFireteam: (id: string) => void
}

export const useFireteamStore = create<FireteamStore>()(
  persist(
    (set) => ({
      fireteams: [],
      addFireteam: (fireteam) =>
        set((state) => ({ fireteams: [...state.fireteams, fireteam] })),
      updateFireteam: (fireteam) =>
        set((state) => ({
          fireteams: state.fireteams.map((f) =>
            f.id === fireteam.id ? fireteam : f
          ),
        })),
      deleteFireteam: (id) =>
        set((state) => ({
          fireteams: state.fireteams.filter((f) => f.id !== id),
        })),
    }),
    {
      name: 'flashpoint_fireteams',
    }
  )
)
