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

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  documentType: DocumentTypeSchema,
  userContext: UserContextSchema.optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API received body:', body)
    
    try {
      const { prompt, documentType, userContext } = GenerateRequestSchema.parse(body)
      console.log('Parsed data:', { prompt, documentType, userContext })
    } catch (parseError) {
      console.error('Schema validation error:', parseError)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseError },
        { status: 400 }
      )
    }
    
    const { prompt, documentType, userContext } = GenerateRequestSchema.parse(body)

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

    // Create provider and generate document
    const provider = createLLMProvider(llmProvider, apiKey)
    const documentData = await provider.generateDocument(prompt, documentType, userContext)

    // Clean up empty email fields before validation
    const cleanedDocument = cleanEmptyEmails(documentData)

    // Validate the generated document
    const validatedDocument = DocumentSchema.parse(cleanedDocument)

    return NextResponse.json({
      success: true,
      document: validatedDocument
    })

  } catch (error) {
    console.error('Generation error:', error)
    
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
        error: 'Failed to generate document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
