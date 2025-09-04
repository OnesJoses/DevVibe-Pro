/**
 * Migration utilities for browser ↔ Node AI storage
 */

// Browser-side: Export all data for migration
export async function exportForMigration(): Promise<any> {
  // Dynamic import to avoid bundling Node modules in browser
  const { enhancedLocalAI } = await import('./enhanced-local-ai-system')
  return await enhancedLocalAI.getAllData()
}

// Node-side: Import data into filesystem storage
export async function importToNodeStorage(data: any, dataDir?: string): Promise<{ success: boolean; counts: any; error?: string }> {
  try {
    // Dynamic import Node-only storage
    const { NodeFileAIStorage } = await import('./node-file-ai-storage')
    
    const storage = new NodeFileAIStorage({ dataDir: dataDir || './ai-data' })
    const initialized = await storage.initialize()
    
    if (!initialized) {
      return { success: false, counts: {}, error: 'Failed to initialize Node storage' }
    }

    const counts = { excellent: 0, knowledge: 0, blocked: 0 }

    // Import excellent responses
    if (data.excellent && Array.isArray(data.excellent)) {
      for (const entry of data.excellent) {
        await storage.saveExcellentResponse(entry)
        counts.excellent++
      }
    }

    // Import knowledge entries
    if (data.knowledge?.entries && Array.isArray(data.knowledge.entries)) {
      for (const entry of data.knowledge.entries) {
        await storage.saveKnowledgeEntry(entry)
        counts.knowledge++
      }
    }

    // Import blocked responses
    if (data.blocked && Array.isArray(data.blocked)) {
      for (const entry of data.blocked) {
        await storage.blockResponse(entry)
        counts.blocked++
      }
    }

    return { success: true, counts }

  } catch (error) {
    return { 
      success: false, 
      counts: {}, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Electron main process: Handle migration IPC
export function setupElectronMigrationHandlers(ipcMain: any) {
  ipcMain.handle('ai:migrate', async (event: any, data: any, dataDir?: string) => {
    console.log('🔄 Received migration request from renderer')
    const result = await importToNodeStorage(data, dataDir)
    console.log('📊 Migration result:', result)
    return result
  })

  ipcMain.handle('ai:export', async () => {
    // For when Node storage needs to export back to browser
    try {
      const { NodeFileAIStorage } = await import('./node-file-ai-storage')
      const storage = new NodeFileAIStorage()
      await storage.initialize()
      
      const [excellent, knowledge, blocked, stats] = await Promise.all([
        storage.getExcellentResponses(),
        storage.getKnowledgeEntries(), 
        storage.getBlockedResponses(),
        storage.getStats()
      ])

      return {
        success: true,
        data: {
          excellent,
          knowledge: { entries: knowledge },
          blocked,
          stats,
          exportedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
}
