import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/subscription-service';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    subscriber?: {
      email_address: string;
    };
    status?: string;
    billing_plan_id?: string;
    custom_id?: string;
    [key: string]: any;
  };
}

// Verify PayPal webhook signature
async function verifyPayPalWebhookSignature(
  req: NextRequest,
  event: PayPalWebhookEvent
): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('PayPal credentials not configured');
    return false;
  }

  try {
    // Get transmission details from headers
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('Missing PayPal webhook headers');
      return false;
    }

    // Get the raw body for signature verification
    const body = await req.text();

    // Construct the expected signature
    const expectedSigPayload = `${transmissionId}|${transmissionTime}|${event.id}|${body}`;

    // Get PayPal's certificate
    const certResponse = await fetch(certUrl);
    if (!certResponse.ok) {
      console.error('Failed to fetch PayPal certificate');
      return false;
    }

    const certificate = await certResponse.text();

    // Verify the signature using crypto
    const crypto = await import('crypto');
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(expectedSigPayload);

    const isValid = verifier.verify(certificate, transmissionSig, 'base64');
    return isValid;
  } catch (error) {
    console.error('PayPal signature verification error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const event: PayPalWebhookEvent = JSON.parse(bodyText);

    // Verify PayPal webhook signature
    const isValid = await verifyPayPalWebhookSignature(req, event);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const email = event.resource.subscriber?.email_address;
    const subscriptionId = event.resource.id;

    if (!email) {
      return NextResponse.json({ message: 'No email found' }, { status: 400 });
    }

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED': {
        // Extract plan type from custom_id or billing_plan_id
        const planType = (event.resource.custom_id || 'pro') as any;

        await subscriptionService.createOrUpdateSubscription(
          email,
          planType,
          'paypal',
          subscriptionId,
          'active'
        );

        await subscriptionService.logSubscriptionEvent(
          email,
          'subscription_created',
          'paypal',
          event.id,
          { subscriptionId }
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscription = await subscriptionService.getUserSubscription(email);
        if (!subscription) {
          // Create subscription if it doesn't exist
          await subscriptionService.createOrUpdateSubscription(
            email,
            'pro',
            'paypal',
            subscriptionId,
            'active'
          );
        }

        await subscriptionService.logSubscriptionEvent(
          email,
          'subscription_created',
          'paypal',
          event.id,
          { status: 'activated' }
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const status =
          event.resource.status === 'ACTIVE' ? 'active' : 'past_due';
        await subscriptionService.updateSubscriptionStatus(email, status);

        await subscriptionService.logSubscriptionEvent(
          email,
          'subscription_updated',
          'paypal',
          event.id,
          { status: event.resource.status }
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        await subscriptionService.updateSubscriptionStatus(email, 'cancelled');

        await subscriptionService.logSubscriptionEvent(
          email,
          'subscription_cancelled',
          'paypal',
          event.id,
          {}
        );
        break;
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        await subscriptionService.updateSubscriptionStatus(email, 'past_due');

        await subscriptionService.logSubscriptionEvent(
          email,
          'subscription_updated',
          'paypal',
          event.id,
          { status: 'suspended' }
        );
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        await subscriptionService.logSubscriptionEvent(
          email,
          'payment_success',
          'paypal',
          event.id,
          { amount: event.resource.amount }
        );
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED': {
        await subscriptionService.logSubscriptionEvent(
          email,
          'payment_failed',
          'paypal',
          event.id,
          { status: event.resource.status }
        );
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return NextResponse.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
