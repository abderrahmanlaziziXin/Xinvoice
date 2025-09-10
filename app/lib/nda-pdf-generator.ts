import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface NDAFormData {
  // Flexible structure - accept whatever AI provides
  disclosingParty?: {
    name?: string
    address?: string
    email?: string
    phone?: string
    type?: string
  }
  receivingParty?: {
    name?: string
    address?: string
    email?: string
    phone?: string
    type?: string
  }
  parties?: {
    disclosing_party?: string
    receiving_party?: string
  }
  title?: string
  effectiveDate?: string
  terminationDate?: string
  governingLaw?: string
  jurisdiction?: string
  confidentialityLevel?: string
  purpose?: string
  definitions?: string
  confidentialityObligations?: string
  exclusions?: string
  termClause?: string
  governingLawClause?: string
  additionalTerms?: string
  specialProvisions?: string
  sections?: Array<{
    title: string
    body: string
  }>
  // Accept any other fields AI might provide
  [key: string]: any
}

export type NDATemplate = 'legal' | 'modern' | 'minimal'

// Xinfinity Brand Colors
const XINFINITY_PRIMARY = '#1e40af'  // Blue
const XINFINITY_SECONDARY = '#06b6d4' // Cyan
const XINFINITY_ACCENT = '#8b5cf6'    // Purple

export class NDAPDFGenerator {
  private doc: jsPDF
  private data: NDAFormData
  private template: NDATemplate
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number

  constructor(data: NDAFormData, template: NDATemplate = 'legal') {
    this.data = data
    this.template = template
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  generate(): jsPDF {
    this.addHeader()
    this.addParties()
    this.addRecitals()
    this.currentY = this.addTerms()
    this.addSignatures()
    
    return this.doc
  }

  private addHeader(): void {
    const centerX = this.pageWidth / 2
    let currentY = this.margin

    // Use AI provided title or default
    const title = this.data.title || 'Non-Disclosure Agreement'
    const effectiveDate = this.data.effectiveDate || new Date().toISOString().split('T')[0]

    if (this.template === 'legal') {
      // Traditional legal document header
      this.doc.setFontSize(16)
      this.doc.setFont('times', 'bold')
      this.doc.text(title.toUpperCase(), centerX, currentY, { align: 'center' })
      
      currentY += 20
      this.doc.setFontSize(12)
      this.doc.setFont('times', 'normal')
      this.doc.text(`Effective Date: ${this.formatDate(effectiveDate)}`, centerX, currentY, { align: 'center' })
    } else if (this.template === 'modern') {
      // Modern header with Xinfinity brand colors
      this.doc.setFillColor(6, 182, 212) // Xinfinity Cyan
      this.doc.rect(0, 0, this.pageWidth, 30, 'F')
      
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFontSize(18)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(title.toUpperCase(), centerX, 20, { align: 'center' })
      
      this.doc.setTextColor(0, 0, 0)
      currentY = 45
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Effective Date: ${this.formatDate(effectiveDate)}`, centerX, currentY, { align: 'center' })
    } else {
      // Minimal header
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(30, 64, 175) // Xinfinity Primary Blue
      this.doc.text(title, centerX, currentY, { align: 'center' })
      
      this.doc.setTextColor(0, 0, 0) // Reset to black
      currentY += 15
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Effective: ${this.formatDate(effectiveDate)}`, centerX, currentY, { align: 'center' })
    }
  }

