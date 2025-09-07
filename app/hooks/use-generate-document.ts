import { useMutation } from '@tanstack/react-query'
import { Invoice, DocumentType, UserContext } from '../../packages/core'

interface GenerateDocumentRequest {
  prompt: string
  documentType: DocumentType
  userContext?: UserContext
}

interface GenerateDocumentResponse {
  success: boolean
  document: Invoice
  error?: string
  details?: any
}

async function generateDocument(request: GenerateDocumentRequest): Promise<GenerateDocumentResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('API Error:', errorData)
    throw new Error(errorData.error || 'Failed to generate document')
  }

  return response.json()
}

export function useGenerateDocument() {
  return useMutation({
    mutationFn: generateDocument,
    onError: (error) => {
      console.error('Generation failed:', error)
    },
  })
}
