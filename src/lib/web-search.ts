// Web search capabilities for the Enhanced AI system

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  displayUrl: string
  datePublished?: string
  relevanceScore: number
}

export interface SearchSource {
  name: string
  enabled: boolean
  priority: number
}

/**
 * Web Search Engine with multiple providers and fallbacks
 */
export class EnhancedWebSearch {
  private searchSources: SearchSource[] = [
    { name: 'duckduckgo', enabled: true, priority: 1 },
    { name: 'searxng', enabled: true, priority: 2 },
    { name: 'bing', enabled: false, priority: 3 } // Requires API key
  ]

  /**
   * Search the web using DuckDuckGo Instant Answer API (free, no key required)
   */
  async searchDuckDuckGo(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    try {
      // Use DuckDuckGo's instant answer API
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      )

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`)
      }

      const data = await response.json()
      const results: WebSearchResult[] = []

      // Process instant answer
      if (data.AbstractText && data.AbstractSource) {
        results.push({
          title: data.Heading || 'DuckDuckGo Instant Answer',
          url: data.AbstractURL || data.AbstractSource,
          snippet: data.AbstractText,
          displayUrl: data.AbstractSource,
          relevanceScore: 0.9
        })
      }

      // Process related topics
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, maxResults - results.length).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL,
              snippet: topic.Text,
              displayUrl: new URL(topic.FirstURL).hostname,
              relevanceScore: 0.7
            })
          }
        })
      }

      return results.slice(0, maxResults)

    } catch (error) {
      console.error('DuckDuckGo search error:', error)
      return []
    }
  }

  /**
   * Search using SearXNG public instances (privacy-focused meta search)
   */
  async searchSearXNG(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    try {
      // Use a public SearXNG instance
      const searxInstances = [
        'https://searx.be',
        'https://searx.tiekoetter.com',
        'https://search.sapti.me'
      ]

      for (const instance of searxInstances) {
        try {
          const response = await fetch(
            `${instance}/search?q=${encodeURIComponent(query)}&format=json&categories=general`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'DevVibe-AI-Assistant/1.0'
              },
              signal: AbortSignal.timeout(10000) // 10 second timeout
            }
          )

          if (!response.ok) continue

          const data = await response.json()
          const results: WebSearchResult[] = []

          if (data.results) {
            data.results.slice(0, maxResults).forEach((result: any) => {
              results.push({
                title: result.title || 'Search Result',
                url: result.url,
                snippet: result.content || result.title || '',
                displayUrl: new URL(result.url).hostname,
                datePublished: result.publishedDate,
                relevanceScore: 0.8
              })
            })
          }

          return results

        } catch (instanceError) {
          console.warn(`SearXNG instance ${instance} failed:`, instanceError)
          continue
        }
      }

      return []

    } catch (error) {
      console.error('SearXNG search error:', error)
      return []
    }
  }

  /**
   * Search using Bing Web Search API (requires API key but more reliable)
   */
  async searchBing(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    const apiKey = process.env.VITE_BING_SEARCH_API_KEY
    
    if (!apiKey) {
      console.warn('Bing API key not configured')
      return []
    }

    try {
      const response = await fetch(
        `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}&responseFilter=webpages`,
        {
          method: 'GET',
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Accept': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Bing API error: ${response.status}`)
      }

      const data = await response.json()
      const results: WebSearchResult[] = []

      if (data.webPages?.value) {
        data.webPages.value.forEach((result: any) => {
          results.push({
            title: result.name,
            url: result.url,
            snippet: result.snippet || '',
            displayUrl: result.displayUrl,
            datePublished: result.dateLastCrawled,
            relevanceScore: 0.95
          })
        })
      }

      return results

    } catch (error) {
      console.error('Bing search error:', error)
      return []
    }
  }

  /**
   * Smart web search with multiple providers and fallbacks
   */
  async search(query: string, maxResults = 5): Promise<WebSearchResult[]> {
    const allResults: WebSearchResult[] = []

    // Try each enabled search source in priority order
    for (const source of this.searchSources.filter(s => s.enabled).sort((a, b) => a.priority - b.priority)) {
      try {
        let results: WebSearchResult[] = []

        switch (source.name) {
          case 'duckduckgo':
            results = await this.searchDuckDuckGo(query, maxResults)
            break
          case 'searxng':
            results = await this.searchSearXNG(query, maxResults)
            break
          case 'bing':
            results = await this.searchBing(query, maxResults)
            break
        }

        allResults.push(...results)

        // If we have enough results, break early
        if (allResults.length >= maxResults) {
          break
        }

      } catch (error) {
        console.warn(`Search source ${source.name} failed:`, error)
        continue
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = allResults
      .filter((result, index, array) => 
        array.findIndex(r => r.url === result.url) === index
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults)

    return uniqueResults
  }

  /**
   * Check if web search is available
   */
  isWebSearchAvailable(): boolean {
    return this.searchSources.some(source => source.enabled)
  }

  /**
   * Get available search sources
   */
  getAvailableSources(): SearchSource[] {
    return this.searchSources.filter(source => source.enabled)
  }

  /**
   * Enable/disable search sources
   */
  configureSource(sourceName: string, enabled: boolean) {
    const source = this.searchSources.find(s => s.name === sourceName)
    if (source) {
      source.enabled = enabled
    }
  }
}

/**
 * Utility functions for web search integration
 */

/**
 * Extract domain from URL for display
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: WebSearchResult[]): string {
  if (results.length === 0) {
    return "I couldn't find any relevant web results for your query. Let me check my local knowledge base instead."
  }

  let formatted = "Here's what I found on the web:\n\n"
  
  results.forEach((result, index) => {
    formatted += `**${index + 1}. ${result.title}**\n`
    formatted += `${result.snippet}\n`
    formatted += `🔗 [${result.displayUrl}](${result.url})\n\n`
  })

  formatted += "💡 *These results are from web search. For information about my services and expertise, ask me directly!*"
  
  return formatted
}

/**
 * Determine if a query should trigger web search
 */
export function shouldUseWebSearch(query: string): boolean {
  const webSearchTriggers = [
    'search', 'find', 'what is', 'how to', 'tutorial', 'guide', 'latest', 'news',
    'recent', 'current', 'today', 'yesterday', 'compare', 'vs', 'versus',
    'best practices', 'examples', 'documentation', 'official', 'github',
    'stack overflow', 'trends', 'market', 'industry', 'analysis'
  ]

  const localKnowledgeTriggers = [
    'your services', 'your experience', 'your skills', 'your pricing',
    'your process', 'how you work', 'your portfolio', 'contact you',
    'hire you', 'work with you', 'your expertise', 'about you'
  ]

  const queryLower = query.toLowerCase()

  // Always use local knowledge for personal/business queries
  if (localKnowledgeTriggers.some(trigger => queryLower.includes(trigger))) {
    return false
  }

  // Use web search for general information queries
  if (webSearchTriggers.some(trigger => queryLower.includes(trigger))) {
    return true
  }

  // Use web search for technology/framework questions not in local knowledge
  const techQueries = [
    'react', 'vue', 'angular', 'nodejs', 'python', 'django', 'flask',
    'javascript', 'typescript', 'css', 'html', 'api', 'database',
    'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'vercel', 'netlify'
  ]

  if (techQueries.some(tech => queryLower.includes(tech)) && 
      !queryLower.includes('how do you') && 
      !queryLower.includes('your experience')) {
    return true
  }

  return false
}
