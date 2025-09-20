
import jsPDF from 'jspdf'
import { EnhancedInvoicePDFGenerator } from './pdf-generator-enhanced'
import { prepareFontsForLocale } from './pdf/pdf-font-loader'
import { getDirection } from './i18n'
import type { DocumentType, Locale } from '../../packages/core/schemas'
import type { PDFThemeName } from './pdf-theme-system'

export type UnifiedTemplateType = 'modern' | 'classic' | 'minimal'

export interface UnifiedPdfOptions {
  locale: Locale
  documentType: DocumentType
  template?: UnifiedTemplateType
  theme?: PDFThemeName
  includeWatermark?: boolean
  accentColor?: string
  companyLogo?: string | null
  websiteUrl?: string
  showQRCode?: boolean
  textDirection?: 'ltr' | 'rtl'
}

interface Party {
  name: string
  address: string
  email: string
  phone: string
}

interface NDASection {
  title: string
  content: string
}

interface SanitizedNDA {
  title: string
  effectiveDate: string
  terminationDate?: string
  jurisdiction: string
  termMonths: number
  disclosingParty: Party
  receivingParty: Party
  purpose: string
  sections: NDASection[]
}

function sanitizeString(value: any, fallback = ''): string {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.length > 0) {
      return trimmed
    }
  }
  return fallback
}

function sanitizeParty(party: any): Party {
  if (!party || typeof party !== 'object') {
    return {
      name: 'Unknown Party',
      address: 'No address provided',
      email: 'No email provided',
      phone: 'No phone provided',
    }
  }

  return {
    name: sanitizeString(party.name, 'Unknown Party'),
    address: sanitizeString(party.address, 'No address provided'),
    email: sanitizeString(party.email, 'No email provided'),
    phone: sanitizeString(party.phone, 'No phone provided'),
  }
}

function sanitizeSections(sections: any): NDASection[] {
  if (!Array.isArray(sections)) {
    return []
  }

  return sections
    .map((section) => ({
      title: sanitizeString(section?.title, ''),
      content: sanitizeString(section?.body ?? section?.content, ''),
    }))
    .filter((section) => section.title || section.content)
}

function sanitizeNDA(document: any): SanitizedNDA {
  const safeDoc = typeof document === 'object' && document ? document : {}
  const sections = sanitizeSections(safeDoc.sections)

  if (sections.length === 0) {
    sections.push({
      title: 'Confidentiality Obligations',
      content:
        'Each party agrees to keep confidential information secret and to use it only for the permitted purpose defined in this agreement.',
    })
  }

  return {
    title: sanitizeString(safeDoc.title, 'Non-Disclosure Agreement'),
    effectiveDate: sanitizeString(safeDoc.effectiveDate, new Date().toISOString().split('T')[0]),
    terminationDate: sanitizeString(safeDoc.terminationDate),
    jurisdiction: sanitizeString(safeDoc.jurisdiction, 'Governing law not specified'),
    termMonths: Number.isFinite(Number(safeDoc.termMonths)) ? Number(safeDoc.termMonths) : 12,
    disclosingParty: sanitizeParty(safeDoc.disclosingParty),
    receivingParty: sanitizeParty(safeDoc.receivingParty),
    purpose: sanitizeString(safeDoc.purpose, 'General business collaboration'),
    sections,
  }
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/)
}

function writeParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  align: 'left' | 'right',
  font: { family: string; style: 'normal' | 'bold' },
  lineHeight = 6,
): number {
  doc.setFont(font.family, font.style)
  const paragraphs = splitLines(text)
  let cursor = y

  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim().length === 0 && index < paragraphs.length - 1) {
      cursor += lineHeight
      return
    }

    const splitResult = doc.splitTextToSize(paragraph, maxWidth)
    const lines = Array.isArray(splitResult) ? splitResult : [splitResult]
    lines.forEach((line: string) => {
      doc.text(line, x, cursor, { align })
      cursor += lineHeight
    })
  })

  return cursor
}

