import { useMutation } from '@tanstack/react-query'
import { DocumentType, UserContext, type EnhancedDocumentResponse } from '../../packages/core'

interface EnhancedGenerateRequest {
  prompt: string
  documentType: DocumentType
  userContext?: UserContext
  useEnhancedPrompts?: boolean
}

interface EnhancedGenerateResponse {
  success: boolean
  document: any
  content?: any
  formatted_document?: string
  assumptions?: string[]
  enhanced: boolean
  fallback_reason?: string
  error?: string
  details?: any
}

async function generateEnhancedDocument(request: EnhancedGenerateRequest): Promise<EnhancedGenerateResponse> {
  const response = await fetch('/api/generate-enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      useEnhancedPrompts: true,
      ...request
    }),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('Enhanced API Error:', errorData)
    throw new Error(errorData.error || 'Failed to generate enhanced document')
  }

  return response.json()
}

export function useGenerateEnhancedDocument() {
  return useMutation({
    mutationFn: generateEnhancedDocument,
    onError: (error) => {
      console.error('Enhanced generation failed:', error)
    },
  })
}
