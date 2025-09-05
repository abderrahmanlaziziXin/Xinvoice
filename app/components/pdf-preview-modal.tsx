'use client'

import { useState, useEffect } from 'react'
import { Invoice } from '../../packages/core'
import { InvoicePDFGenerator, previewInvoicePDF } from '../lib/pdf-generator'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice
  onDownload: () => void
}

interface PDFOptions {
  template: 'modern' | 'classic' | 'minimal'
  includeWatermark: boolean
  accentColor: string
}

export function PDFPreviewModal({ isOpen, onClose, invoice, onDownload }: PDFPreviewModalProps) {
  const [pdfOptions, setPDFOptions] = useState<PDFOptions>({
    template: 'modern',
    includeWatermark: false,
    accentColor: '#2563eb'
  })
  const [pdfDataUri, setPdfDataUri] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePreview = async () => {
    setIsGenerating(true)
    try {
      const dataUri = previewInvoicePDF(invoice, {
        customTemplate: pdfOptions.template,
        includeWatermark: pdfOptions.includeWatermark,
        accentColor: pdfOptions.accentColor
      })
      setPdfDataUri(dataUri)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadWithOptions = () => {
    const generator = new InvoicePDFGenerator({
      customTemplate: pdfOptions.template,
      includeWatermark: pdfOptions.includeWatermark,
      accentColor: pdfOptions.accentColor
    })
    generator.downloadPDF(invoice)
    onDownload()
  }

  // Generate preview when modal opens or options change
  useEffect(() => {
    if (isOpen) {
      generatePreview()
    }
  }, [isOpen, pdfOptions])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">PDF Preview</h2>
              <p className="text-blue-100 mt-1">Invoice #{invoice.invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Options Panel */}
          <div className="lg:w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PDF Options</h3>
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Style
              </label>
              <div className="space-y-2">
                {[
                  { value: 'modern', label: 'Modern', desc: 'Clean design with accent colors' },
                  { value: 'classic', label: 'Classic', desc: 'Traditional business format' },
                  { value: 'minimal', label: 'Minimal', desc: 'Simple and clean layout' }
                ].map((template) => (
                  <label key={template.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      checked={pdfOptions.template === template.value}
                      onChange={(e) => setPDFOptions({ ...pdfOptions, template: e.target.value as any })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{template.label}</div>
                      <div className="text-xs text-gray-500">{template.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex space-x-2">
                {[
                  '#2563eb', '#7c3aed', '#dc2626', '#059669', '#d97706', '#1f2937'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPDFOptions({ ...pdfOptions, accentColor: color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      pdfOptions.accentColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={pdfOptions.accentColor}
                onChange={(e) => setPDFOptions({ ...pdfOptions, accentColor: e.target.value })}
                className="mt-2 w-full h-8 rounded border border-gray-300"
              />
            </div>

            {/* Options */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeWatermark}
                  onChange={(e) => setPDFOptions({ ...pdfOptions, includeWatermark: e.target.checked })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include "DRAFT" watermark</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadWithOptions}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Download PDF
              </button>
              
              <button
                onClick={generatePreview}
                disabled={isGenerating}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Refresh Preview'}
              </button>
            </div>

            {/* Invoice Summary */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">Invoice Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Client: {invoice.to.name}</div>
                <div>Amount: ${invoice.total.toFixed(2)}</div>
                <div>Items: {invoice.items.length}</div>
                <div>Due: {invoice.dueDate}</div>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="flex-1 bg-gray-100 p-6 overflow-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating PDF preview...</p>
                </div>
              </div>
            ) : pdfDataUri ? (
              <div className="h-full">
                <iframe
                  src={pdfDataUri}
                  className="w-full h-full border-2 border-gray-300 rounded-lg shadow-lg"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Click "Refresh Preview" to generate PDF</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFPreviewModal
