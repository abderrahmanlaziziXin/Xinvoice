import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'
import { resolveUserId } from '@/lib/request-user';

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
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to fetch from database first
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: params.id,
          userId
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

      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    } catch (dbError) {
      console.error("Database error fetching invoice:", dbError)
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
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
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // First, check if invoice exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          id: params.id,
          userId
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
      console.error("Database error updating invoice:", dbError)
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
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

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const existing = await prisma.invoice.findFirst({ where: { id: params.id, userId } });
      if (!existing) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      await prisma.invoice.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'Invoice deleted successfully' })
    } catch (dbError) {
      console.error('Database error deleting invoice:', dbError);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
