#!/usr/bin/env node

/**
 * AI Knowledge Management CLI
 * Run with: npm run manage-knowledge
 */

import { KnowledgeManager } from '../src/lib/knowledge-manager'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const ai = new KnowledgeManager('./my-ai-knowledge')

async function main() {
  console.log('🤖 AI Knowledge Manager')
  console.log('========================')
  console.log('This tool helps you manage your local AI knowledge base')
  console.log('All data is stored locally on your computer!\n')
  
  try {
    const stats = await ai.init()
    console.log('📊 Current Knowledge Base:')
    console.log(`   Total Entries: ${stats.totalEntries}`)
    console.log(`   Categories: ${Object.keys(stats.categories).join(', ')}`)
    console.log(`   Storage: ${stats.directories.knowledge}\n`)
  } catch (error) {
    console.error('❌ Failed to initialize:', error)
    process.exit(1)
  }
  
  while (true) {
    console.log('📋 What would you like to do?')
    console.log('1. 🔍 Search knowledge')
    console.log('2. ➕ Add new knowledge')
    console.log('3. 🎓 Train from conversation')
    console.log('4. ⭐ Give feedback on AI response')
    console.log('5. 📊 View statistics')
    console.log('6. 📁 Browse by category')
    console.log('7. 💾 Create backup')
    console.log('8. 📥 Train from all conversations')
    console.log('9. 📄 Export as text files')
    console.log('10. ❌ Exit')
    
    const choice = await askQuestion('\nChoose option (1-10): ')
    
    try {
      switch (choice) {
        case '1':
          await searchKnowledge()
          break
        case '2':
          await addKnowledge()
          break
        case '3':
          await trainFromConversation()
          break
        case '4':
          await giveFeedback()
          break
        case '5':
          await showStats()
          break
        case '6':
          await browseByCategory()
          break
        case '7':
          await createBackup()
          break
        case '8':
          await trainFromAllConversations()
          break
        case '9':
          await exportAsText()
          break
        case '10':
          console.log('👋 Thanks for using AI Knowledge Manager!')
          rl.close()
          return
        default:
          console.log('❌ Invalid option. Please choose 1-10.')
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    console.log('\n' + '─'.repeat(50) + '\n')
  }
}

async function searchKnowledge() {
  console.log('\n🔍 Search Knowledge Base')
  
  const query = await askQuestion('Enter search query: ')
  if (!query.trim()) {
    console.log('❌ Please enter a search query')
    return
  }
  
  const category = await askQuestion('Filter by category (optional, press Enter to skip): ')
  
  console.log('🔄 Searching...')
  const results = await ai.search(query, category || undefined)
  
  if (results.length === 0) {
    console.log('😔 No results found')
    return
  }
  
  console.log(`\n✅ Found ${results.length} results:\n`)
  results.forEach((result: { entry: any; relevance: number }, i: number) => {
    console.log(`${i + 1}. 📝 ${result.entry.title}`)
    console.log(`   📊 Relevance: ${(result.relevance * 100).toFixed(1)}%`)
    console.log(`   🏷️  Category: ${result.entry.category}`)
    console.log(`   📄 Content: ${result.entry.content.substring(0, 150)}...`)
    console.log()
  })
}

async function addKnowledge() {
  console.log('\n➕ Add New Knowledge')
  
  const title = await askQuestion('📝 Title: ')
  if (!title.trim()) {
    console.log('❌ Title is required')
    return
  }
  
  const content = await askQuestion('📄 Content: ')
  if (!content.trim()) {
    console.log('❌ Content is required')
    return
  }
  
  console.log('\n📁 Available categories:')
  console.log('  • services - Service offerings and business solutions')
  console.log('  • technical - Technical knowledge and solutions')
  console.log('  • business - Business processes and information')
  console.log('  • projects - Project examples and case studies')
  console.log('  • user-questions - User-generated questions and answers')
  
  const category = await askQuestion('\n🏷️  Category: ')
  const validCategories = ['services', 'technical', 'business', 'projects', 'user-questions']
  
  if (!validCategories.includes(category)) {
    console.log('❌ Invalid category. Please use one of: ' + validCategories.join(', '))
    return
  }
  
  const tagsInput = await askQuestion('🏷️  Tags (comma-separated, optional): ')
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined
  
  try {
    await ai.addKnowledge({ 
      title, 
      content, 
      category: category as any,
      tags 
    })
    console.log('✅ Knowledge added successfully!')
  } catch (error) {
    console.log('❌ Error adding knowledge:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function trainFromConversation() {
  console.log('\n🎓 Train from Conversation')
  console.log('This helps your AI learn from good question-answer pairs')
  
  const question = await askQuestion('\n❓ User question: ')
  if (!question.trim()) {
    console.log('❌ Question is required')
    return
  }
  
  const answer = await askQuestion('💡 Good answer: ')
  if (!answer.trim()) {
    console.log('❌ Answer is required')
    return
  }
  
  const category = await askQuestion('🏷️  Category (default: user-questions): ') || 'user-questions'
  
  try {
    await ai.trainFromChat(question, answer, category)
    console.log('✅ Training data added! Your AI is now smarter!')
  } catch (error) {
    console.log('❌ Error training:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function giveFeedback() {
  console.log('\n⭐ Give Feedback on AI Response')
  console.log('This helps improve your AI over time')
  
  const question = await askQuestion('\n❓ Original question: ')
  const answer = await askQuestion('🤖 AI response: ')
  
  console.log('\n⭐ Rate this response:')
  console.log('1 - Very poor')
  console.log('2 - Poor') 
  console.log('3 - Average')
  console.log('4 - Good')
  console.log('5 - Excellent')
  
  const ratingInput = await askQuestion('\nRating (1-5): ')
  const rating = parseInt(ratingInput)
  
  if (rating < 1 || rating > 5 || isNaN(rating)) {
    console.log('❌ Please enter a rating between 1 and 5')
    return
  }
  
  const feedback = await askQuestion('💬 Additional feedback (optional): ')
  
  try {
    const wasGood = await ai.giveFeedback(question, answer, rating as any, feedback || undefined)
    console.log('✅ Feedback saved!')
    
    if (wasGood) {
      console.log('🎉 Good rating! This response was added to the knowledge base.')
    }
  } catch (error) {
    console.log('❌ Error saving feedback:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function showStats() {
  console.log('\n📊 Knowledge Base Statistics')
  
  const stats = ai.getStats()
  
  console.log(`\n📚 Total Entries: ${stats.totalEntries}`)
  console.log(`📂 Storage Location: ${stats.directories.knowledge}`)
  console.log(`🗃️  Training Data: ${stats.directories.training}`)
  console.log(`🕐 Last Updated: ${new Date(stats.lastUpdated).toLocaleString()}`)
  
  console.log('\n📁 Categories:')
  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`  • ${category}: ${count} entries`)
  })
  
  // Show most used knowledge
  console.log('\n🔥 Most Used Knowledge:')
  const mostUsed = ai.getMostUsedKnowledge(5)
  mostUsed.forEach((entry: any, i: number) => {
    const usage = entry.metadata.usage_count || 0
    console.log(`  ${i + 1}. ${entry.title} (used ${usage} times)`)
  })
  
  // Show recently updated
  console.log('\n🆕 Recently Updated:')
  const recent = ai.getRecentKnowledge(5)
  recent.forEach((entry: any, i: number) => {
    const date = new Date(entry.metadata.lastUpdated).toLocaleDateString()
    console.log(`  ${i + 1}. ${entry.title} (${date})`)
  })
}

async function browseByCategory() {
  console.log('\n📁 Browse by Category')
  
  const stats = ai.getStats()
  const categories = Object.keys(stats.categories)
  
  console.log('\nAvailable categories:')
  categories.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat} (${stats.categories[cat]} entries)`)
  })
  
  const choice = await askQuestion('\nChoose category number: ')
  const categoryIndex = parseInt(choice) - 1
  
  if (categoryIndex < 0 || categoryIndex >= categories.length) {
    console.log('❌ Invalid category choice')
    return
  }
  
  const selectedCategory = categories[categoryIndex]
  const entries = ai.getKnowledgeByCategory(selectedCategory)
  
  console.log(`\n📚 Knowledge in '${selectedCategory}' category:\n`)
  entries.forEach((entry: any, i: number) => {
    console.log(`${i + 1}. 📝 ${entry.title}`)
    console.log(`   📄 ${entry.content.substring(0, 100)}...`)
    console.log(`   🕐 Updated: ${new Date(entry.metadata.lastUpdated).toLocaleDateString()}`)
    console.log()
  })
}

async function createBackup() {
  console.log('\n💾 Creating Backup...')
  
  try {
    const backupFile = await ai.backup()
    console.log(`✅ Backup created successfully!`)
    console.log(`📁 Location: ${backupFile}`)
    console.log('\n💡 Tip: Keep this backup file safe. You can restore from it anytime.')
  } catch (error) {
    console.log('❌ Backup failed:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function trainFromAllConversations() {
  console.log('\n🎓 Training from All Conversations...')
  console.log('This will review all saved conversations and add good ones to knowledge base')
  
  const confirm = await askQuestion('Continue? (y/n): ')
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Training cancelled')
    return
  }
  
  try {
    const trainedCount = await ai.trainFromAllConversations()
    console.log(`✅ Training completed!`)
    console.log(`🎉 Added ${trainedCount} new knowledge entries from conversations`)
  } catch (error) {
    console.log('❌ Training failed:', error instanceof Error ? error.message : 'Unknown error')
  }
}

async function exportAsText() {
  console.log('\n📄 Export as Text Files...')
  console.log('This will create readable Markdown files of your knowledge base')
  
  try {
    const exportDir = await ai.exportAsText()
    console.log(`✅ Export completed!`)
    console.log(`📁 Files saved to: ${exportDir}`)
    console.log('\n💡 You can now read, edit, or share these files easily!')
  } catch (error) {
    console.log('❌ Export failed:', error instanceof Error ? error.message : 'Unknown error')
  }
}

function askQuestion(question: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(question, resolve)
  })
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Thanks for using AI Knowledge Manager!')
  rl.close()
  process.exit(0)
})

// Run the CLI
main().catch(error => {
  console.error('❌ Fatal error:', error)
  rl.close()
  process.exit(1)
})
