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
  console.log('Sending enhanced request:', request)
  
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

  console.log('Enhanced response status:', response.status)
  
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
    onSuccess: (response) => {
      console.log('Enhanced generation successful:', {
        enhanced: response.enhanced,
        hasContent: !!response.content,
        hasFormattedDoc: !!response.formatted_document,
        assumptions: response.assumptions?.length || 0
      })
    },
    onError: (error) => {
      console.error('Enhanced generation failed:', error)
    },
  })
}
