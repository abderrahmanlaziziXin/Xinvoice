import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { resolveUserId } from '@/lib/request-user';

const InvoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  rate: z.number().min(0.01, "Rate must be positive"),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0).optional(),
})

const InvoiceSchema = z.object({
  clientId: z.string().min(1, "Client selection is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number(),
  total: z.number(),
  currency: z.string().default("USD"),
  locale: z.string().default("en-US"),
  terms: z.string().optional(),
  notes: z.string().optional(),
  paymentInstructions: z.string().optional(),
  discountAmount: z.number().default(0).optional(),
  shippingAmount: z.number().default(0).optional(),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"]).default("DRAFT").optional()
})

// GET /api/invoices - Get user's invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build where clause based on filters
  const where: any = { userId }
    
    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }
    
    if (clientId) {
      where.clientId = clientId
    }

    try {
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ invoices })
    } catch (dbError) {
      console.error("Database error fetching invoices:", dbError)
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received invoice data:", body)
    const validatedData = InvoiceSchema.parse(body)

    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate unique invoice number
    const generateInvoiceNumber = async (): Promise<string> => {
      const lastInvoice = await prisma.invoice.findFirst({
  where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { invoiceNumber: true }
      })
      
      if (lastInvoice) {
        const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/)
        if (match) {
          const nextNumber = parseInt(match[1]) + 1
          return `INV-${nextNumber.toString().padStart(3, '0')}`
        }
      }
      return "INV-001"
    }

    try {
      // Generate unique invoice number
      const invoiceNumber = await generateInvoiceNumber()

      // Create invoice with items in a transaction
      const newInvoice = await prisma.invoice.create({
        data: {
          userId,
          clientId: validatedData.clientId,
          invoiceNumber,
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
          status: validatedData.status || 'DRAFT',
          terms: validatedData.terms,
          notes: validatedData.notes,
          paymentInstructions: validatedData.paymentInstructions,
          items: {
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
              email: true
            }
          },
          items: true
        }
      })

      return NextResponse.json({ invoice: newInvoice }, { status: 201 })
    } catch (dbError) {
      console.error("Database error creating invoice:", dbError)
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating invoice:", error)
    
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json(
        { 
          error: error.errors[0].message,
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}