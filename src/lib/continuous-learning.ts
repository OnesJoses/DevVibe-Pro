// Continuous Learning System with ChromaDB Integration
import { enhancedVectorKnowledge } from './enhanced-vector-knowledge'
import { WebLearningEngine } from './web-learning-engine'

interface LearningSession {
  id: string
  query: string
  initialResponse: string
  webSearchResults?: any[]
  finalResponse: string
  userFeedback?: number
  learningSource: 'chroma' | 'web' | 'hybrid'
  timestamp: number
  confidence: number
}

export class ContinuousLearningSystem {
  private learningHistory: LearningSession[] = []
  private isInitialized = false
  private webLearning = new WebLearningEngine()

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await enhancedVectorKnowledge.initialize()
      this.loadLearningHistory()
      this.isInitialized = true
      console.log('🚀 Continuous Learning System initialized')
    } catch (error) {
      console.error('❌ Learning system initialization failed:', error)
      throw error
    }
  }

  // Main learning loop: Query ChromaDB → If not found → Search web → Learn → Store
  async intelligentQuery(query: string, context?: any): Promise<{
    response: string
    source: 'knowledge_base' | 'web_search' | 'hybrid'
    confidence: number
    learned: boolean
    sessionId: string
  }> {
    await this.initialize()

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    let finalResponse = ''
    let confidence = 0
    let learned = false
    let source: 'knowledge_base' | 'web_search' | 'hybrid' = 'knowledge_base'

    try {
      console.log(`🔍 Processing query: "${query}"`)

      // Step 1: Search existing knowledge base with more lenient threshold
      const knowledgeResults = await enhancedVectorKnowledge.hybridSearch(query, {
        maxResults: 3,
        minConfidence: 0.4, // Lowered from 0.6 to be more inclusive
        includeConversational: true
      })

      if (knowledgeResults.length > 0 && knowledgeResults[0].similarity > 0.5) { // Lowered from 0.7
        // Good match found in knowledge base - use it
        finalResponse = this.synthesizeKnowledgeResponse(knowledgeResults, query)
        confidence = knowledgeResults[0].similarity
        source = 'knowledge_base'
        
        console.log(`✅ Found answer in knowledge base (confidence: ${confidence.toFixed(2)})`)
        
      } else {
        // Only search web if it's likely to be useful (not for greetings, casual conversation)
        const shouldSearchWeb = this.shouldPerformWebSearch(query)
        
        if (shouldSearchWeb) {
          // Step 2: Search web for new information
          console.log(`🌐 Searching web for: "${query}"`)
          const webResults = await this.webLearning.searchAndLearn(query)
          
          if (webResults && webResults.enhancedAnswer && webResults.results[0]?.relevance > 0.3) {
            // Step 3: Combine existing knowledge with new web information
            let combinedResponse = webResults.enhancedAnswer
            
            if (knowledgeResults.length > 0) {
              // Hybrid approach: combine existing knowledge with new web info
              combinedResponse = this.combineKnowledgeAndWeb(knowledgeResults, webResults, query)
              source = 'hybrid'
            } else {
              source = 'web_search'
            }
            
            finalResponse = combinedResponse
            confidence = Math.min(0.8, webResults.results[0].relevance + 0.2) // Adjusted confidence
            
            // Step 4: Learn and store new knowledge only if it's valuable
            if (webResults.results[0].relevance > 0.5) {
              await this.learnFromWebSearch(query, webResults, context)
              learned = true
              console.log(`🧠 Learned new information and stored in ChromaDB`)
            }
            
          } else {
            // Web search didn't yield good results, fallback to existing knowledge or default
            if (knowledgeResults.length > 0) {
              finalResponse = this.synthesizeKnowledgeResponse(knowledgeResults, query)
              confidence = knowledgeResults[0].similarity
              source = 'knowledge_base'
            } else {
              finalResponse = this.generateFallbackResponse(query)
              confidence = 0.3
            }
          }
        } else {
          // Don't search web for conversational queries, use existing knowledge or generate appropriate response
          if (knowledgeResults.length > 0) {
            finalResponse = this.synthesizeKnowledgeResponse(knowledgeResults, query)
            confidence = knowledgeResults[0].similarity
            source = 'knowledge_base'
          } else {
            finalResponse = this.generateFallbackResponse(query)
            confidence = 0.3
          }
        }
      }

      // Record learning session
      this.recordLearningSession({
        id: sessionId,
        query,
        initialResponse: knowledgeResults.length > 0 ? knowledgeResults[0].content : '',
        finalResponse,
        learningSource: source === 'knowledge_base' ? 'chroma' : (source === 'web_search' ? 'web' : 'hybrid'),
        timestamp: Date.now(),
        confidence
      })

      return {
        response: finalResponse,
        source,
        confidence,
        learned,
        sessionId
      }

    } catch (error) {
      console.error('❌ Intelligent query failed:', error)
      return {
        response: this.generateErrorResponse(query),
        source: 'knowledge_base',
        confidence: 0.1,
        learned: false,
        sessionId
      }
    }
  }

  // Learn from web search results and store in ChromaDB
  private async learnFromWebSearch(
    query: string, 
    webResults: any, 
    context?: any
  ): Promise<void> {
    try {
      // Determine category based on query content
      const category = this.categorizeQuery(query)
      
      // Store comprehensive web learning
      await enhancedVectorKnowledge.teachNewKnowledge(
        query,
        webResults.enhancedAnswer,
        'web_search',
        category
      )

      // Store individual facts if available
      if (webResults.results && webResults.results.length > 0) {
        for (const source of webResults.results.slice(0, 3)) { // Top 3 sources
          if (source.snippet) {
            await enhancedVectorKnowledge.storeKnowledge(
              `Source: ${source.title}\nContent: ${source.snippet}`,
              category,
              {
                importance: 'medium',
                confidence: 0.7,
                source: 'web_search',
                tags: [query, ...this.extractTopics(source.snippet)],
                quality_score: 0.6
              }
            )
          }
        }
      }

    } catch (error) {
      console.error('❌ Failed to learn from web search:', error)
    }
  }

  // User feedback loop for continuous improvement
  async provideFeedback(
    sessionId: string, 
    rating: number, 
    feedback?: string
  ): Promise<void> {
    const session = this.learningHistory.find(s => s.id === sessionId)
    if (!session) {
      console.warn(`⚠️ Session ${sessionId} not found for feedback`)
      return
    }

    session.userFeedback = rating

    // Learn from positive feedback
    if (rating >= 4) {
      await enhancedVectorKnowledge.learnFromInteraction(
        session.query,
        session.finalResponse,
        rating,
        'user_feedback',
        this.categorizeQuery(session.query)
      )
      
      console.log(`👍 Positive feedback recorded and learned (${rating}/5)`)
    } else if (rating <= 2) {
      // Log negative feedback for future improvement
      console.log(`👎 Negative feedback recorded (${rating}/5): ${feedback || 'No details'}`)
      
      // Could implement correction logic here
      // For now, just log for manual review
    }

    this.saveLearningHistory()
  }

  // Get learning statistics and insights
  async getLearningStats(): Promise<{
    totalSessions: number
    knowledgeBaseHits: number
    webSearches: number
    hybridResponses: number
    averageConfidence: number
    topQueries: string[]
    feedbackDistribution: Record<number, number>
    knowledgeGrowth: {
      total: number
      byCategory: Record<string, number>
      qualityDistribution: Record<string, number>
    }
  }> {
    const stats = {
      totalSessions: this.learningHistory.length,
      knowledgeBaseHits: 0,
      webSearches: 0,
      hybridResponses: 0,
      averageConfidence: 0,
      topQueries: [] as string[],
      feedbackDistribution: {} as Record<number, number>,
      knowledgeGrowth: await enhancedVectorKnowledge.getKnowledgeStats()
    }

    let totalConfidence = 0
    const queryCount: Record<string, number> = {}

    this.learningHistory.forEach(session => {
      // Source distribution
      if (session.learningSource === 'chroma') stats.knowledgeBaseHits++
      else if (session.learningSource === 'web') stats.webSearches++
      else stats.hybridResponses++

      // Confidence tracking
      totalConfidence += session.confidence

      // Query frequency
      queryCount[session.query] = (queryCount[session.query] || 0) + 1

      // Feedback distribution
      if (session.userFeedback) {
        stats.feedbackDistribution[session.userFeedback] = 
          (stats.feedbackDistribution[session.userFeedback] || 0) + 1
      }
    })

    stats.averageConfidence = this.learningHistory.length > 0 ? 
      totalConfidence / this.learningHistory.length : 0

    // Top queries by frequency
    stats.topQueries = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query)

    return stats
  }

  // Private helper methods
  private synthesizeKnowledgeResponse(results: any[], query: string): string {
    if (results.length === 0) return this.generateFallbackResponse(query)
    
    const primaryResult = results[0]
    let response = primaryResult.content

    // Clean up the response to be more natural
    if (response.includes('Q:') && response.includes('A:')) {
      // Extract just the answer part if it's in Q&A format
      const answerMatch = response.match(/A:\s*([\s\S]*?)(?:\n\n|$)/)
      if (answerMatch) {
        response = answerMatch[1].trim()
      }
    }

    // Add supporting information from other results if available and relevant
    if (results.length > 1 && results[1].similarity > 0.6) {
      const supportingInfo = results.slice(1, 2) // Just one additional result
        .map(r => {
          let content = r.content
          if (content.includes('Q:') && content.includes('A:')) {
            const answerMatch = content.match(/A:\s*([\s\S]*?)(?:\n\n|$)/)
            content = answerMatch ? answerMatch[1].trim() : content
          }
          return content.substring(0, 150) + (content.length > 150 ? '...' : '')
        })
        .join('\n\n')
      
      if (supportingInfo && supportingInfo.length > 20) {
        response += `\n\n**Additional details:**\n${supportingInfo}`
      }
    }

    return response
  }

  private combineKnowledgeAndWeb(
    knowledgeResults: any[], 
    webResults: any, 
    query: string
  ): string {
    const existingKnowledge = knowledgeResults[0]?.content || ''
    const webInfo = webResults.enhancedAnswer || ''

    // Clean up existing knowledge if it's in Q&A format
    let cleanKnowledge = existingKnowledge
    if (existingKnowledge.includes('Q:') && existingKnowledge.includes('A:')) {
      const answerMatch = existingKnowledge.match(/A:\s*([\s\S]*?)(?:\n\n|$)/)
      if (answerMatch) {
        cleanKnowledge = answerMatch[1].trim()
      }
    }

    // If web search didn't find good results, just use knowledge base
    if (webResults.results[0]?.relevance < 0.3) {
      return cleanKnowledge
    }

    // Combine naturally if both have valuable information
    if (cleanKnowledge && webInfo && webInfo.length > 50) {
      return `${cleanKnowledge}\n\n**Current information:**\n${webInfo}`
    } else if (cleanKnowledge) {
      return cleanKnowledge
    } else {
      return webInfo
    }
  }

  private categorizeQuery(query: string): string {
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('pricing')) {
      return 'pricing'
    }
    if (queryLower.includes('service') || queryLower.includes('what do') || queryLower.includes('how can')) {
      return 'services'
    }
    if (queryLower.includes('technical') || queryLower.includes('how to') || queryLower.includes('implement')) {
      return 'technical'
    }
    if (queryLower.includes('business') || queryLower.includes('company') || queryLower.includes('work')) {
      return 'business'
    }
    
    return 'conversation'
  }

  private shouldPerformWebSearch(query: string): boolean {
    const queryLower = query.toLowerCase().trim()
    
    // Don't search web for greetings and casual conversation
    const greetings = ['hi', 'hello', 'hey', 'hiya', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening']
    const gratitude = ['thanks', 'thank you', 'ty', 'thx', 'appreciate', 'grateful']
    const casual = ['ok', 'okay', 'cool', 'nice', 'great', 'awesome', 'good', 'fine', 'alright']
    const personal = ['how are you', 'what\'s up', 'how\'s it going', 'how do you do']
    
    // Check for exact matches or if query starts with these phrases
    const skipPatterns = [...greetings, ...gratitude, ...casual, ...personal]
    for (const pattern of skipPatterns) {
      if (queryLower === pattern || queryLower.startsWith(pattern + ' ') || queryLower.endsWith(' ' + pattern)) {
        return false
      }
    }
    
    // Don't search web for very short queries that are likely conversational
    if (queryLower.length < 4) {
      return false
    }
    
    // Don't search for core business queries that should be in knowledge base
    const coreTopics = ['services', 'pricing', 'portfolio', 'contact', 'about', 'experience', 'skills']
    const isCoreTopic = coreTopics.some(topic => queryLower.includes(topic))
    if (isCoreTopic) {
      return false // Use knowledge base for these
    }
    
    // Search web for technical questions, current events, specific implementation details
    const webSearchKeywords = [
      'latest', 'current', 'new', 'recent', 'update', 'trend', 'news',
      'how to implement', 'best practices for', 'tutorial', 'guide',
      'comparison between', 'vs', 'versus', 'difference',
      'what is the latest', 'current state of'
    ]
    
    return webSearchKeywords.some(keyword => queryLower.includes(keyword))
  }

  private extractTopics(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
    return [...new Set(words.filter(word => word.length > 4 && !commonWords.has(word)))].slice(0, 5)
  }

  private generateFallbackResponse(query: string): string {
    return `I'd be happy to help you with "${query}". While I don't have specific information about this topic in my current knowledge base, I'm always learning. Could you provide more context about what you're looking for?`
  }

  private generateErrorResponse(query: string): string {
    return `I encountered an issue while processing your query about "${query}". Please try rephrasing your question, and I'll do my best to help.`
  }

  private recordLearningSession(session: LearningSession): void {
    this.learningHistory.push(session)
    
    // Keep only recent sessions in memory (last 100)
    if (this.learningHistory.length > 100) {
      this.learningHistory = this.learningHistory.slice(-100)
    }
    
    this.saveLearningHistory()
  }

  private loadLearningHistory(): void {
    try {
      const stored = localStorage.getItem('learning_history')
      if (stored) {
        this.learningHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load learning history:', error)
      this.learningHistory = []
    }
  }

  private saveLearningHistory(): void {
    try {
      localStorage.setItem('learning_history', JSON.stringify(this.learningHistory))
    } catch (error) {
      console.warn('Failed to save learning history:', error)
    }
  }
}

export const continuousLearning = new ContinuousLearningSystem()
