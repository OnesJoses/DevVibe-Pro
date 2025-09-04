import { useMemo, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Link } from 'react-router-dom'
import { Search, Brain, Zap, Wifi, WifiOff, ThumbsUp, ThumbsDown, Send, Database, Cloud } from 'lucide-react'
import { AdminGuard } from '../components/AdminGuard'
import { PersistenceStatus } from '../components/PersistenceStatus'
import { smartKnowledgeBase, smartSearch } from '../lib/smart-knowledge-base'
import { aiComprehension } from '../lib/ai-comprehension'
import { aiLearning } from '../lib/ai-learning'
import { seedLearningSystem } from '../lib/ai-training-data'
import { enhancedAI } from '../lib/enhanced-intelligent-ai'
import { vectorKnowledge } from '../lib/vector-knowledge-engine'
import { persistentStorage } from '../lib/persistent-storage-engine'

// Initialize the smart knowledge base
const knowledgeBase = smartKnowledgeBase

// Enhanced Training Insights Component with ChromaDB integration
function TrainingInsights() {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chromaStatus, setChromaStatus] = useState<boolean>(false)

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await enhancedAI.getLearningInsights()
        setInsights(data)
        setChromaStatus(data.performance.chromaDBActive)
      } catch (error) {
        console.error('Failed to load insights:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadInsights()
  }, [])

  if (loading) return <div className="text-center py-4">Loading enhanced AI insights...</div>

  if (!insights) return <div className="text-center py-4 text-red-600">Unable to load training insights</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">🧠 Enhanced AI Learning Dashboard</h3>
        <div className="flex items-center gap-1">
          {chromaStatus ? (
            <><Database className="w-4 h-4 text-green-600" /><span className="text-xs text-green-600">ChromaDB Active</span></>
          ) : (
            <><Database className="w-4 h-4 text-orange-600" /><span className="text-xs text-orange-600">Local Fallback</span></>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 flex items-center gap-1">
            <Cloud className="w-4 h-4" />
            ChromaDB Knowledge
          </h4>
          <p className="text-2xl font-bold text-blue-600">{insights.chromaDB.totalDocuments}</p>
          <p className="text-sm text-blue-700">Stored Documents</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Local Storage
          </h4>
          <p className="text-2xl font-bold text-green-600">{insights.storage.totalConversations}</p>
          <p className="text-sm text-green-700">Conversations</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 flex items-center gap-1">
            <Wifi className="w-4 h-4" />
            Web Learning
          </h4>
          <p className="text-2xl font-bold text-purple-600">{insights.web.totalConcepts}</p>
          <p className="text-sm text-purple-700">Web Concepts</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-900 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Performance
          </h4>
          <p className="text-2xl font-bold text-orange-600">{(insights.storage.averageConfidence * 100).toFixed(0)}%</p>
          <p className="text-sm text-orange-700">Confidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">📊 Knowledge Categories</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.entries(insights.chromaDB.categories).map(([category, count]: [string, any]) => (
              <div key={category} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                <span className="capitalize">{category.replace('_', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">🆕 Recent Learning</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {insights.storage.recentLearning.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium flex items-center gap-1">
                  {item.type === 'conversation' && <Brain className="w-3 h-3" />}
                  {item.type === 'concept' && <Zap className="w-3 h-3" />}
                  {item.type}
                </div>
                <div className="text-gray-600">{new Date(item.metadata.created).toLocaleDateString()}</div>
                {item.content.question && (
                  <div className="text-gray-700 mt-1">{item.content.question.substring(0, 80)}...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">⚡ System Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Learning Rate:</span>
            <div className="font-medium">{insights.performance.learningRate.toFixed(2)} conv/hr</div>
          </div>
          <div>
            <span className="text-gray-600">Memory Usage:</span>
            <div className="font-medium">{insights.performance.memoryUsage}</div>
          </div>
          <div>
            <span className="text-gray-600">ChromaDB Recent:</span>
            <div className="font-medium">{insights.chromaDB.recentAdditions} docs</div>
          </div>
          <div>
            <span className="text-gray-600">Web Cache:</span>
            <div className="font-medium">{insights.web.cacheSize} queries</div>
          </div>
        </div>
      </div>

      {/* Persistence Status Component */}
      <PersistenceStatus />
    </div>
  )
}

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
    id?: string;
    rating?: number;
    feedbackGiven?: boolean;
  }[]>([
    { 
      role: 'assistant', 
      title: 'Welcome! 👋',
      content: `Hi! I'm here to help with your development questions and project needs.

**I can help you with:**
- Service questions and pricing
- Technical guidance and best practices  
- Project planning and recommendations
- Development process questions

**Popular topics:**
- "What services do you offer?"
- "How much does a web app cost?"
- "What's your development process?"
- "React best practices"
- "Your experience with [technology]"

What would you like to know?`
    }
  ])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [webSearchStatus, setWebSearchStatus] = useState<any>(null)
  const [showTrainingInsights, setShowTrainingInsights] = useState(false)

  // Enhanced feedback system that actually improves the AI intelligence
  // Enhanced feedback with full learning integration
  const giveFeedback = async (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        // Find the corresponding user question
        const userMessageIndex = prev.indexOf(msg) - 1
        const userMessage = prev[userMessageIndex]
        
        if (userMessage && userMessage.role === 'user') {
          // Learn from this interaction using enhanced AI system
          enhancedAI.learnFromInteraction(
            userMessage.content,
            msg.content,
            rating,
            msg.metadata || {}
          ).then(() => {
            console.log(`✅ Enhanced learning completed (rating: ${rating}/5)`)
            
            if (rating >= 4) {
              console.log('🎯 High-quality interaction stored in ChromaDB and IndexedDB')
            } else if (rating <= 2) {
              console.log('📝 Low-quality interaction noted - AI will improve similar responses')
            }
          }).catch(error => {
            console.error('❌ Learning error:', error)
          })
          
          // Also record in the legacy learning system for compatibility
          if (rating >= 4) {
            aiLearning.recordSuccess(
              userMessage.content,
              msg.content,
              msg.metadata || {},
              rating
            )
          } else if (rating <= 2) {
            aiLearning.recordFailure(
              userMessage.content,
              msg.content,
              rating === 1 ? 'Response was not helpful' : 'Response needs improvement'
            )
          }
        }
        
        return {
          ...msg,
          rating,
          feedbackGiven: true
        }
      }
      return msg
    }))
  }

  // Try alternative response when user is not satisfied
  const tryAlternativeResponse = async (messageId: string) => {
    // Find the original user question and AI response
    const messageIndex = messages.findIndex(m => m.id === messageId)
    const originalResponse = messages[messageIndex]
    const userQuestion = messages[messageIndex - 1]
    
    if (!userQuestion || !originalResponse) return

    // Mark the original response as having feedback
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedbackGiven: true, rating: 2 } : msg
    ))

    // Show loading for alternative response
    setLoading(true)

    try {
      // Try different search strategies
      let alternativeResult
      
      if (originalResponse.matchType === 'local_knowledge') {
        // If local knowledge was used, try web search
        alternativeResult = await knowledgeBase.smartSearch(userQuestion.content, 3)
      } else if (originalResponse.matchType === 'web_search') {
        // If web search was used, try local knowledge or rephrase
        alternativeResult = await knowledgeBase.smartSearch(userQuestion.content, 5)
      } else {
        // Try a more comprehensive search
        alternativeResult = await knowledgeBase.smartSearch(userQuestion.content, 8)
      }

      // Generate alternative response with different strategy
      const alternativeContent = alternativeResult.results.length > 0 ?
        alternativeResult.results.slice(0, 3).map(result => {
          let content = `**${result.title}**\n\n${result.content}`
          if (result.url) {
            content += `\n\n*Source: ${result.url}*`
          }
          return content
        }).join('\n\n---\n\n') :
        generateAlternativeAnswer(userQuestion.content)

      // Add the alternative response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          id: Date.now().toString(),
          title: `Alternative Response • ${alternativeResult.strategy}`,
          content: alternativeContent,
          matchType: alternativeResult.strategy,
          metadata: {
            strategy: alternativeResult.strategy,
            isAlternative: true,
            originalStrategy: originalResponse.matchType,
            sources: alternativeResult.sources,
            searchTime: alternativeResult.searchTime
          },
          feedbackGiven: false
        }])
        setLoading(false)
      }, 1000)

    } catch (error) {
      // Fallback alternative response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          id: Date.now().toString(),
          title: 'Alternative Approach',
          content: generateAlternativeAnswer(userQuestion.content),
          matchType: 'alternative_generated',
          metadata: { isAlternative: true },
          feedbackGiven: false
        }])
        setLoading(false)
      }, 1000)
    }
  }

  // Generate alternative answers with different approaches
  const generateAlternativeAnswer = (question: string) => {
    const q = question.toLowerCase()
    
    if (q.includes('service') || q.includes('offer') || q.includes('do')) {
      return `Let me approach this differently:

**Core Services:**
• **Custom Software Development** - Tailored applications built to your exact specifications
• **AI Integration & Automation** - Smart solutions to streamline your business processes  
• **Web & Mobile Development** - Modern, responsive applications across all platforms
• **Technical Consulting** - Expert guidance on technology strategy and implementation

**What makes us different:**
- Deep focus on user experience and business outcomes
- Agile development with transparent communication
- Post-launch support and continuous optimization
- Cutting-edge technologies with proven reliability

Would you like me to elaborate on any specific service area?`
    }
    
    if (q.includes('price') || q.includes('cost') || q.includes('fee')) {
      return `Here's a different perspective on pricing:

**Investment Approach:**
Rather than fixed rates, we focus on **value-based pricing** that aligns with your business goals.

**Typical Project Ranges:**
• **Starter Projects**: $2,000 - $8,000 (basic websites, simple apps)
• **Growth Projects**: $8,000 - $25,000 (custom features, integrations)
• **Enterprise Solutions**: $25,000+ (complex systems, AI integration)

**What's Included:**
✅ Discovery & planning phase
✅ Regular progress updates
✅ Quality assurance testing
✅ Launch support & training
✅ 30-day post-launch support

**Flexible Options:**
- Milestone-based payments
- Monthly retainer arrangements
- Equity partnerships for startups

Ready to discuss your specific project?`
    }
    
    if (q.includes('time') || q.includes('long') || q.includes('duration')) {
      return `Let me break down timelines more specifically:

**Project Timeline Factors:**
1. **Complexity** - Simple vs. enterprise-level features
2. **Scope** - Number of features and integrations
3. **Feedback Cycles** - How quickly you can review and approve
4. **Team Size** - Dedicated vs. shared resources

**Typical Timelines:**
• **Quick Wins** (1-2 weeks): Landing pages, simple tools
• **Standard Projects** (3-6 weeks): Business websites, basic apps
• **Custom Solutions** (6-12 weeks): Complex features, integrations
• **Enterprise Systems** (3-6 months): Large-scale applications

**Our Process:**
Week 1: Discovery & planning
Week 2-N: Development sprints (weekly demos)
Final Week: Testing, deployment, training

**Accelerated Options:**
- Dedicated team for faster delivery
- MVP approach for quicker market entry
- Parallel development tracks

What's your target timeline?`
    }
    
    return `Let me try a different approach to answer "${question}":

I want to make sure I give you the most helpful information. Could you help me understand:

• **What specific aspect** interests you most?
• **What's your main goal** or challenge?
• **Any particular context** I should know about?

**Meanwhile, here are some key points:**
- I focus on delivering **practical solutions** that work for your business
- Every project gets **personalized attention** and clear communication
- I believe in **transparent processes** and realistic expectations
- **Long-term partnership** is more important than quick transactions

Feel free to ask more specific questions, and I'll provide detailed, actionable answers!`
  }

  // Initialize knowledge base and test web search on component mount
  useEffect(() => {
    const initKB = async () => {
      await knowledgeBase.initialize()
      const kbStats = knowledgeBase.getStats()
      setStats(kbStats)
      
      // Seed the learning system with initial training data (only once)
      const hasSeeded = localStorage.getItem('ai-learning-seeded')
      if (!hasSeeded) {
        seedLearningSystem(aiLearning)
        localStorage.setItem('ai-learning-seeded', 'true')
      }
      
      // Debug: Check what knowledge is actually loaded
      console.log('🔍 Knowledge Base Stats:', kbStats)
      
      // Test if we can access localStorage knowledge directly
      const localKnowledge = localStorage.getItem('devvibe-ai-knowledge')
      if (localKnowledge) {
        try {
          const parsed = JSON.parse(localKnowledge)
          const entries = Array.isArray(parsed) ? parsed : (parsed.entries || [])
          console.log('📚 Direct localStorage knowledge:', entries.length, 'entries')
          console.log('📋 Sample entries:', entries.slice(0, 2))
        } catch (e) {
          console.error('❌ Error parsing localStorage knowledge:', e)
        }
      } else {
        console.log('⚠️ No knowledge found in localStorage')
      }
      
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

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setInput('')
    setLoading(true)

    try {
      // Use the enhanced AI system with ChromaDB
      console.log('🚀 Using Enhanced ChromaDB AI System for:', query)
      const result = await enhancedAI.processQuery(query)
      
      console.log('🎯 Enhanced AI Result:', result)
      
      // Show learning progress if new concepts were learned
      if (result.newLearning.concepts.length > 0) {
        console.log('🧠 New concepts learned:', result.newLearning.concepts)
      }
      
      // Create enhanced response message with detailed metadata
      const response = {
        role: 'assistant' as const,
        id: Date.now().toString(),
        title: `Enhanced AI • ${(result.confidence * 100).toFixed(0)}% confidence • ${result.sources.join(', ')}`,
        content: result.answer,
        relevance: result.confidence,
        matchType: result.metadata.intent?.type || 'general',
        matchedTerms: result.metadata.intent?.keywords || [],
        feedbackGiven: false,
        metadata: {
          ...result.metadata,
          sources: result.sources,
          newLearning: result.newLearning,
          enhancedAI: true,
          chromaDBUsed: result.metadata.chromaDBUsed,
          webSearchPerformed: result.metadata.webSearchPerformed
        }
      }

      // Show results after processing
      setTimeout(() => {
        setMessages(prev => [...prev, response])
        setStats(knowledgeBase.getStats())
        setLoading(false)
      }, 800) // Slightly longer delay to show processing

    } catch (error) {
      console.error('❌ Enhanced AI error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        id: Date.now().toString(),
        title: 'Processing Error',
        content: 'I had trouble processing that question. Could you try rephrasing it, or ask me something specific about my services, pricing, or technical approach?',
        relevance: 0,
        matchType: 'error',
        matchedTerms: ['error'],
        feedbackGiven: false
      }])
      setLoading(false)
    }
  }

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
                        <Brain className="h-4 w-4" />
                        {message.title}
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
                    
                    {/* Enhanced Feedback System for AI Learning */}
                    {message.role === 'assistant' && message.id && !message.feedbackGiven && message.matchType !== 'learning' && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-sm text-slate-600 mb-2">Help improve AI responses:</div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50 flex items-center gap-1"
                            onClick={() => giveFeedback(message.id!, 5)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Excellent
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50 flex items-center gap-1"
                            onClick={() => giveFeedback(message.id!, 3)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Good
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                            onClick={() => giveFeedback(message.id!, 1)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Needs work
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show feedback received */}
                    {message.feedbackGiven && message.rating && (
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {message.rating >= 4 ? "Feedback received" : "Ty"}
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
            </form>

            {/* AI Training Insights Panel */}
            {showTrainingInsights && (
              <AdminGuard>
                <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Training Insights
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowTrainingInsights(false)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <TrainingInsights />
                </div>
              </AdminGuard>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Enhanced AI • Learning System • Privacy-focused
                </div>
                <AdminGuard fallback={null}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowTrainingInsights(!showTrainingInsights)}
                    className="text-xs"
                  >
                    Training Insights
                  </Button>
                </AdminGuard>
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
