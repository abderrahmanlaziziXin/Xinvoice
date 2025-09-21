/**
 * AI Learning System for Xinvoice Platform
 * 
 * This module implements a sophisticated learning system that tracks user interactions,
 * analyzes patterns, and continuously improves the AI's document generation capabilities.
 * 
 * Features:
 * - User feedback collection and analysis
 * - AI response quality tracking
 * - Cultural context learning
 * - Template preference learning
 * - Error pattern analysis
 * - Performance optimization suggestions
 */

export interface UserFeedback {
  sessionId: string
  documentId: string
  documentType: 'invoice' | 'nda'
  locale: string
  currency: string
  rating: 1 | 2 | 3 | 4 | 5 // 1 = Poor, 5 = Excellent
  feedbackType: 'accuracy' | 'formatting' | 'cultural_context' | 'language_quality' | 'completeness'
  specificIssues?: string[]
  suggestedImprovements?: string
  userExperience: 'beginner' | 'intermediate' | 'expert'
  generationTime: number // milliseconds
  editsMade: number // count of manual edits after AI generation
  timestamp: Date
}

export interface GenerationMetrics {
  sessionId: string
  documentType: 'invoice' | 'nda'
  locale: string
  promptLength: number
  responseTime: number
  tokensUsed: number
  aiProvider: 'openai' | 'gemini'
  modelVersion: string
  enhancedPromptsUsed: boolean
  culturalContextEnabled: boolean
  success: boolean
  errorCode?: string
  userSatisfactionScore?: number
  timestamp: Date
}

export interface LearningInsight {
  category: 'cultural_context' | 'language_patterns' | 'template_preferences' | 'error_patterns'
  locale: string
  documentType: 'invoice' | 'nda'
  insight: string
  confidence: number // 0-1
  supportingData: {
    sampleCount: number
    successRate: number
    avgRating: number
  }
  actionable: boolean
  implementationSuggestion?: string
  timestamp: Date
}

export interface UserPreferences {
  sessionId: string
  preferredLocale: string
  preferredCurrency: string
  preferredTemplate: 'modern' | 'classic' | 'minimal'
  preferredTheme: 'primary' | 'neutral' | 'dark'
  culturalContextPreference: boolean
  averageDocumentComplexity: 'simple' | 'moderate' | 'complex'
  commonIndustries: string[]
  frequentClients: string[]
  timestamp: Date
}

class LearningSystemCore {
  private feedbackData: UserFeedback[] = []
  private metricsData: GenerationMetrics[] = []
  private insights: LearningInsight[] = []
  private userPreferences: Map<string, UserPreferences> = new Map()
  
  /**
   * Record user feedback for learning purposes
   */
  recordFeedback(feedback: UserFeedback): void {
    this.feedbackData.push(feedback)
    this.analyzeAndGenerateInsights()
    this.updateUserPreferences(feedback)
    
    // In a production environment, this would sync with a backend
    if (typeof window !== 'undefined') {
      this.persistToLocalStorage()
    }
  }
  
  /**
   * Record generation metrics for performance analysis
   */
  recordGenerationMetrics(metrics: GenerationMetrics): void {
    this.metricsData.push(metrics)
    this.analyzePerformancePatterns()
    
    if (typeof window !== 'undefined') {
      this.persistToLocalStorage()
    }
  }
  
  /**
   * Get personalized recommendations for a user session
   */
  getPersonalizedRecommendations(sessionId: string, documentType: 'invoice' | 'nda', locale: string): {
    suggestedTemplate: 'modern' | 'classic' | 'minimal'
    suggestedTheme: 'primary' | 'neutral' | 'dark'
    culturalContextRecommended: boolean
    optimizedPromptSuggestions: string[]
    estimatedGenerationTime: number
  } {
    const userPref = this.userPreferences.get(sessionId)
    const localeInsights = this.getInsightsForLocale(locale, documentType)
    
    // Analyze historical data to provide smart recommendations
    const localeMetrics = this.metricsData.filter(m => m.locale === locale && m.documentType === documentType)
    const avgResponseTime = localeMetrics.length > 0 
      ? localeMetrics.reduce((sum, m) => sum + m.responseTime, 0) / localeMetrics.length
      : 5000 // Default 5 seconds
    
    return {
      suggestedTemplate: userPref?.preferredTemplate || this.getMostSuccessfulTemplate(locale, documentType),
      suggestedTheme: userPref?.preferredTheme || 'primary',
      culturalContextRecommended: this.shouldUseCulturalContext(locale, documentType),
      optimizedPromptSuggestions: this.getOptimizedPromptSuggestions(locale, documentType),
      estimatedGenerationTime: Math.round(avgResponseTime)
    }
  }
  
