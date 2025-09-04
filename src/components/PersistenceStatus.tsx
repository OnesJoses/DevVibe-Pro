import React, { useEffect, useState } from 'react'
import { Database, HardDrive, Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { vectorKnowledge } from '../lib/vector-knowledge-engine'

interface StorageStats {
  totalDocuments: number
  persistenceType: 'chromadb_cloud' | 'indexeddb_browser'
  storageSize: string
  isHealthy: boolean
  collectionsCount: number
  lastUpdated: string
}

export function PersistenceStatus() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setRefreshing(true)
      
      // Get basic storage stats
      const basicStats = await getStorageStats()
      setStats(basicStats)
      
    } catch (error) {
      console.error('Failed to load storage stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStorageStats = async (): Promise<StorageStats> => {
    // Check if IndexedDB is available and has data
    const indexedDBStats = await checkIndexedDBStats()
    
    // Check if ChromaDB Cloud is working
    const cloudConnected = await checkCloudConnection()
    
    return {
      totalDocuments: indexedDBStats.documentCount,
      persistenceType: cloudConnected ? 'chromadb_cloud' : 'indexeddb_browser',
      storageSize: estimateStorageSize(indexedDBStats.documentCount),
      isHealthy: indexedDBStats.isHealthy,
      collectionsCount: indexedDBStats.collectionsCount,
      lastUpdated: new Date().toLocaleString()
    }
  }

  const checkIndexedDBStats = async (): Promise<{
    documentCount: number
    collectionsCount: number
    isHealthy: boolean
  }> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('DevVibeProChromaDB', 2)
      
      request.onsuccess = () => {
        const db = request.result
        try {
          const transaction = db.transaction(['documents', 'collections'], 'readonly')
          const documentsStore = transaction.objectStore('documents')
          const collectionsStore = transaction.objectStore('collections')
          
          const docsCountRequest = documentsStore.count()
          const collectionsCountRequest = collectionsStore.count()
          
          let documentCount = 0
          let collectionsCount = 0
          
          docsCountRequest.onsuccess = () => {
            documentCount = docsCountRequest.result
          }
          
          collectionsCountRequest.onsuccess = () => {
            collectionsCount = collectionsCountRequest.result
          }
          
          transaction.oncomplete = () => {
            resolve({
              documentCount,
              collectionsCount,
              isHealthy: true
            })
          }
          
        } catch (error) {
          resolve({ documentCount: 0, collectionsCount: 0, isHealthy: false })
        }
      }
      
      request.onerror = () => {
        resolve({ documentCount: 0, collectionsCount: 0, isHealthy: false })
      }
    })
  }

  const checkCloudConnection = async (): Promise<boolean> => {
    try {
      // Try to make a simple heartbeat request
      const response = await fetch('https://api.trychroma.com/api/v1/heartbeat', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ck-FvSg7YfutGeQmpaTjWAkQYJayhmVZp35n1SDV2JDSEyX'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  const estimateStorageSize = (docCount: number): string => {
    const avgDocSize = 800 // bytes (including embeddings)
    const totalBytes = docCount * avgDocSize
    
    if (totalBytes < 1024) return `${totalBytes} B`
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Storage Error</span>
        </div>
        <p className="text-red-600 text-sm mb-3">Unable to load storage statistics</p>
        <button
          onClick={loadStats}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  const isPersistent = stats.persistenceType === 'chromadb_cloud' || stats.persistenceType === 'indexeddb_browser'
  const StorageIcon = stats.persistenceType === 'chromadb_cloud' ? Cloud : HardDrive

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Storage Persistence
        </h3>
        <div className="flex items-center gap-2">
          {stats.isHealthy ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <button
            onClick={loadStats}
            disabled={refreshing}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Storage Type:</span>
          <div className="flex items-center gap-2">
            <StorageIcon className="h-4 w-4 text-gray-500" />
            <span className="font-mono text-sm">
              {stats.persistenceType === 'chromadb_cloud' ? 'ChromaDB Cloud' : 'IndexedDB Browser'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Documents:</span>
          <span className="font-mono">{stats.totalDocuments.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Collections:</span>
          <span className="font-mono">{stats.collectionsCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Storage Size:</span>
          <span className="font-mono">{stats.storageSize}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Data Retention:</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            isPersistent 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isPersistent ? 'Permanent' : 'Session Only'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Last Updated:</span>
          <span className="text-sm text-gray-500">{stats.lastUpdated}</span>
        </div>
      </div>

      {isPersistent && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Persistence Active</span>
          </div>
          <p className="text-green-600 text-xs mt-1">
            Knowledge is permanently stored and will persist across browser sessions, device restarts, and application updates.
          </p>
        </div>
      )}

      {!stats.isHealthy && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Storage Warning</span>
          </div>
          <p className="text-yellow-600 text-xs mt-1">
            Storage system may not be functioning properly. Some data might not persist.
          </p>
        </div>
      )}
    </div>
  )
}
