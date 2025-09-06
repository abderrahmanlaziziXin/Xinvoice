'use client'

import { useState } from 'react'
import { useGenerateDocument } from '../../../hooks/use-generate-document'
import InvoiceForm from '../../../components/invoice-form'
import { CompanySettings } from '../../../components/company-settings'
import { FileUpload } from '../../../components/file-upload'
import { useUserContext } from '../../../lib/user-context'
import { parseUploadedFile, convertFileDataToPrompt } from '../../../lib/file-parser'
import { Invoice } from '../../../../packages/core'

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

  const handleFileProcessed = (result: any) => {
    if (result.success) {
      setUploadedData(result)
      console.log('File processed:', result)
    } else {
      alert('Failed to parse file. Please check the format and try again.')
    }
  }

  const handleFileError = (error: string) => {
    console.error('File upload error:', error)
    alert('Error uploading file: ' + error)
  }

  const handleGenerateDraft = async () => {
    let finalPrompt = prompt.trim()
    
    // If we have uploaded data, convert it to a prompt
    if (inputMode === 'file' && uploadedData) {
      finalPrompt = convertFileDataToPrompt(uploadedData)
    }
    
    if (!finalPrompt) return

    try {
      console.log('About to send request with context:', context)
      const requestData = {
        prompt: finalPrompt,
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
      console.log('Request data:', requestData)
      
      const result = await generateMutation.mutateAsync(requestData)
      
      if (result.success) {
        setGeneratedInvoice(result.document)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      alert('Failed to generate invoice: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleSaveInvoice = (invoiceData: Invoice) => {
    console.log('Saving invoice:', invoiceData)
    alert('Invoice saved! (PDF generation coming in Step 02)')
  }

  const handleStartOver = () => {
    setPrompt('')
    setGeneratedInvoice(null)
    setShowForm(false)
    setInputMode('text')
    setUploadedData(null)
    generateMutation.reset()
  }

  const isButtonDisabled = inputMode === 'text' ? 
    !prompt.trim() || generateMutation.isPending :
    !uploadedData || generateMutation.isPending

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
                <p className="mt-1 text-sm text-gray-600">Generate professional invoices with AI assistance</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <span className="mr-2">⚙️</span>
                  Company Settings
                </button>
                {showForm && (
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    ← Start Over
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {!showForm ? (
              // Prompt Input Section
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Describe Your Invoice
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Tell us about the work you did or upload a file and we&apos;ll generate a professional invoice draft for you.
                  </p>
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
                        Type Description
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
                        Upload File
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {inputMode === 'text' ? (
                    /* Text Input Mode */
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Invoice Details
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 text-base transition-all resize-none"
                        rows={6}
                        placeholder="Example: Invoice ACME Corp $1500 for web design services, due in 14 days. Include logo design and responsive layout."
                        disabled={generateMutation.isPending}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {prompt.length} characters
                      </div>
                    </div>
                  ) : (
                    /* File Upload Mode */
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Upload Invoice Data
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
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status and Button */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-sm text-gray-500">
                      {inputMode === 'text' ? (
                        prompt.trim().length === 0 ? (
                          "Enter some details about your invoice to get started"
                        ) : (
                          <span className="text-green-600 font-medium">Ready to generate! ✨</span>
                        )
                      ) : (
                        !uploadedData ? (
                          "Upload a CSV or Excel file to get started"
                        ) : (
                          <span className="text-green-600 font-medium">File ready to process! ✨</span>
                        )
                      )}
                    </div>
                    
                    <button
                      onClick={handleGenerateDraft}
                      disabled={isButtonDisabled}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✨</span>
                          Generate Draft
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sample Prompts - Only show in text mode */}
                  {inputMode === 'text' && (
                    <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">💡</span>
                        Sample Prompts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-2">
                          <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all" 
                               onClick={() => handlePromptChange("Invoice ACME Corp $2500 for website development, due in 30 days")}>
                            &quot;Invoice ACME Corp $2500 for website development, due in 30 days&quot;
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
                               onClick={() => handlePromptChange("Bill John Smith $150/hour for 8 hours of consulting, due next Friday")}>
                            &quot;Bill John Smith $150/hour for 8 hours of consulting, due next Friday&quot;
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
                               onClick={() => handlePromptChange("Facture ACME Corp 1500€ pour développement web")}>
                            &quot;Facture ACME Corp 1500€ pour développement web&quot; (French)
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
                               onClick={() => handlePromptChange("invoice acme corp 1500 dolars for web desing")}>
                            &quot;invoice acme corp 1500 dolars for web desing&quot; (with typos!)
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-green-600 font-medium">
                        ✨ Click any example to try it, or write your own. AI understands multiple languages and handles typos!
                      </div>
                    </div>
                  )}

                  {/* File Upload Instructions - Only show in file mode */}
                  {inputMode === 'file' && (
                    <div className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📋</span>
                        Supported File Formats
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">CSV Files (.csv)</h4>
                          <ul className="space-y-1 text-gray-600">
                            <li>• Bank transaction exports</li>
                            <li>• Accounting system data</li>
                            <li>• Expense reports</li>
                            <li>• Time tracking exports</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Excel Files (.xlsx, .xls)</h4>
                          <ul className="space-y-1 text-gray-600">
                            <li>• Project cost breakdowns</li>
                            <li>• Client information lists</li>
                            <li>• Service rate tables</li>
                            <li>• Invoice templates</li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-blue-600 font-medium">
                        💡 Our AI can understand any format! Just upload your file and let the AI figure out what&apos;s what.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Form Editing Section
              <div>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-green-800 font-medium">
                      Invoice draft generated successfully! Review and edit the details below.
                    </span>
                  </div>
                </div>
                
                <InvoiceForm
                  initialData={generatedInvoice || undefined}
                  onSubmit={handleSaveInvoice}
                  isSubmitting={false}
                />
              </div>
            )}
          </div>
        </div>
        
        <CompanySettings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  )
}
