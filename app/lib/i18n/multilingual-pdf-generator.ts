import jsPDF from 'jspdf';
import { translations } from './translations';

export class MultilingualPDFGenerator {
  private doc: jsPDF;
  private language: string;
  private isRTL: boolean;

  constructor(language: string = 'en-US') {
    this.doc = new jsPDF();
    this.language = language;
    this.isRTL = ['ar-SA'].includes(language);
  }

  /**
   * Generate NDA PDF in specified language
   */
  generateNDA(ndaInput: any): Uint8Array {
    // Sanitize and provide defaults for the NDA object
    const nda = this.sanitizeNDAObject(ndaInput);

    this.doc = new jsPDF();
    const t = translations[this.language as keyof typeof translations];
    
    // Title
    this.addText(t.nda.title, 20, 30, { fontSize: 18, isBold: true, align: 'center' });
    
    // Basic Information
    this.addText(`${t.nda.effectiveDate}: ${nda.effectiveDate}`, 20, 50);
    this.addText(`${t.nda.jurisdiction}: ${nda.jurisdiction}`, 20, 60);
    this.addText(`${t.nda.termMonths}: ${nda.termMonths}`, 20, 70);
    
    // Disclosing Party
    this.addText(t.nda.disclosingParty, 20, 90, { fontSize: 12, isBold: true });
    this.addPartySection(nda.disclosingParty, 20, 100);
    
    // Receiving Party
    this.addText(t.nda.receivingParty, 20, 140, { fontSize: 12, isBold: true });
    this.addPartySection(nda.receivingParty, 20, 150);
    
    // Purpose
    this.addText(t.nda.purpose, 20, 190, { fontSize: 12, isBold: true });
    this.addText(nda.purpose || 'General business purposes', 20, 200, { maxWidth: 170 });

    return new Uint8Array(this.doc.output('arraybuffer'));
  }

