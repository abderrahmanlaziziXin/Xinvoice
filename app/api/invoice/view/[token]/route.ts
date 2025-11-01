import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Find the invoice by token
    const invoice = await prisma.invoice.findFirst({
      where: {
        viewToken: token,
      },
      include: {
        client: true,
        user: true,
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      );
    }

    // Update the invoice status to VIEWED if it was SENT
    if (invoice.status === 'SENT') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'VIEWED' },
      });
    }

    // Calculate totals
    const subtotal = invoice.items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = subtotal * invoice.taxRate;
    const total = subtotal + taxAmount;

    const responseInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      client: {
        name: invoice.client?.name || 'Unknown Client',
        email: invoice.client?.email || '',
        address: invoice.client?.address || '',
      },
      user: {
        name: invoice.user.name,
        companyName: invoice.user.companyName,
        companyAddress: invoice.user.companyAddress,
        companyPhone: invoice.user.companyPhone,
      },
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status === 'SENT' ? 'VIEWED' : invoice.status,
      items: invoice.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subtotal,
      taxRate: invoice.taxRate,
      taxAmount,
      total,
      currency: invoice.currency || 'USD',
      notes: invoice.notes,
      terms: invoice.terms,
    };

    return NextResponse.json({ invoice: responseInvoice });
  } catch (error) {
    console.error('Error fetching public invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}