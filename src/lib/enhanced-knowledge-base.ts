// Enhanced Knowledge Base - Advanced AI system with web search integration
import { smartKnowledgeBase } from './smart-knowledge-base'
import { realWebSearch } from './real-web-search-hybrid'

interface EnhancedSearchResult {
  answer: string
  sources: Array<{
    title: string
    type: 'knowledge_base' | 'web_search'
    relevance: number
    content: string
  }>
  confidence: number
  searchTime: number
}

class EnhancedKnowledgeBase {
  private searchHistory: Array<{ query: string; timestamp: number }> = []

  async enhancedSearch(query: string): Promise<EnhancedSearchResult> {
    const startTime = Date.now()
    this.searchHistory.push({ query, timestamp: startTime })

    // First, search our knowledge base
    const knowledgeResults = await smartKnowledgeBase.smartSearch(query)
    
    // Then, search the web for additional context
    const webResults = await realWebSearch.search(query, 3)
    
    const sources = [
      ...knowledgeResults.results.map(result => ({
        title: result.title || 'Knowledge Base Entry',
        type: 'knowledge_base' as const,
        relevance: result.relevance,
        content: result.content
      })),
      ...webResults.results.slice(0, 3).map((result: any) => ({
        title: result.title,
        type: 'web_search' as const,
        relevance: result.relevance || 0.8,
        content: result.snippet
      }))
    ]

    // Generate enhanced answer
    let answer = ''
    if (knowledgeResults.results.length > 0) {
      answer = knowledgeResults.results[0].content
    } else if (webResults.results.length > 0) {
      answer = `Based on web search: ${webResults.results[0].snippet}`
    } else {
      answer = "I don't have specific information about this topic. Could you provide more context or try a different question?"
    }

    const confidence = sources.length > 0 ? 
      Math.round(sources.reduce((acc, s) => acc + s.relevance, 0) / sources.length * 100) : 
      25

    return {
      answer,
      sources,
      confidence,
      searchTime: Date.now() - startTime
    }
  }

  getStats() {
    return {
      totalSearches: this.searchHistory.length,
      recentSearches: this.searchHistory.slice(-10),
      knowledgeBaseStats: smartKnowledgeBase.getStats()
    }
  }

  async saveUserFeedback(query: string, answer: string, rating: number) {
    // Save feedback for learning
    const feedback = {
      query,
      answer,
      rating,
      timestamp: Date.now()
    }
    
    // Store feedback in localStorage for now
    try {
      const existing = localStorage.getItem('devvibe-user-feedback') || '[]'
      const feedbackList = JSON.parse(existing)
      feedbackList.push(feedback)
      localStorage.setItem('devvibe-user-feedback', JSON.stringify(feedbackList))
    } catch (error) {
      console.warn('Failed to save feedback:', error)
    }

    return { success: true, learned: rating >= 4 }
  }
}

export const enhancedKnowledgeBase = new EnhancedKnowledgeBase()
