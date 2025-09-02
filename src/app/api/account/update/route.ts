import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { updateUser } from '@/app/lib/auth';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { email, username } = await request.json();

    if (!email || !username) {
      return NextResponse.json({ message: 'Email et nom d\'utilisateur requis.' }, { status: 400 });
    }

  
    const success = await updateUser(session.user.id, { email, username });

    if (success) {
      return NextResponse.json({ message: 'Profil mis à jour avec succès.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Échec de la mise à jour du profil.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil de l\'utilisateur:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
