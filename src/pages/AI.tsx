import { useMemo, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Search, Code, Globe, Palette, BookOpen, HelpCircle, Lightbulb, Brain, Zap, TrendingUp, Wifi, WifiOff } from 'lucide-react'
import { smartKnowledgeBase } from '@/lib/smart-knowledge-base'

// Initialize the smart knowledge base
const knowledgeBase = smartKnowledgeBase

export default function AIPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    title?: string; 
    relevance?: number; 
    matchType?: string; 
    matchedTerms?: string[];
    metadata?: any;
  }[]>([
    { 
      role: 'assistant', 
      title: 'Intelligent AI Project Assistant 🧠✨',
      content: `Welcome! I'm your intelligent project guide with comprehensive knowledge and smart information retrieval.

**🚀 What I Can Help With:**
- **Personal Questions** - Instant answers about my services, experience, and approach  
- **Technical Guidance** - Detailed explanations on development topics and best practices
- **Current Information** - Up-to-date insights on technology trends and solutions
- **Project Planning** - Strategic advice for your development needs

**🎯 Smart Features:**
- **Intelligent Routing** - Automatically finds the best information source for your question
- **Comprehensive Answers** - Combines expertise with current data for complete responses
- **Source Transparency** - Shows exactly where information comes from
- **Contextual Responses** - Tailored answers based on your specific needs
- **Smart Routing** - Automatically chooses the best information source
- **Hybrid Intelligence** - Combines personal knowledge with curated tech data
- **Source Transparency** - Shows exactly where information comes from

**🔍 Search Features:**
- **Immediate Responses** for business and service questions
- **Curated Tech Resources** for common development topics
- **Structured Fallbacks** for reliable information
- **Privacy-Focused** - no tracking or external API dependencies
- **Always Available** - works without internet connectivity

**💡 Try These Queries:**
- **Personal**: "What services do you offer?" "Your development process?"
- **Tech Topics**: "React best practices" "TypeScript fundamentals"
- **Project Info**: "How much does a custom web app cost?" "Your tech stack?"
- **Hybrid**: "How do you approach React development?" "Your experience with TypeScript"

**🎯 Search Intelligence:**
- Personal/business questions → Local expertise (instant, comprehensive)
- Technical topics → Curated resources (reliable, structured)
- Hybrid queries → Best of both sources

Ready to search both my expertise AND the entire internet? Ask me anything!`
    }
  ])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [webSearchStatus, setWebSearchStatus] = useState<any>(null)

  // Initialize knowledge base and test web search on component mount
  useEffect(() => {
    const initKB = async () => {
      await knowledgeBase.initialize()
      setStats(knowledgeBase.getStats())
      
      // Test search capabilities
      const testResult = await knowledgeBase.testSearch()
      const providers = await knowledgeBase.getSearchProviders()
      
      setWebSearchStatus({
        ...testResult,
        providers
      })
      
      console.log('🌐 Web Search Status:', { testResult, providers })
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
      // Use the smart search system that automatically chooses the best approach
      const searchResult = await knowledgeBase.smartSearch(query, 5)
      
      console.log('🔍 Smart search result:', searchResult)
      
      // Create response message
      const response = {
        role: 'assistant' as const,
        title: `${searchResult.strategy} • ${searchResult.results.length} results`,
        content: searchResult.results.length > 0 ? 
          searchResult.results.map(result => {
            let content = `**${result.title}**\n\n${result.content}`
            if (result.url) {
              content += `\n\n*Source: ${result.url}*`
            }
            return content
          }).join('\n\n---\n\n') :
          `I'd be happy to help with "${query}". Could you provide more context or try rephrasing your question?`,
        relevance: searchResult.results[0]?.relevance || 0,
        matchType: searchResult.strategy,
        matchedTerms: searchResult.sources,
        metadata: {
          strategy: searchResult.strategy,
          sources: searchResult.sources,
          searchTime: searchResult.searchTime,
          resultCount: searchResult.results.length
        }
      }

      // Show results after a brief delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, response])
        setStats(knowledgeBase.getStats())
        setLoading(false)
      }, Math.min(1500, searchResult.searchTime + 500))

    } catch (error) {
      console.error('❌ Search error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        title: 'Search Error',
        content: 'I encountered an issue processing your question. This might be due to network connectivity. Please try again or ask about my services and expertise for local information.',
        relevance: 0,
        matchType: 'error',
        matchedTerms: ['error']
      }])
      setLoading(false)
    }
  }

  const quickActions = useMemo(() => [
    { icon: <Code className="h-4 w-4" />, text: 'What services do you offer?', category: 'Local Knowledge', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { icon: <Globe className="h-4 w-4" />, text: 'Latest React 18 features and updates', category: 'Web Search', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { icon: <Palette className="h-4 w-4" />, text: 'How much does a custom web app cost?', category: 'Local Knowledge', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { icon: <BookOpen className="h-4 w-4" />, text: 'Current web development trends 2024', category: 'Web Search', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { icon: <HelpCircle className="h-4 w-4" />, text: 'How do we get started working together?', category: 'Local Knowledge', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
    { icon: <Lightbulb className="h-4 w-4" />, text: 'Best practices for Node.js security', category: 'Web Search', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' }
  ], [])

  const advancedQueries = useMemo(() => [
    "Compare React vs Vue.js performance in 2024",
    "ROI timeline for e-commerce vs SaaS development", 
    "How do you ensure GDPR compliance in web apps?",
    "Latest TypeScript features and best practices",
    "Performance optimization for high-traffic websites",
    "Modern authentication methods for web applications"
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
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  Enhanced AI Project Assistant
                  {webSearchStatus && (
                    <Badge 
                      variant={webSearchStatus.success ? "secondary" : "destructive"}
                      className="text-xs bg-white/20 text-white border-white/30"
                    >
                      {webSearchStatus.success ? (
                        <><Wifi className="h-3 w-3 mr-1" />Web Search Ready</>
                      ) : (
                        <><WifiOff className="h-3 w-3 mr-1" />Local Only</>
                      )}
                    </Badge>
                  )}
                </CardTitle>
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
                      <div className="font-semibold text-blue-600 mb-3 flex items-center gap-2 flex-wrap">
                        <Lightbulb className="h-4 w-4" />
                        {message.title}
                        {message.relevance && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {message.matchType} • {Math.round(message.relevance * 100)}%
                          </Badge>
                        )}
                        {message.metadata?.searchStrategy && (
                          <Badge 
                            variant={
                              message.metadata.searchStrategy === 'web-only' ? 'default' :
                              message.metadata.searchStrategy === 'local-only' ? 'secondary' :
                              message.metadata.searchStrategy === 'hybrid' ? 'outline' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {message.metadata.searchStrategy === 'web-only' && <><Wifi className="h-3 w-3 mr-1" />Web Search</>}
                            {message.metadata.searchStrategy === 'local-only' && <><Brain className="h-3 w-3 mr-1" />Local Knowledge</>}
                            {message.metadata.searchStrategy === 'hybrid' && <><Zap className="h-3 w-3 mr-1" />Hybrid Search</>}
                            {message.metadata.searchStrategy === 'error' && <><WifiOff className="h-3 w-3 mr-1" />Error</>}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed markdown-render">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: (props: any) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                          ),
                          strong: (props: any) => <strong className="font-semibold" {...props} />,
                          em: (props: any) => <em className="italic" {...props} />,
                          ul: (props: any) => <ul className="list-disc pl-5 my-2" {...props} />,
                          ol: (props: any) => <ol className="list-decimal pl-5 my-2" {...props} />,
                          li: (props: any) => <li className="mb-1" {...props} />,
                          code: (props: any) => {
                            const { inline, children, ...rest } = props || {}
                            return (
                              <code className={`bg-slate-100 rounded px-1 ${inline ? '' : 'block p-2 my-2'}`} {...rest}>
                                {children}
                              </code>
                            )
                          },
                          h1: (props: any) => <h1 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                          h2: (props: any) => <h2 className="text-base font-semibold mt-2 mb-1" {...props} />,
                          h3: (props: any) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                          hr: (props: any) => <hr className="my-3 border-slate-200" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
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
                    {message.metadata && (
                      <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                        {message.metadata.searchTime && (
                          <div className="text-xs text-slate-500">
                            ⚡ Search completed in {message.metadata.searchTime}ms
                          </div>
                        )}
                        {message.metadata.webProvider && (
                          <div className="text-xs text-slate-500">
                            🌐 Web search via {message.metadata.webProvider}
                          </div>
                        )}
                        {message.metadata.totalResults && (
                          <div className="text-xs text-slate-500">
                            📊 {message.metadata.totalResults} total results found
                          </div>
                        )}
                        {message.metadata.reasoning && (
                          <div className="text-xs text-slate-400 italic">
                            🧠 {message.metadata.reasoning}
                          </div>
                        )}
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
                Enhanced local AI • Semantic search • Privacy-focused
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
