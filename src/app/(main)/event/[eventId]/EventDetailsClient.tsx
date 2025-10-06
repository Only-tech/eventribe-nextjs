'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction, unregisterAction } from '@/app/lib/actions';
import { Event } from '@/app/lib/definitions';
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
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        if (message) {
        const timer = setTimeout(() => setMessage(''), 5000);
        return () => clearTimeout(timer);
        }
    }, [message]);

    const handleRegister = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const result = await registerAction(userId, event.id);
            if (result.success) {
                setIsSuccess(true);
                setMessage(`Vous êtes inscrit(e) à l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                setIsSuccess(false);
                setMessage("Erreur lors de l'inscription. L'événement est peut-être complet.");
            }
        } catch {
            setIsSuccess(false);
            setMessage("Une erreur inattendue est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnregister = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        setMessage('');
        setIsSuccess(false);

        try {
            const result = await unregisterAction(userId, event.id);
            if (result.success) {
                setIsSuccess(true);
                setMessage(`Vous êtes désinscrit(e) de l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                setIsSuccess(false);
                setMessage('Erreur lors de la désinscription.');
            }
        } catch {
            setIsSuccess(false);
            setMessage('Une erreur inattendue est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const remainingSeats = event.available_seats - event.registered_count;

    return (
        <>
        {message && (
            <div className={`fixed w-full max-w-[85%] top-6 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
            {message}
            </div>
        )}

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