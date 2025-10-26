import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { updateUser } from '@/app/lib/data-access/users';
import { sendNotificationEmail } from '@/app/lib/services/email';
import { AccountUpdatedEmail } from '@/app/lib/email-templates/AccountUpdatedEmail';

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
        }

        const { email, firstName, lastName } = await request.json();

        if (!email || !firstName || !lastName) {
            return NextResponse.json({ message: "L'email, le prénom et le nom sont requis." }, { status: 400 });
        }

        const success = await updateUser(session.user.id, { email, firstName, lastName });

        if (success) {
            // Send email
            try {
                const html = AccountUpdatedEmail(firstName, lastName);
                await sendNotificationEmail(email, "Votre compte a été mis à jour", html);
            } catch (err) {
                console.error("Erreur lors de l'envoi de l'email de mise à jour :", err);
            }

            return NextResponse.json({ message: 'Profil mis à jour avec succès.' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Échec de la mise à jour du profil.' }, { status: 500 });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil de l'utilisateur:", error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
