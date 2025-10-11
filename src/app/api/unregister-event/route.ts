import { NextResponse } from 'next/server';
import { unregisterFromEvent } from '@/app/lib/data-access/events';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Vous devez être connecté pour annuler une inscription.' }, { status: 401 });
    }

    const { event_id, user_id } = await request.json();

    // Basic validation
    if (!event_id || !user_id) {
      return NextResponse.json({ message: 'ID d\'événement ou d\'utilisateur manquant.' }, { status: 400 });
    }

    // Ensure the userId from the request body matches the session userId for security
    if (user_id !== session.user.id) {
      return NextResponse.json({ message: 'Accès non autorisé.' }, { status: 403 });
    }

    const success = await unregisterFromEvent(user_id, Number(event_id));

    if (success) {
      return NextResponse.json({ message: 'Désinscription de l\'événement réussie.' }, { status: 200 });
    } else {
      // The unregisterFromEvent function already logs specific errors
      return NextResponse.json({ message: 'Erreur lors de la désinscription de l\'événement. Vous n\'êtes peut-être pas inscrit.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la désinscription de l\'événement (API):', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de la désinscription.' }, { status: 500 });
  }
}