function generateNdaDataUri(document: any, fontFamily: string, direction: 'ltr' | 'rtl'): string {
  const nda = sanitizeNDA(document)
  const doc = new jsPDF()

  if (direction === 'rtl' && typeof (doc as any).setR2L === 'function') {
    (doc as any).setR2L(true)
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentWidth = pageWidth - margin * 2
  const align: 'left' | 'right' = direction === 'rtl' ? 'right' : 'left'

  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(20)
  doc.text(nda.title, pageWidth / 2, 50, { align: 'center' })

  doc.setFontSize(11)
  let cursorY = 70

  const originX = direction === 'rtl' ? pageWidth - margin : margin

  cursorY = writeParagraph(
    doc,
    `Effective Date: ${nda.effectiveDate}`,
    originX,
    cursorY,
    contentWidth,
    align,
    { family: fontFamily, style: 'bold' },
  ) + 4

  if (nda.terminationDate) {
    cursorY = writeParagraph(
      doc,
      `Termination Date: ${nda.terminationDate}`,
      originX,
      cursorY,
      contentWidth,
      align,
      { family: fontFamily, style: 'normal' },
    ) + 4
  }

  cursorY = writeParagraph(
    doc,
    `Jurisdiction: ${nda.jurisdiction}`,
    originX,
    cursorY,
    contentWidth,
    align,
    { family: fontFamily, style: 'normal' },
  ) + 8

  const partyBlock = (title: string, party: Party) => {
    doc.setFont(fontFamily, 'bold')
    doc.setFontSize(13)
    doc.text(title, originX, cursorY, { align })
    doc.setFont(fontFamily, 'normal')
    doc.setFontSize(11)
    cursorY = writeParagraph(
      doc,
      `${party.name}
${party.address}
${party.email}
${party.phone}`,
      originX,
      cursorY + 6,
      contentWidth,
      align,
      { family: fontFamily, style: 'normal' },
    ) + 8
  }

  partyBlock('Disclosing Party', nda.disclosingParty)
  partyBlock('Receiving Party', nda.receivingParty)

  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(12)
  doc.text('Purpose', originX, cursorY, { align })
  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(11)
  cursorY = writeParagraph(
    doc,
    nda.purpose,
    originX,
    cursorY + 6,
    contentWidth,
    align,
    { family: fontFamily, style: 'normal' },
  ) + 10

  nda.sections.forEach((section) => {
    doc.setFont(fontFamily, 'bold')
    doc.setFontSize(12)
    cursorY = writeParagraph(
      doc,
      section.title || 'Section',
      originX,
      cursorY,
      contentWidth,
      align,
      { family: fontFamily, style: 'bold' },
    ) + 4

    doc.setFont(fontFamily, 'normal')
    doc.setFontSize(11)
    cursorY = writeParagraph(
      doc,
      section.content,
      originX,
      cursorY,
      contentWidth,
      align,
      { family: fontFamily, style: 'normal' },
    ) + 10

    if (cursorY > pageHeight - margin) {
      doc.addPage()
      if (direction === 'rtl' && typeof (doc as any).setR2L === 'function') {
        (doc as any).setR2L(true)
      }
      cursorY = margin
    }
  })

  doc.setFont(fontFamily, 'bold')
  doc.setFontSize(12)
  cursorY = Math.min(cursorY + 10, pageHeight - 60)
  doc.text('Signatures', pageWidth / 2, cursorY, { align: 'center' })

  doc.setFont(fontFamily, 'normal')
  doc.setFontSize(11)
  const signatureY = cursorY + 15
  doc.text('Disclosing Party Signature: ______________________', margin, signatureY)
  doc.text('Receiving Party Signature: ______________________', margin, signatureY + 12)

  return doc.output('datauristring')
}

function decodeBase64(base64: string): Uint8Array {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  if (typeof Buffer !== 'undefined') {
    const buffer = Buffer.from(base64, 'base64')
    return new Uint8Array(buffer)
  }

  throw new Error('Base64 decoding is not supported in this environment')
}

function dataUriToUint8Array(dataUri: string): Uint8Array {
  const base64 = dataUri.split(',')[1]
  return decodeBase64(base64)
}

function dataUriToBlob(dataUri: string): Blob {
  const bytes = dataUriToUint8Array(dataUri)
  const arrayBuffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength
    ? bytes.buffer
    : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  return new Blob([arrayBuffer as ArrayBuffer], { type: 'application/pdf' })
}

export async function generatePdfDataUri(document: any, options: UnifiedPdfOptions): Promise<string> {
  const { primaryFont, direction } = await prepareFontsForLocale(options.locale)
  const resolvedDirection = options.textDirection || direction || getDirection(options.locale)

  if (options.documentType === 'invoice') {
    const generator = new EnhancedInvoicePDFGenerator({
      customTemplate: options.template,
      theme: options.theme,
      includeWatermark: options.includeWatermark,
      accentColor: options.accentColor,
      companyLogo: options.companyLogo ?? null,
      websiteUrl: options.websiteUrl ?? 'https://xinvoice.com',
      showQRCode: options.showQRCode ?? false,
      fontFamily: primaryFont,
      textDirection: resolvedDirection,
    })

    return generator.generateInvoicePDF(document)
  }

  if (options.documentType === 'nda') {
    return generateNdaDataUri(document, primaryFont, resolvedDirection)
  }

  throw new Error(`Unsupported document type: ${options.documentType}`)
}

export async function generatePdfUint8Array(document: any, options: UnifiedPdfOptions): Promise<Uint8Array> {
  const dataUri = await generatePdfDataUri(document, options)
  return dataUriToUint8Array(dataUri)
}

export async function generatePdfBlob(document: any, options: UnifiedPdfOptions): Promise<Blob> {
  const dataUri = await generatePdfDataUri(document, options)
  return dataUriToBlob(dataUri)
}

export async function downloadPdf(docData: any, options: UnifiedPdfOptions & { filename?: string }): Promise<void> {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') {
    throw new Error('PDF download is only available in the browser environment')
  }

  const blob = await generatePdfBlob(docData, options)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = options.filename || `${options.documentType}-${Date.now()}.pdf`
  window.document.body.appendChild(link)
  link.click()
  window.document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


