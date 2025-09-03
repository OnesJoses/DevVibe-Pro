import { 
  KnowledgeEntry, 
  SearchResult, 
  LocalTextEmbedding, 
  cosineSimilarity, 
  levenshteinDistance, 
  extractKeywords 
} from './ai-utils'
import { realWebSearch, WebSearchResult } from './real-web-search-hybrid'

/**
 * Smart Knowledge Base - Automatically chooses the best information source
 */
export class SmartKnowledgeBase {
  private entries: KnowledgeEntry[] = []
  private embedding: LocalTextEmbedding
  private isInitialized = false

  constructor() {
    this.embedding = new LocalTextEmbedding()
  }

  /**
   * Initialize with professional knowledge
   */
  async initialize() {
    if (this.isInitialized) return

    const baseKnowledge = [
      {
        id: 'about-onesmus',
        title: 'About Onesmus M. - Professional Background',
        category: 'personal',
        content: `I'm Onesmus M., a results-driven full-stack developer and digital strategist with 5+ years of experience building scalable web applications. I specialize in transforming business ideas into profitable digital solutions.

**My Expertise:**
• Full-stack development (React, TypeScript, Node.js, Django)
• UI/UX design with conversion optimization focus
• Digital transformation and legacy system modernization
• Performance optimization and enterprise-grade security
• Database design (PostgreSQL, MongoDB, Redis)
• Cloud infrastructure (AWS, Google Cloud, Vercel)
• DevOps practices (CI/CD, containerization, monitoring)

**Professional Achievements:**
• Delivered 50+ projects with 98% client satisfaction
• Consistently meet deadlines and stay within budget
• Expertise in both startup MVP development and enterprise solutions`
      },
      {
        id: 'technical-skills',
        title: 'Technical Skills and Expertise',
        category: 'skills',
        content: `**Frontend Development:**
• React.js with TypeScript for scalable components
• Advanced state management (Redux, Zustand, Context)
• Next.js for SSR/SSG with optimal SEO
• Modern CSS (Tailwind, Styled Components, CSS-in-JS)
• Component libraries (Material-UI, Ant Design, Chakra UI)
• Progressive Web Apps (PWA) development

**Backend Development:**
• Node.js with Express.js for RESTful APIs
• Django and Django REST Framework
• GraphQL APIs with Apollo Server and Prisma
• Microservices architecture and API design
• Real-time applications with WebSockets
• Serverless functions (Vercel, Netlify, AWS Lambda)

**Database & Storage:**
• PostgreSQL for complex relational data
• MongoDB for flexible document storage
• Redis for caching and session management
• Prisma ORM for type-safe database access
• Database optimization and query performance tuning

**Cloud & DevOps:**
• AWS services (EC2, S3, RDS, Lambda, CloudFront)
• Google Cloud Platform (Cloud Run, Firestore)
• Docker containerization and Kubernetes
• CI/CD pipelines with GitHub Actions
• Infrastructure as Code with Terraform
• Monitoring with DataDog and New Relic`
      },
      {
        id: 'services',
        title: 'Development Services & Solutions',
        category: 'services',
        content: `**E-commerce Solutions:**
• Custom online stores with payment integration (Stripe, PayPal, M-Pesa)
• Inventory management with real-time tracking
• Multi-vendor marketplaces with vendor dashboards
• Shopping cart optimization for maximum conversions
• Mobile-first responsive design

**Business Applications:**
• CRM systems for customer relationship management
• Project management tools with team collaboration
• HR management with employee self-service portals
• Financial dashboards with real-time analytics
• Document management with version control

**SaaS Platforms:**
• Multi-tenant architecture with role-based access
• Subscription billing with automated invoicing
• API development for third-party integrations
• White-label solutions for rapid deployment
• Scalable infrastructure that grows with your business

**Portfolio & Corporate Websites:**
• Professional websites that convert visitors to customers
• SEO-optimized content management systems
• Blog platforms with advanced content organization
• Landing pages with A/B testing capabilities
• Integration with marketing tools and analytics`
      }
    ]

    for (const item of baseKnowledge) {
      const entry: KnowledgeEntry = {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        keywords: extractKeywords(item.content),
        embedding: this.embedding.createEmbedding(item.content),
        metadata: {
          lastUpdated: new Date().toISOString(),
          confidence: 1.0,
          sourceType: 'manual',
          usage_count: 0
        }
      }
      this.entries.push(entry)
    }

    this.isInitialized = true
    console.log(`✅ Smart Knowledge Base initialized with ${this.entries.length} entries`)
  }

