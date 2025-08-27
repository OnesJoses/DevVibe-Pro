import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

// Django API base: set VITE_DJANGO_API_BASE in Vercel. Dev fallback uses local Django.
const DJANGO_BASE = (typeof window !== 'undefined' && (window as any).__VITE_DJANGO_API_BASE__) || 
                   (typeof process !== 'undefined' && process.env?.VITE_DJANGO_API_BASE) || 
                   'http://127.0.0.1:8000'
const API_URL = `${DJANGO_BASE}/api/py/accounts`

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      console.log('Forgot password request to:', `${API_URL}/forgot-password`)
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      console.log('Forgot password response:', result)

      if (response.ok) {
        setMessage(result.message || 'If the email exists, a reset link has been sent.')
      } else {
        setError(result.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password failed:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Sent</CardTitle>
            <CardDescription>Check your email for reset instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input 
                id="email" 
                type="email" 
                className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            Remember your password? <Link to="/login" className="underline">Back to Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
