'use server';

import { revalidatePath } from 'next/cache';
import { registerForEvent, unregisterFromEvent } from '@/app/lib/data-access/events';

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
export async function unregisterAction(userId: number, eventId: number): Promise<{ success: boolean }> {
  
  if (!userId) return { success: false };

  const success = await unregisterFromEvent(userId, eventId);
  
  if (success) {
    revalidatePath(`/event/${eventId}`);
    revalidatePath('/my-events');
  }
  return { success };
}