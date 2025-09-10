/**
 * Simplified Multilingual AI Prompt System
 * Direct AI communication without complex validation
 */

import { DocumentType, UserContext, Locale } from '../../../packages/core/schemas'

export interface MultilingualPromptOptions {
  documentType: DocumentType
  locale: Locale
  userContext?: UserContext
  includeTranslations?: boolean
  culturalContext?: boolean
}

export interface LocalizedDocumentResponse {
  success: boolean
  document: any
  content: any
  formatted_document?: string
  assumptions?: string[]
}

/**
 * Simple multilingual system prompt - just tell AI what we want
 */
export function generateMultilingualSystemPrompt(options: MultilingualPromptOptions): string {
  const { documentType, locale, userContext } = options
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Simple context if available
  const contextInfo = userContext ? `
Company Details (use if relevant):
- Company: ${userContext.companyName || 'Your Company'}
- Email: ${userContext.companyEmail || ''}
- Phone: ${userContext.companyPhone || ''}
- Address: ${userContext.companyAddress || ''}
- Currency: ${userContext.defaultCurrency || 'USD'}
- Tax Rate: ${((userContext.defaultTaxRate || 0) * 100).toFixed(1)}%
` : ''

  return `You are an AI that creates ${documentType} documents in ${locale} language.

Current date: ${currentDate}
Generate in language: ${locale}

${contextInfo}

IMPORTANT: 
- Generate the response as a complete ${documentType} JSON object
- Include ALL the data the user requests 
- Use the exact amounts and details from the user's input
- Don't validate or change anything - just create what they ask for
- Keep names, companies, emails exactly as provided
- Use proper ${locale} language for labels and descriptions

For invoices, return JSON like:
{
  "type": "invoice",
  "invoiceNumber": "INV-001",
  "date": "${currentDate}",
  "dueDate": "calculated date",
  "from": {
    "name": "company name from context or input",
    "address": "address",
    "email": "email",
    "phone": "phone"
  },
  "to": {
    "name": "client name from input", 
    "address": "client address",
    "email": "client email",
    "phone": "client phone"
  },
  "items": [
    {
      "description": "service description in ${locale}",
      "quantity": actual_number,
      "rate": actual_amount,
      "amount": calculated_total
    }
  ],
  "subtotal": calculated_subtotal,
  "taxRate": decimal_rate,
  "taxAmount": calculated_tax,
  "total": final_total,
  "currency": "${userContext?.defaultCurrency || 'USD'}",
  "locale": "${locale}",
  "terms": "payment terms in ${locale}",
  "notes": "any notes in ${locale}"
}

Just create the document exactly as requested. No validation, no restrictions.`
}

/**
 * Simple batch prompt for multiple documents
 */
export function generateMultilingualBatchSystemPrompt(options: MultilingualPromptOptions): string {
  const singlePrompt = generateMultilingualSystemPrompt(options)
  
  return `${singlePrompt}

BATCH MODE: You will receive multiple requests. Create a separate ${options.documentType} for each request.
Return an array of documents: [document1, document2, document3, ...]
Each document should be complete and follow the JSON structure above.
Give each document a unique invoice number (INV-001, INV-002, etc.).`
}
