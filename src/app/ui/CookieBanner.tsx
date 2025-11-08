'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';;
import clsx from 'clsx';
import ActionButton from '@/app/ui/buttons/ActionButton';

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
        <div
            className={clsx(
                'fixed z-1000000000 bottom-4 right-4 max-w-[520px] w-[90%] p-2 bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border border-gray-300 dark:border-white/10 rounded-2xl md:rounded-3xl shadow-[0_8px_15px_rgb(0,0,0,0.8)] dark:shadow-[0_8px_18px_rgb(0,0,0)] shadow-[hsl(var(--always-black)/5.1%)] transform transition-all duration-900 ease-in-out',
                {
                '-translate-x-full opacity-0': !visible && !closing, // Initial state from left
                'translate-x-0 opacity-100': visible && !closing,    // Visible when stand to right-4
                'translate-x-full opacity-0': closing,               // State to right + closing  
                }
            )}
        >
            <OverlayScrollbarsComponent className="cookie mb-2 h-30 px-3 p-2 border border-gray-300 dark:border-white/20 rounded-xl bg-[#FCFFF7] dark:bg-[#1E1E1E] shadow-[0_5px_7px_rgb(0,0,0,0.2)] dark:shadow-[0_7px_10px_rgb(0,0,0,0.6)] shadow-[hsl(var(--always-black)/5.1%)]">
                <h5 className="text-base text-center text-gray-800 dark:text-white/90 font-medium mb-1">La protection de votre vie privée est essentielle pour eventribe</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nous utilisons uniquement des cookies essentiels au fonctionnement du site.  
                    Ces cookies permettent de maintenir votre session sécurisée, de mémoriser vos préférences 
                    (langue, thème), et d’assurer le bon fonctionnement des fonctionnalités (connexion, 
                    inscriptions aux événements). Aucun cookie publicitaire n’est utilisé.  
                </p>
                <Link href="/legal-mentions#cookies" className="text-indigo-600 hover:underline ml-1">
                    En savoir plus
                </Link>
            </OverlayScrollbarsComponent>
            <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-white/20">
                <ActionButton
                    variant="destructive"
                    onClick={() => handleChoice('reject')}
                    className="flex-1 rounded-r"
                >
                    Je refuse
                </ActionButton>
                <ActionButton
                    variant="primary"
                    onClick={() => handleChoice('accept')}
                    className="flex-1 rounded-l"
                >
                    J'accepte
                </ActionButton>
            </div>
        </div>
    );
}
