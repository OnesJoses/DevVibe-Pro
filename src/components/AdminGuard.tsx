import React, { useState } from 'react'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Admin access control - only you should see these features
export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const adminPassword = localStorage.getItem('admin_access')
  const isAdmin = adminPassword === 'devvibe_admin_2025'
  
  return isAdmin ? <>{children}</> : <>{fallback}</>
}

// Admin authentication component
export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'devvibe_admin_2025') {
      localStorage.setItem('admin_access', password)
      onLogin()
      setError('')
    } else {
      setError('Invalid admin password')
      setPassword('')
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">🔒 Admin Access Required</h2>
        <p className="text-gray-600 mb-4">Enter the admin password to access management features.</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Access Admin Features
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <div className="font-medium mb-1">Admin features include:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>AI Training Insights Dashboard</li>
            <li>Knowledge Base Management</li>
            <li>ChromaDB Statistics</li>
            <li>Learning Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
