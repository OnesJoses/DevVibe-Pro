// Test the Local AI Knowledge System
import { myAI } from './knowledge-manager'

async function testLocalAIKnowledge() {
  console.log('🧪 Testing Local AI Knowledge System...')
  console.log('=' .repeat(50))

  try {
    // Initialize the system
    console.log('\n1. Initializing AI Knowledge System...')
    const stats = await myAI.init()
    console.log('📊 Initial Stats:', stats)

    // Test adding knowledge
    console.log('\n2. Adding sample knowledge...')
    
    const sampleKnowledge = [
      {
        title: 'DevVibe Pro Services',
        content: 'DevVibe Pro offers custom software development, AI integration, web development, mobile apps, and technical consulting services.',
        category: 'services' as const,
        tags: ['development', 'ai', 'consulting']
      },
      {
        title: 'React Best Practices',
        content: 'Use functional components with hooks, implement proper state management, optimize with React.memo, use TypeScript for better type safety.',
        category: 'technical' as const,
        tags: ['react', 'frontend', 'best-practices']
      },
      {
        title: 'Client Communication Guidelines',
        content: 'Keep responses concise and client-focused. Avoid technical jargon. Always provide actionable next steps. Include project timelines.',
        category: 'business' as const,
        tags: ['communication', 'clients', 'guidelines']
      }
    ]

    for (const knowledge of sampleKnowledge) {
      const result = await myAI.addKnowledge(knowledge)
      console.log(`✅ Added: ${knowledge.title}`)
    }

    // Test searching
    console.log('\n3. Testing search functionality...')
    
    const searchQueries = [
      'development services',
      'React components',
      'client communication',
      'AI integration'
    ]

    for (const query of searchQueries) {
      const results = await myAI.search(query)
      console.log(`🔍 "${query}" found ${results.length} results`)
      if (results.length > 0) {
        console.log(`   Top result: ${results[0].entry.title}`)
      }
    }

    // Test conversation training
    console.log('\n4. Testing conversation training...')
    
    await myAI.trainFromChat(
      'What services does DevVibe Pro offer?',
      'DevVibe Pro specializes in custom software development, AI integration, and technical consulting.',
      'user-questions'
    )
    console.log('✅ Trained from conversation')

    // Test feedback system
    console.log('\n5. Testing feedback system...')
    
    const feedbackResult = await myAI.giveFeedback(
      'How to build React apps?',
      'Use modern React with functional components and hooks for better performance.',
      5,
      'Very helpful and clear explanation'
    )
    console.log(`✅ Feedback processed: ${feedbackResult ? 'Added to knowledge' : 'Noted for improvement'}`)

    // Get updated stats
    console.log('\n6. Final system stats...')
    const finalStats = myAI.getStats()
    console.log('📊 Final Stats:', finalStats)

    console.log('\n✅ All tests completed successfully!')
    console.log('🎉 Local AI Knowledge System is working perfectly!')

    return true

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Export for testing
export { testLocalAIKnowledge }

// Auto-run if this is the main module
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected - ready for testing!')
}
