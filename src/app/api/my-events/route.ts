import { NextResponse } from 'next/server';
import { fetchRegisteredEventsForUser } from '@/app/lib/data-access/events';
import { getServerSession } from 'next-auth'; 
import { authOptions } from '@/app/lib/auth/options';


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions); 
    // Check if the user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Vous devez être connecté pour voir vos inscriptions.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Ensure the userId from the query matches the session userId for security
    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ message: 'Accès non autorisé.' }, { status: 403 });
    }

    const events = await fetchRegisteredEventsForUser(userId);

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements inscrits:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors du chargement de vos inscriptions.' }, { status: 500 });
  }
}
