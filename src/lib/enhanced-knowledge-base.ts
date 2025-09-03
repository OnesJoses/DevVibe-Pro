import { 
  KnowledgeEntry, 
  SearchResult, 
  LocalTextEmbedding, 
  cosineSimilarity, 
  levenshteinDistance, 
  extractKeywords 
} from './ai-utils'
import { enhancedWebSearch, WebSearchResult } from './enhanced-web-search'

/**
 * Enhanced Local Knowledge Base with REAL web search integration
 * Combines comprehensive local knowledge with actual internet search capabilities
 */
export class EnhancedLocalKnowledgeBase {
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
- Expertise in both startup MVP development and enterprise solutions
- Strong focus on business outcomes and measurable results

I combine technical excellence with strategic business thinking to create digital products that actually move the needle for my clients.`,
        keywords: ['about', 'onesmus', 'developer', 'experience', 'background', 'skills', 'expertise', 'full-stack', 'achievements']
      },
      {
        id: 'tech-stack-detailed',
        title: 'Complete Technology Stack & Architecture',
        category: 'technical',
        content: `This portfolio showcases a modern, production-ready technology stack:

Frontend Technologies:
- React 18 with TypeScript for type-safe, maintainable code
- Tailwind CSS + shadcn/ui for consistent design system
- Vite/esbuild for lightning-fast development and optimized builds
- React Router for seamless client-side navigation
- Zustand for lightweight, performant state management
- React Query for server state management and caching

Backend Infrastructure:
- Django 5 + Django REST Framework for robust API development
- PostgreSQL with optimized queries and proper indexing
- Redis for caching, session management, and real-time features
- JWT authentication with refresh token rotation
- Comprehensive API documentation with OpenAPI/Swagger
- Django ORM with custom managers and querysets

Development & Deployment:
- TypeScript for enhanced developer experience and bug prevention
- ESLint + Prettier for code quality and consistency
- Husky for pre-commit hooks and automated testing
- Vercel for frontend hosting with edge optimization
- Railway/AWS for backend deployment with auto-scaling
- GitHub Actions for CI/CD pipeline automation
- Docker for containerization and environment consistency

Architecture Patterns:
- Microservices architecture for scalability
- RESTful API design with proper HTTP semantics
- Database normalization and relationship optimization
- Caching strategies for performance improvement
- Security best practices including HTTPS, CORS, CSRF protection
- Error handling and logging for production monitoring`,
        keywords: ['technology', 'stack', 'react', 'typescript', 'django', 'postgresql', 'architecture', 'frontend', 'backend', 'deployment']
      },
      {
        id: 'services-comprehensive',
        title: 'Complete Service Offerings & Capabilities',
        category: 'services',
        content: `I provide end-to-end digital solutions designed to drive business growth:

🚀 Full-Stack Web Development
- Custom web applications from MVP to enterprise scale
- E-commerce platforms with payment gateway integration (Stripe, PayPal)
- SaaS applications with subscription management
- Progressive Web Apps (PWAs) for mobile-like experiences
- Dashboard and analytics applications with real-time data
- API development and third-party service integrations
- Database design and optimization for performance at scale

🎨 UI/UX Design & Development
- Conversion-focused design systems that drive results
- User research and persona development
- Wireframing and prototyping with Figma
- Responsive design for all devices and screen sizes
- Accessibility compliance (WCAG 2.1 AA standards)
- Design-to-code implementation with pixel-perfect accuracy
- A/B testing and conversion rate optimization

🔧 Digital Transformation Services
- Legacy system modernization and migration
- Cloud infrastructure setup and optimization
- Performance audits and speed optimization
- Security assessments and implementation
- SEO optimization and technical SEO audits
- Integration with existing business systems
- Staff training and knowledge transfer

📊 Specialized Technologies:
- Frontend: React, Vue.js, Angular, TypeScript, JavaScript
- Backend: Django, Node.js, Express, FastAPI, PHP Laravel
- Databases: PostgreSQL, MongoDB, MySQL, Redis, Elasticsearch
- Cloud: AWS, Google Cloud, Azure, Vercel, Netlify
- DevOps: Docker, Kubernetes, CI/CD, GitHub Actions
- Tools: Git, Figma, Postman, VS Code, Linux, macOS, Windows

Industry Experience:
- E-commerce and retail solutions
- Healthcare and medical applications
- Financial services and fintech
- Education and e-learning platforms
- Real estate and property management
- Marketing and advertising technology`,
        keywords: ['services', 'web development', 'ui design', 'ux design', 'ecommerce', 'saas', 'api', 'database', 'cloud', 'security']
      },
      {
        id: 'development-process',
        title: 'Development Methodology & Project Process',
        category: 'process',
        content: `My proven development methodology ensures project success and client satisfaction:

📋 Phase 1: Discovery & Strategy (Week 1)
- Comprehensive requirements gathering and analysis
- Technical feasibility assessment and risk evaluation
- User story mapping and feature prioritization
- Technology stack selection based on project needs
- Architecture design and system planning
- Project timeline and milestone definition
- Budget estimation and resource allocation

🔨 Phase 2: Design & Prototyping (Weeks 2-3)
- User experience research and persona development
- Wireframing and user flow optimization
- Visual design and branding integration
- Interactive prototypes for user testing
- Database schema design and API planning
- Security architecture and compliance planning
- Client feedback and design iteration

💻 Phase 3: Development Sprints (Weeks 4-N)
- Agile development with 1-2 week sprints
- Test-driven development for code quality
- Regular client demos and feedback sessions
- Continuous integration and automated testing
- Code reviews and quality assurance
- Performance monitoring and optimization
- Security testing and vulnerability assessment

🚀 Phase 4: Launch & Optimization
- Production deployment with zero-downtime
- Performance monitoring and analytics setup
- User training and documentation delivery
- SEO optimization and search engine submission
- Post-launch support and bug fixes
- Performance analytics and user behavior analysis
- Ongoing maintenance and feature updates

Key Principles:
- Business outcomes drive all technical decisions
- Clean, maintainable, and well-documented code
- Mobile-first responsive design approach
- Security and performance built-in from day one
- Regular communication and transparency
- Scalable architecture for future growth`,
        keywords: ['development', 'process', 'methodology', 'agile', 'planning', 'design', 'testing', 'deployment', 'maintenance']
      },
      {
        id: 'authentication-security',
        title: 'Authentication & Security Implementation',
        category: 'technical',
        content: `Enterprise-grade security architecture with comprehensive protection:

🔐 Authentication System:
- JWT-based authentication with access and refresh tokens
- Secure user registration with email verification
- Password reset flow with time-limited secure tokens
- Multi-factor authentication (MFA) support
- OAuth integration (Google, GitHub, Microsoft)
- Session management with automatic logout
- Role-based access control (RBAC) for permissions

🛡️ Security Measures:
- HTTPS enforcement with SSL/TLS certificates
- CSRF protection with token validation
- CORS configuration for cross-origin requests
- SQL injection prevention with parameterized queries
- XSS protection with content security policy
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Secure password hashing with bcrypt/Argon2

🔑 Data Protection:
- Encryption at rest for sensitive data
- Secure API endpoint design
- Database connection security
- Environment variable protection
- Secrets management with secure vaults
- Regular security audits and penetration testing
- GDPR and privacy compliance
- Audit logging for security monitoring

API Security:
- Token-based authentication for all endpoints
- Request throttling and rate limiting
- API versioning for backward compatibility
- Input validation and error handling
- Secure file upload handling
- Database query optimization to prevent DoS

Example endpoints:
POST /api/accounts/register - User registration
POST /api/accounts/login - User authentication
POST /api/accounts/refresh - Token refresh
POST /api/accounts/forgot-password - Password reset
GET /api/accounts/profile - User profile (authenticated)
PUT /api/accounts/profile - Update profile (authenticated)`,
        keywords: ['authentication', 'security', 'jwt', 'oauth', 'csrf', 'ssl', 'encryption', 'api', 'tokens', 'protection']
      },
      {
        id: 'deployment-devops',
        title: 'Deployment Strategy & DevOps Practices',
        category: 'technical',
        content: `Production-ready deployment with modern DevOps practices:

🌐 Frontend Deployment (Vercel/Netlify):
- Automatic deployments triggered by Git commits
- Global CDN with edge caching for optimal performance
- Custom domain setup with SSL certificate automation
- Preview deployments for feature branch testing
- Environment-specific configurations
- Build optimization and asset compression
- Performance monitoring with Core Web Vitals

⚙️ Backend Deployment (AWS/Railway/DigitalOcean):
- Container-based deployment with Docker
- Auto-scaling based on traffic and resource usage
- Load balancing for high availability
- Database backups with point-in-time recovery
- Health checks and automated failover
- Log aggregation and monitoring
- Security patches and automated updates

🔄 CI/CD Pipeline:
- Automated testing on pull requests
- Code quality checks with ESLint, Prettier, SonarQube
- Security vulnerability scanning
- Performance regression testing
- Automated deployment to staging and production
- Rollback capabilities for quick recovery
- Notification systems for deployment status

🗄️ Database & Infrastructure:
- PostgreSQL with connection pooling and replication
- Redis for caching and session storage
- File storage with AWS S3 or Google Cloud Storage
- CDN integration for static asset delivery
- Monitoring with Datadog, New Relic, or Grafana
- Backup strategies with encryption and versioning
- Disaster recovery planning and testing

Monitoring & Analytics:
- Application performance monitoring (APM)
- Error tracking with Sentry or Rollbar
- User analytics with privacy-focused tools
- Infrastructure monitoring and alerting
- Cost optimization and resource management
- Security monitoring and incident response`,
        keywords: ['deployment', 'devops', 'docker', 'aws', 'cicd', 'monitoring', 'scaling', 'database', 'infrastructure', 'performance']
      },
      {
        id: 'pricing-business',
        title: 'Investment Levels & Working Together',
        category: 'business',
        content: `Transparent pricing and clear processes for successful partnerships:

💰 Investment Levels:
Small Projects ($2,000 - $5,000):
- Landing pages with conversion optimization
- Portfolio websites with CMS integration
- Small business websites (5-10 pages)
- Basic e-commerce stores (under 50 products)
- Simple web applications with basic features
- Timeline: 1-3 weeks

Medium Projects ($5,000 - $15,000):
- Complex e-commerce platforms with payment integration
- Custom web applications with user authentication
- Dashboard applications with data visualization
- Multi-vendor marketplaces
- Integration with third-party APIs and services
- Timeline: 4-8 weeks

Large Projects ($15,000 - $50,000+):
- Enterprise web applications with complex workflows
- SaaS platforms with subscription management
- Custom CRM/ERP systems
- Multi-platform applications (web + mobile)
- Legacy system modernization
- Timeline: 3-6 months

Ongoing Support ($500 - $2,000/month):
- Regular security updates and patches
- Performance monitoring and optimization
- Feature additions and enhancements
- Content updates and maintenance
- Technical support and troubleshooting
- Analytics reporting and insights

🤝 What's Always Included:
- Complete source code ownership
- Comprehensive documentation
- User training and handover
- 30-day post-launch support
- Performance and security optimization
- Mobile-responsive design guarantee
- SEO-friendly implementation
- Hosting setup assistance

📞 Getting Started Process:
1. Free 30-minute consultation call
2. Requirements analysis and proposal
3. Contract signing and project kickoff
4. Regular milestone demos and feedback
5. Final delivery and training
6. Ongoing support options

Payment Structure:
- 50% upfront to begin development
- 25% at milestone completion
- 25% upon final delivery and approval
- Flexible payment plans for larger projects`,
        keywords: ['pricing', 'cost', 'investment', 'budget', 'payment', 'contract', 'support', 'maintenance', 'consultation', 'timeline']
      },
      {
        id: 'performance-optimization',
        title: 'Performance Optimization & Best Practices',
        category: 'technical',
        content: `Building high-performance applications optimized for speed and user experience:

⚡ Frontend Performance:
- Code splitting and lazy loading for faster initial loads
- Image optimization with WebP/AVIF formats
- CSS and JavaScript minification and compression
- Browser caching strategies with service workers
- Critical CSS inlining for above-the-fold content
- Resource preloading and prefetching
- Bundle size optimization and tree shaking

🗄️ Backend Performance:
- Database query optimization and indexing
- API response caching with Redis
- Connection pooling for database efficiency
- Asynchronous processing for heavy operations
- CDN integration for static asset delivery
- Gzip compression for text-based responses
- Database connection optimization

📊 Monitoring & Metrics:
- Core Web Vitals tracking and optimization
- Real User Monitoring (RUM) implementation
- Performance budget enforcement
- Lighthouse audits and score improvement
- Time to First Byte (TTFB) optimization
- First Contentful Paint (FCP) improvement
- Cumulative Layout Shift (CLS) minimization

🔍 SEO Optimization:
- Semantic HTML structure for accessibility
- Meta tags and Open Graph optimization
- Structured data markup (JSON-LD)
- XML sitemap generation and submission
- Internal linking strategy
- Page speed optimization for search rankings
- Mobile-first indexing compliance

♿ Accessibility Standards:
- WCAG 2.1 AA compliance implementation
- Keyboard navigation support
- Screen reader compatibility testing
- Color contrast optimization
- Focus management and skip links
- Alt text for images and media
- Semantic markup for assistive technologies

Results You Can Expect:
- 90+ Google PageSpeed Insights scores
- Under 3-second load times globally
- 100% mobile responsive design
- Search engine optimized content
- Accessible to users with disabilities
- Cross-browser compatibility guaranteed`,
        keywords: ['performance', 'optimization', 'speed', 'seo', 'accessibility', 'monitoring', 'web vitals', 'lighthouse', 'mobile', 'search']
      },
      {
        id: 'contact-getting-started',
        title: 'Contact Information & Next Steps',
        category: 'contact',
        content: `Ready to transform your business with a digital solution that delivers measurable results?

📧 Contact Information:
Primary Email: onesjoses5@gmail.com
Response Time: Within 24 hours during business days
Timezone: East Africa Time (EAT) / UTC+3
Preferred Communication: Email for initial contact, video calls for detailed discussions

🚀 Free Consultation Includes:
- 30-minute strategy session to understand your goals
- Technical feasibility assessment for your project
- Ballpark timeline and investment estimate
- Technology recommendations based on your needs
- Competitive analysis and market positioning advice
- No-obligation detailed proposal

📋 Before Our Consultation, Please Prepare:
- Clear description of your business goals and objectives
- Target audience and user persona information
- Preferred timeline and key milestone dates
- Budget range or investment level for the project
- Examples of websites/applications you admire
- Existing brand guidelines or design preferences
- Technical requirements or integration needs

🎯 Perfect Projects For My Expertise:
- Startups needing MVP development and market validation
- Businesses requiring digital transformation initiatives
- Companies scaling existing applications for growth
- Organizations needing custom software solutions
- E-commerce businesses wanting to increase conversions
- SaaS companies building subscription platforms

🔧 Specialized Industries:
- Healthcare and medical technology
- Financial services and fintech
- E-commerce and retail
- Education and e-learning
- Real estate and property management
- Professional services and consulting

Why Choose Me:
- 5+ years of proven development experience
- 50+ successful projects delivered
- 98% client satisfaction rate
- Business-focused technical solutions
- Clear communication and project transparency
- Ongoing support and maintenance options

I specialize in projects where technical excellence meets business strategy. Let's build something amazing that drives real results for your business!`,
        keywords: ['contact', 'email', 'consultation', 'getting started', 'hire', 'project', 'business', 'collaboration', 'next steps']
      }
    ]

    // Convert to proper KnowledgeEntry format and generate embeddings
    for (const item of baseKnowledge) {
      const entry: KnowledgeEntry = {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        keywords: item.keywords,
        metadata: {
          lastUpdated: new Date().toISOString(),
          confidence: 1.0,
          sourceType: 'manual',
          usage_count: 0
        }
      }

      // Generate embedding for semantic search
      entry.embedding = this.embedding.createEmbedding(item.content + ' ' + item.title)
      this.entries.push(entry)
    }

    // Update the embedding model with our corpus
    const allDocuments = this.entries.map(entry => entry.content + ' ' + entry.title)
    this.embedding.updateCorpus(allDocuments)

    this.isInitialized = true
  }

  /**
   * Enhanced search with multiple matching strategies and web search integration
   */
  async search(query: string, options = { maxResults: 3, threshold: 0.3 }): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const results: SearchResult[] = []
    const queryLower = query.toLowerCase()
    const queryEmbedding = this.embedding.createEmbedding(query)

    for (const entry of this.entries) {
      let relevance = 0
      let matchType: SearchResult['matchType'] = 'keyword'
      const matchedTerms: string[] = []

      // 1. Semantic similarity using embeddings
      if (entry.embedding) {
        const semanticScore = cosineSimilarity(queryEmbedding, entry.embedding)
        if (semanticScore > 0.1) {
          relevance += semanticScore * 0.6
          matchType = 'semantic'
        }
      }

      // 2. Keyword matching with different weights
      const contentLower = entry.content.toLowerCase()
      const titleLower = entry.title.toLowerCase()
      
      // Direct keyword matches in title (high weight)
      entry.keywords.forEach(keyword => {
        if (queryLower.includes(keyword) || keyword.includes(queryLower)) {
          relevance += 0.3
          matchedTerms.push(keyword)
        }
      })

      // Title matches (high weight)
      if (titleLower.includes(queryLower)) {
        relevance += 0.4
        matchedTerms.push('title match')
      }

      // Content matches (medium weight)
      const queryWords = queryLower.split(' ').filter(word => word.length > 2)
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          relevance += 0.1
          matchedTerms.push(word)
        }
      })

      // 3. Fuzzy matching for typos and variations
      const queryWords2 = queryLower.split(' ')
      entry.keywords.forEach(keyword => {
        queryWords2.forEach(word => {
          if (word.length > 3) {
            const distance = levenshteinDistance(word, keyword)
            const similarity = 1 - (distance / Math.max(word.length, keyword.length))
            if (similarity > 0.7) {
              relevance += similarity * 0.2
              matchType = 'fuzzy'
              matchedTerms.push(`${word}~${keyword}`)
            }
          }
        })
      })

      // 4. Category matching
      if (queryLower.includes(entry.category)) {
        relevance += 0.2
        matchedTerms.push(entry.category)
      }

      // Add result if above threshold
      if (relevance > options.threshold) {
        results.push({
          entry,
          relevance,
          matchType,
          matchedTerms: [...new Set(matchedTerms)]
        })

        // Update usage count for learning
        entry.metadata.usage_count++
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, options.maxResults)
  }

  /**
   * REAL intelligent search that combines local knowledge with actual web search
   */
  async intelligentSearch(query: string, options = { 
    maxResults: 3, 
    threshold: 0.3, 
    forceWebSearch: false,
    forceLocal: false 
  }): Promise<{
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

    // Analyze the query to determine search strategy
    const analysis = this.queryAnalyzer.analyzeQuery(query)
    const strategy = this.queryAnalyzer.getSearchStrategy(query)
    
    console.log(`📊 Query analysis:`, analysis)
    console.log(`🎯 Search strategy:`, strategy)

    let localResults: SearchResult[] = []
    let webResults: WebSearchResult[] = []
    let webProvider: string | null = null
    let searchStrategy: 'local-only' | 'web-only' | 'hybrid' | 'error' = 'hybrid'

    try {
      // Get local results if needed
      if ((analysis.useLocalKnowledge || options.forceLocal) && !options.forceWebSearch) {
        console.log(`📚 Searching local knowledge base...`)
        localResults = await this.search(query, { 
          maxResults: strategy.maxLocalResults, 
          threshold: options.threshold 
        })
        console.log(`📚 Local search found ${localResults.length} results`)
      }

      // Get web results if needed
      if ((analysis.useWebSearch || options.forceWebSearch) && !options.forceLocal) {
        console.log(`🌐 Performing real web search...`)
        const webSearchResult = await this.webSearchEngine.search(query, strategy.maxWebResults)
        
        if (webSearchResult.success && webSearchResult.results.length > 0) {
          webResults = webSearchResult.results
          webProvider = webSearchResult.provider
          console.log(`🌐 Web search successful via ${webProvider}: ${webResults.length} results`)
        } else {
          console.log(`❌ Web search failed: ${webSearchResult.provider}`)
        }
      }

      // Determine final search strategy
      if (localResults.length > 0 && webResults.length > 0) {
        searchStrategy = 'hybrid'
      } else if (localResults.length > 0) {
        searchStrategy = 'local-only'
      } else if (webResults.length > 0) {
        searchStrategy = 'web-only'
      } else {
        searchStrategy = 'error'
      }

      // Generate response
      const response = this.generateIntelligentResponse(
        query, 
        localResults, 
        webResults, 
        searchStrategy,
        analysis
      )

      const searchTime = Date.now() - startTime
      console.log(`✅ Intelligent search completed in ${searchTime}ms: ${searchStrategy}`)

      return {
        localResults,
        webResults,
        searchStrategy,
        response,
        metadata: {
          queryAnalysis: analysis,
          searchTime,
          webProvider,
          totalResults: localResults.length + webResults.length
        }
      }

    } catch (error) {
      console.error('❌ Intelligent search error:', error)
      
      return {
        localResults: [],
        webResults: [],
        searchStrategy: 'error',
        response: `I apologize, but I encountered an error while searching for "${query}". Please try rephrasing your question or ask me about my services directly.`,
        metadata: {
          queryAnalysis: analysis,
          searchTime: Date.now() - startTime,
          webProvider: null,
          totalResults: 0
        }
      }
    }
  }

  /**
   * Generate intelligent response combining local and web results
   */
  private generateIntelligentResponse(
    query: string,
    localResults: SearchResult[],
    webResults: WebSearchResult[],
    strategy: string,
    analysis: any
  ): string {
    let response = ''

    // Local knowledge response
    if (localResults.length > 0) {
      const bestLocal = localResults[0]
      response += `**From my expertise:**\n\n${bestLocal.entry.content}\n\n`
      
      if (localResults.length > 1) {
        response += `**Additional relevant information:**\n`
        localResults.slice(1).forEach((result, index) => {
          const snippet = result.entry.content.substring(0, 200) + '...'
          response += `• **${result.entry.title}**: ${snippet}\n`
        })
        response += '\n'
      }
    }

    // Web search results
    if (webResults.length > 0) {
      if (localResults.length > 0) {
        response += `**Latest information from the web:**\n\n`
      } else {
        response += `**Here's what I found online:**\n\n`
      }

      webResults.forEach((result, index) => {
        response += `**${index + 1}. ${result.title}**\n`
        response += `${result.snippet}\n`
        response += `🔗 [${result.displayUrl}](${result.url})\n\n`
      })
    }

    // Add helpful context based on strategy
    if (strategy === 'local-only') {
      response += `💡 *This information is from my personal knowledge and experience. For the latest updates, feel free to ask me to search the web!*`
    } else if (strategy === 'web-only') {
      response += `💡 *This information is from current web search results. For questions about my services and expertise, just ask directly!*`
    } else if (strategy === 'hybrid') {
      response += `💡 *This combines my personal expertise with current web information for a comprehensive answer.*`
    }

    // Fallback if no results
    if (localResults.length === 0 && webResults.length === 0) {
      response = this.getFallbackResponse().entry.content
    }

    return response
  }

  /**
   * Test the web search functionality
   */
  async testWebSearch(): Promise<{
    success: boolean
    provider: string
    results: number
    error?: string
  }> {
    return await this.webSearchEngine.testSearch()
  }

  /**
   * Get available search providers
   */
  async getSearchProviders(): Promise<{ name: string; available: boolean }[]> {
    return await this.webSearchEngine.getAvailableProviders()
  }

  /**
   * Add new knowledge entry (for future learning capabilities)
   */
  async addKnowledge(content: string, title: string, category: string): Promise<void> {
    const entry: KnowledgeEntry = {
      id: `user-${Date.now()}`,
      title,
      content,
      category,
      keywords: extractKeywords(content + ' ' + title),
      embedding: this.embedding.createEmbedding(content + ' ' + title),
      metadata: {
        lastUpdated: new Date().toISOString(),
        confidence: 0.8,
        sourceType: 'learned',
        usage_count: 0
      }
    }

    this.entries.push(entry)
  }

  /**
   * Get knowledge base statistics
   */
  getStats() {
    return {
      totalEntries: this.entries.length,
      categories: [...new Set(this.entries.map(e => e.category))],
      totalQueries: this.entries.reduce((sum, e) => sum + e.metadata.usage_count, 0),
      isInitialized: this.isInitialized
    }
  }

  /**
   * Get fallback response when no good matches found
   */
  getFallbackResponse(): SearchResult {
    const fallbackEntry: KnowledgeEntry = {
      id: 'fallback',
      title: 'Welcome to My Digital Portfolio',
      content: `I'm Onesmus M., a full-stack developer who builds revenue-generating web applications. Here's what I can help you with:

🚀 **Web Development**: Custom applications using React, TypeScript, and Django
🎨 **UI/UX Design**: Conversion-focused designs that drive business results  
🔧 **Digital Strategy**: System modernization and performance optimization

**Popular Topics to Explore:**
• "What services do you offer?" - Learn about my capabilities
• "Tell me about your tech stack" - Understand the technology behind this site
• "How much does a project cost?" - Pricing and timeline information
• "How do we get started?" - Next steps for working together

Ask me anything about development, design, pricing, or how I can help grow your business!`,
      category: 'general',
      keywords: ['help', 'services', 'development', 'design', 'pricing', 'getting started'],
      metadata: {
        lastUpdated: new Date().toISOString(),
        confidence: 1.0,
        sourceType: 'manual',
        usage_count: 0
      }
    }

    return {
      entry: fallbackEntry,
      relevance: 0.5,
      matchType: 'keyword',
      matchedTerms: ['general inquiry']
    }
  }
}
