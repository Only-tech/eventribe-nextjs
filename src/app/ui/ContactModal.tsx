'use client';

import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput'; 
import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/16/solid';
import PlaneLogo from '@/app/ui/logo/PlaneLogo';
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
    // --- STATE HOOKS ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { addToast } = useToast();
    
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [messageError, setMessageError] = useState('');
    const [isMessageFocused, setIsMessageFocused] = useState(false);

    const [isClosing, setIsClosing] = useState(false);

    // To bind the input focus with the submit button (Email field)
    const [isEmailFocused, setIsEmailFocused] = useState(false); 
    const isEmailActive = isEmailFocused || email.length > 0;

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 500);
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]); 

    // --- EMAIL VALIDATION FUNCTION ---
    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // --- FORM SUBMISSION HANDLER ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();    
        addToast('');
        setNameError('');
        setEmailError('');
        setMessageError('');

        let isValid = true;
        if (!name.trim()) {
            setNameError("Le nom est requis.");
            addToast("Le nom est requis.", "error");
            isValid = false;
        }

        if (!message.trim()) {
            setMessageError("Le message ne peut pas être vide.");
            addToast("Le message ne peut pas être vide !", "error");
            isValid = false;
        }

        if (!email.trim()) {
            setEmailError("L'adresse e-mail est requise.");
            addToast("L'adresse e-mail est requise !", "error");
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError("Veuillez entrer une adresse e-mail au format valide.");
            addToast("Veuillez entrer une adresse e-mail au format valide !", "error");
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);

        try {
            // Send e-mail
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('SUCCESS!', data.message);
                addToast('Votre message a été envoyé avec succès !', 'success');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                console.error('FAILED...', data.error);
                addToast(data.error || "Échec de l'envoi du message. Veuillez réessayer !", 'error');
            }
        } catch (error) {
            console.error('SUBMISSION ERROR', error);
            addToast('Une erreur est survenue. Veuillez vérifier votre connexion !', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Logic textarea label animation
    const isMessageLabelActive = isMessageFocused || message.length > 0;

    if (!isOpen && !isClosing) return null;

    return (
        <div
            id="contactModal"
            className={`fixed inset-0 bg-[#FCFFF7] min-[769px]:bg-[#FCFFF7]/65 dark:bg-[#1E1E1E] min-[769px]:dark:bg-[#222222]/65 backdrop-blur-md min-h-screen overflow-y-auto min-[769px]:p-0 flex min-[769px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out overflow-hidden ${
            isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}      
            onClick={handleClose}
        >
            <div className="w-full min-[769px]:w-fit relative transform transition-transform duration-300 min-[769px]:hover:drop-shadow-[0px_1px_10px_rgba(0,0,0,0.4)] min-[769px]:drop-shadow-[0px_15px_15px_rgba(0,0,0,0.6)]" onClick={(e) => e.stopPropagation()}>
                <div className={` mx-auto md:w-2xl bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/70 p-6 pb-6 sm:p-8 lg:p-10 lg:pt-2 group transition-all ease-in-out duration-500 min-[769px]:[clip-path:var(--clip-path-squircle-60)]
                    ${isClosing ? 'translate-x-5 opacity-0 animate-slide-right' : 'translate-x-0 opacity-100 animate-slide-left'}`}        
                     
                >
                    <div className='absolute z-0 top-3 right-3'>
                        <IconButton
                            type="button"
                            onClick={handleClose}
                            className="relative text-gray-500 hover:text-[#0088aa] dark:hover:text-[#ff952aff] text-2xl font-bold bg-transparent hover:bg-gray-200"
                            aria-label="Quitter"
                            title="Quitter"
                        >
                            <XMarkIcon className="size-6"/>
                        </IconButton>
                    </div>
                    <h1 className="flex flex-col items-center justify-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        <EnvelopeIcon className="size-12 sm:size-16 mb-2" />
                        <span>Contactez-nous</span>
                    </h1>
                    
                    <form id="contact-form" className="grid gap-10" onSubmit={handleSubmit} noValidate>
                        {/* Name Field */}
                        <div>
                            <FloatingLabelInput
                                id="name"
                                type="text"
                                name="name"
                                label="Votre nom | Organisation *"
                                className={`rounded-full! ${nameError ? 'border-red-500' : 'rounded-full'}`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Message Field */}
                        <div className={`relative group w-full transition-all duration-500 ease-out ${isMessageLabelActive ? "translate-y-0" : "translate-y-1"}`}>
                            <textarea
                                id="message"
                                name="message"
                                // rows={5}
                                className={`peer w-full h-45 min-[400px]:h-55 min-[1025px]:h-35 overflow-y-auto px-3 py-4 border rounded-md shadow-sm focus:outline-none transition-all ease-in-out duration-400 ${messageError ? 'border-red-500' : 'border-gray-300 dark:border-white/20 focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]'}`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onFocus={() => setIsMessageFocused(true)}
                                onBlur={() => setIsMessageFocused(false)}
                            ></textarea>
                            <label
                                htmlFor="message"
                                className={`absolute pointer-events-none transition-all ease-in-out duration-400 px-3 ${
                                isMessageLabelActive
                                    ? 'top-0 left-3 -translate-y-1/2 text-sm font-medium text-gray-500 peer-focus:text-[#0088aa] group-hover:text-[#0088aa] dark:peer-focus:text-[#ff952aff] dark:group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/45'
                                    : 'top-1/12 left-2 -translate-y-1/12 text-base text-gray-500 dark:text-white/40'
                                }`}
                            >
                                Votre message *
                            </label>
                        </div>
                    
                        <div className="flex flex-col min-[449px]:flex-row gap-10 min-[449px]:gap-3 items-start">
                            {/* Email Field */}
                            <div className="grow w-full">
                                <FloatingLabelInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    label="Votre email *"
                                    className={`rounded-full min-[449px]:rounded-r-xs! ${emailError ? 'border-red-500' : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />
                            </div>
                            {/* Submit Button */}
                            <ActionButton
                                type="submit"
                                variant="secondary"
                                isLoading={loading}
                                className={`w-full min-[449px]:rounded-l-xs! lg:w-50 pl-5 pr-3 py-2 min-[449px]:w-32 min-w-35 h-12 transition-transform! duration-500 ease-out! ${
                                   isEmailActive ? "translate-y-0" : "translate-y-1"
                                }`} 
                            >
                                {loading ? (
                                    <span className="ml-3">Envoi</span>
                                ) : (
                                    <>
                                        <span>Envoyer</span>
                                        <PlaneLogo className="group-hover:animate-bounce"/>
                                    </>
                                )}
                            </ActionButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}