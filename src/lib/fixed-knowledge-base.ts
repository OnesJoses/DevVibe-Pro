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
 * Fixed Enhanced Local Knowledge Base with web search integration
 */
export class FixedEnhancedKnowledgeBase {
  private entries: KnowledgeEntry[] = []
  private embedding: LocalTextEmbedding
  private isInitialized = false

  constructor() {
    this.embedding = new LocalTextEmbedding()
  }

  /**
   * Initialize the knowledge base with enhanced entries
   */
  async initialize() {
    if (this.isInitialized) return

    // Enhanced knowledge base with more comprehensive content
    const baseKnowledge = [
      {
        id: 'about-onesmus',
        title: 'About Onesmus M. - Professional Background',
        category: 'personal',
        content: `I'm Onesmus M., a results-driven full-stack developer and digital strategist with 5+ years of experience building scalable web applications. I specialize in transforming business ideas into profitable digital solutions that generate real ROI.

My expertise includes:
- Full-stack development using React, TypeScript, Node.js, and Django
- UI/UX design with conversion optimization focus
- Digital transformation and legacy system modernization
- Performance optimization and enterprise-grade security
- Database design with PostgreSQL, MongoDB, and Redis
- Cloud infrastructure on AWS, Google Cloud, and Vercel
- DevOps practices including CI/CD, containerization, and monitoring

Professional achievements:
- Delivered 50+ projects with 98% client satisfaction rate
- Consistently meet deadlines and stay within budget
- Expertise in both startup MVP development and enterprise solutions`
      },
      {
        id: 'technical-skills',
        title: 'Technical Skills and Expertise',
        category: 'skills',
        content: `My comprehensive technical skill set spans the entire web development stack:

Frontend Development:
- React.js with TypeScript for scalable component architecture
- Advanced state management with Redux, Zustand, and React Context
- Next.js for SSR/SSG applications with optimal SEO
- Modern CSS with Tailwind CSS, Styled Components, and CSS-in-JS
- Component libraries like Material-UI, Ant Design, and Chakra UI
- Progressive Web Apps (PWA) development
- Mobile-responsive design with CSS Grid and Flexbox

Backend Development:
- Node.js with Express.js for RESTful APIs
- Django and Django REST Framework for Python backends
- GraphQL APIs with Apollo Server and Prisma
- Microservices architecture and API design
- Real-time applications with WebSockets and Socket.io
- Serverless functions with Vercel, Netlify, and AWS Lambda

Database & Storage:
- PostgreSQL for complex relational data
- MongoDB for flexible document storage
- Redis for caching and session management
- Prisma ORM for type-safe database access
- Database optimization and query performance tuning

Cloud & DevOps:
- AWS services (EC2, S3, RDS, Lambda, CloudFront)
- Google Cloud Platform (Cloud Run, Firestore, Cloud Functions)
- Docker containerization and Kubernetes orchestration
- CI/CD pipelines with GitHub Actions and GitLab CI
- Infrastructure as Code with Terraform
- Monitoring with DataDog, New Relic, and custom dashboards`
      },
      {
        id: 'project-types',
        title: 'Project Types and Solutions',
        category: 'services',
        content: `I deliver a wide range of digital solutions tailored to business needs:

E-commerce Solutions:
- Custom online stores with payment integration (Stripe, PayPal, M-Pesa)
- Inventory management systems with real-time tracking
- Multi-vendor marketplaces with vendor dashboards
- Shopping cart optimization for maximum conversions
- Mobile-first responsive design for all devices

Business Applications:
- CRM systems for customer relationship management
- Project management tools with team collaboration features
- HR management systems with employee self-service portals
- Financial dashboards with real-time analytics
- Document management systems with version control

SaaS Platforms:
- Multi-tenant architecture with role-based access control
- Subscription billing integration with automated invoicing
- API development for third-party integrations
- White-label solutions for rapid deployment
- Scalable infrastructure that grows with your business

Portfolio & Corporate Websites:
- Professional websites that convert visitors to customers
- SEO-optimized content management systems
- Blog platforms with advanced content organization
- Landing pages with A/B testing capabilities
- Integration with marketing tools and analytics`
      },
      {
        id: 'development-process',
        title: 'Development Process and Methodology',
        category: 'process',
        content: `My proven development methodology ensures project success:

Discovery & Planning:
- Comprehensive requirements gathering and analysis
- Technical feasibility assessment and risk evaluation
- User experience research and wireframe development
- Technology stack selection based on project needs
- Detailed project timeline with clear milestones

Design & Prototyping:
- UI/UX design with user-centered approach
- Interactive prototypes for stakeholder feedback
- Design system creation for consistent branding
- Accessibility compliance (WCAG 2.1 AA standards)
- Mobile-first responsive design principles

Development & Testing:
- Agile development with regular sprint reviews
- Test-driven development (TDD) for code reliability
- Automated testing suites (unit, integration, e2e)
- Code reviews and quality assurance processes
- Performance optimization and security hardening

Deployment & Maintenance:
- Seamless deployment with zero-downtime strategies
- Production monitoring and error tracking
- Regular security updates and performance tuning
- Documentation and knowledge transfer
- Ongoing support and feature enhancements

Quality Assurance:
- Cross-browser compatibility testing
- Performance testing and optimization
- Security vulnerability assessments
- Load testing for high-traffic scenarios
- User acceptance testing with stakeholders`
      },
      {
        id: 'consulting-services',
        title: 'Consulting and Strategy Services',
        category: 'consulting',
        content: `Beyond development, I offer strategic consulting services:

Digital Transformation:
- Legacy system modernization and migration strategies
- Technology stack evaluation and recommendations
- Business process automation and optimization
- Digital workflow design and implementation
- Change management and team training

Technical Leadership:
- Architecture design for scalable applications
- Code review and quality improvement processes
- Team mentoring and skill development programs
- Technology roadmap planning and execution
- Performance optimization and troubleshooting

Business Strategy:
- ROI analysis for technology investments
- Competitive analysis and market positioning
- Product roadmap development and prioritization
- Monetization strategy for digital products
- Growth hacking and conversion optimization

Risk Management:
- Security audits and vulnerability assessments
- Compliance planning (GDPR, CCPA, SOX)
- Disaster recovery and business continuity planning
- Performance monitoring and alerting systems
- Cost optimization and resource management`
      }
    ]

    // Convert to KnowledgeEntry format and compute embeddings
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
    console.log(`✅ Fixed Knowledge base initialized with ${this.entries.length} entries`)
  }

