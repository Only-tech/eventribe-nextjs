'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { useToast } from '@/app/ui/status/ToastProvider';
import { ChevronUpIcon } from '@heroicons/react/16/solid';

export default function StripeForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/account/payment-methods`, 
            },
            redirect: 'if_required' 
        });

        if (error) {
            addToast(error.message || "Une erreur est survenue", "error");
            setLoading(false);
        } else {
            addToast("Moyen de paiement ajouté avec succès !", "success");
            setLoading(false);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 sm:p-4 lg:p-10">
            <PaymentElement />
            
            {/* Buttons */}
            <div className="flex justify-center sm:justify-end gap-4">
                <ActionButton 
                    type="button" 
                    variant="destructive" 
                    onClick={onCancel} 
                    className="w-full flex-1 rounded-r-xs!" 
                >
                    <ChevronUpIcon className="inline-block size-6 -ml-3 mr-2 rotate-270 group-hover:animate-bounce" />
                    Annuler
                </ActionButton>

                <ActionButton 
                    type="submit" 
                    variant="primary"
                    isLoading={loading}
                    disabled={!stripe || loading}
                    className="w-full flex-1 rounded-l-xs!"
                >
                    Enregistrer
                    <ChevronUpIcon className="inline-block size-6 ml-2 -mr-3 rotate-90 group-hover:animate-bounce" />
                </ActionButton>

            </div>
        </form>
    );
}