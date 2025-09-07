/**
 * Enhanced Multilingual Document Generation API
 * Supports generating invoices and NDAs in multiple languages
 */

import { NextRequest, NextResponse } from 'next/server'
import { OpenAIProvider } from '../../../packages/core/llm-provider'
import { DocumentSchema, UserContextSchema, LocaleSchema, DocumentTypeSchema } from '../../../packages/core/schemas'
import { z } from 'zod'

// Enhanced multilingual request schema
const MultilingualGenerateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  documentType: DocumentTypeSchema,
  locale: LocaleSchema.default('en-US'),
  userContext: UserContextSchema.optional(),
  includeTranslations: z.boolean().default(true),
  culturalContext: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = MultilingualGenerateSchema.parse(body)
    const { prompt, documentType, locale, userContext, includeTranslations, culturalContext } = validatedData

    // Initialize OpenAI provider
    const provider = new OpenAIProvider(apiKey)

    // Generate multilingual document
    const options = {
      documentType,
      locale,
      includeTranslations,
      culturalContext,
    }

    const result = await provider.generateMultilingualDocument!(prompt, options, userContext)

    // Validate the generated document against our schema
    let validatedDocument
    try {
      if (documentType === 'invoice') {
        // Parse the content to create a proper invoice object
        const invoiceData = {
          type: 'invoice' as const,
          ...result.metadata,
          ...result.content,
          locale: result.metadata.locale,
          currency: result.metadata.currency,
        }
        validatedDocument = DocumentSchema.parse(invoiceData)
      } else if (documentType === 'nda') {
        // Parse the content to create a proper NDA object
        const ndaData = {
          type: 'nda' as const,
          ...result.metadata,
          ...result.content,
          locale: result.metadata.locale,
          currency: result.metadata.currency,
        }
        validatedDocument = DocumentSchema.parse(ndaData)
      }
    } catch (validationError) {
      console.warn('Document validation failed, returning raw result:', validationError)
      // If validation fails, return the raw result with additional metadata
      validatedDocument = result
    }

    // Return the complete multilingual response
    return NextResponse.json({
      success: true,
      document: validatedDocument,
      localization: {
        locale: result.metadata.locale,
        language: result.metadata.language,
        direction: result.metadata.direction,
        labels: result.localized_labels || {},
      },
      formatted_document: result.formatted_document,
      assumptions: result.assumptions || [],
      metadata: {
        generated_at: new Date().toISOString(),
        document_type: documentType,
        prompt_language: locale,
        ai_model: 'gpt-4o',
        version: '2.0.0'
      }
    })

  } catch (error) {
    console.error('Multilingual generation error:', error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI service error', message: error.message },
        { status: 503 }
      )
    }

    // Generic error handling
    return NextResponse.json(
      { 
        error: 'Document generation failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
