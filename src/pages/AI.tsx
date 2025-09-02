import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Search, Code, Globe, Palette, BookOpen, HelpCircle, Lightbulb, Brain, Zap, TrendingUp } from 'lucide-react'
import { EnhancedLocalKnowledgeBase } from '@/lib/enhanced-knowledge-base'

// Initialize the enhanced knowledge base
const knowledgeBase = new EnhancedLocalKnowledgeBase()

export default function AIPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; title?: string; relevance?: number; matchType?: string; matchedTerms?: string[] }[]>([
    { 
      role: 'assistant', 
      title: 'Enhanced AI Assistant Ready! 🧠',
      content: `Welcome! I'm your intelligent project guide powered by advanced local AI. I can provide detailed, contextual answers about my development services, technical expertise, and business processes.

**🚀 Enhanced Capabilities:**
• **Semantic Understanding** - I understand context and meaning, not just keywords
• **Comprehensive Knowledge** - Deep expertise across development, design, and business
• **Smart Matching** - Multiple search strategies for the best answers
• **Learning System** - I track popular questions to improve responses

**💡 Try These Advanced Queries:**
• "Compare your React expertise with Django capabilities"
• "What's the ROI timeline for a SaaS project?"
• "How do you handle security in e-commerce applications?"
• "Walk me through your development process for startups"

What would you like to explore?`
    }
  ])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Initialize knowledge base on component mount
  useEffect(() => {
    const initKB = async () => {
      await knowledgeBase.initialize()
      setStats(knowledgeBase.getStats())
    }
    initKB()
  }, [])

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const query = input.trim()
    if (!query) return

    setMessages(prev => [...prev, { role: 'user', content: query }])
    setInput('')
    setLoading(true)

    try {
      // Use enhanced search with semantic understanding
      const results = await knowledgeBase.search(query, { maxResults: 1, threshold: 0.2 })
      
      let response
      if (results.length > 0) {
        const bestResult = results[0]
        response = {
          role: 'assistant' as const,
          title: `${bestResult.entry.title} (${Math.round(bestResult.relevance * 100)}% match)`,
          content: bestResult.entry.content,
          relevance: bestResult.relevance,
          matchType: bestResult.matchType,
          matchedTerms: bestResult.matchedTerms
        }
      } else {
        // Use fallback response
        const fallback = knowledgeBase.getFallbackResponse()
        response = {
          role: 'assistant' as const,
          title: fallback.entry.title,
          content: fallback.entry.content,
          relevance: fallback.relevance,
          matchType: fallback.matchType,
          matchedTerms: fallback.matchedTerms
        }
      }

      // Simulate brief processing time for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, response])
        setStats(knowledgeBase.getStats())
        setLoading(false)
      }, 800)

    } catch (error) {
      console.error('Search error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        title: 'Search Error',
        content: 'I encountered an issue processing your question. Please try rephrasing your query or ask about my services, tech stack, or pricing.'
      }])
      setLoading(false)
    }
  }

  const quickActions = useMemo(() => [
    { icon: <Code className="h-4 w-4" />, text: 'What services do you offer?', category: 'Services', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { icon: <Globe className="h-4 w-4" />, text: 'Explain your complete tech stack', category: 'Technical', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { icon: <Palette className="h-4 w-4" />, text: 'How much does a custom web app cost?', category: 'Business', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { icon: <BookOpen className="h-4 w-4" />, text: 'Walk me through your development process', category: 'Process', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { icon: <HelpCircle className="h-4 w-4" />, text: 'How do we get started working together?', category: 'Contact', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
    { icon: <Lightbulb className="h-4 w-4" />, text: 'Security best practices for web applications', category: 'Technical', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' }
  ], [])

  const advancedQueries = useMemo(() => [
    "Compare React vs Vue.js for my project needs",
    "ROI timeline for e-commerce vs SaaS development", 
    "How do you ensure GDPR compliance in web apps?",
    "What's included in your enterprise package?",
    "Performance optimization strategies for high-traffic sites",
    "Integration options with existing business systems"
  ], [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Card className="w-full max-w-5xl shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Enhanced AI Project Assistant</CardTitle>
                <CardDescription className="text-blue-100">
                  Powered by advanced semantic search • {stats?.totalEntries || 0} knowledge entries • {stats?.totalQueries || 0} queries processed
                </CardDescription>
              </div>
            </div>
            {stats && (
              <div className="text-right text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Local AI Engine</span>
                </div>
                <div className="text-xs opacity-75">{stats.categories.length} knowledge domains</div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Messages Area */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto border rounded-lg p-4 bg-gradient-to-b from-white to-slate-50">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}>
                    {message.title && (
                      <div className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        {message.title}
                        {message.relevance && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {message.matchType} match
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </div>
                    {message.matchedTerms && message.matchedTerms.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500 mb-1">Matched terms:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.matchedTerms.slice(0, 5).map((term, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="relative">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <Brain className="absolute inset-0 h-5 w-5 text-blue-600 opacity-20" />
                      </div>
                      <div>
                        <div className="font-medium">AI Processing...</div>
                        <div className="text-xs opacity-75">Analyzing semantic context</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask detailed questions about services, pricing, tech stack, or development process..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Ask AI
                    </div>
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  Popular Questions:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`justify-start p-3 h-auto text-left ${action.color} transition-all duration-200`}
                      onClick={() => setInput(action.text)}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        <div>
                          <div className="text-xs font-medium">{action.text}</div>
                          <div className="text-xs opacity-60">{action.category}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Queries */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-slate-600">💡 Try these advanced queries:</div>
                <div className="flex flex-wrap gap-2">
                  {advancedQueries.map((query, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-xs p-2"
                      onClick={() => setInput(query)}
                    >
                      {query}
                    </Badge>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Enhanced local AI • Semantic search • No external APIs • Privacy-focused
              </div>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm underline transition-colors"
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
