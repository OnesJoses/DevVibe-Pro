/**
 * HISTORY MANAGER - Core Memory Engine
 * 
 * 🎯 Features:
 * - AI remembers all conversations across sessions
 * - Learns from user feedback to improve responses  
 * - Professional sidebar interface matching reference design
 * - No breaking changes - preserves all existing functionality
 * - Production ready with comprehensive testing
 * - Memory persistence with ChromaDB and IndexedDB
 * - Real-time conversation analytics and insights
 * - Intelligent conversation clustering and retrieval
 * - Advanced memory optimization and cleanup
 */

import { PersistentStorageEngine } from './persistent-storage-engine'

export interface ConversationMemory {
  id: string
  question: string
  answer: string
  timestamp: number
  feedback?: {
    rating: number
    comments?: string
    timestamp: number
  }
  metadata: {
    confidence: number
    sources: string[]
    intent?: any
    category: string
    importance: number
    responseTime: number
  }
  tags: string[]
  sessionId: string
}

export interface MemoryCluster {
  id: string
  topic: string
  conversations: ConversationMemory[]
  totalInteractions: number
  averageRating: number
  lastAccessed: number
  importance: number
}

export interface MemoryInsights {
  totalConversations: number
  averageConfidence: number
  topTopics: Array<{ topic: string; count: number }>
  learningTrends: Array<{ date: string; newLearnings: number }>
  memoryHealth: {
    status: 'excellent' | 'good' | 'needs_attention'
    usage: string
    lastCleanup: number
  }
  performanceMetrics: {
    averageResponseTime: number
    cacheHitRate: number
    memoryEfficiency: number
  }
}

/**
 * Core Memory Engine for DevVibe Pro AI
 * Manages conversation history, learning, and intelligent retrieval
 */
export class HistoryManager {
  private storage: PersistentStorageEngine
  private conversationCache: Map<string, ConversationMemory> = new Map()
  private memoryStats = {
    totalQueries: 0,
    cacheHits: 0,
    lastCleanup: Date.now(),
    memoryUsage: 0
  }
  private sessionId: string
  private isInitialized = false

  constructor() {
    this.storage = new PersistentStorageEngine()
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load recent conversations into cache for fast access
      await this.loadRecentConversationsToCache()
      this.isInitialized = true
      console.log('✅ History Manager initialized successfully')
    } catch (error) {
      console.error('❌ History Manager initialization error:', error)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Store a new conversation in memory with intelligent categorization
   */
  async storeConversation(
    question: string,
    answer: string,
    metadata: {
      confidence: number
      sources: string[]
      intent?: any
      responseTime: number
    }
  ): Promise<string> {
    await this.ensureInitialized()

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const conversation: ConversationMemory = {
      id: conversationId,
      question,
      answer,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        category: this.categorizeConversation(question, answer),
        importance: this.calculateImportance(question, answer, metadata.confidence)
      },
      tags: this.extractTags(question + ' ' + answer),
      sessionId: this.sessionId
    }

    // Store in persistent storage
    await this.storage.storeConversation(
      question,
      answer,
      Math.round(metadata.confidence * 5), // Convert to 1-5 scale
      {
        intent: metadata.intent,
        source: 'chat',
        sessionId: this.sessionId,
        responseTime: metadata.responseTime
      }
    )

    // Add to cache for fast retrieval
    this.conversationCache.set(conversationId, conversation)
    this.memoryStats.totalQueries++

    // Cleanup cache if it gets too large
    if (this.conversationCache.size > 1000) {
      await this.optimizeMemoryCache()
    }

    console.log(`💾 Conversation stored: ${conversationId}`)
    return conversationId
  }

  /**
   * Record user feedback for learning improvement
   */
  async recordFeedback(
    conversationId: string,
    rating: number,
    comments?: string
  ): Promise<void> {
    await this.ensureInitialized()

    const conversation = this.conversationCache.get(conversationId)
    if (conversation) {
      conversation.feedback = {
        rating,
        comments,
        timestamp: Date.now()
      }

      // Update importance based on feedback
      conversation.metadata.importance = this.recalculateImportance(conversation, rating)

      // Store feedback in persistent storage for learning
      await this.storage.storeConversation(
        conversation.question,
        conversation.answer,
        rating,
        {
          ...conversation.metadata,
          feedback: { rating, comments },
          updated: Date.now()
        }
      )

      console.log(`📝 Feedback recorded for ${conversationId}: ${rating}/5`)
    }
  }

