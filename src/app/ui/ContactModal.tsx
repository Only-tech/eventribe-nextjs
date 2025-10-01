'use client';

import React, { useState, FormEvent, useEffect } from 'react';
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
  const [formStatus, setFormStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const [isClosing, setIsClosing] = useState(false);

  // Clean status
  useEffect(() => {
    if (formStatus) {
      const timer = setTimeout(() => {
        setFormStatus('');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  // --- EMAIL VALIDATION FUNCTION ---
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();    
    setFormStatus('');
    setNameError('');
    setEmailError('');
    setMessageError('');
    setIsSuccess(false);

    let isValid = true;
    if (!name.trim()) {
        setNameError('Le nom est requis.');
        isValid = false;
    }
    if (!message.trim()) {
        setMessageError('Le message ne peut pas être vide.');
        isValid = false;
    }
    if (!email.trim()) {
        setEmailError("L'adresse e-mail est requise.");
        isValid = false;
    } else if (!validateEmail(email)) {
        setEmailError('Veuillez entrer une adresse e-mail au format valide.');
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
        setFormStatus('Votre message a été envoyé avec succès !');
        setIsSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        console.error('FAILED...', data.error);
        setFormStatus(data.error || "Échec de l'envoi du message. Veuillez réessayer.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('SUBMISSION ERROR', error);
      setFormStatus("Une erreur est survenue. Veuillez vérifier votre connexion.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]); 

  // Logic textarea label animation
  const isMessageLabelActive = isMessageFocused || message.length > 0;

  if (!isOpen && !isClosing) return null;

  return (
    <div
      id="contactModal"
      className={`fixed inset-0 bg-[rgb(248,248,236)] min-[450px]:bg-[#f5f5dc]/65 dark:bg-[#1E1E1E] min-[450px]:dark:bg-[#222222]/65 backdrop-blur-md min-h-screen overflow-y-auto p-2 min-[450px]:p-0 flex min-[450px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out ${
      isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}      onClick={handleClose}
    >
      <div className=" max-w-[95%] mx-auto w-md lg:w-xl relative transform transition-transform duration-300 min-[450px]:hover:drop-shadow-[0px_1px_10px_rgba(0,0,0,0.4)] min-[450px]:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
      <div className={`bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white/70 p-1 pb-6 min-[450px]:px-6 lg:p-10 lg:pt-2 group transition-all ease-in-out duration-500 min-[450px]:[clip-path:var(--clip-path-squircle-60)]
        ${isClosing ? 'translate-y-20 opacity-0 animate-slide-down' : 'translate-y-0 opacity-100 animate-slide-up'}`}        
        onClick={(e) => e.stopPropagation()} 
      >
        <IconButton
            type="button"
            onClick={handleClose}
            className="absolute z-0 top-3 right-3 text-gray-500 hover:text-[#ff952aff] text-2xl font-bold bg-transparent hover:bg-gray-200"
            aria-label="Quitter"
            title="Quitter"
        >
            <XMarkIcon className="size-6"/>
        </IconButton>
        <h1 className="flex flex-col items-center justify-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <EnvelopeIcon className="size-12 sm:size-16 mb-2" />
          <span>Contactez-nous</span>
        </h1>
        
        <form id="contact-form" className="grid gap-6" onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div>
            <FloatingLabelInput
              id="name"
              type="text"
              name="name"
              label="Votre nom | Organisation *"
              className={`rounded-[9999px!important] ${nameError ? 'border-red-500' : 'rounded-full'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameError && <p className="text-red-600 text-sm mt-1 ml-2">{nameError}</p>}
          </div>

          {/* Message Field */}
          <div>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={4}
                className={`peer block w-full p-3 pt-3 border resize-none rounded-md shadow-sm focus:outline-none transition-all ease-in-out duration-400 ${messageError ? 'border-red-500' : 'border-gray-300 dark:border-white/20 focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]'}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsMessageFocused(true)}
                onBlur={() => setIsMessageFocused(false)}
              ></textarea>
              <label
                htmlFor="message"
                className={`absolute pointer-events-none transition-all ease-in-out duration-400 px-3 ${
                  isMessageLabelActive
                    ? 'top-0 -translate-y-1/2 text-sm font-medium text-gray-400 peer-focus:text-[#ff952aff] group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white/70'
                    : 'top-1/12 -translate-y-1/12 text-base text-gray-500'
                }`}
              >
                Votre message *
              </label>
            </div>
            {messageError && <p className="text-red-600 text-sm mt-1 ml-2">{messageError}</p>}
          </div>
          
          <div className="flex flex-col min-[449px]:flex-row gap-4 items-start">
            {/* Email Field - MODIFIÉ */}
            <div className="flex-grow w-full">
              <FloatingLabelInput
                id="email"
                type="email"
                name="email"
                label="Votre email *"
                className={`rounded-[9999px!important] ${emailError ? 'border-red-500' : 'rounded-full'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-red-600 text-sm mt-1 ml-2">{emailError}</p>}
            </div>
              {/* Submit Button */}
              <ActionButton
                type="submit"
                variant="secondary"
                isLoading={loading}
                className="w-full lg:w-50 pl-5 pr-3 py-2 min-[449px]:w-32 min-w-35 h-11" 
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

          {/* Global Form Status */}
          {formStatus && (
              <p className={`fixed w-full max-w-[85%] top-6 [769px]:top-1 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {formStatus}
              </p>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}