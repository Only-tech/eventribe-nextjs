import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/app/lib/data-access/users';
import { createResetCode } from '@/app/lib/data-access/passwordResets';
import { sendNotificationEmail } from '@/app/lib/services/email';
import { VerificationCodeEmail } from '@/app/lib/email-templates/VerificationCodeEmail';


export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ message: 'Email requis.' }, { status: 400 });

        const user = await getUserByEmail(email);
        if (!user) return NextResponse.json({ message: 'Aucun compte avec cet email.' }, { status: 404 });

        // Generate OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const created = await createResetCode(user.id, code, expiresAt);
        if (!created) return NextResponse.json({ message: 'Échec création code.' }, { status: 500 });

        // send email
        const html = VerificationCodeEmail(code, email);
        await sendNotificationEmail(email, "Réinitialisation du mot de passe", html);

        return NextResponse.json({ message: 'Code envoyé.' }, { status: 200 });
    } catch (err) {
        console.error('Erreur send-reset-code:', err);
        return NextResponse.json({ message: 'Erreur serveur.' }, { status: 500 });
    }
}
