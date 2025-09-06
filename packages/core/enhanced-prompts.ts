/**
 * Enhanced Prompt Template System for Rich AI Outputs
 * Supports multiple document types with structured responses
 */

import { DocumentType, UserContext } from './schemas'

export interface DocumentMetadata {
  document_type: string
  company_name?: string
  client_name?: string
  issue_date?: string
  due_date?: string
  effective_date?: string
  termination_date?: string
  currency?: string
  locale?: string
  [key: string]: any
}

export interface DocumentContent {
  sections?: Array<{
    title: string
    body: string
    items?: any[]
  }>
  items?: any[]
  [key: string]: any
}

export interface EnhancedDocumentResponse {
  metadata: DocumentMetadata
  content: DocumentContent
  formatted_document: string
  assumptions?: string[]
}

/**
 * Generate enhanced system prompt for professional document generation
 */
export function generateEnhancedSystemPrompt(
  documentType: DocumentType,
  userContext?: UserContext
): string {
  const currentDate = new Date().toISOString().split('T')[0]
  
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

  return `You are a professional document generator for small businesses and enterprises. Given input details about a business transaction or agreement, you will create polished, legally coherent documents in the requested format.

CURRENT DATE: ${currentDate}
${contextInfo}

PROCESS:
1. Identify the document type requested (invoice, NDA, contract, receipt, etc.)
2. Extract key information from the user's description:
   - Parties involved (names, roles, addresses, contact information)
   - Dates (agreement date, due date, termination date, effective date)
   - Services, products, or obligations
   - Payment terms and amounts
   - Confidentiality clauses or special conditions
   - Currency and locale preferences
3. If critical information is missing, make reasonable professional assumptions
4. Produce a structured JSON response with enhanced sections
5. Use formal, professional language appropriate for business documents
6. Respect locale and currency formatting conventions
7. Include both structured data and formatted document text

${getDocumentSpecificInstructions(documentType)}

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "metadata": {
    "document_type": "${documentType}",
    "company_name": "string",
    "client_name": "string", 
    "issue_date": "YYYY-MM-DD",
    "due_date": "YYYY-MM-DD",
    "currency": "string (3-letter code)",
    "locale": "string (locale code)",
    "invoice_number": "string (for invoices)",
    "effective_date": "YYYY-MM-DD (for NDAs/contracts)",
    "termination_date": "YYYY-MM-DD (for NDAs/contracts)"
  },
  "content": ${getContentStructure(documentType)},
  "formatted_document": "Complete formatted document text",
  "assumptions": ["List any assumptions made due to missing information"]
}

QUALITY STANDARDS:
- Use clear, formal, professional language
- Respect regional formatting conventions
- Make logical assumptions for missing data
- Separate structured data from formatted text
- Include comprehensive details appropriate for business use
- Ensure legal coherence and professional presentation
- Handle multiple languages and currencies appropriately

CRITICAL RULES:
- Never generate fake email addresses - leave empty if not provided
- Use proper date formats (YYYY-MM-DD)
- Calculate all amounts accurately
- Include detailed professional descriptions
- Make reasonable assumptions and document them
- Ensure all required fields are present and valid`
}

/**
 * Get document-specific instructions
 */
