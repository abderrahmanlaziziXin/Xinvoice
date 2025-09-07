import { useMutation } from '@tanstack/react-query'
import { Invoice, DocumentType, UserContext } from '../../packages/core'

interface GenerateBatchDocumentRequest {
  prompts: string[]
  documentType: DocumentType
  userContext?: UserContext
}

interface GenerateBatchDocumentResponse {
  success: boolean
  documents: Invoice[]
  count: number
  error?: string
  details?: any
}

async function generateBatchDocuments(request: GenerateBatchDocumentRequest): Promise<GenerateBatchDocumentResponse> {
  const response = await fetch('/api/generate-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    console.error('Batch API Error:', errorData)
    throw new Error(errorData.error || 'Failed to generate documents')
  }

  return response.json()
}

export function useGenerateBatchDocuments() {
  return useMutation({
    mutationFn: generateBatchDocuments,
    onError: (error) => {
      console.error('Batch generation failed:', error)
    },
  })
}