  /**
   * Local knowledge search
   */
  async search(query: string, options: {
    maxResults?: number
    threshold?: number
    category?: string
  } = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) await this.initialize()

    const { maxResults = 5, threshold = 0.3, category } = options
    const queryEmbedding = this.embedding.createEmbedding(query)
    const queryKeywords = extractKeywords(query)

    let results: SearchResult[] = []

    for (const entry of this.entries) {
      if (category && entry.category !== category) continue

      const semanticSimilarity = entry.embedding ? 
        cosineSimilarity(queryEmbedding, entry.embedding) : 0
      const keywordMatch = this.calculateKeywordSimilarity(queryKeywords, entry.keywords)
      const textSimilarity = 1 - (levenshteinDistance(query.toLowerCase(), entry.content.toLowerCase()) / Math.max(query.length, entry.content.length))

      const relevance = (semanticSimilarity * 0.5) + (keywordMatch * 0.3) + (textSimilarity * 0.2)

      if (relevance >= threshold) {
        results.push({
          entry: entry,
          relevance,
          matchType: semanticSimilarity > keywordMatch ? 'semantic' : 'keyword',
          matchedTerms: queryKeywords.filter(qk => 
            entry.keywords.some(ek => 
              ek.toLowerCase().includes(qk.toLowerCase()) || 
              qk.toLowerCase().includes(ek.toLowerCase())
            )
          )
        })
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults)
  }

