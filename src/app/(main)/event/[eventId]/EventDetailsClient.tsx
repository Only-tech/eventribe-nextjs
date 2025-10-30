'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction, unregisterAction } from '@/app/lib/actions';
import { Event } from '@/app/lib/definitions';
import { useToast } from '@/app/ui/status/ToastProvider';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid';

interface EventDetailsClientProps {
    event: Event;
    userId: number | undefined;
    isRegistered: boolean;
    isLoggedIn: boolean;
}

export default function EventDetailsClient({ event, userId, isRegistered, isLoggedIn }: EventDetailsClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addToast } = useToast();

    const handleRegister = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        addToast('');

        try {
            const result = await registerAction(userId, event.id);
            if (result.success) {
                addToast(`Vous êtes inscrit(e) à l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                addToast("Erreur lors de l'inscription. L'événement est peut-être complet.");
            }
        } catch {
            addToast("Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnregister = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        addToast('');

        try {
            const result = await unregisterAction(userId, event.id);
            if (result.success) {
                addToast(`Vous êtes désinscrit(e) de l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                addToast('Erreur lors de la désinscription.');
            }
        } catch {
            addToast('Une erreur inattendue est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const remainingSeats = event.available_seats - event.registered_count;

    return (
        <>
            <div className="mt-8 lg:mt-2 mb-2 lg:mb-0 flex justify-center">
                {isLoggedIn ? (
                    isRegistered ? (
                        <ActionButton variant="destructive" onClick={handleUnregister} isLoading={isSubmitting}>
                            {isSubmitting ? 
                                <>
                                    <span className="ml-3">Désinscription</span>
                                </> 
                            : (
                                <>
                                    <TrashIcon className="inline-block size-5 mr-2" />
                                    <span>Se désinscrire</span>
                                </>
                            )}
                        </ActionButton>
                    ) : remainingSeats > 0 ? (
                        <ActionButton variant="primary" onClick={handleRegister} isLoading={isSubmitting}>
                            {isSubmitting ?
                                <>
                                    <span className="ml-3">Inscription</span>
                                </> 
                            : (
                                <>
                                    <PlusIcon className="inline-block size-5 mr-2" />
                                    <span>S&apos;inscrire</span>
                                </>
                            )}
                        </ActionButton>
                    ) : (
                        <p className="text-red-600 font-bold text-lg rounded-lg p-3 bg-red-100">Complet !</p>
                    )
                ) : (
                    <p className="text-gray-700 dark:text-gray-500">
                        <Link href="/login" className="text-indigo-600 hover:underline">
                            Connectez-vous
                        </Link>{' '}
                        pour vous inscrire à cet événement.
                    </p>
                )}
            </div>
        </>
    );
}