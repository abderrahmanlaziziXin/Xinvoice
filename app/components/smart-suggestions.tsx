/**
 * Smart Suggestions Component
 * 
 * This component provides intelligent suggestions based on AI learning patterns,
 * user history, and successful document generations.
 */

"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { learningSystem } from '../lib/learning-system'
import { Locale, Currency, DocumentType } from '../../packages/core'

interface SmartSuggestion {
  id: string
  type: 'prompt_improvement' | 'template_recommendation' | 'locale_optimization' | 'cultural_context' | 'field_completion'
  title: string
  description: string
  action: string
  confidence: number
  icon: React.ComponentType<{ className?: string }>
  onApply: () => void
  metadata?: any
}

interface SmartSuggestionsProps {
  sessionId: string
  currentPrompt: string
  selectedLocale: Locale
  selectedCurrency: Currency
  documentType: DocumentType
  onPromptChange: (prompt: string) => void
  onLocaleChange?: (locale: Locale) => void
  onCurrencyChange?: (currency: Currency) => void
  className?: string
}

const LOCALE_SUGGESTIONS = {
  'en-US': {
    cultural_tips: 'Include standard business terms and professional language',
    format_tips: 'Use MM/DD/YYYY date format and USD currency',
    prompt_examples: [
      'Invoice for consulting services to ABC Corp for $2,500, due in 30 days',
      'Create invoice for web development project - 40 hours at $75/hour'
    ]
  },
  'fr-FR': {
    cultural_tips: 'Include TVA (VAT) and French business formalities',
    format_tips: 'Use DD/MM/YYYY format and EUR currency',
    prompt_examples: [
      'Facture pour services de conseil à ABC Corp pour 2 500 €, échéance 30 jours',
      'Créer facture pour développement web - 40 heures à 75 €/heure'
    ]
  },
  'de-DE': {
    cultural_tips: 'Include Mehrwertsteuer and German compliance requirements',
    format_tips: 'Use DD.MM.YYYY format and EUR currency',
    prompt_examples: [
      'Rechnung für Beratungsleistungen an ABC Corp für 2.500 €, fällig in 30 Tagen',
      'Rechnung erstellen für Webentwicklung - 40 Stunden zu 75 €/Stunde'
    ]
  },
  'ar-SA': {
    cultural_tips: 'Include Islamic calendar dates and Arabic business practices',
    format_tips: 'Use DD/MM/YYYY format and SAR currency with RTL layout',
    prompt_examples: [
      'فاتورة خدمات استشارية لشركة ABC بقيمة 9,375 ريال، مستحقة خلال 30 يوم',
      'إنشاء فاتورة تطوير موقع - 40 ساعة بسعر 281 ريال/الساعة'
    ]
  }
}