  /**
   * Get quality insights for improving AI responses
   */
  getQualityInsights(): {
    overallSatisfactionScore: number
    topIssues: Array<{issue: string, frequency: number}>
    localeSpecificIssues: Map<string, string[]>
    recommendedImprovements: string[]
  } {
    const recentFeedback = this.feedbackData.filter(f => 
      Date.now() - f.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    )
    
    const overallSatisfactionScore = recentFeedback.length > 0
      ? recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length
      : 4.5 // Default high score
    
    // Analyze common issues
    const issueFrequency = new Map<string, number>()
    const localeIssues = new Map<string, string[]>()
    
    recentFeedback.forEach(feedback => {
      feedback.specificIssues?.forEach(issue => {
        issueFrequency.set(issue, (issueFrequency.get(issue) || 0) + 1)
        
        const localeIssueList = localeIssues.get(feedback.locale) || []
        if (!localeIssueList.includes(issue)) {
          localeIssueList.push(issue)
          localeIssues.set(feedback.locale, localeIssueList)
        }
      })
    })
    
    const topIssues = Array.from(issueFrequency.entries())
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
    
    return {
      overallSatisfactionScore,
      topIssues,
      localeSpecificIssues: localeIssues,
      recommendedImprovements: this.generateRecommendedImprovements(topIssues)
    }
  }
  
  /**
   * Learn from successful patterns and improve future generations
   */
  private analyzeAndGenerateInsights(): void {
    const recentFeedback = this.feedbackData.filter(f => 
      Date.now() - f.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    )
    
    // Group by locale and document type
    const localeGroups = new Map<string, UserFeedback[]>()
    recentFeedback.forEach(feedback => {
      const key = `${feedback.locale}-${feedback.documentType}`
      const group = localeGroups.get(key) || []
      group.push(feedback)
      localeGroups.set(key, group)
    })
    
    // Generate insights for each locale/document type combination
    localeGroups.forEach((feedbackGroup, key) => {
      const [locale, documentType] = key.split('-')
      const avgRating = feedbackGroup.reduce((sum, f) => sum + f.rating, 0) / feedbackGroup.length
      
      if (feedbackGroup.length >= 3 && avgRating >= 4.0) {
        // Generate positive insights
        this.insights.push({
          category: 'cultural_context',
          locale,
          documentType: documentType as 'invoice' | 'nda',
          insight: `High user satisfaction (${avgRating.toFixed(1)}/5) suggests current cultural context approach is effective for ${locale}`,
          confidence: Math.min(feedbackGroup.length / 10, 1),
          supportingData: {
            sampleCount: feedbackGroup.length,
            successRate: feedbackGroup.filter(f => f.rating >= 4).length / feedbackGroup.length,
            avgRating
          },
          actionable: false,
          timestamp: new Date()
        })
      } else if (feedbackGroup.length >= 3 && avgRating < 3.0) {
        // Generate improvement insights
        const commonIssues = this.findCommonIssues(feedbackGroup)
        this.insights.push({
          category: 'error_patterns',
          locale,
          documentType: documentType as 'invoice' | 'nda',
          insight: `Low satisfaction score (${avgRating.toFixed(1)}/5) indicates need for improvement. Common issues: ${commonIssues.join(', ')}`,
          confidence: Math.min(feedbackGroup.length / 5, 1),
          supportingData: {
            sampleCount: feedbackGroup.length,
            successRate: feedbackGroup.filter(f => f.rating >= 4).length / feedbackGroup.length,
            avgRating
          },
          actionable: true,
          implementationSuggestion: this.generateImprovementSuggestion(commonIssues, locale, documentType as 'invoice' | 'nda'),
          timestamp: new Date()
        })
      }
    })
  }
  
