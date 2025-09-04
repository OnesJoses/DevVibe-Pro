/**
 * PostgreSQL AI Storage - Backend API Integration
 * Connects frontend to PostgreSQL database via API calls
 */

interface ConversationEntry {
  id: string
  question: string
  answer: string
  rating?: number
  timestamp: string
  blocked: boolean
}

interface FreshKnowledgeEntry {
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

export interface AIStorageInfo {
  type: string
  usageBytes: number
}

export interface AIStorage {
  initialize(): Promise<boolean>
  // read
  getExcellentResponses(): Promise<ConversationEntry[]>
  getKnowledgeEntries(): Promise<FreshKnowledgeEntry[]>
  getBlockedResponses(): Promise<ConversationEntry[]>
  // write
  saveConversation(entry: ConversationEntry): Promise<void>
  saveExcellentResponse(entry: ConversationEntry): Promise<void>
  saveKnowledgeEntry(entry: FreshKnowledgeEntry): Promise<void>
  blockResponse(entry: ConversationEntry): Promise<void>
  // maintenance
  getStats(): Promise<AIStats>
  getStorageInfo(): Promise<AIStorageInfo>
  clearAllData(): Promise<void>
  createBackup(): Promise<string | null>
  listBackups(): Promise<string[]>
  restoreFromBackup(name: string): Promise<boolean>
  exportData(pathOrName: string): Promise<boolean>
  shutdown(): Promise<void>
}

export class PostgresAIStorage implements AIStorage {
  private baseUrl: string
  private isConnected = false

  constructor(baseUrl = 'http://localhost:4000') {
    this.baseUrl = baseUrl
  }

  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      this.isConnected = response.ok
      return this.isConnected
    } catch {
      this.isConnected = false
      return false
    }
  }

  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    })
    if (!response.ok) throw new Error(`API call failed: ${response.statusText}`)
    return response.json()
  }

  async getExcellentResponses(): Promise<ConversationEntry[]> {
    const response = await this.apiCall('/api/excellent-responses')
    return response.items || []
  }

  async getKnowledgeEntries(): Promise<FreshKnowledgeEntry[]> {
    try {
      const result = await this.apiCall('/api/knowledge/search?q=')
      return result.items || []
    } catch {
      return []
    }
  }

  async getBlockedResponses(): Promise<ConversationEntry[]> {
    const response = await this.apiCall('/api/blocked-responses')
    return response.items || []
  }

  async saveConversation(entry: ConversationEntry): Promise<void> {
    await this.apiCall('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        question: entry.question,
        answer: entry.answer,
        rating: entry.rating
      })
    })
  }

  async saveExcellentResponse(entry: ConversationEntry): Promise<void> {
    await this.saveConversation({ ...entry, rating: 5 })
  }

  async saveKnowledgeEntry(entry: FreshKnowledgeEntry): Promise<void> {
    await this.apiCall('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        question: entry.title,
        answer: entry.content,
        rating: entry.rating
      })
    })
  }

  async blockResponse(entry: ConversationEntry): Promise<void> {
    await this.saveConversation({ ...entry, rating: 1, blocked: true })
  }

  async getStats(): Promise<AIStats> {
    // Mock stats for now - we'd need a specific endpoint
    return {
      totalEntries: 0,
      totalExcellent: 0,
      totalBlocked: 0,
      totalQueries: 0,
      categories: ['user-questions', 'business', 'projects', 'services', 'technical']
    }
  }

  async getStorageInfo(): Promise<AIStorageInfo> {
    return {
      type: 'postgresql-api',
      usageBytes: 0 // Would need database size query
    }
  }

  async clearAllData(): Promise<void> {
    // Would need a specific endpoint for this
    throw new Error('Clear data not implemented for PostgreSQL storage')
  }

  async createBackup(): Promise<string | null> {
    // Would need a specific endpoint for this
    return null
  }

  async listBackups(): Promise<string[]> {
    return []
  }

  async restoreFromBackup(_name: string): Promise<boolean> {
    return false
  }

  async exportData(_pathOrName: string): Promise<boolean> {
    return false
  }

  async shutdown(): Promise<void> {
    // No cleanup needed for API client
  }

  // Additional method for searching knowledge
  async searchKnowledge(query: string): Promise<FreshKnowledgeEntry[]> {
    try {
      const result = await this.apiCall(`/api/knowledge/search?q=${encodeURIComponent(query)}`)
      if (result.results) {
        // Map the new API format to the expected interface
        return result.results.map((r: any) => ({
          id: r.id?.toString() || 'unknown',
          title: r.title || 'Untitled',
          content: r.excerpt || r.content || '',
          keywords: r.keywords || [],
          rating: Math.floor((r.relevance || 0.5) * 5),
          usageCount: 0,
          timestamp: new Date().toISOString(),
          blocked: false
        }))
      }
      return result.items || []
    } catch {
      return []
    }
  }

  // Method for getting synthesized answer
  async getAnswer(query: string): Promise<string | null> {
    try {
      const result = await this.apiCall(`/api/knowledge/search?q=${encodeURIComponent(query)}`)
      return result.answer || null
    } catch {
      return null
    }
  }

  // Method for bulk importing
  async importKnowledge(entries: any[]): Promise<boolean> {
    try {
      await this.apiCall('/api/knowledge/import', {
        method: 'POST',
        body: JSON.stringify({ entries })
      })
      return true
    } catch {
      return false
    }
  }
}
