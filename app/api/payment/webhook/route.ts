import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { handleStripeWebhook } from '@/app/lib/stripe-service';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookResult = await handleStripeWebhook(body, signature);
    
    if (!webhookResult.success) {
      console.error('Webhook verification failed:', webhookResult.error);
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 400 }
      );
    }

    const event = webhookResult.event!;
    console.log('Processing Stripe webhook:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSucceeded(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Handle subscription invoice payments if needed
        console.log('Subscription payment succeeded');
        break;
      }

      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(session: Stripe.Checkout.Session) {
  try {
    const invoiceId = session.metadata?.invoiceId;
    
    if (!invoiceId) {
      console.error('No invoiceId in session metadata');
      return;
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Update payment event
    await prisma.paymentEvent.updateMany({
      where: {
        invoiceId,
        stripePaymentId: session.id,
      },
      data: {
        status: 'SUCCEEDED',
      },
    });

    console.log(`Invoice ${invoiceId} marked as paid`);

    // TODO: Send payment confirmation email
    // await sendPaymentConfirmationEmail(invoiceId);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    
    if (!invoiceId) {
      console.error('No invoiceId in payment intent metadata');
      return;
    }

    // This might be redundant with checkout.session.completed,
    // but provides extra reliability
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    console.log(`Payment intent succeeded for invoice ${invoiceId}`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    
    if (!invoiceId) {
      console.error('No invoiceId in payment intent metadata');
      return;
    }

    // Update payment event status
    await prisma.paymentEvent.updateMany({
      where: {
        invoiceId,
        stripePaymentId: paymentIntent.id,
      },
      data: {
        status: 'FAILED',
      },
    });

    console.log(`Payment failed for invoice ${invoiceId}`);

    // TODO: Send payment failed notification
    // await sendPaymentFailedEmail(invoiceId);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}