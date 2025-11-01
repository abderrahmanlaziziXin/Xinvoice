import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail } from '@/app/lib/email-service';
import { z } from 'zod';

const SendInvoiceSchema = z.object({
  recipientEmail: z.string().email('Invalid email address').optional(),
  senderEmail: z.string().email('Invalid sender email'),
  senderName: z.string().min(1, 'Sender name is required'),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = SendInvoiceSchema.parse(body);
    const invoiceId = params.id;
    const demoUserId = 'demo-user-1';

    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: demoUserId,
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

    if (!invoice.client?.email && !validatedData.recipientEmail) {
      return NextResponse.json(
        { error: 'No recipient email available. Please provide an email address.' },
        { status: 400 }
      );
    }

    const recipientEmail = validatedData.recipientEmail || invoice.client!.email!;

    // Generate secure view token if not exists
    let viewToken = invoice.viewToken;
    if (!viewToken) {
      viewToken = generateSecureToken();
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { viewToken }
      });
    }

    // Create view URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const viewUrl = `${baseUrl}/invoice/${viewToken}`;

    // Send email
    const emailResult = await sendInvoiceEmail({
      invoice: {
        ...invoice,
        user: invoice.user,
      },
      recipientEmail,
      senderEmail: validatedData.senderEmail,
      senderName: validatedData.senderName,
      viewUrl,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update invoice status and tracking
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Record email event
    await prisma.emailEvent.create({
      data: {
        invoiceId,
        type: 'INVOICE_SENT',
        recipient: recipientEmail,
        subject: `Invoice ${invoice.invoiceNumber}`,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      messageId: emailResult.messageId,
      viewUrl,
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    
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

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}