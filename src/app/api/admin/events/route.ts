import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

import { createEvent, updateEvent, deleteEvent } from '@/app/lib/data-access/events';

// Helper function to check admin status
async function checkAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ message: 'Accès non autorisé. Vous devez être administrateur.' }, { status: 403 });
  }
  return null;
}

export async function POST(request: Request) {

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const authError = await checkAdminSession();
  
  if (authError) return authError;

  try {
    const { action, ...eventData } = await request.json();

    if (action === 'create') {
      const { title, description_short, description_long, event_date, location, available_seats, image_url } = eventData;

      if (!title || !event_date || !location || available_seats === undefined) {
        return NextResponse.json({ message: 'Veuillez remplir tous les champs obligatoires pour la création de l\'événement.' }, { status: 400 });
      }

      const success = await createEvent({
        title,
        description_short: description_short || '',
        description_long: description_long || '',
        event_date,
        location,
        available_seats: Number(available_seats),
        image_url: image_url || null,
        created_by: session.user.id
      });

      if (success) {
        return NextResponse.json({ message: 'Événement créé avec succès !' }, { status: 201 });
      } else {
        return NextResponse.json({ message: 'Erreur lors de la création de l\'événement.' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message: 'Action non valide pour la méthode POST.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la requête POST pour les événements admin:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const authError = await checkAdminSession();
  
  if (authError) return authError;

  try {
    const { id, ...eventData } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID de l\'événement manquant pour la modification.' }, { status: 400 });
    }

    const { title, description_short, description_long, event_date, location, available_seats, image_url } = eventData;

    if (!title || !event_date || !location || available_seats === undefined) {
      return NextResponse.json({ message: 'Veuillez remplir tous les champs obligatoires pour la modification de l\'événement.' }, { status: 400 });
    }

    const success = await updateEvent(Number(id), {
      title,
      description_short: description_short || '',
      description_long: description_long || '',
      event_date,
      location,
      available_seats: Number(available_seats),
      image_url: image_url || null,
      created_by: session.user.id,
    });

    if (success) {
      return NextResponse.json({ message: 'Événement mis à jour avec succès !' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Erreur lors de la mise à jour de l\'événement.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la requête PUT pour les événements admin:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await checkAdminSession();
  if (authError) return authError;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: 'ID de l\'événement manquant pour la suppression.' }, { status: 400 });
    }

    const success = await deleteEvent(Number(id));

    if (success) {
      return NextResponse.json({ message: 'Événement supprimé avec succès !' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Erreur lors de la suppression de l\'événement.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la requête DELETE pour les événements admin:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

// GET method to fetch all events for the management page
export async function GET() {
  const authError = await checkAdminSession();
  if (authError) return authError;

  try {
    const { getAllEventsWithRegistrationCount } = await import('@/app/lib/data-access/events'); // Lazy import for GET only
    const events = await getAllEventsWithRegistrationCount();
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour l\'admin:', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors du chargement des événements.' }, { status: 500 });
  }
}
