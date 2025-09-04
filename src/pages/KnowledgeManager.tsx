import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminGuard } from '@/components/AdminGuard'
import { enhancedPostgresAI } from '@/lib/enhanced-local-ai-system'

export default function KnowledgeManagerPage() {
  return (
    <AdminGuard>
      <KnowledgeManagerContent />
    </AdminGuard>
  )
}

function KnowledgeManagerContent() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [backups, setBackups] = useState<string[]>([])
  const [knowledge, setKnowledge] = useState<any[]>([])
  const [excellent, setExcellent] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      const s = await enhancedPostgresAI.getLocalStats(); setStats(s)
      const b = await enhancedPostgresAI.listBackups(); setBackups(b)
      const k = await enhancedPostgresAI.getKnowledgeEntries(); setKnowledge(k)
      const ex = await enhancedPostgresAI.getExcellentResponses(); setExcellent(ex)
      const bl = await enhancedPostgresAI.getBlockedResponses(); setBlocked(bl)
    })()
  }, [])

  const addEntry = async () => {
    if (!title.trim() || !content.trim()) return
    setBusy(true)
    await enhancedPostgresAI.addKnowledgeEntry({
      title: title.trim(),
      content: content.trim(),
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
    })
    setTitle(''); setContent(''); setKeywords('')
    const s = await enhancedPostgresAI.getLocalStats(); setStats(s)
  const k = await enhancedPostgresAI.getKnowledgeEntries(); setKnowledge(k)
    setBusy(false)
  }

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const list: Array<{ title: string; content: string; keywords?: string[] }> = Array.isArray(data) ? data : (data.entries || [])
  await enhancedPostgresAI.importKnowledge(list)
  const s = await enhancedPostgresAI.getLocalStats(); setStats(s)
  const k = await enhancedPostgresAI.getKnowledgeEntries(); setKnowledge(k)
    } catch (err) {
      console.error('Import failed:', err)
    } finally {
      setBusy(false)
    }
  }

  const createBackup = async () => {
    setBusy(true)
    await enhancedPostgresAI.createBackup()
    const b = await enhancedPostgresAI.listBackups(); setBackups(b)
    setBusy(false)
  }

  const restore = async (name: string) => {
    setBusy(true)
    await enhancedPostgresAI.restoreFromBackup(name)
    const s = await enhancedPostgresAI.getLocalStats(); setStats(s)
    const k = await enhancedPostgresAI.getKnowledgeEntries(); setKnowledge(k)
    const ex = await enhancedPostgresAI.getExcellentResponses(); setExcellent(ex)
    const bl = await enhancedPostgresAI.getBlockedResponses(); setBlocked(bl)
    setBusy(false)
  }

  const exportAll = async () => {
    setBusy(true)
    try {
      const data = await enhancedPostgresAI.getAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devvibe-knowledge-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Knowledge Manager</h1>
      <Card>
        <CardHeader>
          <CardTitle>Train the AI</CardTitle>
          <CardDescription>Add knowledge entries, import JSON, and manage backups.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input className="w-full px-3 py-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Project kickoff process" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea className="w-full px-3 py-2 border rounded min-h-[140px]" value={content} onChange={e => setContent(e.target.value)} placeholder="Detailed answer or article..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
                  <input className="w-full px-3 py-2 border rounded" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="kickoff, process, onboarding" />
                </div>
                <Button onClick={addEntry} disabled={busy || !title.trim() || !content.trim()}>Add to Knowledge</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Import JSON</label>
                <input type="file" accept="application/json" onChange={onImportFile} />
                <div className="text-xs text-slate-500 mt-1">Format: array of {`{ title, content, keywords? }`} or {`{ entries: [...] }`}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Backups</div>
                <div className="flex flex-wrap gap-2">
                  {backups.map((b) => (
                    <Badge key={b} variant="outline" className="cursor-pointer" onClick={() => restore(b)}>{b}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={createBackup} disabled={busy}>Create Backup</Button>
                  <Button variant="outline" onClick={exportAll} disabled={busy}>Export JSON</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-slate-600">Stats</div>
            <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto">{JSON.stringify(stats, null, 2)}</pre>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-sm font-medium mb-2">Knowledge ({knowledge.length})</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {knowledge.map((k, i) => (
                    <div key={i} className="text-xs p-2 border rounded">
                      <div className="font-semibold">{k.title}</div>
                      <div className="opacity-70 line-clamp-2">{k.content}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Excellent ({excellent.length})</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {excellent.map((e, i) => (
                    <div key={i} className="text-xs p-2 border rounded">
                      <div className="opacity-70 line-clamp-2">{e.question}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Blocked ({blocked.length})</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {blocked.map((b, i) => (
                    <div key={i} className="text-xs p-2 border rounded">
                      <div className="opacity-70 line-clamp-2">{b.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
