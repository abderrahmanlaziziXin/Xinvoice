import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createLLMProvider, DocumentTypeSchema, DocumentSchema, UserContextSchema } from '../../../packages/core'

// Helper function to clean up empty email fields
function cleanEmptyEmails(data: any): any {
  if (typeof data !== 'object' || data === null) return data
  
  const cleaned = { ...data }
  
  // Clean invoice emails
  if (cleaned.type === 'invoice') {
    if (cleaned.from?.email === '') {
      delete cleaned.from.email
    }
    if (cleaned.to?.email === '') {
      delete cleaned.to.email
    }
  }
  
  return cleaned
}

const GenerateBatchRequestSchema = z.object({
  prompts: z.array(z.string().min(1, 'Each prompt is required')).min(1, 'At least one prompt is required'),
  documentType: DocumentTypeSchema,
  userContext: UserContextSchema.optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Batch API received body:', body)
    
    try {
      const { prompts, documentType, userContext } = GenerateBatchRequestSchema.parse(body)
      console.log('Batch parsed data:', { prompts, documentType, userContext })
    } catch (parseError) {
      console.error('Batch schema validation error:', parseError)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseError },
        { status: 400 }
      )
    }
    
    const { prompts, documentType, userContext } = GenerateBatchRequestSchema.parse(body)

    // Get environment variables
    const llmProvider = process.env.LLM_PROVIDER as 'openai' | 'gemini'
    const apiKey = llmProvider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : process.env.GEMINI_API_KEY

    if (!llmProvider) {
      return NextResponse.json(
        { error: 'LLM_PROVIDER environment variable is required' },
        { status: 500 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `${llmProvider.toUpperCase()}_API_KEY environment variable is required` },
        { status: 500 }
      )
    }

    // Create provider and generate documents
    const provider = createLLMProvider(llmProvider, apiKey)
    
    // Check if batch generation is supported
    if (!provider.generateBatchDocuments) {
      return NextResponse.json(
        { error: 'Batch generation not supported by this provider' },
        { status: 400 }
      )
    }

    const documentsData = await provider.generateBatchDocuments(prompts, documentType, userContext)

    // Clean up empty email fields and validate each document
    const validatedDocuments = documentsData.map((doc, index) => {
      try {
        const cleanedDocument = cleanEmptyEmails(doc)
        return DocumentSchema.parse(cleanedDocument)
      } catch (validationError) {
        console.error(`Validation error for document ${index + 1}:`, validationError)
        throw new Error(`Validation failed for document ${index + 1}: ${validationError}`)
      }
    })

    return NextResponse.json({
      success: true,
      documents: validatedDocuments,
      count: validatedDocuments.length
    })

  } catch (error) {
    console.error('Batch generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
