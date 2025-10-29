import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"
import { z } from "zod"

const InvoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be positive"),
  rate: z.number().min(0.01, "Rate must be positive"),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0).optional(),
})

const InvoiceUpdateSchema = z.object({
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

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        client: true,
        items: true,
        paymentEvents: true,
        emailEvents: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = InvoiceUpdateSchema.parse(body)

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Check if invoice can be edited (only drafts can be fully edited)
    if (existingInvoice.status !== "DRAFT" && existingInvoice.status !== "SENT") {
      return NextResponse.json(
        { error: "Cannot edit invoice in current status" },
        { status: 400 }
      )
    }

    // Delete existing items and create new ones
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: params.id }
    })

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        dueDate: new Date(validatedData.dueDate),
        items: {
          create: validatedData.items
        }
      },
      include: {
        client: true,
        items: true
      }
    })

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error("Error updating invoice:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Only allow deletion of draft invoices
    if (existingInvoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Cannot delete invoice that has been sent" },
        { status: 400 }
      )
    }

    await prisma.invoice.delete({
      where: { id: params.id }
    })

    // Update user invoice count
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        invoiceCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}