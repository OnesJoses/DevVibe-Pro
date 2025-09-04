#!/usr/bin/env node
/**
 * Seed AI data from browser export JSON into Node filesystem storage
 * Usage: node scripts/seed-ai-data.mjs [path-to-export.json] [data-dir]
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import NodeFileAIStorage (Node-only)
const { NodeFileAIStorage } = await import('../src/lib/node-file-ai-storage.ts')

async function main() {
  const [,, jsonPath, dataDir] = process.argv
  
  if (!jsonPath) {
    console.log('Usage: node scripts/seed-ai-data.mjs <export.json> [data-dir]')
    console.log('Example: node scripts/seed-ai-data.mjs ./my-export.json ./ai-data')
    process.exit(1)
  }

  const exportFile = path.resolve(jsonPath)
  const targetDir = dataDir ? path.resolve(dataDir) : path.resolve('./ai-data')

  console.log('🌱 Seeding AI data...')
  console.log(`📂 Export file: ${exportFile}`)
  console.log(`💾 Target directory: ${targetDir}`)

  try {
    // Read export JSON
    const raw = await fs.readFile(exportFile, 'utf8')
    const data = JSON.parse(raw)
    
    console.log('📊 Export contains:')
    console.log(`  - ${data.excellent?.length || 0} excellent responses`)
    console.log(`  - ${data.knowledge?.entries?.length || 0} knowledge entries`)
    console.log(`  - ${data.blocked?.length || 0} blocked responses`)
    console.log(`  - ${data.totalQueries || 0} total queries`)

    // Initialize Node storage
    const storage = new NodeFileAIStorage({ dataDir: targetDir })
    const initialized = await storage.initialize()
    
    if (!initialized) {
      throw new Error('Failed to initialize Node storage')
    }

    console.log('✅ Node storage initialized')

    // Migrate data
    let counts = { excellent: 0, knowledge: 0, blocked: 0 }

    // Excellent responses
    if (data.excellent && Array.isArray(data.excellent)) {
      for (const entry of data.excellent) {
        await storage.saveExcellentResponse(entry)
        counts.excellent++
      }
    }

    // Knowledge entries
    if (data.knowledge?.entries && Array.isArray(data.knowledge.entries)) {
      for (const entry of data.knowledge.entries) {
        await storage.saveKnowledgeEntry(entry)
        counts.knowledge++
      }
    }

    // Blocked responses
    if (data.blocked && Array.isArray(data.blocked)) {
      for (const entry of data.blocked) {
        await storage.blockResponse(entry)
        counts.blocked++
      }
    }

    console.log('🎉 Migration complete!')
    console.log(`  ⭐ ${counts.excellent} excellent responses imported`)
    console.log(`  📚 ${counts.knowledge} knowledge entries imported`)
    console.log(`  🚫 ${counts.blocked} blocked responses imported`)

    // Verify with stats
    const stats = await storage.getStats()
    console.log('📈 Final stats:', stats)

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
