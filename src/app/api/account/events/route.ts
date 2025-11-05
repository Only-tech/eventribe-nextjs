import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { createEvent, updateEvent, deleteEvent, fetchEventsByUserId, fetchUserEventById } from '@/app/lib/data-access/events';

// Handles GET requests to fetch events created by the logged-in user
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const events = await fetchEventsByUserId(Number(session.user.id));
        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

// Handles POST requests to create a new event for the logged-in user
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const { title, description_short, description_long, event_date, location, available_seats, image_url, price } = await request.json();

        if (!title || !event_date || !location || available_seats === undefined) {
            return NextResponse.json({ message: 'Veuillez remplir tous les champs obligatoires pour la création de l\'événement.' }, { status: 400 });
        }

        const newEvent = {
            title,
            description_short: description_short || '',
            description_long: description_long || '',
            event_date,
            location,
            available_seats: Number(available_seats),
            image_url: image_url || null,
            price: Number(price) || 0,
            created_by: session.user.id,
        };

        const success = await createEvent(newEvent);

        if (success) {
            return NextResponse.json({ message: 'Événement créé avec succès.', event: newEvent }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Échec de la création de l\'événement.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

// Handles PUT requests to update an existing event for the logged-in user
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const { id, ...safeData } = await request.json();

        // First, check if the event exists and belongs to the user
        const event = await fetchUserEventById(Number(session.user.id), id);
        if (!event) {
            return NextResponse.json({ message: 'Événement non trouvé ou non autorisé.' }, { status: 403 });
        }

        const success = await updateEvent(id, safeData);

        if (success) {
            return NextResponse.json({ message: 'Événement mis à jour avec succès.' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Échec de la mise à jour de l\'événement.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}

// Handles DELETE requests to delete an event for the logged-in user
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    try {
        const { eventId } = await request.json();

        // First, check if the event exists and belongs to the user
        const event = await fetchUserEventById(Number(session.user.id), eventId);
        if (!event) {
            return NextResponse.json({ message: 'Événement non trouvé ou non autorisé.' }, { status: 403 });
        }

        const success = await deleteEvent(eventId);

        if (success) {
            return NextResponse.json({ message: 'Événement supprimé avec succès.' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Échec de la suppression de l\'événement.' }, { status: 500 });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}
