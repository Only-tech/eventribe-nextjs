import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { deletePaymentMethod, fetchPaymentMethods } from '@/app/lib/data-access/payment-methods';


// DELETE user payment-methods
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        // Verify user's own card
        const { id } = await context.params;
        const methods = await fetchPaymentMethods(Number(session.user.id));
        const method = methods.find(m => m.id === Number(id));
        if (!method) {
            return NextResponse.json({ message: 'Moyen de paiement non trouvé ou non autorisé.' }, { status: 403 });
        }

        await deletePaymentMethod(Number(id));
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la suppression du moyen de paiement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

