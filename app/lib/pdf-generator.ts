import jsPDF from 'jspdf'
import autoTable, { UserOptions } from 'jspdf-autotable'
import { Invoice } from '../../packages/core'
import { formatCurrency, formatDate, formatNumber } from './currency'
import { downloadEnhancedInvoicePDF, previewEnhancedInvoicePDF } from './pdf-generator-enhanced'
import JSZip from 'jszip'

// Constants for better maintainability
const PDF_CONSTANTS = {
  MARGIN: 20,
  FONTS: {
    PRIMARY: 'helvetica',
    SECONDARY: 'times'
  },
  COLORS: {
    PRIMARY: '#2563eb',
    GRAY: '#6b7280',
    LIGHT_GRAY: '#f3f4f6',
    DARK: '#456bb3ff'
  },
  FONT_SIZES: {
    TITLE: 28,
    SUBTITLE: 18,
    HEADING: 14,
    BODY: 12,
    SMALL: 10,
    TINY: 8
  }
} as const

type TemplateType = 'modern' | 'classic' | 'minimal'

interface PDFGenerationOptions {
  includeWatermark?: boolean
  customTemplate?: TemplateType
  accentColor?: string
}

/**
 * Professional PDF generator for invoices with multiple templates
 * Supports modern, classic, and minimal design patterns
 */
export class InvoicePDFGenerator {
  private pdf: jsPDF
  private options: Required<PDFGenerationOptions>
  
  constructor(options: PDFGenerationOptions = {}) {
    this.pdf = new jsPDF()
    this.options = {
      includeWatermark: false,
      customTemplate: 'modern',
      accentColor: PDF_CONSTANTS.COLORS.PRIMARY,
      ...options
    }
  }

