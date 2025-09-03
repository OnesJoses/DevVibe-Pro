const fs = require('fs')
const path = require('path')

// Simple test to verify the knowledge directory is created
async function testKnowledgeSetup() {
  try {
    console.log('🔬 Testing Local Knowledge Management System Setup...\n')
    
    const knowledgeDir = path.join(__dirname, 'my-ai-knowledge')
    console.log('📁 Knowledge directory path:', knowledgeDir)
    
    // Test if directory exists or create it
    if (!fs.existsSync(knowledgeDir)) {
      fs.mkdirSync(knowledgeDir, { recursive: true })
      console.log('✅ Created knowledge directory')
    } else {
      console.log('✅ Knowledge directory already exists')
    }
    
    // Create subdirectories
    const subdirs = ['services', 'technical', 'business', 'projects', 'user-questions']
    subdirs.forEach(subdir => {
      const subdirPath = path.join(knowledgeDir, subdir)
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true })
        console.log(`✅ Created ${subdir} directory`)
      }
    })
    
    // Test writing a simple knowledge entry
    const testEntry = {
      id: 'test-entry-' + Date.now(),
      title: 'DevVibe Pro Test Entry',
      content: 'This is a test entry to verify the local knowledge system works.',
      category: 'business',
      keywords: ['test', 'verification', 'system'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        source: 'test',
        confidence: 1.0
      }
    }
    
    const testFilePath = path.join(knowledgeDir, 'business', `${testEntry.id}.json`)
    fs.writeFileSync(testFilePath, JSON.stringify(testEntry, null, 2))
    console.log('✅ Test knowledge entry created:', testEntry.title)
    
    // Verify we can read it back
    const readEntry = JSON.parse(fs.readFileSync(testFilePath, 'utf8'))
    console.log('✅ Successfully read back test entry:', readEntry.title)
    
    console.log('\n🎉 Local knowledge system setup is working correctly!')
    console.log('📋 Your knowledge will be stored in:', knowledgeDir)
    console.log('🔧 You can now use the TypeScript files to manage your AI knowledge')
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message)
  }
}

testKnowledgeSetup()
