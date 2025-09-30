import { NextResponse } from 'next/server';
import { verifyCode } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Veuillez fournir l\'email et le code.' }, { status: 400 });
    }

    const isValid = await verifyCode(email, code);

    if (isValid) {
      return NextResponse.json({ message: 'Code vérifié avec succès.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Code invalide ou expiré.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}