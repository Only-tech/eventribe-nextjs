'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useToast } from '@/app/ui/status/ToastProvider';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EyeIcon, EyeSlashIcon, FingerPrintIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';

// Steps flow
type Step = 'login' | '2fa';

export default function LoginPage() {
    const [step, setStep] = useState<Step>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [userId, setUserId] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { addToast } = useToast();
    const router = useRouter();

    // Login + send OTP code
    const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addToast('');
        setLoading(true);

        try {
            // Send 2FA OTP code
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok && data.require2FA) {
                setUserId(data.userId);
                addToast('Code de vérification envoyé par email.', 'success');
                setStep('2fa');
            } else if (res.ok) {
                // Classic connexion via NextAuth if no 2FA
                const result = await signIn('credentials', { redirect: false, email, password });
                if (result?.error) {
                    addToast('Email ou mot de passe incorrect.', 'error');
                } else {
                    addToast('Connexion réussie.', 'success');
                    setTimeout(async () => {
                        const session = await getSession();
                        const isAdmin = session?.user?.isAdmin;
                        addToast('Ravi de vous revoir, votre espace est prêt !');
                        router.push(isAdmin ? '/admin' : '/');
                    }, 1500);
                }
            } else {
                addToast(data.message || 'Erreur lors de la connexion.', 'error');
            }
        } catch (error) {
            console.error('Erreur login:', error);
            addToast('Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP code
    const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addToast('');
        if (!userId) {
            addToast('Session 2FA manquante. Veuillez recommencer.', 'error');
            setStep('login');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code }),
            });
            const data = await res.json();

            if (res.ok) {
                // Finalize connexion via NextAuth JWT session and callbacks
                const result = await signIn('credentials', { redirect: false, email, password });
                if (result?.error) {
                    addToast('Impossible de créer la session après 2FA.', 'error');
                    return;
                }
                addToast('Connexion réussie.', 'success');
                setTimeout(async () => {
                    const session = await getSession();
                    const isAdmin = session?.user?.isAdmin;
                    addToast('Ravi de vous revoir, votre espace est prêt !');
                    router.push(isAdmin ? '/admin' : '/');
                }, 1000);
            } else {
                addToast(data.message || 'Code invalide ou expiré.', 'error');
            }
        } catch (error) {
            console.error('Erreur verify-2fa:', error);
            addToast('Une erreur est survenue. Veuillez réessayer.', 'error');
        } finally {
            setLoading(false);
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
                setUserId(data.userId);
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

    return (
        <div className="absolute inset-0 bg-[#FCFFF7] sm:bg-transparent max-sm:dark:bg-[#1E1E1E]  min-h-screen overflow-y-auto max-[1025px]:pt-0 max-[1025px]:py-10 flex items-start min-[1025px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">
            <div className="relative sm:drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] max-w-[95%] max-md:w-lg max-[1025px]:w-xl w-5xl mx-auto transform transition-transform duration-500 min-[1025px]:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] group sm:dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] sm:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,0.6)]">
                <div className="sm:rounded-3xl max-sm:mt-0 max-[1025px]:mt-20 flex flex-col min-[1025px]:flex-row items-center min-h-160 min-[1025px]:min-h-120 justify-evenly gap-6 min-[1025px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/75 p-4 sm:p-10 xl:p-12 sm:[clip-path:var(--clip-path-squircle-60)]" >      
                    
                    {/* Branding column */}
                    <section className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
                        <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 sm:top-24 min-[1025px]:top-4! right-4 cursor-pointer" title="Page d'accueil"/>
                        <LogoButton onClick={() => router.push(`/`)} className='w-28 h-12 sm:w-48 sm:h-22 min-[1025px]:w-66 min-[1025px]:h-30'/>
                        <WellcomeLogo/>
                        {step === 'login' ? (
                            <>
                                <h5 className="text-gray-700 dark:text-white/55">Ravi de vous revoir, votre espace est prêt</h5>
                                <p className="mt-6 text-center max-[1025px]:hidden text-gray-700 dark:text-gray-500">
                                    Pas encore de compte ?{' '}
                                    <Link href="/register" className="text-indigo-600 hover:underline">Inscrivez-vous ici</Link>.
                                </p>
                            </>
                        ) : (
                            <>
                                <h5 className="text-gray-700 dark:text-white/55">Un code vous a été envoyé par email</h5>
                                <p className="mt-6 text-center max-[1025px]:hidden text-gray-700 dark:text-gray-500">
                                    Besoin de revenir ?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setStep('login')}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Retour à la connexion
                                    </button>.
                                </p>
                            </>
                        )}
                    </section>

                    {/* Separator */}
                    <div className="w-full max-w-[90%] min-[1025px]:w-0 max-h-[95%] min-[1025px]:h-70  border-t border-gray-300 dark:border-white/20 min-[1025px]:border-r"></div>

                    {/* Form column*/}
                    <section className="min-[1025px]:max-w-sm flex-1 w-full">
                        {step === 'login' && (
                            <>
                                <h1 className="flex flex-col items-center justify-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    <FingerPrintIcon className="w-auto h-16 mb-4 max-[1025px]:hidden"  />
                                    <span>Connectez-vous</span>
                                </h1>

                                <form className="space-y-10" onSubmit={handleLoginSubmit}>
                                    <FloatingLabelInput
                                        id="email"
                                        label="Adresse email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />

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

                                    <p className="text-right -mt-9">
                                        <Link href="/password" className="text-indigo-600 hover:underline">
                                            Mot de passe oublié ?
                                        </Link>
                                    </p>

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

                                <p className="min-[1025px]:hidden mt-6 text-center text-gray-700 dark:text-gray-500">
                                    Pas encore de compte ?{' '}
                                    <Link href="/register" className="text-indigo-600 hover:underline">Inscrivez-vous ici</Link>.
                                </p>
                            </>
                        )}

                        {step === '2fa' && (
                            <>
                                <h1 className="flex flex-col items-center justify-center max-md:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                                    <KeyIcon className="w-auto h-16 mb-4 max-[1025px]:hidden" />
                                    <span>Vérification 2FA</span>
                                </h1>

                                <form className="space-y-10" onSubmit={handleVerifySubmit}>
                                    <FloatingLabelInput
                                        id="code"
                                        label="Code reçu par email"
                                        type="text"
                                        name="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        required
                                        maxLength={6}
                                    />

                                    <div className="flex items-center justify-between -mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setStep('login')}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                                            title="Modifier l'email ou le mot de passe"
                                        >
                                            Modifier les identifiants
                                        </button>

                                        <button
                                            type="button"
                                            onClick={resendCode}
                                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                            disabled={loading}
                                            title="Renvoyer le code"
                                        >
                                            <ArrowPathIcon className="h-5 w-5 transition-transform duration-300 hover:rotate-180" />
                                            Renvoyer le code
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
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