  private addParties(): void {
    let currentY = this.template === 'modern' ? 70 : 60

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PARTIES', this.margin, currentY)
    
    currentY += 15
    this.doc.setFont('helvetica', 'normal')
    
    // Handle both structures - use whatever AI provides
    const disclosingParty = this.data.disclosingParty || { 
      name: this.data.parties?.disclosing_party || 'Disclosing Party',
      address: '',
      type: ''
    }
    
    const receivingParty = this.data.receivingParty || { 
      name: this.data.parties?.receiving_party || 'Receiving Party',
      address: '',
      type: ''
    }
    
    // Disclosing Party
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Disclosing Party:', this.margin, currentY)
    this.doc.setFont('helvetica', 'normal')
    currentY += 8
    
    if (disclosingParty.name) {
      this.doc.text(`Name: ${disclosingParty.name}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (disclosingParty.type) {
      this.doc.text(`Type: ${this.capitalizeFirst(disclosingParty.type)}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (disclosingParty.address) {
      this.doc.text(`Address: ${disclosingParty.address}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (disclosingParty.email) {
      this.doc.text(`Email: ${disclosingParty.email}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (disclosingParty.phone) {
      this.doc.text(`Phone: ${disclosingParty.phone}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    currentY += 10
    
    // Receiving Party
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Receiving Party:', this.margin, currentY)
    this.doc.setFont('helvetica', 'normal')
    currentY += 8
    
    if (receivingParty.name) {
      this.doc.text(`Name: ${receivingParty.name}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (receivingParty.type) {
      this.doc.text(`Type: ${this.capitalizeFirst(receivingParty.type)}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (receivingParty.address) {
      this.doc.text(`Address: ${receivingParty.address}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (receivingParty.email) {
      this.doc.text(`Email: ${receivingParty.email}`, this.margin + 10, currentY)
      currentY += 6
    }
    
    if (receivingParty.phone) {
      this.doc.text(`Phone: ${receivingParty.phone}`, this.margin + 10, currentY)
      currentY += 6
    }
  }

  private addRecitals(): void {
    let currentY = 180

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RECITALS', this.margin, currentY)
    
    currentY += 15
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    const recitalText = `WHEREAS, the parties wish to explore potential business opportunities and may need to disclose confidential information; and WHEREAS, the parties desire to protect such confidential information from unauthorized disclosure;`
    
    const splitRecital = this.doc.splitTextToSize(recitalText, this.pageWidth - 2 * this.margin)
    this.doc.text(splitRecital, this.margin, currentY)
    
    currentY += splitRecital.length * 5 + 10
    
    this.doc.text('NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:', this.margin, currentY)
  }

  private addTerms(): number {
    let currentY = 240

    // Use AI-provided sections if available, otherwise use default structure
    let terms: Array<{ title: string; content: string }> = []
    
    if (this.data.sections && Array.isArray(this.data.sections) && this.data.sections.length > 0) {
      // Use AI-provided sections directly
      terms = this.data.sections.map((section, index) => ({
        title: `${index + 1}. ${section.title?.toUpperCase() || 'SECTION'}`,
        content: section.body || ''
      }))
    } else {
      // Fallback to default structure with AI data
      terms = [
        { title: '1. PURPOSE', content: this.data.purpose || 'Business collaboration' },
        { title: '2. DEFINITIONS', content: this.data.definitions || 'Confidential information as defined by the parties' },
        { title: '3. CONFIDENTIALITY OBLIGATIONS', content: this.data.confidentialityObligations || 'Standard confidentiality obligations' },
        { title: '4. EXCLUSIONS', content: this.data.exclusions || 'Information in public domain' },
        { title: '5. TERM', content: this.data.termClause || 'Agreement term as specified' },
        { title: '6. GOVERNING LAW', content: this.data.governingLawClause || 'Governed by applicable law' }
      ]
    }

    if (this.data.additionalTerms) {
      terms.push({ title: `${terms.length + 1}. ADDITIONAL TERMS`, content: this.data.additionalTerms })
    }

    if (this.data.specialProvisions) {
      terms.push({ title: `${terms.length + 1}. SPECIAL PROVISIONS`, content: this.data.specialProvisions })
    }

    for (const term of terms) {
      // Check if we need a new page
      if (currentY > this.pageHeight - 60) {
        this.doc.addPage()
        currentY = this.margin
      }

      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(term.title, this.margin, currentY)
      
      currentY += 12
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(10)
      
      const splitContent = this.doc.splitTextToSize(term.content || '', this.pageWidth - 2 * this.margin)
      this.doc.text(splitContent, this.margin, currentY)
      
      currentY += splitContent.length * 5 + 15
    }
    
    return currentY
  }

  private addSignatures(): void {
    // Check if we need a new page for signatures
    const requiredSpace = 120
    const availableSpace = this.pageHeight - this.currentY
    
    if (availableSpace < requiredSpace) {
      this.doc.addPage()
      this.currentY = this.margin
    }

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('SIGNATURES', this.margin, this.currentY)

    const signatureY = this.currentY + 25

    // Disclosing Party Signature
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    this.doc.text('DISCLOSING PARTY:', this.margin, signatureY)
    this.doc.line(this.margin, signatureY + 20, this.margin + 80, signatureY + 20)
    this.doc.text('Signature', this.margin, signatureY + 30)
    const disclosingName = this.data.disclosingParty?.name || this.data.parties?.disclosing_party || 'Disclosing Party'
    const receivingName = this.data.receivingParty?.name || this.data.parties?.receiving_party || 'Receiving Party'
    
    this.doc.text(`Print Name: ${disclosingName}`, this.margin, signatureY + 40)
    this.doc.text('Date: _______________', this.margin, signatureY + 50)

    // Receiving Party Signature
    const rightSignatureX = this.pageWidth / 2 + 10
    this.doc.text('RECEIVING PARTY:', rightSignatureX, signatureY)
    this.doc.line(rightSignatureX, signatureY + 20, rightSignatureX + 80, signatureY + 20)
    this.doc.text('Signature', rightSignatureX, signatureY + 30)
    this.doc.text(`Print Name: ${receivingName}`, rightSignatureX, signatureY + 40)
    this.doc.text('Date: _______________', rightSignatureX, signatureY + 50)
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  download(filename?: string): void {
    const disclosingName = this.data.disclosingParty?.name || this.data.parties?.disclosing_party || 'Disclosing'
    const receivingName = this.data.receivingParty?.name || this.data.parties?.receiving_party || 'Receiving'
    const finalFilename = filename || `NDA_${disclosingName.replace(/[^a-zA-Z0-9]/g, '_')}_${receivingName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    this.doc.save(finalFilename)
  }

  getBlob(): Blob {
    return this.doc.output('blob')
  }

  getDataUri(): string {
    return this.doc.output('datauristring')
  }
}

// Export function for easy use
export function generateNDAPDF(data: NDAFormData, template: NDATemplate = 'legal'): NDAPDFGenerator {
  return new NDAPDFGenerator(data, template)
}
