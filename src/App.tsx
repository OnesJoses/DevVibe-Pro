import React, { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import ProjectDetailPage from './pages/ProjectDetail'
import ForgotPasswordPage from './pages/ForgotPassword'
import ResetPasswordPage from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import AIPage from './pages/AI'
import AdminHelperPage from './pages/AdminHelper'
import KnowledgeManagerPage from './pages/KnowledgeManager'
import EcommerceDemo from './pages/demos/EcommerceDemo'
import DashboardDemo from './pages/demos/DashboardDemo'
import RestaurantDemo from './pages/demos/RestaurantDemo'
import { useAuthStore } from './hooks/useAuthStore'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const { setSession, hydrate } = useAuthStore()

  useEffect(() => {
    // Hydrate non-session state like settings
    hydrate()

    // Fetch the initial session and set it
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes in authentication state (e.g., login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, hydrate])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/knowledge" element={<KnowledgeManagerPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/admin-helper" element={<AdminHelperPage />} />
        <Route path="/demo/ecommerce" element={<EcommerceDemo />} />
        <Route path="/demo/dashboard" element={<DashboardDemo />} />
        <Route path="/demo/restaurant" element={<RestaurantDemo />} />
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}
