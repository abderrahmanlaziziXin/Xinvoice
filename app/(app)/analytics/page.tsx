"use client"

/**
 * AI Learning Analytics Page
 * 
 * This page provides comprehensive insights into the AI learning system,
 * showing performance metrics, user feedback patterns, and improvement recommendations.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  LightBulbIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import LearningInsightsDashboard from '../../components/learning-insights-dashboard'
import { BreadcrumbStructuredData } from '../../components/seo/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xinvoice.com'

export default function AILearningAnalytics() {
  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Analytics', url: `${baseUrl}/analytics` }
  ]

  return (
    <div className="min-h-screen xinfinity-background relative overflow-hidden">
      {/* Structured Data */}
      <BreadcrumbStructuredData items={breadcrumbs} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <AcademicCapIcon className="w-16 h-16 text-purple-600" />
              <SparklesIcon className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Learning Analytics
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore how our AI system continuously learns from user interactions to improve 
            document generation quality and user experience across all languages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200"
            >
              <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-sm text-gray-600">
                Track AI response times, accuracy rates, and user satisfaction across different languages
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200"
            >
              <LightBulbIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Learning Insights</h3>
              <p className="text-sm text-gray-600">
                Discover patterns in user feedback and cultural preferences to optimize AI responses
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-200"
            >
              <SparklesIcon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart Improvements</h3>
              <p className="text-sm text-gray-600">
                Automated recommendations for enhancing AI prompts and document quality
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LearningInsightsDashboard />
        </motion.div>

        {/* Footer Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Continuous Learning System
            </h3>
            <p className="text-gray-600 mb-4">
              Our AI system learns from every interaction to provide better document generation 
              across all supported languages and cultural contexts. This dashboard shows real-time 
              insights into the learning process and improvement patterns.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Learning Active</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}