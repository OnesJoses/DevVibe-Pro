console.log('Starting debug script...')

try {
  console.log('Loading environment...')
  require('dotenv/config')
  
  console.log('Loading modules...')
  const express = require('express')
  const cors = require('cors')
  
  console.log('Creating app...')
  const app = express()
  const PORT = process.env.PORT || 4000
  
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  
  app.get('/', (req, res) => {
    res.json({ message: 'Debug API is running!', timestamp: new Date().toISOString() })
  })
  
  app.get('/health', (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() })
  })
  
  console.log(`Starting server on port ${PORT}...`)
  app.listen(PORT, () => {
    console.log(`✅ Debug API server is running on http://localhost:${PORT}`)
  })
  
} catch (error) {
  console.error('❌ Error starting server:', error)
  process.exit(1)
}
