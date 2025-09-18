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

const MultilingualGenerateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
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

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const { prompt, documentType, locale, userContext, includeTranslations, culturalContext } = MultilingualGenerateSchema.parse(json)

    const llmProvider = process.env.LLM_PROVIDER as 'openai' | 'gemini'
    const apiKey = llmProvider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY

    if (!llmProvider) {
      return NextResponse.json({ error: 'LLM_PROVIDER environment variable is required' }, { status: 500 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: `${llmProvider.toUpperCase()}_API_KEY environment variable is required` }, { status: 500 })
    }

    const provider = createLLMProvider(llmProvider, apiKey)

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
      const fallbackPrompt = `${prompt}\n\nPlease answer in ${getLocaleLabel(locale)} (${locale}) and ensure the content follows local business expectations.`

      aiResponse = provider.generateEnhancedDocument
        ? await provider.generateEnhancedDocument(fallbackPrompt, documentType, userContext)
        : await provider.generateDocument(fallbackPrompt, documentType, userContext)
    }

    const documentData = aiResponse?.document ?? aiResponse?.content ?? aiResponse

    const direction = getDirection(locale)
    const translationEntry = translations[locale as keyof typeof translations]?.common
    const labels = includeTranslations && translationEntry ? { ...translationEntry } : {}

    const localization = {
      locale,
      language: getLocaleLabel(locale),
      direction,
      labels,
    }

    const formattedDocument = aiResponse?.formatted_document ?? JSON.stringify(documentData, null, 2)

    const responsePayload = {
      success: true,
      document: documentData,
      localization,
      formatted_document: formattedDocument,
      assumptions: aiResponse?.assumptions ?? [],
      metadata: {
        generated_at: new Date().toISOString(),
        document_type: documentType,
        prompt_language: locale,
        ai_model: llmProvider,
        version: 'v1',
      },
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error('Multilingual generation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to generate multilingual document', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
