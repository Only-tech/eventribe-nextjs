import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth/options';
import { deleteUserAccount } from '@/app/lib/data-access/users';

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const success = await deleteUserAccount(userId);

        if (success) {
        return NextResponse.json({ message: 'Votre compte a été supprimé avec succès.' });
        } else {
        return NextResponse.json({ message: 'Échec de la suppression du compte.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        return NextResponse.json({ message: 'Une erreur est survenue.' }, { status: 500 });
    }
}