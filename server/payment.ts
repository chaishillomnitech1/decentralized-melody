import Stripe from 'stripe';
import { storage } from './storage-db';

let stripe: Stripe | null = null;

// Initialize Stripe only if we have the secret key
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  });
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: { itemType: string; itemId: string; userId?: string }
) {
  if (!stripe) {
    throw new Error('Stripe not configured - secret key required');
  }

  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function handleSuccessfulPayment(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    const { itemType, itemId, userId } = paymentIntent.metadata;
    
    if (itemType === 'nft' && itemId && userId) {
      // Mark NFT as sold and assign to buyer
      await storage.buyNFT(parseInt(itemId), parseInt(userId));
      
      // Here you would also trigger NFT minting on blockchain
      // For now, we'll just mark as sold in database
      
      return {
        success: true,
        message: 'NFT purchased successfully',
        nftId: itemId
      };
    }
  }
  
  return { success: false, message: 'Payment not processed' };
}

export async function createSubscription(customerId: string, priceId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export { stripe };