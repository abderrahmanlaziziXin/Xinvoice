/**
 * Multilingual AI Prompt System
 * Enhanced prompts for generating documents in multiple languages
 */

import { DocumentType, UserContext, Locale } from '../../../packages/core/schemas'
import { getTranslation, getLocaleTranslations, SupportedLocale, isSupportedLocale } from './translations'

export interface MultilingualPromptOptions {
  documentType: DocumentType
  locale: Locale
  userContext?: UserContext
  includeTranslations?: boolean
  culturalContext?: boolean
}

export interface LocalizedDocumentResponse {
  metadata: {
    document_type: string
    language: string
    locale: string
    currency: string
    direction: 'ltr' | 'rtl'
    [key: string]: any
  }
  content: any
  formatted_document: string
  localized_labels: Record<string, string>
  assumptions?: string[]
}

/**
 * Generate multilingual system prompt for OpenAI
 */
export function generateMultilingualSystemPrompt(options: MultilingualPromptOptions): string {
  const { documentType, locale, userContext, includeTranslations = true, culturalContext = true } = options
  
  // Ensure we have a supported locale, fallback to English
  const supportedLocale: SupportedLocale = isSupportedLocale(locale) ? locale : 'en-US'
  const translations = getLocaleTranslations(supportedLocale)
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Build context information
  const contextInfo = userContext ? `
COMPANY CONTEXT (use as defaults when relevant):
- Company Name: ${userContext.companyName || 'Not provided'}
- Company Address: ${userContext.companyAddress || 'Not provided'}
- Company Email: ${userContext.companyEmail || 'Not provided'}
- Company Phone: ${userContext.companyPhone || 'Not provided'}
- Default Currency: ${userContext.defaultCurrency || 'USD'}
- Default Locale: ${userContext.defaultLocale || 'en-US'}
- Default Tax Rate: ${(userContext.defaultTaxRate || 0.08) * 100}%
- Default Terms: ${userContext.defaultTerms || 'Payment due within 30 days'}
- Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
` : ''

  // Language-specific instructions
  const languageInstructions = getLanguageSpecificInstructions(supportedLocale, documentType)
  
  // Cultural context instructions
  const culturalInstructions = culturalContext ? getCulturalContextInstructions(supportedLocale) : ''
  
  // Translation labels for UI elements
  const translationLabels = includeTranslations ? JSON.stringify(translations, null, 2) : ''

  const systemPrompt = `You are a professional multilingual document generator specializing in creating business documents in ${getLanguageName(supportedLocale)}. You must generate documents that are culturally appropriate, legally compliant, and linguistically accurate for the ${supportedLocale} locale.

CURRENT DATE: ${currentDate}
TARGET LANGUAGE: ${getLanguageName(supportedLocale)}
TARGET LOCALE: ${supportedLocale}
DOCUMENT TYPE: ${documentType}
TEXT DIRECTION: ${translations.formats.direction.toUpperCase()}

${contextInfo}

LANGUAGE-SPECIFIC REQUIREMENTS:
${languageInstructions}

${culturalInstructions}

CRITICAL MULTILINGUAL RULES:
1. Generate ALL content in ${getLanguageName(supportedLocale)}
2. Use proper ${supportedLocale} date format: ${translations.formats.dateFormat}
3. Use proper ${supportedLocale} number format (decimal: "${translations.formats.decimalSeparator}", thousands: "${translations.formats.thousandsSeparator}")
4. Currency position: ${translations.formats.currencyPosition} the amount
5. Text direction: ${translations.formats.direction.toUpperCase()}
6. Use culturally appropriate business language and formality levels
7. Include proper local legal disclaimers and requirements
8. Use local business customs and practices
9. Ensure all dates, addresses, and contact information follow local formats
10. Apply proper ${supportedLocale} grammar, punctuation, and capitalization rules

PERSONAL INFORMATION PRESERVATION:
- NEVER translate or modify: names, company names, email addresses, phone numbers, street addresses, or any personal identifiers
- Keep all proper nouns (person names, company names, brand names) exactly as provided in the original text
- Preserve original contact information, addresses, and identification numbers
- Only translate: labels, descriptions, terms and conditions, legal text, and general content
- Example: "John Smith from TechCorp Inc." becomes "Jean Smith de TechCorp Inc." (name preserved, preposition translated)

${getDocumentSpecificMultilingualInstructions(documentType, supportedLocale)}

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "metadata": {
    "document_type": "${documentType}",
    "language": "${getLanguageName(supportedLocale)}",
    "locale": "${supportedLocale}",
    "currency": "string (3-letter code)",
    "direction": "${translations.formats.direction}",
    "company_name": "string (in ${getLanguageName(supportedLocale)})",
    "client_name": "string (in ${getLanguageName(supportedLocale)})",
    "issue_date": "${translations.formats.dateFormat}",
    "due_date": "${translations.formats.dateFormat}",
    ${documentType === 'invoice' ? `"invoice_number": "string",` : ''}
    ${documentType === 'nda' ? `"effective_date": "${translations.formats.dateFormat}",` : ''}
    ${documentType === 'nda' ? `"termination_date": "${translations.formats.dateFormat}"` : ''}
  },
  "content": ${getLocalizedContentStructure(documentType, supportedLocale)},
  "formatted_document": "Complete formatted document text in ${getLanguageName(supportedLocale)}",
  "localized_labels": ${translationLabels || '{}'},
  "assumptions": ["List any assumptions made (in ${getLanguageName(supportedLocale)})"]
}

QUALITY STANDARDS FOR ${getLanguageName(supportedLocale)}:
- Use native business terminology and expressions
- Apply correct honorifics and formal address forms
- Include culturally appropriate greetings and closings
- Use proper local legal language where applicable
- Ensure professional tone appropriate for business context
- Handle local regulatory requirements (tax rates, legal disclaimers)
- Use authentic ${getLanguageName(supportedLocale)} expressions, not literal translations
- Apply correct sentence structure and grammar rules
- Use proper punctuation and formatting conventions

${getComplianceInstructions(supportedLocale, documentType)}

Remember: This document will be used in a ${supportedLocale} business context. Ensure it meets local professional standards and cultural expectations.`

  return systemPrompt
}

