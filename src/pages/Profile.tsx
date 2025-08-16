import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, hydrate, logout, updateProfile } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({ name, email })
    // After saving profile, return to homepage
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/settings">Settings</Link></Button>
          <Button variant="secondary" onClick={logout}>Log out</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input id="name" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
