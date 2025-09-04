import React, { useState, useEffect } from 'react'
import { History, MessageCircle, Search, Calendar, Tag, Download, Trash2, Star, TrendingUp, Brain } from 'lucide-react'
import { chatHistoryManager, ChatSession, ChatMessage } from '../lib/chat-history-manager'

interface ChatHistoryProps {
  userId: string
  currentSessionId?: string
  onSessionSelect?: (sessionId: string) => void
  onNewSession?: () => void
}

export function ChatHistory({ userId, currentSessionId, onSessionSelect, onNewSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadSessions()
    loadStats()
  }, [userId, searchQuery, selectedTopic])

  const loadSessions = () => {
    setLoading(true)
    try {
      const userSessions = chatHistoryManager.getUserSessions(userId, {
        topic: selectedTopic || undefined,
        searchQuery: searchQuery || undefined,
        limit: 50
      })
      setSessions(userSessions)
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = () => {
    try {
      const chatStats = chatHistoryManager.getChatStats(userId)
      setStats(chatStats)
    } catch (error) {
      console.error('Failed to load chat stats:', error)
    }
  }

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect?.(sessionId)
    setIsOpen(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      const deleted = await chatHistoryManager.deleteSession(userId, sessionId)
      if (deleted) {
        loadSessions()
        loadStats()
      }
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getTopics = () => {
    const topics = [...new Set(sessions.map(s => s.topic))]
    return topics
  }

  const getPreviewText = (session: ChatSession): string => {
    const lastMessage = session.messages[session.messages.length - 1]
    if (!lastMessage) return 'No messages'
    
    const content = lastMessage.content
    return content.length > 60 ? content.substring(0, 60) + '...' : content
  }

  const getSessionRating = (session: ChatSession): number => {
    const ratedMessages = session.messages.filter(m => m.metadata?.rating)
    if (ratedMessages.length === 0) return 0
    
    const total = ratedMessages.reduce((sum, m) => sum + (m.metadata?.rating || 0), 0)
    return Math.round((total / ratedMessages.length) * 10) / 10
  }

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'text-green-600 bg-green-50'
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50'
    if (rating >= 1) return 'text-red-600 bg-red-50'
    return 'text-gray-400 bg-gray-50'
  }

  return (
    <div className="relative">
      {/* Chat History Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        title="Chat History & Learning Analytics"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
        {sessions.length > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {sessions.length}
          </span>
        )}
        {stats && stats.improvementTrend === 'Improving' && (
          <span title="AI is improving!">
            <TrendingUp className="h-3 w-3 text-green-500" />
          </span>
        )}
      </button>

      {/* Chat History Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Smart Chat History
              </h3>
              <button
                onClick={onNewSession}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                New Chat
              </button>
            </div>

            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white p-2 rounded text-center">
                  <div className="font-semibold text-blue-600">{stats.totalSessions}</div>
                  <div className="text-gray-600">Chats</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="font-semibold text-green-600">★{stats.averageRating}</div>
                  <div className="text-gray-600">Avg Rating</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className={`font-semibold ${
                    stats.improvementTrend === 'Improving' ? 'text-green-600' : 
                    stats.improvementTrend === 'Declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stats.improvementTrend === 'Improving' ? '📈' : 
                     stats.improvementTrend === 'Declining' ? '📉' : '➖'}
                  </div>
                  <div className="text-gray-600">Trend</div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {getTopics().map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Sessions List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <Brain className="h-6 w-6 mx-auto animate-pulse mb-2" />
                Loading conversations...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {searchQuery || selectedTopic ? 'No matching conversations' : 'No conversations yet'}
                <div className="text-xs mt-1">Start chatting to build your AI memory!</div>
              </div>
            ) : (
              sessions.map(session => {
                const sessionRating = getSessionRating(session)
                
                return (
                  <div
                    key={session.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentSessionId === session.id ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate flex-1">{session.title}</h4>
                          {currentSessionId === session.id && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Active
                            </span>
                          )}
                          {sessionRating > 0 && (
                            <span className={`text-xs px-2 py-1 rounded ${getRatingColor(sessionRating)}`}>
                              ★{sessionRating}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{getPreviewText(session)}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {session.messages.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {session.topic}
                          </span>
                        </div>

                        {/* Tags */}
                        {session.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {session.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session.id)
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 ml-2"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {sessions.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{sessions.length} conversations • AI learning enabled</span>
                <button
                  onClick={async () => {
                    try {
                      const data = await chatHistoryManager.exportUserData(userId)
                      const blob = new Blob([data], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `chat-history-${userId}-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    } catch (error) {
                      console.error('Export failed:', error)
                    }
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Export
                </button>
              </div>
              
              {stats && (
                <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                  <div className="flex justify-between">
                    <span>Topics: {stats.topicsDiscussed.length}</span>
                    <span className={`font-medium ${
                      stats.improvementTrend === 'Improving' ? 'text-green-600' : 
                      stats.improvementTrend === 'Declining' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      AI is {stats.improvementTrend.toLowerCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatHistory
