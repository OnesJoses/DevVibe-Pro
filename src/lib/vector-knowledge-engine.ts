import { CloudClient } from "./browser-chromadb";

interface EmbeddingVector {
  id: string
  text: string
  vector: number[]
  metadata: {
    category: string
    confidence: number
    timestamp: number
    source: string
    learned_from?: string
  }
}

export class VectorKnowledgeEngine {
  private client: CloudClient
  private collection: any = null
  private vocabulary: Map<string, {
    definition: string
    examples: string[]
    category: string
    frequency: number
    learned_date: number
  }> = new Map()

  constructor() {
    this.client = new CloudClient({
      apiKey: 'ck-FvSg7YfutGeQmpaTjWAkQYJayhmVZp35n1SDV2JDSEyX',
      tenant: 'c578600a-26e4-4a28-ad92-52df5446dd26',
      database: 'DevVibePro'
    });
    this.initializeCollection()
    this.loadVocabulary()
  }

  private async initializeCollection() {
    try {
      // Get or create collection for AI knowledge
      this.collection = await this.client.getOrCreateCollection({
        name: "ai_knowledge",
        metadata: { 
          description: "DevVibe Pro AI Knowledge Base",
          version: "1.0"
        }
      })
      console.log('✅ ChromaDB collection initialized')
    } catch (error) {
      console.error('❌ ChromaDB initialization failed:', error)
      // Fallback to local storage if ChromaDB fails
      this.initializeFallback()
    }
  }

  private initializeFallback() {
    console.log('🔄 Using local fallback for vector storage')
    this.collection = {
      add: async (data: any) => {
        const key = `chroma_${Date.now()}_${Math.random()}`
        localStorage.setItem(key, JSON.stringify(data))
      },
      query: async (params: any) => {
        // Simple local search fallback
        const keys = Object.keys(localStorage).filter(k => k.startsWith('chroma_'))
        const results = keys.map(key => {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          return {
            ids: [data.ids?.[0] || key],
            documents: data.documents || [''],
            metadatas: data.metadatas || [{}],
            distances: [Math.random() * 0.5] // Random similarity for fallback
          }
        }).slice(0, params.n_results || 5)
        
        return {
          ids: results.map(r => r.ids).flat(),
          documents: results.map(r => r.documents).flat(),
          metadatas: results.map(r => r.metadatas).flat(),
          distances: results.map(r => r.distances).flat()
        }
      }
    }
  }

  // Convert text to embeddings using ChromaDB's built-in embedding
  async textToEmbedding(text: string): Promise<number[]> {
    try {
      // ChromaDB will handle embeddings automatically
      // This is just for compatibility with existing code
      const words = text.toLowerCase().split(/\s+/)
      const vector = new Array(384).fill(0) // Standard embedding size
      
      words.forEach((word, index) => {
        const hash = this.simpleHash(word)
        vector[hash % 384] += 1 / (index + 1)
      })
      
      // Normalize vector
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
      return magnitude > 0 ? vector.map(val => val / magnitude) : vector
    } catch (error) {
      console.error('Embedding generation failed:', error)
      return new Array(384).fill(0)
    }
  }

  // Store knowledge in ChromaDB
  async storeKnowledge(
    text: string, 
    category: string, 
    metadata: any = {}
  ): Promise<string> {
    try {
      const id = `knowledge_${Date.now()}_${this.simpleHash(text)}`
      
      await this.collection.add({
        ids: [id],
        documents: [text],
        metadatas: [{
          category,
          timestamp: Date.now(),
          confidence: metadata.confidence || 0.8,
          source: metadata.source || 'user',
          learned_from: metadata.learned_from || 'interaction',
          ...metadata
        }]
      })
      
      console.log(`✅ Stored knowledge in ChromaDB: ${id}`)
      return id
    } catch (error) {
      console.error('❌ Failed to store knowledge:', error)
      throw error
    }
  }

