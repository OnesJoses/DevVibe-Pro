import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import ProfilePage from './pages/Profile'
import SettingsPage from './pages/Settings'
import ProjectDetailPage from './pages/ProjectDetail'

export default function App() {
  return (
    <HashRouter>
      <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/*" element={<HomePage />} />
  <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  )
}
