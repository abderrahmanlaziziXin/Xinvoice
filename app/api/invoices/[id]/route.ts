import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  rate: z.number().min(0.01, 'Rate must be positive'),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0).optional(),
})

const InvoiceUpdateSchema = z.object({
  clientId: z.string().min(1, 'Client selection is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number(),
  total: z.number(),
  currency: z.string().default('USD'),
  locale: z.string().default('en-US'),
  terms: z.string().optional(),
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
  discountAmount: z.number().default(0).optional(),
  shippingAmount: z.number().default(0).optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED']).default('DRAFT').optional()
})

// GET /api/invoices/[id] - Get single invoice (demo mode)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Always return demo invoice data
    const demoInvoice = {
      id: params.id,
      invoiceNumber: 'INV-001',
      client: { 
        id: 'demo-client-1', 
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, New York, NY 10001'
      },
      total: 1500.00,
      status: 'PAID',
      date: new Date(Date.now() - 86400000).toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      subtotal: 1350.00,
      taxAmount: 150.00,
      taxRate: 0.1,
      currency: 'USD',
      locale: 'en-US',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          description: 'Web Development Services',
          quantity: 20,
          rate: 75.00,
          amount: 1500.00,
          taxRate: 0.1
        }
      ],
      paymentEvents: [],
      emailEvents: []
    }

    return NextResponse.json({ invoice: demoInvoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/invoices/[id] - Update invoice (demo mode)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = InvoiceUpdateSchema.parse(body)

    // For demo mode, return updated invoice with submitted data
    const updatedInvoice = {
      id: params.id,
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: {
        id: validatedData.clientId,
        name: validatedData.clientId === 'demo-client-1' ? 'Acme Corporation' : 'Global Tech Solutions'
      }
    }

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/invoices/[id] - Delete invoice (demo mode)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demo mode, always return success
    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
