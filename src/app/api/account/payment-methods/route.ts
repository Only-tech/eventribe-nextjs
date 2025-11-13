import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { fetchPaymentMethods, addPaymentMethod } from '@/app/lib/data-access/payment-methods';

// List user payment-methods
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const methods = await fetchPaymentMethods(Number(session.user.id));
        return NextResponse.json(methods, { status: 200 });
    } catch (error) {
        console.error('Erreur lors du chargement des moyens de paiement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

// Add payment-methods
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const { card_brand, card_last4 } = await request.json();
        if (!card_brand || !card_last4) {
            return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });
        }

        const newMethod = await addPaymentMethod(Number(session.user.id), card_brand, card_last4);
        return NextResponse.json(newMethod, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de l’ajout du moyen de paiement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
