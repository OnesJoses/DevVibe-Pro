// Test script to verify AI training system works
import { aiComprehension } from './src/lib/ai-comprehension.js'
import { aiLearning } from './src/lib/ai-learning.js'
import { seedLearningSystem } from './src/lib/ai-training-data.js'

console.log('🧪 Testing AI Training System...')

try {
  // Test question analysis
  const analysis = aiComprehension.analyzeQuestion("What services do you offer?")
  console.log('✅ Question Analysis:', analysis)

  // Test learning system
  const insights = aiLearning.getInsights()
  console.log('✅ Learning Insights:', insights)

  // Test seeding
  seedLearningSystem(aiLearning)
  const newInsights = aiLearning.getInsights()
  console.log('✅ After Seeding:', newInsights)

  console.log('🎉 All AI training components working properly!')
} catch (error) {
  console.error('❌ Error testing AI system:', error)
}
