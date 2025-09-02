// Enhanced AI utilities for local semantic search and embeddings

export interface KnowledgeEntry {
  id: string
  content: string
  title: string
  category: string
  keywords: string[]
  embedding?: number[]
  metadata: {
    lastUpdated: string
    confidence: number
    sourceType: 'manual' | 'learned' | 'generated'
    usage_count: number
  }
}

export interface SearchResult {
  entry: KnowledgeEntry
  relevance: number
  matchType: 'semantic' | 'keyword' | 'fuzzy'
  matchedTerms: string[]
}

/**
 * Simple text-to-vector embedding using TF-IDF approach
 * This runs entirely in the browser without external APIs
 */
export class LocalTextEmbedding {
  private vocabulary: Map<string, number> = new Map()
  private idfScores: Map<string, number> = new Map()
  private documentCount = 0

  constructor() {
    this.buildVocabulary()
  }

  /**
   * Build vocabulary from common English words and technical terms
   */
  private buildVocabulary() {
    const techTerms = [
      'react', 'typescript', 'javascript', 'python', 'django', 'node', 'express',
      'database', 'postgresql', 'mongodb', 'api', 'rest', 'graphql', 'auth',
      'jwt', 'oauth', 'security', 'performance', 'optimization', 'deployment',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vercel', 'frontend',
      'backend', 'fullstack', 'ui', 'ux', 'design', 'responsive', 'mobile',
      'web', 'app', 'application', 'service', 'microservice', 'architecture',
      'development', 'programming', 'coding', 'software', 'engineer', 'developer',
      'project', 'portfolio', 'client', 'business', 'startup', 'enterprise',
      'mvp', 'scalable', 'secure', 'fast', 'modern', 'technology', 'framework',
      'library', 'tool', 'build', 'deploy', 'host', 'cloud', 'server', 'database'
    ]

    const commonWords = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
      'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
      'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
      'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
      'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
      'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
      'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
      'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
      'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
      'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'each',
      'which', 'their', 'said', 'has', 'more', 'may', 'other', 'should', 'such',
      'through', 'very', 'where', 'much', 'own', 'still', 'man', 'here', 'old',
      'every', 'right', 'might', 'great', 'tell', 'try', 'ask', 'need', 'too',
      'feel', 'three', 'state', 'never', 'become', 'between', 'high', 'really',
      'something', 'most', 'another', 'much', 'family', 'own', 'out', 'leave',
      'put', 'old', 'while', 'mean', 'on', 'keep', 'student', 'why', 'let',
      'great', 'same', 'big', 'group', 'begin', 'seem', 'country', 'help',
      'talk', 'turn', 'follow', 'around', 'every', 'start', 'thought', 'hear',
      'part', 'find', 'fact', 'hand', 'high', 'place', 'number', 'week',
      'company', 'system', 'program', 'question', 'during', 'learn', 'point',
      'different', 'right', 'move', 'play', 'information', 'thing', 'want',
      'problem', 'again', 'off', 'always', 'example', 'important', 'lot',
      'money', 'provide', 'service', 'however', 'end', 'today', 'life',
      'increase', 'local', 'opportunity', 'society', 'together', 'available',
      'job', 'education', 'within', 'hard', 'order', 'including', 'interest',
      'nothing', 'everything', 'level', 'community', 'several', 'real',
      'certainly', 'action', 'possible', 'full', 'measure', 'kind', 'least',
      'change', 'practice', 'cause', 'experience', 'team', 'often', 'result',
      'member', 'social', 'value', 'produce', 'building', 'process', 'lead',
      'early', 'far', 'both', 'food', 'create', 'support', 'technology',
      'physical', 'meeting', 'economic', 'training', 'material', 'special',
      'heavy', 'fine', 'beautiful', 'requirement', 'decision', 'complete',
      'personal', 'international', 'center', 'face', 'final', 'research',
      'green', 'east', 'knowledge', 'single', 'pressure', 'medical', 'simply',
      'quality', 'language', 'previously', 'unit', 'unless', 'control',
      'computer', 'space', 'open', 'environment', 'financial', 'everyone',
      'structure', 'project', 'politics', 'method', 'player', 'civil', 'house',
      'approach', 'series', 'analysis', 'cold', 'commercial', 'low', 'top',
      'agency', 'standard', 'half', 'model', 'normal', 'development', 'resource',
      'human', 'response', 'common', 'skin', 'indeed', 'growth', 'choice',
      'concern', 'officer', 'performance', 'goal', 'card', 'protect',
      'democratic', 'participant', 'success', 'natural', 'scientist', 'central',
      'activity', 'letter', 'successful', 'reduce', 'discussion', 'outside',
      'general', 'operations', 'similar', 'hot', 'security', 'agreement',
      'network', 'traditional', 'alone', 'culture', 'total', 'design', 'cell',
      'establish', 'nice', 'popular', 'employee', 'production', 'break',
      'entire', 'glass', 'size', 'sometimes', 'machine', 'reduce', 'happen',
      'price', 'modern', 'treatment', 'manage', 'recognize', 'peace', 'effort',
      'movement', 'violence', 'hope', 'evidence', 'third', 'magazine', 'set',
      'current', 'clear', 'various', 'trouble', 'property', 'shopping', 'plan',
      'power', 'crime', 'bit', 'close', 'option', 'ground', 'garden', 'future',
      'protect', 'impact', 'music', 'loss', 'page', 'understand', 'defense',
      'relate', 'generation', 'pretty', 'minute', 'exist', 'realize', 'nation',
      'million', 'anything', 'continue', 'expect', 'health', 'forward',
      'ready', 'represent', 'hospital', 'morning', 'father', 'season', 'policy',
      'recently', 'develop', 'send', 'arm', 'sort', 'appear', 'share', 'moment',
      'officer', 'benefit', 'sense', 'suddenly', 'apply', 'middle', 'amount',
      'attention', 'staff', 'late', 'story', 'court', 'product', 'carry',
      'language', 'particular', 'certain', 'love', 'tough', 'force', 'tend',
      'wide', 'character', 'news', 'significant', 'enter', 'message', 'lots',
      'serious', 'deep', 'difficult', 'kid', 'sea', 'receive', 'garden',
      'report', 'role', 'better', 'economic', 'pass', 'decide', 'peace',
      'compare', 'spend', 'glad', 'union', 'claim', 'image', 'quickly',
      'president', 'visit', 'technology', 'loss', 'basic', 'return', 'building',
      'outside', 'describe', 'handle', 'structure', 'fall', 'note', 'identify',
      'beat', 'avoid', 'cultural', 'fund', 'tough', 'reveal', 'shot', 'discussion',
      'finger', 'garden', 'environmental', 'especially', 'operation', 'beautiful',
      'themselves', 'admit', 'rule', 'camera', 'fill', 'rather', 'stage',
      'safe', 'choose', 'drop', 'fine', 'race', 'worry', 'gain', 'dark',
      'exactly', 'probably', 'relationship', 'powerful', 'difficulty', 'club',
      'detail', 'path', 'surface', 'fail', 'spring', 'item', 'movie', 'record',
      'walk', 'fall', 'political', 'sit', 'book', 'reason', 'nearly', 'road',
      'brother', 'tree', 'class', 'history', 'thousand', 'risk', 'food',
      'edge', 'statement', 'leg', 'bad', 'status', 'friend', 'study', 'heart',
      'order', 'oil', 'situation', 'fight', 'mind', 'finally', 'voice', 'area',
      'wide', 'shake', 'firm', 'tomorrow', 'agency', 'sound', 'office', 'cut',
      'catch', 'step', 'conflict', 'below', 'cool', 'personal', 'movement',
      'issue', 'feel', 'student', 'summer', 'wall', 'raise', 'along', 'wait',
      'object', 'yeah', 'huge', 'market', 'determine', 'clearly', 'figure',
      'star', 'box', 'table', 'inside', 'current', 'drop', 'lawyer', 'explain',
      'hope', 'lot', 'effective', 'yard', 'plant', 'section', 'stock', 'similar',
      'store', 'train', 'form', 'support', 'event', 'key', 'wine', 'around',
      'gas', 'generation', 'usually', 'reflect', 'smile', 'treat', 'trip',
      'leader', 'increase', 'finger', 'inside', 'original', 'bed', 'speed',
      'instead', 'connect', 'works', 'list', 'separate', 'return', 'continue',
      'create', 'address', 'others', 'commercial', 'period', 'legal', 'decision',
      'main', 'staff', 'wife', 'debate', 'maintain', 'observe', 'economy',
      'religious', 'door', 'stop', 'individual', 'civil', 'vote', 'particular',
      'likely', 'account', 'agreement', 'capital', 'mouth', 'thick', 'sorry',
      'board', 'century', 'summer', 'material', 'bill', 'increase', 'test',
      'discussion', 'opportunity', 'performance', 'born', 'expert', 'labor',
      'woman', 'choose', 'hospital', 'manage', 'radio', 'travel', 'Washington',
      'factor', 'relate', 'detail', 'positive', 'red', 'published', 'court',
      'produce', 'eat', 'teach', 'marriage', 'degree', 'investment', 'analysis',
      'hair', 'truth', 'medical', 'thus', 'conference', 'officer', 'south',
      'capital', 'tool', 'present', 'avoid', 'north', 'special', 'database',
      'rather', 'community', 'environment', 'store', 'article', 'west', 'saved'
    ]

