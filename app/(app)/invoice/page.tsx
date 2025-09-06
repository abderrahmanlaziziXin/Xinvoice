'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function InvoicePage() {
  const [selectedMode, setSelectedMode] = useState<'single' | 'batch' | null>(null)

  const modes = [
    {
      id: 'single' as const,
      title: 'Single Invoice',
      description: 'Create one professional invoice with AI assistance',
      icon: DocumentTextIcon,
      href: '/new/invoice',
      features: [
        'Natural language input',
        'AI-powered calculations',
        'Professional formatting',
        'Instant PDF generation'
      ],
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50'
    },
    {
      id: 'batch' as const,
      title: 'Batch Invoices',
      description: 'Generate multiple invoices from CSV/Excel files',
      icon: DocumentDuplicateIcon,
      href: '/new/invoice-batch',
      features: [
        'CSV/Excel file upload',
        'Bulk processing with AI',
        'Smart data parsing',
        'Multiple PDF download'
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
              <SparklesIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Enhanced AI Powered</span>
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
            <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              Invoice
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Generation
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Choose your preferred method to create professional invoices with AI assistance.
            Whether you need one invoice or hundreds, we&apos;ve got you covered.
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

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-8">
              Start with a single invoice if you&apos;re new to our platform, or jump straight to batch processing 
              if you have multiple invoices to create.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/new/invoice">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-2">
                    <DocumentTextIcon className="w-6 h-6 text-indigo-600 mr-2" />
                    <span className="font-medium text-gray-900">Try Single Invoice</span>
                  </div>
                  <p className="text-sm text-gray-600">Perfect for first-time users</p>
                </motion.div>
              </Link>

              <Link href="/new/invoice-batch">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white/70 backdrop-blur-md rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-center mb-2">
                    <CloudArrowUpIcon className="w-6 h-6 text-emerald-600 mr-2" />
                    <span className="font-medium text-gray-900">Upload Files</span>
                  </div>
                  <p className="text-sm text-gray-600">For bulk invoice generation</p>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Enhanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced GPT-4o integration automatically handles calculations, formatting, 
              and professional document creation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: 'Smart Recognition',
                description: 'AI understands your business context and creates accurate invoices',
                icon: '🧠'
              },
              {
                title: 'Auto Calculations',
                description: 'Handles taxes, totals, and complex pricing automatically',
                icon: '🧮'
              },
              {
                title: 'Professional Output',
                description: 'Generates polished PDFs ready to send to clients',
                icon: '📄'
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
      </div>
    </div>
  )
}
