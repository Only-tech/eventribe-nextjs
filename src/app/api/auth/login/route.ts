import { NextResponse } from 'next/server';
import { loginUser, setTwoFactorCode } from '@/app/lib/data-access/users';
import { sendNotificationEmail } from '@/app/lib/services/email';
import { VerificationCodeEmail } from '@/app/lib/email-templates/VerificationCodeEmail';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Veuillez remplir tous les champs.' }, { status: 400 });
    }

    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json({ message: 'Email ou mot de passe incorrect.' }, { status: 401 });
    }

    // Generate OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await setTwoFactorCode(user.id, code, expiresAt);

    // send email
    const html = VerificationCodeEmail(code, email);
    await sendNotificationEmail(email, "Votre code de connexion", html);

    return NextResponse.json({ require2FA: true, userId: user.id }, { status: 200 });
  } catch (error) {
    console.error('Erreur login 2FA:', error);
    return NextResponse.json({ message: 'Erreur interne est survenue lors de la connexion..' }, { status: 500 });
  }
}