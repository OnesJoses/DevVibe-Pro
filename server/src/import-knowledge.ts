import 'dotenv/config'
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const path = process.argv[2]
  if (!path) {
    console.error('Usage: ts-node src/import-knowledge.ts <path-to-json>')
    process.exit(1)
  }
  const raw = readFileSync(path, 'utf8')
  const data = JSON.parse(raw)
  const entries = Array.isArray(data) ? data : data.entries
  if (!Array.isArray(entries)) throw new Error('Invalid JSON: expected array or { entries: [...] }')

  const batchSize = 1000
  let imported = 0
  for (let i = 0; i < entries.length; i += batchSize) {
    const chunk = entries.slice(i, i + batchSize)
    await prisma.knowledgeEntry.createMany({
      data: chunk.map((e: any) => {
        const content = String(e.content || '')
        const hash = crypto.createHash('md5').update(content, 'utf8').digest('hex')
        return {
          title: String(e.title || '').slice(0, 512),
          content: content,
          keywords: (Array.isArray(e.keywords) ? e.keywords : []).map((k: any) => String(k).toLowerCase()),
          contentSha1: hash
        }
      }),
      skipDuplicates: false
    })
    imported += chunk.length
    console.log(`Imported ${imported}/${entries.length}`)
  }

  console.log('Done')
}

main().finally(() => prisma.$disconnect())
