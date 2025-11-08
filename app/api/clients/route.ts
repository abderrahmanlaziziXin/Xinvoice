import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/request-user';

const ClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
});

// GET /api/clients - Get user's clients
export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: missing DEFAULT_USER_ID or DEMO_MODE=true. Set DEFAULT_USER_ID in environment.' 
      }, { status: 401 });
    }

    try {
      const clients = await prisma.client.findMany({
        where: { userId },
        include: {
          _count: {
            select: { invoices: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ clients })
    } catch (dbError) {
      console.error("Database error fetching clients:", dbError)
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ClientSchema.parse(body);
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: missing DEFAULT_USER_ID or DEMO_MODE=true. Set DEFAULT_USER_ID in environment.' 
      }, { status: 401 });
    }

    try {
      const newClient = await prisma.client.create({
        data: {
          userId,
          name: validatedData.name,
          email: validatedData.email || null,
          phone: validatedData.phone || null,
          address: validatedData.address || null,
          taxNumber: validatedData.taxNumber || null,
          contactPerson: validatedData.contactPerson || null,
        },
        include: {
          _count: {
            select: { invoices: true }
          }
        }
      })

      return NextResponse.json({ client: newClient }, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating client:", dbError)
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating client:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
