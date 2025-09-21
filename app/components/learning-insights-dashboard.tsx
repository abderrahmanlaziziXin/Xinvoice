/**
 * Learning Insights Dashboard Component
 * 
 * This component provides administrators and power users with insights
 * into the AI learning system's performance and improvement patterns.
 */

"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { learningSystem } from '../lib/learning-system'

interface DashboardStats {
  totalFeedback: number
  averageSatisfaction: number
  totalGenerations: number
  averageResponseTime: number
  topIssues: Array<{issue: string, frequency: number}>
  localePerformance: Map<string, {avgRating: number, count: number}>
  recentInsights: Array<any>
  improvementTrends: Array<{date: string, satisfaction: number}>
}

export default function LearningInsightsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocale, setSelectedLocale] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [selectedTimeframe])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Get quality insights from learning system
      const qualityInsights = learningSystem.getQualityInsights()
      
      // Calculate stats (in a real app, this would come from a backend)
      const mockStats: DashboardStats = {
        totalFeedback: 847,
        averageSatisfaction: qualityInsights.overallSatisfactionScore,
        totalGenerations: 12456,
        averageResponseTime: 4200, // milliseconds
        topIssues: qualityInsights.topIssues,
        localePerformance: new Map([
          ['en-US', { avgRating: 4.7, count: 324 }],
          ['fr-FR', { avgRating: 4.5, count: 156 }],
          ['de-DE', { avgRating: 4.3, count: 143 }],
          ['es-ES', { avgRating: 4.6, count: 98 }],
          ['ar-SA', { avgRating: 4.2, count: 87 }],
          ['zh-CN', { avgRating: 4.4, count: 65 }]
        ]),
        recentInsights: [
          {
            category: 'cultural_context',
            locale: 'ar-SA',
            insight: 'Arabic invoice formatting has improved 23% after recent updates',
            confidence: 0.85,
            actionable: false,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          {
            category: 'error_patterns',
            locale: 'fr-FR',
            insight: 'French VAT calculations show 15% improvement in accuracy',
            confidence: 0.92,
            actionable: true,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            category: 'template_preferences',
            locale: 'de-DE',
            insight: 'German users prefer "Classic" template 60% more than "Modern"',
            confidence: 0.78,
            actionable: true,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        improvementTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          satisfaction: 4.0 + Math.random() * 0.8 + (i / 30) * 0.3 // Slight upward trend
        }))
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatResponseTime = (ms: number) => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
  }

  const getSatisfactionColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100'
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100'
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'cultural_context': return GlobeAltIcon
      case 'error_patterns': return ExclamationTriangleIcon
      case 'template_preferences': return DocumentTextIcon
      default: return LightBulbIcon
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Failed to load learning insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Learning Insights</h2>
          <p className="text-gray-600 mt-1">Monitor AI performance and improvement patterns</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Timeframe Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {timeframe === '7d' ? '7 Days' : timeframe === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-900">Total Feedback</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalFeedback.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-900">Avg Satisfaction</p>
              <p className="text-2xl font-bold text-green-900">{stats.averageSatisfaction.toFixed(1)}/5</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-900">Documents Generated</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalGenerations.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-900">Avg Response Time</p>
              <p className="text-2xl font-bold text-orange-900">{formatResponseTime(stats.averageResponseTime)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Issues</h3>
          </div>
          
          <div className="space-y-3">
            {stats.topIssues.slice(0, 5).map((issue, index) => (
              <div key={issue.issue} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-red-600">{index + 1}</span>
                  </div>
                  <span className="text-gray-900">{issue.issue}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-red-600">{issue.frequency}</span>
                  <span className="text-xs text-gray-500 ml-1">reports</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Locale Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center mb-4">
            <GlobeAltIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Locale Performance</h3>
          </div>
          
          <div className="space-y-3">
            {Array.from(stats.localePerformance.entries())
              .sort((a, b) => b[1].avgRating - a[1].avgRating)
              .slice(0, 6)
              .map(([locale, data]) => (
                <div key={locale} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-900 font-medium">{locale}</span>
                    <span className="text-xs text-gray-500 ml-2">({data.count} generations)</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(data.avgRating)}`}>
                      {data.avgRating.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center mb-6">
          <LightBulbIcon className="w-6 h-6 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent AI Learning Insights</h3>
        </div>
        
        <div className="space-y-4">
          {stats.recentInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.category)
            return (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{insight.locale}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {insight.category.replace('_', ' ')}
                      </span>
                      {insight.actionable && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Actionable
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {insight.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{insight.insight}</p>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">Confidence:</span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${insight.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {stats.recentInsights.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <LightBulbIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No recent insights available</p>
            <p className="text-sm">Generate more documents to see learning patterns</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}