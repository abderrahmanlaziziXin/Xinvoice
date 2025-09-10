'use client'

import { useState, useEffect, useCallback } from 'react'
import { XMarkIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { generateNDAPDF, NDAFormData, NDATemplate } from '../lib/nda-pdf-generator'

interface NDAPDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  ndaData: NDAFormData
}

export function NDAPDFPreviewModal({ isOpen, onClose, ndaData }: NDAPDFPreviewModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NDATemplate>('legal')
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePreview = useCallback(async () => {
    setIsGenerating(true)
    try {
      const generator = generateNDAPDF(ndaData, selectedTemplate)
      const doc = generator.generate()
      const blob = doc.output('blob')
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      console.error('Error generating PDF preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [ndaData, selectedTemplate, pdfUrl])

  useEffect(() => {
    if (isOpen) {
      generatePreview()
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, generatePreview, pdfUrl])

  const downloadPDF = () => {
    const generator = generateNDAPDF(ndaData, selectedTemplate)
    generator.download()
  }

  const templates: { value: NDATemplate; label: string; description: string }[] = [
    { value: 'legal', label: 'Legal', description: 'Traditional legal document format' },
    { value: 'modern', label: 'Modern', description: 'Clean, professional layout' },
    { value: 'minimal', label: 'Minimal', description: 'Simple, minimalist design' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">NDA Preview</h3>
              <p className="text-sm text-gray-600">Review your NDA before downloading</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 p-6 bg-gray-50 overflow-y-auto">
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Template Style</h4>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <motion.button
                        key={template.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template.value)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedTemplate === template.value
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {template.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Document Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span> Non-Disclosure Agreement
                    </div>
                    <div>
                      <span className="text-gray-600">Disclosing Party:</span> {ndaData.disclosingParty?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-600">Receiving Party:</span> {ndaData.receivingParty?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-600">Effective Date:</span>{' '}
                      {ndaData.effectiveDate ? new Date(ndaData.effectiveDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-600">Governing Law:</span> {ndaData.governingLaw || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadPDF}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Download PDF
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generatePreview}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <EyeIcon className="w-5 h-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Refresh Preview'}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="flex-1 p-6">
              <div className="h-full border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                {isGenerating ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Generating PDF preview...</p>
                    </div>
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="NDA Preview"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>No preview available</p>
                      <button
                        onClick={generatePreview}
                        className="mt-2 text-purple-600 hover:text-purple-700 underline"
                      >
                        Generate Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
