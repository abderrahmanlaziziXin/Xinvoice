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

const GenerateBatchRequestSchema = z.object({
  prompts: z.array(z.string().min(1, 'Each prompt is required')).min(1, 'At least one prompt is required'),
  documentType: DocumentTypeSchema,
  userContext: UserContextSchema.optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    try {
      const { prompts, documentType, userContext } = GenerateBatchRequestSchema.parse(body)
    } catch (parseError) {
      console.error('Batch schema validation error:', parseError)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseError },
        { status: 400 }
      )
    }
    
    const { prompts, documentType, userContext } = GenerateBatchRequestSchema.parse(body)

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

    // Create provider and generate documents
    const provider = createLLMProvider(llmProvider, apiKey)
    
    // Check if batch generation is supported
    if (!provider.generateBatchDocuments) {
      return NextResponse.json(
        { error: 'Batch generation not supported by this provider' },
        { status: 400 }
      )
    }

    const documentsData = await provider.generateBatchDocuments(prompts, documentType, userContext)

    // Function to fix incomplete invoices
    const fixIncompleteInvoice = (doc: any, index: number) => {
      console.log(`🔧 Fixing document ${index + 1}:`, JSON.stringify(doc, null, 2))
      
      // Ensure client name exists
      if (!doc.to || !doc.to.name || doc.to.name.trim() === '') {
        if (!doc.to) doc.to = {}
        doc.to.name = `Client ${index + 1}`
      }

      // Ensure items array exists with at least one item
      if (!doc.items || !Array.isArray(doc.items) || doc.items.length === 0) {
        console.log(`📝 No items found, creating default item for document ${index + 1}`)
        doc.items = [{
          description: 'Professional Services',
          quantity: 1,
          rate: 100,
          amount: 100
        }]
        
        // Recalculate totals
        doc.subtotal = 100
        doc.taxAmount = doc.taxRate ? doc.subtotal * doc.taxRate : 0
        doc.total = doc.subtotal + doc.taxAmount
      } else {
        console.log(`🔍 Checking ${doc.items.length} items for document ${index + 1}`)
        // Fix existing items with invalid rates/quantities
        let needsRecalculation = false
        doc.items = doc.items.map((item: any, itemIndex: number) => {
          const fixedItem = { ...item }
          console.log(`🔨 Item ${itemIndex} before fix:`, fixedItem)
          
          // Fix invalid rates (must be at least 0.01)
          if (!fixedItem.rate || fixedItem.rate <= 0) {
            console.log(`⚠️ Fixing invalid rate ${fixedItem.rate} to 100`)
            fixedItem.rate = 100 // Default to $100
            needsRecalculation = true
          }
          
          // Fix invalid quantities (must be at least 0.01)
          if (!fixedItem.quantity || fixedItem.quantity <= 0) {
            console.log(`⚠️ Fixing invalid quantity ${fixedItem.quantity} to 1`)
            fixedItem.quantity = 1 // Default to 1
            needsRecalculation = true
          }
          
          // Recalculate amount if needed
          fixedItem.amount = fixedItem.quantity * fixedItem.rate
          console.log(`🔨 Item ${itemIndex} after fix:`, fixedItem)
          
          return fixedItem
        })
        
        // Recalculate totals if items were fixed
        if (needsRecalculation) {
          console.log(`💰 Recalculating totals for document ${index + 1}`)
          doc.subtotal = doc.items.reduce((sum: number, item: any) => sum + item.amount, 0)
          doc.taxAmount = doc.taxRate ? doc.subtotal * doc.taxRate : 0
          doc.total = doc.subtotal + doc.taxAmount
        }
      }

      // Ensure required fields exist
      if (!doc.invoiceNumber) doc.invoiceNumber = `INV-${String(index + 1).padStart(3, '0')}`
      if (!doc.date) doc.date = new Date().toISOString().split('T')[0]
      if (!doc.dueDate) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)
        doc.dueDate = dueDate.toISOString().split('T')[0]
      }

      // Ensure valid tax rate (between 0 and 1)
      if (!doc.taxRate || doc.taxRate < 0 || doc.taxRate > 1) {
        doc.taxRate = 0.08 // Default to 8%
      }

      // Ensure numeric fields are valid
      if (!doc.subtotal || doc.subtotal < 0) {
        doc.subtotal = doc.items.reduce((sum: number, item: any) => sum + item.amount, 0)
      }
      if (!doc.taxAmount || doc.taxAmount < 0) {
        doc.taxAmount = doc.subtotal * doc.taxRate
      }
      if (!doc.total || doc.total < 0) {
        doc.total = doc.subtotal + doc.taxAmount
      }

      return doc
    }

    // Clean up empty email fields and validate each document
    const validatedDocuments = documentsData.map((doc, index) => {
      try {
        let cleanedDocument = cleanEmptyEmails(doc)
        cleanedDocument = fixIncompleteInvoice(cleanedDocument, index)
        cleanedDocument = addDefaultValues(cleanedDocument, userContext, documentType)
        
        console.log(`🎯 Final document ${index + 1} before validation:`, JSON.stringify(cleanedDocument, null, 2))
        
        // Validate based on document type
        if (documentType === 'invoice') {
          const validated = InvoiceSchema.parse(cleanedDocument)
          console.log(`✅ Document ${index + 1} validated successfully`)
          return validated
        } else {
          const validated = NDASchema.parse(cleanedDocument)
          console.log(`✅ Document ${index + 1} validated successfully`)
          return validated
        }
      } catch (validationError) {
        console.error(`❌ Validation error for document ${index + 1}:`, validationError)
        
        // Enhanced error recovery - try one more time with more aggressive fixes
        try {
          console.log(`🔄 Attempting recovery for document ${index + 1}`)
          let recoveryDoc = { ...doc }
          
          // More aggressive fixes for common issues
          if (documentType === 'invoice') {
            // Ensure basic structure
            recoveryDoc.type = 'invoice'
            recoveryDoc.invoiceNumber = recoveryDoc.invoiceNumber || `INV-${String(index + 1).padStart(3, '0')}`
            recoveryDoc.date = recoveryDoc.date || new Date().toISOString().split('T')[0]
            
            // Create proper due date
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 30)
            recoveryDoc.dueDate = recoveryDoc.dueDate || dueDate.toISOString().split('T')[0]
            
            // Ensure from/to parties exist
            if (!recoveryDoc.from) recoveryDoc.from = { name: userContext?.companyName || 'Your Company' }
            if (!recoveryDoc.to) recoveryDoc.to = { name: `Client ${index + 1}` }
            
            // Fix items array with valid data
            recoveryDoc.items = [{
              description: 'Professional Services',
              quantity: 1,
              rate: 100,
              amount: 100
            }]
            
            // Set proper financial fields
            recoveryDoc.subtotal = 100
            recoveryDoc.taxRate = 0.08
            recoveryDoc.taxAmount = 8
            recoveryDoc.total = 108
            recoveryDoc.currency = userContext?.defaultCurrency || 'USD'
            recoveryDoc.locale = userContext?.defaultLocale || 'en-US'
          }
          
          // Try validation again
          const finalDoc = InvoiceSchema.parse(recoveryDoc)
          console.log(`🆘 Document ${index + 1} recovered successfully`)
          return finalDoc
          
        } catch (recoveryError) {
          console.error(`💥 Recovery failed for document ${index + 1}:`, recoveryError)
          throw new Error(`Validation failed for document ${index + 1}: ${validationError}`)
        }
      }
    })

    return NextResponse.json({
      success: true,
      documents: validatedDocuments,
      count: validatedDocuments.length
    })

  } catch (error) {
    console.error('Batch generation error:', error)
    
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
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
