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
- Default Tax Rate: ${(userContext.defaultTaxRate || 0) * 100}%
- Default Terms: ${userContext.defaultTerms || 'Payment due within 30 days'}
- Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
` : ''

  return `You are an expert business document generator. Create professional, accurate documents based on user descriptions.

**CRITICAL: Return the EXACT JSON structure specified below. No mapping or conversion will be done - your response must match the expected format perfectly.**

CURRENT DATE: ${currentDate}
${contextInfo}

RESPONSE FORMAT (JSON only):
{
  "metadata": {
    "document_type": "${documentType}",
    "generated_date": "${currentDate}",
    "currency": "${userContext?.defaultCurrency || 'USD'}",
    "locale": "${userContext?.defaultLocale || 'en-US'}"
  },
  "content": ${getContentStructure(documentType, userContext)},
  "formatted_document": "Complete formatted document text here",
  "assumptions": ["List any assumptions made"]
}

**IMPORTANT RULES:**
1. Use the EXACT field names in the content structure
2. Return valid JSON with all required fields
3. Calculate all financial amounts accurately
4. Use professional language and formatting
5. Include all necessary business details
6. Make reasonable assumptions for missing information
7. ALWAYS use currency "${userContext?.defaultCurrency || 'USD'}" unless user specifies different currency
8. ALWAYS use tax rate ${((userContext?.defaultTaxRate || 0) * 100).toFixed(1)}% unless user specifies different rate
9. Use locale "${userContext?.defaultLocale || 'en-US'}" for formatting and language

${getDocumentSpecificInstructions(documentType)}

QUALITY STANDARDS:
- Use clear, formal, professional language
- Respect regional formatting conventions
- Make logical assumptions for missing data
- Include comprehensive details appropriate for business use
- Ensure legal coherence and professional presentation
- Handle multiple languages and currencies appropriately

CRITICAL RULES:
- Never generate fake email addresses - leave empty if not provided
- Use proper date formats (YYYY-MM-DD)
- Calculate all amounts accurately
- Include detailed professional descriptions
- Make reasonable assumptions and document them
- Return the EXACT JSON structure - no variations allowed`
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
- CRITICAL: Generate complete party information including full addresses
- Include standard NDA sections: Purpose, Definitions, Confidentiality Obligations
- Add Exclusions, Term and Termination, Governing Law, Signatures
- Handle both mutual and unilateral NDAs
- Include effective and termination dates
- Specify jurisdiction and governing law
- Define confidential information clearly
- Include standard legal language for enforceability
- Handle different business structures (Corp, LLC, Partnership)
- Include proper party identification and roles

PARTY INFORMATION REQUIREMENTS:
- Generate realistic business addresses (street, city, state, zip)
- Include professional email addresses if companies are named
- Add phone numbers in standard business format
- Specify company type (Corporation, LLC, Partnership, etc.)
- Use proper business entity suffixes (Inc., LLC, Corp., etc.)

EXAMPLE PARTY STRUCTURE:
"disclosingParty": {
  "name": "TechCorp Solutions Inc.",
  "address": "123 Innovation Drive, Suite 400, San Francisco, CA 94105",
  "email": "legal@techcorp.com",
  "phone": "+1 (415) 555-0123"
},
"receivingParty": {
  "name": "DataLabs LLC",
  "address": "456 Research Boulevard, Austin, TX 78701",
  "email": "contracts@datalabs.com", 
  "phone": "+1 (512) 555-0456"
}`

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
function getContentStructure(documentType: DocumentType, userContext?: UserContext): string {
  switch (documentType) {
    case 'invoice':
      return `{
    "invoiceNumber": "INV-XXXX",
    "date": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD", 
    "from": {
      "name": "Company Name",
      "address": "Full Address",
      "email": "email@company.com",
      "phone": "+1234567890"
    },
    "to": {
      "name": "Client Name", 
      "address": "Client Address",
      "email": "client@email.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "description": "Detailed service description",
        "quantity": 1,
        "rate": 100.00,
        "amount": 100.00
      }
    ],
    "subtotal": 100.00,
    "taxRate": ${userContext?.defaultTaxRate || 0},
    "taxAmount": 10.00,
    "total": 110.00,
    "currency": "${userContext?.defaultCurrency || 'USD'}",
    "locale": "${userContext?.defaultLocale || 'en-US'}",
    "terms": "Payment terms and conditions",
    "notes": "Additional notes"
  }`

    case 'nda':
      return `{
    "type": "nda",
    "title": "Non-Disclosure Agreement",
    "effectiveDate": "YYYY-MM-DD",
    "terminationDate": "YYYY-MM-DD",
    "disclosingParty": {
      "name": "Company A",
      "address": "Full Address",
      "email": "contact@companyA.com",
      "phone": "+1234567890"
    },
    "receivingParty": {
      "name": "Company B", 
      "address": "Full Address",
      "email": "contact@companyB.com",
      "phone": "+1234567890"
    },
    "purpose": "Business collaboration purpose",
    "termMonths": 12,
    "jurisdiction": "California",
    "mutualNda": false,
    "confidentialityLevel": "standard",
    "definitions": "Definition of confidential information",
    "confidentialityObligations": "Specific confidentiality obligations",
    "exclusions": "Information excluded from confidentiality",
    "termClause": "Term and termination clause",
    "governingLawClause": "Governing law details",
    "additionalTerms": "Any additional terms",
    "specialProvisions": "Special provisions"
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
