import { NextResponse } from 'next/server';
import { loginUser } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: 'Veuillez remplir tous les champs.' }, { status: 400 });
    }

    // Attempt to log in the user
    const user = await loginUser(email, password);

    if (user) {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { password_hash: _password_hash, ...userWithoutHash } = user; // Destructure to exclude password_hash
      return NextResponse.json({ message: 'Connexion réussie !', user: userWithoutHash }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Email ou mot de passe incorrect.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error during login API:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de la connexion.' }, { status: 500 });
  }
}
