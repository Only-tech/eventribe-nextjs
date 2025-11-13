import { NextResponse } from 'next/server';
import { generateAndSendCode } from '@/app/lib/services/email';
import { isEmailAlreadyRegistered } from '@/app/lib/data-access/users';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'Veuillez fournir un email.' }, { status: 400 });
        }

        const alreadyRegistered = await isEmailAlreadyRegistered(email);
        if (alreadyRegistered) {
            return NextResponse.json(
                { message: "Cet email est déjà enregistré. Redirection vers la connexion..." },
                { status: 409 }
            );
        }

        const success = await generateAndSendCode(email);

        if (success) {
            return NextResponse.json({ message: 'Code de vérification envoyé !' }, { status: 200 });
        } else {
            return NextResponse.json(
                { message: "Échec de l'envoi du code. Veuillez réessayer." },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi du code:", error);
        return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
    }
}
