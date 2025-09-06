'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

export function Hero() {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Generation',
      description: 'Advanced GPT-4o intelligence for perfect document creation'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'File Upload Support',
      description: 'Upload CSV/Excel files and let AI handle the rest'
    },
    {
      icon: CpuChipIcon,
      title: 'Batch Processing',
      description: 'Generate hundreds of documents in seconds'
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
              Professional
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Document Generation
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create perfect invoices and documents in seconds with AI-powered intelligence. 
            Upload files, describe your needs, and watch the magic happen.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/new/invoice">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Create Single Invoice
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </motion.button>
            </Link>

            <Link href="/new/invoice-batch">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-white/80 backdrop-blur-md text-gray-900 font-semibold rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 mr-2" />
                  Batch Processing
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </Link>

            <Link href="/test/enhanced">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Test Enhanced AI
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative z-10">
                  <feature.icon className="w-12 h-12 text-indigo-600 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>

          {/* Example Invoices Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                See What You Can Create
              </span>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              From simple freelance invoices to complex business transactions
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: 'Freelance Web Design',
                  description: 'Modern template with custom branding',
                  amount: '$2,500',
                  client: 'ACME Corporation',
                  gradient: 'from-blue-500 to-purple-600'
                },
                {
                  title: 'Consulting Services',
                  description: 'Professional hourly billing',
                  amount: '$1,200',
                  client: 'Tech Startup Inc.',
                  gradient: 'from-emerald-500 to-teal-600'
                },
                {
                  title: 'Digital Marketing',
                  description: 'Multi-service package invoice',
                  amount: '$3,750',
                  client: 'Global Brands Ltd.',
                  gradient: 'from-purple-500 to-pink-600'
                }
              ].map((example, index) => (
                <motion.div
                  key={example.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
                  className="group relative bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-full h-32 bg-gradient-to-br ${example.gradient} rounded-xl mb-4 flex items-center justify-center relative overflow-hidden`}>
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">{example.amount}</div>
                      <div className="text-sm opacity-80">Invoice Total</div>
                    </div>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{example.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Client: {example.client}</span>
                    <span>✓ AI Generated</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                Trusted by Professionals
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Sarah Johnson',
                  role: 'Freelance Designer',
                  content: 'This AI invoice generator saved me hours every week. The templates are professional and the AI understands exactly what I need.',
                  rating: 5
                },
                {
                  name: 'Michael Chen',
                  role: 'Consulting Firm Owner',
                  content: 'Batch processing is a game-changer for our business. We generate hundreds of invoices in minutes with perfect accuracy.',
                  rating: 5
                },
                {
                  name: 'Emma Rodriguez',
                  role: 'Digital Agency',
                  content: 'The multi-currency support and localization features make this perfect for our international clients.',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
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
                How AI Powers Your Invoices
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
                  description: 'Professional invoices are created with proper formatting and calculations',
                  icon: '⚡'
                },
                {
                  step: '4',
                  title: 'Download & Send',
                  description: 'Get your PDF invoices instantly, ready to send to clients',
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