  /**
   * Search local knowledge base
   */
  async search(query: string, options: {
    maxResults?: number
    threshold?: number
    category?: string
  } = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const { maxResults = 5, threshold = 0.3, category } = options
    const queryEmbedding = this.embedding.createEmbedding(query)
    const queryKeywords = extractKeywords(query)

    let results: SearchResult[] = []

    for (const entry of this.entries) {
      // Filter by category if specified
      if (category && entry.category !== category) continue

      // Calculate similarity scores
      const semanticSimilarity = entry.embedding ? 
        cosineSimilarity(queryEmbedding, entry.embedding) : 0
      const keywordMatch = this.calculateKeywordSimilarity(queryKeywords, entry.keywords)
      const textSimilarity = 1 - (levenshteinDistance(query.toLowerCase(), entry.content.toLowerCase()) / Math.max(query.length, entry.content.length))

      // Weighted combination of similarities
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

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults)
  }

  /**
   * Enhanced intelligent search that automatically decides the best search strategy
   */
  async intelligentSearch(
    query: string, 
    options: {
      maxResults?: number
      threshold?: number
      includeWebSearch?: boolean
      forceLocal?: boolean
      forceWebSearch?: boolean
    } = {}
  ): Promise<{
    localResults: SearchResult[]
    webResults: WebSearchResult[]
    searchStrategy: 'local-only' | 'web-only' | 'hybrid' | 'error'
    response: string
    metadata: {
      queryAnalysis: any
      searchTime: number
      webProvider: string | null
      totalResults: number
    }
  }> {
    const startTime = Date.now()
    console.log(`🧠 Starting intelligent search for: "${query}"`)

    // Intelligent query analysis
    const isPersonalQuery = /\b(onesmus|about you|your experience|your services|your background|your skills|who are you|tell me about yourself)\b/i.test(query)
    const isTechQuery = /\b(react|javascript|typescript|node|python|django|security|database|api|programming|development|web|code|tutorial|how to|best practices|guide)\b/i.test(query)
    const isCurrentQuery = /\b(latest|new|2024|2025|current|recent|today|now|update)\b/i.test(query)

    let localResults: SearchResult[] = []
    let webResults: WebSearchResult[] = []
    let webProvider: string | null = null
    let searchStrategy: 'local-only' | 'web-only' | 'hybrid' | 'error' = 'hybrid'

    console.log(`📊 Query Analysis:
      Personal: ${isPersonalQuery}
      Technical: ${isTechQuery} 
      Current: ${isCurrentQuery}`)

    try {
      // Strategy 1: Personal questions - Local knowledge only
      if (isPersonalQuery) {
        console.log(`👤 Personal query detected - using local knowledge only`)
        localResults = await this.search(query, { 
          maxResults: options.maxResults || 5, 
          threshold: options.threshold || 0.2
        })
        searchStrategy = 'local-only'
      }
      
      // Strategy 2: Current/Recent topics - Web search priority
      else if (isCurrentQuery) {
        console.log(`� Current topic detected - prioritizing web search`)
        const webSearchResult = await realWebSearch.search(query, options.maxResults || 5)
        
        if (webSearchResult.success && webSearchResult.results.length > 0) {
          webResults = webSearchResult.results
          webProvider = webSearchResult.provider
          searchStrategy = 'web-only'
          console.log(`🌐 Web search successful: ${webResults.length} results`)
        } else {
          // Fallback to local if web fails
          localResults = await this.search(query, { maxResults: options.maxResults || 5 })
          searchStrategy = 'local-only'
          console.log(`❌ Web search failed, using local fallback`)
        }
      }
      
      // Strategy 3: Technical questions - Hybrid (Enhanced + Web)
      else if (isTechQuery) {
        console.log(`🔧 Technical query detected - using hybrid search`)
        
        // Get local results first
        localResults = await this.search(query, { 
          maxResults: Math.ceil((options.maxResults || 5) * 0.6)
        })
        
        // Get web results
        const webSearchResult = await realWebSearch.search(query, Math.ceil((options.maxResults || 5) * 0.4))
        
        if (webSearchResult.success && webSearchResult.results.length > 0) {
          webResults = webSearchResult.results
          webProvider = webSearchResult.provider
          searchStrategy = 'hybrid'
          console.log(`🔄 Hybrid search: ${localResults.length} local + ${webResults.length} web`)
        } else {
          searchStrategy = 'local-only'
          console.log(`🔄 Hybrid search: web failed, ${localResults.length} local only`)
        }
      }
      
      // Strategy 4: General questions - Try local first, then web
      else {
        console.log(`❓ General query - trying local first, then web`)
        
        localResults = await this.search(query, { 
          maxResults: options.maxResults || 5, 
          threshold: 0.3 
        })
        
        // If local results are insufficient, try web search
        if (localResults.length < 2) {
          console.log(`📡 Local results insufficient (${localResults.length}), trying web search`)
          const webSearchResult = await realWebSearch.search(query, options.maxResults || 5)
          
          if (webSearchResult.success && webSearchResult.results.length > 0) {
            webResults = webSearchResult.results
            webProvider = webSearchResult.provider
            searchStrategy = localResults.length > 0 ? 'hybrid' : 'web-only'
            console.log(`🌐 Web search added: ${webResults.length} results`)
          }
        } else {
          searchStrategy = 'local-only'
          console.log(`📚 Local results sufficient: ${localResults.length} results`)
        }
      }

      // Generate intelligent response
      const response = this.generateIntelligentResponse(
        query, 
        localResults, 
        webResults, 
        searchStrategy
      )

      const searchTime = Date.now() - startTime
      console.log(`✅ Intelligent search completed in ${searchTime}ms: ${searchStrategy}`)

      return {
        localResults,
        webResults,
        searchStrategy,
        response,
        metadata: {
          queryAnalysis: { isPersonalQuery, isTechQuery, isCurrentQuery },
          searchTime,
          webProvider,
          totalResults: localResults.length + webResults.length
        }
      }

    } catch (error) {
      console.error('❌ Intelligent search error:', error)
      
      // Ultimate fallback to local search
      const fallbackResults = await this.search(query, { maxResults: 5, threshold: 0.4 })
      const fallbackResponse = fallbackResults.length > 0 
        ? `Here's what I found in my knowledge base:\n\n${fallbackResults.map(r => r.entry.content).join('\n\n')}`
        : 'I apologize, but I encountered an error searching for that information. Please try rephrasing your question.'

      return {
        localResults: fallbackResults,
        webResults: [],
        searchStrategy: 'error',
        response: fallbackResponse,
        metadata: {
          queryAnalysis: { error: true },
          searchTime: Date.now() - startTime,
          webProvider: null,
          totalResults: fallbackResults.length
        }
      }
    }
  }