  // Search similar content using ChromaDB's semantic search
  async findSimilarContent(
    query: string, 
    threshold: number = 0.7,
    maxResults: number = 5
  ): Promise<Array<{
    content: string,
    similarity: number,
    metadata: any
  }>> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }

      const results = await this.collection.query({
        queryTexts: [query],
        nResults: maxResults,
        where: {} // Can add filters here
      })
      
      const similarContent: Array<{content: string, similarity: number, metadata: any}> = []
      
      if (results.documents && results.documents[0]) {
        results.documents[0].forEach((doc: string, index: number) => {
          const distance = results.distances?.[0]?.[index] || 1
          const similarity = 1 - distance // Convert distance to similarity
          
          if (similarity >= threshold) {
            similarContent.push({
              content: doc,
              similarity,
              metadata: results.metadatas?.[0]?.[index] || {}
            })
          }
        })
      }
      
      return similarContent.sort((a, b) => b.similarity - a.similarity)
    } catch (error) {
      console.error('❌ ChromaDB search failed:', error)
      return []
    }
  }

  // Learn from successful interactions
  async learnFromInteraction(
    question: string, 
    answer: string, 
    feedback: number, 
    source: string = 'user'
  ): Promise<void> {
    if (feedback < 3) return // Only learn from good interactions
    
    try {
      // Store question-answer pair
      await this.storeKnowledge(
        `Q: ${question}\nA: ${answer}`,
        'conversation',
        {
          type: 'qa_pair',
          question,
          answer,
          feedback,
          confidence: feedback / 5,
          source,
          learned_from: 'user_interaction'
        }
      )
      
      // Extract and learn new vocabulary
      await this.extractAndLearnVocabulary(question + ' ' + answer, source)
      
      console.log(`✅ Learned from interaction (feedback: ${feedback}/5)`)
    } catch (error) {
      console.error('❌ Learning error:', error)
    }
  }

  // Search by category
  async searchByCategory(
    category: string, 
    query?: string,
    maxResults: number = 10
  ): Promise<Array<{content: string, similarity: number, metadata: any}>> {
    try {
      const searchParams: any = {
        nResults: maxResults,
        where: { category }
      }
      
      if (query) {
        searchParams.queryTexts = [query]
      }
      
      const results = await this.collection.query(searchParams)
      
      const categoryContent: Array<{content: string, similarity: number, metadata: any}> = []
      
      if (results.documents && results.documents[0]) {
        results.documents[0].forEach((doc: string, index: number) => {
          const distance = results.distances?.[0]?.[index] || 0
          const similarity = query ? 1 - distance : 1 // If no query, all results are relevant
          
          categoryContent.push({
            content: doc,
            similarity,
            metadata: results.metadatas?.[0]?.[index] || {}
          })
        })
      }
      
      return categoryContent
    } catch (error) {
      console.error('❌ Category search failed:', error)
      return []
    }
  }

  // Get collection statistics
  async getCollectionStats(): Promise<{
    totalDocuments: number
    categories: Record<string, number>
    recentAdditions: number
  }> {
    try {
      const count = await this.collection.count()
      
      // Get all documents to analyze categories
      const allDocs = await this.collection.get({
        limit: 1000 // Adjust as needed
      })
      
      const categories: Record<string, number> = {}
      let recentAdditions = 0
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      
      if (allDocs.metadatas) {
        allDocs.metadatas.forEach((metadata: any) => {
          const category = metadata.category || 'uncategorized'
          categories[category] = (categories[category] || 0) + 1
          
          if (metadata.timestamp && metadata.timestamp > weekAgo) {
            recentAdditions++
          }
        })
      }
      
      return {
        totalDocuments: count,
        categories,
        recentAdditions
      }
    } catch (error) {
      console.error('❌ Failed to get collection stats:', error)
      return {
        totalDocuments: 0,
        categories: {},
        recentAdditions: 0
      }
    }
  }

  // Extract and learn new vocabulary (keep existing implementation)
  async extractAndLearnVocabulary(text: string, source: string) {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    const newTerms: string[] = []
    
    for (const word of words) {
      if (!this.vocabulary.has(word) && word.length > 3) {
        const definition = await this.inferDefinition(word, text)
        
        this.vocabulary.set(word, {
          definition,
          examples: [text.substring(0, 100) + '...'],
          category: this.categorizeWord(word),
          frequency: 1,
          learned_date: Date.now()
        })
        
        newTerms.push(word)
        
        // Also store in ChromaDB
        await this.storeKnowledge(
          `Term: ${word} - ${definition}`,
          'vocabulary',
          {
            term: word,
            definition,
            category: this.categorizeWord(word),
            source
          }
        )
      } else if (this.vocabulary.has(word)) {
        const existing = this.vocabulary.get(word)!
        existing.frequency++
        if (!existing.examples.includes(text.substring(0, 100) + '...')) {
          existing.examples.push(text.substring(0, 100) + '...')
          existing.examples = existing.examples.slice(-3)
        }
      }
    }
    
    if (newTerms.length > 0) {
      console.log(`🧠 Learned ${newTerms.length} new terms:`, newTerms)
      this.saveVocabulary()
    }
  }

  // Infer definition from context (keep existing implementation)
  private async inferDefinition(word: string, context: string): Promise<string> {
    const patterns = [
      new RegExp(`${word}\\s+is\\s+([^.!?]+)`, 'i'),
      new RegExp(`${word}\\s*[:-]\\s*([^.!?]+)`, 'i'),
      new RegExp(`([^.!?]+)\\s+called\\s+${word}`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = context.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    const wordIndex = context.toLowerCase().indexOf(word)
    if (wordIndex !== -1) {
      const start = Math.max(0, wordIndex - 50)
      const end = Math.min(context.length, wordIndex + word.length + 50)
      return `Context: ${context.substring(start, end)}`
    }
    
    return `New term learned from: ${context.substring(0, 50)}...`
  }

  // Categorize words (keep existing implementation)
  private categorizeWord(word: string): string {
    const techTerms = ['api', 'database', 'framework', 'library', 'server', 'client', 'react', 'node', 'typescript']
    const businessTerms = ['revenue', 'cost', 'price', 'service', 'client', 'project', 'timeline']
    const processTerms = ['workflow', 'methodology', 'approach', 'strategy', 'implementation']
    
    if (techTerms.some(term => word.includes(term) || term.includes(word))) return 'technical'
    if (businessTerms.some(term => word.includes(term) || term.includes(word))) return 'business'
    if (processTerms.some(term => word.includes(term) || term.includes(word))) return 'process'
    
    return 'general'
  }

  // Get vocabulary insights
  getVocabularyInsights() {
    const categories = Array.from(this.vocabulary.values()).reduce((acc, term) => {
      acc[term.category] = (acc[term.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const recentTerms = Array.from(this.vocabulary.entries())
      .filter(([_, term]) => Date.now() - term.learned_date < 7 * 24 * 60 * 60 * 1000)
      .map(([word, term]) => ({ word, ...term }))
      .sort((a, b) => b.learned_date - a.learned_date)
      .slice(0, 10)
    
    return {
      totalTerms: this.vocabulary.size,
      categories,
      recentTerms
    }
  }

  // Utility functions
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  private saveVocabulary() {
    try {
      const data = Array.from(this.vocabulary.entries())
      localStorage.setItem('ai-vocabulary', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save vocabulary:', error)
    }
  }

  private loadVocabulary() {
    try {
      const saved = localStorage.getItem('ai-vocabulary')
      if (saved) {
        const data = JSON.parse(saved)
        this.vocabulary = new Map(data)
      }
    } catch (error) {
      console.warn('Failed to load vocabulary:', error)
    }
  }

  // Test ChromaDB connection
  async testConnection(): Promise<boolean> {
    try {
      await this.collection.count()
      console.log('✅ ChromaDB connection successful')
      return true
    } catch (error) {
      console.error('❌ ChromaDB connection failed:', error)
      return false
    }
  }
}

export const vectorKnowledge = new VectorKnowledgeEngine()
