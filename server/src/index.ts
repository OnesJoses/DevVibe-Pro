import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (_req, res) => res.json({ 
  message: 'DevVibe AI Knowledge API', 
  endpoints: ['/health', '/api/knowledge/search', '/api/feedback', '/api/knowledge/import', '/api/blocked-responses', '/api/excellent-responses']
}))
app.get('/health', (_req, res) => res.json({ ok: true }))

// Search knowledge by title/content/keywords
app.get('/api/knowledge/search', async (req, res) => {
  const q = String(req.query.q || '').trim()
  if (!q) return res.json({ count: 0, answer: '', results: [], query: q })
  
  const qLower = q.toLowerCase()
  const searchTerms = qLower.split(/\s+/).filter(Boolean)
  
  // Enhanced AI comprehension for question analysis
  function analyzeQuestion(question: string) {
    const q = question.toLowerCase().trim()
    
    // Detect question type and intent
    const questionTypes = {
      'services': ['what services', 'what do you offer', 'services available', 'what can you do'],
      'pricing': ['how much', 'cost', 'price', 'pricing', 'rates', 'budget'],
      'process': ['how do you', 'what is your process', 'how does it work', 'steps'],
      'contact': ['how to contact', 'reach you', 'get in touch', 'contact info'],
      'experience': ['experience', 'background', 'portfolio', 'work history'],
      'technical': ['tech stack', 'technologies', 'programming', 'frameworks']
    }

    let questionType = 'general'
    for (const [type, patterns] of Object.entries(questionTypes)) {
      if (patterns.some(pattern => q.includes(pattern))) {
        questionType = type
        break
      }
    }

    // Detect emotional context
    const isConfused = ['confused', 'dont understand', "don't get", 'unclear'].some(word => q.includes(word))
    const isUrgent = ['urgent', 'asap', 'immediately', 'quickly'].some(word => q.includes(word))
    
    return { questionType, isConfused, isUrgent, originalQuery: question }
  }

  // Intelligent answer synthesis based on question analysis
  function synthesizeIntelligentAnswer(question: string, topResult: any): string {
    const analysis = analyzeQuestion(question)
    const content = topResult.content
    
    // Create contextual prefix based on question type
    let prefix = ''
    switch (analysis.questionType) {
      case 'services':
        prefix = 'I offer comprehensive development services including: '
        break
      case 'pricing':
        prefix = 'My pricing structure is designed to be fair and transparent: '
        break
      case 'process':
        prefix = 'My development process is structured and collaborative: '
        break
      case 'contact':
        prefix = 'You can reach me through several channels: '
        break
      case 'experience':
        prefix = 'I bring extensive experience to every project: '
        break
      case 'technical':
        prefix = 'I work with modern, reliable technologies: '
        break
      default:
        prefix = analysis.isConfused ? 'Let me clarify this for you: ' : ''
    }

    // Create focused excerpt
    const excerpt = createExcerpt(content, question.toLowerCase(), 300)
    
    // Add helpful suffix for complex questions
    let suffix = ''
    if (analysis.isUrgent) {
      suffix = ' I can prioritize this for immediate assistance.'
    } else if (analysis.questionType === 'pricing') {
      suffix = ' I\'d be happy to provide a detailed quote based on your specific needs.'
    } else if (analysis.questionType === 'process') {
      suffix = ' This ensures quality results and keeps you informed throughout.'
    }

    return `${prefix}${excerpt}${suffix}`.trim()
  }

  const analysis = analyzeQuestion(q)
  
  const items = await prisma.knowledgeEntry.findMany({
    where: {
      blocked: false,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { keywords: { hasSome: searchTerms } }
      ]
    },
    take: 50 // Get more for scoring, then limit
  })

  // Enhanced scoring with question type awareness
  const scored = items.map(item => {
    let score = 0
    const titleLower = item.title.toLowerCase()
    const contentLower = item.content.toLowerCase()
    
    // Title exact match gets highest score
    if (titleLower.includes(qLower)) score += 10
    
    // Boost score for content matching question type
    const typeKeywords: Record<string, string[]> = {
      'services': ['service', 'offer', 'provide', 'development', 'design'],
      'pricing': ['price', 'cost', 'rate', 'budget', 'quote', 'pricing'],
      'process': ['process', 'step', 'methodology', 'approach', 'workflow'],
      'contact': ['contact', 'email', 'phone', 'reach', 'communicate'],
      'experience': ['experience', 'year', 'project', 'client', 'portfolio'],
      'technical': ['technology', 'tech', 'framework', 'language', 'tool']
    }
    
    const relevantKeywords = typeKeywords[analysis.questionType as keyof typeof typeKeywords] || []
    const typeMatches = relevantKeywords.filter((keyword: string) => 
      titleLower.includes(keyword) || contentLower.includes(keyword)
    )
    score += typeMatches.length * 4 // Higher weight for type-relevant content
    
    // Keyword matches
    const matchingKeywords = searchTerms.filter(term => 
      item.keywords.some(k => k.includes(term))
    )
    score += matchingKeywords.length * 3
    
    // Content matches (but lower weight)
    if (contentLower.includes(qLower)) score += 2
    
    // Shorter content is often more relevant for direct questions
    score += Math.max(0, 5 - Math.floor(item.content.length / 200))
    
    return { ...item, score }
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5) // Take only top 5

  // Create excerpts instead of full content
  const results = scored.map(item => ({
    id: item.id,
    title: item.title,
    excerpt: createExcerpt(item.content, qLower, 150),
    keywords: item.keywords,
    relevance: Math.min(1, item.score / 10)
  }))

  // Synthesize an intelligent, contextual answer from the best result
  let answer = ''
  if (results.length > 0) {
    answer = synthesizeIntelligentAnswer(q, scored[0])
  }

  res.json({ 
    count: results.length > 0 ? 1 : 0,
    answer: answer.trim(),
    results: results.length > 0 ? [results[0]] : [], // Only return the best result
    query: q,
    questionType: analysis.questionType, // Include for frontend learning
    metadata: {
      isConfused: analysis.isConfused,
      isUrgent: analysis.isUrgent,
      confidence: results.length > 0 ? results[0].relevance : 0
    }
  })
})

