// Example: How Your AI Learns Over Time

import { KnowledgeManager } from './src/lib/knowledge-manager'

async function demonstrateLearning() {
  const km = new KnowledgeManager()
  
  // === SCENARIO: User asks about pricing ===
  
  // Initial response (basic knowledge)
  console.log("📅 Day 1: User asks about pricing")
  let results = await km.search("What are your prices?")
  console.log("AI Response: Basic pricing info from initial knowledge")
  
  // User provides feedback
  await km.giveFeedback(
    "What are your prices?", 
    "Basic pricing response",
    2, // Low rating
    "Need more specific pricing for different business sizes"
  )
  
  // === LEARNING: AI improves its response ===
  
  // Add improved knowledge based on feedback
  console.log("\n🎓 AI Learning: Adding detailed pricing info...")
  await km.addKnowledge(
    "Detailed Business Pricing",
    `Pricing varies by business size:
    • Startups (1-10 employees): $99/month
    • Small Business (11-50 employees): $199/month  
    • Medium Business (51-200 employees): $399/month
    • Enterprise (200+ employees): Custom pricing
    
    All plans include free setup, training, and 24/7 support.`,
    'services',
    ['pricing', 'business-size', 'plans', 'startups', 'enterprise']
  )
  
  // === RESULT: Better response next time ===
  
  console.log("\n📅 Day 15: Same user asks about pricing again")
  results = await km.search("What are your prices for small businesses?")
  console.log("AI Response: Detailed, business-size specific pricing")
  
  // User loves the new response
  await km.giveFeedback(
    "What are your prices for small businesses?",
    "Detailed pricing response",
    5, // Excellent rating
    "Perfect! Exactly what I needed to know"
  )
  
  console.log("✅ AI automatically saves this as high-quality knowledge")
  
  // === ADVANCED LEARNING: Pattern Recognition ===
  
  console.log("\n🧠 AI Pattern Learning:")
  console.log("• Learned that users want specific pricing by business size")
  console.log("• Increased priority for 'business-size' keyword")
  console.log("• Will proactively mention business-size options in future")
  
  return "AI successfully learned and improved!"
}

// Example output:
demonstrateLearning().then(console.log)
