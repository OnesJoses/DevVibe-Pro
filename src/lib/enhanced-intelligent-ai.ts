import { vectorKnowledge } from './vector-knowledge-engine'
import { webLearning } from './web-learning-engine'
import { persistentStorage } from './persistent-storage-engine'
import { historyManager } from './history-manager'

export class EnhancedIntelligentAI {
  private conversationHistory: Array<{question: string, answer: string, timestamp: number}> = []
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Test ChromaDB connection
      const connectionStatus = await vectorKnowledge.testConnection()
      console.log(connectionStatus ? '✅ ChromaDB connected' : '⚠️ Using local fallback')
      this.isInitialized = true
    } catch (error) {
      console.warn('❌ Initialization warning:', error)
      this.isInitialized = true
    }
  }

  // Main intelligence function that combines all learning systems
  async processQuery(query: string): Promise<{
    answer: string
    confidence: number
    sources: string[]
    newLearning: {
      concepts: string[]
      webResults: any[]
      similarConversations: any[]
    }
    metadata: any
  }> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log('🧠 Processing query with ChromaDB-enhanced AI:', query)
      
      // 1. Analyze intent and context
      const intent = this.analyzeIntent(query)
      console.log('📊 Intent analysis:', intent)
      
      // 2. Search ChromaDB for similar content (semantic search)
      const similarContent = await vectorKnowledge.findSimilarContent(query, 0.6)
      console.log('🔍 ChromaDB results:', similarContent.length)
      
      // 3. Search stored conversations using History Manager (replaces IndexedDB search)
      const similarConversations = await historyManager.findSimilarConversations(query, 3)
      console.log('💬 Similar conversations from memory:', similarConversations.length)
      
      // 4. Also check IndexedDB for compatibility
      const legacyConversations = await persistentStorage.findSimilarConversations(query, 2)
      console.log('📚 Legacy conversations:', legacyConversations.length)
      
      // 5. If no good local knowledge and it's not a simple/core question, search web and learn
      let webResults: any[] = []
      let newConcepts: string[] = []
      
      const shouldSearchWeb = !intent.skipWebSearch && 
        intent.type !== 'greeting' &&
        intent.type !== 'gratitude' &&
        intent.type !== 'casual_response' &&
        intent.type !== 'personal_question' &&
        intent.type !== 'service_inquiry' &&
        intent.type !== 'technical' &&
        intent.type !== 'pricing' &&
        intent.type !== 'portfolio' &&
        (similarContent.length === 0 || similarContent[0].similarity < 0.6) && // Lowered threshold
        (similarConversations.length === 0 || similarConversations[0].metadata.confidence < 0.6) // Check memory confidence
      
      if (shouldSearchWeb) {
        console.log('🌐 Searching web for new information...')
        const webLearningResult = await webLearning.searchAndLearn(query)
        webResults = webLearningResult.results
        newConcepts = webLearningResult.newConcepts
        
        // Store new web knowledge in ChromaDB
        if (webResults.length > 0) {
          for (const result of webResults.slice(0, 2)) { // Store top 2 results
            await vectorKnowledge.storeKnowledge(
              `${result.title}: ${result.snippet}`,
              'web_search',
              {
                source: 'web',
                url: result.url,
                confidence: result.relevance,
                query: query
              }
            )
          }
        }
        
        if (newConcepts.length > 0) {
          console.log('📚 Learned new concepts:', newConcepts)
        }
      } else if (intent.skipWebSearch) {
        console.log('💬 Simple conversational query - skipping web search')
      }
      
      // 6. Generate comprehensive answer using memory-enhanced context
      const answer = await this.generateComprehensiveAnswer(
        query,
        intent,
        similarContent,
        [...similarConversations, ...legacyConversations], // Combine memory sources
        webResults
      )
      
      // 7. Calculate confidence with memory boost
      const confidence = this.calculateConfidence(similarContent, similarConversations, webResults, intent)
      
      // 8. Determine sources including memory
      const sources = this.determineSources(similarContent, [...similarConversations, ...legacyConversations], webResults)
      
      // 9. Store this conversation in History Manager for future learning
      const responseTime = Date.now() - (performance.now() || Date.now())
      const conversationId = await historyManager.storeConversation(
        query,
        answer,
        {
          confidence,
          sources,
          responseTime,
          intent: intent.type
        }
      )
      
      console.log(`💾 Conversation stored in memory: ${conversationId}`)
      
      return {
        answer,
        confidence,
        sources,
        newLearning: {
          concepts: newConcepts,
          webResults,
          similarConversations: [...similarConversations, ...legacyConversations]
        },
        metadata: {
          intent,
          vectorResults: similarContent.length,
          conversationMatches: similarConversations.length + legacyConversations.length,
          webSearchPerformed: webResults.length > 0,
          totalSources: sources.length,
          chromaDBUsed: true,
          memoryUsed: similarConversations.length > 0,
          conversationId
        }
      }
      
    } catch (error) {
      console.error('❌ Enhanced AI processing error:', error)
      return {
        answer: 'I encountered an issue processing your question. Let me help you with what I know.',
        confidence: 0.3,
        sources: ['internal'],
        newLearning: { concepts: [], webResults: [], similarConversations: [] },
        metadata: { error: true }
      }
    }
  }

  // Learn from successful interactions with ChromaDB storage
  async learnFromInteraction(
    question: string, 
    answer: string, 
    feedback: number, 
    metadata: any
  ): Promise<void> {
    try {
      // Store in ChromaDB for semantic search
      if (feedback >= 3) {
        await vectorKnowledge.storeKnowledge(
          `Q: ${question}\nA: ${answer}`,
          'qa_interaction',
          {
            type: 'conversation',
            question,
            answer,
            feedback,
            confidence: feedback / 5,
            source: 'user_feedback',
            intent: metadata.intent?.type || 'general'
          }
        )
      }
      
      // Store in persistent storage (IndexedDB) for compatibility
      await persistentStorage.storeConversation(question, answer, feedback, metadata)
      
      // Record feedback in History Manager for enhanced learning
      if (metadata.conversationId) {
        await historyManager.recordFeedback(
          metadata.conversationId,
          feedback,
          metadata.comments
        )
      }
      
      // Learn vector representations
      await vectorKnowledge.learnFromInteraction(question, answer, feedback, 'user_feedback')
      
      // Update conversation history
      this.conversationHistory.push({
        question,
        answer,
        timestamp: Date.now()
      })
      
      // Keep only recent conversations in memory
      if (this.conversationHistory.length > 50) {
        this.conversationHistory = this.conversationHistory.slice(-50)
      }
      
      console.log(`✅ Learned from interaction (feedback: ${feedback}/5) - Stored in ChromaDB & IndexedDB`)
      
    } catch (error) {
      console.error('❌ Learning error:', error)
    }
  }

  // Get comprehensive learning insights including ChromaDB stats and History Manager
  async getLearningInsights(): Promise<{
    chromaDB: any
    storage: any
    vector: any
    web: any
    memory: any
    performance: any
  }> {
    const [chromaStats, storageAnalytics, vectorInsights, webInsights, memoryInsights] = await Promise.all([
      vectorKnowledge.getCollectionStats(),
      persistentStorage.getLearningAnalytics(),
      vectorKnowledge.getVocabularyInsights(),
      webLearning.getConceptInsights(),
      historyManager.getMemoryInsights()
    ])
    
    const performance = {
      conversationHistory: this.conversationHistory.length,
      averageConfidence: this.conversationHistory.length > 0 
        ? this.conversationHistory.reduce((sum, conv) => sum + 0.8, 0) / this.conversationHistory.length
        : 0,
      learningRate: this.calculateLearningRate(),
      memoryUsage: this.estimateMemoryUsage(),
      chromaDBActive: await vectorKnowledge.testConnection(),
      historyManagerStatus: historyManager.getMemoryStatus()
    }
    
    return {
      chromaDB: chromaStats,
      storage: storageAnalytics,
      vector: vectorInsights,
      web: webInsights,
      memory: memoryInsights,
      performance
    }
  }

  // Search specific categories in ChromaDB
  async searchCategory(category: string, query?: string): Promise<any[]> {
    try {
      return await vectorKnowledge.searchByCategory(category, query, 10)
    } catch (error) {
      console.error('❌ Category search error:', error)
      return []
    }
  }

  private analyzeIntent(query: string): any {
    const q = query.toLowerCase().trim()
    
    // First, check for simple greetings and conversational patterns
    const greetings = /^(hi|hello|hey|hiya|howdy|greetings|good morning|good afternoon|good evening|hi there|hello there|hey there)$/i
    const thanks = /^(thanks|thank you|ty|thx|appreciate it)$/i
    const casual = /^(ok|okay|cool|nice|awesome|great|sure|yes|no|yep|nope)$/i
    const simpleQuestions = /^(how are you|what's up|how's it going|what are you)$/i
    
    // Handle simple conversational inputs
    if (greetings.test(q)) {
      return {
        type: 'greeting',
        confidence: 0.95,
        sentiment: 'friendly',
        complexity: 'simple',
        keywords: [q],
        urgency: 'low',
        skipWebSearch: true
      }
    }
    
    if (thanks.test(q)) {
      return {
        type: 'gratitude',
        confidence: 0.95,
        sentiment: 'positive',
        complexity: 'simple',
        keywords: [q],
        urgency: 'low',
        skipWebSearch: true
      }
    }
    
    if (casual.test(q)) {
      return {
        type: 'casual_response',
        confidence: 0.9,
        sentiment: 'neutral',
        complexity: 'simple',
        keywords: [q],
        urgency: 'low',
        skipWebSearch: true
      }
    }
    
    if (simpleQuestions.test(q)) {
      return {
        type: 'personal_question',
        confidence: 0.9,
        sentiment: 'curious',
        complexity: 'simple',
        keywords: [q],
        urgency: 'low',
        skipWebSearch: true
      }
    }
    
    // Enhanced intent analysis for substantive questions
    const intents = {
      service_inquiry: /\b(service|offer|do|provide|help|capabilities|what.*do|what.*can.*you|what.*you.*do|what.*are.*you|what.*you.*offer|what.*help)\b/i,
      pricing: /\b(cost|price|fee|charge|expensive|cheap|budget|pay|money|quote|estimate)\b/i,
      technical: /\b(react|node|javascript|typescript|database|api|framework|code|programming|development|tech|build|create|python|language|languages)\b/i,
      process: /\b(process|timeline|steps|workflow|method|approach|start|begin|how.*work|methodology)\b/i,
      comparison: /\b(vs|versus|compare|better|difference|between|which|best)\b/i,
      learning: /\b(learn|teach|how|tutorial|guide|explain|understand|show|example)\b/i,
      problem_solving: /\b(problem|issue|error|bug|fix|solve|help|trouble|stuck|wrong)\b/i,
      portfolio: /\b(portfolio|work|project|example|showcase|previous|experience|done)\b/i,
      contact: /\b(contact|reach|email|phone|call|meet|schedule|appointment)\b/i,
      collaboration: /\b(collaborate|work.*together|partner|team|join|hire)\b/i
    }
    
    let bestMatch = { type: 'general', confidence: 0.3 }
    
    // Only run complex analysis for longer, substantive queries
    if (q.length > 3 && q.split(' ').length > 1) {
      for (const [type, pattern] of Object.entries(intents)) {
        if (pattern.test(q)) {
          const matches = q.match(pattern)
          const confidence = Math.min(0.9, 0.6 + (matches?.length || 0) * 0.1)
          if (confidence > bestMatch.confidence) {
            bestMatch = { type, confidence }
          }
        }
      }
    }
    
    return {
      ...bestMatch,
      sentiment: this.analyzeSentiment(q),
      complexity: this.analyzeComplexity(query),
      keywords: this.extractKeywords(query),
      urgency: this.analyzeUrgency(q),
      skipWebSearch: q.length <= 10 && q.split(' ').length <= 2 // Skip web search for very short queries
    }
  }

  private analyzeSentiment(query: string): string {
    const positive = /\b(great|good|excellent|amazing|love|like|helpful|thanks|awesome|fantastic)\b/i
    const negative = /\b(bad|terrible|awful|useless|stupid|hate|frustrating|annoying|disappointed)\b/i
    const confused = /\b(confused|don't understand|unclear|what|how|help|lost|stuck)\b/i
    const urgent = /\b(urgent|asap|quickly|immediately|now|emergency|rush)\b/i
    const excited = /\b(excited|can't wait|looking forward|eager|interested)\b/i
    
    if (urgent.test(query)) return 'urgent'
    if (excited.test(query)) return 'excited'
    if (negative.test(query)) return 'frustrated'
    if (confused.test(query)) return 'confused'
    if (positive.test(query)) return 'positive'
    return 'neutral'
  }

  private analyzeComplexity(query: string): string {
    const wordCount = query.split(/\s+/).length
    const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1
    const hasTechnicalTerms = /\b(implement|integrate|architecture|framework|database|api|algorithm|optimization)\b/i.test(query)
    const hasBusinessTerms = /\b(ROI|budget|timeline|stakeholder|requirements|deliverables)\b/i.test(query)
    
    if (wordCount > 25 || hasMultipleQuestions || (hasTechnicalTerms && hasBusinessTerms)) return 'complex'
    if (wordCount > 15 || hasTechnicalTerms || hasBusinessTerms) return 'moderate'
    return 'simple'
  }

  private analyzeUrgency(query: string): string {
    const highUrgency = /\b(urgent|asap|immediately|emergency|critical|deadline)\b/i
    const mediumUrgency = /\b(soon|quickly|fast|need.*now|time.*sensitive)\b/i
    
    if (highUrgency.test(query)) return 'high'
    if (mediumUrgency.test(query)) return 'medium'
    return 'low'
  }

  private extractKeywords(query: string): string[] {
    const words = query.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 
      'what', 'when', 'where', 'why', 'will', 'with', 'would'
    ])
    
    return words.filter(word => !stopWords.has(word) && word.length > 2).slice(0, 5)
  }

  private async generateComprehensiveAnswer(
    query: string,
    intent: any,
    similarContent: any[],
    similarConversations: any[],
    webResults: any[]
  ): Promise<string> {
    let answer = ''
    
    // Prioritize contextual responses for known intent types
    const knownIntentTypes = ['greeting', 'gratitude', 'casual_response', 'personal_question', 
                             'service_inquiry', 'pricing', 'technical', 'portfolio', 'contact', 
                             'collaboration', 'learning', 'problem_solving', 'process', 'comparison']
    
    if (knownIntentTypes.includes(intent.type)) {
      // Use contextual response for known intent types
      answer = this.generateContextualResponse(query, intent)
    } else if (similarContent.length > 0 && similarContent[0].similarity > 0.6) {
      // Use ChromaDB knowledge for unknown intents with good matches
      answer = this.formatLocalKnowledge(similarContent[0], intent)
      answer = `*From my knowledge base:*\n\n${answer}`
    } else if (similarConversations.length > 0) {
      // Use similar conversation
      answer = this.formatSimilarConversation(similarConversations[0], intent)
    } else if (webResults.length > 0) {
      // Use web knowledge
      answer = this.formatWebKnowledge(webResults, intent)
    } else {
      // Final fallback to contextual response
      answer = this.generateContextualResponse(query, intent)
    }
    
    // Add enhanced context based on intent urgency
    if (intent.urgency === 'high') {
      answer = `⚡ **Quick Response:** ${answer}\n\nI understand this is urgent. Let me know if you need immediate assistance or want to schedule a call.`
    } else if (intent.sentiment === 'excited') {
      answer = `🚀 ${answer}\n\nI'm excited to help you with this! Feel free to ask any follow-up questions.`
    }
    
    // Add learning note if new concepts were discovered
    if (webResults.length > 0) {
      answer += '\n\n*💡 I learned new information from the web to answer this question and stored it in my knowledge base for future conversations.*'
    }
    
    return answer
  }

  private formatLocalKnowledge(content: any, intent: any): string {
    const baseContent = content.content
    
    switch (intent.sentiment) {
      case 'frustrated':
        return `I understand this might be frustrating. Let me give you a clear answer:\n\n${baseContent}\n\nI hope this helps clarify things for you. If you need more details, just ask!`
      case 'confused':
        return `Let me explain this clearly:\n\n${baseContent}\n\nDoes this help answer your question? Feel free to ask for more details or examples.`
      case 'urgent':
        return `Here's the quick answer you need:\n\n${baseContent}\n\nIf you need immediate assistance, let me know what specific help you need.`
      case 'excited':
        return `Great question! Here's what I know:\n\n${baseContent}\n\nI love helping with these kinds of projects!`
      default:
        return baseContent
    }
  }

  private formatSimilarConversation(conversation: any, intent: any): string {
    const content = conversation.content
    return `*Based on a similar question I answered before:*\n\n${content.answer}\n\n*This answer was adapted from my conversation history.*`
  }

  private formatWebKnowledge(webResults: any[], intent: any): string {
    const bestResult = webResults[0]
    let answer = `*Based on current web information:*\n\n**${bestResult.title}**\n${bestResult.snippet}`
    
    if (webResults.length > 1) {
      const additionalInfo = webResults.slice(1, 2).map(r => `• ${r.snippet}`).join('\n')
      if (additionalInfo) {
        answer += `\n\n**Additional Context:**\n${additionalInfo}`
      }
    }
    
    return answer
  }

  private generateContextualResponse(query: string, intent: any): string {
    const responses = {
      greeting: `Hello! 👋 Great to meet you! I'm here to help with any questions about development services, technical guidance, or project planning. What can I assist you with today?`,
      
      gratitude: `You're very welcome! 😊 I'm happy I could help. If you have any other questions about development, services, or anything else, feel free to ask anytime!`,
      
      casual_response: `Thanks! Is there anything specific I can help you with? I'm here for development questions, service inquiries, technical guidance, or just to chat about your projects!`,
      
      personal_question: `I'm doing great, thank you for asking! 🤖 I'm an AI assistant focused on helping with development services and technical guidance. I'm here and ready to help with any questions you might have about projects, coding, or services. What's on your mind?`,
      
      service_inquiry: `I'm a development assistant that can help you with:

🛠️ **Development Services:**
• Web applications (React, Next.js, Node.js)
• Mobile apps and progressive web apps
• API development and database design
• E-commerce and business applications

💡 **Technical Guidance:**
• Best practices and code reviews
• Architecture planning and recommendations
• Technology stack selection
• Performance optimization

📋 **Project Support:**
• Requirements analysis and planning
• Timeline estimation and project management
• Integration with existing systems
• Deployment and maintenance strategies

What specific area would you like to explore? I can provide detailed information about any of these services or help you plan your next project!`,
      
      pricing: `For pricing information regarding "${query}", I can provide transparent estimates based on project scope, complexity, and timeline. Let me know more about your project requirements for a detailed quote.`,
      
      technical: `I can help you with technical questions about "${query}". Here's what I can cover:

**Programming Languages & Technologies:**
• JavaScript/TypeScript, Python, React, Node.js
• Database design (PostgreSQL, MongoDB, Redis)
• API development (REST, GraphQL)
• Cloud platforms (AWS, Google Cloud, Vercel)

**Development Areas:**
• Frontend frameworks and state management
• Backend architecture and microservices
• Database optimization and performance
• DevOps, CI/CD, and deployment strategies

What specific technical challenge or question do you have? I can provide guidance, best practices, or help you plan your implementation approach.`,
      
      portfolio: `I'd love to show you relevant work examples for "${query}". Let me know what type of projects or technologies you're most interested in seeing.`,
      
      contact: `You can reach out about "${query}" through multiple channels. What's the best way for us to connect and discuss your needs?`,
      
      collaboration: `I'm interested in collaborating on "${query}". Let's discuss how we can work together effectively on this.`,
      
      learning: `I'd be happy to help you learn about "${query}". What specific aspect would you like me to explain or guide you through?`,
      
      problem_solving: `I can definitely help solve that issue with "${query}". Could you provide more details about what's not working or what you're trying to achieve?`,
      
      process: `Great question about the process for "${query}". I follow a structured approach with clear communication throughout. Would you like me to walk you through the specific steps?`,
      
      comparison: `That's a great question comparing different options for "${query}". I can help you understand the pros and cons of each approach. What specific aspects are you trying to compare?`,
      
      default: `I'd like to help you with "${query}". Could you provide a bit more context about what you're looking for? This will help me give you the most relevant and useful information.`
    }
    
    return responses[intent.type as keyof typeof responses] || responses.default
  }

  private calculateConfidence(similarContent: any[], similarConversations: any[], webResults: any[], intent: any): number {
    let confidence = 0.4 // Base confidence
    
    // Boost for ChromaDB similar content
    if (similarContent.length > 0) {
      confidence += similarContent[0].similarity * 0.35
    }
    
    // Boost for similar conversations
    if (similarConversations.length > 0) {
      confidence += similarConversations[0].similarity * 0.2
    }
    
    // Boost for web results
    if (webResults.length > 0) {
      confidence += Math.min(webResults.length * 0.1, 0.25)
    }
    
    // Intent confidence boost
    confidence += intent.confidence * 0.2
    
    return Math.min(confidence, 0.95)
  }

  private determineSources(similarContent: any[], similarConversations: any[], webResults: any[]): string[] {
    const sources: string[] = []
    
    if (similarContent.length > 0) sources.push('chromadb_knowledge')
    if (similarConversations.length > 0) sources.push('conversation_history')
    if (webResults.length > 0) sources.push('web_search')
    
    return sources.length > 0 ? sources : ['contextual_generation']
  }

  private calculateLearningRate(): number {
    const recentConversations = this.conversationHistory.filter(
      conv => Date.now() - conv.timestamp < 24 * 60 * 60 * 1000
    )
    return recentConversations.length / 24 // Conversations per hour
  }

  private estimateMemoryUsage(): string {
    const historySize = JSON.stringify(this.conversationHistory).length
    if (historySize > 1000000) return 'High'
    if (historySize > 100000) return 'Medium'
    return 'Low'
  }
}

export const enhancedAI = new EnhancedIntelligentAI()
