'use client';

import React, { useState, FormEvent, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput'; 
import { EnvelopeIcon } from '@heroicons/react/16/solid';

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
  
  // States for individual field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');

  // State for the textarea focus
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const form = useRef<HTMLFormElement>(null);

  // Clean status
  useEffect(() => {
    if (formStatus) {
      const timer = setTimeout(() => {
        setFormStatus('');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [formStatus]);


  if (!isOpen) return null;

  // --- EMAIL VALIDATION FUNCTION ---
  const validateEmail = (email: string): boolean => {
    // A standard regex for email format validation.
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Reset all status messages on new submission
    setFormStatus('');
    setNameError('');
    setEmailError('');
    setMessageError('');
    setIsSuccess(false);

    // --- VALIDATION LOGIC ---
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

    if (!form.current) {
      setLoading(false);
      setFormStatus("Erreur : Le formulaire n'a pas pu être trouvé.");
      setIsSuccess(false);
      return;
    }

    // --- EMAILJS SEND LOGIC ---
    emailjs.sendForm(
      'service_r7k5fdk',   // Service ID
      'template_1qncn8e',  // Template ID
      form.current,        // The form element ref
      'mSiePQQEQ-83LNBaf'   // Public Key
    ).then(
      (result) => {
        console.log('SUCCESS!', result.text);
        setFormStatus('Votre message a été envoyé avec succès !');
        setIsSuccess(true);
        // Reset form fields after successful submission
        setName('');
        setEmail('');
        setMessage('');
      },
      (error) => {
        console.error('FAILED...', error.text);
        setFormStatus("Échec de l'envoi du message. Veuillez réessayer.");
        setIsSuccess(false);
      }
    ).finally(() => {
      setLoading(false);
    });
  };

  // Logic textarea label animation
  const isMessageLabelActive = isMessageFocused || message.length > 0;

  return (
    <div
      id="contactModal"
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white rounded-lg shadow-lg p-6 w-full max-w-md relative group transition-all"
        onClick={(e) => e.stopPropagation()}  style={{ clipPath: "var(--clip-path-squircle-60)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#ff952aff] text-2xl font-bold"
          aria-label="Quitter"
          title="Quitter"
        >
          &times;
        </button>
        <h1 className="flex flex-col items-center justify-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <EnvelopeIcon className="size-12 sm:size-16 mb-2" />
          <span>Contactez-nous</span>
        </h1>
        
        <form ref={form} id="contact-form" className="grid gap-6" onSubmit={handleSubmit} noValidate>
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
                className={`peer block w-full p-3 pt-3 border resize-none rounded-md shadow-sm focus:outline-none ${messageError ? 'border-red-500' : 'border-gray-300 focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]'}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsMessageFocused(true)}
                onBlur={() => setIsMessageFocused(false)}
              ></textarea>
              <label
                htmlFor="message"
                className={`absolute pointer-events-none transition-all duration-200 ease-in-out px-3 ${
                  isMessageLabelActive
                    ? 'top-0 -translate-y-1/2 text-sm font-medium text-gray-400 peer-focus:text-[#ff952aff] group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white'
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
            <button
              type="submit"
              className="w-full px-5 py-2 min-[449px]:w-32 h-11 inline-flex items-center justify-center rounded-full text-base font-medium transition-colors group border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Envoi</span>
                  <svg viewBox="0 0 50 50" className="inline-block w-6 h-6 ml-2">
                    <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                      <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
                    </circle>
                  </svg>
                </>
              ) : (
                <>
                  <span>Envoyer</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="inline-block w-4 h-4 group-hover:animate-bounce ml-2">
                    <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Global Form Status */}
          {formStatus && (
              <p className={`w-full text-center p-3 rounded-lg ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {formStatus}
              </p>
          )}
        </form>
      </div>
    </div>
  );
}