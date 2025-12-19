'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import ActionButton from '@/app/ui/buttons/ActionButton';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import Loader from '@/app/ui/animation/Loader';
import ConfirmationModal from '@/app/ui/ConfirmationModal';
import { PaymentMethod } from '@/app/lib/definitions';
import { TrashIcon } from '@heroicons/react/16/solid';
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import { PlusIcon } from '@heroicons/react/16/solid';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';


export default function PaymentMethods({ userId }: { userId: number }) {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    // const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const [isAdding, setIsAdding] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { addToast } = useToast();

    // MM/AA formatting function 
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {    
        let value = e.target.value.replace(/\D/g, '');  // Only numeric
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiry(value.slice(0, 5)); // Limit to 5 characters and state update
    };

    // Manage function for CVC
    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // only numeric, limit to 4 max
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setCvc(val);
    };

    // Number card formatting to 4x4
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Removes the non-numeric and space  
        let cleanValue = value.replace(/[^0-9]/g, '');
        cleanValue = cleanValue.slice(0, 16);

        // formatting to 4 number + escap"
        const formattedValue = cleanValue.match(/.{1,4}/g)?.join(' ') || '';
        setCardNumber(formattedValue);
    };

    // Fetch payment methods
    useEffect(() => {
        if (!userId) return;
        const fetchMethods = async () => {
            try {
                const res = await fetch(`/api/account/payment-methods?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMethods(data || []);
                }
            } catch {
                addToast('Erreur lors du chargement des moyens de paiement.', 'error');
            } finally {
                // setLoading(false);
            }
        };
        fetchMethods();
    }, [userId, addToast]);

    // Delete payment card after confirmation
    const confirmDelete = async () => {
        if (!selectedId) return;

        setIsModalOpen(false);
        setDeletingId(selectedId);

        try {
            const res = await fetch(`/api/account/payment-methods/${selectedId}`, { method: 'DELETE' });
            if (res.ok) {
                setMethods((prev) => prev.filter((m) => m.id !== selectedId));
                addToast('Moyen de paiement supprimé.', 'success');
            } else {
                addToast('Erreur lors de la suppression.', 'error');
            }
        } catch {
            addToast('Erreur réseau.', 'error');
        } finally {
            setDeletingId(null);
            setSelectedId(null);
        }
    };

    // Add payment card
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cardNumber || cardNumber.length < 12) {
            addToast('Numéro de carte invalide.', 'error');
            return;
        }

        const last4 = cardNumber.slice(-4);
        const brand = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Carte';

        setIsAdding(true);

        try {
            const res = await fetch(`/api/account/payment-methods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, card_brand: brand, card_last4: last4 }),
            });
            if (res.ok) {
                const newMethod = await res.json();
                setMethods((prev) => [...prev, newMethod]);
                addToast('Moyen de paiement ajouté.', 'success');
                setShowForm(false);
                setCardNumber('');
                setExpiry('');
                setCvc('');
            } else {
                addToast('Erreur lors de l’ajout.', 'error');
            }
        } catch {
            addToast('Erreur réseau.', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <section className="bg-[#FCFFF7] dark:bg-[#1E1E1E] rounded-xl p-4 sm:p-6 md:p-8 my-4 lg:my-0  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90 mb-8 border-b border-gray-300 dark:border-white/20 pb-4">Moyens de paiement</h2>
            {methods.length > 0 ? (
                <OverlayScrollbarsComponent className='p-3 sm:p-6 h-[35vh]'> 
                <ul className="gap-y-3 mb-10 grid md:grid-cols-2 md:gap-x-10 xl:gap-x-24 md:gap-y-5">
                    {methods.map((m) => {
        
                        // 12-star mask
                        const maskedDigits = '**** **** ****'; 
                        
                        return (
                            <li key={m.id} className="flex justify-between items-center pl-6 p-1 rounded-full border border-gray-300 dark:border-white/10">
                                <span className='whitespace-nowrap'>
                                    {m.card_brand} 
                                    {/* display 12-star mask + last 4 card digit */}
                                    {' '} 
                                    {maskedDigits} 
                                    {' '} 
                                    {m.card_last4}
                                </span>
                                <ActionButton
                                    variant="destructive"
                                    onClick={() => {
                                        setSelectedId(m.id);
                                        setIsModalOpen(true);
                                    }}
                                    isLoading={deletingId === m.id}
                                    className="p-2!"
                                    title="Supprimer"
                                >
                                    {!deletingId && ( <TrashIcon className="size-5" /> )}
                                </ActionButton>
                            </li>
                        );
                    })}
                </ul>
                </OverlayScrollbarsComponent> 
            ) : (
                <p className="mb-4">Aucun moyen de paiement enregistré.</p>
            )}

            {showForm ? (
                <form onSubmit={handleAdd} className="space-y-6 animate-slide-top">
                    <div className="w-[70%] mx-auto grow border-t-5 dark:border-white/70 border-gray-500 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white/90 mt-6">Ajouter un moyen de paiement</h3>
                    <FloatingLabelInput
                        id="cardNumber"
                        label="Numéro de carte"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required
                        maxLength={19}
                    />
                    <div className="flex gap-4">
                        <FloatingLabelInput
                            id="expiry"
                            label="MM/AA"
                            type="text"
                            inputMode="numeric"
                            value={expiry}
                            onChange={handleExpiryChange}
                            required
                            maxLength={5}
                        />
                        <FloatingLabelInput
                            id="cvc"
                            label="CVC"
                            type="password"
                            inputMode="numeric"
                            value={cvc}
                            onChange={handleCvcChange}
                            required
                            maxLength={4}
                        />
                    </div>

                    <div className="flex justify-center sm:justify-end gap-4">
                        {isAdding ? (
                            <div className="flex-1 flex justify-center py-2">
                                <Loader variant="dots" />
                            </div>
                        ) : (
                            <>
                                <ActionButton 
                                    type="button" 
                                    variant="destructive" 
                                    onClick={() => setShowForm(false)}
                                    className="w-40 max-sm:flex-1 sm:w-48 rounded-r-xs!"
                                >
                                    <ChevronUpIcon className="inline-block size-6 -ml-3 mr-2 rotate-270 group-hover:animate-bounce" />
                                    Annuler
                                </ActionButton>
                                <ActionButton 
                                    type="submit" 
                                    variant="primary"
                                    className="w-40 max-sm:flex-1 sm:w-48 rounded-l-xs!"
                                >
                                    Enregistrer
                                    <ChevronUpIcon className="inline-block size-6 ml-2 -mr-3 rotate-90 group-hover:animate-bounce" />
                                </ActionButton>
                            </>
                        )}
                    </div>
                </form>
            ) : (
                <ActionButton 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    className="mt-4 max-sm:mx-auto"
                >
                    <PlusIcon className="inline-block size-5 mr-2 group-hover:animate-bounce" />
                    <span className=' truncate'>Ajouter un moyen de paiement</span>
                </ActionButton>
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                message="Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?"
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </section>
    );
}
