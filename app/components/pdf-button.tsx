'use client'

import { useState } from 'react'
import { Invoice } from '../../packages/core'
import { InvoicePDFGenerator } from '../lib/pdf-generator'
import { PDFPreviewModal } from './pdf-preview-modal'

interface PDFButtonProps {
  invoice: Invoice
  variant?: 'download' | 'preview' | 'both'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PDFButton({ 
  invoice, 
  variant = 'both', 
  size = 'md',
  className = '' 
}: PDFButtonProps) {
  const [showPreview, setShowPreview] = useState(false)
  
  const handleDownload = () => {
    const generator = new InvoicePDFGenerator()
    generator.downloadPDF(invoice)
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const baseClasses = `${sizeClasses[size]} font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`

  if (variant === 'download') {
    return (
      <button
        onClick={handleDownload}
        className={`${baseClasses} bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`}
      >
        Download PDF
      </button>
    )
  }

  if (variant === 'preview') {
    return (
      <>
        <button
          onClick={() => setShowPreview(true)}
          className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
        >
          Preview PDF
        </button>
        
        <PDFPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          invoice={invoice}
          onDownload={() => setShowPreview(false)}
        />
      </>
    )
  }

  // Both buttons
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowPreview(true)}
        className={`${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`}
      >
        Preview
      </button>
      
      <button
        onClick={handleDownload}
        className={`${baseClasses} bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500`}
      >
        Download
      </button>
      
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        invoice={invoice}
        onDownload={() => setShowPreview(false)}
      />
    </div>
  )
}

export default PDFButton
