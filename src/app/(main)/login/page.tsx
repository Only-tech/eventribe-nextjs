'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EyeIcon, EyeSlashIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import WellcomeLogo from '@/app/ui/logo/WellcomeLogo';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(''); 

        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false, // Prevent NextAuth from redirecting automatically
                email,
                password,
            });

            if (result?.error) {
                setLoading(false);
                setMessage('Email ou mot de passe incorrect.');
                setIsSuccess(false);
            } else {
                setMessage('Connexion réussie. Ravi de vous revoir, votre espace est prêt !');
                setIsSuccess(true);
                setTimeout(async () => {
                    const session = await getSession();
                    const isAdmin = session?.user?.isAdmin;

                    if (isAdmin) {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire de connexion:', error);
            setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            setIsSuccess(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-[#FCFFF7] min-[500px]:bg-[#FCFFF7]/65 dark:bg-[#222222]/65 max-[500px]:dark:bg-[#1E1E1E] backdrop-blur-sm min-h-screen overflow-y-auto max-[500px]:pt-0 max-[1025px]:py-10 flex items-start min-[1025px]:items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">
            <div className="relative min-[500px]:drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] max-w-[95%] max-[769px]:w-md w-5xl mx-auto transform transition-transform duration-500 min-[500px]:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] group min-[500px]:dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] min-[500px]:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
                <div className="flex flex-col min-[769px]:flex-row items-center min-h-120  justify-evenly gap-6 min-[800px]:gap-10 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/75 p-2 max-[500]:pt-4 min-[500px]:p-6 lg:p-10 xl:p-12 min-[500px]:[clip-path:var(--clip-path-squircle-60)]" >      
                    <section className="relative max-w-sm flex-1 w-full flex flex-col items-center justify-center">
                        <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-4 right-4 cursor-pointer" title="Page d'accueil"/>
                        <LogoButton onClick={() => router.push(`/`)} className='max-md:w-25 max-md:h-16 max-[820px]:w-40 max-[820px]:h-32 w-55 h-38'/>
                        <WellcomeLogo/>
                        <h5 className="text-gray-700 dark:text-white/55">Ravi de vous revoir, votre espace est prêt</h5>
                        <p className="mt-6 text-center max-[769px]:hidden text-gray-700 dark:text-gray-500">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-indigo-600 hover:underline">
                                Inscrivez-vous ici
                            </Link>
                            .
                        </p>
                    </section>

                    <div className="w-full max-w-[90%] min-[769px]:w-0 max-h-[95%] min-[769px]:h-70  border-t border-gray-300 dark:border-white/20 min-[769px]:border-r"></div>
                    
                    <section className="max-w-sm flex-1 w-full">
                        {message && (
                            <div className={`fixed w-full max-w-[85%] top-6 [769px]:top-1 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg border ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                {message}
                            </div>
                        )}

                        <h1 className="flex flex-col items-center justify-center max-[920px]:text-2xl text-3xl font-bold text-gray-900 dark:text-white/85 mb-8">
                            <FingerPrintIcon className="w-auto h-16 mb-4 max-md:hidden"  />
                            <span>Connectez-vous</span>
                        </h1>

                        <form className="space-y-6" onSubmit={handleSubmit}>

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
                        
                        <p className="min-[769px]:hidden mt-6 text-center text-gray-700 dark:text-gray-500">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="text-indigo-600 hover:underline">
                                Inscrivez-vous ici
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