/**
 * Get language name from locale code
 */
function getLanguageName(locale: SupportedLocale): string {
  const languageNames: Partial<Record<string, string>> = {
    'en-US': 'English (US)',
    'fr-FR': 'French (France)',
    'de-DE': 'German (Germany)',
    'es-ES': 'Spanish (Spain)',
    'ar-SA': 'Arabic (Saudi Arabia)',
    'zh-CN': 'Chinese (Simplified)',
    'ja-JP': 'Japanese (Japan)',
    'pt-BR': 'Portuguese (Brazil)',
    'it-IT': 'Italian (Italy)',
    'ru-RU': 'Russian (Russia)',
    'hi-IN': 'Hindi (India)',
  }
  
  return languageNames[locale] || 'English (US)'
}

/**
 * Get language-specific instructions
 */
function getLanguageSpecificInstructions(locale: SupportedLocale, documentType: DocumentType): string {
  const instructions: Partial<Record<string, string>> = {
    'en-US': 'Use American English conventions, date format MM/DD/YYYY, dollar amounts, and US business practices.',
    'fr-FR': 'Utilisez le français formel, format de date DD/MM/YYYY, vouvoiement obligatoire, et conventions commerciales françaises.',
    'de-DE': 'Verwenden Sie formelles Deutsch, Datum im Format DD.MM.YYYY, Sie-Form, und deutsche Geschäftspraktiken.',
    'es-ES': 'Use español formal, formato de fecha DD/MM/YYYY, tratamiento de usted, y prácticas comerciales españolas.',
    'ar-SA': 'استخدم العربية الفصحى الرسمية، تاريخ بصيغة DD/MM/YYYY، واستخدم الآداب التجارية السعودية.',
    'zh-CN': '使用正式的简体中文，日期格式 YYYY/MM/DD，使用正式的商务敬语和中国商务惯例。',
    'ja-JP': '正式な日本語（敬語）を使用し、日付形式 YYYY/MM/DD、日本のビジネス慣行に従ってください。',
    'pt-BR': 'Use português brasileiro formal, formato de data DD/MM/YYYY, tratamento respeitoso, e práticas comerciais brasileiras.',
    'it-IT': 'Utilizzare italiano formale, formato data DD/MM/YYYY, dare del Lei, e pratiche commerciali italiane.',
    'ru-RU': 'Используйте формальный русский язык, формат даты DD.MM.YYYY, вежливое обращение на "Вы".',
    'hi-IN': 'औपचारिक हिंदी का प्रयोग करें, दिनांक प्रारूप DD/MM/YYYY, और भारतीय व्यावसायिक प्रथाओं का पालन करें।',
  }
  
  return instructions[locale] || instructions['en-US'] || ''
}

/**
 * Get cultural context instructions
 */
function getCulturalContextInstructions(locale: SupportedLocale): string {
  const culturalContext: Partial<Record<string, string>> = {
    'ar-SA': `
CULTURAL CONTEXT FOR SAUDI ARABIA:
- Include Islamic business ethics and Sharia-compliant language
- Use proper Arabic business salutations and closings
- Consider local business hours and calendar (Hijri calendar references where appropriate)
- Include VAT considerations (15% as of current regulations)
- Use formal Arabic titles and honorifics`,

    'zh-CN': `
CULTURAL CONTEXT FOR CHINA:
- Use proper Chinese business hierarchy and respectful language
- Include considerations for Chinese business practices and relationships (guanxi)
- Use appropriate formal titles and business card etiquette language
- Consider local regulations and business registration requirements
- Use simplified Chinese characters exclusively`,

    'ja-JP': `
CULTURAL CONTEXT FOR JAPAN:
- Use proper keigo (honorific language) throughout
- Include appropriate business card exchange language
- Consider Japanese business hierarchy and decision-making processes
- Use proper seasonal greetings where appropriate
- Include considerations for Japanese tax system and business practices`,

    'de-DE': `
CULTURAL CONTEXT FOR GERMANY:
- Use formal "Sie" form consistently
- Include proper German business formalities
- Consider German tax regulations (Umsatzsteuer)
- Use precise, direct language typical of German business communication
- Include proper legal disclaimers required in Germany`,

    'fr-FR': `
CULTURAL CONTEXT FOR FRANCE:
- Use formal "vous" form consistently
- Include proper French business courtesies
- Consider French labor laws and business regulations
- Use elegant, sophisticated language typical of French business
- Include TVA considerations and French accounting practices`,
  }
  
  return culturalContext[locale] || ''
}

