import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth/options';
import { deleteUserAccount } from '@/app/lib/data-access/users';
import { sendNotificationEmail } from '@/app/lib/services/email';
import { AccountDeletedEmail } from '@/app/lib/email-templates/AccountDeletedEmail';

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
        }

        const userId = Number(session.user.id);
        const userEmail = session.user.email;
        const userFirstName = session.user.firstName;
        const userLastName = session.user.lastName;

        const success = await deleteUserAccount(userId);

        if (success) {
            // Send email
            try {
                const html = AccountDeletedEmail(userFirstName, userLastName);
                await sendNotificationEmail(userEmail, "Votre compte a été supprimé", html);
            } catch (err) {
                console.error("Erreur lors de l'envoi de l'email de suppression :", err);
            }

            return NextResponse.json({ message: 'Votre compte a été supprimé avec succès.' });
        } else {
            return NextResponse.json({ message: 'Échec de la suppression du compte.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        return NextResponse.json({ message: 'Une erreur est survenue.' }, { status: 500 });
    }
}