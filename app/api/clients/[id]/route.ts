import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const DEMO_USER_ID = 'demo-user-1';

const UpdateClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: DEMO_USER_ID,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = UpdateClientSchema.parse(body);

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: DEMO_USER_ID,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        address: validatedData.address || null,
        phone: validatedData.phone || null,
        taxNumber: validatedData.taxNumber || null,
        contactPerson: validatedData.contactPerson || null,
      },
    });

    return NextResponse.json({
      success: true,
      client: updatedClient,
    });
  } catch (error) {
    console.error('Error updating client:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: DEMO_USER_ID,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client has any invoices
    const clientInvoices = await prisma.invoice.findMany({
      where: { clientId: id },
    });

    if (clientInvoices.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete client with existing invoices' },
        { status: 400 }
      );
    }

    // Delete client
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}