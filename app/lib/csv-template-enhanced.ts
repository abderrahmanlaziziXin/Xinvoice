/**
 * Enhanced CSV template system for multi-line item support
 * Supports both simple and complex invoice structures
 */

import { InvoiceItem } from '../../packages/core'

export interface CSVTemplateField {
  field: string
  description: string
  example: string
  required: boolean
  pattern?: RegExp
}

export interface CSVTemplate {
  name: string
  description: string
  fields: CSVTemplateField[]
  example: string[][]
}

/**
 * Define supported CSV templates
 */
export const CSV_TEMPLATES: CSVTemplate[] = [
  {
    name: 'Simple Invoice',
    description: 'One row per invoice with single line item',
    fields: [
      { field: 'client_name', description: 'Client or customer name', example: 'Acme Corp', required: true },
      { field: 'service_description', description: 'Service or product description', example: 'Web Development', required: true },
      { field: 'amount', description: 'Invoice amount', example: '1500.00', required: true },
      { field: 'quantity', description: 'Quantity (optional)', example: '1', required: false },
      { field: 'rate', description: 'Hourly rate (optional)', example: '75.00', required: false },
      { field: 'hours', description: 'Hours worked (optional)', example: '20', required: false },
      { field: 'client_email', description: 'Client email (optional)', example: 'contact@acme.com', required: false },
      { field: 'due_date', description: 'Payment due date (optional)', example: '2025-10-06', required: false }
    ],
    example: [
      ['client_name', 'service_description', 'amount', 'client_email'],
      ['Acme Corp', 'Web Development', '1500.00', 'contact@acme.com'],
      ['Beta LLC', 'Consulting', '2000.00', 'billing@beta.com']
    ]
  },
  {
    name: 'Multi-Item Invoice',
    description: 'Multiple line items per invoice using item prefixes',
    fields: [
      { field: 'invoice_number', description: 'Invoice number (optional)', example: 'INV-001', required: false },
      { field: 'client_name', description: 'Client name', example: 'Acme Corp', required: true },
      { field: 'client_email', description: 'Client email', example: 'contact@acme.com', required: false },
      { field: 'item1_description', description: 'First item description', example: 'Web Development', required: true },
      { field: 'item1_quantity', description: 'First item quantity', example: '20', required: false },
      { field: 'item1_rate', description: 'First item rate', example: '75.00', required: false },
      { field: 'item1_amount', description: 'First item total', example: '1500.00', required: false },
      { field: 'item2_description', description: 'Second item description', example: 'Hosting Setup', required: false },
      { field: 'item2_quantity', description: 'Second item quantity', example: '1', required: false },
      { field: 'item2_rate', description: 'Second item rate', example: '200.00', required: false },
      { field: 'item2_amount', description: 'Second item total', example: '200.00', required: false }
    ],
    example: [
      ['client_name', 'item1_description', 'item1_quantity', 'item1_rate', 'item2_description', 'item2_rate'],
      ['Acme Corp', 'Web Development', '20', '75.00', 'Hosting Setup', '200.00'],
      ['Beta LLC', 'Consulting', '10', '100.00', 'Training', '500.00']
    ]
  }
]

/**
 * Parse multi-item data from CSV row
 */