    // Combine and build vocabulary with indices
    const allWords = [...new Set([...techTerms, ...commonWords])]
    allWords.forEach((word, index) => {
      this.vocabulary.set(word.toLowerCase(), index)
    })
  }

  /**
   * Create a simple TF-IDF vector from text
   */
  createEmbedding(text: string): number[] {
    const words = this.tokenize(text)
    const wordCounts = new Map<string, number>()
    
    // Count word frequencies
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    })

    // Create vector
    const vector = new Array(this.vocabulary.size).fill(0)
    
    wordCounts.forEach((count, word) => {
      const index = this.vocabulary.get(word)
      if (index !== undefined) {
        // Simple TF-IDF: log(1 + count) * inverse document frequency
        const tf = Math.log(1 + count)
        const idf = this.idfScores.get(word) || 1
        vector[index] = tf * idf
      }
    })

    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector
  }

  /**
   * Simple tokenization with cleaning
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
  }

  /**
   * Update IDF scores based on document corpus
   */
  updateCorpus(documents: string[]) {
    this.documentCount = documents.length
    const docFrequency = new Map<string, number>()

    // Count document frequency for each word
    documents.forEach(doc => {
      const words = new Set(this.tokenize(doc))
      words.forEach(word => {
        if (this.vocabulary.has(word)) {
          docFrequency.set(word, (docFrequency.get(word) || 0) + 1)
        }
      })
    })

    // Calculate IDF scores
    docFrequency.forEach((df, word) => {
      this.idfScores.set(word, Math.log(this.documentCount / df))
    })
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0
  
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    magnitudeA += vecA[i] * vecA[i]
    magnitudeB += vecB[i] * vecB[i]
  }
  
  magnitudeA = Math.sqrt(magnitudeA)
  magnitudeB = Math.sqrt(magnitudeB)
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0
  
  return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Advanced keyword extraction using frequency and position
 */
export function extractKeywords(text: string, maxKeywords = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
    'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
    'time', 'no', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'good',
    'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
    'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
    'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ])

  // Count word frequencies
  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    }
  })

  // Sort by frequency and return top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
}
