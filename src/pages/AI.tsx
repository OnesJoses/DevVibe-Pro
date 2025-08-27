import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

// Build a small in-app knowledge base about you and this project.
const DJANGO_BASE = (typeof window !== 'undefined' && (window as any).__VITE_DJANGO_API_BASE__) ||
  (typeof process !== 'undefined' && (process as any).env?.VITE_DJANGO_API_BASE) ||
  'http://127.0.0.1:8000'

const KB = [
  {
    title: 'Who am I and what do I do?',
    keywords: ['who', 'about', 'you', 'onesmus', 'profile', 'intro'],
    answer: `You're speaking with an AI guide for Onesmus M.—a full‑stack developer, UI/UX designer, and digital creator. I design and build production‑ready web apps end‑to‑end: frontend (React + TypeScript + Tailwind), backend (Django REST Framework with JWT auth), and deployments (Vercel for frontend, Render for backend). I focus on clean code, great UX, and results.`
  },
  {
    title: 'What tech stack powers this project?',
    keywords: ['tech', 'stack', 'technology', 'frameworks', 'libraries', 'tools'],
    answer: `Frontend: React 18 + TypeScript with a lightweight esbuild setup and HashRouter SPA; styling via Tailwind/shadcn UI.
Backend: Django 5 + DRF + SimpleJWT for auth + django-cors-headers.
Hosting: Vercel (frontend) and Render (Django API). Analytics: Vercel Web Analytics.
Environment: API base is ${DJANGO_BASE}.`
  },
  {
    title: 'How does authentication work?',
    keywords: ['auth', 'login', 'register', 'jwt', 'token', 'security'],
    answer: `Users register and log in against the Django API using JSON endpoints. The API returns a JWT access token stored client‑side for subsequent requests. Endpoints: POST /api/py/accounts/register, POST /api/py/accounts/login, GET /api/py/accounts/me (auth required).`
  },
  {
    title: 'Forgot/Reset password flow',
    keywords: ['forgot', 'reset', 'password', 'email', 'recover'],
    answer: `Use the "Forgot password" link on the Login page. The app posts to POST /api/py/accounts/forgot-password to send a reset link via email. The link opens the Reset Password screen (#/reset-password) which calls POST /api/py/accounts/reset-password with uid, token, and the new password.`
  },
  {
    title: 'Deployment details',
    keywords: ['deploy', 'deployment', 'vercel', 'render', 'hosting', 'prod', 'production'],
    answer: `Frontend is deployed on Vercel as a static SPA with hash routing and a global SPA rewrite.
Backend (Django) is deployed on Render with WhiteNoise for static files and env‑driven settings (CORS/CSRF, SECRET_KEY, DB, email).`
  },
  {
    title: 'Services offered',
    keywords: ['services', 'offer', 'what can you do', 'capabilities', 'skills'],
    answer: `• Web apps and dashboards (React/TS)
• REST APIs (Django/DRF), auth (JWT), integrations
• UI/UX design systems, component libraries
• Deployment pipelines (Vercel/Render) and analytics
• Performance, accessibility, and SEO improvements`
  },
  {
    title: 'Contact and next steps',
    keywords: ['contact', 'reach', 'email', 'hire', 'work together'],
    answer: `You can reach me at onesjoses5@gmail.com or via the Contact section. For projects: share your goals, timeline, and budget; I’ll propose a scoped plan with milestones.`
  }
]

function searchKB(question: string): string {
  const q = question.toLowerCase()
  let best: { score: number; answer: string } = { score: 0, answer: '' }
  for (const item of KB) {
    const score = item.keywords.reduce((s, k) => (q.includes(k) ? s + 1 : s), 0)
    if (score > best.score) best = { score, answer: `${item.title}\n\n${item.answer}` }
  }
  if (best.score === 0) {
    return `Here’s a quick overview:

• I build full‑stack web apps (React + TypeScript + Django).
• Deployed: frontend on Vercel, backend on Render at ${DJANGO_BASE}.
• Auth via JWT; features include login/register/profile and password reset by email.
• I offer development, design, and deployment services end‑to‑end.

Ask about: tech stack, authentication, deployment, services, or how to get started.`
  }
  return best.answer
}

export default function AIPage() {
  const [input, setInput] = useState('What tech stack powers this project?')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hi! I’m your AI guide. Ask me about my skills, this project’s stack, auth, deployment, or services.` }
  ])

  function onAsk(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const q = input.trim()
    if (!q) return
    const reply = searchKB(q)
    setMessages((m) => [...m, { role: 'user', content: q }, { role: 'assistant', content: reply }])
    setInput('')
  }

  const suggestions = useMemo(() => [
    'What services do you offer?',
    'How does authentication work?',
    'Explain the deployment architecture',
    'How do I reset my password?',
    'What tools and libraries are used?',
  ], [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>AI Project Guide</CardTitle>
          <CardDescription>Ask about my skills and how this project is built and deployed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3 max-h-[50vh] overflow-y-auto border rounded-md p-3 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block text-sm px-3 py-2 rounded-md ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                    {m.content.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <form className="flex gap-2" onSubmit={onAsk}>
              <input
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Ask me anything about the project…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit">Ask</Button>
            </form>

            {/* Free web search (no API, opens in a new tab) */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const q = input.trim() || 'Onesmus portfolio DevVibe Pro project overview'
                  window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`, '_blank')
                }}
              >
                Search on Perplexity
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const q = input.trim() || 'Onesmus portfolio DevVibe Pro project overview'
                  window.open(`https://copilot.microsoft.com/?q=${encodeURIComponent(q)}`, '_blank')
                }}
              >
                Search on Copilot
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s, i) => (
                <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => { setInput(s); }}>
                  {s}
                </Badge>
              ))}
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              Tip: This is an on-device guide (no external AI calls). If you want real AI responses later, we can connect an API key and a simple server proxy.
            </div>

            <div className="pt-4 text-sm">
              <Link to="/" className="underline">Back to Home</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
