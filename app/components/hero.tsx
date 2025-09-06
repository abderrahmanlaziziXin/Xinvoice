'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export function Hero() {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Generation',
      description: 'Advanced GPT-4o intelligence creates perfect documents automatically'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'File Upload Support',
      description: 'Upload CSV/Excel files and let AI handle complex batch processing'
    },
    {
      icon: BoltIcon,
      title: 'Instant Processing',
      description: 'Generate professional documents in seconds, not hours'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Natural Language',
      description: 'Just describe what you need in plain English'
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Floating Orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/20 shadow-lg mb-8"
          >
            <SparklesIcon className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Powered by GPT-4o Advanced AI
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Document Creation
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Generate professional invoices and legal documents in seconds. 
            Just describe what you need or upload files - our AI handles the rest.
          </motion.p>

          {/* Main CTA Buttons - New 2-Button Structure */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16 max-w-2xl mx-auto"
          >
            {/* Generate Invoice CTA */}
            <Link href="/invoice" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center">
                  <DocumentTextIcon className="w-8 h-8 mb-2" />
                  <span className="text-lg font-bold">Generate Invoice</span>
                  <span className="text-sm opacity-90">Single • Batch • File Upload</span>
                  <ArrowRightIcon className="w-4 h-4 mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </motion.button>
            </Link>

            {/* Generate NDA CTA */}
            <Link href="/nda/new" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 mb-2" />
                  <span className="text-lg font-bold">Generate NDA</span>
                  <span className="text-sm opacity-90">Legal • Professional • Editable</span>
                  <ArrowRightIcon className="w-4 h-4 mt-2 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Secondary Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <p className="text-gray-600 mb-4">Need help choosing? Start with a simple invoice</p>
            <Link href="/new/invoice">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                Try Single Invoice →
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative z-10 text-center">
                  <feature.icon className="w-10 h-10 text-indigo-600 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                See What You Can Create
              </span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              From simple freelance invoices to complex legal documents
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Invoice Preview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="text-white text-center">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-lg font-bold">Professional Invoice</div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Invoice Generation</h3>
                <p className="text-sm text-gray-600 mb-3">Create detailed invoices with line items, taxes, and payment instructions</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Single & Batch modes</span>
                  <span>✓ AI Powered</span>
                </div>
              </motion.div>

              {/* NDA Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.0 }}
                className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="text-white text-center">
                    <ShieldCheckIcon className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-lg font-bold">Legal NDA</div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">NDA Creation</h3>
                <p className="text-sm text-gray-600 mb-3">Generate comprehensive NDAs with proper legal language and sections</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Professional templates</span>
                  <span>✓ Legal compliant</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                How AI Powers Your Documents
              </span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Advanced GPT-4o technology understands your business context and creates perfect documents every time
            </p>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: '1',
                  title: 'Describe or Upload',
                  description: 'Tell us about your work in plain English or upload CSV/Excel files',
                  icon: '📝'
                },
                {
                  step: '2', 
                  title: 'AI Processing',
                  description: 'Our advanced AI analyzes your input and understands your business context',
                  icon: '🤖'
                },
                {
                  step: '3',
                  title: 'Smart Generation',
                  description: 'Professional documents are created with proper formatting and calculations',
                  icon: '⚡'
                },
                {
                  step: '4',
                  title: 'Download & Send',
                  description: 'Get your PDF documents instantly, ready to send to clients',
                  icon: '📄'
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {step.step}
                    </div>
                    <div className="text-4xl mb-4">{step.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-xl opacity-20 blur-sm"
      />
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 left-16 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full shadow-xl opacity-20 blur-sm"
      />
    </div>
  )
}
