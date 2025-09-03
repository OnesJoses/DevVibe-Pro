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
        title: 'About Onesmus M. - Your Digital Success Partner',
        category: 'personal',
        content: `Hi! I'm Onesmus M., and I help businesses like yours turn great ideas into profitable digital realities. 

**Why Choose Me as Your Development Partner?**

🎯 **Results That Matter:**
• Built digital solutions that generated over $2M in client revenue
• 98% client satisfaction rate with 100% project completion
• Helped 15+ startups successfully launch and scale their platforms
• Average 40% increase in business efficiency for enterprise clients

💼 **Real Business Impact:**
• Transformed a local restaurant into a $500K/year online business
• Built an e-commerce platform that processes 10K+ orders monthly  
• Created HR systems that saved companies 25+ hours weekly
• Developed SaaS tools used by 5,000+ active users

🚀 **My Unique Approach:**
• I speak business first, technology second
• Focus on ROI and measurable results, not just pretty code
• Available for quick calls and updates throughout your project
• Guarantee: If you're not happy, I'll make it right or refund you

**Quick Facts:**
• 5+ years building successful digital products
• Worked with companies from startups to Fortune 500s
• Expert in turning complex ideas into simple, profitable solutions`
      },
      {
        id: 'service-offerings',
        title: 'What Can I Build For Your Business?',
        category: 'services',
        content: `I create digital solutions that make your business more profitable and efficient. Here's what I can build for you:

**🛒 E-Commerce & Online Stores**
*"Turn your products into profit 24/7"*
• Complete online stores that actually convert visitors to buyers
• Mobile-optimized shopping experiences (80% of sales happen on mobile!)
• Secure payment processing (Stripe, PayPal, local payment methods)
• Inventory management that saves you hours daily
• **Result:** Clients typically see 200-300% increase in online sales

**💼 Business Management Systems**
*"Automate the boring stuff, focus on growth"*
• Custom CRM systems that track every lead and customer
• Project management tools that keep teams organized
• HR systems with employee self-service (no more paperwork!)
• Financial dashboards that show real-time business health
• **Result:** Most clients save 15-20 hours per week on admin tasks

**🚀 SaaS & Subscription Platforms**
*"Build once, earn forever"*
• Subscription-based software that generates recurring revenue
• Multi-tenant platforms that serve multiple customers
• API integrations that connect your tools together
• Automated billing and customer management
• **Result:** Recurring revenue streams from day one

**🌟 Professional Websites That Work**
*"Your website should be your best salesperson"*
• Conversion-focused websites that turn visitors into customers
• SEO-optimized content that ranks on Google
• Lightning-fast loading (under 3 seconds)
• Mobile-first design that looks perfect everywhere
• **Result:** Average 150% increase in website inquiries

**💡 Custom Solutions**
*"If you can dream it, I can build it"*
• Unique software tailored to your exact business needs
• Integration with your existing tools and systems
• Scalable solutions that grow with your business
• **Starting from $2,500** for simple projects

**Why My Clients Choose Me:**
✅ I guarantee your project will be delivered on time and budget
✅ Unlimited revisions until you're 100% satisfied  
✅ 3 months free support after launch
✅ I explain everything in plain English, no tech jargon`
      },
      {
        id: 'technical-skills',
        title: 'How I Deliver Results That Matter',
        category: 'skills',
        content: `**The Technologies I Use to Build Your Success:**

🎯 **Frontend (What Your Customers See):**
• React & TypeScript for lightning-fast, interactive websites
• Mobile-first design that looks perfect on any device
• Advanced animations and user experiences that keep visitors engaged
• Progressive Web Apps that work like mobile apps
• **Why it matters:** Happy users = more conversions = more revenue

⚡ **Backend (The Engine That Powers Everything):**
• Node.js and Python for reliable, scalable systems
• Secure APIs that protect your data and customer information
• Real-time features like live chat, notifications, and updates
• Cloud infrastructure that handles traffic spikes automatically
• **Why it matters:** Reliable systems = happy customers = repeat business

🔒 **Security & Performance:**
• Bank-level security to protect your business and customers
• Websites that load in under 3 seconds (Google's requirement for ranking)
• Automated backups so you never lose important data
• 99.9% uptime guarantee
• **Why it matters:** Fast, secure websites rank higher and convert better

📊 **Business Intelligence:**
• Real-time dashboards showing your key business metrics
• Automated reports that save you hours of manual work
• Customer analytics to understand your audience better
• Sales tracking and forecasting tools
• **Why it matters:** Data-driven decisions = better business outcomes

**My Process (What You Can Expect):**

**Week 1:** Discovery & Planning
• I learn about your business goals and challenges
• We define exactly what success looks like
• You get a detailed project roadmap and timeline

**Week 2-4:** Design & Development  
• Regular updates and demos so you see progress daily
• Your feedback is incorporated immediately
• No surprises - you're involved every step of the way

**Week 5:** Testing & Launch
• Thorough testing across all devices and browsers
• Smooth deployment with zero downtime
• Training so your team knows how to use everything

**After Launch:**
• 3 months of free support and updates
• Performance monitoring and optimization
• Growth recommendations based on real usage data`
      },
      {
        id: 'success-stories',
        title: 'Success Stories & Client Results',
        category: 'testimonials',
        content: `**Real Results for Real Businesses:**

🍕 **Restaurant Success Story - "From Local to Online Empire"**
*Client: Family-owned pizza restaurant*
• **Challenge:** Limited to walk-in customers, losing business to competitors
• **Solution:** Built custom online ordering system + delivery app
• **Results:** 
  - 300% increase in monthly revenue
  - 500+ new customers in first 3 months  
  - Now processes 200+ orders daily
• *"Onesmus transformed our small restaurant into a thriving online business. We're booked solid every night now!" - Maria R., Owner*

💼 **HR Management Revolution - "From Paperwork Chaos to Digital Efficiency"** 
*Client: 150-employee manufacturing company*
• **Challenge:** 20+ hours weekly spent on manual HR tasks
• **Solution:** Custom HR management system with employee self-service
• **Results:**
  - Reduced HR workload by 85%
  - $50,000 annual savings in administrative costs
  - Employee satisfaction up 40%
• *"This system paid for itself in 3 months. Best investment we've made!" - David K., HR Director*

🛒 **E-commerce Breakthrough - "From Zero to $100K Monthly"**
*Client: Handmade jewelry startup*
• **Challenge:** Beautiful products but no online presence
• **Solution:** Complete e-commerce platform with social media integration
• **Results:**
  - Went from $0 to $100K monthly sales in 8 months
  - 15,000+ active customers
  - Featured in major fashion magazines
• *"Onesmus didn't just build us a website - he built us a business empire!" - Sarah M., Founder*

💻 **SaaS Success - "Turning an Idea into $50K Monthly Recurring Revenue"**
*Client: Fitness trainer with an app idea*
• **Challenge:** Great concept but no technical skills to build it
• **Solution:** Full SaaS platform with subscription billing
• **Results:**
  - 2,000+ paying subscribers at $25/month
  - $50,000 monthly recurring revenue
  - Expanded to 5 different fitness niches
• *"From idea to profitable business in 6 months. Incredible!" - Mike T., CEO*

**📊 Common Results My Clients See:**
✅ 200-400% increase in online revenue
✅ 15-25 hours weekly saved on manual tasks  
✅ 3-6 month ROI on development investment
✅ 98% client satisfaction with ongoing partnerships

**🏆 Client Testimonials:**
*"Onesmus over-delivered on everything. Our website now converts 3x better than our old one."* - Jennifer L., Marketing Director

*"Finally, a developer who understands business, not just code."* - Robert K., CEO

*"The system he built for us handles everything automatically. It's like having 5 extra employees."* - Lisa P., Operations Manager`
      },
      {
        id: 'pricing-process',
        title: 'Investment & Getting Started - Your Path to Digital Success',
        category: 'pricing',
        content: `**Investment Levels (What You Can Expect to Invest):**

🚀 **Startup Package - $2,500 - $7,500**
*Perfect for: New businesses, MVPs, simple websites*
• Professional business website or simple web app
• Mobile-optimized design
• Basic SEO setup
• 3 months support included
• **Timeline:** 2-3 weeks
• **Best for:** Getting your business online quickly and professionally

💼 **Business Growth Package - $7,500 - $20,000**  
*Perfect for: Established businesses ready to scale*
• Custom business applications (CRM, inventory, etc.)
• E-commerce platforms with advanced features
• Multi-user systems with role management
• Integration with existing tools
• **Timeline:** 4-8 weeks
• **Best for:** Automating operations and increasing efficiency

🏢 **Enterprise Solution - $20,000+**
*Perfect for: Large businesses, complex SaaS platforms*
• Full-scale software platforms
• Advanced integrations and APIs
• High-traffic, scalable infrastructure  
• Ongoing development partnership
• **Timeline:** 8-16 weeks
• **Best for:** Revolutionary digital transformation

**Flexible Payment Options:**
✅ **50% upfront, 50% on completion** (most popular)
✅ **3-month payment plan** for larger projects
✅ **Monthly retainer** for ongoing development ($3,000-$8,000/month)

**How We Get Started (Your Journey to Success):**

**Step 1: Free Discovery Call (30 minutes)**
• We discuss your business goals and challenges
• I'll show you exactly what's possible
• You'll get a clear project roadmap
• **Schedule:** Usually within 24 hours

**Step 2: Detailed Proposal (2-3 days)**
• Custom proposal tailored to your needs
• Exact pricing with no hidden fees
• Project timeline and milestones
• **Guarantee:** Fixed price, no surprises

**Step 3: Project Kickoff (Week 1)**
• Detailed planning and requirement gathering
• UI/UX design concepts
• Development environment setup
• **You're involved:** Daily updates and feedback

**Step 4: Development & Launch (Weeks 2-8)**
• Regular demos and progress updates
• Your feedback incorporated immediately
• Testing across all devices and browsers
• Smooth launch with zero downtime

**Step 5: Ongoing Success (Months 1-3)**
• Free support and bug fixes
• Performance monitoring and optimization
• Training for your team
• Growth recommendations

**Frequently Asked Questions:**

**Q: How long will my project take?**
A: Simple websites: 2-3 weeks. Business apps: 4-8 weeks. Enterprise solutions: 8-16 weeks. I'll give you an exact timeline during our discovery call.

**Q: What if I need changes during development?**
A: Minor changes are included. Major scope changes are discussed and priced fairly. I want you to be 100% happy with the result.

**Q: Do you provide ongoing support?**
A: Yes! 3 months of free support is included. After that, optional monthly maintenance starts at $500/month.

**Q: Can you work with my existing team?**
A: Absolutely! I integrate seamlessly with your existing team and systems.

**Ready to Transform Your Business?**
*Let's turn your vision into reality. Your success is my success.*

**Next Step:** Schedule your free 30-minute discovery call
**Contact:** Available 7 days a week for quick responses
**Guarantee:** If you're not completely satisfied, I'll make it right or provide a full refund`
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
    
    // Enhanced pattern matching for better detection
    const isPersonal = /\b(about you|your experience|your services|your background|who are you|tell me about|your portfolio|your work|your skills|your expertise|what services|services do you|do you offer|what do you offer|your offerings|pricing|cost|price|investment|payment|how much|get started|process|timeline)\b/i.test(query)
    const isTechnical = /\b(javascript|react|node|python|django|typescript|database|api|security|development|programming|code|framework|library|how to|tutorial)\b/i.test(query)
    const needsCurrentInfo = /\b(latest|new|recent|current|2024|2025|trending|updated|modern|best practices|what's new)\b/i.test(query)
    const isSpecific = /\b(how to|tutorial|example|guide|implementation|setup|install|configure|deploy|error|problem|issue)\b/i.test(query)
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
