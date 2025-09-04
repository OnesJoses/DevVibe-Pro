interface WebSearchResult {
  title: string
  snippet: string
  url: string
  relevance: number
  learned_concepts?: string[]
}

export class WebLearningEngine {
  private searchCache: Map<string, WebSearchResult[]> = new Map()
  private conceptDatabase: Map<string, {
    definition: string
    sources: string[]
    confidence: number
    lastUpdated: number
    examples: string[]
  }> = new Map()

  constructor() {
    this.loadConceptDatabase()
  }

  // Search DuckDuckGo and learn from results
  async searchAndLearn(query: string): Promise<{
    results: WebSearchResult[]
    newConcepts: string[]
    enhancedAnswer: string
  }> {
    try {
      // Check cache first
      if (this.searchCache.has(query)) {
        return {
          results: this.searchCache.get(query)!,
          newConcepts: [],
          enhancedAnswer: this.generateEnhancedAnswer(query, this.searchCache.get(query)!)
        }
      }

      // Use DuckDuckGo Instant Answer API (free)
      const searchResults = await this.searchDuckDuckGo(query)
      
      // Learn new concepts from search results
      const newConcepts = await this.extractConceptsFromResults(searchResults, query)
      
      // Generate enhanced answer
      const enhancedAnswer = this.generateEnhancedAnswer(query, searchResults)
      
      // Cache results
      this.searchCache.set(query, searchResults)
      
      return {
        results: searchResults,
        newConcepts,
        enhancedAnswer
      }
    } catch (error) {
      console.error('Web search failed:', error)
      return {
        results: [],
        newConcepts: [],
        enhancedAnswer: `I couldn't search the web for "${query}" right now, but I can help based on what I already know.`
      }
    }
  }

