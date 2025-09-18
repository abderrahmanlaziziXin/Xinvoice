import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createLLMProvider,
  DocumentTypeSchema,
  LocaleSchema,
  UserContextSchema,
  type DocumentType,
  type Locale,
} from '../../../packages/core'
import { getDirection } from '../../lib/i18n'
import { translations } from '../../lib/i18n/translations'

const MultilingualBatchSchema = z.object({
  prompts: z.array(z.string().min(1, 'Each prompt is required')).min(1, 'At least one prompt is required'),
  documentType: DocumentTypeSchema,
  locale: LocaleSchema,
  userContext: UserContextSchema.optional(),
  includeTranslations: z.boolean().optional(),
  culturalContext: z.boolean().optional(),
})

function getLocaleLabel(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'en-CA': 'English (Canada)',
    'en-AU': 'English (Australia)',
    'fr-FR': 'Fran�ais (France)',
    'fr-CA': 'Fran�ais (Canada)',
    'de-DE': 'Deutsch (Deutschland)',
    'es-ES': 'Espa�ol (Espa�a)',
    'it-IT': 'Italiano (Italia)',
    'pt-BR': 'Portugu�s (Brasil)',
    'pt-PT': 'Portugu�s (Portugal)',
    'nl-NL': 'Nederlands',
    'sv-SE': 'Svenska',
    'no-NO': 'Norsk',
    'da-DK': 'Dansk',
    'fi-FI': 'Suomi',
    'pl-PL': 'Polski',
    'cs-CZ': 'Ce�tina',
    'hu-HU': 'Magyar',
    'ru-RU': '??????? (??????)',
    'zh-CN': '?? (??)',
    'ja-JP': '???',
    'ko-KR': '???',
    'ar-SA': '??????? (????????)',
    'ar-AE': '??????? (????????)',
    'ar-EG': '??????? (???)',
    'ar-DZ': '??????? (???????)',
    'ar-MA': '??????? (??????)',
    'ar-TN': '??????? (????)',
    'hi-IN': '?????? (????)',
    'th-TH': '???',
    'vi-VN': 'Ti?ng Vi?t',
  }

  return localeMap[locale] ?? locale
}

interface BatchDocumentResult {
  status: 'success' | 'failed'
  document?: any
  formatted_document?: string
  assumptions?: string[]
  error?: string
}

async function generateSingle(
  provider: ReturnType<typeof createLLMProvider>,
  prompt: string,
  documentType: DocumentType,
  locale: Locale,
  label: string,
  userContext: any,
  includeTranslations?: boolean,
  culturalContext?: boolean,
): Promise<BatchDocumentResult> {
  try {
    const options = {
      documentType,
      locale,
      userContext,
      includeTranslations,
      culturalContext,
    }

    let aiResponse: any

    if (provider.generateMultilingualDocument) {
      aiResponse = await provider.generateMultilingualDocument(prompt, options, userContext)
    } else {
      const fallbackPrompt = `${prompt}\n\nPlease answer in ${label} (${locale}) and ensure the content follows local business expectations.`
      aiResponse = provider.generateEnhancedDocument
        ? await provider.generateEnhancedDocument(fallbackPrompt, documentType, userContext)
        : await provider.generateDocument(fallbackPrompt, documentType, userContext)
    }

    const document = aiResponse?.document ?? aiResponse?.content ?? aiResponse
    const formatted_document = aiResponse?.formatted_document ?? JSON.stringify(document, null, 2)
    const assumptions = aiResponse?.assumptions ?? []

    return {
      status: 'success',
      document,
      formatted_document,
      assumptions,
    }
  } catch (error) {
    console.error('Multilingual batch item failed:', error)
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { prompts, documentType, locale, userContext, includeTranslations, culturalContext } = MultilingualBatchSchema.parse(json)

    const llmProvider = process.env.LLM_PROVIDER as 'openai' | 'gemini'
    const apiKey = llmProvider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY

    if (!llmProvider) {
      return NextResponse.json({ error: 'LLM_PROVIDER environment variable is required' }, { status: 500 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: `${llmProvider.toUpperCase()}_API_KEY environment variable is required` }, { status: 500 })
    }

    const provider = createLLMProvider(llmProvider, apiKey)

    const label = getLocaleLabel(locale)
    const direction = getDirection(locale)
    const translationEntry = translations[locale as keyof typeof translations]?.common
    const labels = includeTranslations && translationEntry ? { ...translationEntry } : {}

    const results: BatchDocumentResult[] = []

    if (provider.generateMultilingualBatchDocuments) {
      try {
        const options = {
          documentType,
          locale,
          userContext,
          includeTranslations,
          culturalContext,
        }
        const aiResponses = await provider.generateMultilingualBatchDocuments(prompts, options, userContext)

        for (const response of aiResponses) {
          const document = response?.document ?? response?.content ?? response
          results.push({
            status: 'success',
            document,
            formatted_document: response?.formatted_document ?? JSON.stringify(document, null, 2),
            assumptions: response?.assumptions ?? [],
          })
        }
      } catch (error) {
        console.warn('Multilingual batch request failed, falling back to sequential generation:', error)
        for (const prompt of prompts) {
          results.push(await generateSingle(provider, prompt, documentType, locale, label, userContext, includeTranslations, culturalContext))
        }
      }
    } else {
      for (const prompt of prompts) {
        results.push(await generateSingle(provider, prompt, documentType, locale, label, userContext, includeTranslations, culturalContext))
      }
    }

    const documents = results.map((result, index) => ({
      id: index + 1,
      document: result.document ?? null,
      localization: {
        locale,
        language: label,
        direction,
        labels,
      },
      formatted_document: result.formatted_document ?? '',
      assumptions: result.assumptions ?? [],
      status: result.status,
      error: result.error,
    }))

    const successCount = results.filter((r) => r.status === 'success').length

    const responsePayload = {
      success: successCount === prompts.length,
      batch_id: `batch_${Date.now()}`,
      documents,
      batch_stats: {
        total_requested: prompts.length,
        total_generated: successCount,
        success_rate: Number((successCount / prompts.length).toFixed(2)),
        locale,
        language: label,
      },
      metadata: {
        generated_at: new Date().toISOString(),
        document_type: documentType,
        prompt_language: locale,
        ai_model: llmProvider,
        version: 'v1',
        batch_size: prompts.length,
      },
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Multilingual batch generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to generate multilingual batch documents', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
