'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  SparklesIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

export default function NDAPage() {
  const [selectedMode, setSelectedMode] = useState<'ai' | 'manual' | null>(null)

  const modes = [
    {
      id: 'ai' as const,
      title: 'AI-Assisted NDA',
      description: 'Guided form with AI-powered legal language generation',
      icon: SparklesIcon,
      href: '/nda/ai-assisted',
      features: [
        'Guided step-by-step form',
        'AI-generated legal clauses',
        'Professional formatting',
        'Editable sections after generation'
      ],
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50'
    },
    {
      id: 'manual' as const,
      title: 'Manual NDA Editor',
      description: 'Full control with pre-filled legal templates',
      icon: PencilSquareIcon,
      href: '/new/nda',
      features: [
        'Section-by-section editing',
        'Pre-filled legal templates',
        'Legal compliance checks',
        'Custom clause editor'
      ],
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Legal Document Creator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Main Content */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent">
              NDA
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Creation
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Create professional Non-Disclosure Agreements with AI assistance or manual editing.
            Ensure your confidential information is properly protected.
          </motion.p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
              onHoverStart={() => setSelectedMode(mode.id)}
              onHoverEnd={() => setSelectedMode(null)}
              className="group relative"
            >
              <Link href={mode.href}>
                <div className={`relative h-full p-8 bg-gradient-to-br ${mode.bgColor} rounded-3xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${mode.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <mode.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {mode.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {mode.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.color} mr-3`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${mode.color} text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span>Get Started</span>
                    <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Start Options
            </h3>
            <p className="text-gray-600 mb-8">
              Choose AI generation for intelligent document creation, or use manual editing 
              for complete control over every section and clause.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/nda/ai-assisted">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-900">AI-Assisted Creation</span>
                  </div>
                  <p className="text-sm text-gray-600">Guided form with AI generation</p>
                </motion.div>
              </Link>

              <Link href="/new/nda">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-2">
                    <DocumentTextIcon className="w-6 h-6 text-emerald-600 mr-2" />
                    <span className="font-medium text-gray-900">Manual Editor</span>
                  </div>
                  <p className="text-sm text-gray-600">Full control over document sections</p>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Legal Compliance Information */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Legal-Grade Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our NDAs are designed to provide comprehensive protection for your 
              confidential information with industry-standard legal language.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Industry Standards',
                description: 'Built on proven legal templates used by major corporations',
                icon: '⚖️'
              },
              {
                title: 'Customizable Terms',
                description: 'Flexible clauses for different business relationships',
                icon: '🔧'
              },
              {
                title: 'Multi-State Compliance',
                description: 'Adaptable to various state and federal requirements',
                icon: '📋'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                className="text-center p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 text-yellow-600 text-lg">⚠️</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Legal Disclaimer</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    While our templates are based on industry standards, they are not intended as legal advice. 
                    We recommend consulting with a qualified attorney for documents involving significant 
                    confidential information or complex business relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
