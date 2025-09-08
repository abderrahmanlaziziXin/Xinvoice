import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { DocumentType, UserContext, Locale } from './schemas'
import { 
  generateEnhancedSystemPrompt, 
  generateEnhancedBatchSystemPrompt,
  validateEnhancedResponse,
  type EnhancedDocumentResponse 
} from './enhanced-prompts'

// Multilingual support
import { 
  generateMultilingualSystemPrompt,
  generateMultilingualBatchSystemPrompt,
  type MultilingualPromptOptions,
  type LocalizedDocumentResponse
} from '../../app/lib/i18n/multilingual-prompts'

export interface LLMProvider {
  generateDocument(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<any>
  generateBatchDocuments?(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<any[]>
  generateEnhancedDocument?(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse>
  generateEnhancedBatchDocuments?(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse[]>
  generateMultilingualDocument?(prompt: string, options: MultilingualPromptOptions, userContext?: UserContext): Promise<LocalizedDocumentResponse>
  generateMultilingualBatchDocuments?(prompts: string[], options: MultilingualPromptOptions, userContext?: UserContext): Promise<LocalizedDocumentResponse[]>
}

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey
    })
  }

  async generateDocument(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<any> {
    const systemPrompt = this.getSystemPrompt(documentType, userContext)
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o", // Upgraded to GPT-4o for better batch processing
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content)
  }