export function parseMultiItemRow(row: any): {
  clientInfo: { name: string; email?: string; address?: string }
  items: InvoiceItem[]
  metadata: { invoiceNumber?: string; projectName?: string; dueDate?: string }
} {
  const clientInfo = {
    name: row.client_name || row.customer_name || row.name || 'Unknown Client',
    email: row.client_email || row.customer_email || row.email,
    address: row.client_address || row.customer_address || row.address
  }

  const metadata = {
    invoiceNumber: row.invoice_number || row.invoice_id,
    projectName: row.project_name || row.project,
    dueDate: row.due_date || row.payment_due
  }

  const items: InvoiceItem[] = []

  // Parse simple single item format
  if (row.service_description || row.description || row.item_description) {
    const description = row.service_description || row.description || row.item_description
    const quantity = parseFloat(row.quantity || row.hours || '1') || 1
    const rate = parseFloat(row.rate || row.price || row.amount || '0') || 0
    const amount = parseFloat(row.amount || '0') || (quantity * rate)

    items.push({
      description,
      quantity,
      rate,
      amount,
      taxRate: 0
    })
  }

  // Parse multi-item format (item1_, item2_, etc.)
  for (let i = 1; i <= 10; i++) {
    const itemDesc = row[`item${i}_description`] || row[`task${i}_name`]
    if (itemDesc) {
      const quantity = parseFloat(row[`item${i}_quantity`] || row[`task${i}_hours`] || '1') || 1
      const rate = parseFloat(row[`item${i}_rate`] || row[`task${i}_rate`] || '0') || 0
      const amount = parseFloat(row[`item${i}_amount`]) || (quantity * rate)

      items.push({
        description: itemDesc,
        quantity,
        rate,
        amount,
        taxRate: 0
      })
    }
  }

  // If no items found, create a default item
  if (items.length === 0) {
    const amount = parseFloat(row.total || row.amount || row.project_total || '100') || 100
    items.push({
      description: metadata.projectName || 'Professional Services',
      quantity: 1,
      rate: amount,
      amount: amount,
      taxRate: 0
    })
  }

  return { clientInfo, items, metadata }
}

/**
 * Generate enhanced prompt for multi-item invoices
 */
export function generateMultiItemPrompt(rowData: any, index: number, userContext?: any): string {
  const { clientInfo, items, metadata } = parseMultiItemRow(rowData)

  const contextInfo = userContext ? `
COMPANY CONTEXT:
- Company: ${userContext.companyName || 'Your Company'}
- Email: ${userContext.companyEmail || 'your@company.com'}
- Currency: ${userContext.defaultCurrency || 'USD'}
- Tax Rate: ${(userContext.defaultTaxRate || 0) * 100}%
` : ''

  const prompt = `Generate a complete, professional invoice with the following details:

${contextInfo}

CLIENT INFORMATION:
- Name: ${clientInfo.name}
${clientInfo.email ? `- Email: ${clientInfo.email}` : ''}
${clientInfo.address ? `- Address: ${clientInfo.address}` : ''}

INVOICE DETAILS:
${metadata.invoiceNumber ? `- Invoice Number: ${metadata.invoiceNumber}` : `- Invoice Number: INV-${String(index + 1).padStart(3, '0')}`}
${metadata.projectName ? `- Project: ${metadata.projectName}` : ''}
- Issue Date: ${new Date().toISOString().split('T')[0]}
${metadata.dueDate ? `- Due Date: ${metadata.dueDate}` : '- Due Date: 30 days from issue date'}

LINE ITEMS:
${items.map((item, idx) => `${idx + 1}. ${item.description}
   - Quantity: ${item.quantity}
   - Rate: $${item.rate.toFixed(2)}
   - Amount: $${item.amount.toFixed(2)}`).join('\n')}

REQUIREMENTS:
- Include ALL line items specified above
- Calculate proper subtotal, tax, and total amounts
- Ensure all required fields are present and valid
- Use professional formatting and language
- Include payment terms and instructions

Create a complete, valid invoice structure with all necessary fields populated.`

  return prompt
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(templateName: string = 'Simple Invoice') {
  const template = CSV_TEMPLATES.find(t => t.name === templateName) || CSV_TEMPLATES[0]
  
  const csvContent = template.example.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${templateName.replace(/\s+/g, '_').toLowerCase()}_template.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Get template field descriptions for UI
 */
export function getTemplateFieldDescriptions(templateName: string = 'Simple Invoice'): CSVTemplateField[] {
  const template = CSV_TEMPLATES.find(t => t.name === templateName) || CSV_TEMPLATES[0]
  return template.fields
}

/**
 * Detect CSV template type from headers
 */
export function detectTemplateType(headers: string[]): string {
  const lowerHeaders = headers.map(h => h.toLowerCase())
  
  // Check for multi-item patterns
  if (lowerHeaders.some(h => h.includes('item1_') || h.includes('task1_'))) {
    return 'Multi-Item Invoice'
  }
  
  // Check for project patterns
  if (lowerHeaders.some(h => h.includes('project') || h.includes('task'))) {
    return 'Project-Based Invoice'
  }
  
  // Default to simple
  return 'Simple Invoice'
}
