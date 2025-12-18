'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EnvelopeOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; 
import { ChevronUpIcon } from '@heroicons/react/16/solid'; 
import { ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/app/ui/status/ToastProvider';
import IdleHintBubble from '@/app/ui/IdleHintBubble';
import TooltipWrapper from '@/app/ui/status/TooltipWrapper';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';
import Loader from '@/app/ui/animation/Loader';
import { TvIcon } from '@heroicons/react/24/solid';


// Steps flow
type RegistrationStep = 'email' | 'verification' | 'details_password';

// CHECKBOX 2FA Component
const TwoFactorCheckbox = ({ enable2FA, setEnable2FA }: { enable2FA: boolean, setEnable2FA: (value: boolean) => void }) => (
    <div className="flex items-start p-4 mb-4 bg-gray-50 rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_8px_10px_rgb(0,0,0,0.2)] hover:drop-shadow-[0_7px_10px_rgb(0,0,0,0.3)]">
        <div className="flex items-center h-5">
            <input
                id="2fa_checkbox_input" // Changed by original ID
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4  bg-gray-100 border-gray-300 rounded focus:border-gray-400 dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
        <div className="ms-2 text-sm">
            <label htmlFor="2fa_checkbox_input" className="font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none">
                Activer la double authentification (2FA)
            </label>
            <p id="helper-checkbox-text" className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                Un code <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">ev - </span> vous sera demandé à chaque connexion.
            </p>
        </div>
    </div>
);

export default function RegisterPage() {
// Check session on client side
    const { data: session, status } = useSession();

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState('');   
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const helpRef = useRef<HTMLParagraphElement>(null);
    
    // To bind the input focus with edit/send code button
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const isCodeActive = isCodeFocused || (code && code.length > 0);

    // Step init
    const [step, setStep] = useState<RegistrationStep>('email'); 
    const router = useRouter();

    const [enable2FA, setEnable2FA] = useState(false);

    // Redirect if connected user's
    useEffect(() => {
        if (status === 'authenticated' && session) {
            const isAdmin = session.user?.isAdmin;
            router.replace(isAdmin ? '/admin' : '/events');
        }
    }, [status, session, router]);

    // Conditional render during session checking 
    if (status === 'loading' || status === 'authenticated') {
        return (
            <div className="absolute top-0 left-0 flex flex-col gap-10 inset-0 min-h-screen w-full items-center justify-center bg-[#FCFFF7] dark:bg-[#1E1E1E]">
                <TvIcon className="size-32 sm:size-44 opacity-50" />
                <p className="animate-pulse text-lg text-gray-700 dark:text-gray-300">Chargement de votre espace</p>
                <Loader variant="dots" />
            </div>
        );
    }
    
    // ------------------------------------
    // Step 1 Send code)
    // ------------------------------------
    const handleEmailSubmit = async (event?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        if (event && 'preventDefault' in event) {
            event.preventDefault();
        }
        addToast('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                addToast(`Code de vérification envoyé à ${email}`);
                setStep('verification');
            } else if (response.status === 409) {
                    addToast(data.message);
                    setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                addToast(data.message || "Erreur lors de l'envoi du code. Veuillez vérifier l'email", 'error');
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du code:", error);
            addToast("Une erreur est survenue lors de l'envoi du code", 'error');
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // Step 2 Code Verification
    // ------------------------------------
    const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addToast('');
        setLoading(true);
        
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (response.ok) {
                addToast(data.message);
                setStep('details_password');
            } else {
                addToast(data.message || "Code invalide ou expiré.");
            }
        } catch (error) {
            console.error("Erreur lors de la vérification du code:", error);
            addToast('Une erreur est survenue lors de la vérification.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // Step 3 Registration + Details + Password
    // ------------------------------------
    const handleFinalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addToast('');

        if (password !== confirmPassword) {
            addToast('Les mots de passe ne correspondent pas.', 'error');
            setLoading(false);
            return;
        }
        
        if (!firstName || !lastName) {
            addToast('Veuillez fournir votre prénom et votre nom.');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, firstName, lastName, password, confirm_password: confirmPassword, enable2FA: enable2FA }),
            });

            const data = await response.json();

            if (response.ok) {
                addToast('Compte créé avec succès ! Connexion en cours...', 'success');
                
                // AUTO LOGIN 
                const result = await signIn('credentials', { 
                    redirect: false, 
                    email: email, 
                    password: password 
                });

                if (result?.error) {
                    addToast("Compte créé, mais redirection manuelle requise.", 'info');
                    router.push('/login');
                } else {
                    router.push('/events');
                }
            } else {
                addToast(data.message || "Erreur d'inscription finale. Veuillez réessayer.", 'error');
                setLoading(false);
            }
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire d\'inscription:', error);
            addToast('Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
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
                    <form className="space-y-8" onSubmit={handleEmailSubmit}>
                        <h1 className="flex flex-col items-center justify-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            <EnvelopeOpenIcon className="w-auto h-16 mb-4 max-[1025px]:hidden" />
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
                    <form className="space-y-8" onSubmit={handleCodeSubmit}>
                        <h1 className="text-center text-xl md:text-2xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            Consultez vos e-mails et saisissez le code reçu
                        </h1>
                        <div className="relative">
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
                                label="Entrez le code"
                                type="code"
                                name="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                maxLength={6}
                                onFocus={() => setIsCodeFocused(true)}
                                onBlur={() => setIsCodeFocused(false)}
                            />
                            <button
                                type="button"
                                onClick={() => handleEmailSubmit()} 
                                className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-indigo-600 hover:text-gray-700 transition-all duration-500 ease-out ${
                                    isCodeActive ? "translate-y-0" : "translate-y-1"
                                }`}
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
                    <form className="space-y-8" onSubmit={handleFinalSubmit}>
                        <h1 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            Créons votre compte
                        </h1>

                        <div className='hidden'>
                            {/* Email */}
                            <FloatingLabelInput
                                id="email_display"
                                label="E-mail"
                                type="email"
                                value={email}
                                readOnly
                                disabled                           
                            />
                        </div>

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
                        <FloatingLabelInput
                            label="Mot de passe"
                            type='password'
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pr-10" 
                        />

                        {/* Password Infos */}
                        <p className="text-xs text-gray-600 dark:text-white/50 -mt-7 mb-2" ref={helpRef}>
                            Saisissez au moins <strong>06 caractères</strong>, dont une <strong>
                                minuscule</strong>, une <strong>majuscule</strong>, un <strong>chiffre</strong> et un <strong>caractère spécial </strong>
                            <TooltipWrapper
                                referenceElement={helpRef}
                                content={
                                    <>
                                        Votre mot de passe doit contenir 12 caractères minimum, dont :
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Une majuscule <strong>[A - Z]</strong></li>
                                            <li>Une minuscule <strong>[a - z]</strong></li>
                                            <li>Un chiffre <strong>[0 - 9]</strong></li>
                                            <li>
                                                Un caractère spécial parmi les suivants :<br />
                                                <code className="text-xs wrap-break-word">
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
                        <FloatingLabelInput
                            label="Confirmer le mot de passe"
                            type='password'
                            id="confirm_password"
                            name="confirm_password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pr-10" 
                        />

                        {/* Display on Mobile */}
                        <div className="min-[1025px]:hidden mt-4">
                            <TwoFactorCheckbox enable2FA={enable2FA} setEnable2FA={setEnable2FA} />
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
                
            default: return null;
        }
    };

    // === Render Display ====
    return (
        <div className="absolute inset-0 bg-[#FCFFF7] sm:bg-transparent max-sm:dark:bg-[#1E1E1E]  min-h-screen overflow-y-auto max-[1025px]:pt-0 max-[1025px]:py-10 flex items-start min-[1025px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">
            <div className="relative sm:drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] max-w-[95%] max-md:w-lg max-[1025px]:w-xl w-5xl mx-auto transform transition-transform duration-500 min-[1025px]:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] group sm:dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] sm:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,0.6)]">
                <div className="sm:rounded-3xl max-sm:mt-0 max-[1025px]:mt-20 flex flex-col min-[1025px]:flex-row items-center min-h-160 min-[1025px]:min-h-120  justify-evenly gap-6 min-[1025px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/75 p-4 sm:p-10 xl:p-12 sm:[clip-path:var(--clip-path-squircle-60)]" >      
                    
                    {/* Branding column */}
                    <section className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
                        <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 sm:top-24 min-[1025px]:top-4! right-4 cursor-pointer" title="Page d'accueil"/>
                        <LogoButton onClick={() => router.push(`/`)} className='w-28 h-12 sm:w-48 sm:h-22 min-[1025px]:w-66 min-[1025px]:h-30'/>
                        <WellcomeLogo/>
                        <p className="text-gray-700 dark:text-white/55">Pas d’inquiétude, on vous guide pas à pas</p>

                        {/* Display on Desktop, hide on Mobile */}
                        {step === 'details_password' && (
                            <div className="mt-8 w-full max-[1025px]:hidden"> 
                                <h5 className="text-2xl font-bold text-gray-900 dark:text-white/85 mb-4 text-center">Sécurité optionnelle</h5>
                                <TwoFactorCheckbox enable2FA={enable2FA} setEnable2FA={setEnable2FA} />
                            </div>
                        )}

                        <p className="mt-6 text-center max-[1025px]:hidden text-gray-700 dark:text-white/55">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">
                                Connectez-vous ici
                            </Link>
                            .
                        </p>
                    </section>

                    {/* Separator */}
                    <div className="w-full min-[1025px]:w-0 max-h-[95%] min-[1025px]:h-70  border-t border-gray-300 dark:border-white/20 min-[1025px]:border-r"></div>
                    
                    {/* Form column*/}
                    <section className="min-[1025px]:max-w-sm flex-1 w-full">
                        <IdleHintBubble step={step} />

                        {renderStepContent()} 
                        
                        <p className="min-[1025px]:hidden mt-6 text-center text-gray-700 dark:text-white/55">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">
                                Connectez-vous ici
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}