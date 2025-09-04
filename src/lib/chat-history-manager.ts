import { vectorKnowledge } from './vector-knowledge-engine'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    intent?: string
    confidence?: number
    sources?: string[]
    rating?: number
  }
}

export interface ChatSession {
  id: string
  userId: string
  topic: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  tags: string[]
  summary?: string
}

export interface UserChatMemory {
  userId: string
  sessions: ChatSession[]
  preferences: {
    autoSaveChats: boolean
    maxSessionsToKeep: number
    topicDetectionEnabled: boolean
  }
}

export class ChatHistoryManager {
  private static instance: ChatHistoryManager
  private chatHistory: Map<string, UserChatMemory> = new Map()
  private readonly STORAGE_KEY = 'devvibe_chat_history'
  private readonly MAX_SESSIONS_DEFAULT = 50
  private readonly AUTO_SAVE_INTERVAL = 30000 // 30 seconds

  private constructor() {
    this.loadFromStorage()
    this.startAutoSave()
  }

  static getInstance(): ChatHistoryManager {
    if (!ChatHistoryManager.instance) {
      ChatHistoryManager.instance = new ChatHistoryManager()
    }
    return ChatHistoryManager.instance
  }

  // Create or get user's chat memory
  getUserMemory(userId: string): UserChatMemory {
    if (!this.chatHistory.has(userId)) {
      const newMemory: UserChatMemory = {
        userId,
        sessions: [],
        preferences: {
          autoSaveChats: true,
          maxSessionsToKeep: this.MAX_SESSIONS_DEFAULT,
          topicDetectionEnabled: true
        }
      }
      this.chatHistory.set(userId, newMemory)
    }
    return this.chatHistory.get(userId)!
  }

  // Start a new chat session
  async startNewSession(userId: string, initialMessage?: string): Promise<string> {
    const memory = this.getUserMemory(userId)
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Detect topic from initial message
    const topic = initialMessage ? await this.detectTopic(initialMessage) : 'General Chat'
    const title = this.generateSessionTitle(initialMessage || 'New Conversation', topic)

    const newSession: ChatSession = {
      id: sessionId,
      userId,
      topic,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: this.generateTags(topic, initialMessage)
    }

    memory.sessions.unshift(newSession) // Add to beginning
    
    // Keep only the most recent sessions
    if (memory.sessions.length > memory.preferences.maxSessionsToKeep) {
      memory.sessions = memory.sessions.slice(0, memory.preferences.maxSessionsToKeep)
    }

    await this.saveToStorage()
    console.log(`📝 Started new chat session: ${title} (${sessionId})`)
    
    return sessionId
  }

