import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { createPayment, deletePayment } from '@/app/lib/data-access/payments';
import { Payment } from '@/app/lib/definitions';

// Register a payment method bind to an event
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const { eventId, amount } = await request.json();
    if (!eventId || !amount) return NextResponse.json({ message: 'Champs manquants' }, { status: 400 });

    const payment: Payment | null = await createPayment(Number(session.user.id), Number(eventId), Number(amount));
    return payment
        ? NextResponse.json(payment, { status: 201 })
        : NextResponse.json({ message: 'Échec de la création du paiement.' }, { status: 500 });
}

// Unregister a payment method bind to an event
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        if (!eventId) {
            return NextResponse.json({ message: 'Paramètres manquants' }, { status: 400 });
        }

        const success = await deletePayment(Number(session.user.id), Number(eventId));
        return success
        ? NextResponse.json({ success: true }, { status: 200 })
        : NextResponse.json({ message: 'Échec de la suppression du paiement.' }, { status: 500 });
    } catch (error) {
        console.error('Erreur DELETE payments:', error);
        return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
    }
}

