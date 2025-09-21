/**
 * AI Metrics Collection Hook
 * 
 * This hook automatically tracks AI generation performance and user interactions
 * to feed into the learning system for continuous improvement.
 */

"use client"

import { useCallback, useRef } from 'react'
import { learningSystem, GenerationMetrics } from '../lib/learning-system'
import { DocumentType } from '../../packages/core'

interface UseMetricsTrackingOptions {
  sessionId: string
  documentType: DocumentType
  locale: string
}

export function useMetricsTracking({
  sessionId,
  documentType,
  locale
}: UseMetricsTrackingOptions) {
  const startTimeRef = useRef<number>()
  const metricsRef = useRef<Partial<GenerationMetrics>>({})

  /**
   * Start tracking a generation request
   */
  const startTracking = useCallback((options: {
    promptLength: number
    aiProvider: 'openai' | 'gemini'
    modelVersion: string
    enhancedPromptsUsed: boolean
    culturalContextEnabled: boolean
  }) => {
    startTimeRef.current = Date.now()
    metricsRef.current = {
      sessionId,
      documentType: documentType as 'invoice' | 'nda',
      locale,
      ...options,
      timestamp: new Date()
    }
  }, [sessionId, documentType, locale])

  /**
   * Complete tracking when generation finishes
   */
  const completeTracking = useCallback((options: {
    success: boolean
    tokensUsed?: number
    errorCode?: string
    userSatisfactionScore?: number
  }) => {
    if (!startTimeRef.current || !metricsRef.current.sessionId) {
      console.warn('Metrics tracking not started')
      return
    }

    const responseTime = Date.now() - startTimeRef.current
    
    const completeMetrics: GenerationMetrics = {
      ...metricsRef.current,
      responseTime,
      tokensUsed: options.tokensUsed || 0,
      success: options.success,
      errorCode: options.errorCode,
      userSatisfactionScore: options.userSatisfactionScore,
    } as GenerationMetrics

    // Record metrics in learning system
    learningSystem.recordGenerationMetrics(completeMetrics)

    // Reset for next tracking
    startTimeRef.current = undefined
    metricsRef.current = {}
  }, [])

  /**
   * Track user interaction events
   */
  const trackInteraction = useCallback((interaction: {
    type: 'template_change' | 'locale_change' | 'edit_document' | 'download_pdf' | 'preview_document'
    value?: string
    timestamp?: Date
  }) => {
    // In a production environment, this would be sent to analytics
    console.log('User interaction:', {
      sessionId,
      documentType,
      locale,
      ...interaction,
      timestamp: interaction.timestamp || new Date()
    })
  }, [sessionId, documentType, locale])

  /**
   * Track document edit patterns
   */
  const trackDocumentEdit = useCallback((editType: {
    field: string
    originalValue: string
    newValue: string
    editTime: number // Time spent editing in milliseconds
  }) => {
    // This could be used to understand which fields users edit most often
    console.log('Document edit tracked:', {
      sessionId,
      documentType,
      locale,
      ...editType,
      timestamp: new Date()
    })
  }, [sessionId, documentType, locale])

  /**
   * Get personalized recommendations based on tracked data
   */
  const getPersonalizedRecommendations = useCallback(() => {
    return learningSystem.getPersonalizedRecommendations(
      sessionId,
      documentType as 'invoice' | 'nda',
      locale
    )
  }, [sessionId, documentType, locale])

  return {
    startTracking,
    completeTracking,
    trackInteraction,
    trackDocumentEdit,
    getPersonalizedRecommendations
  }
}