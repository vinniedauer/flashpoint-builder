import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthStore {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize session on store creation
  supabase.auth.getSession().then(({ data: { session } }) => {
    set({ user: session?.user ?? null, loading: false })
  })

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ user: session?.user ?? null, loading: false })
  })

  return {
    user: null,
    loading: true,
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
      })
    },
    signInWithGitHub: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
      })
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }
})
