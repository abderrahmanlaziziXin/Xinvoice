'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { 
  DocumentDuplicateIcon, 
  CloudArrowUpIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { useGenerateBatchDocuments } from '../../../hooks/use-generate-batch-documents'
import { CompanySettings } from '../../../components/company-settings'
import { FileUpload } from '../../../components/file-upload'
import { LoadingSpinner } from '../../../components/loading'
import { Logo } from '../../../components/logo'
import { useUserContext } from '../../../lib/user-context'
import { usePersistedUserSettings, usePersistedCurrency, usePersistedLocale } from '../../../hooks/use-persisted-settings'
import { convertFileDataToPrompt, FileParseResult } from '../../../lib/file-parser'
import { generateMultiItemPrompt, detectTemplateType } from '../../../lib/csv-template-enhanced'
import { downloadMultiplePDFs } from '../../../lib/pdf-generator'
import { downloadCSVTemplate, getTemplateFieldDescriptions } from '../../../lib/csv-template-enhanced'
import { Invoice } from '../../../../packages/core'

export default function BatchInvoicePage() {
  const router = useRouter()
  const [uploadedData, setUploadedData] = useState<FileParseResult | null>(null)
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<Invoice | null>(null)
  const [detectedTemplate, setDetectedTemplate] = useState<string>('Simple Invoice')
  const { context } = useUserContext()
  const { settings } = usePersistedUserSettings()
  const [lastUsedCurrency, setLastUsedCurrency] = usePersistedCurrency()
  const [lastUsedLocale, setLastUsedLocale] = usePersistedLocale()

  const generateMutation = useGenerateBatchDocuments()

  // Helper function to recalculate invoice totals
  const recalculateInvoiceTotals = (invoice: Invoice): Invoice => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * invoice.taxRate
    const total = subtotal + taxAmount + (invoice.shippingAmount || 0) - (invoice.discountAmount || 0)
    
    return {
      ...invoice,
      subtotal,
      taxAmount,
      total
    }
  }

  // Helper function to update edit data with recalculation
  const updateEditData = (updates: Partial<Invoice>) => {
    if (editData) {
      const updated = { ...editData, ...updates }
      setEditData(recalculateInvoiceTotals(updated))
    }
  }

  const handleFileProcessed = (result: FileParseResult) => {
    setUploadedData(result)
    
    // Detect template type from headers
    const templateType = detectTemplateType(result.headers)
    setDetectedTemplate(templateType)
    
    toast.success(`✅ File uploaded! Detected: ${templateType}`)
  }

  const handleFileError = (error: string) => {
    toast.error(`❌ Failed to process file: ${error}`)
  }

  const handleBatchGenerate = async () => {
    if (!uploadedData) {
      toast.error('Please upload a file first')
      return
    }

    // Use enhanced multi-item prompt generation
    const prompts = uploadedData.data.map((row: any, index: number) => {
      return generateMultiItemPrompt(row, index, context)
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
      // Recalculate totals using helper function
      const updatedInvoice = recalculateInvoiceTotals(editData)
      
      const updated = [...generatedInvoices]
      updated[editingIndex] = updatedInvoice
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

  const handleOpenEditor = (index: number) => {
    const invoice = generatedInvoices[index]
    
    // Store invoice data with persisted settings for the editor
    localStorage.setItem('editingInvoice', JSON.stringify({
      invoice,
      fromBatch: true,
      batchIndex: index,
      defaultCurrency: settings.defaultCurrency || lastUsedCurrency,
      defaultLocale: settings.defaultLocale || lastUsedLocale
    }))
    
    // Navigate to single invoice editor
    router.push('/new/invoice?edit=true')
    toast.success('Opening invoice in full editor...')
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
    <div className="min-h-screen xinfinity-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ 
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute top-16 right-16 w-72 h-72 bg-gradient-to-r from-xinfinity-accent/10 to-xinfinity-tertiary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -50, 0],
          y: [0, 70, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-16 left-16 w-96 h-96 bg-gradient-to-r from-xinfinity-primary/10 to-xinfinity-secondary/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-xfi-4 sm:px-xfi-6 lg:px-xfi-8 py-xfi-8">
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
              <div className="text-center mb-xfi-12">
                <div className="flex items-center justify-center mb-xfi-6">
                  <Logo size="lg" className="mr-xfi-4" />
                  <div className="h-12 w-px bg-gradient-to-b from-transparent via-xinfinity-primary/30 to-transparent mx-xfi-4" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-xinfinity-accent to-xinfinity-tertiary rounded-3xl shadow-2xl"
                  >
                    <DocumentDuplicateIcon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold mb-xfi-4"
                >
                  <span className="bg-gradient-to-r from-xinfinity-foreground to-xinfinity-primary bg-clip-text text-transparent">
                    Batch Invoice Generation
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-xinfinity-muted max-w-2xl mx-auto"
                >
                  Upload your CSV or Excel file and generate multiple professional invoices at once
                </motion.p>
              </div>

              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="xinfinity-card overflow-hidden"
              >
                {/* Settings Button */}
                <div className="flex justify-between items-center p-xfi-8 border-b border-xinfinity-border">
                  <div>
                    <h2 className="text-2xl font-semibold text-xinfinity-foreground">Bulk Invoice Processing</h2>
                    <p className="text-xinfinity-muted mt-xfi-1">Upload your data file and generate multiple invoices</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(true)}
                    className="flex items-center px-xfi-4 py-xfi-2 bg-xinfinity-surface hover:bg-xinfinity-surface/80 rounded-xl transition-all duration-200"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-xinfinity-muted mr-xfi-2" />
                    Settings
                  </motion.button>
                </div>

                <div className="p-xfi-8">
                  {/* CSV Template Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mb-8 p-6 bg-blue-50/50 border border-blue-200/50 rounded-2xl"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need a template?</h3>
                        <p className="text-blue-700 mb-4">
                          Download our CSV template to ensure your data is formatted correctly for batch processing.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <button
                            onClick={() => {
                              downloadCSVTemplate()
                              toast.success('📄 CSV template downloaded!')
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                            Download CSV Template
                          </button>
                        </div>
                        
                        {/* Required Fields Info */}
                        <div className="bg-white/60 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Required Fields:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {getTemplateFieldDescriptions()
                              .filter(field => field.required)
                              .map((field) => (
                                <div key={field.field} className="flex items-center">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  <span className="font-mono text-gray-700">{field.field}</span>
                                  <span className="text-gray-500 ml-2">- {field.description}</span>
                                </div>
                              ))}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2 mt-4">Optional Fields:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {getTemplateFieldDescriptions()
                              .filter(field => !field.required)
                              .slice(0, 4) // Show first 4 optional fields
                              .map((field) => (
                                <div key={field.field} className="flex items-center">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  <span className="font-mono text-gray-700">{field.field}</span>
                                  <span className="text-gray-500 ml-2">- {field.description}</span>
                                </div>
                              ))}
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-3">
                            💡 Tip: The AI can understand various column names and formats. Even if your headers don&apos;t match exactly, the system will try to map them intelligently.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

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
                        <div className="space-y-6 max-h-96 overflow-y-auto">
                          {/* Basic Information */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Invoice Number
                              </label>
                              <input
                                type="text"
                                value={editData?.invoiceNumber || ''}
                                onChange={(e) => setEditData(prev => prev ? {
                                  ...prev,
                                  invoiceNumber: e.target.value
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                value={editData?.date || ''}
                                onChange={(e) => setEditData(prev => prev ? {
                                  ...prev,
                                  date: e.target.value
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                              </label>
                              <input
                                type="date"
                                value={editData?.dueDate || ''}
                                onChange={(e) => setEditData(prev => prev ? {
                                  ...prev,
                                  dueDate: e.target.value
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={editData?.status || 'draft'}
                                onChange={(e) => setEditData(prev => prev ? {
                                  ...prev,
                                  status: e.target.value as any
                                } : null)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                              >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Client Information */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
                            <div className="grid md:grid-cols-2 gap-4">
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
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={editData?.to.email || ''}
                                  onChange={(e) => setEditData(prev => prev ? {
                                    ...prev,
                                    to: { ...prev.to, email: e.target.value }
                                  } : null)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Address
                                </label>
                                <textarea
                                  value={editData?.to.address || ''}
                                  onChange={(e) => setEditData(prev => prev ? {
                                    ...prev,
                                    to: { ...prev.to, address: e.target.value }
                                  } : null)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-gray-900">Invoice Items</h4>
                              <button
                                onClick={() => {
                                  if (editData) {
                                    updateEditData({
                                      items: [...editData.items, {
                                        description: '',
                                        quantity: 1,
                                        rate: 0,
                                        amount: 0
                                      }]
                                    })
                                  }
                                }}
                                className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                              >
                                + Add Item
                              </button>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {editData?.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-4">
                                    <label className="block text-xs text-gray-600 mb-1">Description</label>
                                    <input
                                      type="text"
                                      value={item.description}
                                      onChange={(e) => {
                                        if (editData) {
                                          const newItems = [...editData.items]
                                          newItems[itemIndex] = { ...item, description: e.target.value }
                                          updateEditData({ items: newItems })
                                        }
                                      }}
                                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">Qty</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={item.quantity}
                                      onChange={(e) => {
                                        if (editData) {
                                          const qty = parseFloat(e.target.value) || 0
                                          const newItems = [...editData.items]
                                          newItems[itemIndex] = { 
                                            ...item, 
                                            quantity: qty,
                                            amount: qty * item.rate
                                          }
                                          updateEditData({ items: newItems })
                                        }
                                      }}
                                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">Rate</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={item.rate}
                                      onChange={(e) => {
                                        if (editData) {
                                          const rate = parseFloat(e.target.value) || 0
                                          const newItems = [...editData.items]
                                          newItems[itemIndex] = { 
                                            ...item, 
                                            rate: rate,
                                            amount: item.quantity * rate
                                          }
                                          updateEditData({ items: newItems })
                                        }
                                      }}
                                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                                    <input
                                      type="number"
                                      value={item.amount.toFixed(2)}
                                      readOnly
                                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <button
                                      onClick={() => {
                                        if (editData && editData.items.length > 1) {
                                          const newItems = editData.items.filter((_, i) => i !== itemIndex)
                                          updateEditData({ items: newItems })
                                        }
                                      }}
                                      className="w-full px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Totals */}
                          <div className="border-t pt-4">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Tax Rate (%)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={(editData?.taxRate || 0) * 100}
                                  onChange={(e) => {
                                    if (editData) {
                                      const taxRate = (parseFloat(e.target.value) || 0) / 100
                                      updateEditData({ taxRate })
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Discount Amount
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editData?.discountAmount || 0}
                                  onChange={(e) => {
                                    if (editData) {
                                      const discountAmount = parseFloat(e.target.value) || 0
                                      updateEditData({ discountAmount })
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Shipping Amount
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editData?.shippingAmount || 0}
                                  onChange={(e) => {
                                    if (editData) {
                                      const shippingAmount = parseFloat(e.target.value) || 0
                                      updateEditData({ shippingAmount })
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Notes and Terms */}
                          <div className="border-t pt-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Terms & Conditions
                                </label>
                                <textarea
                                  value={editData?.terms || ''}
                                  onChange={(e) => setEditData(prev => prev ? {
                                    ...prev,
                                    terms: e.target.value
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={editData?.notes || ''}
                                  onChange={(e) => setEditData(prev => prev ? {
                                    ...prev,
                                    notes: e.target.value
                                  } : null)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="border-t pt-4 flex space-x-2">
                            <button
                              onClick={handleSave}
                              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancel}
                              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
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
                              className="flex-1 px-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs flex items-center justify-center"
                            >
                              <PencilIcon className="w-3 h-3 mr-1" />
                              Quick Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleOpenEditor(index)}
                              className="flex-1 px-2 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs flex items-center justify-center"
                            >
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              Open Editor
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(index)}
                              className="flex-1 px-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs flex items-center justify-center"
                            >
                              <TrashIcon className="w-3 h-3 mr-1" />
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
