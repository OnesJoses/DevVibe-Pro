import React from 'react'
import { HashRouter, Route, Routes, Link, useNavigate } from 'react-router'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function AccountMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, hydrate } = useAuthStore()
  // hydrate on mount
  React.useEffect(() => { hydrate() }, [hydrate])

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/login">Log in</Link></Button>
        <Button asChild size="sm"><Link to="/register">Sign up</Link></Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline"><Link to="/profile">Profile</Link></Button>
      <Button asChild size="sm" variant="ghost"><Link to="/settings">Settings</Link></Button>
      <button
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-input hover:bg-accent"
        onClick={() => { logout(); navigate('/'); }}
        aria-label="Log out"
      >
        <Avatar className="h-6 w-6">
          <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <span className="text-sm">Log out</span>
      </button>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      {/* Global header bar with account menu */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-end">
          <div className="pointer-events-auto">
            <AccountMenu />
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  )
}