  /**
   * Smart search that automatically chooses the best approach
   */
  async smartSearch(query: string, maxResults = 5): Promise<{
    results: Array<{
      title: string
      content: string
      source: string
      relevance: number
      url?: string
    }>
    strategy: string
    sources: string[]
    searchTime: number
  }> {
    const startTime = Date.now()
    console.log(`🤖 Smart search for: "${query}"`)

    // Analyze query to determine best approach
    const analysis = this.analyzeQuery(query)
    console.log(`📊 Query analysis:`, analysis)

    let finalResults: Array<{
      title: string
      content: string
      source: string
      relevance: number
      url?: string
    }> = []
    
    let strategy = ''
    let sources: string[] = []

    try {
      // Personal questions → Local knowledge only
      if (analysis.isPersonal) {
        const localResults = await this.search(query, { maxResults, threshold: 0.2 })
        finalResults = localResults.map(r => ({
          title: r.entry.title,
          content: r.entry.content,
          source: 'Professional Experience',
          relevance: r.relevance
        }))
        strategy = 'Personal expertise'
        sources = ['Professional Knowledge Base']
      }
      
      // Technical questions → Enhanced approach
      else if (analysis.isTechnical || analysis.needsCurrentInfo) {
        // Get local knowledge first
        const localResults = await this.search(query, { maxResults: 2, threshold: 0.2 })
        
        // Add local results if found
        if (localResults.length > 0) {
          finalResults.push(...localResults.map(r => ({
            title: r.entry.title,
            content: r.entry.content,
            source: 'Expertise',
            relevance: r.relevance + 0.1 // Boost local knowledge
          })))
          sources.push('Professional Knowledge')
        }

        // Get current web information
        const webSearch = await realWebSearch.search(query, maxResults - finalResults.length)
        if (webSearch.success && webSearch.results.length > 0) {
          finalResults.push(...webSearch.results.map(r => ({
            title: r.title,
            content: r.snippet,
            source: 'Current Information',
            relevance: r.relevance,
            url: r.url
          })))
          sources.push('Live Web Search')
        }

        strategy = localResults.length > 0 && webSearch.results.length > 0 ? 
          'Hybrid knowledge + current data' : 
          localResults.length > 0 ? 'Professional expertise' : 'Current information'
      }
      
      // General questions → Try local first, then web
      else {
        const localResults = await this.search(query, { maxResults, threshold: 0.3 })
        
        if (localResults.length > 0) {
          finalResults = localResults.map(r => ({
            title: r.entry.title,
            content: r.entry.content,
            source: 'Knowledge Base',
            relevance: r.relevance
          }))
          strategy = 'Local knowledge'
          sources = ['Knowledge Base']
        } else {
          // Fallback to web search
          const webSearch = await realWebSearch.search(query, maxResults)
          if (webSearch.success) {
            finalResults = webSearch.results.map(r => ({
              title: r.title,
              content: r.snippet,
              source: 'Web Search',
              relevance: r.relevance,
              url: r.url
            }))
            strategy = 'Web search'
            sources = ['Live Search']
          }
        }
      }

      // Sort by relevance and limit results
      finalResults = finalResults
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults)

      const searchTime = Date.now() - startTime
      console.log(`✅ Smart search completed: ${strategy} (${finalResults.length} results in ${searchTime}ms)`)

      return {
        results: finalResults,
        strategy,
        sources,
        searchTime
      }

    } catch (error) {
      console.error('❌ Smart search error:', error)
      
      // Graceful fallback
      const fallbackResults = await this.search(query, { maxResults: 3, threshold: 0.3 })
      
      return {
        results: fallbackResults.map(r => ({
          title: r.entry.title,
          content: r.entry.content,
          source: 'Knowledge Base',
          relevance: r.relevance
        })),
        strategy: 'Knowledge base fallback',
        sources: ['Local Knowledge'],
        searchTime: Date.now() - startTime
      }
    }
  }

  /**
   * Analyze query to determine search approach
   */
  private analyzeQuery(query: string) {
    const q = query.toLowerCase()
    
    return {
      isPersonal: /\b(about you|your experience|your services|your background|who are you|tell me about|your portfolio|your work|your skills|your expertise)\b/i.test(query),
      isTechnical: /\b(javascript|react|node|python|django|typescript|database|api|security|development|programming|code|framework|library|how to|tutorial)\b/i.test(query),
      needsCurrentInfo: /\b(latest|new|recent|current|2024|2025|trending|updated|modern|best practices|what's new)\b/i.test(query),
      isSpecific: /\b(how to|tutorial|example|guide|implementation|setup|install|configure|deploy|error|problem|issue)\b/i.test(query),
      isComparison: /\b(vs|versus|compare|difference|better|best|which|should i)\b/i.test(query)
    }
  }

  /**
   * Calculate keyword similarity
   */
  private calculateKeywordSimilarity(queryKeywords: string[], entryKeywords: string[]): number {
    if (queryKeywords.length === 0 || entryKeywords.length === 0) return 0

    const matches = queryKeywords.filter(qk => 
      entryKeywords.some(ek => 
        ek.toLowerCase().includes(qk.toLowerCase()) || 
        qk.toLowerCase().includes(ek.toLowerCase())
      )
    )

    return matches.length / Math.max(queryKeywords.length, entryKeywords.length)
  }

  /**
   * Get knowledge base stats
   */
  getStats() {
    return {
      totalEntries: this.entries.length,
      categories: [...new Set(this.entries.map(e => e.category))],
      isInitialized: this.isInitialized,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Test search functionality
   */
  async testSearch(): Promise<{
    success: boolean
    provider: string
    results: number
    error?: string
  }> {
    try {
      const result = await this.smartSearch('test query', 1)
      return {
        success: result.results.length > 0,
        provider: result.strategy,
        results: result.results.length
      }
    } catch (error) {
      return {
        success: false,
        provider: 'Smart Search',
        results: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get available search providers
   */
  async getSearchProviders(): Promise<{ name: string; available: boolean }[]> {
    return [
      { name: 'Smart Routing System', available: true },
      { name: 'Professional Knowledge', available: this.isInitialized },
      { name: 'Live Information', available: !!import.meta.env.VITE_SERPER_API_KEY }
    ]
  }
}

// Export singleton instance
export const smartKnowledgeBase = new SmartKnowledgeBase()
