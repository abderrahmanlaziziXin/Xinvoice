/**
 * AI Feedback Collection Component
 * 
 * This component provides an intuitive interface for collecting user feedback
 * on AI-generated documents, which feeds into the learning system for continuous improvement.
 */

"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { learningSystem, UserFeedback } from '../lib/learning-system'
import { DocumentType } from '../../packages/core'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentType: DocumentType
  locale: string
  currency: string
  generationTime: number
  sessionId: string
  onFeedbackSubmitted?: () => void
}

const FEEDBACK_TYPES = [
  { id: 'accuracy', label: 'Data Accuracy', icon: CheckCircleIcon, description: 'How accurate is the generated information?' },
  { id: 'formatting', label: 'Document Formatting', icon: SparklesIcon, description: 'How professional does the document look?' },
  { id: 'cultural_context', label: 'Cultural Context', icon: LightBulbIcon, description: 'Does it match local business practices?' },
  { id: 'language_quality', label: 'Language Quality', icon: ChatBubbleBottomCenterTextIcon, description: 'How natural and professional is the language?' },
  { id: 'completeness', label: 'Completeness', icon: ExclamationTriangleIcon, description: 'Does it include all necessary information?' }
] as const

const COMMON_ISSUES = [
  'Missing required fields',
  'Incorrect date format',
  'Wrong currency formatting',
  'Inappropriate language tone',
  'Missing cultural context',
  'Poor table formatting',
  'Incorrect calculations',
  'Missing business details',
  'Unclear payment terms',
  'Layout issues'
]

const USER_EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to document generation' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience with business documents' },
  { id: 'expert', label: 'Expert', description: 'Extensive experience with professional documents' }
] as const

export default function FeedbackModal({
  isOpen,
  onClose,
  documentId,
  documentType,
  locale,
  currency,
  generationTime,
  sessionId,
  onFeedbackSubmitted
}: FeedbackModalProps) {
  const [currentStep, setCurrentStep] = useState<'rating' | 'details' | 'suggestions' | 'thank_you'>('rating')
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [feedbackType, setFeedbackType] = useState<string>('')
  const [specificIssues, setSpecificIssues] = useState<string[]>([])
  const [customIssue, setCustomIssue] = useState('')
  const [suggestions, setSuggestions] = useState('')
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate')
  const [editsMade, setEditsMade] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingSubmit = () => {
    if (rating > 0) {
      if (rating >= 4) {
        // High rating - skip to suggestions or thank you
        setCurrentStep('suggestions')
      } else {
        // Low rating - collect detailed feedback
        setCurrentStep('details')
      }
    }
  }

  const handleDetailsSubmit = () => {
    setCurrentStep('suggestions')
  }

  const handleSuggestionsSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Prepare feedback data
      const feedback: UserFeedback = {
        sessionId,
        documentId,
        documentType: documentType as 'invoice' | 'nda',
        locale,
        currency,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        feedbackType: feedbackType as any,
        specificIssues: [...specificIssues, ...(customIssue ? [customIssue] : [])],
        suggestedImprovements: suggestions,
        userExperience,
        generationTime,
        editsMade,
        timestamp: new Date()
      }
      
      // Submit to learning system
      learningSystem.recordFeedback(feedback)
      
      // Move to thank you step
      setCurrentStep('thank_you')
      
      // Call callback if provided
      onFeedbackSubmitted?.()
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep('rating')
    setRating(0)
    setHoveredRating(0)
    setFeedbackType('')
    setSpecificIssues([])
    setCustomIssue('')
    setSuggestions('')
    setUserExperience('intermediate')
    setEditsMade(0)
  }

  const toggleSpecificIssue = (issue: string) => {
    setSpecificIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    How was your experience?
                  </h2>
                  <p className="text-sm text-gray-500">
                    Help us improve AI-generated {documentType}s for {locale}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Rating Step */}
            {currentStep === 'rating' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h3 className="text-lg font-medium mb-4">Rate the overall quality</h3>
                
                <div className="flex justify-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoveredRating || rating) ? (
                        <StarSolidIcon className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-sm text-gray-600 mb-6">
                  {rating === 5 && "Excellent! 🎉"}
                  {rating === 4 && "Very good! 👍"}
                  {rating === 3 && "Good, but could be better"}
                  {rating === 2 && "Needs improvement"}
                  {rating === 1 && "Poor quality"}
                  {rating === 0 && "Click a star to rate"}
                </div>

                {/* User Experience Level */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Your experience level:</p>
                  <div className="flex justify-center space-x-2">
                    {USER_EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setUserExperience(level.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          userExperience === level.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edits Made */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many edits did you make after generation?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editsMade}
                    onChange={(e) => setEditsMade(parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Details Step */}
            {currentStep === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">Help us understand the issues</h3>
                
                {/* Feedback Type Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">What area needs improvement?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FEEDBACK_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFeedbackType(type.id)}
                        className={`p-4 rounded-lg border text-left transition-colors ${
                          feedbackType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <type.icon className={`w-5 h-5 mt-0.5 ${
                            feedbackType === type.id ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Issues */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Specific issues (select all that apply):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_ISSUES.map((issue) => (
                      <label key={issue} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={specificIssues.includes(issue)}
                          onChange={() => toggleSpecificIssue(issue)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{issue}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Other issue..."
                      value={customIssue}
                      onChange={(e) => setCustomIssue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep('rating')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDetailsSubmit}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Suggestions Step */}
            {currentStep === 'suggestions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">Any suggestions for improvement?</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share your thoughts (optional)
                  </label>
                  <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="How could we make this better? What features would you like to see?"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep(rating >= 4 ? 'rating' : 'details')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSuggestionsSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:from-blue-600 hover:to-purple-700 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Thank You Step */}
            {currentStep === 'thank_you' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h3>
                <p className="text-gray-600 mb-4">
                  Your feedback helps us improve AI document generation for everyone.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <SparklesIcon className="w-4 h-4" />
                  <span>AI learning in progress...</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}