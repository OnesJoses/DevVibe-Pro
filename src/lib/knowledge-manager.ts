import { LocalFileKnowledge } from './local-file-knowledge'

/**
 * Knowledge Management Interface
 * Easy commands to manage your local AI knowledge
 */
export class KnowledgeManager {
  private localKnowledge: LocalFileKnowledge

  constructor(knowledgeDir = './my-ai-knowledge') {
    this.localKnowledge = new LocalFileKnowledge(knowledgeDir)
  }

  /**
   * Initialize the knowledge system
   */
  async init() {
    await this.localKnowledge.initialize()
    console.log('🤖 AI Knowledge System Ready!')
    console.log('📁 Knowledge stored in: ./my-ai-knowledge/')
    return this.localKnowledge.getStats()
  }

  /**
   * Add new knowledge manually
   */
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

  /**
   * Update existing knowledge
   */
  async updateKnowledge(id: string, updates: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
  }) {
    return await this.localKnowledge.updateKnowledge(id, updates)
  }

  /**
   * Delete knowledge entry
   */
  async deleteKnowledge(id: string) {
    return await this.localKnowledge.deleteKnowledge(id)
  }

  /**
   * Train AI from a conversation
   */
  async trainFromChat(question: string, goodAnswer: string, category = 'user-questions') {
    return await this.localKnowledge.addKnowledgeFromConversation(
      question,
      goodAnswer,
      category,
      true
    )
  }

  /**
   * Give feedback on AI response
   */
  async giveFeedback(
    question: string,
    aiAnswer: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback?: string
  ) {
    await this.localKnowledge.saveUserFeedback(question, aiAnswer, rating, feedback)
    
    console.log(`📝 Feedback saved: ${rating}/5 stars`)
    
    // If rating is good (4-5), automatically add to knowledge base
    if (rating >= 4) {
      console.log('✅ Good rating! Adding to knowledge base...')
      await this.trainFromChat(question, aiAnswer, 'user-approved')
    }
    
    return rating >= 4
  }

  /**
   * Search your local knowledge
   */
  async search(query: string, category?: string) {
    return await this.localKnowledge.search(query, { category, maxResults: 10 })
  }

  /**
   * Get knowledge by category
   */
  getKnowledgeByCategory(category: string) {
    return this.localKnowledge.getEntriesByCategory(category)
  }

  /**
   * Get most used knowledge entries
   */
  getMostUsedKnowledge(limit = 10) {
    return this.localKnowledge.getMostUsedEntries(limit)
  }

  /**
   * Get recently updated knowledge
   */
  getRecentKnowledge(limit = 10) {
    return this.localKnowledge.getRecentlyUpdated(limit)
  }

  /**
   * Get knowledge statistics
   */
  getStats() {
    return this.localKnowledge.getStats()
  }

  /**
   * Create backup of all knowledge
   */
  async backup() {
    return await this.localKnowledge.exportKnowledge()
  }

  /**
   * Restore from backup
   */
  async restore(backupFile: string) {
    return await this.localKnowledge.importKnowledge(backupFile)
  }

  /**
   * Train from all saved conversations
   */
  async trainFromAllConversations() {
    return await this.localKnowledge.trainFromConversations()
  }

  /**
   * Bulk add knowledge from array
   */
  async bulkAddKnowledge(entries: Array<{
    title: string
    content: string
    category: 'services' | 'technical' | 'business' | 'projects' | 'user-questions'
    tags?: string[]
  }>) {
    const results = []
    
    for (const entry of entries) {
      try {
        const result = await this.addKnowledge(entry)
        results.push({ success: true, entry: result })
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error', entry })
      }
    }
    
    const successful = results.filter(r => r.success).length
    console.log(`📚 Bulk import completed: ${successful}/${entries.length} entries added`)
    
    return results
  }

  /**
   * Export knowledge as readable text files
   */
  async exportAsText() {
    const stats = this.getStats()
    const exportDir = './knowledge-export-' + Date.now()
    
    const fs = require('fs')
    fs.mkdirSync(exportDir, { recursive: true })
    
    for (const category of Object.keys(stats.categories)) {
      const entries = this.getKnowledgeByCategory(category)
      let content = `# ${category.toUpperCase()} KNOWLEDGE\n\n`
      
      entries.forEach(entry => {
        content += `## ${entry.title}\n\n`
        content += `${entry.content}\n\n`
        content += `**Keywords:** ${entry.keywords.join(', ')}\n\n`
        content += `**Last Updated:** ${entry.metadata.lastUpdated}\n\n`
        content += '---\n\n'
      })
      
      const fileName = `${category}-knowledge.md`
      fs.writeFileSync(`${exportDir}/${fileName}`, content)
    }
    
    console.log(`📄 Text export completed in: ${exportDir}`)
    return exportDir
  }

  /**
   * Simple CLI interface
   */
  async cli() {
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log('\n🤖 AI Knowledge Manager CLI')
    console.log('================================')
    
    const stats = await this.init()
    console.log(`📊 Current Stats:`, stats)
    
    while (true) {
      console.log('\nCommands:')
      console.log('1. search <query> - Search knowledge')
      console.log('2. add - Add new knowledge')
      console.log('3. train <question> <answer> - Train from conversation')
      console.log('4. stats - Show statistics')
      console.log('5. backup - Create backup')
      console.log('6. exit - Exit CLI')
      
      const input = await this.askQuestion(rl, '\nEnter command: ')
      const [command, ...args] = input.split(' ')
      
      try {
        switch (command) {
          case '1':
          case 'search':
            const query = args.join(' ') || await this.askQuestion(rl, 'Search query: ')
            const results = await this.search(query)
            console.log(`\n🔍 Found ${results.length} results:`)
            results.forEach((r, i) => {
              console.log(`${i + 1}. ${r.entry.title} (${(r.relevance * 100).toFixed(1)}%)`)
              console.log(`   ${r.entry.content.substring(0, 100)}...`)
            })
            break
            
          case '2':
          case 'add':
            const title = await this.askQuestion(rl, 'Title: ')
            const content = await this.askQuestion(rl, 'Content: ')
            const category = await this.askQuestion(rl, 'Category (services/technical/business/projects): ')
            await this.addKnowledge({ title, content, category: category as any })
            console.log('✅ Knowledge added!')
            break
            
          case '3':
          case 'train':
            const question = args.length > 0 ? args.join(' ') : await this.askQuestion(rl, 'Question: ')
            const answer = await this.askQuestion(rl, 'Good answer: ')
            await this.trainFromChat(question, answer)
            console.log('✅ Training data added!')
            break
            
          case '4':
          case 'stats':
            console.log('\n📊 Knowledge Statistics:')
            console.log(JSON.stringify(this.getStats(), null, 2))
            break
            
          case '5':
          case 'backup':
            const backupFile = await this.backup()
            console.log(`✅ Backup created: ${backupFile}`)
            break
            
          case '6':
          case 'exit':
            console.log('👋 Goodbye!')
            rl.close()
            return
            
          default:
            console.log('❌ Unknown command')
        }
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  private askQuestion(rl: any, question: string): Promise<string> {
    return new Promise(resolve => {
      rl.question(question, resolve)
    })
  }
}

// Easy-to-use instance
export const myAI = new KnowledgeManager()

// Export for direct use
export default KnowledgeManager
