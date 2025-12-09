'use client'

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react'; 
import { useState } from 'react';
import ContactModal from '@/app/ui/ContactModal';  
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { ThemeToggle } from '@/app/ui/ThemeToggle';

export default function Footer() {
    const router = useRouter();
    const { data: session } = useSession(); 
    const pathname = usePathname();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // --- Display simple footer ---
    const simpleFooterPaths = ['/account', '/my-events', '/preview-email'];
    const isSimpleFooter =
        simpleFooterPaths.includes(pathname) || pathname.startsWith('/event/');

    const PartnersData = [
        { id: 1, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/futuremploi.png", alt: "Futuremploi", title: "Futuremploi" },
        { id: 2, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/eventura.png", alt: "Eventura", title: "Eventura" },
        { id: 3, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/cultura.png", alt: "Cultura", title: "Cultura" },
        { id: 4, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/socialista.png", alt: "Socialista", title: "Socialista" },
        { id: 5, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/robbotech.png", alt: "Robbotech", title: "Robbotech" },
        { id: 6, src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/Partners/educom.png", alt: "Educom", title: "Educom" }
    ];

    return (
        <footer className="relative bg-[#FCFFF7] dark:bg-[#1E1E1E] text-[15px] text-gray-700 dark:text-white/70 pt-10 pb-5 w-full rounded-t-2xl shadow-2xl">
        
            {!isSimpleFooter ? (
                // --- Full footer ---
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex max-[925px]:flex-wrap gap-12 lg:gap-15 xl:gap-18 2xl:gap-28 justify-between pb-10 w-full max-w-[95%] px-3 mx-auto">
                    {/* About us */}
                    <section className="w-full sm:col-span-2 flex-1 xl:w-100 text-justify max-lg:order-3 mx-auto">
                        <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] relative inline-block font-semibold after:content-[''] after:block after:h-0.5 after:bg-[#08568a] after:w-[70%] after:mt-1 after:left-0 after:relative pb-1 mb-6">À propos de nous</h3>
                        <p>
                            eventribe connecte organisateurs et passionnés à travers des rencontres humaines et projets culturels.
                            Que vous soyez artiste, pro ou curieux, la plateforme vous accompagne : création d’événements, inscriptions, suivi et bien plus encore.
                            Notre mantra : accessibilité, créativité, fluidité. <br /><br />Rejoignez la tribu et donnez vie à vos idées !
                        </p>
                    </section>

                    {/* Navigation */}
                    <section className="max-lg:order-1 col-span-1 sm:w-52 xl:w-95">
                        <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] relative inline-block font-semibold after:content-[''] after:block after:h-0.5 after:bg-[#08568a] after:w-[70%] after:mt-1 after:left-0 after:relative pb-1 mb-6">Navigation</h3>
                        <ul className="grid min-[400px]:grid-cols-2 sm:grid-cols-1 xl:grid-cols-2 gap-x-6 space-y-2 font-medium">
                            <li><Link href="/" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out">Accueil</Link></li>
                            {session ? (
                                <>
                                    <li><Link href="/my-events" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out whitespace-nowrap">Mes Inscriptions</Link></li>
                                    <li><Link href="/account" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out whitespace-nowrap">Espace Personnel</Link></li>
                                    {session.user.isAdmin && (
                                        <li><Link href="/admin" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out whitespace-nowrap">Interface Administration</Link></li>
                                    )}
                                </>
                            ) : (
                                <>
                                    <li><Link href="/login" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out">Se Connecter</Link></li>
                                    <li><Link href="/register" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out">S&apos;Inscrire</Link></li>
                                </>
                            )}
                            <li><Link href="/legal-mentions" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out whitespace-nowrap">Mentions Légales</Link></li>
                            <li><Link href="/legal-mentions#politique-confidentialite" className="hover:text-[#08568a] hover:font-bold dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out whitespace-nowrap">Politique de Confidentialité</Link></li>
                        </ul>
                    </section>

                    {/* Partners */}
                    <section className="max-lg:order-2 col-span-1">
                        <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] relative inline-block font-semibold after:content-[''] after:block after:h-0.5 after:bg-[#08568a] after:w-[70%] after:mt-1 after:left-0 after:relative pb-1 mb-2">Nos partenaires</h3>
                        <ul className="flex flex-wrap min-[1024px]:w-xs min-[1900px]:w-2xl justify-between gap-5">
                            {PartnersData.map((partner) => (
                                <li key={partner.id}>
                                    <Image
                                        src={partner.src}
                                        alt={partner.alt}
                                        title={partner.title}
                                        width={88} 
                                        height={72}  
                                        className="h-17 w-21 object-contain shadow-[inset_0_-35px_4px_-5px_#f0f2ed] drop-shadow-[0px_3px_3px_rgba(0,0,0,0.2)] shadow-[hsl(var(--always-black)/5.1%)] rounded-b-xs" 
                                    />
                                </li>
                            ))}
                        </ul>
                        <div className='flex justify-center mt-6'>
                            <LogoButton onClick={() => router.push(`/`)} className="w-28 h-auto md:w-32 md:h-15"/>
                        </div>
                    </section>
                </div>
            ) : (
                // --- Light footer ---
                <ul className="flex flex-wrap justify-center space-x-3 pb-1 w-full max-w-[95%] mx-auto font-medium">
                    <li><Link href="/legal-mentions" className="hover:text-[#08568a] hover:underline dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out">Mentions Légales</Link></li> |
                    <li><Link href="/legal-mentions#politique-confidentialite" className="hover:text-[#08568a] hover:underline dark:hover:text-[#ff952aff] transition-all duration-300 ease-in-out ml-2">Politique de Confidentialité</Link></li>
                </ul>
            )}

            {/* --- Globals footer elements --- */}
            <ThemeToggle />

            {!isContactModalOpen && (
                <ActionButton
                    variant="primary"
                    onClick={() => setIsContactModalOpen(true)}
                    className="fixed bottom-0 left-2 sm:left-6 z-1000 pl-5 p-2 rounded-t-2xl! rounded-b-xs! dark:hover:text-gray-200 dark:text-gray-800 dark:hover:bg-gray-800 dark:bg-amber-50"
                >
                    <span>Contactez-nous</span>
                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none" />
                </ActionButton>
            )}

            <p className="text-center text-sm max-md:mb-10">
                All rights reserved. Cédrick &copy; {new Date().getFullYear()} eventribe
            </p>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </footer>
    );
}