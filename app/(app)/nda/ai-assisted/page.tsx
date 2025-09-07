'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '../../../components/loading'
import { Logo } from '../../../components/logo'
import { useGenerateEnhancedDocument } from '../../../hooks/use-generate-enhanced-document'
import {
  SparklesIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// AI Input Schema for guided form
const aiNDAInputSchema = z.object({
  disclosingParty: z.object({
    name: z.string().min(1, 'Disclosing party name is required'),
    address: z.string().min(1, 'Disclosing party address is required'),
  }),
  receivingParty: z.object({
    name: z.string().min(1, 'Receiving party name is required'),
    address: z.string().min(1, 'Receiving party address is required'),
  }),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  termDuration: z.string().optional(),
  terminationDate: z.string().optional(),
  governingLaw: z.string().min(1, 'Governing law is required'),
  projectDescription: z.string().optional(),
  customClauses: z.string().optional(),
})

type AInaInputData = z.infer<typeof aiNDAInputSchema>

export default function AIAssistedNDAPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'guided' | 'freetext'>('guided')
  const [freeTextInput, setFreeTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generateMutation = useGenerateEnhancedDocument()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<AInaInputData>({
    resolver: zodResolver(aiNDAInputSchema),
    defaultValues: {
      disclosingParty: { name: '', address: '' },
      receivingParty: { name: '', address: '' },
      effectiveDate: new Date().toISOString().split('T')[0],
      termDuration: '',
      terminationDate: '',
      governingLaw: 'State of California',
      projectDescription: '',
      customClauses: ''
    }
  })

  const watchedData = watch()

  const buildStructuredPrompt = (data: AInaInputData) => {
    return `Generate a professional Non-Disclosure Agreement with the following details:

PARTIES:
- Disclosing Party: ${data.disclosingParty.name}
  Address: ${data.disclosingParty.address}
- Receiving Party: ${data.receivingParty.name}
  Address: ${data.receivingParty.address}

TERMS:
- Effective Date: ${data.effectiveDate}
${data.termDuration ? `- Duration: ${data.termDuration}` : ''}
${data.terminationDate ? `- Termination Date: ${data.terminationDate}` : ''}
- Governing Law: ${data.governingLaw}

${data.projectDescription ? `PROJECT CONTEXT:
${data.projectDescription}` : ''}

${data.customClauses ? `SPECIAL PROVISIONS:
${data.customClauses}` : ''}

Please generate comprehensive legal sections including Purpose, Definitions, Confidentiality Obligations, Exclusions, Term & Termination, and Governing Law clauses.`
  }

  const handleGuidedSubmit = async (data: AInaInputData) => {
    setIsGenerating(true)
    const prompt = buildStructuredPrompt(data)
    
    generateMutation.mutate({
      prompt,
      documentType: 'nda',
      useEnhancedPrompts: true,
      userContext: {
        companyName: data.disclosingParty.name,
        companyEmail: '',
        defaultCurrency: 'USD',
        defaultLocale: 'en-US',
        defaultTaxRate: 0
      }
    }, {
      onSuccess: (response) => {
        // Store the AI response and redirect directly to editor
        localStorage.setItem('aiGeneratedNDA', JSON.stringify({
          ...response,
          inputData: data,
          inputType: 'guided'
        }))
        
        // Show loading toast and redirect immediately
        toast.loading('Generating NDA document...', { duration: 1000 })
        
        // Redirect to editor with loading state
        setTimeout(() => {
          router.push('/nda/editor?from=ai')
          toast.success('✨ AI-generated NDA created!')
        }, 500)
      },
      onError: (error: Error) => {
        setIsGenerating(false)
        toast.error('Failed to generate NDA: ' + error.message)
      }
    })
  }

  const handleFreeTextSubmit = async () => {
    if (!freeTextInput.trim()) {
      toast.error('Please describe your NDA requirements')
      return
    }

    setIsGenerating(true)
    
    const prompt = `Generate a professional Non-Disclosure Agreement based on this description:

${freeTextInput}

Please create comprehensive legal sections and make reasonable assumptions for any missing details. List all assumptions made.`

    generateMutation.mutate({
      prompt,
      documentType: 'nda',
      useEnhancedPrompts: true,
      userContext: {
        companyName: '',
        companyEmail: '',
        defaultCurrency: 'USD',
        defaultLocale: 'en-US',
        defaultTaxRate: 0
      }
    }, {
      onSuccess: (response) => {
        // Store the AI response and redirect directly to editor
        localStorage.setItem('aiGeneratedNDA', JSON.stringify({
          ...response,
          inputData: { freeTextInput },
          inputType: 'freetext'
        }))
        
        // Show loading toast and redirect immediately
        toast.loading('Generating NDA document...', { duration: 1000 })
        
        // Redirect to editor with loading state
        setTimeout(() => {
          router.push('/nda/editor?from=ai')
          toast.success('✨ AI-generated NDA created!')
        }, 500)
      },
      onError: (error: Error) => {
        setIsGenerating(false)
        toast.error('Failed to generate NDA: ' + error.message)
      }
    })
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen xinfinity-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-xfi-4"
          >
            <h3 className="text-lg font-semibold text-xinfinity-foreground mb-xfi-2">
              Generating Your NDA
            </h3>
            <p className="text-xinfinity-muted">
              Our AI is crafting professional legal language for your agreement...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

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
            <Link href="/nda/new" className="flex items-center text-xinfinity-muted hover:text-xinfinity-foreground transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-xfi-2" />
              Back to NDA Hub
            </Link>
            <div className="flex items-center space-x-xfi-2">
              <BoltIcon className="w-5 h-5 text-xinfinity-primary" />
              <span className="text-sm font-medium text-xinfinity-muted">AI-Assisted Creation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8 pb-xfi-16">
        {/* Main Content */}
        <div className="text-center mb-xfi-12">
          <div className="flex items-center justify-center mb-xfi-6">
            <Logo size="lg" className="mr-xfi-4" />
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-xinfinity-primary/30 to-transparent mx-xfi-4" />
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold"
            >
              <span className="bg-gradient-to-r from-xinfinity-foreground to-xinfinity-primary bg-clip-text text-transparent">
                AI-Assisted
              </span>
              <br />
              <span className="bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
                NDA Creation
              </span>
            </motion.h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-xinfinity-muted max-w-3xl mx-auto mb-xfi-8"
          >
            Choose your preferred input method - guided form for structured input or free-text description for natural language.
          </motion.p>
        </div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-white/70 backdrop-blur-md rounded-xl p-1 border border-white/20 shadow-lg">
            <button
              onClick={() => setMode('guided')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === 'guided'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="w-5 h-5 inline mr-2" />
              Guided Form
            </button>
            <button
              onClick={() => setMode('freetext')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                mode === 'freetext'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 inline mr-2" />
              Free Text
            </button>
          </div>
        </motion.div>

        {/* Content based on mode */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'guided' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl p-8"
        >
          {mode === 'guided' ? (
            <form onSubmit={handleSubmit(handleGuidedSubmit)} className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Guided NDA Form</h2>
                <p className="text-gray-600">Fill in the details below and our AI will generate professional legal language</p>
              </div>

              {/* Parties Section */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
                    Disclosing Party
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      {...register('disclosingParty.name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Company or individual name"
                    />
                    {errors.disclosingParty?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.disclosingParty.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      {...register('disclosingParty.address')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Full address including city, state, zip"
                    />
                    {errors.disclosingParty?.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.disclosingParty.address.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
                    Receiving Party
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      {...register('receivingParty.name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Company or individual name"
                    />
                    {errors.receivingParty?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.receivingParty.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      {...register('receivingParty.address')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Full address including city, state, zip"
                    />
                    {errors.receivingParty?.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.receivingParty.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
                  Agreement Terms
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      {...register('effectiveDate')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.effectiveDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.effectiveDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Governing Law *
                    </label>
                    <select
                      {...register('governingLaw')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="State of California">State of California</option>
                      <option value="State of New York">State of New York</option>
                      <option value="State of Texas">State of Texas</option>
                      <option value="State of Florida">State of Florida</option>
                      <option value="Delaware">Delaware</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term Duration (Optional)
                    </label>
                    <input
                      {...register('termDuration')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 2 years, 6 months"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termination Date (Optional)
                    </label>
                    <input
                      type="date"
                      {...register('terminationDate')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</div>
                  Additional Details (Optional)
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    {...register('projectDescription')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe the purpose or project context for this NDA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Clauses or Special Provisions
                  </label>
                  <textarea
                    {...register('customClauses')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Any specific requirements or special provisions"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="w-5 h-5 inline mr-2" />
                  Generate AI-Powered NDA
                  <ArrowRightIcon className="w-5 h-5 inline ml-2" />
                </motion.button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your NDA</h2>
                <p className="text-gray-600">Tell us about your NDA requirements in natural language</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  NDA Description *
                </label>
                <textarea
                  value={freeTextInput}
                  onChange={(e) => setFreeTextInput(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Example: I need an NDA between my tech startup and a potential investor. The startup is TechCorp Inc. located in San Francisco, and the investor is InvestCo LLC in New York. We'll be discussing our AI platform technology and financial projections. The NDA should be effective immediately and last for 2 years. It should be governed by California law."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">AI Assumptions</h4>
                    <p className="text-sm text-yellow-700">
                      When using free-text input, our AI will make reasonable assumptions for missing details. 
                      All assumptions will be clearly listed in the editor for your review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFreeTextSubmit}
                  disabled={!freeTextInput.trim() || generateMutation.isPending}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="w-5 h-5 inline mr-2" />
                  Generate AI-Powered NDA
                  <ArrowRightIcon className="w-5 h-5 inline ml-2" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
