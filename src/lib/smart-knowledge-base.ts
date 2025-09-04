import { enhancedWebSearch } from './enhanced-web-search'
import { PostgresAIStorage } from './postgres-ai-storage'

export type SmartResult = {
  title: string
  content: string
  url?: string
  relevance: number
}

export type SmartSearchResponse = {
  strategy: 'local_knowledge' | 'web_search' | 'hybrid'
  results: SmartResult[]
  sources: string[]
  searchTime: number
}

class SmartKnowledgeBase {
  private initialized = false
  private local: { title: string; content: string; keywords: string[] }[] = []
  private postgres = new PostgresAIStorage()

  async initialize() {
    if (this.initialized) return true
    // Load local knowledge from localStorage if present
    try {
      const raw = localStorage.getItem('devvibe-ai-knowledge')
      if (raw) {
        const parsed = JSON.parse(raw)
        this.local = Array.isArray(parsed) ? parsed : (parsed.entries || [])
      }
    } catch {}
    // Try connecting to Postgres API (non-fatal)
    try {
      await this.postgres.initialize()
    } catch {}
    this.initialized = true
    return true
  }

  getStats() {
    const categories = ['Services', 'Pricing', 'Process', 'Tech']
    return {
      totalEntries: this.local.length,
      categories,
    }
  }

  async getSearchProviders() {
    return ['Enhanced Content Search']
  }

  async testSearch() {
    const res = await enhancedWebSearch.testSearch()
    return {
      success: res.success,
      provider: res.provider,
      results: res.results,
    }
  }

  public searchLocal(query: string, limit = 5): SmartResult[] {
    const q = query.toLowerCase()
    const scored = this.local.map((e) => {
      const text = `${e.title}\n${e.content}`.toLowerCase()
      const score = (q.length > 2 && text.includes(q)) ? 0.9 : 0.0
      const keywordBoost = (e.keywords || []).some(k => q.includes(k.toLowerCase())) ? 0.1 : 0
      return { entry: e, relevance: Math.min(1, score + keywordBoost) }
    }).filter(s => s.relevance > 0)
      .sort((a,b) => b.relevance - a.relevance)
      .slice(0, limit)
    return scored.map(s => ({ title: s.entry.title, content: s.entry.content, relevance: s.relevance }))
  }

  async smartSearch(query: string, strength = 5): Promise<SmartSearchResponse> {
    await this.initialize()

    // simple strategy: try local first
    const localResults = this.searchLocal(query, Math.max(3, Math.min(8, strength)))
    if (localResults.length > 0) {
      return {
        strategy: 'local_knowledge',
        results: localResults,
        sources: ['local'],
        searchTime: 50,
      }
    }

    // next, try Postgres API if available
    try {
      const pg = await this.postgres.searchKnowledge(query)
      if (pg && pg.length > 0) {
        const mapped: SmartResult[] = pg.map(e => ({
          title: e.title,
          content: e.content,
          relevance: 0.85, // basic relevance since API doesn't score
        }))
        return {
          strategy: 'hybrid',
          results: mapped,
          sources: ['postgresql'],
          searchTime: 120,
        }
      }
    } catch {}

    // fallback to enhanced web search
    const web = await enhancedWebSearch.search(query, Math.max(3, Math.min(8, strength)))
    const mapped: SmartResult[] = web.results.map(r => ({
      title: r.title,
      content: r.snippet,
      url: r.url,
      relevance: r.relevance,
    }))
    return {
      strategy: 'web_search',
      results: mapped,
      sources: [web.provider],
      searchTime: web.totalTime,
    }
  }
}

export const smartKnowledgeBase = new SmartKnowledgeBase()

export async function smartSearch(query: string) {
  // 1) Try Postgres API for synthesized answer
  try {
    const postgres = new PostgresAIStorage()
    await postgres.initialize()
    
    // Get the synthesized answer
    const answer = await postgres.getAnswer(query)
    if (answer && answer.trim().length > 10) {
      // Also get result count for display
      const results = await postgres.searchKnowledge(query)
      return { 
        source: 'postgresql', 
        answer: answer.trim(), 
        results: results.slice(0, 1), // Only return best result  
        strategy: `Knowledge Base`
      }
    }
  } catch {}
  
  // 2) Fallback to local knowledge base
  const smartKb = new SmartKnowledgeBase()
  await smartKb.initialize()
  const localResults = smartKb.searchLocal(query, 3)
  
  if (localResults.length > 0) {
    // Create focused answer from local results
    const answer = localResults[0].content.length > 300 
      ? localResults[0].content.substring(0, 300) + '...'
      : localResults[0].content
    
    return {
      source: 'local',
      answer: answer,
      results: localResults.slice(0, 1), // Only return best result
      strategy: `Local Knowledge`
    }
  }
  
  // 3) Last resort: web search (but make it brief)
  try {
    const web = await enhancedWebSearch.search(query, 2)
    const answer = web.results.length > 0 
      ? web.results[0].snippet
      : 'I don\'t have specific information about that. Could you be more specific?'
    
    return { 
      source: 'web', 
      answer: answer, 
      results: web.results.slice(0, 1), // Only return best result
      strategy: `Web Search`
    }
  } catch {}
  
  return { 
    source: 'none', 
    answer: 'I don\'t have information about that. Could you ask something else?', 
    results: [],
    strategy: 'Not Found'
  }
}
