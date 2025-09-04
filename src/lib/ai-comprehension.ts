// Enhanced AI comprehension and logical reasoning system
export class AIComprehensionEngine {
  private questionTypes: Record<string, {
    patterns: string[],
    responseStyle: string,
    expectedStructure: string
  }> = {
    'services': {
      patterns: ['what services', 'what do you offer', 'services available', 'what can you do'],
      responseStyle: 'direct_list',
      expectedStructure: 'I offer: [list of services]'
    },
    'pricing': {
      patterns: ['how much', 'cost', 'price', 'pricing', 'rates', 'budget'],
      responseStyle: 'structured_pricing',
      expectedStructure: 'Pricing varies based on: [factors]. Typical ranges: [ranges]'
    },
    'process': {
      patterns: ['how do you', 'what is your process', 'how does it work', 'steps'],
      responseStyle: 'step_by_step',
      expectedStructure: 'My process involves: 1. [step] 2. [step] 3. [step]'
    },
    'contact': {
      patterns: ['how to contact', 'reach you', 'get in touch', 'contact info'],
      responseStyle: 'contact_info',
      expectedStructure: 'You can reach me via: [contact methods]'
    },
    'experience': {
      patterns: ['experience', 'background', 'portfolio', 'work history'],
      responseStyle: 'credibility_focused',
      expectedStructure: 'I have [years] of experience in [areas]'
    },
    'technical': {
      patterns: ['tech stack', 'technologies', 'programming', 'frameworks'],
      responseStyle: 'technical_detailed',
      expectedStructure: 'I work with: [technologies] for [purposes]'
    }
  }

  // Analyze the intent and emotional context of a question
  analyzeQuestion(question: string): {
    intent: string,
    questionType: string,
    urgency: 'low' | 'medium' | 'high',
    emotional_tone: 'neutral' | 'frustrated' | 'excited' | 'confused',
    complexity: 'simple' | 'medium' | 'complex',
    expectedAnswerLength: 'short' | 'medium' | 'long'
  } {
    const q = question.toLowerCase().trim()
    
    // Detect question type
    let questionType = 'general'
    for (const [type, config] of Object.entries(this.questionTypes)) {
      if (config.patterns.some(pattern => q.includes(pattern))) {
        questionType = type
        break
      }
    }

    // Detect urgency
    const urgencyKeywords = {
      high: ['urgent', 'asap', 'immediately', 'emergency', 'deadline'],
      medium: ['soon', 'quickly', 'when can', 'timeline']
    }
    let urgency: 'low' | 'medium' | 'high' = 'low'
    if (urgencyKeywords.high.some(word => q.includes(word))) urgency = 'high'
    else if (urgencyKeywords.medium.some(word => q.includes(word))) urgency = 'medium'

    // Detect emotional tone
    const emotionalKeywords = {
      frustrated: ['frustrated', 'annoyed', 'problem', 'issue', 'not working', 'broken'],
      excited: ['excited', 'amazing', 'great', 'love', 'awesome'],
      confused: ['confused', 'dont understand', "don't get", 'unclear', 'explain']
    }
    let emotional_tone: 'neutral' | 'frustrated' | 'excited' | 'confused' = 'neutral'
    for (const [tone, keywords] of Object.entries(emotionalKeywords)) {
      if (keywords.some(word => q.includes(word))) {
        emotional_tone = tone as any
        break
      }
    }

    // Detect complexity
    const complexity = q.split(' ').length > 15 ? 'complex' : 
                     q.split(' ').length > 8 ? 'medium' : 'simple'

    // Determine expected answer length
    const shortQuestions = ['what', 'when', 'where', 'who']
    const isShortQuestion = shortQuestions.some(word => q.startsWith(word))
    const expectedAnswerLength = isShortQuestion ? 'short' :
                               questionType === 'process' ? 'long' : 'medium'

    return {
      intent: this.extractIntent(q),
      questionType,
      urgency,
      emotional_tone,
      complexity,
      expectedAnswerLength
    }
  }

  private extractIntent(question: string): string {
    const intentPatterns = {
      'get_information': ['what', 'how', 'when', 'where', 'why', 'which'],
      'request_action': ['can you', 'would you', 'please', 'help me'],
      'compare_options': ['vs', 'versus', 'compare', 'difference', 'better'],
      'solve_problem': ['problem', 'issue', 'fix', 'solution', 'troubleshoot'],
      'make_decision': ['should i', 'recommend', 'suggest', 'best choice']
    }

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => question.includes(pattern))) {
        return intent
      }
    }
    return 'general_inquiry'
  }

  // Generate a contextually appropriate response structure
  generateResponseStructure(analysis: ReturnType<typeof this.analyzeQuestion>, content: string): string {
    const { questionType, emotional_tone, urgency, expectedAnswerLength } = analysis
    
    // Handle emotional context
    let emotionalPrefix = ''
    switch (emotional_tone) {
      case 'frustrated':
        emotionalPrefix = "I understand your concern. Let me help clarify this for you. "
        break
      case 'excited':
        emotionalPrefix = "Great question! I'm excited to share this with you. "
        break
      case 'confused':
        emotionalPrefix = "Let me break this down clearly for you. "
        break
    }

    // Handle urgency
    let urgencyNote = ''
    if (urgency === 'high') {
      urgencyNote = " I can prioritize this for immediate assistance."
    }

    // Structure based on question type
    const typeConfig = this.questionTypes[questionType]
    if (typeConfig) {
      return this.formatResponseByType(questionType, content, emotionalPrefix, urgencyNote)
    }

    // Default structure
    return `${emotionalPrefix}${content}${urgencyNote}`
  }

  private formatResponseByType(type: string, content: string, emotionalPrefix: string, urgencyNote: string): string {
    switch (type) {
      case 'services':
        return `${emotionalPrefix}I offer comprehensive development services including:\n\n${content}${urgencyNote}`
      
      case 'pricing':
        return `${emotionalPrefix}Here's how my pricing works:\n\n${content}\n\nI'd be happy to provide a detailed quote based on your specific needs.${urgencyNote}`
      
      case 'process':
        return `${emotionalPrefix}My development process is designed to be clear and collaborative:\n\n${content}\n\nThis ensures quality results and keeps you informed throughout.${urgencyNote}`
      
      case 'contact':
        return `${emotionalPrefix}You can reach me through several channels:\n\n${content}\n\nI typically respond within 24 hours.${urgencyNote}`
      
      case 'technical':
        return `${emotionalPrefix}I work with modern, reliable technologies:\n\n${content}\n\nI choose technologies based on your project's specific requirements.${urgencyNote}`
      
      default:
        return `${emotionalPrefix}${content}${urgencyNote}`
    }
  }

  // Improve answer quality based on analysis
  enhanceAnswer(rawAnswer: string, analysis: ReturnType<typeof this.analyzeQuestion>): string {
    let enhanced = rawAnswer

    // Remove technical noise for simple questions
    if (analysis.complexity === 'simple') {
      enhanced = enhanced.replace(/\b(API|database|backend|frontend|deployment)\b/gi, '')
      enhanced = enhanced.replace(/technical\s+/gi, '')
    }

    // Add appropriate length
    if (analysis.expectedAnswerLength === 'short' && enhanced.length > 200) {
      enhanced = enhanced.split('.')[0] + '.'
    }

    // Add helpful follow-up for complex questions
    if (analysis.complexity === 'complex') {
      enhanced += "\n\nWould you like me to elaborate on any specific aspect?"
    }

    return enhanced.trim()
  }
}

export const aiComprehension = new AIComprehensionEngine()
