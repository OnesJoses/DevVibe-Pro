import { create } from 'zustand'

// Django API base: set VITE_DJANGO_API_BASE in Vercel. Dev fallback uses local Django.
const DJANGO_BASE = (typeof window !== 'undefined' && (window as any).__VITE_DJANGO_API_BASE__) || 
                   (typeof process !== 'undefined' && process.env?.VITE_DJANGO_API_BASE) || 
                   'http://127.0.0.1:8000'
const API_URL = `${DJANGO_BASE}/api/py/accounts`

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
    console.log('Login attempt to:', `${API_URL}/login`)
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    console.log('Login response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Login error response:', errorText)
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Login failed' }
      }
      throw new Error(error.message || 'Login failed')
    }

    const result = await response.json()
    console.log('Login success:', result)
    const { token, user } = result
    set({ user, token, isAuthenticated: true })
    persist({ user, token, settings: get().settings })
  },
  async register(name, email, password) {
    console.log('Register attempt to:', `${API_URL}/register`)
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    console.log('Register response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Register error response:', errorText)
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Registration failed' }
      }
      throw new Error(error.message || 'Registration failed')
    }
    
    const result = await response.json()
    console.log('Register success:', result)
    const { token, user } = result
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
