import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminGuard } from '@/components/AdminGuard'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, settings, updateSettings, hydrate } = useAuthStore()

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated, navigate])

  function onThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateSettings({ theme: e.target.value as any })
  }

  function onLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateSettings({ language: e.target.value as any })
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Control language and theme.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select aria-label="Theme" className="px-3 py-2 border border-input rounded-md bg-background" value={settings.theme} onChange={onThemeChange}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select aria-label="Language" className="px-3 py-2 border border-input rounded-md bg-background" value={settings.language} onChange={onLangChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/profile')} variant="outline">Back to Profile</Button>
            <AdminGuard fallback={null}>
              <Button onClick={() => navigate('/knowledge')}>Open Knowledge Manager</Button>
            </AdminGuard>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
