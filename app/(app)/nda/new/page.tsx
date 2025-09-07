'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Logo } from '../../../components/logo'
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
      color: 'from-xinfinity-primary to-xinfinity-secondary',
      bgColor: 'from-xinfinity-accent/20 to-xinfinity-secondary/20'
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
    <div className="min-h-screen xinfinity-background">
      {/* Floating Elements */}
      <div className="floating-elements">
        <motion.div 
          className="floating-element"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="floating-element floating-element-2"
          animate={{ 
            x: [0, -120, 0],
            y: [0, 100, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="floating-element floating-element-3"
          animate={{ 
            x: [0, 80, 0],
            y: [0, -80, 0],
            rotate: [0, 90, 180]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <div className="relative pt-xfi-8 pb-xfi-6">
        <div className="max-w-7xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300">
              <ArrowLeftIcon className="w-5 h-5 mr-xfi-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-xfi-2">
              <Logo size="sm" />
              <span className="text-sm font-medium text-gray-600">Legal Document Creator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8 pb-xfi-16">
        {/* Main Content */}
        <div className="text-center mb-xfi-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-xfi-6"
          >
            <span className="bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
              NDA
            </span>
            <br />
            <span className="bg-gradient-to-r from-xinfinity-accent to-teal-600 bg-clip-text text-transparent">
              Creation
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-xfi-8"
          >
            Create professional Non-Disclosure Agreements with AI assistance or manual editing.
            Ensure your confidential information is properly protected.
          </motion.p>
        </div>

        {/* Mode Selection */}
        <div className="grid md:grid-cols-2 gap-xfi-8 max-w-5xl mx-auto">
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
                <div className={`xinfinity-card relative h-full bg-gradient-to-br ${mode.bgColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                  {/* Icon */}
                  <div className={`inline-flex p-xfi-4 rounded-2xl bg-gradient-to-r ${mode.color} text-white mb-xfi-6 group-hover:scale-110 transition-transform duration-300`}>
                    <mode.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-xfi-4">
                    {mode.title}
                  </h3>
                  <p className="text-gray-600 mb-xfi-6 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-xfi-3 mb-xfi-8">
                    {mode.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.color} mr-xfi-3`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`inline-flex items-center px-xfi-6 py-xfi-3 bg-gradient-to-r ${mode.color} text-white font-semibold rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span>Get Started</span>
                    <ChevronRightIcon className="w-4 h-4 ml-xfi-2 group-hover:translate-x-1 transition-transform duration-300" />
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
          className="mt-xfi-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-xfi-4">
              Quick Start Options
            </h3>
            <p className="text-gray-600 mb-xfi-8">
              Choose AI generation for intelligent document creation, or use manual editing 
              for complete control over every section and clause.
            </p>
            
            <div className="grid md:grid-cols-2 gap-xfi-4">
              <Link href="/nda/ai-assisted">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="xinfinity-card hover:border-xinfinity-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-xfi-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-xinfinity-primary mr-xfi-2" />
                    <span className="font-medium text-gray-900">AI-Assisted Creation</span>
                  </div>
                  <p className="text-sm text-gray-600">Guided form with AI generation</p>
                </motion.div>
              </Link>

              <Link href="/new/nda">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="xinfinity-card hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-xfi-2">
                    <DocumentTextIcon className="w-6 h-6 text-emerald-600 mr-xfi-2" />
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
          className="mt-xfi-20"
        >
          <div className="text-center mb-xfi-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-xfi-4">
              Legal-Grade Protection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our NDAs are designed to provide comprehensive protection for your 
              confidential information with industry-standard legal language.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xfi-8 max-w-4xl mx-auto">
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
                className="xinfinity-card text-center"
              >
                <div className="text-4xl mb-xfi-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-xfi-2">{feature.title}</h3>
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
          className="mt-xfi-16 max-w-4xl mx-auto"
        >
          <div className="p-xfi-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 text-yellow-600 text-lg">⚠️</div>
              </div>
              <div className="ml-xfi-3">
                <h3 className="text-sm font-medium text-yellow-800">Legal Disclaimer</h3>
                <div className="mt-xfi-2 text-sm text-yellow-700">
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
