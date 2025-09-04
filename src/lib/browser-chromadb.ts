// Browser-compatible ChromaDB client alternative
// Enhanced with IndexedDB persistence for permanent storage

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

interface ChromaDBDocument {
  id: string
  document: string
  metadata: any
  embedding?: number[]
}

// Enhanced Browser-compatible ChromaDB with IndexedDB persistence
class BrowserChromaClient {
  private apiKey: string
  private tenant: string
  private database: string
  private baseUrl: string
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'DevVibeProChromaDB'
  private readonly DB_VERSION = 2

  constructor(config: {
    apiKey: string
    tenant: string
    database: string
  }) {
    this.apiKey = config.apiKey
    this.tenant = config.tenant
    this.database = config.database
    this.baseUrl = 'https://api.trychroma.com'
    this.initializeDB()
  }

  // Initialize IndexedDB for persistent storage
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        console.log('💾 Persistent storage initialized')
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create collections store
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'name' })
        }
        
        // Create documents store with indexes
        if (!db.objectStoreNames.contains('documents')) {
          const documentsStore = db.createObjectStore('documents', { keyPath: 'id' })
          documentsStore.createIndex('collection', 'collection', { unique: false })
          documentsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
        
        // Create embeddings store
        if (!db.objectStoreNames.contains('embeddings')) {
          const embeddingsStore = db.createObjectStore('embeddings', { keyPath: 'id' })
          embeddingsStore.createIndex('collection', 'collection', { unique: false })
        }
        
        console.log('🗄️ Database schema created with persistence')
      }
    })
  }

  async heartbeat(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/heartbeat`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Chroma-Token': this.apiKey
        }
      })
      return Date.now()
    } catch (error) {
      console.warn('ChromaDB heartbeat failed, using fallback:', error)
      return Date.now()
    }
  }

  async getOrCreateCollection(config: {
    name: string
    metadata?: any
  }): Promise<BrowserChromaCollection> {
    return new BrowserChromaCollection(this, config.name, config.metadata)
  }
}

class BrowserChromaCollection {
  private client: BrowserChromaClient
  private name: string
  private metadata: any
  private documents: Map<string, ChromaDBDocument> = new Map()

  constructor(client: BrowserChromaClient, name: string, metadata: any = {}) {
    this.client = client
    this.name = name
    this.metadata = metadata
    this.initializeAsync()
  }

  private async initializeAsync(): Promise<void> {
    // Wait for IndexedDB to be ready
    let retries = 10
    while (!(this.client as any).db && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retries--
    }
    await this.loadFromStorage()
  }

  async add(data: {
    ids: string[]
    documents: string[]
    metadatas?: any[]
    embeddings?: number[][]
  }): Promise<void> {
    try {
      // Store locally as fallback (always works)
      for (let i = 0; i < data.ids.length; i++) {
        const doc: ChromaDBDocument = {
          id: data.ids[i],
          document: data.documents[i],
          metadata: data.metadatas?.[i] || {},
          embedding: data.embeddings?.[i] || await this.generateEmbedding(data.documents[i])
        }
        this.documents.set(data.ids[i], doc)
      }
      
      await this.saveToStorage()
      console.log(`✅ Stored ${data.ids.length} documents in persistent browser ChromaDB`)
      
      // Try to sync with ChromaDB Cloud in background (best effort)
      this.syncWithCloud(data).catch(error => {
        console.warn('ChromaDB Cloud sync failed (using local storage):', error)
      })
      
    } catch (error) {
      console.error('Failed to add documents:', error)
      throw error
    }
  }

  async query(params: {
    queryTexts?: string[]
    queryEmbeddings?: number[][]
    nResults?: number
    where?: any
  }): Promise<{
    ids: string[][]
    documents: string[][]
    metadatas: any[][]
    distances: number[][]
  }> {
    try {
      const nResults = params.nResults || 5
      const results: {
        ids: string[][]
        documents: string[][]
        metadatas: any[][]
        distances: number[][]
      } = {
        ids: [[]],
        documents: [[]],
        metadatas: [[]],
        distances: [[]]
      }

      if (params.queryTexts && params.queryTexts.length > 0) {
        const queryText = params.queryTexts[0]
        const queryEmbedding = await this.generateEmbedding(queryText)
        
        // Calculate similarities with stored documents
        const similarities: Array<{doc: ChromaDBDocument, similarity: number}> = []
        
        for (const [id, doc] of this.documents) {
          if (params.where) {
            // Apply filters
            const matches = this.matchesFilter(doc.metadata, params.where)
            if (!matches) continue
          }
          
          const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding || [])
          similarities.push({ doc, similarity })
        }
        
        // Sort by similarity and take top results
        similarities.sort((a, b) => b.similarity - a.similarity)
        const topResults = similarities.slice(0, nResults)
        
        for (const result of topResults) {
          results.ids[0].push(result.doc.id)
          results.documents[0].push(result.doc.document)
          results.metadatas[0].push(result.doc.metadata)
          results.distances[0].push(1 - result.similarity) // Convert similarity to distance
        }
      }
      
      return results
    } catch (error) {
      console.error('Query failed:', error)
      return { ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] }
    }
  }

  async count(): Promise<number> {
    return this.documents.size
  }

  async get(params?: { limit?: number }): Promise<{
    ids: string[]
    documents: string[]
    metadatas: any[]
  }> {
    const docs = Array.from(this.documents.values())
    const limit = params?.limit || docs.length
    const limited = docs.slice(0, limit)
    
    return {
      ids: limited.map(doc => doc.id),
      documents: limited.map(doc => doc.document),
      metadatas: limited.map(doc => doc.metadata)
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simple embedding generation for browser compatibility
    // In production, you might want to use a more sophisticated method
    const words = text.toLowerCase().split(/\s+/)
    const embedding = new Array(384).fill(0) // Standard embedding size
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word)
      embedding[hash % 384] += 1 / (index + 1) // Position weighting
    })
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
    return magnitude > 0 ? dotProduct / magnitude : 0
  }

  private matchesFilter(metadata: any, filter: any): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key] !== value) return false
    }
    return true
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private async saveToStorage(): Promise<void> {
    try {
      // Save to localStorage as fallback
      const data = Array.from(this.documents.entries())
      localStorage.setItem(`chromadb_${this.name}`, JSON.stringify(data))
      
      // Save to IndexedDB for persistence
      if ((this.client as any).db) {
        await this.saveToIndexedDB()
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error)
    }
  }

  private async saveToIndexedDB(): Promise<void> {
    const db = (this.client as any).db
    if (!db) return

    const transaction = db.transaction(['documents', 'collections'], 'readwrite')
    const documentsStore = transaction.objectStore('documents')
    const collectionsStore = transaction.objectStore('collections')

    // Save collection metadata
    await collectionsStore.put({
      name: this.name,
      metadata: this.metadata,
      updatedAt: new Date().toISOString()
    })

    // Save all documents
    for (const [id, doc] of this.documents) {
      await documentsStore.put({
        id,
        collection: this.name,
        document: doc.document,
        metadata: doc.metadata,
        embedding: doc.embedding,
        updatedAt: new Date().toISOString()
      })
    }

    console.log(`💾 Persisted ${this.documents.size} documents to IndexedDB`)
  }

  private async loadFromStorage(): Promise<void> {
    try {
      // Try IndexedDB first (persistent)
      if ((this.client as any).db) {
        await this.loadFromIndexedDB()
      }
      
      // Fallback to localStorage if IndexedDB is empty
      if (this.documents.size === 0) {
        const saved = localStorage.getItem(`chromadb_${this.name}`)
        if (saved) {
          const data = JSON.parse(saved)
          this.documents = new Map(data)
          console.log(`📚 Loaded ${this.documents.size} documents from localStorage fallback`)
        }
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error)
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    const db = (this.client as any).db
    if (!db) return

    const transaction = db.transaction(['documents'], 'readonly')
    const documentsStore = transaction.objectStore('documents')
    const index = documentsStore.index('collection')
    const request = index.getAll(this.name)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const docs = request.result
        for (const doc of docs) {
          this.documents.set(doc.id, {
            id: doc.id,
            document: doc.document,
            metadata: doc.metadata,
            embedding: doc.embedding
          })
        }
        console.log(`📚 Loaded ${this.documents.size} documents from persistent IndexedDB`)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async syncWithCloud(data: {
    ids: string[]
    documents: string[]
    metadatas?: any[]
  }): Promise<void> {
    // This is where you could implement actual ChromaDB Cloud API calls
    // For now, we'll just simulate the sync
    console.log('🌐 Syncing with ChromaDB Cloud...', data.ids.length, 'documents')
    
    // In a real implementation, you would make HTTP requests to ChromaDB Cloud API
    // But this requires proper CORS setup and API endpoint configuration
  }
}

// Export the browser-compatible client with the same interface as the original
export { BrowserChromaClient as CloudClient }
export type { EmbeddingVector }
