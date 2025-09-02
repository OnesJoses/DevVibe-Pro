import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Search, Code, Globe, Palette, BookOpen, HelpCircle, Lightbulb } from 'lucide-react'

// Comprehensive Knowledge Base
const knowledgeBase = {
  // Personal & Professional Information
  about: {
    keywords: ['who', 'about', 'onesmus', 'profile', 'intro', 'background', 'experience'],
    title: 'About Onesmus M.',
    content: `I'm a results-driven full-stack developer and digital strategist with 5+ years of experience building scalable web applications. I specialize in transforming business ideas into profitable digital solutions that generate real ROI.

My expertise spans:
• Full-stack development (React, TypeScript, Node.js, Django)
• UI/UX design with conversion optimization
• Digital transformation and system modernization
• Performance optimization and security implementation

I've delivered 50+ projects with 98% client satisfaction, consistently meeting deadlines and budgets while exceeding expectations.`
  },

  // Technical Stack & Architecture
  techStack: {
    keywords: ['tech', 'stack', 'technology', 'frameworks', 'libraries', 'tools', 'architecture'],
    title: 'Technology Stack & Architecture',
    content: `This project showcases modern full-stack development:

Frontend:
• React 18 + TypeScript for type-safe development
• Tailwind CSS + shadcn/ui for design system
• Vite/esbuild for fast development and builds
• React Router for client-side navigation
• Zustand for state management

Backend:
• Django 5 + Django REST Framework
• PostgreSQL database with optimized queries
• JWT authentication with refresh tokens
• Redis for caching and session management
• Comprehensive API documentation

Infrastructure:
• Vercel for frontend hosting with edge optimization
• AWS/Railway for backend deployment
• CI/CD pipelines with automated testing
• Environment-based configuration management`
  },

  // Services & Capabilities
  services: {
    keywords: ['services', 'offer', 'capabilities', 'skills', 'what can you do', 'help'],
    title: 'Services & Capabilities',
    content: `I provide end-to-end digital solutions:

🚀 Full-Stack Web Development
• Custom web applications from MVP to enterprise scale
• E-commerce platforms with payment integration
• Dashboard and analytics applications
• API development and third-party integrations

🎨 UI/UX Design & Development  
• Conversion-focused design systems
• Responsive web design for all devices
• User experience optimization
• Design-to-code implementation

🔧 Digital Transformation
• Legacy system modernization
• Cloud migration and optimization
• Performance audits and improvements
• Security implementation and compliance

📊 Technologies I Master:
React, TypeScript, Node.js, Python, Django, PostgreSQL, MongoDB, AWS, Docker, Git, Figma`
  },

  // Development Process & Methodology
  process: {
    keywords: ['process', 'methodology', 'workflow', 'development', 'project', 'timeline'],
    title: 'Development Process & Methodology',
    content: `My proven development methodology ensures success:

📋 Discovery & Planning (Week 1)
• Requirements analysis and technical feasibility
• User story mapping and wireframing
• Technology selection and architecture design
• Project timeline and milestone definition

🔨 Development Phases (Weeks 2-N)
• Agile sprints with regular client check-ins
• Test-driven development for quality assurance
• Continuous integration and deployment
• Performance monitoring and optimization

🚀 Launch & Support
• Production deployment with monitoring
• User training and documentation
• Post-launch support and maintenance
• Performance analytics and improvement

Key Principles:
• Business outcomes first, technology second
• Clean, maintainable, and documented code
• Mobile-first responsive design
• Security and performance by design`
  },

  // Authentication & Security
  authentication: {
    keywords: ['auth', 'login', 'register', 'jwt', 'token', 'security', 'password'],
    title: 'Authentication & Security Implementation',
    content: `Robust authentication system with enterprise-grade security:

🔐 Authentication Flow:
• User registration with email verification
• Secure login with JWT tokens
• Refresh token rotation for enhanced security
• Password reset via secure email links

🛡️ Security Measures:
• HTTPS enforcement everywhere
• CSRF protection and CORS configuration
• SQL injection prevention
• XSS protection with content security policy
• Rate limiting to prevent abuse

🔑 Session Management:
• JWT access tokens (15-minute expiry)
• Refresh tokens with automatic rotation
• Secure cookie storage with HttpOnly flags
• Device-based session tracking

API Endpoints:
• POST /api/accounts/register - User registration
• POST /api/accounts/login - User authentication  
• POST /api/accounts/refresh - Token refresh
• POST /api/accounts/forgot-password - Password reset
• GET /api/accounts/profile - User profile (authenticated)`
  },

  // Deployment & DevOps
  deployment: {
    keywords: ['deploy', 'deployment', 'hosting', 'devops', 'production', 'ci/cd'],
    title: 'Deployment & DevOps Strategy',
    content: `Production-ready deployment with modern DevOps practices:

🌐 Frontend Deployment (Vercel):
• Automatic deployments from Git commits
• Edge caching for global performance
• Custom domain with SSL certificates
• Preview deployments for testing

⚙️ Backend Deployment (AWS/Railway):
• Container-based deployment with Docker
• Auto-scaling based on traffic
• Database backups and monitoring
• Health checks and error tracking

🔄 CI/CD Pipeline:
• Automated testing on pull requests
• Code quality checks with ESLint/Prettier
• Security vulnerability scanning
• Performance monitoring and alerts

🗄️ Database & Infrastructure:
• PostgreSQL with connection pooling
• Redis for caching and sessions
• File storage with CDN integration
• Monitoring with real-time alerts`
  },

  // Business & Pricing
  business: {
    keywords: ['pricing', 'cost', 'budget', 'timeline', 'hire', 'contract', 'business'],
    title: 'Working Together - Pricing & Process',
    content: `Let's discuss how I can help grow your business:

💰 Investment Levels:
• Small Projects (Landing pages, simple apps): $2,000 - $5,000
• Medium Projects (E-commerce, dashboards): $5,000 - $15,000  
• Large Projects (Enterprise apps, platforms): $15,000 - $50,000+
• Ongoing Support & Maintenance: $500 - $2,000/month

📅 Typical Timelines:
• Landing Page/Portfolio: 1-2 weeks
• Business Website: 2-4 weeks
• Web Application: 4-12 weeks
• Complex Platform: 3-6 months

🤝 What's Included:
• Complete source code ownership
• Documentation and training
• 30-day post-launch support
• Performance and security optimization
• Mobile-responsive design guaranteed

Next Steps:
1. Schedule a free consultation call
2. Discuss your goals and requirements  
3. Receive detailed proposal with timeline
4. Begin development with clear milestones`
  },

  // Performance & Best Practices
  performance: {
    keywords: ['performance', 'speed', 'optimization', 'best practices', 'seo', 'accessibility'],
    title: 'Performance & Best Practices',
    content: `I build applications optimized for speed, accessibility, and search engines:

⚡ Performance Optimization:
• Code splitting and lazy loading
• Image optimization with WebP/AVIF
• Browser caching strategies
• Database query optimization
• CDN integration for global speed

🔍 SEO Implementation:
• Semantic HTML structure
• Meta tags and Open Graph optimization
• Structured data markup
• Site performance optimization
• Mobile-first responsive design

♿ Accessibility Standards:
• WCAG 2.1 AA compliance
• Keyboard navigation support
• Screen reader compatibility
• Color contrast optimization
• Focus management

📊 Monitoring & Analytics:
• Core Web Vitals tracking
• User behavior analytics
• Error tracking and alerting
• Performance budgets
• A/B testing capabilities

Results You Can Expect:
• 90+ Google PageSpeed scores
• <3 second load times globally
• 100% mobile responsive
• Search engine optimized
• Accessible to all users`
  },

  // Contact & Getting Started
  contact: {
    keywords: ['contact', 'reach', 'email', 'hire', 'work together', 'start', 'begin'],
    title: 'Let\'s Work Together',
    content: `Ready to transform your business with a digital solution that delivers results?

📧 Get In Touch:
Email: onesjoses5@gmail.com
Response Time: Within 24 hours

🚀 Free Consultation Includes:
• 30-minute strategy session
• Technical feasibility assessment  
• Ballpark timeline and investment
• Technology recommendations
• No-obligation proposal

📋 Before We Chat, Please Prepare:
• Your business goals and objectives
• Target audience and user personas
• Preferred timeline and launch date
• Budget range for the project
• Examples of designs/apps you like

🎯 Perfect Projects For Me:
• Startups needing MVP development
• Businesses requiring digital transformation
• Companies scaling existing applications
• Organizations needing custom solutions

I specialize in projects where technical excellence meets business strategy. Let's build something amazing together!`
  }
}

