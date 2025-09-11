/**
 * React hooks for multilingual document generation
 */

import { useMutation } from '@tanstack/react-query'
import { DocumentType, UserContext, Locale } from '../../packages/core'

interface MultilingualDocumentRequest {
  prompt: string
  documentType: DocumentType
  locale: Locale
  userContext?: UserContext
  includeTranslations?: boolean
  culturalContext?: boolean
}

interface MultilingualBatchDocumentRequest {
  prompts: string[]
  documentType: DocumentType
  locale: Locale
  userContext?: UserContext
  includeTranslations?: boolean
  culturalContext?: boolean
}

interface MultilingualDocumentResponse {
  success: boolean
  document: any
  localization: {
    locale: string
    language: string
    direction: 'ltr' | 'rtl'
    labels: Record<string, string>
  }
  formatted_document: string
  assumptions: string[]
  metadata: {
    generated_at: string
    document_type: string
    prompt_language: string
    ai_model: string
    version: string
  }
}

interface MultilingualBatchDocumentResponse {
  success: boolean
  batch_id: string
  documents: Array<{
    id: number
    document: any
    localization: {
      locale: string
      language: string
      direction: 'ltr' | 'rtl'
      labels: Record<string, string>
    }
    formatted_document: string
    assumptions: string[]
    status: string
  }>
  batch_stats: {
    total_requested: number
    total_generated: number
    success_rate: number
    locale: string
    language: string
  }
  metadata: {
    generated_at: string
    document_type: string
    prompt_language: string
    ai_model: string
    version: string
    batch_size: number
  }
}

/**
 * Hook for generating single multilingual documents
 */
export function useGenerateMultilingualDocument() {
  return useMutation<MultilingualDocumentResponse, Error, MultilingualDocumentRequest>({
    mutationFn: async (request) => {
      const response = await fetch('/api/generate-multilingual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    onError: (error) => {
      console.error('Multilingual document generation failed:', error)
    },
  })
}

/**
 * Hook for generating batch multilingual documents
 */
export function useGenerateMultilingualBatchDocuments() {
  return useMutation<MultilingualBatchDocumentResponse, Error, MultilingualBatchDocumentRequest>({
    mutationFn: async (request) => {
      const response = await fetch('/api/generate-multilingual-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    onError: (error) => {
      console.error('Multilingual batch document generation failed:', error)
    },
  })
}

/**
 * Helper function to download multilingual document as PDF
 */
export async function downloadMultilingualDocumentAsPDF(
  document: any,
  localization: { locale: string; direction: 'ltr' | 'rtl' },
  documentType: DocumentType,
  filename?: string
) {
  try {
    // Log what we're working with
    console.log('=== PDF Generation Debug ===')
    console.log('Document:', document)
    console.log('Localization:', localization)
    console.log('Document Type:', documentType)
    
    // Dynamic import to reduce bundle size
    const { generateMultilingualInvoicePDF, generateMultilingualNDAPDF } = await import('../lib/i18n/multilingual-pdf-generator')

    let pdfData: Uint8Array

    if (documentType === 'invoice') {
      pdfData = generateMultilingualInvoicePDF(document, localization)
    } else if (documentType === 'nda') {
      pdfData = generateMultilingualNDAPDF(document, localization)
    } else {
      throw new Error(`Unsupported document type: ${documentType}`)
    }

    // Create the filename
    const finalFilename = filename || `${documentType}_${localization.locale}_${Date.now()}.pdf`
    
    // Create blob URL
    const blob = new Blob([new Uint8Array(pdfData)], { type: 'application/pdf' })
    const dataUrl = URL.createObjectURL(blob)
    
    // Try different download methods based on environment
    try {
      // Method 1: Direct download (most reliable)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = finalFilename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      console.log('PDF download initiated successfully')
    } catch (domError) {
      console.warn('DOM download failed, trying window.open:', domError)
      
      // Method 2: Open in new tab (fallback)
      try {
        const newWindow = window.open(dataUrl, '_blank')
        if (newWindow) {
          console.log('PDF opened in new tab')
        } else {
          throw new Error('Popup blocked')
        }
      } catch (windowError) {
        console.warn('Window.open failed, showing URL:', windowError)
        
        // Method 3: Show URL to user (last resort)
        alert(`PDF generated! Please copy this URL to view: ${dataUrl}`)
      }
    }
    
    // Clean up after a delay
    setTimeout(() => {
      try {
        URL.revokeObjectURL(dataUrl)
      } catch (e) {
        console.warn('Failed to revoke URL:', e)
      }
    }, 5000)
    
  } catch (error) {
    console.error('PDF download failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

/**
 * Helper function to download batch documents as ZIP
 */
export async function downloadMultilingualBatchDocumentsAsZIP(
  documents: Array<{
    id: number
    document: any
    localization: { locale: string; direction: 'ltr' | 'rtl' }
  }>,
  documentType: DocumentType,
  zipFilename?: string
) {
  try {
    // Note: This would require a ZIP library like JSZip
    // For now, we'll download individual PDFs
    for (const doc of documents) {
      await downloadMultilingualDocumentAsPDF(
        doc.document,
        doc.localization,
        documentType,
        `${documentType}_${doc.id}_${doc.localization.locale}.pdf`
      )
      
      // Add a small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (error) {
    console.error('Batch PDF download failed:', error)
    throw error
  }
}

const multilingualDocumentHooks = {
  useGenerateMultilingualDocument,
  useGenerateMultilingualBatchDocuments,
  downloadMultilingualDocumentAsPDF,
  downloadMultilingualBatchDocumentsAsZIP,
}

export default multilingualDocumentHooks
