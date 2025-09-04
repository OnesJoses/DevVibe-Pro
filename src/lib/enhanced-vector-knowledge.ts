// Enhanced ChromaDB Implementation with Advanced Features
import { CloudClient } from './browser-chromadb'

interface EnhancedMetadata {
  category: 'technical' | 'business' | 'services' | 'pricing' | 'personal' | 'conversation'
  importance: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-1 scale
  source: 'user_feedback' | 'web_search' | 'manual' | 'conversation' | 'learning' | 'user_input'
  tags: string[]
  learned_from?: string
  usage_count: number
  last_accessed: string
  embedding_model: string
  quality_score: number // Based on user feedback
  intent_type?: string
  conversation_context?: {
    session_id: string
    turn_number: number
    previous_topics: string[]
  }
}

export class EnhancedVectorKnowledge {
  private client: CloudClient
  private collection: any
  private embeddingModel: string = 'all-MiniLM-L6-v2' // Default model
  private isInitialized = false

  constructor() {
    this.client = new CloudClient({
      apiKey: 'ck-FvSg7YfutGeQmpaTjWAkQYJayhmVZp35n1SDV2JDSEyX',
      tenant: 'c578600a-26e4-4a28-ad92-52df5446dd26',
      database: 'DevVibePro'
    })
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'enhanced_knowledge_base',
        metadata: {
          description: 'Enhanced AI knowledge with persistent learning',
          embedding_model: this.embeddingModel,
          created_at: new Date().toISOString()
        }
      })
      
      this.isInitialized = true
      console.log('✅ Enhanced Vector Knowledge initialized with ChromaDB')
    } catch (error) {
      console.error('❌ ChromaDB initialization failed:', error)
      throw error
    }
  }

  // Store knowledge with rich metadata
  async storeKnowledge(
    content: string, 
    category: string, 
    metadata: Partial<EnhancedMetadata> = {}
  ): Promise<string> {
    await this.initialize()

    const id = `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const enhancedMetadata: EnhancedMetadata = {
      category: category as any,
      importance: metadata.importance || 'medium',
      confidence: metadata.confidence || 0.8,
      source: metadata.source || 'manual',
      tags: metadata.tags || this.extractTags(content),
      usage_count: 0,
      last_accessed: new Date().toISOString(),
      embedding_model: this.embeddingModel,
      quality_score: metadata.quality_score || 0.5,
      intent_type: metadata.intent_type,
      conversation_context: metadata.conversation_context,
      ...metadata
    }

    try {
      await this.collection.add({
        documents: [content],
        metadatas: [enhancedMetadata],
        ids: [id]
      })

      console.log(`💾 Stored knowledge: ${id} (${category})`)
      return id
    } catch (error) {
      console.error('❌ Failed to store knowledge:', error)
      throw error
    }
  }

  // Hybrid search with semantic + metadata filtering
  async hybridSearch(
    query: string, 
    options: {
      category?: string
      importance?: string
      minConfidence?: number
      maxResults?: number
      timeRange?: { start: Date, end: Date }
      includeConversational?: boolean
    } = {}
  ): Promise<Array<{
    content: string
    metadata: EnhancedMetadata
    similarity: number
    id: string
  }>> {
    await this.initialize()

    const {
      category,
      importance,
      minConfidence = 0.3,
      maxResults = 5,
      timeRange,
      includeConversational = true
    } = options

    // Build metadata filters
    const whereClause: any = {}
    
    if (category) whereClause.category = category
    if (importance) whereClause.importance = importance
    if (minConfidence) whereClause.confidence = { $gte: minConfidence }
    if (!includeConversational) {
      whereClause.category = { $ne: 'conversation' }
    }
    if (timeRange) {
      whereClause.last_accessed = {
        $gte: timeRange.start.toISOString(),
        $lte: timeRange.end.toISOString()
      }
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: maxResults,
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined
      })

      // Update usage counts for accessed documents
      if (results.ids && results.ids[0]) {
        this.updateUsageCounts(results.ids[0])
      }

      return this.formatResults(results)
    } catch (error) {
      console.error('❌ Hybrid search failed:', error)
      return []
    }
  }

  // Dynamic learning from user interactions
  async learnFromInteraction(
    question: string,
    answer: string,
    feedback: number,
    source: string,
    intent?: string
  ): Promise<void> {
    await this.initialize()

    if (feedback >= 3) { // Only learn from positive feedback
      const conversationContent = `Question: ${question}\nAnswer: ${answer}`
      
      await this.storeKnowledge(conversationContent, 'conversation', {
        importance: feedback >= 4 ? 'high' : 'medium',
        confidence: feedback / 5,
        source: source as any,
        quality_score: feedback / 5,
        intent_type: intent,
        tags: this.extractTags(question + ' ' + answer),
        conversation_context: {
          session_id: this.getCurrentSessionId(),
          turn_number: this.getCurrentTurnNumber(),
          previous_topics: this.getRecentTopics()
        }
      })

      console.log(`🧠 Learned from interaction (feedback: ${feedback}/5)`)
    }
  }

  // Continuous learning - teach new information
  async teachNewKnowledge(
    topic: string,
    information: string,
    source: 'web_search' | 'user_input' | 'manual',
    category: string = 'technical'
  ): Promise<string> {
    return await this.storeKnowledge(
      `Topic: ${topic}\nInformation: ${information}`,
      category,
      {
        importance: 'high',
        confidence: 0.9,
        source: source as any,
        tags: this.extractTags(topic + ' ' + information),
        quality_score: 0.8
      }
    )
  }

  // Get knowledge statistics
  async getKnowledgeStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    byImportance: Record<string, number>
    topUsed: Array<{ id: string, usage_count: number }>
    qualityDistribution: Record<string, number>
  }> {
    await this.initialize()

    try {
      const allDocs = await this.collection.query({
        queryTexts: [''],
        nResults: 1000 // Get all documents
      })

      const stats = {
        total: 0,
        byCategory: {} as Record<string, number>,
        byImportance: {} as Record<string, number>,
        topUsed: [] as Array<{ id: string, usage_count: number }>,
        qualityDistribution: {} as Record<string, number>
      }

      if (allDocs.metadatas && allDocs.metadatas[0]) {
        stats.total = allDocs.metadatas[0].length

        allDocs.metadatas[0].forEach((metadata: EnhancedMetadata, index: number) => {
          // Category distribution
          stats.byCategory[metadata.category] = (stats.byCategory[metadata.category] || 0) + 1
          
          // Importance distribution
          stats.byImportance[metadata.importance] = (stats.byImportance[metadata.importance] || 0) + 1
          
          // Usage tracking
          if (allDocs.ids && allDocs.ids[0]) {
            stats.topUsed.push({
              id: allDocs.ids[0][index],
              usage_count: metadata.usage_count
            })
          }
          
          // Quality distribution
          const qualityRange = this.getQualityRange(metadata.quality_score)
          stats.qualityDistribution[qualityRange] = (stats.qualityDistribution[qualityRange] || 0) + 1
        })

        // Sort top used by usage count
        stats.topUsed.sort((a, b) => b.usage_count - a.usage_count)
        stats.topUsed = stats.topUsed.slice(0, 10) // Top 10
      }

      return stats
    } catch (error) {
      console.error('❌ Failed to get knowledge stats:', error)
      return {
        total: 0,
        byCategory: {},
        byImportance: {},
        topUsed: [],
        qualityDistribution: {}
      }
    }
  }

  // Private helper methods
  private extractTags(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])
    return [...new Set(words.filter(word => word.length > 3 && !commonWords.has(word)))].slice(0, 10)
  }

  private updateUsageCounts(ids: string[]): void {
    // Update usage counts in background (non-blocking)
    setTimeout(async () => {
      for (const id of ids) {
        try {
          // This would require a more complex update mechanism
          // For now, we'll track usage in localStorage as well
          const usageKey = `usage_${id}`
          const currentUsage = parseInt(localStorage.getItem(usageKey) || '0')
          localStorage.setItem(usageKey, (currentUsage + 1).toString())
        } catch (error) {
          console.warn('Failed to update usage count:', error)
        }
      }
    }, 0)
  }

  private formatResults(results: any): Array<{
    content: string
    metadata: EnhancedMetadata
    similarity: number
    id: string
  }> {
    if (!results.documents || !results.documents[0]) return []

    return results.documents[0].map((doc: string, index: number) => ({
      content: doc,
      metadata: results.metadatas[0][index],
      similarity: 1 - (results.distances[0][index] || 0), // Convert distance to similarity
      id: results.ids[0][index]
    }))
  }

  private getCurrentSessionId(): string {
    let sessionId = sessionStorage.getItem('ai_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('ai_session_id', sessionId)
    }
    return sessionId
  }

  private getCurrentTurnNumber(): number {
    const turns = sessionStorage.getItem('conversation_turns')
    const currentTurns = turns ? parseInt(turns) : 0
    sessionStorage.setItem('conversation_turns', (currentTurns + 1).toString())
    return currentTurns + 1
  }

  private getRecentTopics(): string[] {
    const topics = sessionStorage.getItem('recent_topics')
    return topics ? JSON.parse(topics) : []
  }

  private getQualityRange(score: number): string {
    if (score >= 0.8) return 'excellent'
    if (score >= 0.6) return 'good'
    if (score >= 0.4) return 'fair'
    return 'poor'
  }
}

export const enhancedVectorKnowledge = new EnhancedVectorKnowledge()