// Enhanced search function with fuzzy matching and relevance scoring
function searchKnowledgeBase(query: string): { title: string; content: string; relevance: number } {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  let bestMatch = { title: '', content: '', relevance: 0 }

  for (const [key, item] of Object.entries(knowledgeBase)) {
    let relevance = 0
    
    // Check keyword matches
    item.keywords.forEach(keyword => {
      searchTerms.forEach(term => {
        if (keyword.includes(term) || term.includes(keyword)) {
          relevance += 3
        }
      })
    })
    
    // Check title matches
    searchTerms.forEach(term => {
      if (item.title.toLowerCase().includes(term)) {
        relevance += 2
      }
    })
    
    // Check content matches
    searchTerms.forEach(term => {
      const contentMatches = (item.content.toLowerCase().match(new RegExp(term, 'g')) || []).length
      relevance += contentMatches * 0.5
    })
    
    if (relevance > bestMatch.relevance) {
      bestMatch = { title: item.title, content: item.content, relevance }
    }
  }
  
  // If no good match found, provide general overview
  if (bestMatch.relevance < 2) {
    return {
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
      relevance: 1
    }
  }
  
  return bestMatch
}

export default function AIPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; title?: string }[]>([
    { 
      role: 'assistant', 
      title: 'Welcome! 👋',
      content: `I'm your intelligent project guide. I can answer questions about my development process, technical expertise, pricing, and how we can work together.

**Try asking about:**
• My development services and capabilities
• Technical stack and architecture  
• Project timelines and pricing
• How to get started on your project

What would you like to know?`
    }
  ])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const query = input.trim()
    if (!query) return

    setMessages(prev => [...prev, { role: 'user', content: query }])
    setInput('')
    setLoading(true)

    // Simulate brief thinking time for better UX
    setTimeout(() => {
      const result = searchKnowledgeBase(query)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        title: result.title,
        content: result.content 
      }])
      setLoading(false)
    }, 500)
  }

  const quickActions = useMemo(() => [
    { icon: <Code className="h-4 w-4" />, text: 'What services do you offer?', category: 'Services' },
    { icon: <Globe className="h-4 w-4" />, text: 'Tell me about your tech stack', category: 'Technical' },
    { icon: <Palette className="h-4 w-4" />, text: 'How much does a project cost?', category: 'Business' },
    { icon: <BookOpen className="h-4 w-4" />, text: 'What\'s your development process?', category: 'Process' },
    { icon: <HelpCircle className="h-4 w-4" />, text: 'How do we get started?', category: 'Contact' },
    { icon: <Lightbulb className="h-4 w-4" />, text: 'Show me performance best practices', category: 'Technical' }
  ], [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6" />
            <div>
              <CardTitle className="text-xl">AI Project Assistant</CardTitle>
              <CardDescription className="text-blue-100">
                Your intelligent guide to my development services, technical expertise, and project process
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Messages Area */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto border rounded-lg p-4 bg-gradient-to-b from-white to-slate-50">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}>
                    {message.title && (
                      <div className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        {message.title}
                      </div>
                    )}
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Searching knowledge base...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my services, tech stack, pricing, or anything else..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Thinking...' : 'Ask'}
              </Button>
            </form>

            {/* Quick Actions */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-600">Popular Questions:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="justify-start p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => setInput(action.text)}
                  >
                    <div className="flex items-center gap-2">
                      {action.icon}
                      <span className="text-xs">{action.text}</span>
                    </div>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Powered by comprehensive local knowledge base - no external APIs required
              </div>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
              >
                ← Back to Portfolio
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