function getDocumentSpecificInstructions(documentType: DocumentType): string {
  switch (documentType) {
    case 'invoice':
      return `INVOICE-SPECIFIC INSTRUCTIONS:
- Break down services into detailed, professional line items
- Use specific descriptions explaining value and deliverables
- Calculate subtotal, tax, and total accurately
- Include payment terms and instructions
- Generate professional invoice numbers if not provided
- Handle multiple currencies and tax jurisdictions
- For web development: separate design, development, testing, deployment
- For consulting: break down by phases, deliverables, research
- For products: include specifications and features
- Avoid generic descriptions - use industry-standard terminology

DETAILED BREAKDOWN EXAMPLES:
Instead of "Web development - $2500", use:
• "Frontend Development - Custom React Components and UI Design - $1200"
• "Backend API Development - Database Integration and Server Logic - $800"
• "Quality Assurance - Cross-browser Testing and Optimization - $300"
• "Deployment and Launch - Production Setup and Go-live Support - $200"`

    case 'nda':
      return `NDA-SPECIFIC INSTRUCTIONS:
- Include standard NDA sections: Purpose, Definitions, Confidentiality Obligations
- Add Exclusions, Term and Termination, Governing Law, Signatures
- Handle both mutual and unilateral NDAs
- Include effective and termination dates
- Specify jurisdiction and governing law
- Define confidential information clearly
- Include standard legal language for enforceability
- Handle different business structures (Corp, LLC, Partnership)
- Include proper party identification and roles`

    default:
      return `GENERAL DOCUMENT INSTRUCTIONS:
- Follow standard business document formatting
- Include all necessary legal elements
- Use appropriate professional language
- Ensure document completeness and accuracy`
  }
}

/**
 * Get content structure for document type
 */
function getContentStructure(documentType: DocumentType): string {
  switch (documentType) {
    case 'invoice':
      return `{
    "items": [
      {
        "description": "Detailed service description",
        "quantity": number,
        "rate": number,
        "amount": number,
        "taxRate": number,
        "category": "string (optional)"
      }
    ],
    "payment_instructions": "string",
    "terms_and_conditions": "string"
  }`

    case 'nda':
      return `{
    "sections": [
      {
        "title": "Purpose",
        "body": "Description of the purpose and scope of the agreement"
      },
      {
        "title": "Definitions", 
        "body": "Definition of confidential information and key terms"
      },
      {
        "title": "Confidentiality Obligations",
        "body": "Specific obligations and restrictions on use of confidential information"
      },
      {
        "title": "Exclusions",
        "body": "Information that is not considered confidential"
      },
      {
        "title": "Term and Termination",
        "body": "Duration of the agreement and termination conditions"
      },
      {
        "title": "Governing Law",
        "body": "Applicable law and jurisdiction"
      }
    ],
    "parties": {
      "disclosing_party": "Party information",
      "receiving_party": "Party information"
    }
  }`

    default:
      return `{
    "sections": [
      {
        "title": "string",
        "body": "string"
      }
    ]
  }`
  }
}

/**
 * Generate enhanced batch system prompt
 */
export function generateEnhancedBatchSystemPrompt(
  documentType: DocumentType,
  userContext?: UserContext
): string {
  const basePrompt = generateEnhancedSystemPrompt(documentType, userContext)
  
  return `${basePrompt}

BATCH PROCESSING INSTRUCTIONS:
You will receive multiple document requests in a single prompt. Generate each document according to the specifications above.

Return a JSON object with this structure:
{
  "documents": [
    // Array of documents, each following the format above
  ],
  "batch_summary": {
    "total_count": number,
    "successful_count": number,
    "failed_count": number,
    "processing_notes": ["Any issues or assumptions for the batch"]
  }
}

Ensure each document in the batch is complete and follows all quality standards. If any document fails to generate properly, include it in the array with an error field instead of content.`
}

/**
 * Validate enhanced document response
 */
export function validateEnhancedResponse(response: any, documentType: DocumentType): boolean {
  if (!response || typeof response !== 'object') return false
  
  // Check required top-level properties
  if (!response.metadata || !response.content || !response.formatted_document) {
    return false
  }
  
  // Check metadata
  const metadata = response.metadata
  if (!metadata.document_type || metadata.document_type !== documentType) {
    return false
  }
  
  // Document-specific validation
  switch (documentType) {
    case 'invoice':
      return !!(
        metadata.client_name &&
        response.content.items &&
        Array.isArray(response.content.items) &&
        response.content.items.length > 0
      )
      
    case 'nda':
      return !!(
        metadata.client_name &&
        response.content.sections &&
        Array.isArray(response.content.sections) &&
        response.content.sections.length > 0
      )
      
    default:
      return true
  }
}

export default {
  generateEnhancedSystemPrompt,
  generateEnhancedBatchSystemPrompt,
  validateEnhancedResponse
}
