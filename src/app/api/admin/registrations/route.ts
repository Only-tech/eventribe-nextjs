import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

import { getParticipantsForEvent, unregisterFromEvent, getAllEventsWithRegistrationCount } from '@/app/lib/data';

// Helper function to check admin status
async function checkAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ message: 'Accès non autorisé. Vous devez être administrateur.' }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const authError = await checkAdminSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (eventId) {
      // If eventId is provided, fetch participants for that specific event
      const participants = await getParticipantsForEvent(Number(eventId));
      return NextResponse.json({ participants }, { status: 200 });
    } else {
      // Otherwise, fetch all events with their registration counts
      const events = await getAllEventsWithRegistrationCount();
      return NextResponse.json({ events }, { status: 200 });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions/événements (API):', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors du chargement des inscriptions.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkAdminSession();
  if (authError) return authError;

  try {
    const { action, userId, eventId } = await request.json();

    if (action === 'unregister_participant') {
      if (!userId || !eventId) {
        return NextResponse.json({ message: 'ID utilisateur ou ID événement manquant pour la désinscription.' }, { status: 400 });
      }

      const success = await unregisterFromEvent(userId, Number(eventId));
      if (success) {
        return NextResponse.json({ message: 'Participant désinscrit avec succès !' }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Erreur lors de la désinscription du participant.' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message: 'Action non valide.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la requête POST pour les inscriptions admin:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
