import { NextResponse } from 'next/server';
import { registerUser } from '@/app/lib/auth';

const verifyCaptcha = async (token: string) => {
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });
  const data = await res.json();
  return data.success && data.score > 0.5;
};


export async function POST(request: Request) {
  try {
    const { username, email, password, confirm_password, captcha } = await request.json();

    if (!captcha || !(await verifyCaptcha(captcha))) {
      return NextResponse.json({ message: 'Échec de la vérification du captcha.' }, { status: 403 });
    }

    // Basic validation
    if (!username || !email || !password || !confirm_password) {
      return NextResponse.json({ message: 'Veuillez remplir tous les champs.' }, { status: 400 });
    }

    if (password !== confirm_password) {
      return NextResponse.json({ message: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    // Attempt to register the user
    const success = await registerUser(username, email, password);

    if (success) {
      return NextResponse.json({ message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }, { status: 201 });
    } else {
      // The registerUser function already logs specific errors,
      return NextResponse.json({ message: "Le nom d'utilisateur ou l'email existe déjà." }, { status: 409 });
    }
  } catch (error) {
    console.error('Error during registration API:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de l\'inscription.' }, { status: 500 });
  }
}
