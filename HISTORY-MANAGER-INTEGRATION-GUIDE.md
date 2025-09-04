# 🧠 History Manager Integration Guide

## Quick Start - Integrate with Your Existing Chat System

### 1. Import the History Manager

```typescript
// In your chat component or AI service
import { historyManager, type ConversationMemory } from './src/lib/history-manager'

// Optional: Import the enhanced AI system that already includes memory
import { EnhancedIntelligentAI } from './src/lib/enhanced-intelligent-ai'
```

### 2. Basic Integration Pattern

```typescript
// Example: Integrating with your existing chat system
class YourChatSystem {
  private ai = new EnhancedIntelligentAI()

  async handleUserMessage(userMessage: string): Promise<{
    response: string
    conversationId: string
    confidence: number
  }> {
    const startTime = Date.now()
    
    // 1. Process the query with your existing AI
    const aiResponse = await this.ai.processQuery(userMessage)
    const responseTime = Date.now() - startTime
    
    // 2. Store the conversation in memory for learning
    const conversationId = await historyManager.storeConversation(
      userMessage,
      aiResponse.answer,
      {
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        responseTime: responseTime
      }
    )
    
    return {
      response: aiResponse.answer,
      conversationId,
      confidence: aiResponse.confidence
    }
  }

  // Handle user feedback for continuous learning
  async handleUserFeedback(conversationId: string, rating: number, comments?: string) {
    await historyManager.recordFeedback(conversationId, rating, comments)
    console.log(`✅ AI learned from feedback: ${rating}/5`)
  }

  // Get similar conversations for context
  async getSimilarConversations(query: string) {
    return await historyManager.findSimilarConversations(query, 5)
  }
}
```

### 3. React Component Integration

```tsx
// Example React component with memory integration
import React, { useState, useEffect } from 'react'
import { historyManager } from './lib/history-manager'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: number
  conversationId?: string
  confidence?: number
}

export function MemoryEnabledChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [memoryStats, setMemoryStats] = useState(null)

  // Load memory stats on component mount
  useEffect(() => {
    loadMemoryStats()
  }, [])

  const loadMemoryStats = async () => {
    const stats = historyManager.getMemoryStatus()
    const insights = await historyManager.getMemoryInsights()
    setMemoryStats({ ...stats, ...insights })
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])

    // Clear input
    setInput('')

    try {
      // Generate AI response (replace with your AI logic)
      const aiResponse = await generateAIResponse(input)
      
      // Store in memory
      const conversationId = await historyManager.storeConversation(
        input,
        aiResponse.text,
        {
          confidence: aiResponse.confidence,
          sources: ['chat'],
          responseTime: aiResponse.responseTime
        }
      )

      // Add AI message
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: aiResponse.text,
        sender: 'ai',
        timestamp: Date.now(),
        conversationId,
        confidence: aiResponse.confidence
      }
      setMessages(prev => [...prev, aiMessage])

      // Update memory stats
      loadMemoryStats()

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFeedback = async (conversationId: string, rating: number) => {
    await historyManager.recordFeedback(conversationId, rating)
    console.log(`Feedback recorded: ${rating}/5`)
    loadMemoryStats() // Refresh stats
  }

  return (
    <div className="memory-enabled-chat">
      {/* Memory Status Bar */}
      {memoryStats && (
        <div className="memory-status">
          <span>💾 {memoryStats.cacheSize} conversations</span>
          <span>📊 {memoryStats.cacheHitRate.toFixed(1)}% hit rate</span>
          <span>🧠 {memoryStats.memoryUsage} usage</span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-text">{message.text}</div>
            <div className="message-meta">
              {message.confidence && (
                <span>Confidence: {(message.confidence * 100).toFixed(1)}%</span>
              )}
              {message.conversationId && message.sender === 'ai' && (
                <div className="feedback-buttons">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFeedback(message.conversationId!, rating)}
                      className="feedback-btn"
                    >
                      {rating}⭐
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything... I'll remember our conversation!"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

// Mock AI response function - replace with your actual AI
async function generateAIResponse(input: string) {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    text: `I understand you're asking about: ${input}. Let me help you with that!`,
    confidence: 0.8 + Math.random() * 0.2,
    responseTime: 1000 + Math.random() * 500
  }
}
```

### 4. Admin Dashboard Integration

```tsx
// Admin component for memory insights
import React, { useState, useEffect } from 'react'
import { historyManager } from './lib/history-manager'

