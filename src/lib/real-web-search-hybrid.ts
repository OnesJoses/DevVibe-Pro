/**
 * Real Web Search Integration with Serper API + Enhanced Local Knowledge
 */

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  displayUrl: string
  relevance: number
  source: string
}

export interface RealSearchResponse {
  results: WebSearchResult[]
  provider: string
  totalTime: number
  success: boolean
  fromCache?: boolean
}

/**
 * Serper API Integration for Real Web Search
 */
class SerperWebSearch {
  private apiKey: string
  private baseUrl = 'https://google.serper.dev/search'

  constructor() {
    this.apiKey = import.meta.env.VITE_SERPER_API_KEY || ''
    console.log('🔑 Serper API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT FOUND')
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  async search(query: string, limit = 3): Promise<WebSearchResult[]> {
    if (!this.apiKey) {
      console.warn('🔑 Serper API key not found, falling back to enhanced content')
      return []
    }

    console.log(`🌐 Searching Serper API for: "${query}" with key: ${this.apiKey.substring(0, 8)}...`)

    try {
      const requestBody = {
        q: query,
        num: limit,
        hl: 'en',
        gl: 'us'
      }
      console.log('📤 Serper request:', requestBody)

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Serper response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Serper API error response:', errorText)
        throw new Error(`Serper API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Serper API response data:', data)

      return this.parseSerperResults(data, limit)
    } catch (error) {
      console.error('❌ Serper API error:', error)
      return []
    }
  }

  private parseSerperResults(data: any, limit: number): WebSearchResult[] {
    const results: WebSearchResult[] = []

    // Parse organic results
    if (data.organic && Array.isArray(data.organic)) {
      for (const item of data.organic.slice(0, limit)) {
        results.push({
          title: item.title || 'No title',
          url: item.link || '',
          snippet: item.snippet || 'No description available',
          displayUrl: this.extractDomain(item.link || ''),
          relevance: 0.8,
          source: 'Serper Web Search'
        })
      }
    }

    // Parse knowledge graph if available
    if (data.knowledgeGraph && results.length < limit) {
      const kg = data.knowledgeGraph
      results.unshift({
        title: kg.title || 'Knowledge Graph',
        url: kg.website || kg.descriptionLink || '',
        snippet: kg.description || 'Knowledge graph information',
        displayUrl: 'Google Knowledge Graph',
        relevance: 0.95,
        source: 'Knowledge Graph'
      })
    }

    // Parse answer box if available
    if (data.answerBox && results.length < limit) {
      const answer = data.answerBox
      results.unshift({
        title: answer.title || 'Direct Answer',
        url: answer.link || '',
        snippet: answer.answer || answer.snippet || 'Direct answer available',
        displayUrl: this.extractDomain(answer.link || ''),
        relevance: 0.99,
        source: 'Answer Box'
      })
    }

    return results.slice(0, limit)
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return url
    }
  }
}

/**
 * Enhanced Content Search (Fallback/Supplement)
 */
class EnhancedContentSearch {
  async search(query: string, limit = 3): Promise<WebSearchResult[]> {
    const queryLower = query.toLowerCase()
    
    // Topic keyword mapping for better matching
    const topicKeywords = {
      'react': ['react', 'reactjs', 'jsx', 'hook', 'component', 'state'],
      'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'es2020'],
      'typescript': ['typescript', 'ts', 'type', 'interface', 'generic'],
      'nodejs': ['node', 'nodejs', 'node.js', 'npm', 'express', 'server'],
      'python': ['python', 'py', 'django', 'flask', 'fastapi'],
      'security': ['security', 'secure', 'auth', 'authentication', 'authorization', 'csrf', 'xss', 'sql injection', 'vulnerability', 'best practices'],
      'database': ['database', 'db', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql']
    }

    // Enhanced content database with detailed information
    const contentDatabase: Record<string, WebSearchResult[]> = {
      'react': [
        {
          title: 'React 18 - Complete Guide with Hooks & Best Practices',
          url: 'https://react.dev/learn',
          snippet: `React 18 brings powerful concurrent features and improved performance:

🚀 Key Features:
• Automatic Batching: Multiple setState calls are batched for better performance
• Concurrent Rendering: Keep UI responsive during expensive operations
• Suspense: Better loading states and data fetching integration
• useId(): Generate unique IDs for accessibility
• useDeferredValue(): Defer non-urgent updates
• useTransition(): Mark updates as non-urgent

🎯 Modern Hooks Patterns:
\`\`\`jsx
// Custom hook for data fetching
function useApi(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData)
    .finally(() => setLoading(false))
  }, [url])
  
  return { data, loading }
}

// Using Suspense for data fetching
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  )
}
\`\`\`

📋 Best Practices:
• Use functional components with hooks
• Implement proper error boundaries
• Optimize with React.memo and useMemo
• Follow React DevTools profiler recommendations`,
          displayUrl: 'react.dev',
          relevance: 0.97,
          source: 'Enhanced React Guide'
        }
      ],
      
      'nodejs': [
        {
          title: 'Node.js Security Best Practices - Complete Guide',
          url: 'https://nodejs.org/en/docs/guides/security/',
          snippet: `Essential Node.js security practices for production applications:

🔐 Authentication & Authorization:
\`\`\`javascript
// JWT with proper expiration
const jwt = require('jsonwebtoken')
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { 
  expiresIn: '15m',
  issuer: 'your-app',
  audience: 'your-users'
})

// Rate limiting with express-rate-limit
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)
\`\`\`

🛡️ Input Validation:
\`\`\`javascript
const Joi = require('joi')
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

app.post('/login', (req, res) => {
  const { error } = schema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)
  // proceed with login
})
\`\`\`

🔍 Security Headers:
\`\`\`javascript
const helmet = require('helmet')
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}))
\`\`\``,
          displayUrl: 'nodejs.org',
          relevance: 0.96,
          source: 'Enhanced Node.js Security Guide'
        }
      ],

      'security': [
        {
          title: 'Web Application Security - OWASP Top 10 & Best Practices',
          url: 'https://owasp.org/www-project-top-ten/',
          snippet: `Complete security implementation guide for modern web applications:

🚨 OWASP Top 10 2023:
1. 🔓 Broken Access Control - Implement proper authorization
2. 🔐 Cryptographic Failures - Use strong encryption
3. 💉 Injection - Validate and sanitize all inputs
4. 🏗️ Insecure Design - Security by design approach
5. ⚙️ Security Misconfiguration - Secure defaults

🛡️ Implementation Examples:
\`\`\`javascript
// CSRF Protection
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}))

// SQL Injection Prevention
const query = 'SELECT * FROM users WHERE email = $1'
client.query(query, [userEmail])

// XSS Prevention
const DOMPurify = require('dompurify')
const clean = DOMPurify.sanitize(userInput)
\`\`\`

🔐 Security Headers:
\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})
\`\`\``,
          displayUrl: 'owasp.org',
          relevance: 0.98,
          source: 'Enhanced Security Guide'
        }
      ]
    }

    // Find matching enhanced content
    for (const [topic, content] of Object.entries(contentDatabase)) {
      const keywords = topicKeywords[topic as keyof typeof topicKeywords] || [topic]
      
      const matches = keywords.some((keyword: string) => 
        queryLower.includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(queryLower.trim())
      )
      
      if (matches) {
        console.log(`📚 Using enhanced content for: ${topic}`)
        return content.slice(0, limit)
      }
    }

    return []
  }
}

