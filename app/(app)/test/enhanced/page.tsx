'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useGenerateEnhancedDocument } from '../../../hooks/use-generate-enhanced-document'
import { LoadingSpinner } from '../../../components/loading'
import { Logo } from '../../../components/logo'
import { ChevronDownIcon, ChevronRightIcon, ClipboardDocumentIcon, DocumentArrowDownIcon, BeakerIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { Currency, Locale } from '../../../../packages/core/schemas'

interface CompanySettings {
  companyName: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  defaultCurrency: string
  defaultLocale: string
}

interface OptionalParams {
  companyName: string
  companyAddress: string
  clientName: string
  clientAddress: string
  currency: string
  locale: string
  effectiveDate: string
  terminationDate: string
}

export default function EnhancedTestPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EnhancedTestContent />
    </Suspense>
  )
}

function EnhancedTestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState('')
  const [documentType, setDocumentType] = useState<'invoice' | 'nda'>('invoice')
  const [response, setResponse] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>(['formatted'])
  const [optionalParams, setOptionalParams] = useState<OptionalParams>({
    companyName: '',
    companyAddress: '',
    clientName: '',
    clientAddress: '',
    currency: 'USD',
    locale: 'en-US',
    effectiveDate: '',
    terminationDate: ''
  })
  
  const generateMutation = useGenerateEnhancedDocument()

  // Set document type from URL parameter
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'nda' || typeParam === 'invoice') {
      setDocumentType(typeParam)
    }
  }, [searchParams])

  // Load company settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings')
    if (savedSettings) {
      try {
        const settings: CompanySettings = JSON.parse(savedSettings)
        setOptionalParams(prev => ({
          ...prev,
          companyName: settings.companyName || '',
          companyAddress: settings.companyAddress || '',
          currency: settings.defaultCurrency || 'USD',
          locale: settings.defaultLocale || 'en-US'
        }))
      } catch (error) {
        console.error('Error loading company settings:', error)
      }
    }
  }, [])

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    // Build enhanced prompt with optional parameters
    const enhancedPrompt = buildEnhancedPrompt(prompt, optionalParams, documentType)

    generateMutation.mutate({
      prompt: enhancedPrompt,
      documentType,
      useEnhancedPrompts: true,
      userContext: {
        companyName: optionalParams.companyName,
        companyEmail: '', // Will be filled from settings if available
        defaultCurrency: optionalParams.currency as Currency,
        defaultLocale: optionalParams.locale as Locale,
        defaultTaxRate: 0.08 // Default tax rate
      }
    }, {
      onSuccess: (response) => {
        setResponse(response)
        setExpandedSections(['formatted', 'metadata'])
        toast.success('✨ Enhanced document generated!')
      },
      onError: (error: Error) => {
        toast.error('❌ Failed: ' + error.message)
      }
    })
  }

  const buildEnhancedPrompt = (basePrompt: string, params: OptionalParams, type: 'invoice' | 'nda'): string => {
    let enhancedPrompt = basePrompt

    // Add context based on provided parameters
    const contextParts = []
    
    if (params.companyName) contextParts.push(`Company: ${params.companyName}`)
    if (params.companyAddress) contextParts.push(`Company Address: ${params.companyAddress}`)
    if (params.clientName) contextParts.push(`Client: ${params.clientName}`)
    if (params.clientAddress) contextParts.push(`Client Address: ${params.clientAddress}`)
    if (params.currency !== 'USD') contextParts.push(`Currency: ${params.currency}`)
    if (params.locale !== 'en-US') contextParts.push(`Locale: ${params.locale}`)
    
    if (type === 'nda') {
      if (params.effectiveDate) contextParts.push(`Effective Date: ${params.effectiveDate}`)
      if (params.terminationDate) contextParts.push(`Termination Date: ${params.terminationDate}`)
    }

    if (contextParts.length > 0) {
      enhancedPrompt = `${basePrompt}\n\nAdditional Context:\n${contextParts.join('\n')}`
    }

    return enhancedPrompt
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const handleUseAsInvoice = () => {
    if (!response?.document) {
      toast.error('No document data available')
      return
    }

    // Store the AI-generated data in localStorage for the invoice editor
    localStorage.setItem('aiGeneratedInvoice', JSON.stringify({
      document: response.document,
      content: response.content,
      assumptions: response.assumptions || []
    }))

    toast.success('Redirecting to invoice editor...')
    router.push('/new/invoice?from=ai')
  }

  const handleUseAsNDA = () => {
    if (!response?.document) {
      toast.error('No document data available')
      return
    }

    // Store the AI-generated data in localStorage for the NDA editor
    localStorage.setItem('aiGeneratedNDA', JSON.stringify({
      document: response.document,
      content: response.content,
      assumptions: response.assumptions || []
    }))

    toast.success('Redirecting to NDA editor...')
    router.push('/new/nda?from=ai')
  }

  const downloadJSON = () => {
    if (!response) return
    
    const dataStr = JSON.stringify(response, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${documentType}-response.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const examplePrompts = {
    invoice: [
      'Create an invoice for Acme Corp for web development services worth $2500, including design, development, and testing phases',
      'Generate an invoice for Beta LLC for 20 hours of consulting at $150/hour, including strategy sessions and documentation',
      'Bill Gamma Inc for a complete e-commerce solution with payment integration, product catalog, and admin dashboard - total $5000'
    ],
    nda: [
      'Draft a mutual NDA between TechCorp and InnovateLab for a 2-year software development collaboration starting January 1, 2026',
      'Create a unilateral NDA where DataCorp shares confidential algorithms with StartupXYZ for 3 years, with high confidentiality level',
      'Generate an NDA between two consulting firms for sharing client strategies and methodologies, term of 18 months'
    ]
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

      <div className="relative z-10 max-w-7xl mx-auto p-xfi-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-xfi-8"
        >
          <div className="flex items-center justify-center mb-xfi-4">
            <Logo size="md" className="mr-xfi-3" />
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-xinfinity-primary/30 to-transparent mx-xfi-4" />
            <BeakerIcon className="w-10 h-10 text-xinfinity-primary mr-xfi-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
              Enhanced AI Document Generator
            </h1>
          </div>
          <p className="text-xinfinity-muted text-lg">
            Create professional documents with AI-powered intelligence and optional parameters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xfi-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xinfinity-card p-xfi-6 space-y-xfi-6"
          >
            <h2 className="text-xl font-semibold mb-xfi-4 text-xinfinity-foreground flex items-center">
              <SparklesIcon className="w-5 h-5 mr-xfi-2 text-xinfinity-primary" />
              Document Generation
            </h2>
            
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                Document Type
              </label>
              <div className="flex space-x-4">
                {(['invoice', 'nda'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setDocumentType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      documentType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={optionalParams.companyName}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company Inc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={optionalParams.clientName}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Client Company"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <input
                  type="text"
                  value={optionalParams.companyAddress}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, companyAddress: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Business St, City, State 12345"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Address
                </label>
                <input
                  type="text"
                  value={optionalParams.clientAddress}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, clientAddress: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="456 Client Ave, City, State 67890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={optionalParams.currency}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locale
                </label>
                <select
                  value={optionalParams.locale}
                  onChange={(e) => setOptionalParams(prev => ({ ...prev, locale: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">Français</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              {documentType === 'nda' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={optionalParams.effectiveDate}
                      onChange={(e) => setOptionalParams(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Termination Date
                    </label>
                    <input
                      type="date"
                      value={optionalParams.terminationDate}
                      onChange={(e) => setOptionalParams(prev => ({ ...prev, terminationDate: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe the ${documentType} you want to generate...`}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Example Prompts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Example Prompts
              </label>
              <div className="space-y-2">
                {examplePrompts[documentType].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {generateMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Generating...</span>
                </div>
              ) : (
                '✨ Generate Enhanced Document'
              )}
            </button>
          </motion.div>

          {/* Response Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Generated Response</h2>
            
            {response ? (
              <div className="space-y-4">
                {/* Status Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      response.enhanced 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {response.enhanced ? '✨ Enhanced' : '⚠️ Standard Fallback'}
                    </span>
                    {response.assumptions && response.assumptions.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {response.assumptions.length} Assumptions
                      </span>
                    )}
                  </div>
                  
                  {/* Export Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadJSON}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download JSON"
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pb-4 border-b">
                  <button
                    onClick={handleUseAsInvoice}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Use as Invoice
                  </button>
                  <button
                    onClick={handleUseAsNDA}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Use as NDA
                  </button>
                </div>

                {/* Collapsible Sections */}
                {/* Formatted Document */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('formatted')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">Formatted Document</h3>
                    {expandedSections.includes('formatted') ? (
                      <ChevronDownIcon className="w-5 h-5" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.includes('formatted') && response.formatted_document && (
                    <div className="px-4 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Ready-to-use document text</span>
                        <button
                          onClick={() => copyToClipboard(response.formatted_document, 'Formatted document')}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {response.formatted_document}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('metadata')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">Document Metadata</h3>
                    {expandedSections.includes('metadata') ? (
                      <ChevronDownIcon className="w-5 h-5" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5" />
                    )}
                  </button>
                  {expandedSections.includes('metadata') && response.document && (
                    <div className="px-4 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Structured document data</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(response.document, null, 2), 'Metadata')}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Copy to clipboard"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {JSON.stringify(response.document, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Content */}
                {response.content && (
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection('content')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium">Enhanced Content Structure</h3>
                      {expandedSections.includes('content') ? (
                        <ChevronDownIcon className="w-5 h-5" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.includes('content') && (
                      <div className="px-4 pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Rich content structure</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(response.content, null, 2), 'Content structure')}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Copy to clipboard"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {JSON.stringify(response.content, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assumptions */}
                {response.assumptions && response.assumptions.length > 0 && (
                  <div className="border rounded-lg">
                    <button
                      onClick={() => toggleSection('assumptions')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium">AI Assumptions Made</h3>
                      {expandedSections.includes('assumptions') ? (
                        <ChevronDownIcon className="w-5 h-5" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.includes('assumptions') && (
                      <div className="px-4 pb-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <ul className="text-sm text-gray-700 space-y-1">
                            {response.assumptions.map((assumption: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-600 mr-2">•</span>
                                {assumption}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Enhanced document response will appear here</p>
                <p className="text-sm mt-2">Fill in optional parameters and generate a document to see the structured output</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
