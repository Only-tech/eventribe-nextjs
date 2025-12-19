import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

export async function POST(request: Request) {
    try {
        // If in prod, I will add stripeCustomerId from the BDD via userId

        const setupIntent = await stripe.setupIntents.create({
            payment_method_types: ['card', 'paypal'],
        });

        return NextResponse.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
        console.error('Erreur Stripe:', error);
        return NextResponse.json({ error: 'Erreur lors de l\'initialisation' }, { status: 500 });
    }
}