export default function SmartSuggestions({
  sessionId,
  currentPrompt,
  selectedLocale,
  selectedCurrency,
  documentType,
  onPromptChange,
  onLocaleChange,
  onCurrencyChange,
  className = ''
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())

  const generateSuggestions = useCallback(() => {
    const newSuggestions: SmartSuggestion[] = []
    
    // Get personalized recommendations from learning system
    const recommendations = learningSystem.getPersonalizedRecommendations(
      sessionId,
      documentType as 'invoice' | 'nda',
      selectedLocale
    )

    // Prompt improvement suggestions
    if (currentPrompt.length > 0 && currentPrompt.length < 20) {
      newSuggestions.push({
        id: 'prompt_detail',
        type: 'prompt_improvement',
        title: 'Add More Details',
        description: 'Your prompt could be more specific. Try including quantities, rates, and due dates.',
        action: 'Enhance Prompt',
        confidence: 0.8,
        icon: DocumentTextIcon,
        onApply: () => {
          const enhanced = currentPrompt + ' - Include specific quantities, hourly rates, and payment terms'
          onPromptChange(enhanced)
        }
      })
    }

    // Locale-specific suggestions
    const localeInfo = LOCALE_SUGGESTIONS[selectedLocale as keyof typeof LOCALE_SUGGESTIONS]
    if (localeInfo && !dismissedSuggestions.has('locale_tips')) {
      newSuggestions.push({
        id: 'locale_tips',
        type: 'cultural_context',
        title: `${selectedLocale} Best Practices`,
        description: localeInfo.cultural_tips,
        action: 'Learn More',
        confidence: 0.9,
        icon: GlobeAltIcon,
        onApply: () => {
          // Could open a modal with more detailed tips
          setDismissedSuggestions(prev => new Set([...Array.from(prev), 'locale_tips']))
        },
        metadata: { localeInfo }
      })
    }

    // Template recommendation based on learning
    if (recommendations.suggestedTemplate !== 'modern') {
      newSuggestions.push({
        id: 'template_recommendation',
        type: 'template_recommendation',
        title: `Try ${recommendations.suggestedTemplate.charAt(0).toUpperCase() + recommendations.suggestedTemplate.slice(1)} Template`,
        description: `Based on your preferences, the ${recommendations.suggestedTemplate} template might work better for you.`,
        action: 'Switch Template',
        confidence: 0.7,
        icon: SparklesIcon,
        onApply: () => {
          // This would trigger a template change in the parent component
          setDismissedSuggestions(prev => new Set([...Array.from(prev), 'template_recommendation']))
        }
      })
    }

    // Currency optimization
    if (selectedLocale.startsWith('ar-') && selectedCurrency !== 'SAR') {
      newSuggestions.push({
        id: 'currency_optimization',
        type: 'locale_optimization',
        title: 'Consider SAR Currency',
        description: 'For Saudi Arabia locale, SAR currency is commonly used and may provide better results.',
        action: 'Switch to SAR',
        confidence: 0.85,
        icon: CurrencyDollarIcon,
        onApply: () => {
          onCurrencyChange?.('SAR')
          setDismissedSuggestions(prev => new Set([...Array.from(prev), 'currency_optimization']))
        }
      })
    }

    // Performance optimization suggestion
    if (recommendations.estimatedGenerationTime > 8000) {
      newSuggestions.push({
        id: 'performance_optimization',
        type: 'prompt_improvement',
        title: 'Optimize for Speed',
        description: `Generation may take ${Math.round(recommendations.estimatedGenerationTime / 1000)}s. Simplifying your prompt could speed this up.`,
        action: 'Optimize Prompt',
        confidence: 0.6,
        icon: ClockIcon,
        onApply: () => {
          // Could provide a simplified version of the prompt
          const optimized = currentPrompt.split('.')[0] // Take just the first sentence
          onPromptChange(optimized)
        }
      })
    }

    // Smart prompt completion
    if (currentPrompt.toLowerCase().includes('invoice') && !currentPrompt.includes('$') && !currentPrompt.includes('€')) {
      newSuggestions.push({
        id: 'add_amount',
        type: 'field_completion',
        title: 'Add Amount Information',
        description: 'Including specific amounts helps generate more accurate invoices.',
        action: 'Add Sample Amount',
        confidence: 0.75,
        icon: CurrencyDollarIcon,
        onApply: () => {
          const withAmount = currentPrompt + ` for $1,500`
          onPromptChange(withAmount)
        }
      })
    }

    // Filter out dismissed suggestions
    const filteredSuggestions = newSuggestions.filter(s => !dismissedSuggestions.has(s.id))
    setSuggestions(filteredSuggestions)
  }, [sessionId, documentType, selectedLocale, currentPrompt, selectedCurrency, dismissedSuggestions, onPromptChange, onCurrencyChange])

  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

  const dismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...Array.from(prev), suggestionId]))
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getTypeColor = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'prompt_improvement': return 'bg-purple-100 text-purple-800'
      case 'template_recommendation': return 'bg-blue-100 text-blue-800'
      case 'locale_optimization': return 'bg-green-100 text-green-800'
      case 'cultural_context': return 'bg-orange-100 text-orange-800'
      case 'field_completion': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (suggestions.length === 0 || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50 p-4 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">Smart Suggestions</h3>
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              AI-Powered
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {suggestions.slice(0, 3).map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <suggestion.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(suggestion.type)}`}>
                        {suggestion.type.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={suggestion.onApply}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {suggestion.action}
                      </button>
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {suggestions.length > 3 && (
          <div className="mt-3 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Show {suggestions.length - 3} more suggestions
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}