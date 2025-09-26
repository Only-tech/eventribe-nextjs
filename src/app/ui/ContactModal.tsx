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
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
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

  // --- EMAIL VALIDATION FUNCTION ---
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // --- FORM SUBMISSION HANDLER ---
  const handleSubmit = (e: FormEvent) => {
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500);
  };

  // Logic textarea label animation
  const isMessageLabelActive = isMessageFocused || message.length > 0;

  if (!isOpen && !isClosing) return null;

  return (
    <div
      id="contactModal"
      className={`fixed inset-0 bg-[#f5f5dc]/65 dark:bg-[#222222]/65 backdrop-blur-sm flex items-center justify-center z-10000 transition-opacity duration-500 ease-in-out ${
      isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}      onClick={handleClose}
    >
      <div className="drop-shadow-[0px_1px_5px_rgba(0,0,0,0.4)] max-w-[95%] mx-auto w-md lg:w-xl relative transform transition-transform duration-300 hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_3px_rgba(255,_255,_255,_0.3)]">
      <div className={`bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white p-6 pt-1 lg:p-10 lg:pt-2 group transition-all ease-in-out duration-500
        ${isClosing ? 'translate-y-20 opacity-0 animate-slide-down' : 'translate-y-0 opacity-100 animate-slide-up'}`}        
        onClick={(e) => e.stopPropagation()}  style={{ clipPath: "var(--clip-path-squircle-60)" }}
      >
        <button
          onClick={handleClose}
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
                className={`peer block w-full p-3 pt-3 border resize-none rounded-md shadow-sm focus:outline-none transition-all ease-in-out duration-400 ${messageError ? 'border-red-500' : 'border-gray-300 focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]'}`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsMessageFocused(true)}
                onBlur={() => setIsMessageFocused(false)}
              ></textarea>
              <label
                htmlFor="message"
                className={`absolute pointer-events-none transition-all ease-in-out duration-400 px-3 ${
                  isMessageLabelActive
                    ? 'top-0 -translate-y-1/2 text-sm font-medium text-gray-400 peer-focus:text-[#ff952aff] group-hover:text-[#ff952aff] px-1 py-0 ml-4 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-gray-400'
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
              className="w-full lg:w-50 pl-5 pr-3 py-2 min-[449px]:w-32 min-w-35 h-11 inline-flex items-center justify-center rounded-full text-base font-medium transition-all ease-in-out duration-600 group border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Envoi</span>
                  <svg viewBox="0 0 50 50" className="inline-block size-6 ml-4">
                    <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                      <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
                    </circle>
                  </svg>
                </>
              ) : (
                <>
                  <span>Envoyer</span>
                  <svg viewBox="0 0 324 324" className="size-6 group-hover:animate-bounce rotate-45 ml-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="m 30.038955,294.81144 c -3.815099,-4.09503 -2.797128,-8.46969 6.67839,-28.69991 12.018644,-25.6598 77.606235,-156.71889 91.867745,-183.572857 22.47567,-42.321005 29.5685,-51.045649 39.91963,-49.103766 5.2074,0.976915 9.81857,5.609074 18.44063,18.524569 22.20532,33.262663 86.74477,141.229994 93.83104,156.968894 1.71298,3.80461 2.66252,8.02626 2.99398,13.31138 l -0.32411,7.26543 -3.06837,4.33118 c -6.00559,8.47723 -14.64698,8.76904 -72.87789,14.61618 -45.40293,4.55905 -47.11753,4.67256 -52.00162,3.44273 -2.85517,-0.71893 -5.44415,-2.23054 -7.01234,-4.09422 C 146.24823,245.14156 146,243.96376 146,236.00548 c 0,-4.86259 2.05072,-26.76556 4.55715,-48.67327 5.33563,-46.63652 6.56528,-67.15579 4.14478,-69.16462 -2.57215,-2.1347 -5.32793,0.21701 -7.7086,6.57832 -2.30045,6.14697 -12.33937,39.97566 -23.96438,80.75409 -14.51047,50.90015 -17.31283,57.75038 -26.442195,64.63681 -13.407624,10.1136 -52.494093,26.69093 -63.2978,26.84583 -0.666075,0.01 -2.128575,-0.96749 -3.25,-2.1712 z"/>
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
    </div>
  );
}