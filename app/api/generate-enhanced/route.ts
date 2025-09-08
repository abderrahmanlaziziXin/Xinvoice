import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createLLMProvider, 
  DocumentTypeSchema, 
  UserContextSchema,
  type EnhancedDocumentResponse 
} from '../../../packages/core'
import { type MultilingualPromptOptions } from '../../lib/i18n/multilingual-prompts'

const EnhancedGenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  documentType: DocumentTypeSchema,
  userContext: UserContextSchema.optional(),
  useEnhancedPrompts: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { prompt, documentType, userContext, useEnhancedPrompts } = EnhancedGenerateRequestSchema.parse(body)

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
    
    let documentResponse: any

    if (useEnhancedPrompts && provider.generateEnhancedDocument) {
      
      try {
        // Check if we have language instructions in the userContext
        const hasLanguageInstructions = userContext && (
          userContext.languageInstruction || 
          userContext.outputLanguage || 
          userContext.culturalContext
        )

        if (hasLanguageInstructions && provider.generateMultilingualDocument) {
          console.log('🌍 Using multilingual generation with language enforcement')
          
          // Use multilingual generation for better language control
          const multilingualOptions: MultilingualPromptOptions = {
            documentType,
            locale: userContext.outputLanguage || userContext.defaultLocale || 'en-US',
            userContext,
            includeTranslations: true,
            culturalContext: true
          }

          // Create enhanced prompt with strong language enforcement but preserve personal info
          const enhancedPrompt = `${userContext.languageInstruction || ''}\n\n${prompt}\n\nIMPORTANT INSTRUCTIONS:
1. Generate the entire response in ${userContext.outputLanguage || 'English'} language, regardless of the input language above.
2. PRESERVE PERSONAL INFORMATION: Keep all names, addresses, emails, phone numbers, and company names exactly as provided in the original text - do NOT translate personal information.
3. Translate only: labels, descriptions, terms, legal text, and general content.
4. Example: If input has "John Smith" and "TechCorp Inc.", keep them as "John Smith" and "TechCorp Inc." even in French output.`

          const multilingualResponse = await provider.generateMultilingualDocument(
            enhancedPrompt,
            multilingualOptions,
            userContext
          )
          
          return NextResponse.json({ 
            success: true, 
            document: multilingualResponse.metadata,
            content: multilingualResponse.content,
            formatted_document: multilingualResponse.formatted_document,
            localized_labels: multilingualResponse.localized_labels,
            assumptions: multilingualResponse.assumptions || [],
            enhanced: true,
            multilingual: true
          })
        } else {
          // Standard enhanced generation
          const enhancedResponse: EnhancedDocumentResponse = await provider.generateEnhancedDocument(
            prompt, 
            documentType, 
            userContext
          )
          
          return NextResponse.json({ 
            success: true, 
            document: enhancedResponse.metadata,
            content: enhancedResponse.content,
            formatted_document: enhancedResponse.formatted_document,
            assumptions: enhancedResponse.assumptions || [],
            enhanced: true
          })
        }
        
      } catch (enhancedError) {
        console.warn('Enhanced generation failed, falling back to standard:', enhancedError)
        
        // Fallback to standard generation
        const standardDocument = await provider.generateDocument(prompt, documentType, userContext)
        documentResponse = {
          success: true,
          document: standardDocument,
          enhanced: false,
          fallback_reason: enhancedError instanceof Error ? enhancedError.message : 'Unknown error'
        }
      }
    } else {
      const standardDocument = await provider.generateDocument(prompt, documentType, userContext)
      documentResponse = {
        success: true,
        document: standardDocument,
        enhanced: false
      }
    }

    return NextResponse.json(documentResponse)

  } catch (error) {
    console.error('Enhanced generation error:', error)
    
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
