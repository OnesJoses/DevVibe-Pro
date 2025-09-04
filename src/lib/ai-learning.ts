// AI Learning and Training System
export class AILearningSystem {
  private learningData: {
    successful_responses: Array<{
      question: string,
      answer: string,
      rating: number,
      context: any,
      timestamp: number
    }>,
    failed_responses: Array<{
      question: string,
      answer: string,
      user_feedback: string,
      timestamp: number
    }>,
    question_patterns: Record<string, {
      count: number,
      successful_answers: string[],
      common_followups: string[]
    }>
  } = {
    successful_responses: [],
    failed_responses: [],
    question_patterns: {}
  }

  constructor() {
    this.loadLearningData()
  }

  // Save learning data to localStorage
  private saveLearningData() {
    try {
      localStorage.setItem('ai-learning-data', JSON.stringify(this.learningData))
    } catch (e) {
      console.warn('Could not save learning data:', e)
    }
  }

  // Load learning data from localStorage
  private loadLearningData() {
    try {
      const saved = localStorage.getItem('ai-learning-data')
      if (saved) {
        this.learningData = { ...this.learningData, ...JSON.parse(saved) }
      }
    } catch (e) {
      console.warn('Could not load learning data:', e)
    }
  }

  // Record a successful interaction for learning
  recordSuccess(question: string, answer: string, context: any, rating: number = 5) {
    this.learningData.successful_responses.push({
      question: question.toLowerCase(),
      answer,
      rating,
      context,
      timestamp: Date.now()
    })

    // Update pattern recognition
    const pattern = this.extractPattern(question)
    if (!this.learningData.question_patterns[pattern]) {
      this.learningData.question_patterns[pattern] = {
        count: 0,
        successful_answers: [],
        common_followups: []
      }
    }
    
    this.learningData.question_patterns[pattern].count++
    if (rating >= 4) {
      this.learningData.question_patterns[pattern].successful_answers.push(answer)
    }

    this.saveLearningData()
  }

  // Record a failed interaction for learning
  recordFailure(question: string, answer: string, userFeedback: string) {
    this.learningData.failed_responses.push({
      question: question.toLowerCase(),
      answer,
      user_feedback: userFeedback,
      timestamp: Date.now()
    })
    this.saveLearningData()
  }

  // Extract pattern from question for learning
  private extractPattern(question: string): string {
    const q = question.toLowerCase()
    
    // Common question patterns
    if (q.includes('service') || q.includes('offer')) return 'services'
    if (q.includes('price') || q.includes('cost')) return 'pricing'
    if (q.includes('how') && (q.includes('work') || q.includes('process'))) return 'process'
    if (q.includes('contact') || q.includes('reach')) return 'contact'
    if (q.includes('experience') || q.includes('portfolio')) return 'experience'
    if (q.includes('tech') || q.includes('stack')) return 'technical'
    
    return 'general'
  }

  // Get best answer based on learning history
  getBestAnswerFromHistory(question: string): string | null {
    const pattern = this.extractPattern(question)
    const patternData = this.learningData.question_patterns[pattern]
    
    if (patternData && patternData.successful_answers.length > 0) {
      // Return the most recent successful answer for this pattern
      return patternData.successful_answers[patternData.successful_answers.length - 1]
    }
    
    return null
  }

  // Analyze what the AI has learned
  getInsights(): {
    total_interactions: number,
    success_rate: number,
    common_patterns: Array<{ pattern: string, count: number }>,
    improvement_areas: string[]
  } {
    const totalSuccessful = this.learningData.successful_responses.length
    const totalFailed = this.learningData.failed_responses.length
    const total = totalSuccessful + totalFailed
    
    const commonPatterns = Object.entries(this.learningData.question_patterns)
      .map(([pattern, data]) => ({ pattern, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Analyze failure patterns
    const failureReasons = this.learningData.failed_responses.map(f => f.user_feedback)
    const improvementAreas = [...new Set(failureReasons)].slice(0, 3)

    return {
      total_interactions: total,
      success_rate: total > 0 ? (totalSuccessful / total) * 100 : 0,
      common_patterns: commonPatterns,
      improvement_areas: improvementAreas
    }
  }

  // Suggest response improvements based on learning
  improveResponse(question: string, rawAnswer: string): string {
    const pattern = this.extractPattern(question)
    const historicalData = this.learningData.question_patterns[pattern]
    
    if (!historicalData) return rawAnswer

    // If we have successful answers for this pattern, blend approaches
    if (historicalData.successful_answers.length > 0) {
      const lastSuccessful = historicalData.successful_answers[historicalData.successful_answers.length - 1]
      
      // If the raw answer is very different from what worked before, suggest blending
      if (this.calculateSimilarity(rawAnswer, lastSuccessful) < 0.3) {
        return this.blendAnswers(rawAnswer, lastSuccessful)
      }
    }

    return rawAnswer
  }

  // Calculate similarity between two answers
  private calculateSimilarity(answer1: string, answer2: string): number {
    const words1 = new Set(answer1.toLowerCase().split(/\s+/))
    const words2 = new Set(answer2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  // Blend two answers intelligently
  private blendAnswers(current: string, historical: string): string {
    // Simple blending: take the beginning of current and add key points from historical
    const currentSentences = current.split('.').filter(s => s.trim())
    const historicalSentences = historical.split('.').filter(s => s.trim())
    
    // Start with current answer
    let blended = currentSentences.slice(0, 2).join('. ') + '. '
    
    // Add unique valuable information from historical
    for (const sentence of historicalSentences) {
      if (!current.toLowerCase().includes(sentence.toLowerCase().substring(0, 20))) {
        blended += sentence.trim() + '. '
        break // Only add one additional point
      }
    }
    
    return blended.trim()
  }

  // Generate training insights for manual review
  generateTrainingReport(): string {
    const insights = this.getInsights()
    
    let report = `AI Training Report\n==================\n\n`
    report += `Total Interactions: ${insights.total_interactions}\n`
    report += `Success Rate: ${insights.success_rate.toFixed(1)}%\n\n`
    
    report += `Most Common Question Types:\n`
    insights.common_patterns.forEach(p => {
      report += `- ${p.pattern}: ${p.count} questions\n`
    })
    
    if (insights.improvement_areas.length > 0) {
      report += `\nAreas for Improvement:\n`
      insights.improvement_areas.forEach(area => {
        report += `- ${area}\n`
      })
    }
    
    // Recent failures for review
    const recentFailures = this.learningData.failed_responses
      .slice(-3)
      .map(f => `Q: ${f.question}\nFeedback: ${f.user_feedback}`)
    
    if (recentFailures.length > 0) {
      report += `\nRecent Issues to Address:\n${recentFailures.join('\n\n')}`
    }
    
    return report
  }
}

export const aiLearning = new AILearningSystem()
