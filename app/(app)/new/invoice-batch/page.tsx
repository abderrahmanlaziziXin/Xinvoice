'use client'

import { useState } from 'react'
import { useGenerateDocument } from '../../../hooks/use-generate-document'
import { useGenerateBatchDocuments } from '../../../hooks/use-generate-batch-documents'
import { useUserContext } from '../../../lib/user-context'
import { parseUploadedFile, convertFileDataToPrompt } from '../../../lib/file-parser'
import { FileUpload } from '../../../components/file-upload'
import { Invoice } from '../../../../packages/core'
import { CompanySettings } from '../../../components/company-settings'
import { downloadMultiplePDFs, InvoicePDFGenerator } from '../../../lib/pdf-generator'
// We'll create a simplified inline component for now

interface InvoiceDisplayProps {
  invoice: Invoice
  isEditable: boolean
  onSave: (invoice: Invoice) => void
}

function InvoiceDisplay({ invoice, isEditable, onSave }: InvoiceDisplayProps) {
  const [editData, setEditData] = useState<Invoice>(invoice)

  const handleSave = () => {
    onSave(editData)
  }

  if (isEditable) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input
              type="text"
              value={editData.to.name}
              onChange={(e) => setEditData({
                ...editData,
                to: { ...editData.to, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <input
              type="number"
              value={editData.total}
              onChange={(e) => setEditData({
                ...editData,
                total: parseFloat(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Client:</span>
          <p className="text-gray-900">{invoice.to.name}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Amount:</span>
          <p className="text-gray-900 font-semibold">${invoice.total.toFixed(2)}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Due Date:</span>
          <p className="text-gray-900">{invoice.dueDate}</p>
        </div>
      </div>
      <div className="text-sm">
        <span className="font-medium text-gray-600">Items:</span>
        <ul className="mt-1 space-y-1">
          {invoice.items.map((item, idx) => (
            <li key={idx} className="text-gray-700">
              {item.description} - {item.quantity} × ${item.rate} = ${item.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function BatchInvoicePage() {
  const [prompts, setPrompts] = useState<string[]>([''])
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([])
  const [showForms, setShowForms] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')
  const [uploadedData, setUploadedData] = useState<{success: boolean, data: any[], headers: string[], rawData: string, fileName: string, fileType: 'csv' | 'excel'} | null>(null)

  const { context } = useUserContext()
  const generateMutation = useGenerateDocument()
  const generateBatchMutation = useGenerateBatchDocuments()

  const handleFileProcessed = (result: any) => {
    if (result.success) {
      setUploadedData(result)
      console.log('File processed for batch:', result)
    } else {
      alert('Failed to parse file. Please check the format and try again.')
    }
  }

  const handleFileError = (error: string) => {
    console.error('File upload error:', error)
    alert('Error uploading file: ' + error)
  }

  const addPromptField = () => {
    setPrompts([...prompts, ''])
  }

  const removePromptField = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index))
    }
  }

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts]
    newPrompts[index] = value
    setPrompts(newPrompts)
  }

  const handleGenerateDrafts = async () => {
    let finalPrompts: string[] = []
    
    if (inputMode === 'text') {
      finalPrompts = prompts.filter(p => p.trim().length > 0)
    } else if (inputMode === 'file' && uploadedData) {
      // For batch processing, convert each row of the file to a separate prompt
      finalPrompts = uploadedData.data.map((row, index) => {
        return convertFileDataToPrompt({
          ...uploadedData,
          data: [row] // Convert each row individually
        })
      }).filter(prompt => prompt.trim().length > 0)
    }
    
    if (finalPrompts.length === 0) {
      return
    }

    try {
      if (finalPrompts.length === 1) {
        // Single invoice generation
        console.log('About to send single request with context:', context)
        const requestData = {
          prompt: finalPrompts[0].trim(),
          documentType: 'invoice' as const,
          userContext: context ? {
            companyName: context.companyName,
            companyAddress: context.companyAddress,
            companyEmail: context.companyEmail,
            companyPhone: context.companyPhone,
            defaultCurrency: context.defaultCurrency,
            defaultTaxRate: context.defaultTaxRate,
            defaultTerms: context.defaultTerms,
            jurisdiction: context.jurisdiction
          } : undefined
        }
        console.log('Single request data:', requestData)
        
        const result = await generateMutation.mutateAsync(requestData)
        
        if (result.success) {
          setGeneratedInvoices([result.document])
          setShowForms(true)
        }
      } else {
        // Batch invoice generation
        console.log('About to send batch request with context:', context)
        const requestData = {
          prompts: finalPrompts,
          documentType: 'invoice' as const,
          userContext: context ? {
            companyName: context.companyName,
            companyAddress: context.companyAddress,
            companyEmail: context.companyEmail,
            companyPhone: context.companyPhone,
            defaultCurrency: context.defaultCurrency,
            defaultTaxRate: context.defaultTaxRate,
            defaultTerms: context.defaultTerms,
            jurisdiction: context.jurisdiction
          } : undefined
        }
        console.log('Batch request data:', requestData)
        
        const result = await generateBatchMutation.mutateAsync(requestData)
        
        if (result.success) {
          setGeneratedInvoices(result.documents)
          setShowForms(true)
        }
      }
    } catch (error) {
      console.error('Failed to generate invoices:', error)
    }
  }

  const canGenerate = inputMode === 'text' ? 
    prompts.some(p => p.trim().length > 0) : 
    uploadedData !== null
  const isLoading = generateMutation.isPending || generateBatchMutation.isPending

  const handleDownloadAll = async () => {
    setIsDownloading(true)
    try {
      // Download all invoices as separate PDFs with progress
      for (let i = 0; i < generatedInvoices.length; i++) {
        const invoice = generatedInvoices[i]
        const generator = new InvoicePDFGenerator()
        generator.downloadPDF(invoice, `invoice-${invoice.invoiceNumber}.pdf`)
        
        // Small delay to prevent browser blocking and show progress
        if (i < generatedInvoices.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const handleEditInvoice = (index: number) => {
    setEditingIndex(index)
  }

  const handleSaveInvoice = (index: number, updatedInvoice: Invoice) => {
    const newInvoices = [...generatedInvoices]
    newInvoices[index] = updatedInvoice
    setGeneratedInvoices(newInvoices)
    setEditingIndex(null)
  }

  if (showForms && generatedInvoices.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Generated Invoices ({generatedInvoices.length})
                </h1>
                <p className="text-gray-600 mt-1">Review and edit your invoices before downloading</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Downloading...
                    </div>
                  ) : (
                    `Download All PDFs (${generatedInvoices.length})`
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowForms(false)
                    setGeneratedInvoices([])
                    setPrompts([''])
                    setInputMode('text')
                    setUploadedData(null)
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {generatedInvoices.map((invoice, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Invoice #{invoice.invoiceNumber} - {invoice.to.name}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditInvoice(index)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {editingIndex === index ? 'Editing...' : 'Edit'}
                    </button>
                    <button
                      onClick={() => {
                        const generator = new InvoicePDFGenerator()
                        generator.downloadPDF(invoice)
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <div className={`${editingIndex === index ? 'border-2 border-blue-300 bg-blue-50/50 p-4 rounded-lg' : ''}`}>
                  <InvoiceDisplay
                    invoice={invoice}
                    isEditable={editingIndex === index}
                    onSave={(updatedInvoice: Invoice) => handleSaveInvoice(index, updatedInvoice)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Batch Invoice Generator
              </h1>
              <p className="text-gray-600 mt-2">Create multiple invoices at once with AI-powered generation or upload a file</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Company Settings
            </button>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('text')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    inputMode === 'text'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">✏️</span>
                  Type Multiple Requests
                </button>
                <button
                  onClick={() => setInputMode('file')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    inputMode === 'file'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">📄</span>
                  Upload Batch File
                </button>
              </div>
            </div>
          </div>

          {inputMode === 'text' ? (
            /* Text Input Mode */
            <div>
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Requests (one per field)
                </label>
            
            {prompts.map((prompt, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => updatePrompt(index, e.target.value)}
                    placeholder={`Invoice request ${index + 1} (e.g., "Invoice ACME Corp $2500 for website development, due in 30 days")`}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {index === prompts.length - 1 && (
                    <button
                      onClick={addPromptField}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Add another invoice"
                    >
                      +
                    </button>
                  )}
                  {prompts.length > 1 && (
                    <button
                      onClick={() => removePromptField(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      title="Remove this invoice"
                    >
                      −
                    </button>
                  )}
                </div>
              </div>
            ))}
              </div>
            </div>
          ) : (
            /* File Upload Mode */
            <div>
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Batch Invoice Data
                </label>
                <FileUpload
                  onFileProcessed={handleFileProcessed}
                  onError={handleFileError}
                />
                {uploadedData && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-green-800 font-medium">
                        File uploaded: {uploadedData.fileName} ({uploadedData.data.length} rows)
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      Each row will generate a separate invoice
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {inputMode === 'text' ? 
                `${prompts.filter(p => p.trim().length > 0).length} invoice(s) ready to generate` :
                uploadedData ? `${uploadedData.data.length} invoice(s) ready to generate from file` : '0 invoices ready'
              }
            </div>
            <button
              onClick={handleGenerateDrafts}
              disabled={!canGenerate || isLoading}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                canGenerate && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                `Generate ${
                  inputMode === 'text' 
                    ? (prompts.filter(p => p.trim().length > 0).length > 1 ? 'Batch' : 'Draft')
                    : (uploadedData && uploadedData.data.length > 1 ? 'Batch' : 'Draft')
                }`
              )}
            </button>
          </div>

          {(generateMutation.error || generateBatchMutation.error) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error generating invoices:</p>
              <p className="text-red-600 text-sm mt-1">
                {generateMutation.error?.message || generateBatchMutation.error?.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <CompanySettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
