'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PaymentMethod } from '@/app/lib/definitions';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { useToast } from '@/app/ui/status/ToastProvider';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: { id: number; title: string; image_url: string | null; price: number };
    userId: number;
    paymentMethod?: PaymentMethod;
    onPaymentSuccess: () => void;
}

export default function PaymentModal({
    isOpen,
    onClose,
    event,
    userId,
    paymentMethod,
    onPaymentSuccess,
}: PaymentModalProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(isOpen);

    // Monted/unmonted with delay
    useEffect(() => {
        if (isOpen) {
        setMounted(true);
        }
    }, [isOpen]);
    
    // keep for anim
    const handleAnimationEnd = () => {
        if (!isOpen) {
            setMounted(false); 
        }
    };

    const handleConfirm = async () => {
        if (!paymentMethod) {
            addToast("Aucun moyen de paiement enregistré.", "error");
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch("/api/account/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, eventId: event.id, amount: event.price }),
            });

            if (!res.ok) {
                addToast("Erreur lors du paiement.", "error");
                setLoading(false);
                return;
            }

            setSuccess(true);
            addToast("Paiement accepté !", "success");

            setTimeout(() => {
                setLoading(false);
                setSuccess(false);
                onClose();          
                onPaymentSuccess();
            }, 1500);
        } catch (err) {
            console.error("Erreur paiement:", err);
            addToast("Erreur inattendue.", "error");
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 bg-[#FCFFF7]/65 dark:bg-[#222222]/65 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                onAnimationEnd={handleAnimationEnd}
                className={`bg-[#FCFFF7] dark:bg-[#1E1E1E] border border-gray-300 dark:border-white/20 rounded-xl drop-shadow-2xl max-w-xl w-full p-1 lg:p-2 transition-all duration-300 mx-4
                ${isOpen ? 'translate-x-0 opacity-100 animate-slide-left' : 'translate-x-5 opacity-0 animate-slide-right'}`}
            >
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image
                    src={event.image_url || 'https://placehold.co/400x200'}
                    alt={event.title}
                    fill
                    className="object-cover"
                />
                </div>

                {/* Details Content */}
                <div className="p-3 lg:p-6">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{event.title}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {event.price > 0 ? `${event.price} €` : "Gratuit"}
                    </p>

                    {paymentMethod ? (
                        <p className="mb-6 text-end text-gray-700 dark:text-gray-300">
                        Paiement avec {paymentMethod.card_brand} **** **** **** {paymentMethod.card_last4}
                        </p>
                    ) : (
                        <p className="mb-6 text-end text-red-600 font-medium">
                        Aucun moyen de paiement enregistré
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-center pt-6 border-t border-gray-300 dark:border-white/20 gap-4">
                        <ActionButton
                            variant="destructive"
                            onClick={onClose}
                            className="flex-1 rounded-r"
                            disabled={loading}
                        >
                            Annuler
                        </ActionButton>

                        <ActionButton
                            variant="primary"
                            onClick={handleConfirm}
                            className="flex-1 rounded-l"
                            isLoading={loading && !success}
                            disabled={!paymentMethod}
                        >
                            {loading && !success && <span className="ml-2">Validation</span>}
                            {success && "Accepté"}
                            {!loading && !success && (
                                event.price > 0 ? `Payer ${event.price} €` : "Confirmer"
                            )}
                        </ActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
