/**
 * Utility functions for CSV template generation and download
 */

export interface CSVTemplateField {
  name: string
  description: string
  example: string
  required: boolean
}

export const INVOICE_CSV_TEMPLATE: CSVTemplateField[] = [
  {
    name: 'client_name',
    description: 'Client or company name',
    example: 'ACME Corporation',
    required: true
  },
  {
    name: 'client_email',
    description: 'Client email address',
    example: 'billing@acme.com',
    required: false
  },
  {
    name: 'client_address',
    description: 'Client billing address',
    example: '123 Business St, City, State 12345',
    required: false
  },
  {
    name: 'service_description',
    description: 'Description of work performed',
    example: 'Website design and development',
    required: true
  },
  {
    name: 'amount',
    description: 'Total amount (without currency symbol)',
    example: '2500.00',
    required: true
  },
  {
    name: 'hours',
    description: 'Number of hours worked (optional)',
    example: '40',
    required: false
  },
  {
    name: 'rate',
    description: 'Hourly rate (optional)',
    example: '75.00',
    required: false
  },
  {
    name: 'due_date',
    description: 'Payment due date (YYYY-MM-DD or relative like "30 days")',
    example: '2024-02-15',
    required: false
  },
  {
    name: 'invoice_number',
    description: 'Custom invoice number (auto-generated if empty)',
    example: 'INV-2024-001',
    required: false
  },
  {
    name: 'notes',
    description: 'Additional notes or terms',
    example: 'Payment due within 30 days',
    required: false
  }
]

/**
 * Generate CSV template content
 */
export function generateCSVTemplate(): string {
  const headers = INVOICE_CSV_TEMPLATE.map(field => field.name)
  const examples = INVOICE_CSV_TEMPLATE.map(field => field.example)
  
  return [
    headers.join(','),
    examples.join(','),
    // Add a few more example rows
    'Tech Solutions Inc,info@techsolutions.com,"456 Tech Ave, Silicon Valley, CA 94000",Mobile app development,5000.00,80,62.50,2024-03-01,INV-2024-002,Net 30 payment terms',
    'Design Studio LLC,contact@designstudio.com,"789 Creative Blvd, Austin, TX 78701",Logo and branding package,1200.00,20,60.00,2024-02-20,INV-2024-003,Includes 3 design revisions'
  ].join('\n')
}

/**
 * Download CSV template file
 */
export function downloadCSVTemplate(filename: string = 'invoice_template.csv'): void {
  const csvContent = generateCSVTemplate()
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Get template field descriptions for UI display
 */
export function getTemplateFieldDescriptions(): Array<{field: string, description: string, required: boolean}> {
  return INVOICE_CSV_TEMPLATE.map(field => ({
    field: field.name,
    description: field.description,
    required: field.required
  }))
}

/**
 * Validate CSV headers against template
 */
export function validateCSVHeaders(headers: string[]): {
  valid: boolean
  missingRequired: string[]
  suggestions: string[]
} {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  const requiredFields = INVOICE_CSV_TEMPLATE.filter(f => f.required).map(f => f.name)
  const missingRequired = requiredFields.filter(field => 
    !normalizedHeaders.includes(field) && 
    !normalizedHeaders.includes(field.replace('_', ' '))
  )
  
  // Suggest corrections for common typos
  const suggestions: string[] = []
  normalizedHeaders.forEach(header => {
    const match = INVOICE_CSV_TEMPLATE.find(field => 
      field.name.includes(header) || 
      header.includes(field.name.split('_')[0])
    )
    if (match && match.name !== header) {
      suggestions.push(`"${header}" might be "${match.name}"`)
    }
  })
  
  return {
    valid: missingRequired.length === 0,
    missingRequired,
    suggestions
  }
}