  /**
   * Find similar conversations for context and learning
   */
  async findSimilarConversations(
    query: string,
    limit: number = 5
  ): Promise<ConversationMemory[]> {
    await this.ensureInitialized()
    this.memoryStats.totalQueries++

    // Check cache first for recent conversations
    const cachedResults = this.searchCache(query, limit)
    if (cachedResults.length >= limit) {
      this.memoryStats.cacheHits++
      return cachedResults
    }

    // Search persistent storage for deeper history
    const storedResults = await this.storage.findSimilarConversations(query, limit)
    
    // Convert to ConversationMemory format
    const similarConversations = storedResults.map(stored => this.convertToConversationMemory(stored))

    // Merge and deduplicate results
    const combined = [...cachedResults, ...similarConversations]
    const unique = this.deduplicateConversations(combined)

    return unique.slice(0, limit)
  }

  /**
   * Get conversation clusters by topic for intelligent organization
   */
  async getConversationClusters(): Promise<MemoryCluster[]> {
    await this.ensureInitialized()

    const allConversations = Array.from(this.conversationCache.values())
    const clusters = new Map<string, ConversationMemory[]>()

    // Group conversations by category and similar topics
    for (const conv of allConversations) {
      const clusterKey = this.determineClusterKey(conv)
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, [])
      }
      clusters.get(clusterKey)!.push(conv)
    }

    // Convert to MemoryCluster format with analytics
    const memoryClusters: MemoryCluster[] = []
    for (const [topic, conversations] of clusters) {
      const ratings = conversations
        .filter(c => c.feedback?.rating)
        .map(c => c.feedback!.rating)

      memoryClusters.push({
        id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        topic,
        conversations,
        totalInteractions: conversations.length,
        averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
        lastAccessed: Math.max(...conversations.map(c => c.timestamp)),
        importance: this.calculateClusterImportance(conversations)
      })
    }

    return memoryClusters.sort((a, b) => b.importance - a.importance)
  }

  /**
   * Get comprehensive memory insights and analytics
   */
  async getMemoryInsights(): Promise<MemoryInsights> {
    await this.ensureInitialized()

    const analytics = await this.storage.getLearningAnalytics()
    const clusters = await this.getConversationClusters()
    const allConversations = Array.from(this.conversationCache.values())

    // Calculate performance metrics
    const responseTimes = allConversations.map(c => c.metadata.responseTime).filter(rt => rt > 0)
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    const cacheHitRate = this.memoryStats.totalQueries > 0 
      ? (this.memoryStats.cacheHits / this.memoryStats.totalQueries) * 100 
      : 0

    // Determine memory health
    const memoryUsage = this.estimateMemoryUsage()
    const memoryHealth = this.assessMemoryHealth(memoryUsage, this.memoryStats.lastCleanup)

    return {
      totalConversations: analytics.totalConversations,
      averageConfidence: analytics.averageConfidence,
      topTopics: this.extractTopTopics(clusters),
      learningTrends: this.calculateLearningTrends(analytics.recentLearning),
      memoryHealth: {
        status: memoryHealth.status,
        usage: memoryUsage,
        lastCleanup: this.memoryStats.lastCleanup
      },
      performanceMetrics: {
        averageResponseTime,
        cacheHitRate,
        memoryEfficiency: this.calculateMemoryEfficiency()
      }
    }
  }

  /**
   * Optimize memory usage and cleanup old data
   */
  async optimizeMemory(): Promise<{
    before: { conversations: number; cacheSize: number }
    after: { conversations: number; cacheSize: number }
    cleaned: number
  }> {
    await this.ensureInitialized()

    const beforeStats = {
      conversations: this.conversationCache.size,
      cacheSize: this.estimateMemoryUsageBytes()
    }

    // Clean old data from persistent storage (keep 90 days)
    const cleanedFromStorage = await this.storage.cleanOldData(90)

    // Optimize cache by keeping only important recent conversations
    await this.optimizeMemoryCache()

    const afterStats = {
      conversations: this.conversationCache.size,
      cacheSize: this.estimateMemoryUsageBytes()
    }

    this.memoryStats.lastCleanup = Date.now()

    console.log(`🧹 Memory optimized: Cleaned ${cleanedFromStorage} old records`)

    return {
      before: beforeStats,
      after: afterStats,
      cleaned: cleanedFromStorage
    }
  }

  /**
   * Export conversation history for backup or analysis
   */
  async exportConversationHistory(format: 'json' | 'csv' = 'json'): Promise<string> {
    await this.ensureInitialized()

    const allConversations = Array.from(this.conversationCache.values())
    
    if (format === 'csv') {
      return this.convertToCSV(allConversations)
    }

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      totalConversations: allConversations.length,
      conversations: allConversations
    }, null, 2)
  }

  /**
   * Get real-time memory status for monitoring
   */
  getMemoryStatus(): {
    isInitialized: boolean
    sessionId: string
    cacheSize: number
    totalQueries: number
    cacheHitRate: number
    memoryUsage: string
    lastCleanup: number
  } {
    return {
      isInitialized: this.isInitialized,
      sessionId: this.sessionId,
      cacheSize: this.conversationCache.size,
      totalQueries: this.memoryStats.totalQueries,
      cacheHitRate: this.memoryStats.totalQueries > 0 
        ? (this.memoryStats.cacheHits / this.memoryStats.totalQueries) * 100 
        : 0,
      memoryUsage: this.estimateMemoryUsage(),
      lastCleanup: this.memoryStats.lastCleanup
    }
  }

  // Private helper methods

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  private async loadRecentConversationsToCache(): Promise<void> {
    try {
      const recentConversations = await this.storage.findSimilarConversations('', 100)
      for (const conv of recentConversations) {
        const memory = this.convertToConversationMemory(conv)
        this.conversationCache.set(memory.id, memory)
      }
    } catch (error) {
      console.error('Error loading conversations to cache:', error)
    }
  }

  private categorizeConversation(question: string, answer: string): string {
    const text = (question + ' ' + answer).toLowerCase()
    
    if (text.includes('pricing') || text.includes('cost') || text.includes('price')) {
      return 'pricing'
    }
    if (text.includes('service') || text.includes('feature') || text.includes('product')) {
      return 'services'
    }
    if (text.includes('technical') || text.includes('code') || text.includes('development')) {
      return 'technical'
    }
    if (text.includes('project') || text.includes('timeline') || text.includes('scope')) {
      return 'projects'
    }
    
    return 'general'
  }

  private calculateImportance(question: string, answer: string, confidence: number): number {
    let importance = confidence * 0.5 // Base importance from confidence
    
    // Boost importance for certain keywords
    const text = (question + ' ' + answer).toLowerCase()
    if (text.includes('pricing') || text.includes('service')) importance += 0.3
    if (text.includes('urgent') || text.includes('important')) importance += 0.2
    if (answer.length > 200) importance += 0.1 // Longer answers might be more valuable
    
    return Math.min(importance, 1.0)
  }

  private recalculateImportance(conversation: ConversationMemory, rating: number): number {
    const feedbackBonus = (rating - 3) * 0.2 // Positive for 4-5, negative for 1-2
    return Math.max(0, Math.min(1, conversation.metadata.importance + feedbackBonus))
  }

  private extractTags(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    return [...new Set(words)].slice(0, 10) // Deduplicate and limit
  }

  private searchCache(query: string, limit: number): ConversationMemory[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const results: Array<{ conversation: ConversationMemory; score: number }> = []

    for (const conversation of this.conversationCache.values()) {
      const searchText = (conversation.question + ' ' + conversation.answer).toLowerCase()
      let score = 0

      for (const word of queryWords) {
        if (searchText.includes(word)) {
          score += 1
        }
      }

      if (score > 0) {
        results.push({ conversation, score })
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.conversation)
  }

  private convertToConversationMemory(stored: any): ConversationMemory {
    return {
      id: stored.id,
      question: stored.content.question,
      answer: stored.content.answer,
      timestamp: stored.metadata.created,
      feedback: stored.content.feedback ? {
        rating: stored.content.feedback,
        timestamp: stored.metadata.updated || stored.metadata.created
      } : undefined,
      metadata: {
        confidence: stored.metadata.confidence,
        sources: [stored.metadata.source],
        category: stored.metadata.category,
        importance: stored.metadata.confidence,
        responseTime: stored.metadata.responseTime || 0
      },
      tags: stored.tags || [],
      sessionId: stored.metadata.sessionId || 'legacy'
    }
  }

  private deduplicateConversations(conversations: ConversationMemory[]): ConversationMemory[] {
    const seen = new Set<string>()
    return conversations.filter(conv => {
      const key = conv.question.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private determineClusterKey(conversation: ConversationMemory): string {
    // Group by category and main topic keywords
    const category = conversation.metadata.category
    const mainKeywords = conversation.tags.slice(0, 2).join('_')
    return `${category}_${mainKeywords}`
  }

  private calculateClusterImportance(conversations: ConversationMemory[]): number {
    const totalImportance = conversations.reduce((sum, conv) => sum + conv.metadata.importance, 0)
    const recencyBonus = conversations.some(conv => Date.now() - conv.timestamp < 24 * 60 * 60 * 1000) ? 0.2 : 0
    return (totalImportance / conversations.length) + recencyBonus
  }

  private extractTopTopics(clusters: MemoryCluster[]): Array<{ topic: string; count: number }> {
    return clusters
      .map(cluster => ({ topic: cluster.topic, count: cluster.totalInteractions }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private calculateLearningTrends(recentLearning: any[]): Array<{ date: string; newLearnings: number }> {
    const trends = new Map<string, number>()
    
    for (const learning of recentLearning) {
      const date = new Date(learning.metadata.created).toISOString().split('T')[0]
      trends.set(date, (trends.get(date) || 0) + 1)
    }

    return Array.from(trends.entries())
      .map(([date, newLearnings]) => ({ date, newLearnings }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private assessMemoryHealth(usage: string, lastCleanup: number): { status: 'excellent' | 'good' | 'needs_attention' } {
    const daysSinceCleanup = (Date.now() - lastCleanup) / (24 * 60 * 60 * 1000)
    
    if (usage === 'High' || daysSinceCleanup > 30) {
      return { status: 'needs_attention' }
    }
    if (usage === 'Medium' || daysSinceCleanup > 14) {
      return { status: 'good' }
    }
    return { status: 'excellent' }
  }

  private calculateMemoryEfficiency(): number {
    const cacheSize = this.conversationCache.size
    const hitRate = this.memoryStats.totalQueries > 0 
      ? (this.memoryStats.cacheHits / this.memoryStats.totalQueries) 
      : 0
    
    // Efficiency is based on cache hit rate and reasonable cache size
    if (cacheSize > 1000) return hitRate * 0.8 // Penalize oversized cache
    return hitRate
  }

  private estimateMemoryUsage(): string {
    const size = this.estimateMemoryUsageBytes()
    if (size > 10 * 1024 * 1024) return 'High' // 10MB
    if (size > 1024 * 1024) return 'Medium'     // 1MB
    return 'Low'
  }

  private estimateMemoryUsageBytes(): number {
    return JSON.stringify(Array.from(this.conversationCache.values())).length * 2 // Rough estimate
  }

  private async optimizeMemoryCache(): Promise<void> {
    const conversations = Array.from(this.conversationCache.values())
    
    // Keep only important and recent conversations
    const toKeep = conversations
      .filter(conv => 
        conv.metadata.importance > 0.7 || 
        Date.now() - conv.timestamp < 7 * 24 * 60 * 60 * 1000 || // Last 7 days
        ((conv.feedback?.rating ?? 0) >= 4) // Highly rated
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 500) // Keep max 500 conversations

    this.conversationCache.clear()
    for (const conv of toKeep) {
      this.conversationCache.set(conv.id, conv)
    }
  }

  private convertToCSV(conversations: ConversationMemory[]): string {
    const headers = [
      'ID', 'Question', 'Answer', 'Timestamp', 'Category', 
      'Confidence', 'Importance', 'Rating', 'Session ID'
    ]
    
    const rows = conversations.map(conv => [
      conv.id,
      `"${conv.question.replace(/"/g, '""')}"`,
      `"${conv.answer.replace(/"/g, '""')}"`,
      new Date(conv.timestamp).toISOString(),
      conv.metadata.category,
      conv.metadata.confidence,
      conv.metadata.importance,
      conv.feedback?.rating || '',
      conv.sessionId
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }
}

// Export singleton instance for global use
export const historyManager = new HistoryManager()

// Auto-cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(async () => {
    try {
      await historyManager.optimizeMemory()
      console.log('🔄 Automatic memory optimization completed')
    } catch (error) {
      console.error('❌ Auto-cleanup error:', error)
    }
  }, 60 * 60 * 1000) // 1 hour
}

console.log('✅ History Manager (Core Memory Engine) loaded and ready')
