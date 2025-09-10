import { z } from 'zod'

// Currency and locale schemas
export const CurrencySchema = z.enum([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
  'PLN', 'CZK', 'HUF', 'RUB', 'CNY', 'INR', 'BRL', 'MXN', 'ZAR', 'DZD',
  'MAD', 'TND', 'EGP', 'NGN', 'KES', 'GHS', 'XOF', 'XAF', 'SAR'
])

export const LocaleSchema = z.enum([
  'en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'fr-CA', 'de-DE', 'es-ES',
  'it-IT', 'pt-BR', 'pt-PT', 'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
  'pl-PL', 'cs-CZ', 'hu-HU', 'ru-RU', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA',
  'ar-AE', 'ar-EG', 'ar-DZ', 'ar-MA', 'ar-TN', 'hi-IN', 'th-TH', 'vi-VN'
])

// Base document schema
export const DocumentTypeSchema = z.enum(['invoice', 'nda'])

// User context schema for saving company details
export const UserContextSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyEmail: z.preprocess(val => val === '' ? undefined : val, z.string().email().optional()),
  companyPhone: z.string().optional(),
  defaultCurrency: CurrencySchema.default('USD'),
  defaultLocale: LocaleSchema.default('en-US'),
  defaultTaxRate: z.number().min(0).max(1).default(0.08),
  defaultTerms: z.string().optional(),
  jurisdiction: z.string().optional(),
  logoUrl: z.preprocess(val => val === '' ? undefined : val, z.string().url().optional()),
  website: z.preprocess(val => val === '' ? undefined : val, z.string().url().optional()),
  taxNumber: z.string().optional(),
  bankDetails: z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swift: z.string().optional()
  }).optional(),
  // Multilingual support properties
  languageInstruction: z.string().optional(),
  outputLanguage: LocaleSchema.optional(),
  culturalContext: z.string().optional()
})

// Invoice schemas
export const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  rate: z.number().min(0.01, 'Rate must be positive'),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0).optional(),
  category: z.string().optional()
})

export const InvoicePartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional()
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
  currency: CurrencySchema,
  locale: LocaleSchema,
  terms: z.string().optional(),
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
  paymentMethods: z.array(z.string()).optional(),
  discountAmount: z.number().default(0).optional(),
  shippingAmount: z.number().default(0).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft').optional()
})

// Enhanced NDA schemas for rich document support
export const NDAPartySchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  type: z.string().optional()
}).passthrough()

export const NDASectionSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  content: z.string().optional(),
  subsections: z.array(z.object({
    title: z.string(),
    content: z.string()
  })).optional()
}).passthrough()

export const NDASchema = z.object({
  type: z.literal('nda').optional(),
  title: z.string().optional(),
  effectiveDate: z.string().optional(),
  terminationDate: z.string().optional(),
  disclosingParty: NDAPartySchema.optional(),
  receivingParty: NDAPartySchema.optional(),
  purpose: z.string().optional(),
  termMonths: z.number().optional(),
  jurisdiction: z.string().optional(),
  mutualNda: z.boolean().default(false).optional(),
  sections: z.array(NDASectionSchema).optional(),
  governingLaw: z.string().optional(),
  currency: CurrencySchema.default('USD').optional(),
  locale: LocaleSchema.default('en-US').optional(),
  // Additional fields for enhanced documents
  confidentialityLevel: z.enum(['standard', 'high', 'critical']).default('standard').optional(),
  penalties: z.string().optional(),
  exceptions: z.array(z.string()).optional(),
  returnOfMaterials: z.boolean().default(true).optional(),
  survivingClauses: z.array(z.string()).optional(),
  // Allow any additional fields the AI might provide
  parties: z.object({
    disclosing_party: z.string().optional(),
    receiving_party: z.string().optional()
  }).optional(),
  definitions: z.string().optional(),
  confidentialityObligations: z.string().optional(),
  exclusions: z.string().optional(),
  termClause: z.string().optional(),
  governingLawClause: z.string().optional(),
  additionalTerms: z.string().optional(),
  specialProvisions: z.string().optional()
}).passthrough() // Allow any additional fields

// Union type for all documents
export const DocumentSchema = z.discriminatedUnion('type', [
  InvoiceSchema,
  NDASchema
])

// Type exports
export type DocumentType = z.infer<typeof DocumentTypeSchema>
export type Currency = z.infer<typeof CurrencySchema>
export type Locale = z.infer<typeof LocaleSchema>
export type UserContext = z.infer<typeof UserContextSchema>
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>
export type InvoiceParty = z.infer<typeof InvoicePartySchema>
export type Invoice = z.infer<typeof InvoiceSchema>
export type NDAParty = z.infer<typeof NDAPartySchema>
export type NDASection = z.infer<typeof NDASectionSchema>
export type NDA = z.infer<typeof NDASchema>
export type Document = z.infer<typeof DocumentSchema>
