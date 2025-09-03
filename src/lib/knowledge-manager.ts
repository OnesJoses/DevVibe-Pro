// Simple browser-compatible knowledge manager
import { LocalFileKnowledge } from './local-file-knowledge'

export class KnowledgeManager {
  private localKnowledge: LocalFileKnowledge

  constructor() {
    this.localKnowledge = new LocalFileKnowledge()
  }

  async init() {
    await this.localKnowledge.initialize()
    console.log('🤖 AI Knowledge System Ready!')
    console.log('📁 Knowledge stored in browser storage')
    return this.localKnowledge.getStats()
  }

  async addKnowledge(data: {
    title: string
    content: string
    category: 'services' | 'technical' | 'business' | 'projects' | 'user-questions'
    tags?: string[]
  }) {
    const id = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    
    return await this.localKnowledge.saveKnowledgeEntry({
      id,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags
    })
  }

  async updateKnowledge(id: string, updates: any) {
    return await this.localKnowledge.updateKnowledge(id, updates)
  }

  async deleteKnowledge(id: string) {
    return await this.localKnowledge.deleteKnowledge(id)
  }

  async trainFromChat(question: string, goodAnswer: string, category = 'user-questions') {
    return await this.localKnowledge.addKnowledgeFromConversation(
      question,
      goodAnswer,
      category,
      true
    )
  }

  async giveFeedback(
    question: string,
    aiAnswer: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback?: string
  ) {
    await this.localKnowledge.saveUserFeedback(question, aiAnswer, rating, feedback)
    
    console.log(`📝 Feedback saved: ${rating}/5 stars`)
    
    if (rating >= 4) {
      console.log('✅ Good rating! Adding to knowledge base...')
      await this.trainFromChat(question, aiAnswer, 'user-approved')
    }
    
    return rating >= 4
  }

  async search(query: string, category?: string) {
    return await this.localKnowledge.search(query, { category, maxResults: 10 })
  }

  getKnowledgeByCategory(category: string) {
    return this.localKnowledge.getEntriesByCategory(category)
  }

  getMostUsedKnowledge(limit = 10) {
    return this.localKnowledge.getMostUsedEntries(limit)
  }

  getRecentKnowledge(limit = 10) {
    return this.localKnowledge.getRecentlyUpdated(limit)
  }

  getStats() {
    return this.localKnowledge.getStats()
  }

  async backup() {
    return await this.localKnowledge.exportKnowledge()
  }

  async restore(fileContent: string) {
    return await this.localKnowledge.importKnowledge(fileContent)
  }

  async trainFromAllConversations() {
    return await this.localKnowledge.trainFromConversations()
  }
}

export const myAI = new KnowledgeManager()
