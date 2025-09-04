/**
 * Google Cloud Setup Test Script
 * Run this to verify your Google Cloud configuration is working
 */

import { cloudConfig } from './src/lib/cloud-config.js'
import { GoogleCloudAIStorage } from './src/lib/google-cloud-ai-storage.js'

async function testGoogleCloudSetup() {
  console.log('🧪 Testing Google Cloud Storage Setup...\n')
  
  // Display current configuration
  console.log('📋 Current Configuration:')
  console.log('Project ID:', cloudConfig.projectId)
  console.log('Bucket Name:', cloudConfig.bucketName)
  console.log('Key File:', cloudConfig.keyFilename)
  console.log('')
  
  // Check if configuration looks valid
  if (cloudConfig.projectId === 'your-project-id-here') {
    console.log('❌ ERROR: Please update your project ID in src/lib/cloud-config.ts')
    return false
  }
  
  if (cloudConfig.bucketName === 'your-bucket-name-here') {
    console.log('❌ ERROR: Please update your bucket name in src/lib/cloud-config.ts')
    return false
  }
  
  try {
    // Test cloud storage initialization
    console.log('🔄 Initializing Google Cloud Storage...')
    const storage = new GoogleCloudAIStorage(cloudConfig)
    
    console.log('🔄 Testing bucket access...')
    const initialized = await storage.initialize()
    
    if (initialized) {
      console.log('✅ SUCCESS: Google Cloud Storage is working!')
      console.log('')
      
      // Test basic operations
      console.log('🔄 Testing data operations...')
      
      // Test saving data
      const testEntry = {
        id: 'test-' + Date.now(),
        question: 'Test question',
        answer: 'Test answer',
        rating: 5,
        timestamp: new Date().toISOString(),
        blocked: false
      }
      
      await storage.saveConversation(testEntry)
      console.log('✅ Test conversation saved')
      
      await storage.saveExcellentResponse(testEntry)
      console.log('✅ Test excellent response saved')
      
      // Test reading data
      const conversations = await storage.getConversations()
      const excellent = await storage.getExcellentResponses()
      
      console.log('✅ Data reading successful')
      console.log(`📊 Found ${conversations.length} conversations`)
      console.log(`⭐ Found ${excellent.length} excellent responses`)
      
      // Test stats
      const stats = await storage.getStats()
      console.log('✅ Stats retrieved:', stats)
      
      // Test storage info
      const storageInfo = await storage.getStorageInfo()
      console.log('✅ Storage info:', storageInfo)
      
      console.log('')
      console.log('🎉 All tests passed! Your Google Cloud setup is ready.')
      console.log('💡 You can now use the cloud-powered AI system.')
      
      return true
      
    } else {
      console.log('❌ Failed to initialize Google Cloud Storage')
      console.log('')
      console.log('🔧 Troubleshooting:')
      console.log('1. Check if your service account key file exists')
      console.log('2. Verify your project ID and bucket name')
      console.log('3. Ensure Cloud Storage API is enabled')
      console.log('4. Check if billing is enabled for your project')
      
      return false
    }
    
  } catch (error) {
    console.log('❌ ERROR:', error.message)
    console.log('')
    console.log('🔧 Common Issues:')
    console.log('• Service account key file not found or invalid')
    console.log('• Project ID or bucket name incorrect')
    console.log('• Cloud Storage API not enabled')
    console.log('• Insufficient permissions on service account')
    console.log('• Billing not enabled')
    
    return false
  }
}

// Run the test
testGoogleCloudSetup()
  .then(success => {
    if (success) {
      console.log('\n🚀 Ready to use cloud-powered AI!')
    } else {
      console.log('\n❌ Setup incomplete - please fix the issues above')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test script error:', error)
    process.exit(1)
  })
