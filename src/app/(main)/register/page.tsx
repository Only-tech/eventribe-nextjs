'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EyeIcon, EyeSlashIcon, EnvelopeOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; 
import { ChevronUpIcon } from '@heroicons/react/16/solid'; 
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import IdleHintBubble from '@/app/ui/IdleHintBubble';
import TooltipWrapper from '@/app/ui/TooltipWrapper';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';


// Steps flow
type RegistrationStep = 'email' | 'verification' | 'details_password';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState('');   
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const helpRef = useRef<HTMLParagraphElement>(null);
  
  

  // Step init
  const [step, setStep] = useState<RegistrationStep>('email'); 
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // Clean status
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  // ------------------------------------
  // Step 1 Send code)
  // ------------------------------------
  const handleEmailSubmit = async (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (event && 'preventDefault' in event) {
        event.preventDefault();
    }
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Code de vérification envoyé à ${email}.`);
        setIsSuccess(true);
        setStep('verification'); 
      } else {
        setMessage(data.message || "Erreur lors de l'envoi du code. Veuillez vérifier l'email.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du code:", error);
      setMessage('Une erreur est survenue lors de l\'envoi du code.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Step 2 Code Verification
  // ------------------------------------
  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setStep('details_password');
      } else {
        setMessage(data.message || "Code invalide ou expiré.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du code:", error);
      setMessage('Une erreur est survenue lors de la vérification.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Step 3 Registration + Details + Password
  // ------------------------------------
  const handleFinalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setIsSuccess(false);
      setLoading(false);
      return;
    }
    
    if (!firstName || !lastName) {
      setMessage('Veuillez fournir votre prénom et votre nom.');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, password, confirm_password: confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setLoading(false);
         setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setMessage(data.message || "Erreur d'inscription finale. Veuillez réessayer.");
        setIsSuccess(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire d\'inscription:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
      setLoading(false);
    }
  };
  
  // ------------------------------------
  // Steps Conditionnal Render
  // ------------------------------------
  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <h1 className="flex flex-col items-center justify-center max-[920px]:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                <EnvelopeOpenIcon className="w-auto h-16 mb-4 max-md:hidden" />
                <span>Quel est votre e-mail ?</span>
            </h1>
            <FloatingLabelInput
              id="email"
              label="Adresse e-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <ActionButton
              type="submit"
              variant="secondary"
              isLoading={loading}
              className="w-full" 
            >
              {loading ? (
                <span className="ml-3">Continuer</span>
              ) : (
                <>
                  <span>Continuer</span>
                  <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                </>
              )}
            </ActionButton>
          </form>
        );

      case 'verification':
        return (
          <form className="space-y-6" onSubmit={handleCodeSubmit}>
            <h1 className="text-center max-[920px]:text-xl text-2xl font-bold text-gray-900 dark:text-white/85 mb-8">
                <span>Consultez vos e-mails et saisissez le code reçu</span>
            </h1>
            <div className="mb-6 relative">
              <FloatingLabelInput
                id="email_display"
                label="E-mail"
                type="email"
                value={email}
                readOnly
                disabled
              />
              <button 
                type="button" 
                onClick={() => setStep('email')} 
                className="absolute text-indigo-600 inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 cursor-pointer"
                title="Modifier l'e-mail"
              >
                <PencilSquareIcon className="size-5" />
              </button>
            </div>
            <div className="relative">
              <FloatingLabelInput
                id="code"
                label="Entrez le code à usage unique"
                type="text"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />
              <button
                type="button"
                onClick={() => handleEmailSubmit()} 
                className="absolute text-indigo-600 inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 cursor-pointer"
                disabled={loading}
                title="Renvoyer le code"
              >
                <ArrowPathIcon className="size-5 transition-transform duration-300 hover:rotate-180" />
              </button>
            </div>
              <ActionButton
                type="submit"
                variant="secondary"
                isLoading={loading}
                className="w-full" 
              >
                {loading ? (
                  <span className="ml-3">Soumission</span>
                ) : (
                  <>
                    <span>Soumettre</span>
                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                  </>
                )}
              </ActionButton>
          </form>
        );
        
      case 'details_password':
        // Step 3 : Details (First Name/  Last Name) + Password
        return (
          <form className="space-y-6" onSubmit={handleFinalSubmit}>
            <h1 className="text-center max-[920px]:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
              Créons votre compte
            </h1>

            {/* Email */}
            <FloatingLabelInput
              id="email_display"
              label="E-mail"
              type="email"
              value={email}
              readOnly
              disabled
              className="!bg-gray-100 dark:!bg-gray-800"
            />

            {/* First Name */}
            <FloatingLabelInput
              label="Prénom"
              type="text"
              id="first-name"
              name="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            {/* Last Name */}
            <FloatingLabelInput
              label="Nom"
              type="text"
              id="last-name"
              name="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            {/* Password */}
            <div className="relative">
              <FloatingLabelInput
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10" 
              />
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-white/70 cursor-pointer"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                title={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Infos */}
            <p className="text-xs text-gray-600 dark:text-white/50 -mt-5 mb-2" ref={helpRef}>
              Saisissez au moins <strong>06 caractères</strong>, dont une <strong>
                minuscule</strong>, une <strong>majuscule</strong>, un <strong>chiffre</strong> et un <strong>caractère spécial </strong>
              <TooltipWrapper
              referenceElement={helpRef}
                content={
                  <>
                    Votre mot de passe doit contenir 06 caractères minimum, dont :
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Une majuscule <strong>[A - Z]</strong></li>
                      <li>Une minuscule <strong>[a - z]</strong></li>
                      <li>Un chiffre <strong>[0 - 9]</strong></li>
                      <li>
                        Un caractère spécial parmi les suivants :<br />
                        <code className="text-xs break-words">
                          - ! # $ % & ( ) * , . / : ; ? @ [ ] ^ _ {'{'} | {'}'} ~ + &lt; = &gt;
                        </code>
                      </li>
                    </ul>
                  </>
                }
              >
                <span className="underline decoration-dotted text-blue-600 dark:text-blue-400 cursor-help">
                  <QuestionMarkCircleIcon className="inline-block size-5 ml-2"/>
                </span>
              </TooltipWrapper>
            </p>

            {/* Password confirmation */}
            <div className="relative">
              <FloatingLabelInput
                label="Confirmer le mot de passe"
                type={showPassword ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10" 
              />
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-white/70 cursor-pointer"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                title={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
              <ActionButton
                type="submit"
                variant="secondary"
                isLoading={loading}
                className="w-full" 
              >
                {loading ? (
                  <span className="ml-3">Création du compte</span>
                ) : (
                  <>
                    <span>Valider</span>
                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                  </>
                )}
              </ActionButton>
          </form>
        );
        
      default:
        return null;
    }
  };

  // === Render Display ====
  return (
    <div className="absolute inset-0 bg-[#FCFFF7] min-[500px]:bg-[#FCFFF7]/65 dark:bg-[#222222]/65 max-[500px]:dark:bg-[#1E1E1E] backdrop-blur-sm min-h-screen overflow-y-auto max-[500px]:pt-0 max-[1025px]:py-10 flex items-start min-[1025px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">      
      <div className="relative min-[500px]:drop-shadow-lg max-w-[95%] max-[769px]:w-md w-5xl mx-auto transform transition-transform duration-500 min-[500px]:hover:drop-shadow-2xl group min-[500px]:dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] min-[500px]:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
        <div className="flex flex-col min-[769px]:flex-row items-center min-h-120  justify-evenly gap-6 min-[800px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/70 p-2 max-[500]:pt-4 min-[500px]:p-6 lg:p-10 xl:p-12 min-[500px]:[clip-path:var(--clip-path-squircle-60)]" >      
          <div className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
            <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 right-4 cursor-pointer" title="Page d'accueil"/>
            <LogoButton onClick={() => router.push(`/`)} className='max-md:w-25 max-md:h-16 max-[820px]:w-40 max-[820px]:h-32 w-55 h-38'/>
            <WellcomeLogo/>
            <p className="text-gray-700 dark:text-white/55">Pas d’inquiétude, on vous guide pas à pas</p>
            <p className="mt-6 text-center max-[769px]:hidden text-gray-700 dark:text-white/55">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Connectez-vous ici
              </Link>
              .
            </p>
          </div>

          <div className="w-full min-[769px]:w-0 max-h-[95%] min-[769px]:h-70  border-t border-gray-300 dark:border-white/20 min-[769px]:border-r"></div>
          
          <div className="max-w-sm flex-1 w-full">
            <IdleHintBubble step={step} />
            {message && (
              <div className={`fixed w-full max-w-[85%] top-6 [769px]:top-1 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {message}
              </div>
            )}

            {renderStepContent()} 
            
            <p className="min-[769px]:hidden mt-6 text-center text-gray-700 dark:text-white/55">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Connectez-vous ici
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}