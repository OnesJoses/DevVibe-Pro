interface StoredKnowledge {
  id: string
  type: 'conversation' | 'concept' | 'pattern' | 'feedback'
  content: any
  metadata: {
    created: number
    updated: number
    category: string
    confidence: number
    source: string
  }
  tags: string[]
  embedding?: number[]
}

export class PersistentStorageEngine {
  private db: IDBDatabase | null = null
  private dbName = 'AI_Knowledge_Base'
  private version = 1

  constructor() {
    this.initializeDB()
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create knowledge store
        if (!db.objectStoreNames.contains('knowledge')) {
          const store = db.createObjectStore('knowledge', { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('category', 'metadata.category', { unique: false })
          store.createIndex('created', 'metadata.created', { unique: false })
          store.createIndex('confidence', 'metadata.confidence', { unique: false })
        }
        
        // Create learning patterns store
        if (!db.objectStoreNames.contains('patterns')) {
          const store = db.createObjectStore('patterns', { keyPath: 'id' })
          store.createIndex('pattern_type', 'pattern_type', { unique: false })
          store.createIndex('success_rate', 'success_rate', { unique: false })
        }
        
        // Create vocabulary store
        if (!db.objectStoreNames.contains('vocabulary')) {
          const store = db.createObjectStore('vocabulary', { keyPath: 'term' })
          store.createIndex('category', 'category', { unique: false })
          store.createIndex('frequency', 'frequency', { unique: false })
          store.createIndex('learned_date', 'learned_date', { unique: false })
        }
      }
    })
  }

  // Store conversation with learning
  async storeConversation(question: string, answer: string, feedback: number, metadata: any): Promise<void> {
    if (!this.db) await this.initializeDB()
    
    const conversation: StoredKnowledge = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'conversation',
      content: { question, answer, feedback },
      metadata: {
        created: Date.now(),
        updated: Date.now(),
        category: metadata.intent?.type || 'general',
        confidence: feedback / 5,
        source: metadata.source || 'user'
      },
      tags: this.extractTags(question + ' ' + answer),
      embedding: metadata.embedding
    }
    
    const transaction = this.db!.transaction(['knowledge'], 'readwrite')
    const store = transaction.objectStore('knowledge')
    await this.promisifyRequest(store.add(conversation))
    
    // Also extract and store concepts
    await this.extractAndStoreConcepts(question + ' ' + answer, conversation.metadata)
  }

  // Store new concepts learned
  async storeConcept(term: string, definition: string, category: string, source: string): Promise<void> {
    if (!this.db) await this.initializeDB()
    
    const concept: StoredKnowledge = {
      id: `concept_${Date.now()}_${term.replace(/\s+/g, '_')}`,
      type: 'concept',
      content: { term, definition },
      metadata: {
        created: Date.now(),
        updated: Date.now(),
        category,
        confidence: 0.8,
        source
      },
      tags: [term, category, source]
    }
    
    const transaction = this.db!.transaction(['knowledge'], 'readwrite')
    const store = transaction.objectStore('knowledge')
    await this.promisifyRequest(store.add(concept))
  }

  // Retrieve similar conversations
  async findSimilarConversations(query: string, limit: number = 5): Promise<StoredKnowledge[]> {
    if (!this.db) await this.initializeDB()
    
    const transaction = this.db!.transaction(['knowledge'], 'readonly')
    const store = transaction.objectStore('knowledge')
    const index = store.index('type')
    
    const conversations = await this.promisifyRequest(index.getAll('conversation'))
    const queryTags = this.extractTags(query)
    
    // Score conversations based on tag similarity
    const scored = conversations.map((conv: StoredKnowledge) => ({
      ...conv,
      similarity: this.calculateTagSimilarity(queryTags, conv.tags)
    }))
    
    return scored
      .filter(conv => conv.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  // Get learning analytics
  async getLearningAnalytics(): Promise<{
    totalConversations: number
    totalConcepts: number
    averageConfidence: number
    categoryCounts: Record<string, number>
    recentLearning: StoredKnowledge[]
    topPerformingPatterns: any[]
  }> {
    if (!this.db) await this.initializeDB()
    
    const transaction = this.db!.transaction(['knowledge', 'patterns'], 'readonly')
    const knowledgeStore = transaction.objectStore('knowledge')
    const patternsStore = transaction.objectStore('patterns')
    
    const allKnowledge = await this.promisifyRequest(knowledgeStore.getAll())
    const allPatterns = await this.promisifyRequest(patternsStore.getAll())
    
    const conversations = allKnowledge.filter((k: StoredKnowledge) => k.type === 'conversation')
    const concepts = allKnowledge.filter((k: StoredKnowledge) => k.type === 'concept')
    
    const categoryCounts = allKnowledge.reduce((acc: Record<string, number>, k: StoredKnowledge) => {
      const category = k.metadata.category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    const averageConfidence = allKnowledge.reduce((sum: number, k: StoredKnowledge) => 
      sum + k.metadata.confidence, 0) / allKnowledge.length
    
    const recentLearning = allKnowledge
      .filter((k: StoredKnowledge) => Date.now() - k.metadata.created < 7 * 24 * 60 * 60 * 1000)
      .sort((a: StoredKnowledge, b: StoredKnowledge) => b.metadata.created - a.metadata.created)
      .slice(0, 10)
    
    const topPerformingPatterns = allPatterns
      .sort((a: any, b: any) => b.success_rate - a.success_rate)
      .slice(0, 5)
    
    return {
      totalConversations: conversations.length,
      totalConcepts: concepts.length,
      averageConfidence,
      categoryCounts,
      recentLearning,
      topPerformingPatterns
    }
  }

  // Search stored knowledge
  async searchKnowledge(query: string, filters?: {
    type?: string
    category?: string
    minConfidence?: number
  }): Promise<StoredKnowledge[]> {
    if (!this.db) await this.initializeDB()
    
    const transaction = this.db!.transaction(['knowledge'], 'readonly')
    const store = transaction.objectStore('knowledge')
    
    let results = await this.promisifyRequest(store.getAll())
    
    // Apply filters
    if (filters?.type) {
      results = results.filter((k: StoredKnowledge) => k.type === filters.type)
    }
    
    if (filters?.category) {
      results = results.filter((k: StoredKnowledge) => k.metadata.category === filters.category)
    }
    
    if (filters?.minConfidence) {
      results = results.filter((k: StoredKnowledge) => k.metadata.confidence >= filters.minConfidence!)
    }
    
    // Score by relevance to query
    const queryTags = this.extractTags(query)
    const scored = results.map((k: StoredKnowledge) => ({
      ...k,
      relevance: this.calculateRelevance(query, k, queryTags)
    }))
    
    return scored
      .filter(k => k.relevance > 0.2)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20)
  }

  // Clean old data to manage storage
  async cleanOldData(daysToKeep: number = 90): Promise<number> {
    if (!this.db) await this.initializeDB()
    
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    const transaction = this.db!.transaction(['knowledge'], 'readwrite')
    const store = transaction.objectStore('knowledge')
    const index = store.index('created')
    
    const oldRecords = await this.promisifyRequest(index.getAll(IDBKeyRange.upperBound(cutoffDate)))
    let cleanedCount = 0
    
    for (const record of oldRecords) {
      if (record.metadata.confidence < 0.5) { // Only clean low-confidence old data
        await this.promisifyRequest(store.delete(record.id))
        cleanedCount++
      }
    }
    
    return cleanedCount
  }

  private async extractAndStoreConcepts(text: string, metadata: any): Promise<void> {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
    const uniqueWords = [...new Set(words)]
    
    for (const word of uniqueWords) {
      // Check if this is a potentially new concept
      if (this.isLikelyNewConcept(word, text)) {
        await this.storeConcept(
          word,
          this.extractDefinitionFromContext(word, text),
          metadata.category,
          metadata.source
        )
      }
    }
  }

  private isLikelyNewConcept(word: string, context: string): boolean {
    // Heuristics to identify if a word is likely a new concept
    const technicalPatterns = [
      /\b\w+\s+(framework|library|tool|platform|service)\b/i,
      /\b(api|sdk|ide)\b/i,
      /\b\w+\.(js|ts|jsx|tsx|py|php)\b/i
    ]
    
    return technicalPatterns.some(pattern => pattern.test(context)) && word.length > 3
  }

  private extractDefinitionFromContext(word: string, context: string): string {
    const sentences = context.split(/[.!?]+/)
    const relevantSentence = sentences.find(s => s.toLowerCase().includes(word))
    return relevantSentence?.trim() || `Context: ${context.substring(0, 100)}...`
  }

  private extractTags(text: string): string[] {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'])
    
    return [...new Set(words.filter(word => !stopWords.has(word) && word.length > 2))].slice(0, 10)
  }

  private calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    const intersection = tags1.filter(tag => tags2.includes(tag))
    const union = [...new Set([...tags1, ...tags2])]
    return union.length > 0 ? intersection.length / union.length : 0
  }

  private calculateRelevance(query: string, knowledge: StoredKnowledge, queryTags: string[]): number {
    const contentText = JSON.stringify(knowledge.content).toLowerCase()
    const queryLower = query.toLowerCase()
    
    let relevance = 0
    
    // Direct text match
    if (contentText.includes(queryLower)) relevance += 0.5
    
    // Tag similarity
    relevance += this.calculateTagSimilarity(queryTags, knowledge.tags) * 0.3
    
    // Confidence boost
    relevance += knowledge.metadata.confidence * 0.2
    
    return Math.min(relevance, 1)
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const persistentStorage = new PersistentStorageEngine()
