import { z } from 'zod'

// Base document schema
export const DocumentTypeSchema = z.enum(['invoice', 'nda'])

// User context schema for saving company details
export const UserContextSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().optional(),
  defaultCurrency: z.string().default('USD'),
  defaultTaxRate: z.number().min(0).max(1).default(0.08),
  defaultTerms: z.string().optional(),
  jurisdiction: z.string().optional()
})

// Invoice schemas
export const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  rate: z.number().min(0.01, 'Rate must be positive'),
  amount: z.number()
})

export const InvoicePartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional()
})

export const InvoiceSchema = z.object({
  type: z.literal('invoice'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  from: InvoicePartySchema,
  to: InvoicePartySchema,
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number(),
  total: z.number(),
  terms: z.string().optional(),
  notes: z.string().optional()
})

// NDA schemas (basic for now)
export const NDAPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  company: z.string().optional()
})

export const NDASchema = z.object({
  type: z.literal('nda'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  disclosingParty: NDAPartySchema,
  receivingParty: NDAPartySchema,
  purpose: z.string().min(1, 'Purpose is required'),
  termMonths: z.number().min(1, 'Term must be at least 1 month'),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  mutualNda: z.boolean().default(false)
})

// Union type for all documents
export const DocumentSchema = z.discriminatedUnion('type', [
  InvoiceSchema,
  NDASchema
])

// Type exports
export type DocumentType = z.infer<typeof DocumentTypeSchema>
export type UserContext = z.infer<typeof UserContextSchema>
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>
export type InvoiceParty = z.infer<typeof InvoicePartySchema>
export type Invoice = z.infer<typeof InvoiceSchema>
export type NDAParty = z.infer<typeof NDAPartySchema>
export type NDA = z.infer<typeof NDASchema>
export type Document = z.infer<typeof DocumentSchema>
