'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react'; 
import { useState } from 'react';
import ContactModal from './contact-modal';  

export default function Footer() {
  const { data: session } = useSession(); 

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <footer className="bg-[#f5f5dc] dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-400 pt-10 pb-2 w-full">
      <div className="flex flex-wrap gap-20 justify-between pb-10 w-full max-w-[95%] px-3 mx-auto">
        {/* About us */}
        <div className="max-w-lg @md:max-w-[300px] text-justify [@media(max-width:849px)]:order-3 [@media(max-width:849px)]:justify-center mx-auto">
          <h3 className="text-2xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-6">À propos de nous</h3>
          <p>
            eventribe connecte organisateurs et passionnés à travers des rencontres humaines et projets culturels.
            Que vous soyez artiste, pro ou curieux, la plateforme vous accompagne : création d’événements, inscriptions, suivi et bien plus encore.
            Notre mantra : accessibilité, créativité, fluidité. <br />Rejoignez la tribu et donnez vie à vos idées !
          </p>
        </div>

        {/* Navigation */}
        <div className="[@media(max-width:849px)]:order-1 [@media(max-width:849px)]:justify-center mx-auto">
          <h3 className="text-2xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-6">Navigation</h3>
          <ul className="flex flex-col space-y-2 font-medium">
            <li><Link href="/" className="hover:text-[#ff952aff] transition duration-300">Accueil</Link></li>
            {session ? (
              <>
                <li><Link href="/my-events" className="hover:text-[#ff952aff] transition duration-300">Mes Inscriptions</Link></li>
                <li><Link href="/account" className="hover:text-[#ff952aff] transition duration-300">Compte</Link></li>
                {session.user.isAdmin && (
                  <li><Link href="/admin" className="hover:text-[#ff952aff] transition duration-300">Administration</Link></li>
                )}
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-[#ff952aff] transition duration-300">Connexion</Link></li>
                <li><Link href="/register" className="hover:text-[#ff952aff] transition duration-300">Inscription</Link></li>
              </>
            )}
            <li><Link href="/legal-mentions" className="hover:text-[#ff952aff] transition duration-300">Mentions Légales</Link></li>
            <li><Link href="/legal-mentions#politique-confidentialite" className="hover:text-[#ff952aff] transition duration-300">Politique de Confidentialité</Link></li>
          </ul>
        </div>

        {/* Partners */}
        <div className="[@media(max-width:849px)]:order-2 [@media(max-width:849px)]:justify-center mx-auto">
          <div className="mb-6">
            <h3 className="text-2xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-4">Nos partenaires</h3>
            <div className="flex flex-col gap-2">
              <figure className="flex flex-row h-14 gap-4"> 
                <Image
                  src="/images/futuremploi.png"
                  alt="Logo futuremploi"
                  width={90}
                  height={60}
                  className="bg-contain"
                />
                <Image
                  src="/images/socialista.png"
                  alt="Logo socialista"
                  width={80}
                  height={60}
                  className="bg-contain"
                />
                <Image
                  src="/images/cultura.png"
                  alt="Logo cultura"
                  width={55}
                  height={60}
                  className="bg-contain"
                />
              </figure>
              <figure className="flex flex-row h-14 gap-8"> 
                <Image
                  src="/images/eventura.png"
                  alt="Logo eventura"
                  width={70}
                  height={60}
                  className="bg-contain"
                />
                <Image
                  src="/images/robbotech.png"
                  alt="Logo robbotech"
                  width={70}
                  height={60}
                  className="bg-contain"
                />
                <Image
                  src="/images/educom.png"
                  alt="Logo educom"
                  width={60}
                  height={60}
                  className="bg-contain"
                />
              </figure>
            </div>
          </div>
          {/* Contact button */}
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="fixed z-1000 bottom-0 left-10 bg-[#ff952aff] text-xl font-semibold px-8 py-2 rounded-t-full text-gray-900 hover:text-[#ff952aff] transition-all group border-0 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] hover:bg-gray-900 cursor-pointer duration-300 ease-in-out"
          >
            Contactez-nous
          </button>
          <Link href="/" className="relative text-lg text font-semibold mb-2 md:mb-0 w-20 h-20 flex items-center justify-center group mx-auto [@media(max-width:849px)]:order-4" title="eventribe, plus proches des événements à venir">
              <span className="relative z-10 group-hover:text-[#ff952aff] bg-[#f5f5dc] dark:bg-[#222222] dark:text-[#ff952aff] transition-colors duration-300 ease-in-out cursor-pointer">eventribe</span>
              <Image
              className="absolute inset-0 filter grayscale transition duration-300 ease-in-out group-hover:filter-none hover:filter-none animate-pulse group-hover:animate-none"
              src="/images/SplashPaintOrange.svg" 
              alt="Eventribe Logo"
              width={80} 
              height={80}
              />
          </Link>
        </div>

      </div>

      <div className="text-center text-sm [@media(max-width:800px)]:mb-10">
        All rights reserved. Cédrick &copy; {new Date().getFullYear()} eventribe
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </footer>
  );
}
