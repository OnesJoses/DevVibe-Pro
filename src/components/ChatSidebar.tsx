import React, { useState, useEffect } from 'react'
import { MessageCircle, Search, Plus, Calendar, Tag, Trash2, X } from 'lucide-react'
import { chatHistoryManager, ChatSession } from '../lib/chat-history-manager'

interface ChatSidebarProps {
  userId: string
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewSession: () => void
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({ 
  userId, 
  currentSessionId, 
  onSessionSelect, 
  onNewSession, 
  isOpen, 
  onToggle 
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [userId, searchQuery, selectedTopic])

  const loadSessions = () => {
    setLoading(true)
    try {
      const userSessions = chatHistoryManager.getUserSessions(userId, {
        topic: selectedTopic || undefined,
        searchQuery: searchQuery || undefined,
        limit: 100
      })
      setSessions(userSessions)
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onToggle()
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatHistoryManager.deleteSession(userId, sessionId)
        loadSessions()
        
        // If we deleted the current session, start a new one
        if (sessionId === currentSessionId) {
          onNewSession()
        }
      } catch (error) {
        console.error('Failed to delete session:', error)
        alert('Failed to delete conversation. Please try again.')
      }
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getTopics = () => {
    const topics = [...new Set(sessions.map(s => s.topic))]
    return topics
  }

  const getPreviewText = (session: ChatSession): string => {
    const lastUserMessage = session.messages.filter(m => m.role === 'user').pop()
    if (!lastUserMessage) return 'No messages'
    
    const content = lastUserMessage.content
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {}
    
    sessions.forEach(session => {
      const date = session.updatedAt
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      let groupKey = ''
      if (diffDays === 0) groupKey = 'Today'
      else if (diffDays === 1) groupKey = 'Yesterday'
      else if (diffDays < 7) groupKey = 'This Week'
      else if (diffDays < 30) groupKey = 'This Month'
      else groupKey = 'Older'
      
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(session)
    })
    
    return groups
  }

  const sessionGroups = groupSessionsByDate(sessions)
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-80 shadow-lg`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Chats
            </h2>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
              title="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewSession()
              if (window.innerWidth < 768) onToggle()
            }}
            className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Topic Filter */}
          {getTopics().length > 1 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Topics</option>
              {getTopics().map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Loading conversations...
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              {searchQuery || selectedTopic ? 'No matching conversations' : 'No conversations yet'}
              <div className="text-xs mt-1">Start chatting to build your history!</div>
            </div>
          ) : (
            Object.entries(sessionGroups)
              .filter(([group]) => groupOrder.includes(group))
              .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
              .map(([group, groupSessions]) => (
                <div key={group}>
                  {/* Group Header */}
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {group}
                  </div>
                  
                  {/* Group Sessions */}
                  {groupSessions.map(session => (
                    <div
                      key={session.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                        currentSessionId === session.id 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{session.title}</h4>
                            {currentSessionId === session.id && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="Active session"></div>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 overflow-hidden"
                             style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {getPreviewText(session)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(session.updatedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {session.messages.length}
                            </span>
                          </div>

                          {/* Topic Tag */}
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              <Tag className="h-3 w-3" />
                              {session.topic}
                            </span>
                          </div>
                        </div>

                        <div className="ml-2 flex flex-col gap-1">
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          )}
        </div>

        {/* Footer Stats */}
        {sessions.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600 text-center">
              {sessions.length} conversations • {sessions.reduce((sum, s) => sum + s.messages.length, 0)} messages
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}

export default ChatSidebar
