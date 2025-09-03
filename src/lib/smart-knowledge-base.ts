import { 
  KnowledgeEntry, 
  SearchResult, 
  LocalTextEmbedding, 
  cosineSimilarity, 
  levenshteinDistance, 
  extractKeywords 
} from './ai-utils'
import { realWebSearch, WebSearchResult } from './real-web-search-hybrid'
import { localFileKnowledge } from './local-file-knowledge'

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

    // First, try to load from local files
    try {
      console.log('🔄 Loading knowledge from local files...')
      await localFileKnowledge.initialize()
      
      // Check if we have local knowledge
      const localStats = localFileKnowledge.getStats()
      if (localStats.totalEntries > 0) {
        console.log(`✅ Loaded ${localStats.totalEntries} entries from local files`)
        this.isInitialized = true
        return
      }
    } catch (error) {
      console.log('⚠️ Local file knowledge not available, using built-in knowledge')
    }

    // Fallback to built-in knowledge if no local files
    const baseKnowledge = [
      {
        id: 'quick-services',
        title: 'What Services Do I Offer?',
        category: 'services',
        content: `**I specialize in building digital solutions that drive business results:**

🛒 **E-Commerce Stores** - Complete online stores with payment processing
💼 **Business Apps** - CRM, HR, and management systems 
🚀 **SaaS Platforms** - Subscription-based software solutions
🌟 **Professional Websites** - Fast, conversion-focused sites
💡 **Custom Development** - Tailored solutions for unique needs

**Starting from $2,500** | **2-8 week delivery** | **3 months free support**

*Need details about a specific service? Just ask!*`
      },
      {
        id: 'project-process',
        title: 'How Does the Development Process Work?',
        category: 'process',
        content: `**Here's exactly what happens when you work with me:**

**Week 1: Discovery & Planning**
• Free 30-minute discovery call to understand your needs
• Detailed proposal with fixed pricing (no surprises)
• Project roadmap and timeline

**Week 2-4: Design & Development**
• Daily progress updates and demos
• Your feedback incorporated immediately
• Regular check-ins to ensure we're on track

**Week 5: Testing & Launch**
• Thorough testing across all devices
• Smooth deployment with zero downtime
• Team training on how to use everything

**After Launch:**
• 3 months of free support and bug fixes
• Performance monitoring and optimization
• Growth recommendations based on usage data

**Payment Options:** 50% upfront, 50% on completion (most popular) or 3-month payment plan for larger projects.`
      },
      {
        id: 'pricing-guide',
        title: 'How Much Does a Project Cost?',
        category: 'pricing',
        content: `**Investment Levels Based on Project Complexity:**

🚀 **Simple Projects: $2,500 - $7,500**
• Business websites, basic web apps
• 2-3 weeks delivery
• Perfect for startups and small businesses

💼 **Business Solutions: $7,500 - $20,000**
• E-commerce stores, CRM systems, business apps
• 4-8 weeks delivery
• Best for established businesses ready to scale

🏢 **Enterprise Solutions: $20,000+**
• Complex SaaS platforms, large-scale systems
• 8-16 weeks delivery
• For businesses requiring advanced features

**What's Included:**
✅ Unlimited revisions until you're 100% satisfied
✅ 3 months free support after launch
✅ Mobile optimization and SEO setup
✅ Secure hosting and deployment

**Ready to get started?** Schedule a free discovery call to get exact pricing for your project.`
      },
      {
        id: 'project-examples',
        title: 'Can You Show Me Examples of Your Work?',
        category: 'portfolio',
        content: `**Recent Project Results:**

🍕 **Restaurant Online Ordering System**
• **Result:** 300% increase in monthly revenue
• **Timeline:** 4 weeks
• **Features:** Online ordering, delivery tracking, payment processing

🏢 **HR Management System**
• **Result:** 85% reduction in administrative workload
• **Timeline:** 6 weeks  
• **Features:** Employee self-service, automated workflows, reporting

🛒 **E-commerce Platform**
• **Result:** $0 to $100K monthly sales in 8 months
• **Timeline:** 5 weeks
• **Features:** Product catalog, inventory management, social integration

💻 **SaaS Fitness Platform**
• **Result:** $50K monthly recurring revenue
• **Timeline:** 8 weeks
• **Features:** Subscription billing, multi-tenant architecture, mobile app

*Want to see a demo or discuss a similar project? Let's schedule a call!*`
      },
      {
        id: 'technical-questions',
        title: 'Technical Questions & Answers',
        category: 'technical',
        content: `**Common Technical Questions:**

**Q: What technologies do you use?**
A: React/TypeScript for frontend, Node.js/Python for backend, PostgreSQL/MongoDB for databases, AWS/Vercel for hosting. I choose the best tech stack for your specific needs.

**Q: Will my website be mobile-friendly?**
A: Absolutely! All projects are mobile-first and work perfectly on all devices. 80% of users browse on mobile, so this is essential.

**Q: How fast will my website load?**
A: Under 3 seconds guaranteed. I optimize for speed because it directly impacts SEO rankings and conversion rates.

**Q: Can you integrate with my existing systems?**
A: Yes! I specialize in API integrations with tools like Stripe, PayPal, CRMs, email platforms, and most business software.

**Q: What about security?**
A: Bank-level security with SSL certificates, encrypted data, secure authentication, and regular security updates.

**Q: Can I make updates myself later?**
A: Yes! I provide admin panels for content updates, plus training so your team can manage day-to-day changes.`
      },
      {
        id: 'getting-started',
        title: 'How Do I Get Started?',
        category: 'process',
        content: `**Ready to transform your business? Here's how we begin:**

**Step 1: Free Discovery Call (30 minutes)**
• We discuss your business goals and challenges
• I'll show you exactly what's possible for your project
• You'll get a clear understanding of timeline and investment
• **Schedule:** Usually available within 24 hours

**Step 2: Custom Proposal (2-3 days)**
• Detailed proposal tailored to your specific needs
• Fixed pricing with no hidden fees
• Complete project timeline and milestones
• **Guarantee:** No surprises, transparent pricing

**Step 3: Project Kickoff**
• 50% deposit to secure your project slot
• Detailed planning and requirement gathering
• UI/UX design concepts and mockups
• Development begins immediately

**Contact Options:**
📧 Email for detailed questions
📞 Phone/video call for immediate discussion
💬 Live chat for quick questions

**Next Step:** Schedule your free discovery call to discuss your project and get exact pricing.`
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

    // First try local file knowledge
    try {
      const localResults = await localFileKnowledge.search(query, options)
      if (localResults.length > 0) {
        console.log(`📁 Found ${localResults.length} results in local files`)
        return localResults
      }
    } catch (error) {
      console.log('⚠️ Local search failed, using built-in knowledge')
    }

    // Fallback to built-in knowledge
    const { maxResults = 5, threshold = 0.3, category } = options
    const queryEmbedding = this.embedding.createEmbedding(query)
    const queryKeywords = extractKeywords(query)

    let results: SearchResult[] = []

    for (const entry of this.entries) {
      if (category && entry.category !== category) continue

      const semanticSimilarity = entry.embedding ? 
        cosineSimilarity(queryEmbedding, entry.embedding) : 0
      const keywordMatch = this.calculateKeywordSimilarity(queryKeywords, entry.keywords)
      
      // Improved text similarity for shorter queries
      const queryLen = query.length
      const contentLen = entry.content.length
      const maxLen = Math.max(queryLen, Math.min(contentLen, 1000)) // Cap at 1000 chars for comparison
      const textSimilarity = queryLen < 50 ? 
        (1 - (levenshteinDistance(query.toLowerCase(), entry.content.toLowerCase().substring(0, 200)) / maxLen)) * 0.5 :
        1 - (levenshteinDistance(query.toLowerCase(), entry.content.toLowerCase()) / maxLen)

      // Boost relevance if query contains service-related terms and this is a service entry
      let categoryBoost = 0
      if (query.toLowerCase().includes('service') && entry.id.includes('service')) {
        categoryBoost = 0.3
      }

      const relevance = (semanticSimilarity * 0.5) + (keywordMatch * 0.4) + (textSimilarity * 0.1) + categoryBoost

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
        console.log('🏠 Using personal knowledge search')
        const localResults = await this.search(query, { maxResults, threshold: 0.1 }) // Lower threshold
        console.log(`📊 Local search found ${localResults.length} results:`, localResults.map(r => ({ title: r.entry.title, relevance: r.relevance })))
        
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
    
    // Focus on actionable questions that add value beyond the website
    const isPersonal = /\b(services|pricing|cost|price|investment|payment|how much|get started|process|timeline|examples|portfolio|work|projects)\b/i.test(query)
    const isTechnical = /\b(technical|technology|javascript|react|node|python|django|typescript|database|api|security|development|programming|code|framework|library|how to|tutorial|integration|mobile|seo|performance)\b/i.test(query)
    const needsCurrentInfo = /\b(latest|new|recent|current|2024|2025|trending|updated|modern|best practices|what's new)\b/i.test(query)
    const isSpecific = /\b(how to|tutorial|example|guide|implementation|setup|install|configure|deploy|error|problem|issue|demo)\b/i.test(query)
    const isComparison = /\b(vs|versus|compare|difference|better|best|which|should i)\b/i.test(query)
    
    console.log(`🔍 Query analysis for "${query}":`, {
      isPersonal,
      isTechnical, 
      needsCurrentInfo,
      isSpecific,
      isComparison
    })
    
    return {
      isPersonal,
      isTechnical,
      needsCurrentInfo,
      isSpecific,
      isComparison
    }
  }

  /**
   * Calculate keyword similarity
   */
  private calculateKeywordSimilarity(queryKeywords: string[], entryKeywords: string[]): number {
    if (queryKeywords.length === 0 || entryKeywords.length === 0) return 0

    let matches = 0
    let totalWeight = 0

    for (const qk of queryKeywords) {
      const qkLower = qk.toLowerCase()
      let bestMatch = 0
      
      for (const ek of entryKeywords) {
        const ekLower = ek.toLowerCase()
        
        // Exact match gets highest score
        if (qkLower === ekLower) {
          bestMatch = Math.max(bestMatch, 1.0)
        }
        // Partial matches
        else if (ekLower.includes(qkLower) || qkLower.includes(ekLower)) {
          bestMatch = Math.max(bestMatch, 0.8)
        }
        // Service-related keyword boost
        else if ((qkLower.includes('service') || qkLower.includes('offer')) && 
                 (ekLower.includes('service') || ekLower.includes('solution') || ekLower.includes('development'))) {
          bestMatch = Math.max(bestMatch, 0.7)
        }
      }
      
      matches += bestMatch
      totalWeight += 1
    }

    return totalWeight > 0 ? matches / totalWeight : 0
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
