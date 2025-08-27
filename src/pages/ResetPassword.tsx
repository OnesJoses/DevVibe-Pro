import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

// Django API base: set VITE_DJANGO_API_BASE in Vercel. Dev fallback uses local Django.
const DJANGO_BASE = (typeof window !== 'undefined' && (window as any).__VITE_DJANGO_API_BASE__) || 
                   (typeof process !== 'undefined' && process.env?.VITE_DJANGO_API_BASE) || 
                   'http://127.0.0.1:8000'
const API_URL = `${DJANGO_BASE}/api/py/accounts`

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!uid || !token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [uid, token])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('Reset password request to:', `${API_URL}/reset-password`)
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password }),
      })

      const result = await response.json()
      console.log('Reset password response:', result)

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password failed:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>This password reset link is invalid</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Request New Reset Link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>Your password has been updated</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your password has been successfully reset. You will be redirected to login shortly.
            </p>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              Go to Login Now
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
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
              <input 
                id="password" 
                type="password" 
                className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
