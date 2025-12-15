'use server';

import { revalidatePath } from 'next/cache';
import { registerForEvent, unregisterFromEvent, fetchEventById } from '@/app/lib/data-access/events';
import { Event } from '@/app/lib/definitions';

/**
 * Action to register a user to an event.
 */
export async function registerAction(userId: number, eventId: number): Promise<{ success: boolean }> {
    
    if (!userId) return { success: false };

    const success = await registerForEvent(userId, eventId);

    if (success) {
        revalidatePath(`/event/${eventId}`);
        revalidatePath('/my-events');
    }
    return { success };
}


/**
 * Action to unregister a user to an event.
 */
export async function unregisterAction(userId: number, eventId: number): Promise<{ success: boolean, message?: string }> {
    
    if (!userId) return { success: false, message: "Utilisateur non authentifié." };

    const event: Event | null = await fetchEventById(eventId);
    
    if (!event) {
        return { success: false, message: "Événement introuvable." };
    }
    
    // Check event date when trying to unregister less than 48h
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const limitTime = 48 * 60 * 60 * 1000; 

    // The difference between eventDate and now less than 48h and if the event has passed
    if (eventDate.getTime() - now.getTime() < limitTime) {
         return { 
            success: false, 
            message: "Annulation impossible moins de 48h avant l'événement." 
        };
    }

    const success = await unregisterFromEvent(userId, eventId);
    
    if (success) {
        revalidatePath(`/event/${eventId}`);
        revalidatePath('/my-events');
        return { success: true, message: `Vous êtes désinscrit(e) de l'événement "${event.title}" !` };
    }
    
    return { success: false, message: "Erreur lors de la désinscription. Vous n'êtes peut-être pas inscrit." };
}