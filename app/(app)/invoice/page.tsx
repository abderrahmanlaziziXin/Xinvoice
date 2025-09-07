'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Logo } from '../../components/logo'
import {
  DocumentTextIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  BoltIcon,
  RocketLaunchIcon
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
      color: 'from-xinfinity-primary to-xinfinity-secondary',
      bgColor: 'from-xinfinity-primary/10 to-xinfinity-secondary/10'
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
      color: 'from-xinfinity-accent to-xinfinity-tertiary',
      bgColor: 'from-xinfinity-accent/10 to-xinfinity-tertiary/10'
    }
  ]

  return (
    <div className="min-h-screen xinfinity-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-xinfinity-primary/20 to-xinfinity-secondary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-xinfinity-accent/20 to-xinfinity-tertiary/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-xfi-8 pb-xfi-6">
        <div className="max-w-7xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-xinfinity-muted hover:text-xinfinity-foreground transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-xfi-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-xfi-2">
              <SparklesIcon className="w-5 h-5 text-xinfinity-primary" />
              <span className="text-sm font-medium text-xinfinity-muted">Enhanced AI Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8 pb-xfi-16">
        {/* Main Content */}
        <div className="text-center mb-xfi-12">
          <div className="flex items-center justify-center mb-xfi-6">
            <Logo size="lg" className="mr-xfi-4" />
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-xinfinity-primary/30 to-transparent mx-xfi-4" />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold"
            >
              <span className="bg-gradient-to-r from-xinfinity-foreground to-xinfinity-primary bg-clip-text text-transparent">
                Invoice
              </span>
              <br />
              <span className="bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
                Generation
              </span>
            </motion.h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-xinfinity-muted max-w-3xl mx-auto mb-xfi-8"
          >
            Choose your preferred method to create professional invoices with AI assistance.
            Whether you need one invoice or hundreds, we&apos;ve got you covered.
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
                <div className={`relative h-full p-xfi-8 xinfinity-card bg-gradient-to-br ${mode.bgColor} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
                  {/* Icon */}
                  <div className={`inline-flex p-xfi-4 rounded-2xl bg-gradient-to-r ${mode.color} text-white mb-xfi-6 group-hover:scale-110 transition-transform duration-300`}>
                    <mode.icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-xinfinity-foreground mb-xfi-4">
                    {mode.title}
                  </h3>
                  <p className="text-xinfinity-muted mb-xfi-6 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-xfi-3 mb-xfi-8">
                    {mode.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-xinfinity-foreground">
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

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-xfi-16 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-xinfinity-foreground mb-xfi-4">
              Need Help Choosing?
            </h3>
            <p className="text-xinfinity-muted mb-xfi-8">
              Start with a single invoice if you&apos;re new to our platform, or jump straight to batch processing
              if you have multiple invoices to create.
            </p>

            <div className="grid md:grid-cols-2 gap-xfi-4">
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