  /**
   * Generate Invoice PDF in specified language
   */
  generateInvoice(invoiceInput: any): Uint8Array {
    // Sanitize and provide defaults for the invoice object
    const invoice = this.sanitizeInvoiceObject(invoiceInput);

    this.doc = new jsPDF();
    const t = translations[this.language as keyof typeof translations];
    
    // Title
    this.addText(t.invoice.title, 20, 30, { fontSize: 18, isBold: true, align: 'center' });
    
    // Invoice Details
    this.addText(`${t.invoice.number}: ${invoice.invoiceNumber}`, 20, 50);
    this.addText(`${t.common.date}: ${invoice.date}`, 20, 60);
    this.addText(`${t.common.dueDate}: ${invoice.dueDate}`, 20, 70);
    
    // From (Seller)
    this.addText('From:', 20, 90, { fontSize: 14, isBold: true });
    this.addPartySection(invoice.from, 20, 100);
    
    // To (Buyer)
    this.addText('To:', 20, 140, { fontSize: 14, isBold: true });
    this.addPartySection(invoice.to, 20, 150);
    
    // Items
    this.addText(t.invoice.itemsHeader, 20, 190, { fontSize: 14, isBold: true });
    let yPosition = 200;
    
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item: any, index: number) => {
        const itemText = `${index + 1}. ${item.description || 'Service/Product'} - ${item.quantity || 1} x ${item.unitPrice || 0} = ${(item.quantity || 1) * (item.unitPrice || 0)}`;
        this.addText(itemText, 20, yPosition);
        yPosition += 10;
      });
    }
    
    // Total
    this.addText(`${t.common.total}: ${invoice.total || 0} ${invoice.currency || 'USD'}`, 20, yPosition + 10, { fontSize: 12, isBold: true });

    return new Uint8Array(this.doc.output('arraybuffer'));
  }

  /**
   * Sanitize NDA object and provide safe defaults
   */
  private sanitizeNDAObject(nda: any): any {
    console.log('Sanitizing NDA object:', nda)
    
    if (!nda || typeof nda !== 'object') {
      console.log('NDA object is invalid, using defaults')
      nda = {}
    }

    const sanitized = {
      title: this.sanitizeString(nda.title) || 'Non-Disclosure Agreement',
      effectiveDate: this.sanitizeString(nda.effectiveDate) || new Date().toLocaleDateString(),
      jurisdiction: this.sanitizeString(nda.jurisdiction) || 'Unknown Jurisdiction',
      termMonths: this.sanitizeNumber(nda.termMonths) || 12,
      disclosingParty: this.sanitizeParty(nda.disclosingParty),
      receivingParty: this.sanitizeParty(nda.receivingParty),
      purpose: this.sanitizeString(nda.purpose) || 'General business purposes',
      currency: this.sanitizeString(nda.currency) || 'USD'
    }
    
    console.log('Sanitized NDA object:', sanitized)
    return sanitized
  }

  /**
   * Sanitize Invoice object and provide safe defaults
   */
  private sanitizeInvoiceObject(invoice: any): any {
    console.log('Sanitizing Invoice object:', invoice)
    
    if (!invoice || typeof invoice !== 'object') {
      console.log('Invoice object is invalid, using defaults')
      invoice = {}
    }

    const sanitized = {
      invoiceNumber: this.sanitizeString(invoice.invoiceNumber) || 'INV-001',
      date: this.sanitizeString(invoice.date) || new Date().toLocaleDateString(),
      dueDate: this.sanitizeString(invoice.dueDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      from: this.sanitizeParty(invoice.from),
      to: this.sanitizeParty(invoice.to),
      items: Array.isArray(invoice.items) ? invoice.items.map((item: any) => this.sanitizeItem(item)) : [],
      total: this.sanitizeNumber(invoice.total) || 0,
      currency: this.sanitizeString(invoice.currency) || 'USD'
    }
    
    console.log('Sanitized Invoice object:', sanitized)
    return sanitized
  }

  /**
   * Sanitize party object
   */
  private sanitizeParty(party: any): any {
    if (!party || typeof party !== 'object') {
      party = {};
    }

    return {
      name: this.sanitizeString(party.name) || 'Unknown Party',
      address: this.sanitizeString(party.address) || 'No address provided',
      email: this.sanitizeString(party.email) || 'No email provided',
      phone: this.sanitizeString(party.phone) || 'No phone provided'
    };
  }

  /**
   * Sanitize item object
   */
  private sanitizeItem(item: any): any {
    if (!item || typeof item !== 'object') {
      item = {};
    }

    return {
      description: this.sanitizeString(item.description) || 'Service/Product',
      quantity: this.sanitizeNumber(item.quantity) || 1,
      unitPrice: this.sanitizeNumber(item.unitPrice) || 0
    };
  }

  /**
   * Sanitize string values
   */
  private sanitizeString(value: any): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    return null;
  }

  /**
   * Sanitize number values
   */
  private sanitizeNumber(value: any): number | null {
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
      return num;
    }
    return null;
  }

  /**
   * Add text to PDF with RTL support
   */
  private addText(text: string, x: number, y: number, options: any = {}): void {
    const {
      fontSize = 10,
      isBold = false,
      align = 'left',
      maxWidth = undefined
    } = options;

    this.doc.setFontSize(fontSize);
    
    if (isBold) {
      this.doc.setFont('helvetica', 'bold');
    } else {
      this.doc.setFont('helvetica', 'normal');
    }

    // Handle RTL text alignment
    let alignValue: 'left' | 'center' | 'right' = align;
    if (this.isRTL && align === 'left') {
      alignValue = 'right';
      x = this.doc.internal.pageSize.getWidth() - x;
    }

    try {
      if (maxWidth) {
        const lines = this.doc.splitTextToSize(text, maxWidth);
        this.doc.text(lines, x, y, { align: alignValue });
      } else {
        this.doc.text(text, x, y, { align: alignValue });
      }
    } catch (error) {
      console.error('Error adding text to PDF:', error);
      // Fallback: add text without special formatting
      this.doc.text(String(text), x, y);
    }
  }

  /**
   * Add party section to PDF
   */
  private addPartySection(party: any, x: number, y: number): void {
    if (!party) return;

    const safeParty = this.sanitizeParty(party);
    this.addText(safeParty.name, x, y);
    this.addText(safeParty.address, x, y + 10);
    this.addText(safeParty.email, x, y + 20);
    this.addText(safeParty.phone, x, y + 30);
  }
}

// Export functions that the hook expects
export const generateMultilingualInvoicePDF = (documentData: any, localization: any): Uint8Array => {
  // Extract the actual document from the API response structure
  const document = documentData.document || documentData
  const locale = localization.locale || localization.language || 'en-US'
  
  console.log('Generating invoice PDF with data:', document)
  console.log('Using locale:', locale)
  
  const generator = new MultilingualPDFGenerator(locale)
  return generator.generateInvoice(document)
};

export const generateMultilingualNDAPDF = (documentData: any, localization: any): Uint8Array => {
  // Extract the actual document from the API response structure
  const document = documentData.document || documentData
  const locale = localization.locale || localization.language || 'en-US'
  
  console.log('Generating NDA PDF with data:', document)
  console.log('Using locale:', locale)
  
  const generator = new MultilingualPDFGenerator(locale)
  return generator.generateNDA(document)
};