  async generateEnhancedDocument(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse> {
    const systemPrompt = generateEnhancedSystemPrompt(documentType, userContext)
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const response = JSON.parse(content)
    
    // Debug log to see what AI actually returns
    console.log('🤖 Raw AI Response:', JSON.stringify(response, null, 2))
    if (response.content?.items) {
      console.log('🔢 AI Items:', response.content.items)
    }
    
    // Validate the enhanced response
    if (!validateEnhancedResponse(response, documentType)) {
      throw new Error('Generated document does not meet quality standards')
    }

    return response as EnhancedDocumentResponse
  }

  async generateBatchDocuments(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<any[]> {
    const systemPrompt = this.getBatchSystemPrompt(documentType, userContext)
    
    // Create a single prompt with all the individual prompts
    const batchPrompt = `Generate invoices for the following requests:

${prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}

Return a JSON array where each element is a complete invoice object.`

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: batchPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content)
    // Handle both array response and object with invoices array
    return Array.isArray(result) ? result : (result.invoices || [result])
  }

  async generateEnhancedBatchDocuments(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse[]> {
    const systemPrompt = generateEnhancedBatchSystemPrompt(documentType, userContext)
    
    const batchPrompt = `Generate ${documentType}s for the following requests:

${prompts.map((prompt, index) => `Request ${index + 1}:
${prompt}

---`).join('\n')}

Process each request and return the structured batch response format.`

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: batchPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content)
    
    // Extract documents from batch response
    if (result.documents && Array.isArray(result.documents)) {
      return result.documents.filter((doc: any) => 
        validateEnhancedResponse(doc, documentType)
      )
    }

    throw new Error('Invalid batch response format')
  }

  async generateMultilingualDocument(prompt: string, options: MultilingualPromptOptions, userContext?: UserContext): Promise<LocalizedDocumentResponse> {
    const systemPrompt = generateMultilingualSystemPrompt(options)
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const response = JSON.parse(content)
    
    // Validate the response structure
    if (!response.metadata || !response.content || !response.formatted_document) {
      throw new Error('Invalid multilingual document response format')
    }

    return response as LocalizedDocumentResponse
  }

  async generateMultilingualBatchDocuments(prompts: string[], options: MultilingualPromptOptions, userContext?: UserContext): Promise<LocalizedDocumentResponse[]> {
    const systemPrompt = generateMultilingualBatchSystemPrompt(options)
    
    // Create a single prompt with all the individual prompts
    const batchPrompt = `Generate ${options.documentType}s in ${options.locale} for the following requests:

${prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}

Return a JSON object with the batch structure as specified.`

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: batchPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const batchResponse = JSON.parse(content)
    
    if (!batchResponse.documents || !Array.isArray(batchResponse.documents)) {
      throw new Error('Invalid batch response format')
    }

    return batchResponse.documents as LocalizedDocumentResponse[]
  }

  private getSystemPrompt(documentType: DocumentType, userContext?: UserContext): string {
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const contextInfo = userContext ? `
    
    USER CONTEXT (use as defaults when relevant):
    - Company Name: ${userContext.companyName || 'Not provided'}
    - Company Address: ${userContext.companyAddress || 'Not provided'}
    - Company Email: ${userContext.companyEmail || 'Not provided'}
    - Company Phone: ${userContext.companyPhone || 'Not provided'}
    - Default Currency: ${userContext.defaultCurrency || 'USD'}
    - Default Tax Rate: ${(userContext.defaultTaxRate || 0.08) * 100}%
    - Default Terms: ${userContext.defaultTerms || 'Not provided'}
    - Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
    ` : ''

    if (documentType === 'invoice') {
      return `You are an AI assistant that generates invoice data from natural language prompts in ANY language. 
      
      CURRENT DATE: ${currentDate} (use this as default for dates)
      ${contextInfo}
      
      You can understand:
      - Multiple languages (English, French, Spanish, German, etc.)
      - Typos and spelling mistakes
      - Various formats and currencies
      - Natural language descriptions
      - Relative dates (e.g., "due in 30 days", "net 15", "in 2 weeks")
      
      DATE HANDLING:
      - If user mentions specific dates, use those dates
      - If user mentions relative dates (e.g., "due in 30 days"), calculate from current date
      - If no dates mentioned, use current date for invoice date and 30 days later for due date
      - Always format dates as YYYY-MM-DD
      
      EMAIL VALIDATION:
      - If emails are provided, they must be valid email format
      - If no email provided, leave email field empty (don't make up emails)
      
      ITEM DESCRIPTIONS - DETAILED BREAKDOWN RULES:
      - Break down services into specific, detailed line items with professional descriptions
      - Use descriptive language explaining the value and deliverables for each component
      - For web development: separate design, development, testing, deployment phases
      - For consulting: break down by meetings, analysis, deliverables, research phases
      - For products: include specifications, features, or variants with clear descriptions
      - Avoid generic terms - use specific, professional service descriptions
      - Include deliverables when possible (e.g., "5 Custom Web Pages with Responsive Design")
      - For hourly work: specify the type of work and expertise level
      - Distribute the total amount logically across different service components
      - Each line item should represent a distinct phase, deliverable, or service component
      
      EXAMPLES OF DETAILED ITEM BREAKDOWNS:
      Instead of: "Web development - $2500"
      Use multiple detailed items:
      • "Frontend Development - Custom React Components and User Interface Design - $1200"
      • "Backend API Development - Database Integration and Server Logic - $800"
      • "Quality Assurance Testing - Cross-browser Testing and Performance Optimization - $300"
      • "Project Setup and Deployment - Domain Configuration and Production Launch - $200"
      
      Instead of: "Design work - $1500"  
      Use multiple detailed items:
      • "UI/UX Design - Wireframes and User Experience Planning - $600"
      • "Visual Design - Custom Graphics and Brand Identity Implementation - $500"
      • "Responsive Design Implementation - Mobile and Tablet Optimization - $400"
      
      Instead of: "Consulting - $3000"
      Use multiple detailed items:
      • "Technical Consultation - Architecture Planning and Technology Assessment - $1000"
      • "Strategy Sessions - Business Requirements Analysis and Solution Design - $1200"
      • "Documentation and Knowledge Transfer - Technical Guides and Training Materials - $800"
      
      Return a JSON object with this structure:
      {
        "type": "invoice",
        "invoiceNumber": "string (generate if not provided)",
        "date": "YYYY-MM-DD format",
        "dueDate": "YYYY-MM-DD format",
        "from": {
          "name": "string",
          "address": "string (optional)",
          "email": "string (optional)",
          "phone": "string (optional)"
        },
        "to": {
          "name": "string",
          "address": "string (optional)", 
          "email": "string (optional)",
          "phone": "string (optional)"
        },
        "items": [
          {
            "description": "string",
            "quantity": number,
            "rate": number,
            "amount": number
          }
        ],
        "subtotal": number,
        "taxRate": number (as decimal, e.g., 0.08 for 8%),
        "taxAmount": number,
        "total": number,
        "terms": "string (optional)",
        "notes": "string (optional)"
      }

      Calculate amounts accurately. Use the provided user context as defaults when relevant.
      For dates: use current date (${currentDate}) if not specified, calculate due dates based on terms.
      Be forgiving with typos and different languages. Convert currencies to the user's preferred currency when possible.
      DO NOT generate fake email addresses - leave email fields empty if not provided by user.
      
      CRITICAL: Always break down services into multiple detailed line items with professional descriptions.
      Each item should clearly explain the specific work performed and value delivered to the client.
      Use industry-standard terminology and avoid generic descriptions like "webdev" or "design work".`
    } else {
      return `You are an AI assistant that generates NDA data from natural language prompts.
      
      CURRENT DATE: ${currentDate} (use this as default for dates)
      ${contextInfo}
      
      Return a JSON object with this structure:
      {
        "type": "nda",
        "title": "string",
        "date": "YYYY-MM-DD format",
        "disclosingParty": {
          "name": "string",
          "title": "string (optional)",
          "company": "string (optional)"
        },
        "receivingParty": {
          "name": "string", 
          "title": "string (optional)",
          "company": "string (optional)"
        },
        "purpose": "string",
        "termMonths": number,
        "jurisdiction": "string",
        "mutualNda": boolean
      }

      Use current date (${currentDate}) if not specified. Default to 12 months term if not specified.
      Use user context jurisdiction as default if provided.`
    }
  }

  private getBatchSystemPrompt(documentType: DocumentType, userContext?: UserContext): string {
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const contextInfo = userContext ? `
    
    USER CONTEXT (use as defaults when relevant):
    - Company Name: ${userContext.companyName || 'Not provided'}
    - Company Address: ${userContext.companyAddress || 'Not provided'}
    - Company Email: ${userContext.companyEmail || 'Not provided'}
    - Company Phone: ${userContext.companyPhone || 'Not provided'}
    - Default Currency: ${userContext.defaultCurrency || 'USD'}
    - Default Tax Rate: ${(userContext.defaultTaxRate || 0.08) * 100}%
    - Default Terms: ${userContext.defaultTerms || 'Not provided'}
    - Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
    ` : ''

    if (documentType === 'invoice') {
      return `You are an AI assistant that generates MULTIPLE invoice data objects from natural language prompts in ANY language. 
      
      CURRENT DATE: ${currentDate} (use this as default for dates)
      ${contextInfo}
      
      BATCH PROCESSING RULES:
      - Process each request independently
      - Generate unique invoice numbers for each (INV-001, INV-002, etc.)
      - Use the same company information (from context) for all invoices
      - Each invoice should have different clients/services as specified
      - Break down each service into detailed, professional line items
      - Use descriptive language explaining specific deliverables and work performed
      - Avoid generic terms - use industry-standard professional descriptions
      - Distribute amounts logically across multiple service components per invoice
      
      Return a JSON object with this structure:
      {
        "invoices": [
          {
            "type": "invoice",
            "invoiceNumber": "string (unique for each)",
            "date": "YYYY-MM-DD format",
            "dueDate": "YYYY-MM-DD format",
            "from": {
              "name": "string (use company context)",
              "address": "string (use company context)",
              "email": "string (use company context)",
              "phone": "string (use company context)"
            },
            "to": {
              "name": "string (client name from prompt)",
              "address": "string (optional)", 
              "email": "string (optional)",
              "phone": "string (optional)"
            },
            "items": [
              {
                "description": "string",
                "quantity": number,
                "rate": number,
                "amount": number
              }
            ],
            "subtotal": number,
            "taxRate": number (0-1, e.g., 0.08 for 8%),
            "taxAmount": number,
            "total": number,
            "terms": "string (use context default)",
            "notes": "string (optional)"
          }
        ]
      }

      IMPORTANT: Process ALL requests and generate one invoice per request with unique invoice numbers.
      Each invoice should have detailed, professional line item descriptions that clearly explain the work performed.
      Break down services into specific components with descriptive explanations of deliverables and value provided.`
    }

    return 'You are a helpful assistant that generates multiple documents.'
  }
}

export class GeminiProvider implements LLMProvider {
  private genai: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genai = new GoogleGenerativeAI(apiKey)
    this.model = this.genai.getGenerativeModel({ model: "gemini-pro" })
  }

