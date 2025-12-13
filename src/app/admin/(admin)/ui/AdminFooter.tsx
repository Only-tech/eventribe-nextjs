'use client'; 

import { ChevronDownIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

export default function AdminFooter() {

    return (
        <footer className="bg-gray-900 text-white pt-4 mt-auto w-full">
            <div className="container text-center text-sm mx-auto leading-10">
                <Link href="/events" title="Aller à la page d'accueil eventribe reservée au public" className="px-6 py-0 border border-white/20 rounded-full inline-flex items-center justify-center bg-[#FCFFF7] text-gray-800  hover:text-white hover:bg-transparent shadow-[0px_5px_5px_rgba(0,0,0,0.4)] shadow-[hsl(var(--always-black)/5.1%)] transition-all duration-500 ease-in-out">
                    eventribe Public
                    <ChevronDownIcon className="inline-block ml-2 -mr-3 size-6"/>
                </Link>
                <p>All rights reserved. Cédrick &copy; {new Date().getFullYear()} eventribe</p>
            </div>
        </footer>
    );
}