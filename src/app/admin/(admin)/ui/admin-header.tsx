'use client'; // Client Component to use useSession

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react'; 
import { useState, useEffect, useRef } from 'react'; 
import { Bars3Icon, XMarkIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function AdminHeader() {
  const { data: session, status } = useSession(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null); 
  const [scrollingUp, setScrollingUp] = useState(true); 
  const lastScrollY = useRef(0); 

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }); 
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY.current) {
        setScrollingUp(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) { 
        setScrollingUp(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 

  return (
    <header
      ref={headerRef} // Attach the ref to the header
      className={`fixed top-0 z-10000 w-full bg-gray-900 text-white shadow-lg transition-transform duration-500 py-4 px-[5%] flex flex-row justify-between items-center ${
        scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <Link href="/admin" className="group" title="Administration">
        <Image
          src="/images/adminWhite-logo.svg"
          alt="Logo Admin"
          width={50}
          height={50}
          className="inset-0 animate-pulse group-hover:animate-none transition-opacity duration-300 group-hover:opacity-65 group-hover:scale-110"
        />
      </Link>

      <nav className="flex flex-row gap-8 items-center">
        <Link href="/admin" className="text-lg transition-opacity duration-300 hover:opacity-65 whitespace-nowrap">
          Tableau de bord
        </Link>
        <ul className={`mobile-menu flex items-center gap-8 text-lg font-medium [@media(max-width:1024px)]:flex-col [@media(max-width:1024px)]:absolute [@media(max-width:1024px)]:top-full [@media(max-width:1024px)]:left-0 [@media(max-width:1024px)]:w-full [@media(max-width:1024px)]:bg-gray-900 [@media(max-width:1024px)]:shadow-lg [@media(max-width:1024px)]:py-4 [@media(max-width:1024px)]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} [@media(min-width:1024px)]:flex`}>
          <li>
            <Link href="/admin/manage-events" className="relative flex flex-row items-center gap-1 transition-opacity duration-300 hover:opacity-65 py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Cog6ToothIcon className="inline-block w-5 h-5" />
              <span>Événements</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/manage-registrations" className="relative flex flex-row items-center gap-1 transition-opacity duration-300 hover:opacity-65 py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Cog6ToothIcon className="inline-block w-5 h-5" /> 
              <span>Inscriptions</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/manage-users" className="relative flex flex-row items-center gap-1 transition-opacity duration-300 hover:opacity-65 py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <UserGroupIcon className="inline-block w-5 h-5" /> 
              <span>Utilisateurs</span>
            </Link>
          </li>
          {status === 'loading' ? (
            <li>Chargement...</li>
          ) : session ? (
            <li>
              <button
              onClick={handleSignOut}
              className="flex flex-row items-center gap-2 transition-opacity duration-300 hover:opacity-65 py-2 w-full text-left"
              title="Se déconnecter">
                <span>({session.user.name})</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </li>
          ) : null}
        </ul>
        <button
          id="burgerBtn"
          className="flex text-4xl lg:hidden"
          data-title="Menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
        </button>
      </nav>
    </header>
  );
}
