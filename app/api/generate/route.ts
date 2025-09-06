import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createLLMProvider, DocumentTypeSchema, DocumentSchema, UserContextSchema, InvoiceSchema, NDASchema } from '../../../packages/core'

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

// Helper function to add default values for backward compatibility
// Helper function to add default values for backward compatibility
function addDefaultValues(data: any, userContext?: any, documentType?: string): any {
  if (typeof data !== 'object' || data === null) return data
  
  const enhanced = { ...data }
  
  // Add default currency and locale for invoices if missing
  if (documentType === 'invoice') {
    if (!enhanced.currency) {
      enhanced.currency = userContext?.defaultCurrency || 'USD'
    }
    if (!enhanced.locale) {
      enhanced.locale = userContext?.defaultLocale || 'en-US'
    }
  }
  
  return enhanced
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
    
    // Add default values for backward compatibility
    const enhancedDocument = addDefaultValues(cleanedDocument, userContext, documentType)

    console.log('Enhanced document before validation:', {
      type: enhancedDocument.type,
      currency: enhancedDocument.currency,
      locale: enhancedDocument.locale,
      hasFrom: !!enhancedDocument.from,
      hasTo: !!enhancedDocument.to,
      itemsCount: enhancedDocument.items?.length || 0
    })

    // Validate the generated document based on document type
    let validatedDocument
    if (documentType === 'invoice') {
      try {
        validatedDocument = InvoiceSchema.parse(enhancedDocument)
      } catch (validationError) {
        console.error('Invoice validation failed:', validationError)
        if (validationError instanceof z.ZodError) {
          // Log specific validation errors for debugging
          validationError.errors.forEach(err => {
            console.error('Validation error at path:', err.path, 'message:', err.message)
          })
        }
        throw validationError
      }
    } else {
      validatedDocument = NDASchema.parse(enhancedDocument)
    }

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