/**
 * Hybrid Search Engine - Real Web Search + Enhanced Content
 */
class HybridSearchEngine {
  private serperSearch: SerperWebSearch
  private enhancedSearch: EnhancedContentSearch

  constructor() {
    this.serperSearch = new SerperWebSearch()
    this.enhancedSearch = new EnhancedContentSearch()
  }

  async search(query: string, maxResults = 5): Promise<RealSearchResponse> {
    const startTime = Date.now()
    console.log(`🔍 Starting hybrid search for: "${query}"`)

    try {
      // Try real web search first
      const webResults = await this.serperSearch.search(query, Math.ceil(maxResults * 0.7))
      const enhancedResults = await this.enhancedSearch.search(query, Math.ceil(maxResults * 0.5))

      // Combine results intelligently
      const combinedResults: WebSearchResult[] = []
      
      // Add enhanced content first if available (more relevant for tech topics)
      if (enhancedResults.length > 0) {
        combinedResults.push(...enhancedResults.slice(0, 2))
      }
      
      // Add web results
      if (webResults.length > 0) {
        combinedResults.push(...webResults.slice(0, maxResults - combinedResults.length))
      }
      
      // If no enhanced content, add more web results
      if (enhancedResults.length === 0 && webResults.length > 0) {
        combinedResults.push(...webResults.slice(0, maxResults))
      }

      const totalTime = Date.now() - startTime
      const provider = webResults.length > 0 ? 'Serper + Enhanced' : 'Enhanced Only'

      console.log(`✅ Hybrid search completed: ${combinedResults.length} results (${webResults.length} web + ${enhancedResults.length} enhanced) in ${totalTime}ms`)

      return {
        results: combinedResults.slice(0, maxResults),
        provider,
        totalTime,
        success: combinedResults.length > 0
      }
    } catch (error) {
      console.error('❌ Hybrid search error:', error)
      
      // Fallback to enhanced content only
      const enhancedResults = await this.enhancedSearch.search(query, maxResults)
      
      return {
        results: enhancedResults,
        provider: 'Enhanced Fallback',
        totalTime: Date.now() - startTime,
        success: enhancedResults.length > 0
      }
    }
  }

  async testSearch(): Promise<{
    success: boolean
    provider: string
    results: number
    error?: string
  }> {
    try {
      const result = await this.search('React best practices', 3)
      return {
        success: result.success,
        provider: result.provider,
        results: result.results.length
      }
    } catch (error) {
      return {
        success: false,
        provider: 'Failed',
        results: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export the hybrid search engine
export const realWebSearch = new HybridSearchEngine()
