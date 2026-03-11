import { create } from 'zustand'
import type { Fireteam } from '../types/game'
import { supabase } from '../lib/supabase'

const LOCAL_KEY = 'flashpoint_fireteams'

function loadLocal(): Fireteam[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveLocal(fireteams: Fireteam[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(fireteams))
}

interface FireteamStore {
  fireteams: Fireteam[]
  // Call when auth state changes (pass userId or null)
  syncWithAuth: (userId: string | null) => Promise<void>
  addFireteam: (fireteam: Fireteam, userId: string | null) => Promise<void>
  updateFireteam: (fireteam: Fireteam, userId: string | null) => Promise<void>
  deleteFireteam: (id: string, userId: string | null) => Promise<void>
}

export const useFireteamStore = create<FireteamStore>((set, get) => ({
  fireteams: loadLocal(),

  syncWithAuth: async (userId) => {
    if (!userId) {
      // Guest: load from localStorage
      set({ fireteams: loadLocal() })
      return
    }
    // Logged in: load from Supabase
    const { data, error } = await supabase
      .from('fireteams')
      .select('*')
      .order('modified_at', { ascending: false })
    if (!error && data) {
      // Supabase stores snake_case columns, map to camelCase
      const fireteams: Fireteam[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        factionId: row.faction_id as string,
        pointBudget: row.point_budget as number,
        entries: row.entries as Fireteam['entries'],
        selectedSpecialOrderIds: row.selected_special_order_ids as string[],
        selectedCommandUpgradeIds: row.selected_command_upgrade_ids as string[],
        createdAt: row.created_at as string,
        modifiedAt: row.modified_at as string,
      }))
      set({ fireteams })
    }
  },

  addFireteam: async (fireteam, userId) => {
    if (!userId) {
      const updated = [fireteam, ...get().fireteams]
      saveLocal(updated)
      set({ fireteams: updated })
      return
    }
    await supabase.from('fireteams').insert({
      id: fireteam.id,
      user_id: userId,
      name: fireteam.name,
      faction_id: fireteam.factionId,
      point_budget: fireteam.pointBudget,
      entries: fireteam.entries,
      selected_special_order_ids: fireteam.selectedSpecialOrderIds,
      selected_command_upgrade_ids: fireteam.selectedCommandUpgradeIds,
      created_at: fireteam.createdAt,
      modified_at: fireteam.modifiedAt,
    })
    set({ fireteams: [fireteam, ...get().fireteams] })
  },

  updateFireteam: async (fireteam, userId) => {
    const updated = get().fireteams.map((f) => (f.id === fireteam.id ? fireteam : f))
    if (!userId) {
      saveLocal(updated)
      set({ fireteams: updated })
      return
    }
    await supabase.from('fireteams').update({
      name: fireteam.name,
      faction_id: fireteam.factionId,
      point_budget: fireteam.pointBudget,
      entries: fireteam.entries,
      selected_special_order_ids: fireteam.selectedSpecialOrderIds,
      selected_command_upgrade_ids: fireteam.selectedCommandUpgradeIds,
      modified_at: new Date().toISOString(),
    }).eq('id', fireteam.id)
    set({ fireteams: updated })
  },

  deleteFireteam: async (id, userId) => {
    const updated = get().fireteams.filter((f) => f.id !== id)
    if (!userId) {
      saveLocal(updated)
      set({ fireteams: updated })
      return
    }
    await supabase.from('fireteams').delete().eq('id', id)
    set({ fireteams: updated })
  },
}))
