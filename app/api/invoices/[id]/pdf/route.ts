import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createInvoicePDF } from '@/app/lib/pdf-generator-enhanced';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Get user ID from authentication (simplified for demo)
    const userId = 'demo-user-1'; // Match the userId from our seed data

    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId,
      },
      include: {
        client: true,
        items: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if user is on free tier
    const isFreeTier = invoice.user?.plan === 'free';

    // Generate PDF buffer using the enhanced generator
    const pdfBuffer = await createInvoicePDF(invoice, isFreeTier);

    // Return PDF with proper headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative endpoint for generating PDF as base64 (for preview)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const userId = 'user_1'; // In real app, get from auth

    // Fetch invoice data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId,
      },
      include: {
        client: true,
        items: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const isFreeTier = invoice.user?.plan === 'free';

    // Generate PDF buffer
    const pdfBuffer = await createInvoicePDF(invoice, isFreeTier);

    // Convert buffer to base64 for JSON response
    const pdfBase64 = pdfBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      contentType: 'application/pdf',
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}