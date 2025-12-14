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

    // Check credentials
    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json({ message: 'Email ou mot de passe incorrect.' }, { status: 401 });
    }

    // Generate OTP code
    const isTwoFactorEnabled = !!user.two_factor_enabled;

    if (isTwoFactorEnabled) {
        // Activated 2FA 
        const digits = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create "ev - 123456" format
        const formattedCode = `ev - ${digits}`;
        
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Save full code ("ev - 123456") in BDD
        await setTwoFactorCode(user.id, formattedCode, expiresAt);

        // Send email
        const html = VerificationCodeEmail(formattedCode, email);
        await sendNotificationEmail(email, "Votre code de connexion sécurisé", html);

        // 2FA required"
        return NextResponse.json({ 
            require2FA: true, 
            userId: user.id,
            message: 'Code envoyé'
        }, { status: 200 });
    } else {
        // No 2FA
        return NextResponse.json({ 
            require2FA: false, 
            userId: user.id,
            message: 'Connexion autorisée'
        }, { status: 200 });
    }

  } catch (error) {
    console.error('Erreur login 2FA:', error);
    return NextResponse.json({ message: 'Erreur interne est survenue lors de la connexion..' }, { status: 500 });
  }
}