import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, hydrate } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => { if (isAuthenticated) navigate('/profile') }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
    } catch (error) {
      console.error('Login failed:', error)
      alert(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back. Enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input id="password" type="password" className="w-full px-3 py-2 border border-input rounded-md bg-background" value={password} onChange={e=>setPassword(e.target.value)} required />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">No account? <Link to="/register" className="underline">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
