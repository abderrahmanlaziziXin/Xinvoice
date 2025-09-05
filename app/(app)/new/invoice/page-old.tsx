'use client'

import { useState } from 'react'
import { useGenerateDocument } from '../../../hooks/use-generate-document'
import InvoiceForm from '../../../components/invoice-form'
import { CompanySettings } from '../../../components/company-settings'
import { useUserContext } from '../../../lib/user-context'
import { Invoice } from '../../../../packages/core'

export default function NewInvoicePage() {
  const [prompt, setPrompt] = useState('')
  const [generatedInvoice, setGeneratedInvoice] = useState<Partial<Invoice> | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { context } = useUserContext()

  const generateMutation = useGenerateDocument()

  // Debug: Log the current state
  console.log('Debug - prompt:', JSON.stringify(prompt))
  console.log('Debug - prompt.trim():', JSON.stringify(prompt.trim()))
  console.log('Debug - !prompt.trim():', !prompt.trim())
  console.log('Debug - generateMutation.isPending:', generateMutation.isPending)
  console.log('Debug - button should be disabled:', !prompt.trim() || generateMutation.isPending)

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return

    try {
      const result = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        documentType: 'invoice',
        userContext: context || undefined
      })
      
      console.log('AI Generation Result:', result) // Debug log
      
      if (result.success) {
        console.log('Generated invoice data:', result.document) // Debug log
        setGeneratedInvoice(result.document)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error)
    }
  }

  const handleSaveInvoice = (invoiceData: Invoice) => {
    console.log('Saving invoice:', invoiceData)
    // For now, just log the data. In future steps, we'll add PDF generation
    alert('Invoice saved! (PDF generation coming in Step 02)')
  }

  const handleStartOver = () => {
    setPrompt('')
    setGeneratedInvoice(null)
    setShowForm(false)
    generateMutation.reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Invoice
              </h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none"
                >
                  ⚙️ Company Settings
                </button>
                {showForm && (
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    ← Start Over
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showForm ? (
              // Prompt Input Section
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Describe your invoice
                  </h2>
                  <p className="text-gray-600">
                    Tell us about the work you did and we'll generate a professional invoice draft for you.
                  </p>
                </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Details
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => {
                          console.log('Textarea onChange fired, new value:', e.target.value)
                          setPrompt(e.target.value)
                          console.log('After setState, prompt should be:', e.target.value)
                        }}
                        onInput={(e) => {
                          console.log('Textarea onInput fired:', (e.target as HTMLTextAreaElement).value)
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        rows={6}
                        placeholder="Example: Invoice ACME Corp $1500 for web design services, due in 14 days. Include logo design and responsive layout."
                        disabled={generateMutation.isPending}
                      />
                      <div className="mt-1 text-sm text-gray-500">
                        {prompt.trim().length === 0 ? (
                          "Enter some details about your invoice to get started"
                        ) : (
                          `${prompt.trim().length} characters - Ready to generate!`
                        )}
                      </div>
                      
                      {/* Backup input for testing */}
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <label className="block text-xs text-yellow-800 mb-1">Backup Input (for testing):</label>
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => {
                            console.log('Backup input onChange:', e.target.value)
                            setPrompt(e.target.value)
                          }}
                          className="w-full px-2 py-1 border border-yellow-300 rounded text-sm"
                          placeholder="Type here to test..."
                        />
                      </div>
                    </div>

                    {generateMutation.error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">
                          <strong>Error:</strong> {generateMutation.error.message}
                        </p>
                      </div>
                    )}

                    {/* Debug section - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div>Debug: prompt length = {prompt.length}</div>
                        <div>Debug: prompt.trim() length = {prompt.trim().length}</div>
                        <div>Debug: isPending = {String(generateMutation.isPending)}</div>
                        <div>Debug: button disabled = {String(!prompt.trim() || generateMutation.isPending)}</div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={handleGenerateDraft}
                        disabled={prompt.trim().length === 0 || generateMutation.isPending}
                        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        type="button"
                      >
                        {generateMutation.isPending ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Draft...
                          </span>
                        ) : (
                          'Generate Draft'
                        )}
                      </button>
                    </div>
                    
                    {/* Test button for debugging */}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => {
                          console.log('Test button clicked')
                          console.log('Current prompt:', JSON.stringify(prompt))
                          console.log('Prompt length:', prompt.length)
                          console.log('Trimmed length:', prompt.trim().length)
                          if (prompt.trim()) {
                            handleGenerateDraft()
                          } else {
                            alert('Please enter some text first!')
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                        type="button"
                      >
                        Test Generate (Always Enabled)
                      </button>
                    </div>
                  </div>

                {/* Sample Prompts */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Sample Prompts (works with any language & typos):
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>• "Invoice ACME Corp $2500 for website development, due in 30 days"</div>
                    <div>• "Bill John Smith $150/hour for 8 hours of consulting, due next Friday"</div>
                    <div>• "invoice acme corp 1500 dolars for web desing" (works with typos!)</div>
                    <div>• "Facture ACME Corp 1500€ pour développement web" (French)</div>
                    <div>• "Factura ACME Corp $1500 para diseño web" (Spanish)</div>
                    <div>• "Bill fifteen hundred dollars for logo design work"</div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    ✨ The AI understands multiple languages, handles typos, and interprets natural language!
                  </div>
                </div>
              </div>
            ) : (
              // Invoice Form Section
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Edit Invoice Details
                  </h2>
                  <p className="text-gray-600">
                    Review and modify the generated invoice. Amounts are calculated automatically.
                  </p>
                </div>

                <InvoiceForm
                  initialData={generatedInvoice || undefined}
                  onSubmit={handleSaveInvoice}
                  isSubmitting={false}
                />
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && generatedInvoice && (
                  <details className="mt-4 p-4 bg-gray-100 rounded">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      Debug: Generated Data
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                      {JSON.stringify(generatedInvoice, null, 2)}
                    </pre>
                  </details>
                )}
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
