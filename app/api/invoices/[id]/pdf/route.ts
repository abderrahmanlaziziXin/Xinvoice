import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { InvoicePDFGenerator } from '@/app/lib/pdf-generator';
import { resolveUserId } from '@/lib/request-user';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    // Resolve user ID using the same logic as other routes
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: set DEFAULT_USER_ID or enable DEMO_MODE=true.' 
      }, { status: 401 });
    }

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

    // Generate PDF using the PDF generator
    const generator = new InvoicePDFGenerator({ 
      includeWatermark: isFreeTier,
      customTemplate: 'modern' 
    });
    
    // Convert invoice to expected format for PDF generator
    const invoiceData = {
      type: 'invoice' as const,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date.toISOString().split('T')[0],
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      currency: (invoice.currency as any) || 'USD',
      locale: (invoice.locale as any) || 'en-US',
      from: {
        name: invoice.user?.companyName || invoice.user?.name || 'Your Company',
        email: invoice.user?.email || '',
        address: '',
        phone: ''
      },
      to: {
        name: invoice.client?.name || 'Client',
        email: invoice.client?.email || '',
        address: invoice.client?.address || '',
        phone: invoice.client?.phone || ''
      },
      items: invoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        taxRate: item.taxRate || 0
      })) || [],
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      terms: invoice.terms || '',
      notes: invoice.notes || ''
    };
    
    const pdfDataUri = generator.generateInvoicePDF(invoiceData);
    
    // Convert data URI to buffer
    const base64Data = pdfDataUri.split(',')[1];
    const pdfBuffer = Buffer.from(base64Data, 'base64');

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
    
    // Resolve user ID using the same logic as other routes
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: set DEFAULT_USER_ID or enable DEMO_MODE=true.' 
      }, { status: 401 });
    }

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

    // Generate PDF using the PDF generator
    const generator = new InvoicePDFGenerator({ 
      includeWatermark: isFreeTier,
      customTemplate: 'modern' 
    });
    
    // Convert invoice to expected format
    const invoiceData = {
      ...invoice,
      from: {
        name: invoice.user?.name || 'Your Company',
        email: invoice.user?.email || '',
        address: invoice.user?.address || '',
        phone: invoice.user?.phone || ''
      },
      to: {
        name: invoice.client?.name || 'Client',
        email: invoice.client?.email || '',
        address: invoice.client?.address || '',
        phone: invoice.client?.phone || ''
      }
    };
    
    const pdfDataUri = generator.generateInvoicePDF(invoiceData);
    
    // Extract base64 data from data URI
    const pdfBase64 = pdfDataUri.split(',')[1];

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