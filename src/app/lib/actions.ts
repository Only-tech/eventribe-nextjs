'use server';

import { revalidatePath } from 'next/cache';
import { registerForEvent, unregisterFromEvent } from './data';

/**
 * Action to register a user to an event.
 */
export async function registerAction(userId: string, eventId: number) {
  if (!userId) {
    throw new Error('User ID is required to register.');
  }
  await registerForEvent(userId, eventId);
  revalidatePath(`/event/${eventId}`);
  revalidatePath('/my-events');
}

/**
 * Action to unregister a user to an event.
 */
export async function unregisterAction(userId: string, eventId: number) {
  if (!userId) {
    throw new Error('User ID is required to unregister.');
  }
  await unregisterFromEvent(userId, eventId);
  revalidatePath(`/event/${eventId}`);
  revalidatePath('/my-events');
}