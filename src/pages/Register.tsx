import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated, hydrate } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => { if (isAuthenticated) navigate('/profile') }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password)
      // After successful register, go to profile
      navigate('/profile')
    } catch (error) {
      console.error('Registration failed:', error)
      alert(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input id="name" type="text" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input id="password" type="password" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
