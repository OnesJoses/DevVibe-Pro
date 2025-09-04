/**
 * LOCAL FILE STORAGE SYSTEM FOR AI KNOWLEDGE
 * Features: Automatic backups, real-time sync, fast access, no cloud billing required
 * Uses Node.js file system for persistent storage on your computer
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { watch } from 'fs'

interface ConversationEntry {
  id: string
  question: string
  answer: string
  rating?: number
  timestamp: string
  blocked: boolean
}

interface FreshKnowledgeEntry {
  id: string
  title: string
  content: string
  keywords: string[]
  rating: number
  usageCount: number
  timestamp: string
  blocked: boolean
}

interface BackupConfig {
  enableAutoBackup: boolean
  backupInterval: number // minutes
  maxBackups: number
  backupLocation: string
}

export class LocalFileAIStorage {
  private dataDir: string
  private backupDir: string
  private config: BackupConfig
  private watchers: { [key: string]: any } = {}
  private autoBackupTimer?: NodeJS.Timeout

  // File paths
  private conversationsFile: string
  private knowledgeFile: string
  private blockedFile: string
  private excellentFile: string
  private statsFile: string

  constructor(config: Partial<BackupConfig> = {}) {
    // Setup directories
    this.dataDir = path.join(process.cwd(), 'ai-knowledge-data')
    this.backupDir = path.join(process.cwd(), 'ai-knowledge-backups')
    
    this.config = {
      enableAutoBackup: true,
      backupInterval: 15, // Every 15 minutes
      maxBackups: 48, // Keep 48 backups (12 hours if every 15 min)
      backupLocation: this.backupDir,
      ...config
    }

    // Setup file paths
    this.conversationsFile = path.join(this.dataDir, 'conversations.json')
    this.knowledgeFile = path.join(this.dataDir, 'knowledge.json')
    this.blockedFile = path.join(this.dataDir, 'blocked-responses.json')
    this.excellentFile = path.join(this.dataDir, 'excellent-responses.json')
    this.statsFile = path.join(this.dataDir, 'stats.json')

    console.log('💾 Local File AI Storage initialized')
    this.initialize()
  }

  /**
   * Initialize storage directories and files
   */
  async initialize(): Promise<boolean> {
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.dataDir, { recursive: true })
      await fs.mkdir(this.backupDir, { recursive: true })

      // Initialize empty files if they don't exist
      await this.initializeFiles()

      // Setup file watchers for real-time sync
      this.setupFileWatchers()

      // Start automatic backup system
      if (this.config.enableAutoBackup) {
        this.startAutoBackup()
      }

      console.log('✅ Local AI storage ready with auto-backup system')
      console.log(`📁 Data directory: ${this.dataDir}`)
      console.log(`💾 Backup directory: ${this.backupDir}`)
      console.log(`⏱️ Auto-backup every ${this.config.backupInterval} minutes`)

      return true
    } catch (error) {
      console.error('❌ Failed to initialize local storage:', error)
      return false
    }
  }

  /**
   * Initialize empty data files
   */
  private async initializeFiles(): Promise<void> {
    const initialData = {
      [this.conversationsFile]: [],
      [this.knowledgeFile]: [],
      [this.blockedFile]: [],
      [this.excellentFile]: [],
      [this.statsFile]: {
        totalQueries: 0,
        totalFeedback: 0,
        excellentResponses: 0,
        blockedResponses: 0,
        lastUpdated: new Date().toISOString(),
        systemStarted: new Date().toISOString()
      }
    }

    for (const [filePath, data] of Object.entries(initialData)) {
      try {
        await fs.access(filePath)
        console.log('📄 Found existing file:', path.basename(filePath))
      } catch {
        await this.saveToFile(filePath, data)
        console.log('📄 Created new file:', path.basename(filePath))
      }
    }
  }

  /**
   * Setup file watchers for real-time synchronization
   */
  private setupFileWatchers(): void {
    const filesToWatch = [
      this.conversationsFile,
      this.knowledgeFile,
      this.blockedFile,
      this.excellentFile,
      this.statsFile
    ]

    filesToWatch.forEach(filePath => {
      try {
        this.watchers[filePath] = watch(filePath, (eventType) => {
          if (eventType === 'change') {
            console.log(`🔄 File changed: ${path.basename(filePath)} - Real-time sync active`)
            this.onFileChange(filePath)
          }
        })
      } catch (error) {
        console.log(`⚠️ Could not watch file: ${filePath}`)
      }
    })
  }

  /**
   * Handle file changes for real-time sync
   */
  private async onFileChange(filePath: string): Promise<void> {
    // You can implement additional sync logic here
    // For example, sync to other devices or validate data integrity
    console.log(`📡 Real-time sync triggered for ${path.basename(filePath)}`)
  }

  /**
   * Start automatic backup system
   */
  private startAutoBackup(): void {
    const intervalMs = this.config.backupInterval * 60 * 1000

    this.autoBackupTimer = setInterval(async () => {
      await this.createBackup()
      await this.cleanupOldBackups()
    }, intervalMs)

    console.log(`⏰ Auto-backup started - every ${this.config.backupInterval} minutes`)
  }

  /**
   * Save data to file with error handling
   */
  private async saveToFile(filePath: string, data: any): Promise<boolean> {
    try {
      const jsonData = JSON.stringify(data, null, 2)
      await fs.writeFile(filePath, jsonData, 'utf8')
      return true
    } catch (error) {
      console.error(`❌ Failed to save ${filePath}:`, error)
      return false
    }
  }

  /**
   * Load data from file with error handling
   */
  private async loadFromFile(filePath: string, defaultValue: any = []): Promise<any> {
    try {
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`❌ Failed to load ${filePath}:`, error)
      return defaultValue
    }
  }

  /**
   * Save conversation to local file
   */
  async saveConversation(entry: ConversationEntry): Promise<boolean> {
    try {
      const conversations = await this.getConversations()
      conversations.push(entry)
      
      const success = await this.saveToFile(this.conversationsFile, conversations)
      if (success) {
        await this.updateStats('totalQueries')
        console.log('💾 Conversation saved locally')
      }
      return success
    } catch (error) {
      console.error('❌ Failed to save conversation:', error)
      return false
    }
  }

  /**
   * Save excellent response to local file
   */
  async saveExcellentResponse(entry: ConversationEntry): Promise<boolean> {
    try {
      const excellent = await this.getExcellentResponses()
      excellent.push(entry)
      
      const success = await this.saveToFile(this.excellentFile, excellent)
      if (success) {
        await this.updateStats('excellentResponses')
        console.log('⭐ Excellent response saved locally')
      }
      return success
    } catch (error) {
      console.error('❌ Failed to save excellent response:', error)
      return false
    }
  }

  /**
   * Save knowledge entry to local file
   */
  async saveKnowledgeEntry(entry: FreshKnowledgeEntry): Promise<boolean> {
    try {
      const knowledge = await this.getKnowledgeEntries()
      knowledge.push(entry)
      
      const success = await this.saveToFile(this.knowledgeFile, knowledge)
      if (success) {
        console.log('📚 Knowledge entry saved locally')
      }
      return success
    } catch (error) {
      console.error('❌ Failed to save knowledge entry:', error)
      return false
    }
  }

  /**
   * Block response in local file
   */
  async blockResponse(entry: ConversationEntry): Promise<boolean> {
    try {
      const blocked = await this.getBlockedResponses()
      blocked.push({ ...entry, blocked: true })
      
      const success = await this.saveToFile(this.blockedFile, blocked)
      if (success) {
        await this.updateStats('blockedResponses')
        console.log('🚫 Response blocked locally')
      }
      return success
    } catch (error) {
      console.error('❌ Failed to block response:', error)
      return false
    }
  }

  /**
   * Get conversations from local file
   */
  async getConversations(): Promise<ConversationEntry[]> {
    return await this.loadFromFile(this.conversationsFile, [])
  }

  /**
   * Get excellent responses from local file
   */
  async getExcellentResponses(): Promise<ConversationEntry[]> {
    return await this.loadFromFile(this.excellentFile, [])
  }

  /**
   * Get knowledge entries from local file
   */
  async getKnowledgeEntries(): Promise<FreshKnowledgeEntry[]> {
    return await this.loadFromFile(this.knowledgeFile, [])
  }

  /**
   * Get blocked responses from local file
   */
  async getBlockedResponses(): Promise<ConversationEntry[]> {
    return await this.loadFromFile(this.blockedFile, [])
  }

  /**
   * Get stats from local file
   */
  async getStats(): Promise<any> {
    return await this.loadFromFile(this.statsFile, {
      totalQueries: 0,
      totalFeedback: 0,
      excellentResponses: 0,
      blockedResponses: 0,
      lastUpdated: new Date().toISOString()
    })
  }

  /**
   * Update stats in local file
   */
  private async updateStats(field: string): Promise<void> {
    try {
      const stats = await this.getStats()
      stats[field] = (stats[field] || 0) + 1
      stats.lastUpdated = new Date().toISOString()
      await this.saveToFile(this.statsFile, stats)
    } catch (error) {
      console.error('❌ Failed to update stats:', error)
    }
  }

  /**
   * Create manual backup
   */
  async createBackup(): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupSubDir = path.join(this.backupDir, timestamp)
      
      await fs.mkdir(backupSubDir, { recursive: true })

      const filesToBackup = [
        { src: this.conversationsFile, dest: 'conversations.json' },
        { src: this.knowledgeFile, dest: 'knowledge.json' },
        { src: this.blockedFile, dest: 'blocked-responses.json' },
        { src: this.excellentFile, dest: 'excellent-responses.json' },
        { src: this.statsFile, dest: 'stats.json' }
      ]

      for (const file of filesToBackup) {
        try {
          await fs.copyFile(file.src, path.join(backupSubDir, file.dest))
        } catch (error) {
          console.log(`⚠️ Could not backup ${file.dest}:`, error)
        }
      }

      console.log(`💾 Backup created: ${timestamp}`)
      return backupSubDir
    } catch (error) {
      console.error('❌ Failed to create backup:', error)
      return null
    }
  }

  /**
   * Clean up old backups to save space
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await fs.readdir(this.backupDir)
      
      if (backups.length > this.config.maxBackups) {
        // Sort by creation time (oldest first)
        const backupDirs = backups
          .map(name => ({
            name,
            path: path.join(this.backupDir, name),
            time: name // ISO timestamp is sortable
          }))
          .sort((a, b) => a.time.localeCompare(b.time))

        // Remove oldest backups
        const toRemove = backupDirs.slice(0, backups.length - this.config.maxBackups)
        
        for (const backup of toRemove) {
          await fs.rmdir(backup.path, { recursive: true })
          console.log(`🗑️ Removed old backup: ${backup.name}`)
        }
      }
    } catch (error) {
      console.error('❌ Failed to cleanup backups:', error)
    }
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<any> {
    try {
      const stats = await Promise.all([
        fs.stat(this.conversationsFile).catch(() => ({ size: 0 })),
        fs.stat(this.knowledgeFile).catch(() => ({ size: 0 })),
        fs.stat(this.blockedFile).catch(() => ({ size: 0 })),
        fs.stat(this.excellentFile).catch(() => ({ size: 0 })),
        fs.stat(this.statsFile).catch(() => ({ size: 0 }))
      ])

      const totalSize = stats.reduce((sum, stat) => sum + stat.size, 0)
      
      // Get backup info
      const backups = await fs.readdir(this.backupDir).catch(() => [])
      
      return {
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        dataDirectory: this.dataDir,
        backupDirectory: this.backupDir,
        totalBackups: backups.length,
        maxBackups: this.config.maxBackups,
        autoBackupEnabled: this.config.enableAutoBackup,
        backupInterval: this.config.backupInterval,
        files: {
          conversations: this.formatBytes(stats[0].size),
          knowledge: this.formatBytes(stats[1].size),
          blocked: this.formatBytes(stats[2].size),
          excellent: this.formatBytes(stats[3].size),
          stats: this.formatBytes(stats[4].size)
        }
      }
    } catch (error) {
      console.error('❌ Failed to get storage info:', error)
      return null
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<boolean> {
    try {
      const emptyData = {
        [this.conversationsFile]: [],
        [this.knowledgeFile]: [],
        [this.blockedFile]: [],
        [this.excellentFile]: [],
        [this.statsFile]: {
          totalQueries: 0,
          totalFeedback: 0,
          excellentResponses: 0,
          blockedResponses: 0,
          lastUpdated: new Date().toISOString(),
          cleared: new Date().toISOString()
        }
      }

      for (const [filePath, data] of Object.entries(emptyData)) {
        await this.saveToFile(filePath, data)
      }

      console.log('🗑️ All local data cleared')
      return true
    } catch (error) {
      console.error('❌ Failed to clear data:', error)
      return false
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupName: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, backupName)
      
      const filesToRestore = [
        { src: 'conversations.json', dest: this.conversationsFile },
        { src: 'knowledge.json', dest: this.knowledgeFile },
        { src: 'blocked-responses.json', dest: this.blockedFile },
        { src: 'excellent-responses.json', dest: this.excellentFile },
        { src: 'stats.json', dest: this.statsFile }
      ]

      for (const file of filesToRestore) {
        const srcPath = path.join(backupPath, file.src)
        try {
          await fs.copyFile(srcPath, file.dest)
        } catch (error) {
          console.log(`⚠️ Could not restore ${file.src}:`, error)
        }
      }

      console.log(`♻️ Restored from backup: ${backupName}`)
      return true
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error)
      return false
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<string[]> {
    try {
      const backups = await fs.readdir(this.backupDir)
      return backups.sort().reverse() // Newest first
    } catch (error) {
      console.error('❌ Failed to list backups:', error)
      return []
    }
  }

  /**
   * Export data to a single file
   */
  async exportData(exportPath: string): Promise<boolean> {
    try {
      const allData = {
        conversations: await this.getConversations(),
        knowledge: await this.getKnowledgeEntries(),
        blocked: await this.getBlockedResponses(),
        excellent: await this.getExcellentResponses(),
        stats: await this.getStats(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      await this.saveToFile(exportPath, allData)
      console.log(`📤 Data exported to: ${exportPath}`)
      return true
    } catch (error) {
      console.error('❌ Failed to export data:', error)
      return false
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Stop auto-backup and cleanup
   */
  async shutdown(): Promise<void> {
    // Stop auto-backup
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer)
      console.log('⏹️ Auto-backup stopped')
    }

    // Close file watchers
    for (const [filePath, watcher] of Object.entries(this.watchers)) {
      try {
        watcher.close()
      } catch (error) {
        console.log(`⚠️ Could not close watcher for ${filePath}`)
      }
    }

    console.log('🔒 Local file storage shut down')
  }
}

// Export configured instance
export const createLocalStorage = (config?: Partial<BackupConfig>) => {
  return new LocalFileAIStorage(config)
}

// Default instance with standard configuration
export const localAIStorage = new LocalFileAIStorage({
  enableAutoBackup: true,
  backupInterval: 15, // Every 15 minutes
  maxBackups: 48 // Keep 12 hours of backups
})
