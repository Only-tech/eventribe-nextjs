import { NextResponse } from 'next/server';
import { unregisterFromEvent, fetchEventById } from '@/app/lib/data-access/events';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Vous devez être connecté pour annuler une inscription.' },
        { status: 401 }
      );
    }

    const { event_id, user_id } = await request.json();

    if (!event_id || !user_id) {
      return NextResponse.json(
        { message: "ID d'événement ou d'utilisateur manquant." },
        { status: 400 }
      );
    }

    if (user_id !== session.user.id) {
      return NextResponse.json({ message: 'Accès non autorisé.' }, { status: 403 });
    }

    const event = await fetchEventById(Number(event_id));
    if (!event) {
      return NextResponse.json(
        { message: "Événement introuvable." },
        { status: 404 }
      );
    }

    const success = await unregisterFromEvent(user_id, Number(event_id));

    if (success) {
      return NextResponse.json(
        { message: `Vous êtes désinscrit(e) de l'événement "${event.title}" !` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Erreur lors de la désinscription. Vous n'êtes peut-être pas inscrit." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la désinscription de l’événement (API):', error);
    return NextResponse.json(
      { message: 'Une erreur interne est survenue lors de la désinscription.' },
      { status: 500 }
    );
  }
}