export function MemoryDashboard() {
  const [insights, setInsights] = useState(null)
  const [clusters, setClusters] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const [insightsData, clustersData] = await Promise.all([
      historyManager.getMemoryInsights(),
      historyManager.getConversationClusters()
    ])
    setInsights(insightsData)
    setClusters(clustersData)
  }

  const optimizeMemory = async () => {
    const result = await historyManager.optimizeMemory()
    console.log('Memory optimized:', result)
    loadDashboardData() // Refresh data
  }

  const exportData = async (format: 'json' | 'csv') => {
    const data = await historyManager.exportConversationHistory(format)
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversations.${format}`
    a.click()
  }

  if (!insights) return <div>Loading memory insights...</div>

  return (
    <div className="memory-dashboard">
      <h2>🧠 AI Memory Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Conversations</h3>
          <div className="metric-value">{insights.totalConversations}</div>
        </div>
        <div className="metric-card">
          <h3>Average Confidence</h3>
          <div className="metric-value">{(insights.averageConfidence * 100).toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <h3>Memory Health</h3>
          <div className="metric-value">{insights.memoryHealth.status}</div>
        </div>
        <div className="metric-card">
          <h3>Cache Hit Rate</h3>
          <div className="metric-value">{insights.performanceMetrics.cacheHitRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Top Topics */}
      <div className="topics-section">
        <h3>🏆 Top Conversation Topics</h3>
        {insights.topTopics.slice(0, 5).map((topic, i) => (
          <div key={i} className="topic-item">
            <span>{topic.topic}</span>
            <span>{topic.count} conversations</span>
          </div>
        ))}
      </div>

      {/* Conversation Clusters */}
      <div className="clusters-section">
        <h3>📊 Conversation Clusters</h3>
        {clusters.slice(0, 5).map((cluster, i) => (
          <div key={i} className="cluster-item">
            <h4>{cluster.topic}</h4>
            <p>
              {cluster.totalInteractions} conversations • 
              Importance: {(cluster.importance * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="actions-section">
        <button onClick={optimizeMemory} className="action-btn">
          🧹 Optimize Memory
        </button>
        <button onClick={() => exportData('json')} className="action-btn">
          📄 Export JSON
        </button>
        <button onClick={() => exportData('csv')} className="action-btn">
          📊 Export CSV
        </button>
      </div>
    </div>
  )
}
```

### 5. Advanced Usage - Smart Context Retrieval

```typescript
// Use memory for intelligent context in responses
class SmartChatBot {
  async generateContextualResponse(userQuery: string) {
    // 1. Find similar past conversations for context
    const similarConversations = await historyManager.findSimilarConversations(userQuery, 3)
    
    // 2. Extract context from similar conversations
    const context = similarConversations.map(conv => ({
      question: conv.question,
      answer: conv.answer,
      confidence: conv.metadata.confidence
    }))

    // 3. Generate response using context
    const response = await this.generateResponseWithContext(userQuery, context)
    
    // 4. Store new conversation
    const conversationId = await historyManager.storeConversation(
      userQuery,
      response.answer,
      {
        confidence: response.confidence,
        sources: ['context', ...response.sources],
        responseTime: response.responseTime
      }
    )

    return {
      ...response,
      conversationId,
      usedContext: context.length > 0,
      contextSources: context.length
    }
  }

  private async generateResponseWithContext(query: string, context: any[]) {
    // Your AI logic here - use context to improve responses
    // This is where you'd integrate with your existing AI system
    
    const hasRelevantContext = context.length > 0
    const baseResponse = await this.generateBaseResponse(query)
    
    if (hasRelevantContext) {
      // Enhance response with context
      return {
        answer: `Based on our previous conversations, ${baseResponse.answer}`,
        confidence: Math.min(baseResponse.confidence + 0.1, 1.0), // Boost confidence
        sources: ['memory', ...baseResponse.sources],
        responseTime: baseResponse.responseTime
      }
    }

    return baseResponse
  }
}
```

## 🚀 Integration Checklist

- [ ] Import `historyManager` in your chat system
- [ ] Call `storeConversation()` after each AI response
- [ ] Implement feedback system with `recordFeedback()`
- [ ] Add memory status display in your UI
- [ ] Create admin dashboard for memory insights
- [ ] Set up automatic memory optimization
- [ ] Add conversation export functionality
- [ ] Test memory persistence across browser sessions

## 🎯 Benefits You'll Get

### For Users:
- **Smarter AI** that remembers past conversations
- **Faster responses** using cached knowledge
- **Better answers** based on learned context
- **Personalized experience** that improves over time

### For Admins:
- **Real-time analytics** on AI performance
- **Memory usage monitoring** and optimization
- **Conversation insights** and trending topics
- **Export capabilities** for data analysis

## 🔧 Configuration Options

```typescript
// Optional: Configure history manager behavior
const customHistoryManager = new HistoryManager({
  maxCacheSize: 1000,        // Max conversations in memory
  cleanupInterval: 3600000,  // Cleanup every hour
  maxStorageDays: 90,        // Keep data for 90 days
  confidenceThreshold: 0.5   // Min confidence for storage
})
```

The History Manager is now ready to supercharge your AI with persistent memory and continuous learning! 🧠✨
