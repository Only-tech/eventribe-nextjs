'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction, unregisterAction } from '@/app/lib/actions';
import { Event } from '@/app/lib/definitions';
import { useToast } from '@/app/ui/status/ToastProvider';
import ActionButton from '@/app/ui/buttons/ActionButton';
import PaymentModal from '@/app/ui/event/PaymentModal';
import { PaymentMethod } from '@/app/lib/definitions';
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid';

interface EventDetailsClientProps {
    event: Event;
    userId: number | undefined;
    isRegistered: boolean;
    isLoggedIn: boolean;
}

export default function EventDetailsClient({ event, userId, isRegistered: initialRegistered, isLoggedIn }: EventDetailsClientProps) {
    const router = useRouter();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isUnregistering, setIsUnregistering] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

    // Local state to show registration
    const [registered, setRegistered] = useState(initialRegistered);

    const { addToast } = useToast();

    // Fetch user payment method
    useEffect(() => {
        if (!userId) return;
        const fetchPayment = async () => {
        try {
            const res = await fetch(`/api/account/payment-methods?userId=${userId}`);
            if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                setPaymentMethod(data[0]);
            }
            }
        } catch (err) {
            console.error("Erreur fetch moyen de paiement:", err);
        }
        };
        fetchPayment();
    }, [userId]);

    // Registration
    const handleRegister = async () => {
        if (!userId) return;
        setIsRegistering(true);
        try {
            const result = await registerAction(userId, event.id);
            if (result.success) {
                setRegistered(true); // state update first
                addToast(`Vous êtes inscrit(e) à l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                addToast("Erreur lors de l'inscription.");
            }
        } catch {
            addToast("Une erreur inattendue est survenue.");
        } finally {
            setIsRegistering(false);
        }
    };

    // Unregistration
    const handleUnregister = async () => {
        if (!userId) return;
        setIsUnregistering(true);
        try {
            const result = await unregisterAction(userId, event.id);
            if (result.success) {
                setRegistered(false); // state update first
                await fetch(`/api/account/payments?userId=${userId}&eventId=${event.id}`, { method: 'DELETE' });
                addToast(`Vous êtes désinscrit(e) de l'événement ${event.title} !`);
                setTimeout(() => router.refresh(), 2000);
            } else {
                addToast("Erreur lors de la désinscription.");
            }
        } catch {
            addToast("Une erreur inattendue est survenue.");
        } finally {
            setIsUnregistering(false);
        }
    };

    const remainingSeats = event.available_seats - event.registered_count;

    return (
        <>
            {/*  Fixed Bar Container on Mobile display */}
            <div className="fixed bottom-0 left-0 right-0 z-10000 p-4 bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] min-[1025px]:shadow-none min-[1025px]:static min-[1025px]:bg-transparent min-[1025px]:border-none min-[1025px]:p-0 min-[1025px]:mt-2 min-[1025px]:mb-0 flex justify-center transition-all duration-300">
                
                {/* Wrapper to manage width */}
                <div className="w-full md:w-[85%] lg:w-[65%] flex justify-center">
                    {isLoggedIn ? (
                        registered ? ( 
                                <ActionButton 
                                    variant="destructive" 
                                    onClick={handleUnregister} 
                                    isLoading={isUnregistering}
                                    className="w-full" 
                                >
                                    {isUnregistering ? (
                                        <span className="ml-3">Désinscription</span>
                                    ) : (
                                        <>
                                            <TrashIcon className="inline-block size-5 mr-2" />
                                            <span>Se désinscrire</span>
                                        </>
                                    )}
                                </ActionButton>
                        ) : remainingSeats > 0 ? (
                            <ActionButton
                                variant="primary"
                                onClick={() => {
                                    if (event.price > 0) {
                                    setShowPayment(true);
                                    } else {
                                    handleRegister();
                                    }
                                }}
                                isLoading={isRegistering}
                                className="w-full" 
                            >
                                {isRegistering ? (
                                    <span className="ml-3">Inscription</span>
                                ) : (
                                    <>
                                        <PlusIcon className="inline-block size-5 mr-2" />
                                        <span>S&apos;inscrire</span>
                                    </>
                                )}
                            </ActionButton>
                        ) : (
                            <p className="text-red-600 font-bold text-lg rounded-lg p-3 bg-red-100 w-full text-center">Complet !</p>
                        )
                    ) : (
                        <p className="text-gray-700 dark:text-gray-500 text-sm text-center">
                            <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
                            Connectez-vous
                            </Link>{' '}
                            pour vous inscrire.
                        </p>
                    )}
                </div>
            </div>

            {/* Empty SPACER to avoid bar hidding content on mobile display */}
            <div className="h-20 min-[1025px]:hidden" aria-hidden="true"></div>

            <PaymentModal
                isOpen={showPayment}
                onClose={() => setShowPayment(false)}
                event={event}
                userId={userId!}
                paymentMethod={paymentMethod || undefined}
                onPaymentSuccess={handleRegister}
            />
        </>
    );
}