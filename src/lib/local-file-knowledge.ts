import fs from 'fs'
import path from 'path'
import { KnowledgeEntry, SearchResult, LocalTextEmbedding, extractKeywords, cosineSimilarity } from './ai-utils'

/**
 * Local File-Based Knowledge System
 * Stores all knowledge in local folders on your computer
 */
export class LocalFileKnowledge {
  private knowledgeDir: string
  private trainingDir: string
  private embedding: LocalTextEmbedding
  private entries: Map<string, KnowledgeEntry> = new Map()
  private isInitialized = false

  constructor(baseDir = './my-ai-knowledge') {
    this.knowledgeDir = path.join(baseDir, 'knowledge')
    this.trainingDir = path.join(baseDir, 'training')
    this.embedding = new LocalTextEmbedding()
    this.ensureDirectories()
  }

  /**
   * Create necessary directories
   */
  private ensureDirectories() {
    const dirs = [
      this.knowledgeDir,
      this.trainingDir,
      path.join(this.knowledgeDir, 'services'),
      path.join(this.knowledgeDir, 'technical'),
      path.join(this.knowledgeDir, 'business'),
      path.join(this.knowledgeDir, 'projects'),
      path.join(this.knowledgeDir, 'user-questions'),
      path.join(this.trainingDir, 'conversations'),
      path.join(this.trainingDir, 'feedback'),
      path.join(this.trainingDir, 'backups')
    ]

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
      }
    })
  }

  /**
   * Initialize and load all knowledge from files
   */
  async initialize() {
    if (this.isInitialized) return

    console.log('📚 Loading knowledge from local files...')
    
    // Load existing knowledge files
    await this.loadKnowledgeFromFiles()
    
    // If no files exist, create initial knowledge base
    if (this.entries.size === 0) {
      await this.createInitialKnowledge()
    }

    this.isInitialized = true
    console.log(`✅ Local knowledge loaded: ${this.entries.size} entries`)
  }

  /**
   * Load knowledge from JSON files
   */
  private async loadKnowledgeFromFiles() {
    const categories = ['services', 'technical', 'business', 'projects', 'user-questions']
    
    for (const category of categories) {
      const categoryDir = path.join(this.knowledgeDir, category)
      
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir)
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(categoryDir, file)
            try {
              const content = fs.readFileSync(filePath, 'utf-8')
              const entry: KnowledgeEntry = JSON.parse(content)
              
              // Regenerate embedding if missing
              if (!entry.embedding) {
                entry.embedding = this.embedding.createEmbedding(entry.content)
              }
              
              this.entries.set(entry.id, entry)
              console.log(`📄 Loaded: ${entry.title}`)
            } catch (error) {
              console.error(`❌ Error loading ${file}:`, error)
            }
          }
        }
      }
    }
  }

  /**
   * Create initial knowledge files
   */
  private async createInitialKnowledge() {
    const initialEntries = [
      {
        id: 'services-quick-overview',
        title: 'What Services Do I Offer?',
        category: 'services',
        content: `I specialize in building digital solutions that drive business results:

🛒 **E-Commerce Stores** - Complete online stores with payment processing
💼 **Business Apps** - CRM, HR, and management systems 
🚀 **SaaS Platforms** - Subscription-based software solutions
🌟 **Professional Websites** - Fast, conversion-focused sites
💡 **Custom Development** - Tailored solutions for unique needs

**Starting from $2,500** | **2-8 week delivery** | **3 months free support**

*Need details about a specific service? Just ask!*`,
        tags: ['services', 'offerings', 'solutions', 'pricing']
      },
      {
        id: 'pricing-guide',
        title: 'How Much Does a Project Cost?',
        category: 'business',
        content: `**Investment Levels Based on Project Complexity:**

🚀 **Simple Projects: $2,500 - $7,500**
• Business websites, basic web apps
• 2-3 weeks delivery
• Perfect for startups and small businesses

💼 **Business Solutions: $7,500 - $20,000**
• E-commerce stores, CRM systems, business apps
• 4-8 weeks delivery
• Best for established businesses ready to scale

🏢 **Enterprise Solutions: $20,000+**
• Complex SaaS platforms, large-scale systems
• 8-16 weeks delivery
• For businesses requiring advanced features

**What's Included:**
✅ Unlimited revisions until you're 100% satisfied
✅ 3 months free support after launch
✅ Mobile optimization and SEO setup
✅ Secure hosting and deployment

**Ready to get started?** Schedule a free discovery call to get exact pricing for your project.`,
        tags: ['pricing', 'cost', 'investment', 'payment', 'packages']
      },
      {
        id: 'getting-started-process',
        title: 'How Do I Get Started?',
        category: 'business',
        content: `**Ready to transform your business? Here's how we begin:**

**Step 1: Free Discovery Call (30 minutes)**
• We discuss your business goals and challenges
• I'll show you exactly what's possible for your project
• You'll get a clear understanding of timeline and investment
• **Schedule:** Usually available within 24 hours

**Step 2: Custom Proposal (2-3 days)**
• Detailed proposal tailored to your specific needs
• Fixed pricing with no hidden fees
• Complete project timeline and milestones
• **Guarantee:** No surprises, transparent pricing

**Step 3: Project Kickoff**
• 50% deposit to secure your project slot
• Detailed planning and requirement gathering
• UI/UX design concepts and mockups
• Development begins immediately

**Contact Options:**
📧 Email for detailed questions
📞 Phone/video call for immediate discussion
💬 Live chat for quick questions

**Next Step:** Schedule your free discovery call to discuss your project and get exact pricing.`,
        tags: ['getting started', 'process', 'timeline', 'consultation', 'contact']
      }
    ]

    for (const entry of initialEntries) {
      await this.saveKnowledgeEntry(entry)
    }
  }

  /**
   * Save knowledge entry to file
   */
  async saveKnowledgeEntry(data: {
    id: string
    title: string
    category: string
    content: string
    tags?: string[]
  }) {
    const entry: KnowledgeEntry = {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      keywords: data.tags || extractKeywords(data.content),
      embedding: this.embedding.createEmbedding(data.content),
      metadata: {
        lastUpdated: new Date().toISOString(),
        confidence: 1.0,
        sourceType: 'file',
        usage_count: 0,
        filePath: path.join(this.knowledgeDir, data.category, `${data.id}.json`)
      }
    }

    // Ensure category directory exists
    const categoryDir = path.join(this.knowledgeDir, data.category)
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
    }

    // Save to file
    const filePath = path.join(this.knowledgeDir, data.category, `${data.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2))
    
    // Add to memory
    this.entries.set(entry.id, entry)
    
    console.log(`💾 Saved knowledge: ${entry.title}`)
    return entry
  }

  /**
   * Add new knowledge from conversation
   */
  async addKnowledgeFromConversation(
    question: string,
    answer: string,
    category: string,
    isGoodResponse = true
  ) {
    const id = `conv-${Date.now()}`
    const entry = {
      id,
      title: question,
      category,
      content: answer,
      tags: extractKeywords(question + ' ' + answer)
    }

    await this.saveKnowledgeEntry(entry)
    
    // Also save conversation for training
    await this.saveConversation(question, answer, isGoodResponse)
    
    return entry
  }

  /**
   * Save conversation for training
   */
  async saveConversation(question: string, answer: string, isGoodResponse: boolean) {
    const conversation = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      isGoodResponse,
      feedback: isGoodResponse ? 'positive' : 'negative',
      source: 'conversation'
    }

    const fileName = `conv-${Date.now()}.json`
    const filePath = path.join(this.trainingDir, 'conversations', fileName)
    
    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2))
    console.log(`💬 Saved conversation: ${fileName}`)
  }

  /**
   * Save user feedback for training
   */
  async saveUserFeedback(
    question: string,
    answer: string,
    rating: number,
    feedback?: string
  ) {
    const feedbackData = {
      timestamp: new Date().toISOString(),
      question,
      answer,
      rating, // 1-5 scale
      feedback,
      source: 'user_feedback'
    }

    const fileName = `feedback-${Date.now()}.json`
    const filePath = path.join(this.trainingDir, 'feedback', fileName)
    
    fs.writeFileSync(filePath, JSON.stringify(feedbackData, null, 2))
    console.log(`⭐ Saved feedback: Rating ${rating}/5`)
    
    // If good rating, add to knowledge base
    if (rating >= 4) {
      await this.addKnowledgeFromConversation(question, answer, 'user-approved', true)
    }
  }

  /**
   * Train on local conversations
   */
  async trainFromConversations() {
    const conversationsDir = path.join(this.trainingDir, 'conversations')
    
    if (!fs.existsSync(conversationsDir)) return 0
    
    const files = fs.readdirSync(conversationsDir)
    let trainedCount = 0
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(conversationsDir, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          const conversation = JSON.parse(content)
          
          // Only train on good responses
          if (conversation.isGoodResponse) {
            await this.addKnowledgeFromConversation(
              conversation.question,
              conversation.answer,
              'user-questions',
              true
            )
            trainedCount++
          }
        } catch (error) {
          console.error(`❌ Error training from ${file}:`, error)
        }
      }
    }
    
    console.log(`🎓 Trained on ${trainedCount} conversations`)
    return trainedCount
  }

  /**
   * Search local knowledge
   */
  async search(query: string, options: {
    category?: string
    maxResults?: number
    threshold?: number
  } = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) await this.initialize()

    const { category, maxResults = 5, threshold = 0.3 } = options
    const queryEmbedding = this.embedding.createEmbedding(query)
    const results: SearchResult[] = []

    for (const [id, entry] of this.entries) {
      if (category && entry.category !== category) continue

      const similarity = entry.embedding ? 
        cosineSimilarity(queryEmbedding, entry.embedding) : 0

      if (similarity >= threshold) {
        results.push({
          entry,
          relevance: similarity,
          matchType: 'semantic',
          matchedTerms: []
        })

        // Update usage count
        entry.metadata.usage_count = (entry.metadata.usage_count || 0) + 1
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults)
  }

  /**
   * Update existing knowledge entry
   */
  async updateKnowledge(id: string, updates: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
  }) {
    const existingEntry = this.entries.get(id)
    if (!existingEntry) {
      throw new Error(`Knowledge entry with id '${id}' not found`)
    }

    const updatedEntry = {
      ...existingEntry,
      title: updates.title || existingEntry.title,
      content: updates.content || existingEntry.content,
      category: updates.category || existingEntry.category,
      keywords: updates.tags || existingEntry.keywords,
      embedding: updates.content ? this.embedding.createEmbedding(updates.content) : existingEntry.embedding,
      metadata: {
        ...existingEntry.metadata,
        lastUpdated: new Date().toISOString()
      }
    }

    // Save updated entry
    await this.saveKnowledgeEntry({
      id: updatedEntry.id,
      title: updatedEntry.title,
      content: updatedEntry.content,
      category: updatedEntry.category,
      tags: updatedEntry.keywords
    })

    console.log(`📝 Updated knowledge: ${updatedEntry.title}`)
    return updatedEntry
  }

  /**
   * Delete knowledge entry
   */
  async deleteKnowledge(id: string) {
    const entry = this.entries.get(id)
    if (!entry) {
      throw new Error(`Knowledge entry with id '${id}' not found`)
    }

    // Remove from memory
    this.entries.delete(id)

    // Remove file
    if (entry.metadata.filePath && fs.existsSync(entry.metadata.filePath)) {
      fs.unlinkSync(entry.metadata.filePath)
    }

    console.log(`🗑️ Deleted knowledge: ${entry.title}`)
    return true
  }

  /**
   * Get knowledge statistics
   */
  getStats() {
    const categories = new Map<string, number>()
    const totalFiles = Array.from(this.entries.values())
    
    totalFiles.forEach(entry => {
      const count = categories.get(entry.category) || 0
      categories.set(entry.category, count + 1)
    })

    return {
      totalEntries: this.entries.size,
      categories: Object.fromEntries(categories),
      directories: {
        knowledge: this.knowledgeDir,
        training: this.trainingDir
      },
      isInitialized: this.isInitialized,
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Export all knowledge to backup
   */
  async exportKnowledge() {
    const backup = {
      timestamp: new Date().toISOString(),
      entries: Array.from(this.entries.values()),
      stats: this.getStats()
    }

    const backupFile = path.join(this.trainingDir, 'backups', `backup-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
    
    console.log(`💾 Knowledge exported to: ${backupFile}`)
    return backupFile
  }

  /**
   * Import knowledge from backup
   */
  async importKnowledge(backupFile: string) {
    try {
      const content = fs.readFileSync(backupFile, 'utf-8')
      const backup = JSON.parse(content)
      
      for (const entry of backup.entries) {
        this.entries.set(entry.id, entry)
        
        // Save individual files
        const categoryDir = path.join(this.knowledgeDir, entry.category)
        if (!fs.existsSync(categoryDir)) {
          fs.mkdirSync(categoryDir, { recursive: true })
        }
        
        const filePath = path.join(categoryDir, `${entry.id}.json`)
        fs.writeFileSync(filePath, JSON.stringify(entry, null, 2))
      }
      
      console.log(`📥 Imported ${backup.entries.length} knowledge entries`)
      return backup.entries.length
    } catch (error) {
      console.error('❌ Import failed:', error)
      throw error
    }
  }

  /**
   * Get all entries by category
   */
  getEntriesByCategory(category: string) {
    return Array.from(this.entries.values())
      .filter(entry => entry.category === category)
      .sort((a, b) => a.title.localeCompare(b.title))
  }

  /**
   * Get most used knowledge entries
   */
  getMostUsedEntries(limit = 10) {
    return Array.from(this.entries.values())
      .sort((a, b) => (b.metadata.usage_count || 0) - (a.metadata.usage_count || 0))
      .slice(0, limit)
  }

  /**
   * Get recently updated entries
   */
  getRecentlyUpdated(limit = 10) {
    return Array.from(this.entries.values())
      .sort((a, b) => new Date(b.metadata.lastUpdated).getTime() - new Date(a.metadata.lastUpdated).getTime())
      .slice(0, limit)
  }
}

// Export singleton instance
export const localFileKnowledge = new LocalFileKnowledge()
