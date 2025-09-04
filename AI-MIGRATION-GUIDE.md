# AI Storage Migration Guide

This project supports both browser (localStorage) and Node.js/Electron (filesystem) storage for the AI system. Here's how to migrate between them.

## Current Setup

- **Browser**: Uses `enhancedLocalAI` with localStorage
- **Node/Electron**: Uses `NodeFileAIStorage` with filesystem
- **Migration**: Seamless data transfer between storage types

## Migration Options

### Option 1: Export/Import (Simple)

**Step 1: Export from Browser**
1. Open the app in browser
2. Go to Settings → Open Knowledge Manager
3. Click "Export JSON" to download your data

**Step 2: Import to Node/Server**
```bash
# Run the seeder script
node scripts/seed-ai-data.mjs path/to/your-export.json ./ai-data

# Example
node scripts/seed-ai-data.mjs downloads/devvibe-knowledge-export-1234567890.json ./ai-data
```

### Option 2: Electron Live Migration

**Setup Electron IPC** (main process):
```typescript
import { setupElectronMigrationHandlers } from './src/lib/migration-helpers'

// In your main.ts
setupElectronMigrationHandlers(ipcMain)
```

**Setup preload script**:
```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  migrateAI: (data: any, dataDir?: string) => ipcRenderer.invoke('ai:migrate', data, dataDir),
  exportAI: () => ipcRenderer.invoke('ai:export')
})
```

**Migrate from renderer**:
```typescript
import { ElectronMigrationClient } from './src/lib/electron-migration'

// Migrate browser data to main process filesystem
const result = await ElectronMigrationClient.migrateToMain('./ai-data')
if (result.success) {
  console.log('Migrated!', result.counts)
}
```

## Using Node Storage Directly

```typescript
import { NodeFileAIStorage } from './src/lib/node-file-ai-storage'

const storage = new NodeFileAIStorage({ dataDir: './ai-data' })
await storage.initialize()

// Add knowledge
await storage.saveKnowledgeEntry({
  id: Date.now().toString(),
  title: 'My Topic',
  content: 'Detailed content...',
  keywords: ['topic', 'content'],
  rating: 5,
  usageCount: 0,
  timestamp: new Date().toISOString(),
  blocked: false
})

// Get stats
const stats = await storage.getStats()
console.log(stats)
```

## Data Directories

### Browser Storage
- **Location**: `localStorage` in browser
- **Keys**: `devvibe-ai-*`
- **Backup**: Snapshots in localStorage

### Node Storage  
- **Location**: `./ai-data/` (configurable)
- **Files**:
  - `conversations.json` - All conversations
  - `excellent.json` - 5-star responses  
  - `knowledge.json` - Knowledge base entries
  - `blocked.json` - Blocked responses
  - `meta.json` - Query counts and metadata
  - `backups/` - Timestamped backups

## Development Workflow

1. **Start in browser**: Use localStorage for development
2. **Train the AI**: Add knowledge via Knowledge Manager (/knowledge)
3. **Export when ready**: Download JSON export
4. **Seed Node storage**: Run seeder script for production/desktop
5. **Use Node storage**: Switch to filesystem for production

## Scripts Available

```bash
# Seed from export
node scripts/seed-ai-data.mjs export.json ./ai-data

# Start dev server (browser storage)
npm run dev

# Build for production
npm run build
```

## Tips

- **Browser first**: Develop and train in browser with immediate feedback
- **Export regularly**: Create backups before major changes
- **Node for production**: Use filesystem storage for desktop/server deployments
- **Seamless switching**: Migration preserves all your training data

The AI learns from:
- ⭐ 5-star feedback → Excellent responses (reused immediately)
- 📚 4-star feedback → Knowledge base (used for similar questions)  
- 🚫 1-2 star feedback → Blocked responses (never repeated)
