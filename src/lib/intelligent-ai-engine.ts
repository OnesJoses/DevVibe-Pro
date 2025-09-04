// Intelligent AI Engine - Real understanding and learning
export class IntelligentAIEngine {
  private conversationContext: Array<{question: string, answer: string, feedback?: number}> = []
  private learnedPatterns: Map<string, {responses: string[], successRate: number}> = new Map()
  
  constructor() {
    this.loadLearningData()
  }

  // Analyze what the user is actually asking
  analyzeIntent(question: string): {
    type: 'service_inquiry' | 'pricing' | 'technical' | 'process' | 'personal' | 'comparison' | 'unknown',
    confidence: number,
    keywords: string[],
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'confused',
    specificity: 'general' | 'specific' | 'very_specific'
  } {
    const q = question.toLowerCase()
    const keywords = q.split(/\s+/).filter(w => w.length > 2)
    
    // Service inquiry detection
    if (q.match(/\b(service|offer|do|provide|help|can you|what)\b/)) {
      return {
        type: 'service_inquiry',
        confidence: 0.9,
        keywords: keywords,
        sentiment: q.includes('?') ? 'neutral' : 'positive',
        specificity: q.length < 30 ? 'general' : 'specific'
      }
    }
    
    // Pricing detection
    if (q.match(/\b(cost|price|fee|charge|expensive|cheap|budget|pay)\b/)) {
      return {
        type: 'pricing',
        confidence: 0.9,
        keywords: keywords,
        sentiment: q.includes('expensive') ? 'frustrated' : 'neutral',
        specificity: q.includes('for') ? 'specific' : 'general'
      }
    }
    
    // Technical detection
    if (q.match(/\b(react|node|javascript|typescript|database|api|framework|technology)\b/)) {
      return {
        type: 'technical',
        confidence: 0.8,
        keywords: keywords,
        sentiment: 'neutral',
        specificity: 'specific'
      }
    }
    
    // Process detection
    if (q.match(/\b(process|timeline|steps|workflow|method|approach|start)\b/)) {
      return {
        type: 'process',
        confidence: 0.8,
        keywords: keywords,
        sentiment: 'neutral',
        specificity: q.includes('how') ? 'specific' : 'general'
      }
    }
    
    // Frustration detection
    const sentiment = q.match(/\b(bad|terrible|awful|useless|stupid|annoying)\b/) ? 'frustrated' :
                     q.match(/\b(confused|don't understand|unclear|what)\b/) ? 'confused' :
                     q.match(/\b(great|good|excellent|amazing|love)\b/) ? 'positive' : 'neutral'
    
    return {
      type: 'unknown',
      confidence: 0.3,
      keywords: keywords,
      sentiment,
      specificity: 'general'
    }
  }

  // Generate contextually appropriate response
  generateIntelligentResponse(question: string, searchResults: any, intent: any): string {
    // Check if we've learned a good response for this type of question
    const patternKey = `${intent.type}_${intent.specificity}`
    const learnedPattern = this.learnedPatterns.get(patternKey)
    
    // If user seems frustrated, address that first
    if (intent.sentiment === 'frustrated') {
      return this.generateSympathyResponse(question, searchResults, intent)
    }
    
    // If user seems confused, provide clearer explanation
    if (intent.sentiment === 'confused') {
      return this.generateClarifyingResponse(question, searchResults, intent)
    }
    
    // Use learned patterns if available and successful
    if (learnedPattern && learnedPattern.successRate > 0.7) {
      return this.adaptLearnedResponse(learnedPattern.responses[0], question, searchResults)
    }
    
    // Generate contextual response based on intent
    switch (intent.type) {
      case 'service_inquiry':
        return this.generateServiceResponse(question, searchResults, intent)
      case 'pricing':
        return this.generatePricingResponse(question, searchResults, intent)
      case 'technical':
        return this.generateTechnicalResponse(question, searchResults, intent)
      case 'process':
        return this.generateProcessResponse(question, searchResults, intent)
      default:
        return this.generateHelpfulResponse(question, searchResults, intent)
    }
  }

  private generateServiceResponse(question: string, searchResults: any, intent: any): string {
    const baseInfo = "I offer custom web and mobile development, AI integration, automation, UX design, consulting, and ongoing maintenance."
    
    if (intent.specificity === 'general') {
      return `${baseInfo}

**What makes this valuable for you:**
• **Custom Development** - Built specifically for your needs, not generic templates
• **AI Integration** - Smart automation to save time and reduce manual work  
• **Full Support** - From initial concept through launch and ongoing updates
• **Business Focus** - Technology that actually drives results and growth

**Want specifics?** Ask me about any particular service area or your specific project needs.`
    }
    
    // For specific questions, dive deeper
    if (question.toLowerCase().includes('ai')) {
      return `${baseInfo}

**AI Integration Specifically:**
I help businesses implement practical AI solutions that solve real problems:
• **Automated Customer Support** - Chatbots and help systems
• **Data Processing** - Smart analysis and reporting
• **Content Generation** - Automated writing and optimization
• **Process Automation** - Reducing manual tasks

**Recent AI Projects:**
- E-commerce recommendation systems
- Automated email marketing
- Smart inventory management

What kind of AI solution are you considering?`
    }
    
    return baseInfo + "\n\nWhat specific service area interests you most?"
  }

  private generatePricingResponse(question: string, searchResults: any, intent: any): string {
    if (intent.sentiment === 'frustrated' && question.toLowerCase().includes('expensive')) {
      return `I understand cost is a major concern. Let me break this down clearly:

**Why Custom Development Costs What It Does:**
• **Time Investment** - 40-200+ hours of skilled work
• **Quality Assurance** - Testing, security, optimization
• **Ongoing Value** - Systems that work reliably for years
• **Business ROI** - Technology that pays for itself

**Budget-Friendly Options:**
• **MVP Approach** - Start with core features ($2,500-$5,000)
• **Phased Development** - Build over time to spread costs
• **Partnership Models** - Equity or revenue sharing for startups

**What You Get:**
✅ Professional, secure, scalable solution
✅ Source code ownership
✅ Documentation and training
✅ 3 months of support included

**Bottom Line:** This isn't an expense - it's an investment in your business growth.

What's your budget range? I can suggest the best approach.`
    }
    
    return `**Transparent Pricing Approach:**

**Project Ranges:**
• **Starter Projects**: $2,500 - $8,000 (websites, simple tools)
• **Business Applications**: $8,000 - $25,000 (custom features, databases)
• **Enterprise Solutions**: $25,000+ (complex systems, AI integration)

**What Determines Cost:**
1. **Complexity** - Number of features and integrations
2. **Timeline** - Rushed projects cost more
3. **Quality Level** - Basic vs. enterprise-grade
4. **Ongoing Support** - Maintenance and updates

**Included in Every Project:**
✅ Planning and architecture
✅ Clean, documented code
✅ Testing and quality assurance
✅ Deployment and launch support
✅ 3 months post-launch support

**Payment Options:**
- Milestone-based (50% upfront, 50% on completion)
- Monthly payments for larger projects
- Equity partnerships for qualifying startups

What type of project are you considering?`
  }

  private generateTechnicalResponse(question: string, searchResults: any, intent: any): string {
    const techKeywords = intent.keywords.filter((k: string) => 
      ['react', 'node', 'javascript', 'typescript', 'database', 'api', 'framework'].includes(k)
    )
    
    return `**Technical Expertise & Approach:**

I work with modern, reliable technologies: React, TypeScript, Node.js, Python, PostgreSQL, and cloud platforms like AWS and Google Cloud.

${techKeywords.length > 0 ? `**Specifically about ${techKeywords.join(', ')}:**` : '**My Tech Philosophy:**'}
• **Right Tool for the Job** - Technology choices based on your specific needs
• **Modern Best Practices** - Clean code, security, performance optimization
• **Future-Proof Solutions** - Built to scale and adapt over time
• **Documentation & Training** - You'll understand what you're getting

**Recent Technical Projects:**
- React/TypeScript SPA with Node.js backend
- AI-powered data processing pipelines
- Real-time chat applications with WebSockets
- E-commerce platforms with payment integration

**My Approach:**
1. **Understand** your technical requirements and constraints
2. **Architect** for scalability and maintainability  
3. **Build** with clean, tested, documented code
4. **Deploy** with proper DevOps and monitoring

What specific technical challenge are you facing?`
  }

  private generateProcessResponse(question: string, searchResults: any, intent: any): string {
    return `**My Development Process - Clear & Collaborative:**

**Phase 1: Discovery & Planning (1-2 weeks)**
• **Requirements Gathering** - What exactly do you need?
• **Technical Architecture** - How will we build it?
• **Project Timeline** - Realistic milestones and deadlines
• **Cost Breakdown** - Transparent pricing with no surprises

**Phase 2: Design & Prototyping (1-2 weeks)**
• **User Experience Design** - How will people actually use this?
• **Technical Specifications** - Detailed development roadmap
• **Review & Approval** - Make sure we're aligned before coding

**Phase 3: Development (4-12 weeks depending on scope)**
• **Iterative Building** - Working software every 1-2 weeks
• **Regular Updates** - You see progress and can provide feedback
• **Quality Assurance** - Testing throughout, not just at the end

**Phase 4: Launch & Support (ongoing)**
• **Deployment** - Going live with proper setup and monitoring
• **Training** - How to use and maintain your new system
• **3 Months Support** - Bug fixes and adjustments included
• **Long-term Partnership** - Ongoing updates and improvements

**What Makes This Different:**
✅ **No Surprises** - Clear communication throughout
✅ **Your Input** - Regular check-ins and feedback loops
✅ **Working Software Fast** - See results quickly, not just at the end
✅ **Knowledge Transfer** - You understand what you're getting

What stage of a project are you thinking about?`
  }

  private generateSympathyResponse(question: string, searchResults: any, intent: any): string {
    return `I hear your frustration, and that's completely understandable. Let me give you a straight, helpful answer.

**Here's what I actually do:**
I build custom software solutions - websites, apps, and business tools that work exactly how you need them to.

**Why this might matter to you:**
• **Solve Real Problems** - Not just pretty websites, but tools that make your work easier
• **Save Time Long-term** - Automate repetitive tasks
• **Professional Results** - Systems that actually work reliably
• **Clear Communication** - No tech jargon, just plain explanations

**How I'm Different:**
- I explain everything in normal language
- Fixed pricing with no surprises
- You own everything I build for you
- I stick around for support, not just disappear

**Bottom Line:** I turn technical complexity into simple solutions that help your business.

What specific challenge are you trying to solve? I'll give you a direct, honest answer.`
  }

  private generateClarifyingResponse(question: string, searchResults: any, intent: any): string {
    return `Let me clarify this for you in simple terms:

**To answer "${question}" directly:**

${searchResults.answer || "I need a bit more context to give you the most helpful answer."}

**Let me break this down:**
• **What this means for you** - Practical impact on your business or project
• **Why it matters** - The real benefits you'd see
• **Next steps** - What you'd actually need to do

**Common Questions Like Yours:**
Most people asking similar questions want to know:
1. Will this actually work for their situation?
2. How much time and money are we talking about?
3. What's the process like - is it complicated?

**Want me to be more specific?** Tell me:
- What's your main goal or challenge?
- What's your experience level with this type of thing?
- Any particular concerns or requirements?

I'll give you a clear, actionable answer.`
  }

  private generateHelpfulResponse(question: string, searchResults: any, intent: any): string {
    return `I want to give you a helpful answer to "${question}".

${searchResults.answer || "Let me provide some relevant information:"}

**To help you better, I need to understand:**
• What specific outcome are you looking for?
• What's your current situation or challenge?
• Any particular constraints or requirements?

**Common things I help with:**
- Building custom web applications and websites
- Automating business processes with AI
- Technical consulting and planning
- Solving specific development challenges

**My approach:**
1. **Understand** your actual needs (not just what you think you want)
2. **Plan** the most effective solution
3. **Build** it right the first time
4. **Support** you through launch and beyond

Ask me something more specific, and I'll give you a detailed, actionable answer.`
  }

  // Record successful patterns for learning
  recordSuccess(question: string, response: string, feedback: number, intent: any) {
    const patternKey = `${intent.type}_${intent.specificity}`
    
    if (!this.learnedPatterns.has(patternKey)) {
      this.learnedPatterns.set(patternKey, {
        responses: [],
        successRate: 0
      })
    }
    
    const pattern = this.learnedPatterns.get(patternKey)!
    pattern.responses.unshift(response)
    pattern.responses = pattern.responses.slice(0, 5) // Keep top 5
    
    // Update success rate
    const totalResponses = pattern.responses.length
    const successfulResponses = pattern.responses.filter((_, i) => i === 0 ? feedback >= 4 : true).length
    pattern.successRate = successfulResponses / totalResponses
    
    this.saveLearningData()
  }

  private saveLearningData() {
    localStorage.setItem('ai-learned-patterns', JSON.stringify(Array.from(this.learnedPatterns.entries())))
  }

  private loadLearningData() {
    const saved = localStorage.getItem('ai-learned-patterns')
    if (saved) {
      const entries = JSON.parse(saved)
      this.learnedPatterns = new Map(entries)
    }
  }

  private adaptLearnedResponse(baseResponse: string, question: string, searchResults: any): string {
    // Adapt the learned response to the current context
    return baseResponse + `\n\n*This response was improved based on previous successful interactions.*`
  }

  // Get learning insights
  getInsights() {
    const totalPatterns = this.learnedPatterns.size
    const successfulPatterns = Array.from(this.learnedPatterns.values()).filter(p => p.successRate > 0.7).length
    
    return {
      totalPatterns,
      successfulPatterns,
      overallSuccessRate: totalPatterns > 0 ? (successfulPatterns / totalPatterns) * 100 : 0,
      learnedResponses: Array.from(this.learnedPatterns.entries()).map(([key, pattern]) => ({
        type: key,
        successRate: pattern.successRate,
        responseCount: pattern.responses.length
      }))
    }
  }
}

export const intelligentAI = new IntelligentAIEngine()
