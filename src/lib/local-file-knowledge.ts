// Browser-compatible local knowledge system
import { KnowledgeEntry, SearchResult, LocalTextEmbedding, extractKeywords, cosineSimilarity } from './ai-utils'

/**
 * Browser-Compatible Local Knowledge System
 * Uses localStorage for browser compatibility
 */
export class LocalFileKnowledge {
  private knowledgeKey = 'devvibe-ai-knowledge'
  private trainingKey = 'devvibe-ai-training'
  private embedding: LocalTextEmbedding
  private entries: Map<string, KnowledgeEntry> = new Map()
  private isInitialized = false

  constructor() {
    this.embedding = new LocalTextEmbedding()
  }

  async initialize() {
    if (this.isInitialized) return

    console.log('📚 Loading knowledge from browser storage...')
    
    try {
      const stored = localStorage.getItem(this.knowledgeKey)
      if (stored) {
        const data = JSON.parse(stored)
        for (const entry of data.entries || []) {
          if (!entry.embedding) {
            entry.embedding = this.embedding.createEmbedding(entry.content)
          }
          this.entries.set(entry.id, entry)
        }
        console.log(`📄 Loaded ${this.entries.size} entries from browser storage`)
      }
    } catch (error) {
      console.error('❌ Error loading from storage:', error)
    }
    
    if (this.entries.size === 0) {
      await this.createInitialKnowledge()
    }

    this.isInitialized = true
    console.log(`✅ Local knowledge loaded: ${this.entries.size} entries`)
  }

  private async createInitialKnowledge() {
    const initialEntries = [
      {
        id: 'services-overview',
        title: 'What Services Do I Offer?',
        category: 'services',
        content: `I specialize in building digital solutions that drive business results:

🛒 **E-Commerce Stores** - Complete online stores with payment processing
💼 **Business Apps** - CRM, HR, and management systems 
🚀 **SaaS Platforms** - Subscription-based software solutions
🌟 **Professional Websites** - Fast, conversion-focused sites
💡 **Custom Development** - Tailored solutions for unique needs

**Starting from $2,500** | **2-8 week delivery** | **3 months free support**`,
        tags: ['services', 'offerings', 'solutions', 'pricing']
      },
      {
        id: 'pricing-guide',
        title: 'How Much Does a Project Cost?',
        category: 'business',
        content: `**Investment Levels Based on Project Complexity:**

🚀 **Simple Projects: $2,500 - $7,500**
• Business websites, basic web apps
• 2-3 weeks delivery

💼 **Business Solutions: $7,500 - $20,000**
• E-commerce stores, CRM systems, business apps
• 4-8 weeks delivery

🏢 **Enterprise Solutions: $20,000+**
• Complex SaaS platforms, large-scale systems
• 8-16 weeks delivery

**What's Included:**
✅ Unlimited revisions until you're 100% satisfied
✅ 3 months free support after launch
✅ Mobile optimization and SEO setup`,
        tags: ['pricing', 'cost', 'investment', 'payment']
      }
    ]

    for (const entry of initialEntries) {
      await this.saveKnowledgeEntry(entry)
    }
  }

  async saveKnowledgeEntry(data: {
    id: string
    title: string
    category: string
    content: string
    tags?: string[]
  }) {
    const entry: KnowledgeEntry = {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      keywords: data.tags || extractKeywords(data.content),
      embedding: this.embedding.createEmbedding(data.content),
      metadata: {
        lastUpdated: new Date().toISOString(),
        confidence: 1.0,
        sourceType: 'manual',
        usage_count: 0
      }
    }

    this.entries.set(entry.id, entry)
    this.saveToStorage()
    
    console.log(`💾 Saved knowledge: ${entry.title}`)
    return entry
  }

  private saveToStorage() {
    try {
      const data = {
        entries: Array.from(this.entries.values()),
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(this.knowledgeKey, JSON.stringify(data))
    } catch (error) {
      console.error('❌ Error saving to storage:', error)
    }
  }

  async addKnowledgeFromConversation(
    question: string,
    answer: string,
    category: string,
    isGoodResponse = true
  ) {
    const id = `conv-${Date.now()}`
    const entry = {
      id,
      title: question,
      category,
      content: answer,
      tags: extractKeywords(question + ' ' + answer)
    }

    await this.saveKnowledgeEntry(entry)
    await this.saveConversation(question, answer, isGoodResponse)
    
    return entry
  }

  async saveConversation(question: string, answer: string, isGoodResponse: boolean) {
    const conversation = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      isGoodResponse,
      source: 'conversation'
    }

    const existing = localStorage.getItem(this.trainingKey) || '[]'
    const conversations = JSON.parse(existing)
    conversations.push(conversation)
    
    if (conversations.length > 100) {
      conversations.splice(0, conversations.length - 100)
    }
    
    localStorage.setItem(this.trainingKey, JSON.stringify(conversations))
    console.log(`💬 Saved conversation for training`)
  }

