/**
 * Electron renderer process migration client
 * Use this in your Electron renderer to trigger migration to main process
 */

declare global {
  interface Window {
    electronAPI?: {
      migrateAI: (data: any, dataDir?: string) => Promise<any>
      exportAI: () => Promise<any>
    }
  }
}

export class ElectronMigrationClient {
  
  static async migrateToMain(dataDir?: string): Promise<{ success: boolean; counts?: any; error?: string }> {
    if (!window.electronAPI?.migrateAI) {
      return { success: false, error: 'Electron API not available' }
    }

    try {
      // Export current browser data
      const { enhancedLocalAI } = await import('./enhanced-local-ai-system')
      const data = await enhancedLocalAI.getAllData()
      
      console.log('🚀 Migrating to main process...', { 
        excellent: data.excellent?.length || 0,
        knowledge: data.knowledge?.entries?.length || 0,
        blocked: data.blocked?.length || 0
      })

      // Send to main process
      const result = await window.electronAPI.migrateAI(data, dataDir)
      
      if (result.success) {
        console.log('✅ Migration successful:', result.counts)
      } else {
        console.error('❌ Migration failed:', result.error)
      }

      return result

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Migration error:', message)
      return { success: false, error: message }
    }
  }

  static async exportFromMain(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!window.electronAPI?.exportAI) {
      return { success: false, error: 'Electron API not available' }
    }

    try {
      const result = await window.electronAPI.exportAI()
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }
}
