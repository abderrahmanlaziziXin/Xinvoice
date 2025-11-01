import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPaymentSession } from '@/app/lib/stripe-service';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreatePaymentSchema = z.object({
  invoiceId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, successUrl, cancelUrl } = CreatePaymentSchema.parse(body);

    // Fetch invoice with client details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // Use client email or fallback to a default
    const customerEmail = invoice.client?.email || 'customer@example.com';
    const customerName = invoice.client?.name || 'Customer';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const defaultSuccessUrl = `${baseUrl}/invoice/${invoice.viewToken}/success`;
    const defaultCancelUrl = `${baseUrl}/invoice/${invoice.viewToken}`;

    // Create Stripe checkout session
    const paymentResult = await createPaymentSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerEmail,
      customerName,
      amount: invoice.total,
      currency: invoice.currency,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      metadata: {
        userId: invoice.userId,
        clientId: invoice.clientId || '',
      },
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Failed to create payment session' },
        { status: 500 }
      );
    }

    // Record payment event
    await prisma.paymentEvent.create({
      data: {
        invoiceId: invoice.id,
        stripePaymentId: paymentResult.sessionId!,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        paymentMethod: 'stripe_checkout',
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: paymentResult.sessionId,
      url: paymentResult.url,
    });
  } catch (error) {
    console.error('Payment session creation error:', error);

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