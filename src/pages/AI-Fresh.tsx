import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Brain, Send, Code, Globe, Palette, BookOpen, HelpCircle, Lightbulb, Loader2, Zap, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { freshAI } from '../lib/fresh-ai-system'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id?: string
  title?: string
  matchType?: string
  rating?: number
  feedbackGiven?: boolean
}

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize stats
    setStats(freshAI.getStats())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      id: Date.now().toString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      console.log('🆕 Fresh AI processing:', userMessage.content)
      
      const result = await freshAI.generateResponse(userMessage.content)
      
      console.log('✅ Fresh AI result:', result)

      const assistantMessage: Message = {
        role: 'assistant',
        content: result.answer,
        id: (Date.now() + 1).toString(),
        title: result.source === 'excellent_response' ? 
          '⭐ Excellent Response (5-star rated)' :
          result.source === 'knowledge_base' ? 
          `📚 Knowledge Base • ${result.confidence}% confidence` :
          `🆕 Fresh Response • ${result.confidence}% confidence`,
        matchType: result.source,
        feedbackGiven: false
      }

      setMessages(prev => [...prev, assistantMessage])
      setStats(freshAI.getStats())

    } catch (error) {
      console.error('❌ Fresh AI error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an issue processing your question. Please try rephrasing your question or ask about my services and expertise.',
        id: (Date.now() + 1).toString(),
        title: 'Error Response',
        matchType: 'error',
        feedbackGiven: false
      }])
    } finally {
      setLoading(false)
    }
  }

  const giveFeedback = (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const userMessage = prev.find(m => m.role === 'user' && prev.indexOf(m) === prev.indexOf(msg) - 1)
        
        if (userMessage) {
          const result = freshAI.saveFeedback(
            userMessage.content,
            msg.content,
            rating
          )
          
          console.log('📝 Fresh AI feedback processed:', result)
        }
        
        return {
          ...msg,
          rating,
          feedbackGiven: true
        }
      }
      return msg
    }))
    
    // Show fresh AI learning notifications
    if (rating === 5) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          id: Date.now().toString(),
          content: "🌟 EXCELLENT! This response has been saved in the fresh AI system and will be used to help all future users with similar questions! 🎯✨",
          title: 'Fresh AI Learning - Excellent Response Saved',
          matchType: 'learning',
          feedbackGiven: true
        }])
      }, 500)
    } else if (rating === 4) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          id: Date.now().toString(),
          content: "🎉 Great! I learned from this conversation and added it to my fresh knowledge base! 🧠✨",
          title: 'Fresh AI Learning - Knowledge Added',
          matchType: 'learning',
          feedbackGiven: true
        }])
      }, 500)
    } else if (rating <= 2) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          id: Date.now().toString(),
          content: "🚫 Got it! I've permanently BLOCKED this response in the fresh AI system. I will NEVER repeat this exact answer again, guaranteed! 🔒",
          title: 'Fresh AI Learning - Response PERMANENTLY BLOCKED',
          matchType: 'learning',
          feedbackGiven: true
        }])
      }, 500)
    }
  }

  const quickActions = useMemo(() => [
    { icon: <Code className="h-4 w-4" />, text: 'What services do you offer?', category: 'Services', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { icon: <Palette className="h-4 w-4" />, text: 'How much does a custom web app cost?', category: 'Pricing', color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { icon: <Globe className="h-4 w-4" />, text: 'What is web development?', category: 'Knowledge', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
    { icon: <HelpCircle className="h-4 w-4" />, text: 'How do we get started working together?', category: 'Process', color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
    { icon: <BookOpen className="h-4 w-4" />, text: 'Tell me about your experience', category: 'Background', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { icon: <Lightbulb className="h-4 w-4" />, text: 'What technologies do you use?', category: 'Technical', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' }
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
                <CardTitle className="text-xl font-bold">Fresh AI Assistant</CardTitle>
                <CardDescription className="text-blue-100">
                  Zero tolerance for bad responses • Learns from your feedback
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  freshAI.clearAllData()
                  setMessages([])
                  setStats(freshAI.getStats())
                  console.log('🗑️ Fresh AI system reset - all data cleared')
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                🗑️ Reset AI
              </Button>
              {stats && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Zap className="h-3 w-3 mr-1" />
                  {stats.conversations} conversations
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Messages Area */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto border rounded-lg p-4 bg-gradient-to-b from-white to-slate-50">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Fresh AI Assistant Ready</p>
                  <p className="text-sm">Ask me anything! I learn from your feedback and never repeat bad responses.</p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.matchType === 'learning'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' && message.title && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-600">
                        {message.title}
                      </div>
                    )}
                    
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: (props: any) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                          ),
                          strong: (props: any) => <strong className="font-semibold" {...props} />,
                          ul: (props: any) => <ul className="list-disc pl-5 my-2" {...props} />,
                          li: (props: any) => <li className="mb-1" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Rating Buttons */}
                    {message.role === 'assistant' && message.matchType !== 'learning' && !message.feedbackGiven && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">📚 Help me learn - Rate this response:</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => giveFeedback(message.id!, 5)}
                            className="text-xs py-1 px-2 h-auto"
                          >
                            😊 Perfect! (Saves for all users)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => giveFeedback(message.id!, 4)}
                            className="text-xs py-1 px-2 h-auto"
                          >
                            👍 Good (Will learn from this)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => giveFeedback(message.id!, 1)}
                            className="text-xs py-1 px-2 h-auto"
                          >
                            😞 Not helpful (Won't repeat)
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show rating if given */}
                    {message.rating && (
                      <div className="mt-2 text-xs text-gray-500">
                        Rating: {message.rating}/5 ⭐
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Fresh AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about my services, web development, or anything else..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  className="px-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Thinking
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Quick Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
            </div>

            {/* Stats */}
            {stats && (
              <div className="text-center text-xs text-gray-500 pt-4 border-t">
                Fresh AI Stats: {stats.conversations} conversations • {stats.excellent} excellent responses • {stats.blocked} blocked responses
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