  /**
   * Generate intelligent response based on search results and strategy
   */
  private generateIntelligentResponse(
    query: string,
    localResults: SearchResult[],
    webResults: WebSearchResult[],
    strategy: string
  ): string {
    let response = ""

    if (strategy === 'local-only') {
      if (localResults.length > 0) {
        response = "Based on my knowledge:\n\n"
        response += localResults.map(result => result.entry.content).join('\n\n')
      } else {
        response = "I don't have specific information about that in my knowledge base. Could you ask about my services, experience, or technical topics I can help with?"
      }
    }
    
    else if (strategy === 'web-only') {
      if (webResults.length > 0) {
        response = "Here's the latest information I found:\n\n"
        response += webResults.map(result => 
          `**${result.title}**\n${result.snippet}\n*Source: ${result.displayUrl}*`
        ).join('\n\n')
      } else {
        response = "I couldn't find current information about that topic. Please try rephrasing your question."
      }
    }
    
    else if (strategy === 'hybrid') {
      response = ""
      
      if (localResults.length > 0) {
        response += "From my knowledge base:\n\n"
        response += localResults.map(result => result.entry.content).slice(0, 2).join('\n\n')
      }
      
      if (webResults.length > 0) {
        if (response) response += "\n\n---\n\n"
        response += "Latest information from the web:\n\n"
        response += webResults.map(result => 
          `**${result.title}**\n${result.snippet}\n*Source: ${result.displayUrl}*`
        ).join('\n\n')
      }
    }
    
    else {
      response = "I apologize, but I encountered an issue searching for that information. Please try rephrasing your question or ask about something more specific."
    }

    return response
  }

