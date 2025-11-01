import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

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
    
    // For demo purposes, use a demo user ID - in production, get from auth session
    const demoUserId = "demo-user-1"

    // Build where clause based on filters
    const where: any = { userId: demoUserId }
    
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
      console.error("Database error, falling back to demo data:", dbError)
      // Fallback to demo data if database fails
      let mockInvoices = [
      {
        id: "demo-invoice-1",
        invoiceNumber: "INV-001",
        client: { id: "demo-client-1", name: "Acme Corporation" },
        total: 1500.00,
        status: "PAID",
        date: new Date(Date.now() - 86400000).toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        subtotal: 1350.00,
        taxAmount: 150.00,
        taxRate: 0.1,
        currency: "USD",
        locale: "en-US",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: "item-1",
            description: "Web Development Services",
            quantity: 20,
            rate: 75.00,
            amount: 1500.00,
            taxRate: 0.1
          }
        ]
      },
      {
        id: "demo-invoice-2",
        invoiceNumber: "INV-002", 
        client: { id: "demo-client-2", name: "Global Tech Solutions" },
        total: 950.00,
        status: "SENT",
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        subtotal: 850.00,
        taxAmount: 100.00,
        taxRate: 0.12,
        currency: "USD",
        locale: "en-US",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: "item-2",
            description: "Consulting Services",
            quantity: 10,
            rate: 95.00,
            amount: 950.00,
            taxRate: 0.12
          }
        ]
      }
    ]

    // Filter by status if provided
    if (status && status !== "all") {
      mockInvoices = mockInvoices.filter(invoice => 
        invoice.status.toLowerCase() === status.toLowerCase()
      )
    }

    // Filter by client if provided
    if (clientId) {
      mockInvoices = mockInvoices.filter(invoice => invoice.client.id === clientId)
    }
    
      return NextResponse.json({ invoices: mockInvoices })
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

    // For demo purposes, use a demo user ID
    const demoUserId = "demo-user-1"

    // Generate unique invoice number
    const generateInvoiceNumber = async (): Promise<string> => {
      const lastInvoice = await prisma.invoice.findFirst({
        where: { userId: demoUserId },
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
          userId: demoUserId,
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
      console.error("Database error, falling back to demo mode:", dbError)
      
      // Fallback to demo mode
      const generateUniqueInvoiceNumber = (): string => {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 1000)
        return `INV-${timestamp}-${randomNum}`
      }

      const newInvoice = {
        id: `demo-invoice-${Date.now()}`,
        ...validatedData,
        invoiceNumber: generateUniqueInvoiceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        client: {
          id: validatedData.clientId,
          name: validatedData.clientId === "demo-client-1" ? "Acme Corporation" : "Global Tech Solutions"
        }
      }

      return NextResponse.json({ invoice: newInvoice }, { status: 201 })
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