  private async searchDuckDuckGo(query: string): Promise<WebSearchResult[]> {
    try {
      // DuckDuckGo Instant Answer API (free, no API key needed)
      const instantResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`)
      const instantData = await instantResponse.json()
      
      const results: WebSearchResult[] = []
      
      // Add instant answer if available
      if (instantData.Abstract) {
        results.push({
          title: instantData.Heading || query,
          snippet: instantData.Abstract,
          url: instantData.AbstractURL || 'https://duckduckgo.com',
          relevance: 0.9
        })
      }
      
      // Add related topics
      if (instantData.RelatedTopics) {
        instantData.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
          if (topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              snippet: topic.Text,
              url: topic.FirstURL || 'https://duckduckgo.com',
              relevance: 0.7 - (index * 0.1)
            })
          }
        })
      }
      
      // If no results, try a different approach with CORS proxy
      if (results.length === 0) {
        return await this.fallbackSearch(query)
      }
      
      return results
    } catch (error) {
      console.error('DuckDuckGo search failed:', error)
      return await this.fallbackSearch(query)
    }
  }

  private async fallbackSearch(query: string): Promise<WebSearchResult[]> {
    // Use a free search API or web scraping service
    try {
      // Example using a free proxy service (replace with actual service)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (data.contents) {
        // Parse HTML results (simplified)
        const results = this.parseSearchHTML(data.contents, query)
        return results
      }
    } catch (error) {
      console.error('Fallback search failed:', error)
    }
    
    // Ultimate fallback - generate based on query
    return [{
      title: `No specific results for: ${query}`,
      snippet: `My web search for "${query}" didn't return specific results. I will try to answer based on my existing knowledge and learn from our conversation.`,
      url: 'https://duckduckgo.com',
      relevance: 0.2 // Lower relevance
    }]
  }

  private parseSearchHTML(html: string, query: string): WebSearchResult[] {
    // Simplified HTML parsing - in a real implementation, use a proper HTML parser
    const results: WebSearchResult[] = []
    
    try {
      // Look for common patterns in search result HTML
      const titleMatches = html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []
      const snippetMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || []
      
      for (let i = 0; i < Math.min(titleMatches.length, 3); i++) {
        const title = titleMatches[i]?.replace(/<[^>]*>/g, '').trim() || `Result ${i + 1}`
        const snippet = snippetMatches[i]?.replace(/<[^>]*>/g, '').trim() || 'No description available'
        
        if (title.toLowerCase().includes(query.toLowerCase()) || snippet.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            title,
            snippet: snippet.substring(0, 200) + (snippet.length > 200 ? '...' : ''),
            url: 'https://duckduckgo.com',
            relevance: 0.6 - (i * 0.1)
          })
        }
      }
    } catch (error) {
      console.error('HTML parsing failed:', error)
    }
    
    return results.length > 0 ? results : [{
      title: `Search results for: ${query}`,
      snippet: `I searched for information about "${query}" but didn't find specific details. I'll help you based on my existing knowledge instead.`,
      url: 'https://duckduckgo.com',
      relevance: 0.2
    }]
  }

  private async extractConceptsFromResults(results: WebSearchResult[], query: string): Promise<string[]> {
    const newConcepts: string[] = []
    
    for (const result of results) {
      const text = `${result.title} ${result.snippet}`
      const concepts = this.extractKeyTerms(text)
      
      for (const concept of concepts) {
        if (!this.conceptDatabase.has(concept.toLowerCase()) && concept.length > 3) {
          // This is a new concept
          this.conceptDatabase.set(concept.toLowerCase(), {
            definition: this.extractDefinition(concept, text),
            sources: [result.url],
            confidence: result.relevance,
            lastUpdated: Date.now(),
            examples: [result.snippet.substring(0, 100)]
          })
          
          newConcepts.push(concept)
        } else if (this.conceptDatabase.has(concept.toLowerCase())) {
          // Update existing concept
          const existing = this.conceptDatabase.get(concept.toLowerCase())!
          existing.confidence = Math.max(existing.confidence, result.relevance)
          existing.lastUpdated = Date.now()
          if (!existing.sources.includes(result.url)) {
            existing.sources.push(result.url)
          }
          if (!existing.examples.includes(result.snippet.substring(0, 100))) {
            existing.examples.push(result.snippet.substring(0, 100))
            existing.examples = existing.examples.slice(-3) // Keep last 3
          }
        }
      }
    }
    
    this.saveConceptDatabase()
    return newConcepts
  }

  private extractKeyTerms(text: string): string[] {
    // Extract important terms (nouns, technical terms, etc.)
    const words = text.match(/\b[A-Z][a-z]+\b|\b[a-z]{4,}\b/g) || []
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'them', 'were', 'said', 'each', 'which', 'their', 'would', 'there', 'could'])
    
    return words
      .filter(word => !stopWords.has(word.toLowerCase()))
      .filter(word => word.length > 3)
      .slice(0, 10) // Top 10 terms
  }

  private extractDefinition(concept: string, context: string): string {
    const patterns = [
      new RegExp(`${concept}\\s+is\\s+([^.!?]+)`, 'i'),
      new RegExp(`${concept}\\s*[:-]\\s*([^.!?]+)`, 'i'),
      new RegExp(`([^.!?]+)\\s+${concept}`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = context.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return `Term found in context: ${context.substring(0, 100)}...`
  }

  private generateEnhancedAnswer(query: string, results: WebSearchResult[]): string {
    if (results.length === 0) {
      return `I couldn't find current web information about "${query}", but I can help based on my existing knowledge.`
    }
    
    const bestResult = results[0]
    
    // If the best result has low relevance, it means web search didn't find good results
    if (bestResult.relevance < 0.3) {
      return `I searched the web for "${query}" but didn't find specific current information. Let me help you with what I already know.`
    }
    
    const additionalContext = results.slice(1, 3)
      .filter(r => r.relevance > 0.4)
      .map(r => r.snippet)
      .join('\n\n')
    
    let response = bestResult.snippet
    
    if (additionalContext) {
      response += `\n\n${additionalContext}`
    }
    
    return response
  }

  // Get concept insights
  getConceptInsights() {
    const recentConcepts = Array.from(this.conceptDatabase.entries())
      .filter(([_, concept]) => Date.now() - concept.lastUpdated < 7 * 24 * 60 * 60 * 1000)
      .map(([term, concept]) => ({ term, ...concept }))
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .slice(0, 10)
    
    const topConcepts = Array.from(this.conceptDatabase.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .slice(0, 10)
      .map(([term, concept]) => ({ term, confidence: concept.confidence }))
    
    return {
      totalConcepts: this.conceptDatabase.size,
      recentConcepts,
      topConcepts,
      cacheSize: this.searchCache.size
    }
  }

  private saveConceptDatabase() {
    try {
      const data = Array.from(this.conceptDatabase.entries())
      localStorage.setItem('ai-concept-database', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save concept database:', error)
    }
  }

  private loadConceptDatabase() {
    try {
      const saved = localStorage.getItem('ai-concept-database')
      if (saved) {
        const data = JSON.parse(saved)
        this.conceptDatabase = new Map(data)
      }
    } catch (error) {
      console.warn('Failed to load concept database:', error)
    }
  }
}

export const webLearning = new WebLearningEngine()
