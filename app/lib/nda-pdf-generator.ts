import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface NDAFormData {
  disclosingParty: {
    name: string
    address: string
    type: 'individual' | 'corporation' | 'llc' | 'partnership'
  }
  receivingParty: {
    name: string
    address: string
    type: 'individual' | 'corporation' | 'llc' | 'partnership'
  }
  title: string
  effectiveDate: string
  terminationDate?: string
  governingLaw: string
  confidentialityLevel: 'standard' | 'high' | 'maximum'
  purpose: string
  definitions: string
  confidentialityObligations: string
  exclusions: string
  termClause: string
  governingLawClause: string
  additionalTerms?: string
  specialProvisions?: string
}

export type NDATemplate = 'legal' | 'modern' | 'minimal'

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

    if (this.template === 'legal') {
      // Traditional legal document header
      this.doc.setFontSize(16)
      this.doc.setFont('times', 'bold')
      this.doc.text('NON-DISCLOSURE AGREEMENT', centerX, currentY, { align: 'center' })
      
      currentY += 20
      this.doc.setFontSize(12)
      this.doc.setFont('times', 'normal')
      this.doc.text(`Effective Date: ${this.formatDate(this.data.effectiveDate)}`, centerX, currentY, { align: 'center' })
    } else if (this.template === 'modern') {
      // Modern clean header
      this.doc.setFillColor(41, 128, 185) // Blue header
      this.doc.rect(0, 0, this.pageWidth, 30, 'F')
      
      this.doc.setTextColor(255, 255, 255)
      this.doc.setFontSize(18)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('NON-DISCLOSURE AGREEMENT', centerX, 20, { align: 'center' })
      
      this.doc.setTextColor(0, 0, 0)
      currentY = 45
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Effective Date: ${this.formatDate(this.data.effectiveDate)}`, centerX, currentY, { align: 'center' })
    } else {
      // Minimal header
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(this.data.title || 'Non-Disclosure Agreement', centerX, currentY, { align: 'center' })
      
      currentY += 15
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Effective: ${this.formatDate(this.data.effectiveDate)}`, centerX, currentY, { align: 'center' })
    }
  }

  private addParties(): void {
    let currentY = this.template === 'modern' ? 70 : 60

    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PARTIES', this.margin, currentY)
    
    currentY += 15
    this.doc.setFont('helvetica', 'normal')
    
    // Disclosing Party
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Disclosing Party:', this.margin, currentY)
    this.doc.setFont('helvetica', 'normal')
    currentY += 8
    this.doc.text(`Name: ${this.data.disclosingParty.name}`, this.margin + 10, currentY)
    currentY += 6
    this.doc.text(`Type: ${this.capitalizeFirst(this.data.disclosingParty.type)}`, this.margin + 10, currentY)
    currentY += 6
    this.doc.text(`Address: ${this.data.disclosingParty.address}`, this.margin + 10, currentY)
    
    currentY += 15
    
    // Receiving Party
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Receiving Party:', this.margin, currentY)
    this.doc.setFont('helvetica', 'normal')
    currentY += 8
    this.doc.text(`Name: ${this.data.receivingParty.name}`, this.margin + 10, currentY)
    currentY += 6
    this.doc.text(`Type: ${this.capitalizeFirst(this.data.receivingParty.type)}`, this.margin + 10, currentY)
    currentY += 6
    this.doc.text(`Address: ${this.data.receivingParty.address}`, this.margin + 10, currentY)
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

    const terms = [
      { title: '1. PURPOSE', content: this.data.purpose },
      { title: '2. DEFINITIONS', content: this.data.definitions },
      { title: '3. CONFIDENTIALITY OBLIGATIONS', content: this.data.confidentialityObligations },
      { title: '4. EXCLUSIONS', content: this.data.exclusions },
      { title: '5. TERM', content: this.data.termClause },
      { title: '6. GOVERNING LAW', content: this.data.governingLawClause }
    ]

    if (this.data.additionalTerms) {
      terms.push({ title: '7. ADDITIONAL TERMS', content: this.data.additionalTerms })
    }

    if (this.data.specialProvisions) {
      terms.push({ title: '8. SPECIAL PROVISIONS', content: this.data.specialProvisions })
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
      
      const splitContent = this.doc.splitTextToSize(term.content, this.pageWidth - 2 * this.margin)
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
    this.doc.text(`Print Name: ${this.data.disclosingParty.name}`, this.margin, signatureY + 40)
    this.doc.text('Date: _______________', this.margin, signatureY + 50)

    // Receiving Party Signature
    const rightSignatureX = this.pageWidth / 2 + 10
    this.doc.text('RECEIVING PARTY:', rightSignatureX, signatureY)
    this.doc.line(rightSignatureX, signatureY + 20, rightSignatureX + 80, signatureY + 20)
    this.doc.text('Signature', rightSignatureX, signatureY + 30)
    this.doc.text(`Print Name: ${this.data.receivingParty.name}`, rightSignatureX, signatureY + 40)
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
    const finalFilename = filename || `NDA_${this.data.disclosingParty.name}_${this.data.receivingParty.name}_${new Date().toISOString().split('T')[0]}.pdf`
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
