'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import clsx from 'clsx';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        // Start enter + animation
        const timer = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const handleChoice = async (choice: 'accept' | 'reject') => {
        setClosing(true); // Start exit animation
        await fetch('/api/consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choice }),
        });
        setTimeout(() => {
            window.location.reload();
        }, 600);
    };

    return (
        // <div
        //     className={clsx(
        //         'fixed z-1000000000 bottom-4 right-4 max-w-[520px] w-[90%] p-2 bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border border-gray-300 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-[0_8px_15px_rgb(0,0,0,0.8)] dark:shadow-[0_8px_18px_rgb(0,0,0)] shadow-[hsl(var(--always-black)/5.1%)] transform transition-all duration-900 ease-in-out',
        //         {
        //         '-translate-x-full opacity-0': !visible && !closing, // Initial state from left
        //         'translate-x-0 opacity-100': visible && !closing,    // Visible when stand to right-4
        //         'translate-x-full opacity-0': closing,               // State to right + closing  
        //         }
        //     )}
        // >

        <div
    className={clsx(
        'fixed lg:flex z-1000000000 bottom-4 w-[92%] xl:max-w-5xl p-2',

        // Mobile & tablette : centré
        'left-1/2 -translate-x-1/2',

        // Desktop ≥ 1200px : aligné à droite comme avant
        'xl:left-auto xl:right-4 xl:translate-x-0',

        // Styles généraux
        'bg-white dark:bg-[#303134] border border-gray-300 dark:border-white/10 rounded-4xl shadow-[0_8px_15px_rgb(0,0,0,0.8)] transform transition-all duration-700 ease-out',

        // Animation slide-up
        {
            'opacity-100 translate-y-0': visible && !closing,
            'opacity-0 translate-y-10': !visible || closing,
        }
    )}
>

            <div className=" px-3 p-2 border border-gray-300 dark:border-white/20 rounded-3xl max-lg:rounded-b-lg lg:rounded-r-lg! bg-[#FCFFF7] dark:bg-[#1E1E1E] shadow-[0_5px_7px_rgb(0,0,0,0.2)] dark:shadow-[0_7px_10px_rgb(0,0,0,0.6)] shadow-[hsl(var(--always-black)/5.1%)]">
                <h5 className="text-base text-center text-gray-800 dark:text-white/90 font-medium mb-1">La protection de votre vie privée est essentielle pour eventribe</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-justify">
                    Nous utilisons uniquement des cookies essentiels au fonctionnement du site.  
                    Ces cookies permettent de maintenir votre session sécurisée, de mémoriser vos préférences 
                    (langue, thème), et d’assurer le bon fonctionnement des fonctionnalités (connexion, 
                    inscriptions aux événements). Aucun cookie publicitaire n’est utilisé.  
                </p>
                <p className='text-end'>
                    <Link href="/legal-mentions#cookies" className="text-indigo-600 hover:underline text-left ml-1">
                        En savoir plus
                    </Link>
                </p>
            </div>
            <div className="flex flex-col justify-between space-y-3 max-lg:pt-2 lg:pl-3 max-lg:mt-3 lg:ml-3 max-lg:border-t lg:border-l border-gray-300 dark:border-white/20">
                <ActionButton
                    variant="primary"
                    onClick={() => handleChoice('accept')}
                    className="flex-1 h-10! rounded-lg! lg:rounded-tr-3xl! w-full"
                >
                    <CheckIcon className='size-6' />
                    <span>J&apos;accepte</span>
                </ActionButton>
                <ActionButton
                    variant="destructive"
                    onClick={() => handleChoice('reject')}
                    className="flex-1 h-10! rounded-lg! max-lg:rounded-b-3xl! lg:rounded-br-3xl! w-full"
                >
                    <XMarkIcon className='size-6' />
                    <span>Je refuse</span>
                </ActionButton>
            </div>
        </div>
    );
}