  private analyzePerformancePatterns(): void {
    const recentMetrics = this.metricsData.filter(m => 
      Date.now() - m.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    )
    
    // Analyze response times by locale
    const localePerformance = new Map<string, number[]>()
    recentMetrics.forEach(metric => {
      const times = localePerformance.get(metric.locale) || []
      times.push(metric.responseTime)
      localePerformance.set(metric.locale, times)
    })
    
    // Generate performance insights
    localePerformance.forEach((times, locale) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      
      if (avgTime > 10000) { // More than 10 seconds
        this.insights.push({
          category: 'error_patterns',
          locale,
          documentType: 'invoice', // Default for performance insights
          insight: `Performance issue detected for ${locale}: average response time ${(avgTime / 1000).toFixed(1)}s`,
          confidence: 0.8,
          supportingData: {
            sampleCount: times.length,
            successRate: recentMetrics.filter(m => m.locale === locale && m.success).length / recentMetrics.filter(m => m.locale === locale).length,
            avgRating: 0
          },
          actionable: true,
          implementationSuggestion: `Consider optimizing AI prompts for ${locale} or using cached responses for common patterns`,
          timestamp: new Date()
        })
      }
    })
  }
  
  private updateUserPreferences(feedback: UserFeedback): void {
    const existing = this.userPreferences.get(feedback.sessionId)
    
    if (!existing) {
      // Create new preferences based on first feedback
      this.userPreferences.set(feedback.sessionId, {
        sessionId: feedback.sessionId,
        preferredLocale: feedback.locale,
        preferredCurrency: feedback.currency,
        preferredTemplate: 'modern', // Default
        preferredTheme: 'primary', // Default
        culturalContextPreference: true, // Default to enabled
        averageDocumentComplexity: 'moderate',
        commonIndustries: [],
        frequentClients: [],
        timestamp: new Date()
      })
    } else {
      // Update existing preferences
      existing.timestamp = new Date()
      // You could implement more sophisticated preference learning here
    }
  }
  
  private getInsightsForLocale(locale: string, documentType: 'invoice' | 'nda'): LearningInsight[] {
    return this.insights.filter(i => i.locale === locale && i.documentType === documentType)
  }
  
  private getMostSuccessfulTemplate(locale: string, documentType: 'invoice' | 'nda'): 'modern' | 'classic' | 'minimal' {
    // Analyze which template has the highest satisfaction for this locale
    const localeFeedback = this.feedbackData.filter(f => f.locale === locale && f.documentType === documentType)
    
    // For now, return 'modern' as default, but this could be enhanced with actual template tracking
    return 'modern'
  }
  
  private shouldUseCulturalContext(locale: string, documentType: 'invoice' | 'nda'): boolean {
    const localeInsights = this.getInsightsForLocale(locale, documentType)
    const culturalInsights = localeInsights.filter(i => i.category === 'cultural_context')
    
    if (culturalInsights.length > 0) {
      return culturalInsights.some(i => i.supportingData.avgRating >= 4.0)
    }
    
    // Default to true for non-English locales
    return !locale.startsWith('en-')
  }
  
  private getOptimizedPromptSuggestions(locale: string, documentType: 'invoice' | 'nda'): string[] {
    const suggestions = []
    
    // Base suggestions for all locales
    suggestions.push("Include specific quantities, rates, and currency for accurate calculations")
    suggestions.push("Mention due dates and payment terms for complete invoices")
    
    // Locale-specific suggestions
    if (locale.startsWith('ar-')) {
      suggestions.push("تأكد من تضمين تفاصيل الشركة والعميل باللغة العربية")
    } else if (locale.startsWith('fr-')) {
      suggestions.push("Incluez les détails de TVA conformes à la réglementation française")
    } else if (locale.startsWith('de-')) {
      suggestions.push("Berücksichtigen Sie deutsche Rechnungsstandards und Mehrwertsteuer")
    }
    
    return suggestions
  }
  
  private findCommonIssues(feedbackGroup: UserFeedback[]): string[] {
    const issueCount = new Map<string, number>()
    
    feedbackGroup.forEach(feedback => {
      feedback.specificIssues?.forEach(issue => {
        issueCount.set(issue, (issueCount.get(issue) || 0) + 1)
      })
    })
    
    return Array.from(issueCount.entries())
      .filter(([, count]) => count >= 2) // Issues reported by at least 2 users
      .sort((a, b) => b[1] - a[1])
      .map(([issue]) => issue)
      .slice(0, 3) // Top 3 issues
  }
  
  private generateImprovementSuggestion(issues: string[], locale: string, documentType: 'invoice' | 'nda'): string {
    const suggestions = []
    
    if (issues.includes('formatting')) {
      suggestions.push(`Improve ${documentType} formatting for ${locale} locale`)
    }
    if (issues.includes('cultural_context')) {
      suggestions.push(`Enhance cultural context understanding for ${locale} business practices`)
    }
    if (issues.includes('accuracy')) {
      suggestions.push(`Review and improve data accuracy in ${documentType} generation for ${locale}`)
    }
    
    return suggestions.join('; ') || `General improvement needed for ${documentType} generation in ${locale}`
  }
  
  private generateRecommendedImprovements(topIssues: Array<{issue: string, frequency: number}>): string[] {
    const improvements: string[] = []
    
    topIssues.forEach(({ issue, frequency }) => {
      switch (issue) {
        case 'formatting':
          improvements.push(`Address formatting issues (reported ${frequency} times) by updating PDF templates`)
          break
        case 'cultural_context':
          improvements.push(`Improve cultural context (${frequency} reports) by enhancing locale-specific prompts`)
          break
        case 'accuracy':
          improvements.push(`Enhance data accuracy (${frequency} reports) by improving validation systems`)
          break
        default:
          improvements.push(`Address "${issue}" issue reported ${frequency} times`)
      }
    })
    
    return improvements
  }
  
  private persistToLocalStorage(): void {
    try {
      localStorage.setItem('xinvoice_learning_feedback', JSON.stringify(this.feedbackData.slice(-100))) // Keep last 100
      localStorage.setItem('xinvoice_learning_metrics', JSON.stringify(this.metricsData.slice(-100))) // Keep last 100
      localStorage.setItem('xinvoice_learning_insights', JSON.stringify(this.insights.slice(-50))) // Keep last 50
      localStorage.setItem('xinvoice_user_preferences', JSON.stringify(Array.from(this.userPreferences.entries())))
    } catch (error) {
      console.warn('Failed to persist learning data:', error)
    }
  }
  
  loadFromLocalStorage(): void {
    try {
      const feedback = localStorage.getItem('xinvoice_learning_feedback')
      if (feedback) {
        this.feedbackData = JSON.parse(feedback).map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }))
      }
      
      const metrics = localStorage.getItem('xinvoice_learning_metrics')
      if (metrics) {
        this.metricsData = JSON.parse(metrics).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }
      
      const insights = localStorage.getItem('xinvoice_learning_insights')
      if (insights) {
        this.insights = JSON.parse(insights).map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp)
        }))
      }
      
      const preferences = localStorage.getItem('xinvoice_user_preferences')
      if (preferences) {
        const prefArray = JSON.parse(preferences)
        this.userPreferences = new Map(prefArray.map(([key, value]: [string, any]) => [
          key,
          { ...value, timestamp: new Date(value.timestamp) }
        ]))
      }
    } catch (error) {
      console.warn('Failed to load learning data:', error)
    }
  }
}

// Singleton instance
export const learningSystem = new LearningSystemCore()

// Auto-load on initialization
if (typeof window !== 'undefined') {
  learningSystem.loadFromLocalStorage()
}