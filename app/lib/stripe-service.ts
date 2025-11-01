import Stripe from 'stripe';

// Initialize Stripe with API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface CreatePaymentSessionData {
  invoiceId: string;
  invoiceNumber: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentSessionResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout session for invoice payment
 */
export async function createPaymentSession(
  data: CreatePaymentSessionData
): Promise<PaymentSessionResult> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: `Invoice ${data.invoiceNumber}`,
              description: `Payment for Invoice ${data.invoiceNumber}`,
            },
            unit_amount: Math.round(data.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      customer_email: data.customerEmail,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        invoiceId: data.invoiceId,
        invoiceNumber: data.invoiceNumber,
        ...data.metadata,
      },
      payment_intent_data: {
        metadata: {
          invoiceId: data.invoiceId,
          invoiceNumber: data.invoiceNumber,
        },
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment session creation failed',
    };
  }
}

/**
 * Retrieve a Stripe Checkout session
 */
export async function getPaymentSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return { success: true, session };
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve session',
    };
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<{ success: boolean; event?: Stripe.Event; error?: string }> {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return { success: true, event };
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook verification failed',
    };
  }
}

/**
 * Create a Stripe customer
 */
export async function createStripeCustomer(data: {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: data.metadata,
    });

    return { success: true, customer };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    };
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
    };
  }
}

export { stripe };