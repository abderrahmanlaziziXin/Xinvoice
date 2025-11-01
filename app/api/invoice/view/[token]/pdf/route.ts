import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createInvoicePDF } from '@/lib/pdf-generator';

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

    // Transform data for PDF generation
    const invoiceData = {
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
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      items: invoice.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency || 'USD',
      notes: invoice.notes,
      terms: invoice.terms,
    };

    // Generate PDF
    const pdfBuffer = await createInvoicePDF(invoiceData, false); // No watermark for public viewing

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating public invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}