  async saveUserFeedback(
    question: string,
    answer: string,
    rating: number,
    feedback?: string
  ) {
    const feedbackData = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      rating,
      feedback,
      source: 'user_feedback'
    }

    const feedbackKey = 'devvibe-ai-feedback'
    const existing = localStorage.getItem(feedbackKey) || '[]'
    const feedbacks = JSON.parse(existing)
    feedbacks.push(feedbackData)
    
    if (feedbacks.length > 50) {
      feedbacks.splice(0, feedbacks.length - 50)
    }
    
    localStorage.setItem(feedbackKey, JSON.stringify(feedbacks))
    console.log(`⭐ Saved feedback: Rating ${rating}/5`)
    
    if (rating >= 4) {
      await this.addKnowledgeFromConversation(question, answer, 'user-approved', true)
    }
  }

  async trainFromConversations() {
    const conversations = JSON.parse(localStorage.getItem(this.trainingKey) || '[]')
    let trainedCount = 0
    
    for (const conv of conversations) {
      if (conv.isGoodResponse && !this.entries.has(`conv-${conv.timestamp}`)) {
        await this.addKnowledgeFromConversation(
          conv.question,
          conv.answer,
          'user-questions',
          true
        )
        trainedCount++
      }
    }
    
    console.log(`🎓 Trained on ${trainedCount} conversations`)
    return trainedCount
  }

  async search(query: string, options: {
    category?: string
    maxResults?: number
    threshold?: number
  } = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) await this.initialize()

    const { category, maxResults = 5, threshold = 0.3 } = options
    const queryEmbedding = this.embedding.createEmbedding(query)
    const results: SearchResult[] = []

    for (const [id, entry] of this.entries) {
      if (category && entry.category !== category) continue

      const similarity = entry.embedding ? 
        cosineSimilarity(queryEmbedding, entry.embedding) : 0

      if (similarity >= threshold) {
        results.push({
          entry,
          relevance: similarity,
          matchType: 'semantic',
          matchedTerms: []
        })

        entry.metadata.usage_count = (entry.metadata.usage_count || 0) + 1
      }
    }

    this.saveToStorage()
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults)
  }

  async updateKnowledge(id: string, updates: any) {
    const existingEntry = this.entries.get(id)
    if (!existingEntry) {
      throw new Error(`Knowledge entry with id '${id}' not found`)
    }

    const updatedEntry = {
      ...existingEntry,
      ...updates,
      metadata: {
        ...existingEntry.metadata,
        lastUpdated: new Date().toISOString()
      }
    }

    this.entries.set(id, updatedEntry)
    this.saveToStorage()
    return updatedEntry
  }

  async deleteKnowledge(id: string) {
    const entry = this.entries.get(id)
    if (!entry) {
      throw new Error(`Knowledge entry with id '${id}' not found`)
    }

    this.entries.delete(id)
    this.saveToStorage()
    return true
  }

  getStats() {
    const categories = new Map<string, number>()
    const totalFiles = Array.from(this.entries.values())
    
    totalFiles.forEach(entry => {
      const count = categories.get(entry.category) || 0
      categories.set(entry.category, count + 1)
    })

    return {
      totalEntries: this.entries.size,
      categories: Object.fromEntries(categories),
      directories: {
        knowledge: 'Browser Local Storage',
        training: 'Browser Local Storage'
      },
      isInitialized: this.isInitialized,
      lastUpdated: new Date().toISOString()
    }
  }

  async exportKnowledge() {
    const backup = {
      timestamp: new Date().toISOString(),
      entries: Array.from(this.entries.values()),
      stats: this.getStats()
    }

    const dataStr = JSON.stringify(backup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `devvibe-ai-knowledge-backup-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`💾 Knowledge exported and downloaded`)
    return `browser-download-${Date.now()}.json`
  }

  async importKnowledge(fileContent: string) {
    try {
      const backup = JSON.parse(fileContent)
      
      for (const entry of backup.entries) {
        this.entries.set(entry.id, entry)
      }
      
      this.saveToStorage()
      console.log(`📥 Imported ${backup.entries.length} knowledge entries`)
      return backup.entries.length
    } catch (error) {
      console.error('❌ Import failed:', error)
      throw error
    }
  }

  getEntriesByCategory(category: string) {
    return Array.from(this.entries.values())
      .filter(entry => entry.category === category)
      .sort((a, b) => a.title.localeCompare(b.title))
  }

  getMostUsedEntries(limit = 10) {
    return Array.from(this.entries.values())
      .sort((a, b) => (b.metadata.usage_count || 0) - (a.metadata.usage_count || 0))
      .slice(0, limit)
  }

  getRecentlyUpdated(limit = 10) {
    return Array.from(this.entries.values())
      .sort((a, b) => new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime())
      .slice(0, limit)
  }
}

export const localFileKnowledge = new LocalFileKnowledge()
