/**
 * Node/Electron-only storage backend for EnhancedLocalAISystem.
 * DO NOT import this in browser bundles. Use it from Node/Electron code only.
 */
// Node-only imports
import * as fs from 'fs/promises'
import * as path from 'path'

import type { AIStorage, AIStorageInfo } from './enhanced-local-ai-system'

type ConversationEntry = {
  id: string
  question: string
  answer: string
  rating?: number
  timestamp: string
  blocked: boolean
}

type FreshKnowledgeEntry = {
  id: string
  title: string
  content: string
  keywords: string[]
  rating: number
  usageCount: number
  timestamp: string
  blocked: boolean
}

type AIStats = {
  totalEntries: number
  totalExcellent: number
  totalBlocked: number
  totalQueries: number
  categories: string[]
}

export class NodeFileAIStorage implements AIStorage {
  private dataDir: string
  private files = {
    conversations: 'conversations.json',
    excellent: 'excellent.json',
    knowledge: 'knowledge.json',
    blocked: 'blocked.json',
    meta: 'meta.json',
    backups: 'backups'
  }

  constructor(options?: { dataDir?: string }) {
    this.dataDir = options?.dataDir || path.resolve(process.cwd(), 'ai-data')
  }

  private async ensureDir(p: string) {
    await fs.mkdir(p, { recursive: true })
  }

  private filePath(name: keyof typeof this.files): string {
    const n = this.files[name]
    return path.resolve(this.dataDir, n)
  }

  private async safeReadJSON<T>(p: string, fallback: T): Promise<T> {
    try {
      const buf = await fs.readFile(p, 'utf8')
      return JSON.parse(buf) as T
    } catch {
      return fallback
    }
  }

  private async safeWriteJSON(p: string, value: any): Promise<void> {
    const dir = path.dirname(p)
    await this.ensureDir(dir)
    await fs.writeFile(p, JSON.stringify(value, null, 2), 'utf8')
  }

  async initialize(): Promise<boolean> {
    try {
      await this.ensureDir(this.dataDir)
      // Ensure files exist
      await this.safeWriteJSON(this.filePath('conversations'), await this.safeReadJSON(this.filePath('conversations'), []))
      await this.safeWriteJSON(this.filePath('excellent'), await this.safeReadJSON(this.filePath('excellent'), []))
      await this.safeWriteJSON(this.filePath('blocked'), await this.safeReadJSON(this.filePath('blocked'), []))
      await this.safeWriteJSON(this.filePath('knowledge'), await this.safeReadJSON(this.filePath('knowledge'), { entries: [] }))
      await this.safeWriteJSON(this.filePath('meta'), await this.safeReadJSON(this.filePath('meta'), { totalQueries: 0 }))
      await this.ensureDir(path.resolve(this.dataDir, this.files.backups))
      return true
    } catch {
      return false
    }
  }

  async getExcellentResponses(): Promise<ConversationEntry[]> {
    return this.safeReadJSON<ConversationEntry[]>(this.filePath('excellent'), [])
  }

  async getKnowledgeEntries(): Promise<FreshKnowledgeEntry[]> {
    const blob = await this.safeReadJSON<{ entries: FreshKnowledgeEntry[] }>(this.filePath('knowledge'), { entries: [] })
    return Array.isArray(blob) ? [] : (blob.entries || [])
  }

  async getBlockedResponses(): Promise<ConversationEntry[]> {
    return this.safeReadJSON<ConversationEntry[]>(this.filePath('blocked'), [])
  }

  async saveConversation(entry: ConversationEntry): Promise<void> {
    const list = await this.safeReadJSON<ConversationEntry[]>(this.filePath('conversations'), [])
    list.push(entry)
    await this.safeWriteJSON(this.filePath('conversations'), list)
    const meta = await this.safeReadJSON<{ totalQueries: number }>(this.filePath('meta'), { totalQueries: 0 })
    meta.totalQueries = (meta.totalQueries || 0) + 1
    await this.safeWriteJSON(this.filePath('meta'), meta)
  }

  async saveExcellentResponse(entry: ConversationEntry): Promise<void> {
    const list = await this.safeReadJSON<ConversationEntry[]>(this.filePath('excellent'), [])
    if (!list.some(x => x.question.toLowerCase() === entry.question.toLowerCase())) {
      list.push(entry)
      await this.safeWriteJSON(this.filePath('excellent'), list)
    }
  }

  async saveKnowledgeEntry(entry: FreshKnowledgeEntry): Promise<void> {
    const blob = await this.safeReadJSON<{ entries: FreshKnowledgeEntry[] }>(this.filePath('knowledge'), { entries: [] })
    const entries = Array.isArray(blob) ? [] : (blob.entries || [])
    entries.push(entry)
    await this.safeWriteJSON(this.filePath('knowledge'), { entries })
  }

