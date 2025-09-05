/**
 * Enhanced validation utilities for document generation
 * Provides comprehensive validation with detailed error messages
 */

import { Invoice, InvoiceItem, InvoiceParty } from '../../packages/core'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

/**
 * Enhanced invoice validator with business rules
 */
export class InvoiceValidator {
  private errors: ValidationError[] = []
  private warnings: ValidationWarning[] = []

  validate(invoice: Invoice): ValidationResult {
    this.errors = []
    this.warnings = []

    this.validateBasicFields(invoice)
    this.validateParties(invoice)
    this.validateItems(invoice)
    this.validateAmounts(invoice)
    this.validateDates(invoice)
    this.validateBusinessRules(invoice)

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    }
  }

  private validateBasicFields(invoice: Invoice): void {
    if (!invoice.invoiceNumber?.trim()) {
      this.addError('invoiceNumber', 'Invoice number is required', 'REQUIRED_FIELD')
    } else if (invoice.invoiceNumber.length > 50) {
      this.addError('invoiceNumber', 'Invoice number must be 50 characters or less', 'FIELD_TOO_LONG')
    }

    if (!invoice.date?.trim()) {
      this.addError('date', 'Invoice date is required', 'REQUIRED_FIELD')
    }

    if (!invoice.dueDate?.trim()) {
      this.addError('dueDate', 'Due date is required', 'REQUIRED_FIELD')
    }
  }

  private validateParties(invoice: Invoice): void {
    this.validateParty(invoice.from, 'from', 'Sender')
    this.validateParty(invoice.to, 'to', 'Recipient')

    // Business rules for parties
    if (invoice.from?.email && invoice.to?.email && invoice.from.email === invoice.to.email) {
      this.addWarning('parties', 'Sender and recipient have the same email address', 'SAME_EMAIL')
    }

    if (!invoice.from?.email && !invoice.to?.email) {
      this.addWarning('parties', 'Neither party has an email address - delivery may be difficult', 'NO_EMAILS')
    }
  }

  private validateParty(party: InvoiceParty, field: string, label: string): void {
    if (!party?.name?.trim()) {
      this.addError(`${field}.name`, `${label} name is required`, 'REQUIRED_FIELD')
    }

    if (party?.email && !this.isValidEmail(party.email)) {
      this.addError(`${field}.email`, `${label} email address is invalid`, 'INVALID_EMAIL')
    }

    if (party?.phone && !this.isValidPhone(party.phone)) {
      this.addWarning(`${field}.phone`, `${label} phone number may be invalid`, 'INVALID_PHONE')
    }
  }

  private validateItems(invoice: Invoice): void {
    if (!invoice.items || invoice.items.length === 0) {
      this.addError('items', 'At least one line item is required', 'NO_ITEMS')
      return
    }

    invoice.items.forEach((item, index) => {
      this.validateItem(item, index)
    })

    // Check for duplicate descriptions
    const descriptions = invoice.items.map(item => item.description.toLowerCase().trim())
    const duplicates = descriptions.filter((desc, index) => descriptions.indexOf(desc) !== index)
    if (duplicates.length > 0) {
      this.addWarning('items', 'Some items have duplicate descriptions', 'DUPLICATE_DESCRIPTIONS')
    }
  }

  private validateItem(item: InvoiceItem, index: number): void {
    const prefix = `items[${index}]`

    if (!item.description?.trim()) {
      this.addError(`${prefix}.description`, `Item ${index + 1} description is required`, 'REQUIRED_FIELD')
    } else if (item.description.length > 500) {
      this.addError(`${prefix}.description`, `Item ${index + 1} description is too long (max 500 characters)`, 'FIELD_TOO_LONG')
    }

    if (item.quantity <= 0) {
      this.addError(`${prefix}.quantity`, `Item ${index + 1} quantity must be positive`, 'INVALID_QUANTITY')
    }

    if (item.rate <= 0) {
      this.addError(`${prefix}.rate`, `Item ${index + 1} rate must be positive`, 'INVALID_RATE')
    }

    // Validate calculated amount
    const calculatedAmount = item.quantity * item.rate
    if (Math.abs(item.amount - calculatedAmount) > 0.01) {
      this.addError(`${prefix}.amount`, `Item ${index + 1} amount doesn't match quantity × rate`, 'AMOUNT_MISMATCH')
    }

    // Business rules
    if (item.rate > 10000) {
      this.addWarning(`${prefix}.rate`, `Item ${index + 1} has unusually high rate`, 'HIGH_RATE')
    }

    if (item.quantity > 1000) {
      this.addWarning(`${prefix}.quantity`, `Item ${index + 1} has unusually high quantity`, 'HIGH_QUANTITY')
    }
  }

  private validateAmounts(invoice: Invoice): void {
    // Validate subtotal calculation
    const calculatedSubtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    if (Math.abs(invoice.subtotal - calculatedSubtotal) > 0.01) {
      this.addError('subtotal', 'Subtotal doesn\'t match sum of line items', 'SUBTOTAL_MISMATCH')
    }

    // Validate tax calculation
    const calculatedTaxAmount = invoice.subtotal * invoice.taxRate
    if (Math.abs(invoice.taxAmount - calculatedTaxAmount) > 0.01) {
      this.addError('taxAmount', 'Tax amount doesn\'t match subtotal × tax rate', 'TAX_MISMATCH')
    }

    // Validate total calculation
    const calculatedTotal = invoice.subtotal + invoice.taxAmount
    if (Math.abs(invoice.total - calculatedTotal) > 0.01) {
      this.addError('total', 'Total doesn\'t match subtotal + tax', 'TOTAL_MISMATCH')
    }

    // Business rules
    if (invoice.total <= 0) {
      this.addError('total', 'Invoice total must be positive', 'INVALID_TOTAL')
    }

    if (invoice.total > 1000000) {
      this.addWarning('total', 'Invoice total is unusually high', 'HIGH_TOTAL')
    }

    if (invoice.taxRate > 0.5) {
      this.addWarning('taxRate', 'Tax rate seems unusually high', 'HIGH_TAX_RATE')
    }
  }

  private validateDates(invoice: Invoice): void {
    const invoiceDate = new Date(invoice.date)
    const dueDate = new Date(invoice.dueDate)
    const now = new Date()

    if (isNaN(invoiceDate.getTime())) {
      this.addError('date', 'Invoice date is not a valid date', 'INVALID_DATE')
    }

    if (isNaN(dueDate.getTime())) {
      this.addError('dueDate', 'Due date is not a valid date', 'INVALID_DATE')
    }

    if (invoiceDate.getTime() && dueDate.getTime()) {
      if (dueDate < invoiceDate) {
        this.addError('dueDate', 'Due date cannot be before invoice date', 'DUE_BEFORE_INVOICE')
      }

      const daysDiff = (dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 365) {
        this.addWarning('dueDate', 'Due date is more than a year after invoice date', 'LONG_PAYMENT_TERM')
      }

      // Check if invoice is overdue
      if (dueDate < now && invoiceDate < now) {
        this.addWarning('dueDate', 'This invoice appears to be overdue', 'OVERDUE_INVOICE')
      }

      // Check for future-dated invoices
      if (invoiceDate > now) {
        this.addWarning('date', 'Invoice is dated in the future', 'FUTURE_DATED')
      }
    }
  }

  private validateBusinessRules(invoice: Invoice): void {
    // Check for round numbers (might indicate estimates)
    if (invoice.total % 1 === 0 && invoice.total % 100 === 0) {
      this.addWarning('total', 'Invoice total is a round number - ensure pricing is accurate', 'ROUND_TOTAL')
    }

    // Check for common business terms
    if (invoice.terms && invoice.terms.toLowerCase().includes('net 30') && 
        invoice.dueDate && invoice.date) {
      const daysDiff = (new Date(invoice.dueDate).getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24)
      if (Math.abs(daysDiff - 30) > 2) {
        this.addWarning('terms', 'Payment terms mention "Net 30" but due date doesn\'t match', 'TERMS_MISMATCH')
      }
    }
  }

  private addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code })
  }

  private addWarning(field: string, message: string, code: string): void {
    this.warnings.push({ field, message, code })
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - adjust based on requirements
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }
}

/**
 * Convenience function for quick validation
 */
export function validateInvoice(invoice: Invoice): ValidationResult {
  const validator = new InvoiceValidator()
  return validator.validate(invoice)
}

/**
 * Check if invoice is ready for PDF generation
 */
export function isInvoiceReadyForPDF(invoice: Invoice): boolean {
  const result = validateInvoice(invoice)
  // Only critical errors should prevent PDF generation
  const criticalErrorCodes = ['REQUIRED_FIELD', 'INVALID_DATE', 'NO_ITEMS', 'AMOUNT_MISMATCH']
  return !result.errors.some(error => criticalErrorCodes.includes(error.code))
}
