'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useGenerateEnhancedDocument } from '../../../hooks/use-generate-enhanced-document'
import { LoadingSpinner } from '../../../components/loading'

export default function EnhancedTestPage() {
  const [prompt, setPrompt] = useState('')
  const [documentType, setDocumentType] = useState<'invoice' | 'nda'>('invoice')
  const [response, setResponse] = useState<any>(null)
  
  const generateMutation = useGenerateEnhancedDocument()

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    generateMutation.mutate({
      prompt,
      documentType,
      useEnhancedPrompts: true
    }, {
      onSuccess: (response) => {
        setResponse(response)
        toast.success('✨ Enhanced document generated!')
      },
      onError: (error: Error) => {
        toast.error('❌ Failed: ' + error.message)
      }
    })
  }

  const examplePrompts = {
    invoice: [
      'Create an invoice for Acme Corp for web development services worth $2500, including design, development, and testing phases',
      'Generate an invoice for Beta LLC for 20 hours of consulting at $150/hour, including strategy sessions and documentation',
      'Bill Gamma Inc for a complete e-commerce solution with payment integration, product catalog, and admin dashboard - total $5000'
    ],
    nda: [
      'Draft a mutual NDA between TechCorp (123 Silicon Valley, CA) and InnovateLab (456 Innovation St, NY) for a 2-year software development collaboration starting January 1, 2026',
      'Create a unilateral NDA where DataCorp shares confidential algorithms with StartupXYZ for 3 years, with high confidentiality level',
      'Generate an NDA between two consulting firms for sharing client strategies and methodologies, term of 18 months'
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Enhanced AI Document Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Test the new enhanced prompt system for richer, more structured document generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">Document Generation</h2>
            
            {/* Document Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Prompt Input */}
            <div className="mb-6">
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
            <div className="mb-6">
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

                {/* Metadata */}
                {response.document && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Document Metadata</h3>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(response.document, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Enhanced Content */}
                {response.content && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Enhanced Content Structure</h3>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(response.content, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Formatted Document */}
                {response.formatted_document && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Formatted Document</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {response.formatted_document}
                    </div>
                  </div>
                )}

                {/* Assumptions */}
                {response.assumptions && response.assumptions.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">AI Assumptions Made</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {response.assumptions.map((assumption: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {assumption}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Enhanced document response will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
