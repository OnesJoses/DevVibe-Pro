import { create } from 'zustand'

const API_URL = 'http://localhost:3001/api/auth'

export type User = {
  id: number // Changed to number to match the database
  name: string | null
  email: string
  avatarUrl?: string
}

export type Settings = {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr'
}

type AuthState = {
  user: User | null
  token: string | null
  settings: Settings
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  updateSettings: (updates: Partial<Settings>) => void
  hydrate: () => void
}

const STORAGE_KEY = 'devvibe_auth'

function persist(state: Pick<AuthState, 'user' | 'token' | 'settings'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function readPersisted(): Partial<Pick<AuthState, 'user' | 'token' | 'settings'>> {
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
  token: null,
  settings: { theme: 'system', language: 'en' },
  isAuthenticated: false,
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const { token, user } = await response.json()
    set({ user, token, isAuthenticated: true })
    persist({ user, token, settings: get().settings })
  },
  async register(name, email, password) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }
    
    const { token, user } = await response.json()
    set({ user, token, isAuthenticated: true })
    persist({ user, token, settings: get().settings })
  },
  logout() {
    set({ user: null, token: null, isAuthenticated: false })
    persist({ user: null, token: null, settings: get().settings })
  },
  updateProfile(updates) {
    // This should ideally be an API call to a /profile endpoint
    const user = { ...(get().user as User), ...updates }
    set({ user })
    persist({ user, token: get().token, settings: get().settings })
  },
  updateSettings(updates) {
    const settings = { ...get().settings, ...updates }
    set({ settings })
    persist({ user: get().user, token: get().token, settings })
  },
  hydrate() {
    const persisted = readPersisted()
    const user = persisted.user ?? null
    const token = persisted.token ?? null
    const settings = persisted.settings ?? { theme: 'system', language: 'en' }
    set({ user, token, settings, isAuthenticated: !!token })
  },
}))