  async blockResponse(entry: ConversationEntry): Promise<void> {
    const list = await this.safeReadJSON<ConversationEntry[]>(this.filePath('blocked'), [])
    list.push(entry)
    await this.safeWriteJSON(this.filePath('blocked'), list)
  }

  async getStats(): Promise<AIStats> {
    const knowledge = await this.getKnowledgeEntries()
    const excellent = await this.getExcellentResponses()
    const blocked = await this.getBlockedResponses()
    const meta = await this.safeReadJSON<{ totalQueries: number }>(this.filePath('meta'), { totalQueries: 0 })
    const categories = ['user-questions', 'business', 'projects', 'services', 'technical']
    return {
      totalEntries: knowledge.length,
      totalExcellent: excellent.length,
      totalBlocked: blocked.length,
      totalQueries: meta.totalQueries || 0,
      categories
    }
  }

  async getStorageInfo(): Promise<AIStorageInfo> {
    let usage = 0
    const files = ['conversations', 'excellent', 'blocked', 'knowledge', 'meta'] as const
    for (const f of files) {
      try {
        const stat = await fs.stat(this.filePath(f))
        usage += stat.size
      } catch {}
    }
    return { type: 'node-filesystem', usageBytes: usage }
  }

  async clearAllData(): Promise<void> {
    await this.createBackup()
    await this.safeWriteJSON(this.filePath('conversations'), [])
    await this.safeWriteJSON(this.filePath('excellent'), [])
    await this.safeWriteJSON(this.filePath('blocked'), [])
    await this.safeWriteJSON(this.filePath('knowledge'), { entries: [] })
    await this.safeWriteJSON(this.filePath('meta'), { totalQueries: 0 })
  }

  async createBackup(): Promise<string | null> {
    const snapshot = {
      conversations: await this.safeReadJSON<ConversationEntry[]>(this.filePath('conversations'), []),
      excellent: await this.safeReadJSON<ConversationEntry[]>(this.filePath('excellent'), []),
      blocked: await this.safeReadJSON<ConversationEntry[]>(this.filePath('blocked'), []),
      knowledge: await this.safeReadJSON<{ entries: FreshKnowledgeEntry[] }>(this.filePath('knowledge'), { entries: [] }),
      meta: await this.safeReadJSON<{ totalQueries: number }>(this.filePath('meta'), { totalQueries: 0 }),
      createdAt: new Date().toISOString()
    }
    const name = `${Date.now()}.json`
    const p = path.resolve(this.dataDir, this.files.backups, name)
    await this.safeWriteJSON(p, snapshot)
    return name
  }

  async listBackups(): Promise<string[]> {
    try {
      const dir = path.resolve(this.dataDir, this.files.backups)
      const list = await fs.readdir(dir)
      return list.filter(f => f.endsWith('.json')).sort()
    } catch {
      return []
    }
  }

  async restoreFromBackup(name: string): Promise<boolean> {
    try {
      const p = path.resolve(this.dataDir, this.files.backups, name)
      const raw = await fs.readFile(p, 'utf8')
      const snap = JSON.parse(raw)
      await this.safeWriteJSON(this.filePath('conversations'), snap.conversations || [])
      await this.safeWriteJSON(this.filePath('excellent'), snap.excellent || [])
      await this.safeWriteJSON(this.filePath('blocked'), snap.blocked || [])
      await this.safeWriteJSON(this.filePath('knowledge'), snap.knowledge || { entries: [] })
      await this.safeWriteJSON(this.filePath('meta'), snap.meta || { totalQueries: 0 })
      return true
    } catch {
      return false
    }
  }

  async exportData(pathOrName: string): Promise<boolean> {
    try {
      const data = {
        conversations: await this.safeReadJSON<ConversationEntry[]>(this.filePath('conversations'), []),
        excellent: await this.safeReadJSON<ConversationEntry[]>(this.filePath('excellent'), []),
        blocked: await this.safeReadJSON<ConversationEntry[]>(this.filePath('blocked'), []),
        knowledge: await this.safeReadJSON<{ entries: FreshKnowledgeEntry[] }>(this.filePath('knowledge'), { entries: [] }),
        meta: await this.safeReadJSON<{ totalQueries: number }>(this.filePath('meta'), { totalQueries: 0 }),
        exportedAt: new Date().toISOString()
      }
      await this.safeWriteJSON(path.resolve(this.dataDir, pathOrName || 'export.json'), data)
      return true
    } catch {
      return false
    }
  }

  async shutdown(): Promise<void> {
    // no-op
    return
  }
}

export default NodeFileAIStorage
