'use client';

import React, { useState, FormEvent, useRef } from 'react';
import emailjs from '@emailjs/browser';

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

  const form = useRef<HTMLFormElement>(null);

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

    // If any validation fails, stop the submission
    if (!isValid) {
        return;
    }

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

  return (
    <div
      id="contactModal"
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(248,248,236)] rounded-lg shadow-lg p-6 w-full max-w-md relative group"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-[#ff952aff] text-2xl font-bold hover:animate-pulse transform duration-300 ease-in-out"
          aria-label="Quitter"
          title="Quitter"
        >
          &times;
        </button>
        <h2 className="text-xl text-gray-900 text-center font-semibold mb-4 mt-1">Contactez-nous</h2>
        
        <form ref={form} id="contact-form" className="grid gap-4" onSubmit={handleSubmit} noValidate>
          {/* Name Field */}
          <div>
            <label htmlFor="name"></label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Votre nom | Organisation *"
              className={`w-full h-11 border p-2 rounded-full shadow-sm focus:outline-none ${nameError ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-[#ff952aff] focus:border-[#ff952aff]'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameError && <p className="text-red-600 text-sm mt-1 ml-2">{nameError}</p>}
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message"></label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Votre message *"
              className={`w-full border p-2 resize-none rounded-md shadow-sm focus:outline-none ${messageError ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-[#ff952aff] focus:border-[#ff952aff]'}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            {messageError && <p className="text-red-600 text-sm mt-1 ml-2">{messageError}</p>}
          </div>
          
          <div className="flex flex-col [@media(min-width:449px)]:flex-row gap-4 items-start">
            {/* Email Field */}
            <div className="flex-grow w-full">
              <label htmlFor="email"></label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Votre email *"
                className={`w-full h-11 border p-2 rounded-full shadow-sm focus:outline-none ${emailError ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-[#ff952aff] focus:border-[#ff952aff]'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="text-red-600 text-sm mt-1 ml-2">{emailError}</p>}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-5 py-2 [@media(min-width:449px)]:w-32 h-11 inline-flex items-center justify-center rounded-full text-base font-medium transition-colors group border-[0.5px] shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Envoi</span>
                  <svg viewBox="0 0 50 50" className="inline-block w-6 h-6 ml-2">
                    <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        repeatCount="indefinite"
                        dur="1s"
                        from="0 25 25"
                        to="360 25 25" />
                    </circle>
                  </svg>
                </>
              ) : (
                <>
                  <span>Envoyer</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="inline-block w-4 h-4  group-hover:animate-bounce ml-2">
                    <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Global Form Status */}
          <div className="items-center flex flex-col">
            {formStatus && (
              <p className={`w-full text-center mt-4 p-3 rounded-lg ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {formStatus}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
