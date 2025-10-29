import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"
import { z } from "zod"

const ClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
})

// GET /api/clients/[id] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/clients/[id] - Update client
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
    const validatedData = ClientSchema.parse(body)

    // Convert empty email to undefined for database
    const clientData = {
      ...validatedData,
      email: validatedData.email === "" ? undefined : validatedData.email,
    }

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check for duplicate email if provided and different from current
    if (clientData.email && clientData.email !== existingClient.email) {
      const duplicate = await prisma.client.findFirst({
        where: {
          userId: session.user.id,
          email: clientData.email,
          id: { not: params.id }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: "A client with this email already exists" },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: clientData
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error("Error updating client:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if client has invoices
    if (existingClient._count.invoices > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with existing invoices" },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}