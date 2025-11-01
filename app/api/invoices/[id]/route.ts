import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  rate: z.number().min(0.01, 'Rate must be positive'),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0).optional(),
})

const InvoiceUpdateSchema = z.object({
  clientId: z.string().min(1, 'Client selection is required'),
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number(),
  total: z.number(),
  currency: z.string().default('USD'),
  locale: z.string().default('en-US'),
  terms: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  paymentInstructions: z.string().optional(),
  discountAmount: z.number().default(0).optional(),
  shippingAmount: z.number().default(0).optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED']).default('DRAFT').optional()
})

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const demoUserId = "demo-user-1"

    try {
      // Try to fetch from database first
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: params.id,
          userId: demoUserId
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true
            }
          },
          items: {
            select: {
              id: true,
              description: true,
              quantity: true,
              rate: true,
              amount: true,
              taxRate: true
            }
          }
        }
      })

      if (invoice) {
        return NextResponse.json({ invoice })
      }

      // If not found in database, check if it's a demo invoice
      if (params.id.startsWith('demo-invoice-')) {
        // Return demo invoice data
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
      }

      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    } catch (dbError) {
      console.error("Database error, falling back to demo mode:", dbError)
      
      // Fallback demo invoice
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
    }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = InvoiceUpdateSchema.parse(body)
    const demoUserId = "demo-user-1"

    try {
      // First, check if invoice exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          id: params.id,
          userId: demoUserId
        }
      })

      if (!existingInvoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }

      // Update invoice with items in a transaction
      const updatedInvoice = await prisma.invoice.update({
        where: { id: params.id },
        data: {
          clientId: validatedData.clientId,
          date: new Date(validatedData.date),
          dueDate: new Date(validatedData.dueDate),
          subtotal: validatedData.subtotal,
          taxRate: validatedData.taxRate,
          taxAmount: validatedData.taxAmount,
          discountAmount: validatedData.discountAmount || 0,
          shippingAmount: validatedData.shippingAmount || 0,
          total: validatedData.total,
          currency: validatedData.currency,
          locale: validatedData.locale,
          status: validatedData.status || existingInvoice.status,
          terms: validatedData.terms || null,
          notes: validatedData.notes || null,
          paymentInstructions: validatedData.paymentInstructions,
          
          // Handle status-specific updates
          ...(validatedData.status === 'SENT' && !existingInvoice.sentAt && {
            sentAt: new Date(),
            viewToken: !existingInvoice.viewToken ? `view_${Date.now()}_${Math.random().toString(36).substring(2, 15)}` : existingInvoice.viewToken
          }),
          ...(validatedData.status === 'PAID' && !existingInvoice.paidAt && {
            paidAt: new Date()
          }),
          
          // Update items
          items: {
            deleteMany: {}, // Delete existing items
            create: validatedData.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              taxRate: item.taxRate || 0
            }))
          }
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true
            }
          },
          items: {
            select: {
              id: true,
              description: true,
              quantity: true,
              rate: true,
              amount: true,
              taxRate: true
            }
          }
        }
      })

      return NextResponse.json({ invoice: updatedInvoice })
    } catch (dbError) {
      console.error("Database error, falling back to demo mode:", dbError)
      
      // Fallback to demo mode
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
    }
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