  // Add message to session
  async addMessage(userId: string, sessionId: string, message: ChatMessage): Promise<void> {
    const memory = this.getUserMemory(userId)
    const session = memory.sessions.find(s => s.id === sessionId)
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found for user ${userId}`)
    }

    session.messages.push(message)
    session.updatedAt = new Date()

    // Update topic if needed (for evolving conversations)
    if (message.role === 'user' && memory.preferences.topicDetectionEnabled) {
      const newTopic = await this.detectTopic(message.content)
      if (newTopic !== session.topic && session.messages.length > 3) {
        session.topic = newTopic
        session.title = this.generateSessionTitle(message.content, newTopic)
        session.tags = [...new Set([...session.tags, ...this.generateTags(newTopic, message.content)])]
      }
    }

    // Store important knowledge in vector database
    if (message.role === 'assistant' && message.metadata?.rating && message.metadata.rating >= 4) {
      await this.storeKnowledgeFromChat(userId, session, message)
    }

    // Learn from bad responses (rating 1-2)
    if (message.role === 'assistant' && message.metadata?.rating && message.metadata.rating <= 2) {
      await this.learnFromBadResponse(userId, session, message)
    }

    await this.saveToStorage()
  }

  // Get session context for AI
  async getSessionContext(userId: string, sessionId: string): Promise<{
    recentMessages: ChatMessage[]
    sessionSummary: string
    relatedTopics: string[]
    userPreferences: any
    conversationPatterns: string[]
  }> {
    const memory = this.getUserMemory(userId)
    const session = memory.sessions.find(s => s.id === sessionId)
    
    if (!session) {
      return {
        recentMessages: [],
        sessionSummary: '',
        relatedTopics: [],
        userPreferences: memory.preferences,
        conversationPatterns: []
      }
    }

    // Get recent messages (last 10)
    const recentMessages = session.messages.slice(-10)

    // Generate session summary
    const sessionSummary = await this.generateSessionSummary(session)

    // Find related topics from user's history
    const relatedTopics = this.findRelatedTopics(userId, session.topic)

    // Analyze conversation patterns
    const conversationPatterns = this.analyzeConversationPatterns(userId, session)

    return {
      recentMessages,
      sessionSummary,
      relatedTopics,
      userPreferences: memory.preferences,
      conversationPatterns
    }
  }

  // Get user's chat sessions
  getUserSessions(userId: string, options: {
    topic?: string
    limit?: number
    searchQuery?: string
  } = {}): ChatSession[] {
    const memory = this.getUserMemory(userId)
    let sessions = [...memory.sessions]

    // Filter by topic
    if (options.topic) {
      sessions = sessions.filter(s => s.topic.toLowerCase().includes(options.topic!.toLowerCase()))
    }

    // Search in content
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase()
      sessions = sessions.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query)) ||
        s.messages.some(m => m.content.toLowerCase().includes(query))
      )
    }

    // Limit results
    if (options.limit) {
      sessions = sessions.slice(0, options.limit)
    }

    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  // Delete a session
  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    const memory = this.getUserMemory(userId)
    const sessionIndex = memory.sessions.findIndex(s => s.id === sessionId)
    
    if (sessionIndex === -1) {
      return false
    }

    memory.sessions.splice(sessionIndex, 1)
    await this.saveToStorage()
    console.log(`🗑️ Deleted chat session: ${sessionId}`)
    return true
  }

  // Private helper methods
  private async detectTopic(message: string): Promise<string> {
    const topicPatterns = [
      { pattern: /\b(service|offer|provide|help|what.*do|pricing|cost|price)\b/i, topic: 'Services & Pricing' },
      { pattern: /\b(react|javascript|typescript|node|frontend|backend|development|code|programming)\b/i, topic: 'Development & Tech' },
      { pattern: /\b(project|timeline|process|workflow|start|begin|planning)\b/i, topic: 'Project Planning' },
      { pattern: /\b(design|ui|ux|interface|website|mobile|app)\b/i, topic: 'Design & UX' },
      { pattern: /\b(ai|artificial|intelligence|machine|learning|automation)\b/i, topic: 'AI & Automation' },
      { pattern: /\b(database|api|server|hosting|deployment|cloud)\b/i, topic: 'Infrastructure' },
      { pattern: /\b(team|collaboration|communication|meeting|discussion)\b/i, topic: 'Collaboration' },
      { pattern: /\b(problem|issue|bug|error|help|support|fix)\b/i, topic: 'Support & Issues' }
    ]

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(message)) {
        return topic
      }
    }

    return 'General Chat'
  }

  private generateSessionTitle(message: string, topic: string): string {
    // Extract key phrases for title
    const words = message.split(' ').slice(0, 6).join(' ')
    const shortTitle = words.length > 40 ? words.substring(0, 40) + '...' : words
    
    return shortTitle || `${topic} Discussion`
  }

  private generateTags(topic: string, message?: string): string[] {
    const tags = [topic.toLowerCase()]
    
    if (message) {
      const tagPatterns = [
        { pattern: /\breact\b/i, tag: 'react' },
        { pattern: /\bjavascript\b/i, tag: 'javascript' },
        { pattern: /\bai\b/i, tag: 'ai' },
        { pattern: /\bprice|cost|pricing\b/i, tag: 'pricing' },
        { pattern: /\bdesign\b/i, tag: 'design' },
        { pattern: /\bmobile\b/i, tag: 'mobile' },
        { pattern: /\bweb\b/i, tag: 'web' }
      ]

      for (const { pattern, tag } of tagPatterns) {
        if (pattern.test(message) && !tags.includes(tag)) {
          tags.push(tag)
        }
      }
    }

    return tags
  }

  private async generateSessionSummary(session: ChatSession): Promise<string> {
    if (session.messages.length === 0) return 'Empty conversation'
    
    const userMessages = session.messages.filter(m => m.role === 'user').map(m => m.content)
    const assistantMessages = session.messages.filter(m => m.role === 'assistant').map(m => m.content)
    
    const keyTopics = this.extractKeyTopics(userMessages.join(' '))
    const mainQuestions = userMessages.slice(0, 3)
    
    return `${session.topic} discussion covering ${keyTopics.join(', ')}. Main questions: ${mainQuestions.join('; ')}`
  }

  private extractKeyTopics(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/)
    const topicWords = ['development', 'design', 'react', 'ai', 'pricing', 'project', 'service', 'web', 'mobile', 'api']
    
    return topicWords.filter(topic => words.includes(topic))
  }

  private findRelatedTopics(userId: string, currentTopic: string): string[] {
    const memory = this.getUserMemory(userId)
    const topicCount = new Map<string, number>()
    
    for (const session of memory.sessions) {
      if (session.topic !== currentTopic) {
        topicCount.set(session.topic, (topicCount.get(session.topic) || 0) + 1)
      }
    }
    
    return Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic)
  }

  private analyzeConversationPatterns(userId: string, currentSession: ChatSession): string[] {
    const memory = this.getUserMemory(userId)
    const patterns: string[] = []

    // Analyze user's question patterns
    const userQuestions = memory.sessions
      .flatMap(s => s.messages.filter(m => m.role === 'user'))
      .map(m => m.content.toLowerCase())

    // Find common question starters
    const questionStarters = userQuestions
      .map(q => q.split(' ').slice(0, 3).join(' '))
      .reduce((acc, starter) => {
        acc[starter] = (acc[starter] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Find patterns that occur more than once
    Object.entries(questionStarters)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([pattern, count]) => {
        patterns.push(`User often asks: "${pattern}..." (${count} times)`)
      })

    return patterns
  }

  private async storeKnowledgeFromChat(userId: string, session: ChatSession, message: ChatMessage): Promise<void> {
    try {
      await vectorKnowledge.storeKnowledge(
        message.content,
        `user_conversation_${session.topic.toLowerCase().replace(/\s+/g, '_')}`,
        {
          userId,
          sessionId: session.id,
          topic: session.topic,
          rating: message.metadata?.rating,
          timestamp: message.timestamp.toISOString(),
          source: 'highly_rated_conversation',
          conversationContext: session.messages.slice(-3).map(m => ({
            role: m.role,
            content: m.content.substring(0, 100)
          }))
        }
      )
      
      console.log(`⭐ Stored excellent chat knowledge: ${message.content.substring(0, 50)}...`)
    } catch (error) {
      console.error('Failed to store chat knowledge:', error)
    }
  }

  private async learnFromBadResponse(userId: string, session: ChatSession, message: ChatMessage): Promise<void> {
    try {
      // Store bad response pattern to avoid in future
      const badResponsePattern = {
        userId,
        sessionId: session.id,
        topic: session.topic,
        question: session.messages[session.messages.length - 2]?.content || '',
        badAnswer: message.content,
        rating: message.metadata?.rating,
        timestamp: message.timestamp.toISOString(),
        reason: 'user_rated_poor'
      }

      // Store in a special collection for bad responses
      const badResponses = JSON.parse(localStorage.getItem('devvibe_bad_responses') || '[]')
      badResponses.push(badResponsePattern)
      
      // Keep only last 100 bad responses to avoid storage bloat
      if (badResponses.length > 100) {
        badResponses.splice(0, badResponses.length - 100)
      }
      
      localStorage.setItem('devvibe_bad_responses', JSON.stringify(badResponses))
      
      console.log(`❌ Learned from bad response (rating: ${message.metadata?.rating}/5): ${message.content.substring(0, 50)}...`)
    } catch (error) {
      console.error('Failed to learn from bad response:', error)
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        for (const [userId, memory] of Object.entries(data)) {
          const userMemory = memory as any
          // Convert date strings back to Date objects
          userMemory.sessions = userMemory.sessions.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
          this.chatHistory.set(userId, userMemory)
        }
        console.log(`📚 Loaded chat history for ${this.chatHistory.size} users`)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = Object.fromEntries(this.chatHistory)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  private startAutoSave(): void {
    setInterval(() => {
      this.saveToStorage()
    }, this.AUTO_SAVE_INTERVAL)
  }

  // Public utility methods
  async exportUserData(userId: string): Promise<string> {
    const memory = this.getUserMemory(userId)
    return JSON.stringify(memory, null, 2)
  }

  async importUserData(userId: string, data: string): Promise<void> {
    try {
      const importedMemory = JSON.parse(data)
      this.chatHistory.set(userId, importedMemory)
      await this.saveToStorage()
    } catch (error) {
      throw new Error('Invalid data format for import')
    }
  }

  getChatStats(userId: string): {
    totalSessions: number
    totalMessages: number
    topicsDiscussed: string[]
    averageSessionLength: number
    mostActiveDay: string
    averageRating: number
    improvementTrend: string
  } {
    const memory = this.getUserMemory(userId)
    const totalSessions = memory.sessions.length
    const totalMessages = memory.sessions.reduce((sum, session) => sum + session.messages.length, 0)
    const topics = [...new Set(memory.sessions.map(s => s.topic))]
    const avgLength = totalSessions > 0 ? totalMessages / totalSessions : 0
    
    // Calculate average rating
    const ratedMessages = memory.sessions.flatMap(s => s.messages).filter(m => m.metadata?.rating)
    const avgRating = ratedMessages.length > 0 ? 
      ratedMessages.reduce((sum, m) => sum + (m.metadata?.rating || 0), 0) / ratedMessages.length : 0

    // Find most active day
    const dayActivity = new Map<string, number>()
    for (const session of memory.sessions) {
      const day = session.createdAt.toDateString()
      dayActivity.set(day, (dayActivity.get(day) || 0) + 1)
    }
    
    const mostActiveDay = Array.from(dayActivity.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'No activity'

    // Calculate improvement trend
    const recentRatings = ratedMessages.slice(-10).map(m => m.metadata?.rating || 0)
    const olderRatings = ratedMessages.slice(-20, -10).map(m => m.metadata?.rating || 0)
    const recentAvg = recentRatings.length > 0 ? recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length : 0
    const olderAvg = olderRatings.length > 0 ? olderRatings.reduce((a, b) => a + b, 0) / olderRatings.length : 0
    
    let improvementTrend = 'Stable'
    if (recentAvg > olderAvg + 0.3) improvementTrend = 'Improving'
    else if (recentAvg < olderAvg - 0.3) improvementTrend = 'Declining'

    return {
      totalSessions,
      totalMessages,
      topicsDiscussed: topics,
      averageSessionLength: Math.round(avgLength),
      mostActiveDay,
      averageRating: Math.round(avgRating * 10) / 10,
      improvementTrend
    }
  }

  // Check if a response is similar to previously rated bad responses
  async isSimilarToBadResponse(question: string, potentialAnswer: string): Promise<boolean> {
    try {
      const badResponses = JSON.parse(localStorage.getItem('devvibe_bad_responses') || '[]')
      
      for (const badResponse of badResponses) {
        if (this.similarQuestions(question, badResponse.question) && 
            this.similarAnswers(potentialAnswer, badResponse.badAnswer)) {
          console.log(`⚠️ Potential answer similar to previously bad response (rating: ${badResponse.rating}/5)`)
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Error checking bad responses:', error)
      return false
    }
  }

  private similarQuestions(q1: string, q2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    const words1 = normalize(q1).split(' ').filter(w => w.length > 2)
    const words2 = normalize(q2).split(' ').filter(w => w.length > 2)
    
    if (words1.length === 0 || words2.length === 0) return false
    
    const commonWords = words1.filter(word => words2.includes(word))
    const similarity = commonWords.length / Math.max(words1.length, words2.length)
    
    return similarity >= 0.6
  }

  private similarAnswers(a1: string, a2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()
    return normalize(a1).substring(0, 150) === normalize(a2).substring(0, 150)
  }
}

export const chatHistoryManager = ChatHistoryManager.getInstance()