// Helper function to create relevant excerpts
function createExcerpt(content: string, query: string, maxLength: number = 150): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
  
  // Find sentences containing the query
  const relevant = sentences.filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  )
  
  if (relevant.length > 0) {
    // Use the first relevant sentence(s)
    let excerpt = relevant[0].trim()
    if (excerpt.length < maxLength && relevant.length > 1) {
      excerpt += '. ' + relevant[1].trim()
    }
    if (excerpt.length > maxLength) {
      excerpt = excerpt.substring(0, maxLength) + '...'
    }
    return excerpt
  }
  
  // Fallback: use first part of content
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '...'
  }
  return content
}

// Save feedback
app.post('/api/feedback', async (req, res) => {
  const schema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    rating: z.number().int().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' })
  const { question, answer, rating } = parsed.data

  await prisma.conversation.create({ data: { question, answer, rating } })
  if (rating === 5) {
    await prisma.excellentResponse.create({ data: { question, answer } })
  } else if ((rating ?? 0) <= 2) {
    await prisma.blockedResponse.create({ data: { question, answer } })
  } else if ((rating ?? 0) >= 4) {
    const hash = crypto.createHash('md5').update(answer, 'utf8').digest('hex')
    await prisma.knowledgeEntry.create({ 
      data: { 
        title: question, 
        content: answer, 
        keywords: extractKeywords(question), 
        rating: 4
      } 
    })
  }
  res.json({ ok: true })
})

// Get blocked responses for AI blocking system
app.get('/api/blocked-responses', async (req, res) => {
  const blocked = await prisma.blockedResponse.findMany({
    select: { question: true, answer: true }
  })
  res.json({ items: blocked.map((b: any) => ({ question: b.question, answer: b.answer, rating: 1 })) })
})

// Get excellent responses for AI learning system
app.get('/api/excellent-responses', async (req, res) => {
  const excellent = await prisma.excellentResponse.findMany({
    select: { question: true, answer: true }
  })
  res.json({ items: excellent.map((e: any) => ({ question: e.question, answer: e.answer, rating: 5 })) })
})

// Import bulk knowledge
app.post('/api/knowledge/import', async (req, res) => {
  const Item = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    keywords: z.array(z.string()).optional(),
    content_sha1: z.string().optional(),
    source: z.string().optional(),
    path: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  const schema = z.object({ entries: z.array(Item) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' })
  const entries = parsed.data.entries

  const hash = (s: string) => crypto.createHash('md5').update(s, 'utf8').digest('hex')

  // batch to avoid large payloads
  const size = 500
  let imported = 0
  for (let i = 0; i < entries.length; i += size) {
    const chunk = entries.slice(i, i + size)
    // prepare rows
    const rows = chunk.map((e) => ({
      title: e.title.slice(0, 512),
      content: e.content,
      keywords: (e.keywords ?? extractKeywords(e.content)).map((k) => k.toLowerCase()),
      contentSha1: e.content_sha1 ?? hash(e.content),
      // Note: schema currently doesn't have source/path/tags columns; ignoring them safely
    }))
    // createMany with skipDuplicates to respect unique(title, contentSha1)
    const result = await prisma.knowledgeEntry.createMany({ data: rows, skipDuplicates: true })
    imported += (result.count ?? rows.length)
  }
  res.json({ ok: true, imported })
})

function extractKeywords(q: string) {
  return q.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2).slice(0, 12)
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
