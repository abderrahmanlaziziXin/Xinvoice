'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  DocumentDuplicateIcon, 
  CloudArrowUpIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useGenerateBatchDocuments } from '../../../hooks/use-generate-batch-documents'
import { CompanySettings } from '../../../components/company-settings'
import { FileUpload } from '../../../components/file-upload'
import { LoadingSpinner } from '../../../components/loading'
import { useUserContext } from '../../../lib/user-context'
import { convertFileDataToPrompt, FileParseResult } from '../../../lib/file-parser'
import { downloadMultiplePDFs } from '../../../lib/pdf-generator'
import { Invoice } from '../../../../packages/core'

export default function BatchInvoicePage() {
  const [uploadedData, setUploadedData] = useState<FileParseResult | null>(null)
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Invoice | null>(null)
  const { context } = useUserContext()

  const generateMutation = useGenerateBatchDocuments()

  const handleFileProcessed = (result: FileParseResult) => {
    setUploadedData(result)
    toast.success('✅ File uploaded and processed successfully!')
  }

  const handleFileError = (error: string) => {
    toast.error(`❌ Failed to process file: ${error}`)
  }

  const handleBatchGenerate = async () => {
    if (!uploadedData) {
      toast.error('Please upload a file first')
      return
    }

    // The data is already parsed as objects, not arrays
    const prompts = uploadedData.data.map((row: any, index: number) => {
      // Clean the row data by removing empty values
      const cleanRowData = Object.fromEntries(
        Object.entries(row).filter(([key, value]) => 
          value !== null && value !== undefined && String(value).trim() !== ''
        )
      )
      
      // Extract key fields with fallbacks
      const clientName = cleanRowData.name || cleanRowData.client || cleanRowData.customer || `Client ${index + 1}`
      const amount = cleanRowData.money || cleanRowData.amount || cleanRowData.price || 100
      const time = cleanRowData.time || cleanRowData.hours || cleanRowData.duration || '1 hour'
      const service = cleanRowData.job || cleanRowData.service || cleanRowData.description || 'Professional Services'
      
      // Create a detailed prompt with required fields specified
      const prompt = `Generate a complete, valid invoice with ALL required fields for:

CLIENT DETAILS:
- Client Name: ${clientName}
- Amount: $${amount}
- Time/Duration: ${time}
- Service: ${service}

REQUIRED INVOICE STRUCTURE:
- Invoice number (e.g., INV-${String(index + 1).padStart(3, '0')})
- Issue date (today's date)
- Due date (30 days from issue)
- Client name: "${clientName}"
- At least one line item with description, quantity, rate, and amount
- Proper calculations for subtotal, tax, and total

MANDATORY FIELDS TO INCLUDE:
- to.name: "${clientName}" (REQUIRED - never leave empty)
- items: [{ description: "${service}", quantity: 1, rate: ${amount}, amount: ${amount} }] (REQUIRED - must have at least one item)
- from: Company details from context
- All financial calculations must be accurate

Create a professional, complete invoice with all required fields populated.`
      
      return context ? `${context}\n\n${prompt}` : prompt
    })

    generateMutation.mutate(
      { prompts, documentType: 'invoice', userContext: context || undefined },
      {
        onSuccess: (response) => {
          setGeneratedInvoices(response.documents)
          setShowForm(true)
          toast.success(`🎉 Generated ${response.documents.length} invoices successfully!`)
        },
        onError: (error: Error) => {
          toast.error('❌ Failed to generate invoices: ' + error.message)
        }
      }
    )
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditData({ ...generatedInvoices[index] })
  }

  const handleSave = () => {
    if (editingIndex !== null && editData) {
      const updated = [...generatedInvoices]
      updated[editingIndex] = editData
      setGeneratedInvoices(updated)
      setEditingIndex(null)
      setEditData(null)
      toast.success('✅ Invoice updated successfully!')
    }
  }

  const handleCancel = () => {
    setEditingIndex(null)
    setEditData(null)
  }

  const handleDelete = (index: number) => {
    const updated = generatedInvoices.filter((_, i) => i !== index)
    setGeneratedInvoices(updated)
    toast.success('🗑️ Invoice deleted')
  }

  const handleDownloadAll = async () => {
    if (generatedInvoices.length === 0) {
      toast.error('No invoices to download')
      return
    }

    try {
      toast.loading('📄 Generating PDFs...', { id: 'download' })
      await downloadMultiplePDFs(generatedInvoices)
      toast.success('✅ All PDFs downloaded successfully!', { id: 'download' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('❌ Failed to download PDFs', { id: 'download' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ 
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute top-16 right-16 w-72 h-72 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -50, 0],
          y: [0, 70, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-16 left-16 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="upload-form"
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
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl mb-6 shadow-2xl"
                >
                  <DocumentDuplicateIcon className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  <span className="bg-gradient-to-r from-gray-900 to-emerald-900 bg-clip-text text-transparent">
                    Batch Invoice Generation
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-gray-600 max-w-2xl mx-auto"
                >
                  Upload your CSV or Excel file and generate multiple professional invoices at once
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
                    <h2 className="text-2xl font-semibold text-gray-900">Bulk Invoice Processing</h2>
                    <p className="text-gray-600 mt-1">Upload your data file and generate multiple invoices</p>
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
                  {/* File Upload Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <FileUpload
                      onFileProcessed={handleFileProcessed}
                      onError={handleFileError}
                    />
                    
                    {uploadedData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl"
                      >
                        <div className="flex items-center mb-4">
                          <CheckCircleIcon className="w-6 h-6 text-emerald-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-semibold text-emerald-800">
                              {uploadedData.fileName} processed successfully
                            </h3>
                            <p className="text-emerald-600">
                              {uploadedData.data.length} rows detected • Ready for batch processing
                            </p>
                          </div>
                        </div>
                        
                        {/* Data Preview */}
                        <div className="bg-white/60 rounded-xl p-4 max-h-48 overflow-auto">
                          <h4 className="font-semibold text-gray-800 mb-2">Data Preview:</h4>
                          <div className="text-sm">
                            <div className="font-medium text-gray-600 mb-1">
                              Headers: {uploadedData.headers.join(', ')}
                            </div>
                            <div className="text-gray-500">
                              First row: {uploadedData.data[0] ? Object.values(uploadedData.data[0]).join(', ') : 'No data'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

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
                      onClick={handleBatchGenerate}
                      disabled={!uploadedData || generateMutation.isPending}
                      className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-3" />
                          Generating {uploadedData?.data.length} Invoices...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                          Generate {uploadedData?.data.length || 0} Invoices
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    Generated Invoices ({generatedInvoices.length})
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-gray-600 mt-1"
                  >
                    Review, edit, and download your batch-generated invoices
                  </motion.p>
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 text-gray-700"
                  >
                    ← Back to Upload
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadAll}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Download All PDFs
                  </motion.button>
                </div>
              </div>

              {/* Invoice Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {generatedInvoices.map((invoice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Invoice #{invoice.invoiceNumber}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {invoice.to.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            ${invoice.total.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Due: {invoice.dueDate}
                          </div>
                        </div>
                      </div>

                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Client Name
                            </label>
                            <input
                              type="text"
                              value={editData?.to.name || ''}
                              onChange={(e) => setEditData(prev => prev ? {
                                ...prev,
                                to: { ...prev.to, name: e.target.value }
                              } : null)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Amount
                            </label>
                            <input
                              type="number"
                              value={editData?.total || 0}
                              onChange={(e) => setEditData(prev => prev ? {
                                ...prev,
                                total: parseFloat(e.target.value) || 0
                              } : null)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSave}
                              className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span>{invoice.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Items:</span>
                              <span>{invoice.items.length}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(index)}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(index)}
                              className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
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
