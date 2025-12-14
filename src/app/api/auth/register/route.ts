import { NextResponse } from 'next/server';
import { finalRegisterUser } from '@/app/lib/data-access/users';


export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, password, confirm_password, enable2FA } = await request.json();

    // Basic validation
    if (!email || !firstName || !lastName || !password || !confirm_password) {
      return NextResponse.json({ message: 'Veuillez remplir tous les champs.' }, { status: 400 });
    }

    if (password !== confirm_password) {
      return NextResponse.json({ message: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json({ message: 'Le mot de passe doit contenir au moins 12 caractères.' }, { status: 400 });
    }

    // Password character Validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\];':"\\|,.\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
      return NextResponse.json({ message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.' }, { status: 400 });
    }

    // Attempt to register the user
    const success = await finalRegisterUser(email, firstName, lastName, password, !!enable2FA);

    if (success) {
      return NextResponse.json({ message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' }, { status: 201 });
    } else {
      // Errors for expired verification or already registered email,
      return NextResponse.json({ message: "Échec de l'inscription. L'email est peut-être déjà utilisé ou la vérification a échoué." }, { status: 409 });
    }
  } catch (error) {
    console.error('Error during registration API:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de l\'inscription.' }, { status: 500 });
  }
}
