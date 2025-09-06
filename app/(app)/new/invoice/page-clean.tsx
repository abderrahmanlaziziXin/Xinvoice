'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useGenerateDocument } from '../../../hooks/use-generate-document'
import InvoiceForm from '../../../components/invoice-form'
import { CompanySettings } from '../../../components/company-settings'
import { FileUpload } from '../../../components/file-upload'
import { LoadingSpinner } from '../../../components/loading'
import { useUserContext } from '../../../lib/user-context'
import { parseUploadedFile, convertFileDataToPrompt } from '../../../lib/file-parser'
import { Invoice, DocumentType } from '../../../../packages/core'

export default function NewInvoicePage() {
  const [prompt, setPrompt] = useState('')
  const [generatedInvoice, setGeneratedInvoice] = useState<Partial<Invoice> | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')
  const [uploadedData, setUploadedData] = useState<{success: boolean, data: any[], headers: string[], rawData: string, fileName: string, fileType: 'csv' | 'excel'} | null>(null)
  const { context } = useUserContext()

  const generateMutation = useGenerateDocument()

  const handlePromptChange = (value: string) => {
    setPrompt(value)
  }

  const handleSubmit = async () => {
    let finalPrompt = prompt

    if (inputMode === 'file' && uploadedData) {
      finalPrompt = convertFileDataToPrompt(uploadedData)
    }

    if (!finalPrompt.trim()) {
      toast.error('Please provide invoice details or upload a file')
      return
    }

    const fullPrompt = context 
      ? `${context}\n\n${finalPrompt}`
      : finalPrompt

    generateMutation.mutate(
      {
        prompt: fullPrompt,
        documentType: 'invoice' as DocumentType,
        userContext: context || undefined
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            setGeneratedInvoice(response.document)
            setShowForm(true)
            toast.success('🎉 Invoice generated successfully!')
          } else {
            toast.error('❌ Failed to generate invoice: ' + (response.error || 'Unknown error'))
          }
        },
        onError: (error: Error) => {
          toast.error('❌ Failed to generate invoice: ' + error.message)
        }
      }
    )
  }

  const handleSaveInvoice = (updatedInvoice: Partial<Invoice>) => {
    console.log('Saving invoice:', updatedInvoice)
    toast.success('✅ Invoice saved successfully!')
  }

  const isButtonDisabled = inputMode === 'text' ? 
    !prompt.trim() || generateMutation.isPending :
    !uploadedData || generateMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -40, 0],
          y: [0, 60, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl"
                >
                  <DocumentTextIcon className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  <span className="bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                    Create New Invoice
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-gray-600 max-w-2xl mx-auto"
                >
                  Generate professional invoices with AI assistance or upload your data files
                </motion.p>
              </div>

              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              >
                {/* Settings Button */}
                <div className="flex justify-between items-center p-8 border-b border-gray-100/50">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Invoice Details</h2>
                    <p className="text-gray-600 mt-1">Choose your input method and create your invoice</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(true)}
                    className="flex items-center px-4 py-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-all duration-200"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600 mr-2" />
                    Settings
                  </motion.button>
                </div>

                <div className="p-8">
                  {/* Input Mode Toggle */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-center mb-8"
                  >
                    <div className="bg-gray-100/80 p-1 rounded-2xl backdrop-blur-sm">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInputMode('text')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          inputMode === 'text'
                            ? 'bg-white text-indigo-600 shadow-lg'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <span className="mr-2">✏️</span>
                        Type Description
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setInputMode('file')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          inputMode === 'file'
                            ? 'bg-white text-indigo-600 shadow-lg'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <CloudArrowUpIcon className="w-5 h-5 inline mr-2" />
                        Upload File
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Input Content */}
                  <div className="space-y-6">
                    {inputMode === 'text' ? (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                      >
                        <label className="block text-lg font-semibold text-gray-700">
                          Invoice Description
                        </label>
                        <textarea
                          value={prompt}
                          onChange={(e) => handlePromptChange(e.target.value)}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white/80 placeholder-gray-400 text-base transition-all resize-none backdrop-blur-sm"
                          rows={6}
                          placeholder="Example: Invoice ACME Corp $1500 for web design services, due in 14 days. Include logo design and responsive layout."
                          disabled={generateMutation.isPending}
                        />
                        <div className="text-sm text-gray-500">
                          Tip: Be specific about services, amounts, and due dates for better results
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <FileUpload
                          onFileProcessed={(result) => setUploadedData(result)}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-8 text-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isButtonDisabled}
                      className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-3" />
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                          Generate Invoice
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="invoice-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(false)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Input
              </motion.button>

              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  Invoice Generated Successfully!
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-gray-600"
                >
                  Review and edit your invoice details below
                </motion.p>
              </div>

              {/* Invoice Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              >
                <InvoiceForm
                  initialData={generatedInvoice!}
                  onSubmit={handleSaveInvoice}
                  isSubmitting={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <CompanySettings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  )
}
