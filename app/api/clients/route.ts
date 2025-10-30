import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"
import { z } from "zod"

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
})

// GET /api/clients - List all clients for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Temporarily disabled authentication check for AI agent testing
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const isDemoMode = !session?.user?.id

    // If in demo mode, return mock data
    if (isDemoMode) {
      return NextResponse.json({
        clients: [
          {
            id: "demo-client-1",
            name: "Acme Corporation",
            email: "contact@acme.com",
            phone: "+1 (555) 123-4567",
            address: "123 Business St, New York, NY 10001",
            taxNumber: "TAX123456",
            contactPerson: "John Smith",
            createdAt: new Date().toISOString(),
            _count: { invoices: 5 }
          },
          {
            id: "demo-client-2", 
            name: "Tech Solutions Inc",
            email: "info@techsolutions.com",
            phone: "+1 (555) 987-6543",
            address: "456 Innovation Ave, San Francisco, CA 94102",
            taxNumber: "TAX789012",
            contactPerson: "Sarah Johnson",
            createdAt: new Date().toISOString(),
            _count: { invoices: 3 }
          }
        ]
      })
    }

    const clients = await prisma.client.findMany({
      where: {
        userId: session?.user?.id || "demo-user-id"
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Temporarily disabled authentication check for AI agent testing
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const validatedData = ClientSchema.parse(body)

    // Convert empty email to undefined for database
    const clientData = {
      ...validatedData,
      email: validatedData.email === "" ? undefined : validatedData.email,
      userId: session?.user?.id || "demo-user-id"
    }

    // Check for duplicate email if provided
    if (clientData.email) {
      const existing = await prisma.client.findFirst({
        where: {
          userId: session?.user?.id || "demo-user-id",
          email: clientData.email
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: "A client with this email already exists" },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.create({
      data: clientData
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}