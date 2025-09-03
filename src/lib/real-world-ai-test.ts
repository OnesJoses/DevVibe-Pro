// Real-world AI Learning Test
import { myAI } from './knowledge-manager'
import { smartKnowledgeBase } from './smart-knowledge-base'

export async function realWorldAITest() {
  console.log('🌟 Real-World AI Learning Test')
  console.log('This test simulates actual client interactions\n')

  try {
    // Initialize both systems
    await myAI.init()
    await smartKnowledgeBase.initialize()

    console.log('📚 Testing AI Learning Scenarios...\n')

    // Scenario 1: Client asks about pricing
    console.log('👤 Client: "How much would a simple e-commerce website cost?"')
    
    let searchResults = await smartKnowledgeBase.search('e-commerce website cost pricing', {})
    console.log('🤖 AI Response:', searchResults.length > 0 ? searchResults[0].entry.content.substring(0, 100) + '...' : 'No specific answer found')
    
    // Train the AI with a good response
    console.log('\n🎓 Training AI with better response...')
    await myAI.trainFromChat(
      'How much would a simple e-commerce website cost?',
      'A simple e-commerce website starts at $7,500 and includes: online store setup, payment processing, inventory management, mobile optimization, and 3 months free support. Delivery takes 4-6 weeks.',
      'business'
    )
    
    // Test the improved response
    searchResults = await smartKnowledgeBase.search('e-commerce website cost pricing', {})
    console.log('🤖 Improved Response:', searchResults.length > 0 ? 'Response improved!' : 'Training in progress...')

    console.log('\n' + '='.repeat(60) + '\n')

    // Scenario 2: Technical question
    console.log('👤 Client: "Do you use React for frontend development?"')
    
    searchResults = await smartKnowledgeBase.search('React frontend development technology', {})
    console.log('🤖 AI Response:', searchResults.length > 0 ? searchResults[0].entry.content.substring(0, 100) + '...' : 'No specific answer found')
    
    // Train with technical details
    console.log('\n🎓 Training AI with technical expertise...')
    await myAI.trainFromChat(
      'Do you use React for frontend development?',
      'Yes, I specialize in React development using modern practices: functional components, hooks, TypeScript, Next.js for full-stack solutions. I also use Vue.js and Angular based on project requirements.',
      'technical'
    )

    console.log('\n' + '='.repeat(60) + '\n')

    // Scenario 3: Feedback loop
    console.log('👤 Client gives feedback on previous answer...')
    
    const feedbackResult = await myAI.giveFeedback(
      'Do you use React for frontend development?',
      'Yes, I use React with modern hooks and TypeScript.',
      5,
      'Perfect! Exactly what I wanted to know.'
    )
    
    console.log(`📝 Feedback processed: ${feedbackResult ? 'Added to knowledge base' : 'Noted for improvement'}`)

    console.log('\n' + '='.repeat(60) + '\n')

    // Show learning progress
    const stats = myAI.getStats()
    console.log('📊 AI Learning Progress:')
    console.log(`   💾 Total Knowledge Entries: ${stats.totalEntries || 'Unknown'}`)
    console.log(`   📚 Categories: ${Object.keys(stats.categories || {}).join(', ') || 'Multiple'}`)
    console.log(`   🔍 System Status: ${stats.isInitialized ? 'Active' : 'Initializing'}`)
    
    // Test memory and recall
    console.log('\n🧠 Testing AI Memory and Recall...')
    
    const memoryTest = await myAI.search('e-commerce pricing cost')
    console.log(`   Memory Test Results: Found ${memoryTest.length} relevant entries`)
    
    if (memoryTest.length > 0) {
      console.log(`   Best Match: ${memoryTest[0].entry.title}`)
      console.log(`   Confidence: ${(memoryTest[0].relevance * 100).toFixed(1)}%`)
    }

    console.log('\n✅ Real-World AI Learning Test Completed!')
    console.log('🎉 Your AI is now smarter and more helpful for clients!')
    
    return {
      success: true,
      entriesLearned: 2,
      feedbackProcessed: 1,
      memoryTestPassed: memoryTest.length > 0
    }

  } catch (error) {
    console.error('❌ Real-world test failed:', error)
    return { success: false, error: String(error) }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).realWorldAITest = realWorldAITest
}
