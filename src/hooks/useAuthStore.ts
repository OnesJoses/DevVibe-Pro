import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

export type User = {
  id: string // Supabase uses UUIDs for user IDs
  name: string | null
  email: string | undefined
  avatarUrl?: string
}

export type Settings = {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr'
}

type AuthState = {
  user: User | null
  session: Session | null // Store the full Supabase session
  settings: Settings
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => void
  updateSettings: (updates: Partial<Settings>) => void
  setSession: (session: Session | null) => void // To be called by the auth state change listener
  hydrate: () => void
}

const STORAGE_KEY = 'devvibe_auth'

function persist(state: { user: User | null; token: string | null; settings: Settings }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function readPersisted(): Partial<{ user: User; token: string; settings: Settings }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  settings: { theme: 'system', language: 'en' },
  isAuthenticated: false,

  setSession: (session) => {
    if (session) {
      const user: User = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || null,
        avatarUrl: session.user.user_metadata?.avatar_url || undefined,
      }
      set({ session, user, isAuthenticated: true })
      persist({ user, token: session.access_token, settings: get().settings })
    } else {
      set({ session: null, user: null, isAuthenticated: false })
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    // The onAuthStateChange listener will handle setting the session
  },

  async register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // You can pass extra data to be stored in user_metadata
        },
      },
    })
    if (error) throw error
    // The onAuthStateChange listener will handle setting the session
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // The onAuthStateChange listener will handle clearing the session
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.user) return state
      const updatedUser = { ...state.user, ...updates }
      persist({ user: updatedUser, token: state.session?.access_token || null, settings: state.settings })
      return { user: updatedUser }
    })
  },

  updateSettings: (updates) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...updates }
      persist({ user: state.user, token: state.session?.access_token || null, settings: updatedSettings })
      return { settings: updatedSettings }
    })
  },

  hydrate: () => {
    // Hydration is now primarily handled by the onAuthStateChange listener,
    // which runs on app load and restores the session from Supabase.
    // This function can be kept for settings or other non-session state.
    const persisted = readPersisted()
    if (persisted.settings) {
      set({ settings: persisted.settings })
    }
  },
}))
