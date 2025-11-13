'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/ui/status/ToastProvider';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import TooltipWrapper from '@/app/ui/status/TooltipWrapper';
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import { EyeIcon, EyeSlashIcon, EnvelopeOpenIcon, KeyIcon, ArrowPathIcon, PencilSquareIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// Steps flow
type ResetStep = 'email' | 'verification' | 'new_password';

export default function PasswordPage() {
    // Step init
    const [step, setStep] = useState<ResetStep>('email');

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const helpRef = useRef<HTMLParagraphElement>(null);

    const { addToast } = useToast();
    const router = useRouter();

    const validateComplexity = (pwd: string) => {
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasDigit = /\d/.test(pwd);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\];':"\\|,.\/?]/.test(pwd);
        return hasUpper && hasLower && hasDigit && hasSpecial && pwd.length >= 6;
    };

    // ------------------------------------
    // Step 1 Send code)
    // ------------------------------------
    const sendCode = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                addToast(`Code envoyé à ${email}.`, 'success');
                setStep('verification');
            } else {
                addToast(data.message || 'Échec de l\'envoi du code.', 'error');
            }
        } catch {
            addToast('Erreur réseau.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendCode();
    };

    // ------------------------------------
    // Step 2 Code Verification
    // ------------------------------------
    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (res.ok) {
                addToast('Code vérifié.', 'success');
                setStep('new_password');
            } else {
                addToast(data.message || 'Code invalide ou expiré.', 'error');
            }
        } catch {
            addToast('Erreur réseau.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // Step 3 New Password
    // ------------------------------------
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            addToast('Les mots de passe ne correspondent pas.', 'error');
            return;
        }
        if (!validateComplexity(password)) {
            addToast('Le mot de passe doit contenir majuscule, minuscule, chiffre, caractère spécial et 6+ caractères.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword: password }),
            });
            const data = await res.json();
            if (res.ok) {
                addToast('Mot de passe réinitialisé avec succès.', 'success');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                addToast(data.message || 'Erreur lors de la réinitialisation.', 'error');
            }
        } catch {
            addToast('Erreur réseau.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------
    // Steps Conditionnal Render
    // ------------------------------------
    const renderStep = () => {
        switch (step) {
            case 'email':
                return (
                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                        <h1 className="flex flex-col items-center justify-center max-[920px]:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            <EnvelopeOpenIcon className="w-auto h-16 mb-4 max-md:hidden" />
                            <span>Mot de passe oublié</span>
                        </h1>
                        <FloatingLabelInput
                            id="email"
                            label="Adresse email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <ActionButton type="submit" variant="secondary" isLoading={loading} className="w-full">
                        {loading ? (
                            <span className="ml-3">Envoi du code</span>
                        ) : (
                            <>
                                <span>Envoyer le code</span>
                                <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                            </>
                        )}
                        </ActionButton>
                    </form>
                );

            case 'verification':
                return (
                    <form className="space-y-6" onSubmit={handleCodeSubmit}>
                        <h1 className="flex flex-col items-center justify-center max-[920px]:text-xl text-2xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            <KeyIcon className="w-auto h-16 mb-4 max-md:hidden" />
                            <span>Entrez le code reçu par email</span>
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
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                maxLength={6}
                            />
                            <button
                                type="button"
                                onClick={sendCode}
                                className="absolute text-indigo-600 inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700 cursor-pointer"
                                disabled={loading}
                                title="Renvoyer le code"
                            >
                                <ArrowPathIcon className="size-5 transition-transform duration-300 hover:rotate-180" />
                            </button>
                        </div>
                        <ActionButton type="submit" variant="secondary" isLoading={loading} className="w-full">
                            {loading ? (
                                <span className="ml-3">Vérification</span>
                            ) : (
                                <>
                                    <span>Vérifier le code</span>
                                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none"/>
                                </>
                            )}
                        </ActionButton>
                    </form>
                );

            case 'new_password':
                return (
                    <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                        <h1 className="text-center max-[920px]:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            Définissez votre nouveau mot de passe
                        </h1>
                        <div className="relative">
                            <FloatingLabelInput
                                label="Nouveau mot de passe"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-white/70 cursor-pointer"
                                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                            >
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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
                        <FloatingLabelInput
                            label="Confirmer le mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            id="confirm_password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                        <ActionButton type="submit" variant="secondary" isLoading={loading} className="w-full">
                            {loading ? (
                                <span className="ml-3">Réinitialisation</span>
                            ) : (
                                <>
                                    <span>Réinitialiser</span>
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
            <div className="relative min-[500px]:drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] max-w-[95%] max-[769px]:w-md w-5xl mx-auto transform transition-transform duration-500 min-[500px]:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] group min-[500px]:dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] min-[500px]:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
                <div className="flex flex-col min-[769px]:flex-row items-center min-h-120 justify-evenly gap-6 min-[800px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/75 p-2 max-[500]:pt-4 min-[500px]:p-6 lg:p-10 xl:p-12 min-[500px]:[clip-path:var(--clip-path-squircle-60)]">
                    
                    {/* Branding column */}
                    <section className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
                        <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 right-4 cursor-pointer" title="Page d'accueil" />
                        <LogoButton onClick={() => router.push(`/`)} className='max-md:w-25 max-md:h-16 max-[820px]:w-40 max-[820px]:h-32 w-55 h-38' />
                        <WellcomeLogo />
                        {step === 'email' ? (
                            <>
                                <p className="text-gray-700 dark:text-white/55">Entrez votre email pour recevoir le code.</p>
                                <p className="mt-6 text-center max-[769px]:hidden text-gray-700 dark:text-white/55">
                                    Vous vous souvenez de votre mot de passe ?{' '}
                                    <Link href="/login" className="text-indigo-600 hover:underline">Connectez-vous ici</Link>.
                                </p>
                            </>
                        ) : step === 'verification' ? (
                            <>
                                <p className="text-gray-700 dark:text-white/55">Consultez vos e-mails et saisissez le code reçu !</p>
                            </>
                            ) : (
                                <>
                                    <p className="text-gray-700 dark:text-white/55">Définissez un nouveau mot de passe sécurisé !</p>
                                    <p className="mt-6 text-center max-[769px]:hidden text-gray-700 dark:text-white/55">
                                        Vous avez déjà réinitialisé ?{' '}
                                        <Link href="/login" className="text-indigo-600 hover:underline">Connectez-vous</Link>.
                                    </p>
                                </>
                        )}
                    </section>

                    {/* Separator */}
                    <div className="w-full max-w-[90%] min-[769px]:w-0 max-h-[95%] min-[769px]:h-70 border-t border-gray-300 dark:border-white/20 min-[769px]:border-r"></div>

                    {/* Form column*/}
                    <section className="max-w-sm flex-1 w-full">
                        {renderStep()}
                        <p className="min-[769px]:hidden mt-6 text-center text-gray-700 dark:text-white/55">
                            {step === 'email' ? (
                                <>
                                    Vous vous souvenez de votre mot de passe ?{' '}
                                    <Link href="/login" className="text-indigo-600 hover:underline">Connectez-vous ici</Link>.
                                </>
                            ) : (
                                <>
                                    Vous avez déjà réinitialisé ?{' '}
                                    <Link href="/login" className="text-indigo-600 hover:underline">Connectez-vous</Link>.
                                </>
                            )}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