  /**
   * Generate response based on search results (legacy method)
   */
  private generateResponse(
    query: string,
    localResults: SearchResult[],
    webResults: WebSearchResult[],
    strategy: string
  ): string {
    return this.generateIntelligentResponse(query, localResults, webResults, strategy)
  }

  /**
   * Calculate keyword similarity between query and entry keywords
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
   * Get all entries (for debugging)
   */
  getEntries(): KnowledgeEntry[] {
    return this.entries
  }

  /**
   * Add new knowledge entry
   */
  async addKnowledge(content: string, title: string, category: string): Promise<void> {
    const entry: KnowledgeEntry = {
      id: `entry-${Date.now()}`,
      title,
      content,
      category,
      keywords: extractKeywords(content),
      embedding: this.embedding.createEmbedding(content),
      metadata: {
        lastUpdated: new Date().toISOString(),
        confidence: 0.8,
        sourceType: 'learned',
        usage_count: 0
      }
    }
    
    this.entries.push(entry)
    console.log(`📝 Added new knowledge entry: ${title}`)
  }

  /**
   * Get knowledge base statistics
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
   * Test web search functionality
   */
  async testWebSearch(): Promise<{
    success: boolean
    provider: string
    results: number
    error?: string
  }> {
    try {
      const result = await realWebSearch.search('test', 1)
      return {
        success: result.success,
        provider: result.provider,
        results: result.results.length
      }
    } catch (error) {
      return {
        success: false,
        provider: 'Real Web Search',
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
      { name: 'Serper Web Search', available: !!import.meta.env.VITE_SERPER_API_KEY },
      { name: 'Enhanced Content Database', available: true },
      { name: 'Local Knowledge Base', available: this.isInitialized }
    ]
  }
}

// Export a singleton instance
export const fixedKnowledgeBase = new FixedEnhancedKnowledgeBase()
