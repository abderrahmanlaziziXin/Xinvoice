'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { InvoiceSchema, Invoice, InvoiceItem } from '../../packages/core'
import { EmailWarningModal } from './modal'
import { PDFPreviewModal } from './pdf-preview-modal'
import { InvoicePDFGenerator } from '../lib/pdf-generator'
import { Tooltip } from './tooltip'

interface InvoiceFormProps {
  initialData?: Partial<Invoice>
  onSubmit: (data: Invoice) => void
  isSubmitting?: boolean
  aiAssumptions?: string[]
  defaultCurrency?: string
  defaultLocale?: string
  persistSettings?: (currency: string, locale: string) => void
}

export default function InvoiceForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  aiAssumptions,
  defaultCurrency = 'USD',
  defaultLocale = 'en-US',
  persistSettings
}: InvoiceFormProps) {
  const [showEmailWarning, setShowEmailWarning] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [formData, setFormData] = useState<Invoice | null>(null)
  const [missingEmails, setMissingEmails] = useState<string[]>([])
  const [pendingSubmitData, setPendingSubmitData] = useState<Invoice | null>(null)
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Invoice>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      type: 'invoice',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      from: { name: '', address: '', email: '', phone: '' },
      to: { name: '', address: '', email: '', phone: '' },
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      currency: defaultCurrency as any,
      locale: defaultLocale as any,
      terms: '',
      notes: '',
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting form data:', initialData) // Debug log
      const formData = {
        type: 'invoice' as const,
        invoiceNumber: initialData.invoiceNumber || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        dueDate: initialData.dueDate || '',
        from: {
          name: initialData.from?.name || '',
          address: initialData.from?.address || '',
          email: initialData.from?.email || '',
          phone: initialData.from?.phone || '',
        },
        to: {
          name: initialData.to?.name || '',
          address: initialData.to?.address || '',
          email: initialData.to?.email || '',
          phone: initialData.to?.phone || '',
        },
        items: initialData.items?.length ? initialData.items : [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        subtotal: initialData.subtotal || 0,
        taxRate: initialData.taxRate || 0,
        taxAmount: initialData.taxAmount || 0,
        total: initialData.total || 0,
        currency: (initialData.currency || defaultCurrency) as any,
        locale: (initialData.locale || defaultLocale) as any,
        terms: initialData.terms || '',
        notes: initialData.notes || '',
      }
      reset(formData)
    }
  }, [initialData, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedTaxRate = watch('taxRate')

  // Calculate totals whenever items or tax rate changes
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum: number, item: InvoiceItem) => {
      const amount = (item.quantity || 0) * (item.rate || 0)
      return sum + amount
    }, 0)

    const taxAmount = subtotal * (watchedTaxRate || 0)
    const total = subtotal + taxAmount

    // Update item amounts
    watchedItems.forEach((item: InvoiceItem, index: number) => {
      const amount = (item.quantity || 0) * (item.rate || 0)
      setValue(`items.${index}.amount`, amount)
    })

    setValue('subtotal', subtotal)
    setValue('taxAmount', taxAmount)
    setValue('total', total)
  }, [watchedItems, watchedTaxRate, setValue])

  const addItem = () => {
    append({ description: '', quantity: 1, rate: 0, amount: 0 })
  }

  const validateEmailsAndSubmit = (data: Invoice) => {
    const missing: string[] = []
    
    if (!data.from.email) {
      missing.push(`From: ${data.from.name || 'Sender'}`)
    }
    
    if (!data.to.email) {
      missing.push(`To: ${data.to.name || 'Recipient'}`)
    }

    if (missing.length > 0) {
      setMissingEmails(missing)
      setPendingSubmitData(data)
      setShowEmailWarning(true)
    } else {
      onSubmit(data)
    }
  }

  const handleContinueWithoutEmails = () => {
    if (pendingSubmitData) {
      onSubmit(pendingSubmitData)
      setPendingSubmitData(null)
    }
  }

  return (
    <>
      <EmailWarningModal
        isOpen={showEmailWarning}
        onClose={() => setShowEmailWarning(false)}
        onContinue={handleContinueWithoutEmails}
        missingEmails={missingEmails}
      />
      
      <form onSubmit={handleSubmit(validateEmailsAndSubmit)} className="space-y-8">
        {/* AI Assumptions Display */}
        {aiAssumptions && aiAssumptions.length > 0 && (
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  AI Generated Content - Assumptions Made
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  {aiAssumptions.map((assumption, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {assumption}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-blue-600 mt-2 italic">
                  Please review and modify the generated content as needed to ensure accuracy.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Invoice Number
            <Tooltip content="A unique identifier for this invoice. Use a format like INV-001, INV-2024-001, etc.">
              <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
            </Tooltip>
          </label>
          <input
            {...register('invoiceNumber')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            placeholder="INV-001"
            aria-describedby="invoice-number-help"
          />
          {errors.invoiceNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber.message}</p>
          )}
          <p id="invoice-number-help" className="text-xs text-gray-500 mt-1">
            This will appear on your invoice and should be unique for each invoice
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Date
            <Tooltip content="The date this invoice was created/issued">
              <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
            </Tooltip>
          </label>
          <input
            {...register('date')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition-colors sm:text-base text-sm"
            aria-describedby="date-help"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Due Date
            <Tooltip content="When payment is expected. Typically 15-30 days from invoice date">
              <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
            </Tooltip>
          </label>
          <input
            {...register('dueDate')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white transition-colors sm:text-base text-sm"
            aria-describedby="due-date-help"
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
          )}
          <p id="due-date-help" className="text-xs text-gray-500 mt-1">
            Payment deadline for this invoice
          </p>
        </div>
      </div>

      {/* From/To Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">From</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              {...register('from.name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              placeholder="Your Company Name"
            />
            {errors.from?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.from.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              {...register('from.address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              rows={3}
              placeholder="Your Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('from.email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">To</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              {...register('to.name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Client Company Name"
            />
            {errors.to?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.to.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              {...register('to.address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Client Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('to.email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="client@email.com"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-md">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  {...register(`items.${index}.description`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Service or product description"
                />
                {errors.items?.[index]?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate
                </label>
                <input
                  {...register(`items.${index}.rate`, { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  {...register(`items.${index}.amount`)}
                  type="number"
                  step="0.01"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full md:w-80 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
            <span className="text-lg font-medium">
              ${watch('subtotal')?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Tax Rate (%):</label>
            <input
              {...register('taxRate', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              max="1"
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Tax Amount:</span>
            <span className="text-lg font-medium">
              ${watch('taxAmount')?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-gray-900">
              ${watch('total')?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Terms and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Terms
          </label>
          <textarea
            {...register('terms')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Payment terms and conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Additional notes"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          type="button"
          onClick={() => {
            const currentData = getValues() as Invoice
            setFormData(currentData)
            setShowPDFPreview(true)
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Preview PDF
        </button>
        
        <button
          type="button"
          onClick={() => {
            const currentData = getValues() as Invoice
            const generator = new InvoicePDFGenerator()
            generator.downloadPDF(currentData)
          }}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          Download PDF
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
    
    {/* PDF Preview Modal */}
    {showPDFPreview && formData && (
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={formData}
        onDownload={() => setShowPDFPreview(false)}
      />
    )}
    </>
  )
}