  /**
   * Generate invoice PDF with error handling and validation
   */
  generateInvoicePDF(invoice: Invoice): string {
    try {
      this.validateInvoice(invoice)
      
      // Reset PDF for new invoice
      this.pdf = new jsPDF()
      
      switch (this.options.customTemplate) {
        case 'modern':
          this.generateModernTemplate(invoice)
          break
        case 'classic':
          this.generateClassicTemplate(invoice)
          break
        case 'minimal':
          this.generateMinimalTemplate(invoice)
          break
        default:
          this.generateModernTemplate(invoice)
      }

      // Add watermark if requested
      if (this.options.includeWatermark) {
        this.addWatermark()
      }

      // Generate PDF with proper error handling
      let dataUri: string
      try {
        dataUri = this.pdf.output('datauristring')
      } catch (outputError) {
        console.error('PDF output generation failed:', outputError)
        throw new Error('Failed to generate PDF output')
      }
      
      // Validate output format with detailed checking
      if (!dataUri) {
        throw new Error('PDF generation returned empty result')
      }
      
      if (!dataUri.startsWith('data:application/pdf;base64,')) {
        console.warn('PDF data URI format unexpected:', dataUri.substring(0, 50))
        // Still return it as some browsers might handle it differently
        if (!dataUri.startsWith('data:')) {
          throw new Error('Generated PDF data is not a valid data URI')
        }
      }

      return dataUri
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Validate invoice data before PDF generation
   */
  private validateInvoice(invoice: Invoice): void {
    if (!invoice) {
      throw new Error('Invoice data is required')
    }
    
    // Just fix missing fields - don't throw errors
    if (!invoice.invoiceNumber) {
      invoice.invoiceNumber = `INV-${Date.now()}`
    }
    
    if (!invoice.items || invoice.items.length === 0) {
      invoice.items = [{ description: 'Service', quantity: 1, rate: 0, amount: 0 }]
    }
    
    // Ensure we have basic from/to information
    if (!invoice.from) {
      invoice.from = { name: 'Your Company', address: '', email: '', phone: '' }
    }
    if (!invoice.to) {
      invoice.to = { name: 'Client', address: '', email: '', phone: '' }
    }
    if (!invoice.from.name) {
      invoice.from.name = 'Your Company'
    }
    if (!invoice.to.name) {
      invoice.to.name = 'Client'
    }

    // Ensure basic calculations
    if (!invoice.currency) {
      invoice.currency = 'USD'
    }
    if (invoice.subtotal === undefined) {
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + ((item.amount || 0)), 0)
    }
    if (invoice.taxRate === undefined) {
      invoice.taxRate = 0
    }
    if (invoice.taxAmount === undefined) {
      invoice.taxAmount = invoice.subtotal * invoice.taxRate
    }
    if (invoice.total === undefined) {
      invoice.total = invoice.subtotal + invoice.taxAmount
    }
  }

  private generateModernTemplate(invoice: Invoice) {
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    let currentY = margin

    // Header with accent color
    const [r, g, b] = this.hexToRgb(this.options.accentColor!)
    this.pdf.setFillColor(r, g, b)
    this.pdf.rect(0, 0, pageWidth, 40, 'F')
    
    // Company name in white
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(invoice.from.name || 'Invoice', margin, 25)
    
    // Invoice number in top right
    this.pdf.setFontSize(16)
    this.pdf.text(`Invoice #${invoice.invoiceNumber}`, pageWidth - margin - 50, 25)
    
    currentY = 60
    
    // Reset text color
    this.pdf.setTextColor(0, 0, 0)
    
    // Invoice details section
    this.addInvoiceDetailsSection(invoice, currentY)
    currentY += 40
    
    // Parties section (From/To)
    this.addPartiesSection(invoice, currentY)
    currentY += 70
    
    // Items table
    currentY = this.addItemsTable(invoice, currentY)
    
    // Totals section
    this.addTotalsSection(invoice, currentY)
    
    // Footer
    this.addFooter(invoice)
  }

  private generateClassicTemplate(invoice: Invoice) {
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    let currentY = margin

    // Classic header
    this.pdf.setFontSize(28)
    this.pdf.setFont('times', 'bold')
    this.pdf.text('INVOICE', pageWidth / 2, currentY, { align: 'center' })
    
    currentY += 20
    
    // Decorative line
    this.pdf.setLineWidth(1)
    this.pdf.line(margin, currentY, pageWidth - margin, currentY)
    
    currentY += 20
    
    // Company info centered
    this.pdf.setFontSize(18)
    this.pdf.setFont('times', 'bold')
    this.pdf.text(invoice.from.name || 'Company Name', pageWidth / 2, currentY, { align: 'center' })
    
    currentY += 10
    
    if (invoice.from.address) {
      this.pdf.setFontSize(12)
      this.pdf.setFont('times', 'normal')
      this.pdf.text(invoice.from.address, pageWidth / 2, currentY, { align: 'center' })
      currentY += 8
    }
    
    if (invoice.from.email) {
      this.pdf.text(invoice.from.email, pageWidth / 2, currentY, { align: 'center' })
      currentY += 8
    }
    
    if (invoice.from.phone) {
      this.pdf.text(invoice.from.phone, pageWidth / 2, currentY, { align: 'center' })
    }
    
    currentY += 30
    
    // Invoice details
    this.addInvoiceDetailsSection(invoice, currentY)
    currentY += 40
    
    // Bill to section
    this.addPartiesSection(invoice, currentY)
    currentY += 70
    
    // Items table
    currentY = this.addItemsTable(invoice, currentY)
    
    // Totals
    this.addTotalsSection(invoice, currentY)
    
    // Classic footer
    this.addFooter(invoice)
  }

  private generateMinimalTemplate(invoice: Invoice) {
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    let currentY = margin

    // Minimal header
    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(invoice.from.name || 'Invoice', margin, currentY)
    
    this.pdf.setFontSize(14)
    this.pdf.text(`#${invoice.invoiceNumber}`, pageWidth - margin - 30, currentY)
    
    currentY += 30
    
    // Single line separator
    this.pdf.setLineWidth(0.5)
    this.pdf.line(margin, currentY, pageWidth - margin, currentY)
    
    currentY += 20
    
    // Minimal details
    this.pdf.setFontSize(10)
    this.pdf.text(`Date: ${invoice.date}`, margin, currentY)
    this.pdf.text(`Due: ${invoice.dueDate}`, margin + 60, currentY)
    
    currentY += 30
    
    // Simple parties info
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Bill To:', margin, currentY)
    
    currentY += 10
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(invoice.to.name, margin, currentY)
    
    if (invoice.to.address) {
      currentY += 8
      this.pdf.text(invoice.to.address, margin, currentY)
    }
    
    currentY += 30
    
    // Items table
    currentY = this.addItemsTable(invoice, currentY, true) // minimal style
    
    // Simple totals
    this.addTotalsSection(invoice, currentY, true)
  }

  private addInvoiceDetailsSection(invoice: Invoice, startY: number) {
    const margin = 20
    
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    
    // Invoice details in two columns
    this.pdf.text('Invoice Date:', margin, startY)
    this.pdf.text('Due Date:', margin + 100, startY)
    
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(formatDate(invoice.date, invoice.locale || 'en-US'), margin, startY + 10)
    this.pdf.text(formatDate(invoice.dueDate, invoice.locale || 'en-US'), margin + 100, startY + 10)
  }

  private addPartiesSection(invoice: Invoice, startY: number) {
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    const columnWidth = (pageWidth - 3 * margin) / 2
    
    // From section
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('From:', margin, startY)
    
    let fromY = startY + 10
    this.pdf.setFont('helvetica', 'normal')
    
    if (invoice.from.name) {
      this.pdf.text(invoice.from.name, margin, fromY)
      fromY += 8
    }
    
    if (invoice.from.address) {
      const addressLines = this.pdf.splitTextToSize(invoice.from.address, columnWidth)
      this.pdf.text(addressLines, margin, fromY)
      fromY += addressLines.length * 6
    }
    
    if (invoice.from.email) {
      this.pdf.text(invoice.from.email, margin, fromY)
      fromY += 8
    }
    
    if (invoice.from.phone) {
      this.pdf.text(invoice.from.phone, margin, fromY)
    }
    
    // To section
    const toX = margin + columnWidth + margin
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Bill To:', toX, startY)
    
    let toY = startY + 10
    this.pdf.setFont('helvetica', 'normal')
    
    if (invoice.to.name) {
      this.pdf.text(invoice.to.name, toX, toY)
      toY += 8
    }
    
    if (invoice.to.address) {
      const addressLines = this.pdf.splitTextToSize(invoice.to.address, columnWidth)
      this.pdf.text(addressLines, toX, toY)
      toY += addressLines.length * 6
    }
    
    if (invoice.to.email) {
      this.pdf.text(invoice.to.email, toX, toY)
      toY += 8
    }
    
    if (invoice.to.phone) {
      this.pdf.text(invoice.to.phone, toX, toY)
    }
  }

  private addItemsTable(invoice: Invoice, startY: number, minimal: boolean = false): number {
    const margin = 20
    
    // Prepare table data with proper currency formatting
    const tableData = invoice.items.map(item => [
      item.description,
      formatNumber(item.quantity, invoice.locale || 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
      formatCurrency(item.rate, invoice.currency || 'USD', invoice.locale || 'en-US'),
      formatCurrency(item.amount, invoice.currency || 'USD', invoice.locale || 'en-US')
    ])
    
    const tableConfig: UserOptions = {
      startY: startY,
      head: [['Description', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: minimal ? 'plain' : 'striped',
      headStyles: {
        fillColor: minimal ? [255, 255, 255] : this.hexToRgb(this.options.accentColor!),
        textColor: minimal ? [0, 0, 0] : [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 12
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Description
        1: { cellWidth: 20, halign: 'center' }, // Quantity
        2: { cellWidth: 30, halign: 'right' }, // Rate
        3: { cellWidth: 30, halign: 'right' } // Amount
      }
    }
    
    autoTable(this.pdf, tableConfig)
    
    // Return the Y position after the table
    return (this.pdf as any).lastAutoTable.finalY + 20
  }

  private addTotalsSection(invoice: Invoice, startY: number, minimal: boolean = false) {
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    const totalsX = pageWidth - margin - 80
    
    let currentY = startY
    
    this.pdf.setFontSize(11)
    
    // Subtotal
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('Subtotal:', totalsX, currentY)
    this.pdf.text(formatCurrency(invoice.subtotal, invoice.currency || 'USD', invoice.locale || 'en-US'), totalsX + 50, currentY, { align: 'right' })
    currentY += 12
    
    // Tax (if applicable)
    if (invoice.taxRate > 0) {
      this.pdf.text(`Tax (${(invoice.taxRate * 100).toFixed(1)}%):`, totalsX, currentY)
      this.pdf.text(formatCurrency(invoice.taxAmount, invoice.currency || 'USD', invoice.locale || 'en-US'), totalsX + 50, currentY, { align: 'right' })
      currentY += 12
    }
    
    // Total line
    if (!minimal) {
      this.pdf.setLineWidth(0.5)
      this.pdf.line(totalsX, currentY, totalsX + 50, currentY)
      currentY += 8
    }
    
    // Final total
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(13)
    this.pdf.text('Total:', totalsX, currentY)
    this.pdf.text(formatCurrency(invoice.total, invoice.currency || 'USD', invoice.locale || 'en-US'), totalsX + 50, currentY, { align: 'right' })
  }

  private addFooter(invoice: Invoice) {
    const pageHeight = this.pdf.internal.pageSize.height
    const pageWidth = this.pdf.internal.pageSize.width
    const margin = 20
    
    let footerY = pageHeight - 40
    
    // Terms and notes
    if (invoice.terms) {
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Payment Terms:', margin, footerY)
      footerY += 8
      
      this.pdf.setFont('helvetica', 'normal')
      const termsLines = this.pdf.splitTextToSize(invoice.terms, pageWidth - 2 * margin)
      this.pdf.text(termsLines, margin, footerY)
      footerY += termsLines.length * 6 + 10
    }
    
    if (invoice.notes) {
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Notes:', margin, footerY)
      footerY += 8
      
      this.pdf.setFont('helvetica', 'normal')
      const notesLines = this.pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
      this.pdf.text(notesLines, margin, footerY)
    }
    
    // Page footer
    this.pdf.setFontSize(8)
    this.pdf.setTextColor(128, 128, 128)
    this.pdf.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  private addWatermark() {
    const pageWidth = this.pdf.internal.pageSize.width
    const pageHeight = this.pdf.internal.pageSize.height
    
    this.pdf.setTextColor(200, 200, 200)
    this.pdf.setFontSize(50)
    this.pdf.text(
      'DRAFT',
      pageWidth / 2,
      pageHeight / 2,
      { 
        align: 'center',
        angle: 45
      }
    )
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [37, 99, 235] // Default blue
  }

  // Method to download PDF directly
  downloadPDF(invoice: Invoice, filename?: string) {
    this.generateInvoicePDF(invoice)
    const fileName = filename || `invoice-${invoice.invoiceNumber}.pdf`
    this.pdf.save(fileName)
  }

  // Method to get PDF as blob for bulk operations
  getPDFBlob(invoice: Invoice): Blob {
    this.generateInvoicePDF(invoice)
    return this.pdf.output('blob')
  }
}

// Utility function for bulk PDF download (individual files)
export function downloadMultiplePDFs(invoices: Invoice[], zipName: string = 'invoices') {
  // Use the enhanced PDF generator function that we've already fixed
  invoices.forEach((invoice, index) => {
    setTimeout(() => {
      downloadEnhancedInvoicePDF(
        invoice, 
        `${zipName}-${invoice.invoiceNumber}.pdf`,
        {
          theme: 'primary', // Use primary theme with your brand colors
          includeWatermark: false,
          customTemplate: 'modern'
        }
      )
    }, index * 500) // Stagger downloads to avoid browser blocking
  })
}

// Enhanced bulk download as single ZIP file
export async function downloadMultiplePDFsAsZip(invoices: Invoice[], zipName: string = 'invoices') {
  const zip = new JSZip()
  
  // Generate all PDFs and add to ZIP
  for (const invoice of invoices) {
    const { EnhancedInvoicePDFGenerator } = await import('./pdf-generator-enhanced')
    const generator = new EnhancedInvoicePDFGenerator({
      theme: 'primary', // Use primary theme with your brand colors
      includeWatermark: false,
      customTemplate: 'modern'
    })
    
    const pdfDataUri = generator.generateInvoicePDF(invoice)
    const base64Data = pdfDataUri.split(',')[1]
    const binaryData = atob(base64Data)
    const bytes = new Uint8Array(binaryData.length)
    
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    
    zip.file(`invoice-${invoice.invoiceNumber}.pdf`, bytes)
  }
  
  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${zipName}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Preview function for displaying PDF in modal
export function previewInvoicePDF(invoice: Invoice, options?: PDFGenerationOptions): string {
  // Use the enhanced preview function that we've already fixed
  return previewEnhancedInvoicePDF(invoice, {
    theme: 'primary', // Use primary theme with your brand colors
    includeWatermark: false,
    customTemplate: 'modern',
    ...options
  })
}
