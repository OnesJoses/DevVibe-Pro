import { create } from 'zustand'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export type Settings = {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr'
}

type AuthState = {
  user: User | null
  settings: Settings
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  updateSettings: (updates: Partial<Settings>) => void
  hydrate: () => void
}

const STORAGE_KEY = 'webcreator_auth'

function persist(state: Pick<AuthState, 'user' | 'settings'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function readPersisted(): Partial<Pick<AuthState, 'user' | 'settings'>> {
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
  settings: { theme: 'system', language: 'en' },
  isAuthenticated: false,
  async login(email, _password) {
    // Mock auth: accepts any password; in real app, call your backend
    const existing = get().user
    const user = existing?.email === email ? existing : {
      id: crypto.randomUUID(),
      name: email.split('@')[0],
      email,
    }
    set({ user, isAuthenticated: true })
    persist({ user, settings: get().settings })
  },
  async register(name, email, _password) {
    const user: User = { id: crypto.randomUUID(), name, email }
    set({ user, isAuthenticated: true })
    persist({ user, settings: get().settings })
  },
  logout() {
    set({ user: null, isAuthenticated: false })
    persist({ user: null, settings: get().settings })
  },
  updateProfile(updates) {
    const user = { ...(get().user as User), ...updates }
    set({ user })
    persist({ user, settings: get().settings })
  },
  updateSettings(updates) {
    const settings = { ...get().settings, ...updates }
    set({ settings })
    persist({ user: get().user, settings })
  },
  hydrate() {
    const persisted = readPersisted()
    const user = persisted.user ?? null
    const settings = persisted.settings ?? { theme: 'system', language: 'en' }
    set({ user, settings, isAuthenticated: !!user })
  },
}))
