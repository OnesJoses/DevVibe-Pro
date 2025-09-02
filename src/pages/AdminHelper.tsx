import { useEffect, useState } from 'react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminHelperPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Helper</CardTitle>
            <CardDescription>You need to be logged in to see your user ID</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please log in first to get your admin user ID.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin User ID</CardTitle>
          <CardDescription>Copy this ID to set up admin policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your User ID:</label>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm break-all">
              {user.id}
            </div>
          </div>
          
          <Button 
            onClick={() => copyToClipboard(user.id)}
            className="w-full"
          >
            {copied ? 'Copied!' : 'Copy User ID'}
          </Button>

          <div className="text-xs text-muted-foreground">
            <p><strong>Next steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Copy your User ID above</li>
              <li>Go to Supabase SQL Editor</li>
              <li>Replace 'YOUR_USER_ID' with this ID in the security policies</li>
              <li>Run the SQL code</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
