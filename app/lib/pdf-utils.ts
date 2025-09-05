/**
 * PDF Generation Utilities
 * Shared constants, types, and helper functions for PDF generation
 */

// PDF Generation Constants
export const PDF_CONSTANTS = {
  MARGIN: 20,
  FONTS: {
    PRIMARY: 'helvetica',
    SECONDARY: 'times'
  },
  COLORS: {
    PRIMARY: '#2563eb',
    GRAY: '#6b7280',
    LIGHT_GRAY: '#f3f4f6',
    DARK: '#1f2937',
    WHITE: '#ffffff',
    BLACK: '#000000'
  },
  FONT_SIZES: {
    TITLE: 28,
    SUBTITLE: 18,
    HEADING: 14,
    BODY: 12,
    SMALL: 10,
    TINY: 8
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.5,
    LOOSE: 1.8
  }
} as const

export type TemplateType = 'modern' | 'classic' | 'minimal'
export type ColorRGB = [number, number, number]

/**
 * Convert hex color to RGB array
 */
export function hexToRgb(hex: string): ColorRGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [37, 99, 235] // Default blue
}

/**
 * Validate color string
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * Generate safe filename for PDF
 */
export function generateSafeFilename(invoiceNumber: string, prefix: string = 'invoice'): string {
  const safeNumber = invoiceNumber.replace(/[^a-zA-Z0-9]/g, '-')
  const timestamp = new Date().toISOString().split('T')[0]
  return `${prefix}-${safeNumber}-${timestamp}.pdf`
}

/**
 * Format currency with proper locale support
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies
    return `$${amount.toFixed(2)}`
  }
}

/**
 * Calculate optimal text size for given width
 */
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  baseFontSize: number = 12
): number {
  const charWidth = baseFontSize * 0.6 // Approximate character width
  const textWidth = text.length * charWidth
  
  if (textWidth <= maxWidth) {
    return baseFontSize
  }
  
  return Math.max(8, (maxWidth / textWidth) * baseFontSize)
}

/**
 * Performance monitoring decorator
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value
  
  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = originalMethod.apply(this, args)
    const end = performance.now()
    
    console.log(`PDF Generator: ${propertyKey} took ${(end - start).toFixed(2)}ms`)
    return result
  }
  
  return descriptor
}

/**
 * Error boundary for PDF operations
 */
export class PDFError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'PDFError'
  }
}

/**
 * Retry mechanism for PDF operations
 */
export async function retryPDFOperation<T>(
  operation: () => T,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw new PDFError(
          `PDF operation failed after ${maxRetries} attempts`,
          'retry',
          lastError
        )
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}
