'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { ArrowPathIcon, KeyIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import { FingerPrintIcon, PencilSquareIcon, TvIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import { useToast } from '@/app/ui/status/ToastProvider';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';
import Loader from '@/app/ui/animation/Loader';
import TooltipWrapper from '@/app/ui/status/TooltipWrapper';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';


// Steps flow
type AuthStep = 'CHECK_EMAIL' | 'LOGIN_PASSWORD' | 'LOGIN_2FA' | 'REGISTER_VERIFY' | 'REGISTER_DETAILS';

export default function AuthPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { addToast } = useToast();

    // --- State Global ---
    const [step, setStep] = useState<AuthStep>('CHECK_EMAIL');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    // --- State Login ---
    const [password, setPassword] = useState('');
    // Back up numeric part code
    const [loginUserId, setLoginUserId] = useState<number | null>(null);
    const [codeDigits, setCodeDigits] = useState('');

    // --- State Register ---
    const [code, setCode] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [enable2FA, setEnable2FA] = useState(false);
    const helpRef = useRef<HTMLParagraphElement>(null); // Tooltip password

    // To bind the input focus with edit/send code button
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const isCodeActive = isCodeFocused || (code && code.length > 0);

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

    // ============================================================
    // LOGIC 1: EMAIL CHECK
    // ============================================================
    const handleCheckEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        addToast('');

        try {
            // Check if email exist
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.exists) {
                    // head to LOGIN
                    setStep('LOGIN_PASSWORD');
                    addToast('Veuillez entrer votre mot de passe.', 'info');
                } else {
                    // head to REGISTER end send code
                    await sendRegisterCode();
                }
            } else {
                addToast('Erreur lors de la vérification de l\'email.', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('Erreur réseau.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to send registration code
    const sendRegisterCode = async () => {
        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            
            if (res.ok) {
                setStep('REGISTER_VERIFY');
                addToast(`C'est votre première visite ! Un code a été envoyé à ${email}.`);
            } else {
                const data = await res.json();
                addToast(data.message || 'Erreur envoi code', 'error');
            }
        } catch (error) {
            addToast("Impossible d'envoyer le code d'inscription.", 'error');
        }
    };

    // ============================================================
    // LOGIC 2: LOGIN FLOW
    // ============================================================
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check credentials
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                if (data.require2FA) {
                    setLoginUserId(data.userId);
                    setStep('LOGIN_2FA');
                    addToast('Authentification à deux facteurs requise.', 'info');
                } else {
                    await performNextAuthSignIn();
                }
            } else {
                addToast(data.message || 'Mot de passe incorrect.', 'error');
            }
        } catch (error) {
            addToast('Erreur lors de la connexion.', 'error');
        } finally {
            if(step !== 'LOGIN_2FA') setLoading(false);
        }
    };

    // NextAuth Helper
    const performNextAuthSignIn = async () => {
        const result = await signIn('credentials', { redirect: false, email, password });
        if (result?.error) {
            addToast('Erreur session.', 'error');
            setLoading(false);
        } else {
            addToast('Connexion réussie !', 'success');
            addToast(`Bonjour ${firstName}, votre espace est prêt !`);
            // Redirection manage by useEffect
            const sess = await getSession();
            router.push(sess?.user?.isAdmin ? '/admin' : '/events');
        }
    };

    // Verify OTP code
    const handleLogin2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Code rebuild for API Send
        const fullCode = `ev - ${codeDigits}`;
        try {
            const res = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: loginUserId, code: fullCode }),
            });
            if (res.ok) {
                // login if code checking is true
                await performNextAuthSignIn();
            } else {
                addToast('Code incorrect.', 'error');
                setLoading(false);
            }
        } catch (error) {
            addToast('Erreur vérification.', 'error');
            setLoading(false);
        }
    };

    // ============================================================
    // LOGIC 3: REGISTER FLOW
    // ============================================================
    const handleRegisterVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            if (res.ok) {
                setStep('REGISTER_DETAILS');
                addToast('Email vérifié ! Finalisez votre compte.', 'success');
            } else {
                addToast('Code invalide.', 'error');
            }
        } catch (error) {
            addToast('Erreur vérification.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterFinal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return addToast('Les mots de passe ne correspondent pas.', 'error');
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, firstName, lastName, password, confirm_password: confirmPassword, enable2FA }),
            });
            if (res.ok) {
                // Auto login after register
                await performNextAuthSignIn();
            } else {
                const data = await res.json();
                addToast(data.message || 'Erreur création compte.', 'error');
                setLoading(false);
            }
        } catch (error) {
            addToast('Erreur création compte.', 'error');
            setLoading(false);
        }
    };

    // Manage and keep numeric code
    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 6) {
            setCodeDigits(val);
        }
    };
    
    // Resend 2FA OTP code
    const resendCode = async () => {
        addToast('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok && data.require2FA) {
                setLoginUserId(data.userId);
                addToast('Nouveau code envoyé par email.', 'success');
            } else {
                addToast(data.message || 'Échec du renvoi du code.', 'error');
            }
        } catch (error) {
            console.error('Erreur resend code:', error);
            addToast('Erreur réseau.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RENDERING
    // ============================================================

    // Dynamic Title regarding steps
    const getTitle = () => {
        switch(step) {
            case 'CHECK_EMAIL': return "Pas d’inquiétude, on vous guide pas à pas";
            case 'LOGIN_PASSWORD': return "Ravi de vous revoir, votre espace est prêt";
            case 'LOGIN_2FA': return "Un code vous a été envoyé par email";
            case 'REGISTER_VERIFY': return `Nous avons envoyé un code à ${email} pour vérifier qu'il s'agit bien de vous.`;
            case 'REGISTER_DETAILS': return "Activez la 2FA et Créez votre profil";
            default: return "Authentification";
        }
    };

    return (
        <div className="absolute inset-0 bg-[#FCFFF7] sm:bg-transparent max-sm:dark:bg-[#1E1E1E]  min-h-screen overflow-y-auto max-[1025px]:pt-0 max-[1025px]:py-10 flex items-start min-[1025px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">
            <div className="relative sm:drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] max-w-[95%] max-md:w-lg max-[1025px]:w-xl w-5xl mx-auto transform transition-transform duration-500 min-[1025px]:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] group sm:dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] sm:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,0.6)]">
                <div className="sm:rounded-3xl max-sm:mt-0 max-[1025px]:mt-20 flex flex-col min-[1025px]:flex-row items-center min-h-160 min-[1025px]:min-h-120 justify-evenly gap-6 min-[1025px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/75 p-4 sm:p-10 xl:p-12 sm:[clip-path:var(--clip-path-squircle-60)]" >     
                    
                    {/* Branding column */}
                    <section className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
                        <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 sm:top-24 min-[1025px]:top-4! right-4 cursor-pointer" title="Page d'accueil"/>
                        <LogoButton onClick={() => router.push(`/`)} className='w-28 h-12 sm:w-48 sm:h-22 min-[1025px]:w-66 min-[1025px]:h-30'/>
                        <WellcomeLogo/>
                        <h5 className=" mt-4 text-gray-700 dark:text-white/55">{getTitle()}</h5>
                        
                        {step === 'CHECK_EMAIL' && (
                            <div className='flex flex-col justify-center text-gray-700 dark:text-white/55 font-light'>
                                <p className="text-center mt-10">Connectez-vous</p>
                                <div className="flex items-center gap-4">
                                    <div className='w-[70%] h-0 border-t border-gray-300 dark:border-white/20'></div>
                                    <p className='font-light'>ou</p>
                                    <div className='w-[70%] h-0 border-t border-gray-300 dark:border-white/20'></div>
                                </div>
                                <p>Créez un compte en quelques secondes</p>
                            </div>
                        )}

                        {step === 'REGISTER_DETAILS' && (
                            <p className="text-sm text-gray-700 dark:text-white/55 mt-4">
                                Un code <span className="font-mono bg-gray-200 dark:bg-gray-600 px-1 mx-1 rounded">ev - </span> vous sera demandé à chaque connexion.
                            </p>
                        )}
                    </section>

                    {/* Separator */}
                    <div className="w-full max-w-[90%] min-[1025px]:w-0 max-h-[95%] min-[1025px]:h-70  border-t border-gray-300 dark:border-white/20 min-[1025px]:border-r"></div>

                    {/* Form column*/}
                    <section className="min-[1025px]:max-w-sm flex-1 w-full">

                        {step === 'CHECK_EMAIL' && (
                            <form onSubmit={handleCheckEmail} className="space-y-6">
                                <h1 className="flex flex-col items-center justify-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    <EnvelopeOpenIcon className="w-auto h-16 mb-4 max-[1025px]:hidden" />
                                    <span>Quel est votre e-mail ?</span>
                                </h1>
                                <FloatingLabelInput 
                                    label="Adresse e-mail" 
                                    type="E-mail" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    autoFocus 
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
                        )}


                        {step === 'LOGIN_PASSWORD' && (
                            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fadeIn">
                                <h1 className="flex flex-col items-center justify-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    <FingerPrintIcon className="w-auto h-16 mb-4 max-[1025px]:hidden"  />
                                    <span>Connectez-vous</span>
                                </h1>

                                <div className='relative'>
                                    <div className="pointer-events-none opacity-50">
                                        <FloatingLabelInput 
                                            label="E-mail" 
                                            value={email} 
                                            readOnly 
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setStep('CHECK_EMAIL')} 
                                        className="absolute text-indigo-600 inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 cursor-pointer"
                                        title="Modifier l'e-mail"
                                    >
                                        <PencilSquareIcon className="size-5" />
                                    </button>
                                </div>

                                <FloatingLabelInput 
                                    label="Mot de passe" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    autoFocus 
                                />

                                <div className="text-right -mt-6">
                                    <Link href="/password-reset" className="text-sm text-indigo-600 hover:underline">Mot de passe oublié ?</Link>
                                </div>

                                <ActionButton 
                                    type="submit" 
                                    variant="secondary" 
                                    isLoading={loading} 
                                    className="w-full"
                                >
                                    {loading ? (
                                        <span className="ml-3">Connexion</span>
                                    ) : (
                                        <>
                                            <span>Se connecter</span>
                                            <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                                        </>
                                    )}
                                </ActionButton>
                            </form>
                        )}


                        {step === 'LOGIN_2FA' && (
                            <form onSubmit={handleLogin2FA} className="space-y-6 animate-fadeIn">
                                
                                <h1 className="flex flex-col items-center justify-center max-md:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    <KeyIcon className="w-auto h-16 mb-4 max-[1025px]:hidden" />
                                    <span>Vérification 2FA</span>
                                </h1>

                                <div className='relative'>
                                    <FloatingLabelInput 
                                        id="code"
                                        label="Entrez le code"
                                        type="code"
                                        name="code"
                                        value={codeDigits} 
                                        onChange={handleCodeChange} 
                                        required 
                                        autoFocus 
                                        inputMode="numeric"
                                        maxLength={6}
                                        onFocus={() => setIsCodeFocused(true)}
                                        onBlur={() => setIsCodeFocused(false)}
                                    />

                                    <button
                                        type="button"
                                        onClick={resendCode} 
                                        className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-indigo-600 hover:text-gray-700 transition-all duration-500 ease-out ${
                                            isCodeActive ? "translate-y-0" : "translate-y-1"
                                        }`}
                                        disabled={loading}
                                        title="Renvoyer le code"
                                    >
                                        <ArrowPathIcon className="size-5 transition-transform duration-300 hover:rotate-180" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between -mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('CHECK_EMAIL')}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                                        title="Modifier l'email ou le mot de passe"
                                    >
                                        Modifier les identifiants
                                    </button>
                                </div>
                                
                                <ActionButton 
                                    type="submit" 
                                    variant="secondary" 
                                    isLoading={loading} 
                                    className="w-full"
                                >
                                    {loading ? (
                                        <span className="ml-3">Vérification</span>
                                    ) : (
                                        <>
                                            <span>Vérifier et se connecter</span>
                                            <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                                        </>
                                    )}
                                </ActionButton>
                            </form>
                        )}


                        {step === 'REGISTER_VERIFY' && (
                            <form onSubmit={handleRegisterVerifyCode} className="space-y-6 animate-fadeIn">
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
                                        onClick={() => setStep('CHECK_EMAIL')} 
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
                                        onClick={() => sendRegisterCode()} 
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
                        )}


                        {step === 'REGISTER_DETAILS' && (
                            <form onSubmit={handleRegisterFinal} className="space-y-6 animate-fadeIn">
                                <h1 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    Créons votre compte
                                </h1>
                                <div className="grid grid-cols-2 gap-4">
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
                                </div>
                                
                                <FloatingLabelInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                {/* Password Infos */}
                                <p className="text-xs text-gray-600 dark:text-white/50 -mt-4 mb-3" ref={helpRef}>
                                    Saisissez au moins <strong>12 caractères</strong>, dont une <strong>
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

                                <FloatingLabelInput label="Confirmer" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="2fa" checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} className="rounded border-gray-300"/>
                                    <label htmlFor="2fa" className="text-sm text-gray-700 dark:text-gray-300">Activer la double authentification (2FA)</label>
                                </div>

                                <ActionButton type="submit" variant="secondary" isLoading={loading} className="w-full">
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
                        )}

                    </section>
                </div>
            </div>
        </div>
    );
}