  async generateDocument(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<any> {
    const systemPrompt = this.getSystemPrompt(documentType, userContext)
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`
    
    const result = await this.model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }
    
    return JSON.parse(jsonMatch[0])
  }

  async generateEnhancedDocument(prompt: string, documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse> {
    const systemPrompt = generateEnhancedSystemPrompt(documentType, userContext)
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`
    
    const result = await this.model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0])
    
    // Validate the enhanced response
    if (!validateEnhancedResponse(parsedResponse, documentType)) {
      throw new Error('Generated document does not meet quality standards')
    }

    return parsedResponse as EnhancedDocumentResponse
  }

  async generateEnhancedBatchDocuments(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<EnhancedDocumentResponse[]> {
    const systemPrompt = generateEnhancedBatchSystemPrompt(documentType, userContext)
    
    const batchPrompt = `Generate ${documentType}s for the following requests:

${prompts.map((prompt, index) => `Request ${index + 1}:
${prompt}

---`).join('\n')}

Process each request and return the structured batch response format.`

    const fullPrompt = `${systemPrompt}\n\n${batchPrompt}`
    
    const result = await this.model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }
    
    const parsedResult = JSON.parse(jsonMatch[0])
    
    // Extract documents from batch response
    if (parsedResult.documents && Array.isArray(parsedResult.documents)) {
      return parsedResult.documents.filter((doc: any) => 
        validateEnhancedResponse(doc, documentType)
      )
    }
    
    // Fallback to single document array
    return Array.isArray(parsedResult) ? parsedResult : [parsedResult]
  }

  private getSystemPrompt(documentType: DocumentType, userContext?: UserContext): string {
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const contextInfo = userContext ? `
    
    USER CONTEXT (use as defaults when relevant):
    - Company Name: ${userContext.companyName || 'Not provided'}
    - Company Address: ${userContext.companyAddress || 'Not provided'}
    - Company Email: ${userContext.companyEmail || 'Not provided'}
    - Company Phone: ${userContext.companyPhone || 'Not provided'}
    - Default Currency: ${userContext.defaultCurrency || 'USD'}
    - Default Tax Rate: ${(userContext.defaultTaxRate || 0.08) * 100}%
    - Default Terms: ${userContext.defaultTerms || 'Not provided'}
    - Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
    ` : ''

    // Same system prompts as OpenAI but adapted for Gemini
    if (documentType === 'invoice') {
      return `Generate invoice data as JSON from the user's natural language prompt in ANY language.
      
      CURRENT DATE: ${currentDate} (use this as default for dates)
      ${contextInfo}
      
      You can understand:
      - Multiple languages (English, French, Spanish, German, etc.)
      - Typos and spelling mistakes  
      - Various formats and currencies
      - Natural language descriptions
      - Relative dates (e.g., "due in 30 days", "net 15", "in 2 weeks")
      
      DATE HANDLING:
      - If user mentions specific dates, use those dates
      - If user mentions relative dates (e.g., "due in 30 days"), calculate from current date
      - If no dates mentioned, use current date for invoice date and 30 days later for due date
      - Always format dates as YYYY-MM-DD
      
      EMAIL VALIDATION:
      - If emails are provided, they must be valid email format
      - If no email provided, leave email field empty (don't make up emails)
      
      Return ONLY a JSON object with this exact structure:
      {
        "type": "invoice",
        "invoiceNumber": "string (generate if not provided)",
        "date": "YYYY-MM-DD format",
        "dueDate": "YYYY-MM-DD format",
        "from": {
          "name": "string",
          "address": "string (optional)",
          "email": "string (optional)",
          "phone": "string (optional)"
        },
        "to": {
          "name": "string",
          "address": "string (optional)", 
          "email": "string (optional)",
          "phone": "string (optional)"
        },
        "items": [
          {
            "description": "string",
            "quantity": number,
            "rate": number,
            "amount": number
          }
        ],
        "subtotal": number,
        "taxRate": number (as decimal, e.g., 0.08 for 8%),
        "taxAmount": number,
        "total": number,
        "terms": "string (optional)",
        "notes": "string (optional)"
      }

      Calculate amounts accurately. Use the provided user context as defaults when relevant.
      For dates: use current date (${currentDate}) if not specified, calculate due dates based on terms.
      Be forgiving with typos and different languages. Convert currencies to the user's preferred currency when possible.
      DO NOT generate fake email addresses - leave email fields empty if not provided by user.`
    } else {
      return `Generate NDA data as JSON from the user's natural language prompt.
      
      CURRENT DATE: ${currentDate} (use this as default for dates)
      ${contextInfo}
      
      Return ONLY a JSON object with this exact structure:
      {
        "type": "nda",
        "title": "string",
        "date": "YYYY-MM-DD format",
        "disclosingParty": {
          "name": "string",
          "title": "string (optional)",
          "company": "string (optional)"
        },
        "receivingParty": {
          "name": "string", 
          "title": "string (optional)",
          "company": "string (optional)"
        },
        "purpose": "string",
        "termMonths": number,
        "jurisdiction": "string",
        "mutualNda": boolean
      }

      Use today's date if not specified. Default to 12 months term.`
    }
  }

  async generateBatchDocuments(prompts: string[], documentType: DocumentType, userContext?: UserContext): Promise<any[]> {
    const systemPrompt = this.getBatchSystemPrompt(documentType, userContext)
    
    const batchPrompt = `Generate invoices for the following requests:

${prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}

Return a JSON object with an "invoices" array.`

    const fullPrompt = `${systemPrompt}\n\nUser request: ${batchPrompt}`
    
    const result = await this.model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('No response from Gemini')
    }

    // Clean the response text to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return Array.isArray(parsed) ? parsed : (parsed.invoices || [parsed])
  }

  private getBatchSystemPrompt(documentType: DocumentType, userContext?: UserContext): string {
    // Use the same system prompt as OpenAI for consistency
    const currentDate = new Date().toISOString().split('T')[0]
    const contextInfo = userContext ? `
    
    USER CONTEXT (use as defaults when relevant):
    - Company Name: ${userContext.companyName || 'Not provided'}
    - Company Address: ${userContext.companyAddress || 'Not provided'}
    - Company Email: ${userContext.companyEmail || 'Not provided'}
    - Company Phone: ${userContext.companyPhone || 'Not provided'}
    - Default Currency: ${userContext.defaultCurrency || 'USD'}
    - Default Tax Rate: ${(userContext.defaultTaxRate || 0.08) * 100}%
    - Default Terms: ${userContext.defaultTerms || 'Not provided'}
    - Jurisdiction: ${userContext.jurisdiction || 'Not provided'}
    ` : ''

    if (documentType === 'invoice') {
      return `You are an AI assistant that generates MULTIPLE invoice data objects. Return JSON with "invoices" array.
      
      CURRENT DATE: ${currentDate}
      ${contextInfo}
      
      Generate unique invoice numbers and process each request independently.
      Use company context for "from" fields consistently across all invoices.`
    }

    return 'You are a helpful assistant that generates multiple documents.'
  }
}

export function createLLMProvider(provider: 'openai' | 'gemini', apiKey: string): LLMProvider {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey)
    case 'gemini':
      return new GeminiProvider(apiKey)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
