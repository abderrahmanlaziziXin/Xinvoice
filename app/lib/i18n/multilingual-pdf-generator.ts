import type { Locale } from '../../../packages/core/schemas'
import { generatePdfUint8Array } from '../pdf-generator-unified'
import type { UnifiedPdfOptions } from '../pdf-generator-unified'

function resolveLocale(localization: any): Locale {
  const locale = localization?.locale || localization?.language || 'en-US'
  return locale as Locale
}

function extractDocument(documentData: any): any {
  if (!documentData) return {}
  return documentData.document ?? documentData
}

export async function generateMultilingualInvoicePDF(documentData: any, localization: any): Promise<Uint8Array> {
  const locale = resolveLocale(localization)
  const document = extractDocument(documentData)
  const options: UnifiedPdfOptions = {
    locale,
    documentType: 'invoice',
    template: 'modern',
    theme: 'primary',
  }
  return generatePdfUint8Array(document, options)
}

export async function generateMultilingualNDAPDF(documentData: any, localization: any): Promise<Uint8Array> {
  const locale = resolveLocale(localization)
  const document = extractDocument(documentData)
  const options: UnifiedPdfOptions = {
    locale,
    documentType: 'nda',
  }
  return generatePdfUint8Array(document, options)
}

