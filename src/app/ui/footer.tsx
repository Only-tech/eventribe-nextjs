'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react'; 
import { useState } from 'react';
import ContactModal from './ContactModal';  
import { ChevronUpIcon } from '@heroicons/react/16/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import ActionButton from './buttons/ActionButton';

export default function Footer() {

  const router = useRouter();
  const { data: session } = useSession(); 

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <footer className="bg-[#f5f5dc] dark:bg-[#1E1E1E] text-[15px] text-gray-700 dark:text-white/70 pt-10 pb-2 w-full rounded-t-2xl shadow-2xl">
      <div className="flex flex-wrap gap-20 justify-between pb-10 w-full max-w-[95%] px-3 mx-auto">
        {/* About us */}
        <div className="max-w-lg @md:max-w-[300px] text-justify max-[849px]:order-3 max-[849px]:justify-center mx-auto">
          <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-6">À propos de nous</h3>
          <p>
            eventribe connecte organisateurs et passionnés à travers des rencontres humaines et projets culturels.
            Que vous soyez artiste, pro ou curieux, la plateforme vous accompagne : création d’événements, inscriptions, suivi et bien plus encore.
            Notre mantra : accessibilité, créativité, fluidité. <br /><br />Rejoignez la tribu et donnez vie à vos idées !
          </p>
        </div>

        {/* Navigation */}
        <div className="max-[849px]:order-1 max-[849px]:justify-center mx-auto">
          <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-6">Navigation</h3>
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
        <div className="max-[849px]:order-2 max-[849px]:justify-center mx-auto">
          <div className="mb-6">
            <h3 className="text-xl text-gray-800 dark:text-[#ff952aff] border-b-1 font-bold pb-1 mb-4">Nos partenaires</h3>
            <div className="flex flex-col gap-2">
              <figure className="flex flex-row h-14 gap-4">
                <Image
                  src="/images/futuremploi.png"
                  alt="Logo futuremploi"
                  width={90}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
                <Image
                  src="/images/socialista.png"
                  alt="Logo socialista"
                  width={80}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
                <Image
                  src="/images/cultura.png"
                  alt="Logo cultura"
                  width={55}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
              </figure>
              <figure className="flex flex-row h-14 gap-8"> 
                <Image
                  src="/images/eventura.png"
                  alt="Logo eventura"
                  width={70}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
                <Image
                  src="/images/robbotech.png"
                  alt="Logo robbotech"
                  width={70}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
                <Image
                  src="/images/educom.png"
                  alt="Logo educom"
                  width={60}
                  height={60}
                  className="bg-contain dark:shadow-[inset_0_-30px_4px_-5px_rgba(255,255,255,0.8)] dark:rounded-b-xs"
                />
              </figure>
            </div>
          </div>
          {/* Contact button */}
          {!isContactModalOpen && (
            <ActionButton
              variant="primary"
              onClick={() => setIsContactModalOpen(true)}
              className="fixed bottom-0 left-10 z-1000 pl-5 p-2 rounded-t-2xl rounded-b-xs dark:hover:text-gray-200 dark:text-gray-800 dark:hover:bg-gray-800 dark:bg-amber-50"
            >
              <span>Contactez-nous</span>
              <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 animate-bounce group-hover:animate-none" />
            </ActionButton>
          )}
          <LogoButton onClick={() => router.push(`/`)} className="w-25 h-18"/>
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
