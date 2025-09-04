// Initial training data for the AI learning system
export const initialTrainingData = {
  services: {
    patterns: [
      "What services do you offer?",
      "What can you help me with?",
      "What do you do?",
      "What services are available?",
      "Tell me about your services"
    ],
    bestAnswer: "I offer comprehensive development services including custom web and mobile development, AI integration, automation solutions, UX design, technical consulting, and ongoing maintenance. I specialize in creating scalable, modern applications using the latest technologies.",
    context: {
      questionType: 'services',
      confidence: 0.95,
      keywords: ['services', 'offer', 'development', 'web', 'mobile', 'AI']
    }
  },
  
  pricing: {
    patterns: [
      "How much do you charge?",
      "What are your rates?",
      "What does it cost?",
      "Pricing information",
      "How much for a website?"
    ],
    bestAnswer: "My pricing structure is designed to be fair and transparent. Project costs vary based on complexity, timeline, and specific requirements. I offer both fixed-price projects and hourly rates. I'd be happy to provide a detailed quote based on your specific needs.",
    context: {
      questionType: 'pricing',
      confidence: 0.90,
      keywords: ['pricing', 'cost', 'rates', 'charge', 'budget']
    }
  },
  
  process: {
    patterns: [
      "What is your development process?",
      "How do you work?",
      "What are the steps?",
      "How does your process work?",
      "Tell me about your methodology"
    ],
    bestAnswer: "My development process is structured and collaborative: 1. Discovery & Planning - Understanding your goals and requirements, 2. Design & Architecture - Creating user-focused designs and technical blueprints, 3. Development - Building with modern technologies and best practices, 4. Testing & Quality Assurance - Ensuring everything works perfectly, 5. Deployment & Launch - Going live with proper setup, 6. Support & Maintenance - Ongoing updates and improvements. This ensures quality results and keeps you informed throughout.",
    context: {
      questionType: 'process',
      confidence: 0.88,
      keywords: ['process', 'methodology', 'steps', 'workflow', 'approach']
    }
  },
  
  contact: {
    patterns: [
      "How can I contact you?",
      "How to reach you?",
      "Contact information",
      "Get in touch",
      "How to hire you?"
    ],
    bestAnswer: "You can reach me through several channels: email for detailed project discussions, LinkedIn for professional networking, or through this AI system for quick questions. I typically respond within 24 hours and am always happy to discuss your project needs.",
    context: {
      questionType: 'contact',
      confidence: 0.92,
      keywords: ['contact', 'reach', 'email', 'hire', 'touch']
    }
  },
  
  experience: {
    patterns: [
      "What is your experience?",
      "Tell me about your background",
      "Your portfolio",
      "Years of experience",
      "What projects have you worked on?"
    ],
    bestAnswer: "I bring extensive experience to every project, with a strong background in full-stack development, AI integration, and modern web technologies. I've worked on projects ranging from small business websites to complex enterprise applications, always focusing on quality, performance, and user experience.",
    context: {
      questionType: 'experience',
      confidence: 0.85,
      keywords: ['experience', 'background', 'portfolio', 'projects', 'skills']
    }
  },
  
  technical: {
    patterns: [
      "What technologies do you use?",
      "Your tech stack",
      "Programming languages",
      "What frameworks?",
      "Technical skills"
    ],
    bestAnswer: "I work with modern, reliable technologies including React, TypeScript, Node.js, Python, PostgreSQL, and cloud platforms like AWS and Google Cloud. I choose technologies based on your project's specific requirements, always prioritizing performance, maintainability, and scalability.",
    context: {
      questionType: 'technical',
      confidence: 0.90,
      keywords: ['technology', 'tech', 'stack', 'programming', 'framework']
    }
  }
}

// Function to seed the learning system with initial data
export function seedLearningSystem(aiLearning: any) {
  console.log('🌱 Seeding AI learning system with initial training data...')
  
  Object.entries(initialTrainingData).forEach(([category, data]) => {
    data.patterns.forEach(pattern => {
      aiLearning.recordSuccess(pattern, data.bestAnswer, data.context, 5)
    })
  })
  
  console.log('✅ Learning system seeded with high-quality training data')
  console.log('📊 Learning insights:', aiLearning.getInsights())
}
