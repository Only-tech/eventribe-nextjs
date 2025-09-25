'use server';

import { revalidatePath } from 'next/cache';
import { registerForEvent, unregisterFromEvent } from './data';

/**
 * Action to register a user to an event.
 */
export async function registerAction(userId: string, eventId: number): Promise<{ success: boolean }> {
  if (!userId) return { success: false };
  await registerForEvent(userId, eventId);
  revalidatePath(`/event/${eventId}`);
  revalidatePath('/my-events');
  return { success: true };
}


/**
 * Action to unregister a user to an event.
 */
export async function unregisterAction(userId: string, eventId: number): Promise<{ success: boolean }> {
  if (!userId) return { success: false };
  await unregisterFromEvent(userId, eventId);
  revalidatePath(`/event/${eventId}`);
  revalidatePath('/my-events');
  return { success: true };
}