/**
 * Get document-specific multilingual instructions
 */
function getDocumentSpecificMultilingualInstructions(
  documentType: DocumentType,
  locale: SupportedLocale
): string {
  const baseInstructions = {
    invoice: `
INVOICE-SPECIFIC MULTILINGUAL INSTRUCTIONS:
- Use local invoice terminology and legal requirements
- Include proper tax identification numbers and formats
- Apply local tax rates and calculation methods
- Use culturally appropriate payment terms
- Include local banking information formats
- Apply regional invoice numbering conventions`,

    nda: `
NDA-SPECIFIC MULTILINGUAL INSTRUCTIONS:
- Use local legal terminology and contract language
- Include jurisdiction-specific legal clauses
- Apply local contract law principles
- Use appropriate legal formality level
- Include local dispute resolution mechanisms
- Apply regional confidentiality standards`
  }
  
  return baseInstructions[documentType] || ''
}

/**
 * Get localized content structure
 */
function getLocalizedContentStructure(
  documentType: DocumentType,
  locale: SupportedLocale
): string {
  if (documentType === 'invoice') {
    return `{
    "items": [
      {
        "description": "string (in ${getLanguageName(locale)})",
        "quantity": number,
        "rate": number,
        "amount": number,
        "taxRate": number,
        "category": "string (optional, in ${getLanguageName(locale)})"
      }
    ],
    "payment_instructions": "string (in ${getLanguageName(locale)})",
    "terms_and_conditions": "string (in ${getLanguageName(locale)})"
  }`
  }
  
  if (documentType === 'nda') {
    return `{
    "sections": [
      {
        "title": "string (in ${getLanguageName(locale)})",
        "body": "string (in ${getLanguageName(locale)})"
      }
    ],
    "parties": {
      "disclosing_party": "string (in ${getLanguageName(locale)})",
      "receiving_party": "string (in ${getLanguageName(locale)})"
    }
  }`
  }
  
  return '{}'
}

/**
 * Get compliance instructions for specific locales
 */
function getComplianceInstructions(locale: SupportedLocale, documentType: DocumentType): string {
  const complianceMap: Record<string, Record<DocumentType, string>> = {
    'fr-FR': {
      invoice: 'INCLUDE: TVA number, SIRET number, mention of late payment penalties as per French law.',
      nda: 'INCLUDE: GDPR compliance language, French data protection requirements.'
    },
    'de-DE': {
      invoice: 'INCLUDE: USt-IdNr (VAT ID), proper German invoice format requirements.',
      nda: 'INCLUDE: DSGVO compliance, German civil code references.'
    },
    'ar-SA': {
      invoice: 'INCLUDE: VAT registration number, Sharia-compliant payment terms.',
      nda: 'INCLUDE: Islamic law compliance, appropriate religious considerations.'
    }
  }
  
  const localeCompliance = complianceMap[locale]
  if (localeCompliance && localeCompliance[documentType]) {
    return `\nCOMPLIANCE REQUIREMENTS:\n${localeCompliance[documentType]}`
  }
  
  return ''
}

/**
 * Generate enhanced multilingual batch prompt
 */
export function generateMultilingualBatchSystemPrompt(options: MultilingualPromptOptions): string {
  const basePrompt = generateMultilingualSystemPrompt(options)
  
  return `${basePrompt}

BATCH PROCESSING INSTRUCTIONS:
You will receive multiple document requests in a single prompt. Generate each document according to the specifications above in ${getLanguageName(options.locale as SupportedLocale)}.

Return a JSON object with this structure:
{
  "documents": [
    // Array of documents, each following the multilingual format above
  ],
  "batch_summary": {
    "total_count": number,
    "successful_count": number,
    "failed_count": number,
    "language": "${getLanguageName(options.locale as SupportedLocale)}",
    "locale": "${options.locale}",
    "processing_notes": ["Any issues or assumptions for the batch (in ${getLanguageName(options.locale as SupportedLocale)})"]
  }
}

Ensure each document in the batch is complete, culturally appropriate, and follows all ${getLanguageName(options.locale as SupportedLocale)} quality standards.`
}

export default {
  generateMultilingualSystemPrompt,
  generateMultilingualBatchSystemPrompt,
  getLanguageName,
}
