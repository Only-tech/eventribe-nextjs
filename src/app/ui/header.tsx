'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { FingerPrintIcon, CalendarDateRangeIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';
import { useScrollContainer } from '@/app/providers';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import SearchResults from '@/app/ui/SearchResults'; 
import { Event } from '@/app/lib/definitions';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [scrollingUp, setScrollingUp] = useState(true);
  const lastScrollY = useRef(0);

  const [isMounted, setIsMounted] = useState(false);

  const { scrollElement } = useScrollContainer();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<OverlayScrollbarsComponentRef>(null);

  const router = useRouter();
  const pathname = usePathname();

  const [animatedAuthText, setAnimatedAuthText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // ===== Type writing authantication =====
  useEffect(() => {
    if (status !== 'unauthenticated') {
      return;
    }

    const words = ['Se Connecter', 'S\'Inscrire'];
    const currentWord = words[wordIndex];
    const typingSpeed = 120;
    const erasingSpeed = 80;
    const pauseDuration = 1500;

    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Writing the word
      if (animatedAuthText.length < currentWord.length) {
        timeoutId = setTimeout(() => {
          setAnimatedAuthText(currentWord.slice(0, animatedAuthText.length + 1));
        }, typingSpeed);
      } else {
        // Paused
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      // Deleting the word
      if (animatedAuthText.length > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedAuthText(animatedAuthText.slice(0, animatedAuthText.length - 1));
        }, erasingSpeed);
      } else {
        setIsTyping(true);
        setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [animatedAuthText, isTyping, wordIndex, status]);


  // ===== instant Search ======
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setShowResults(true);
      setIsSearching(true);
      
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery.trim())}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error("Failed to fetch search results:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);

    } else {
      setShowResults(false);
      setResults([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const searchResultsElement = searchResultsRef.current?.getElement();

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchResultsElement && 
        !searchResultsElement.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef, searchResultsRef]);
  
  useEffect(() => {
    if (showResults) {
      setShowResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/events' });
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  // ====== hide/unhide header on scroll
  useEffect(() => {
    const el = scrollElement;
    if (!el) return;

    const handleScroll = () => {
      const currentScrollY = el.scrollTop; 
      if (currentScrollY < lastScrollY.current) {
        setScrollingUp(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setScrollingUp(false);
      }
      lastScrollY.current = currentScrollY;
    };

    el.addEventListener('scroll', handleScroll);
    
    return () => el.removeEventListener('scroll', handleScroll);
    
  }, [scrollElement]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
    <header
      ref={headerRef}
      className={`fixed top-0 z-10000 w-full bg-[#FCFFF7] dark:bg-[#222222] text-gray-800 dark:text-white/70 shadow-lg transition-all ease-in-out duration-800 py-1 px-3 min-[425px]:px-[5%] flex flex-row justify-between items-center ${
        scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <LogoButton onClick={() => router.push(`/`)} className="w-26 h-18" />

      {/* search bar */}
      <section ref={searchContainerRef} className="relative flex-grow mx-4 min-[425px]:mx-6 max-xl:max-w-sm max-w-lg">
        <div className="group flex items-center">
          <div className="group w-full flex flex-row rounded-full border-[0.1px] text-gray-800 dark:text-white/70 border-gray-300 dark:border-white/20 transition-all ease-in-out duration-600 hover:border-[#0088aa] dark:hover:border-[#ff952aff] focus-within:border-[#0088aa] dark:focus-within:border-[#ff952aff] overflow-hidden">
            <input
              type="text"
              name="search"
              placeholder="Rechercher un événement..."
              className={`w-full ${searchQuery ? 'max-[425px]:pl-3 max-[425px]:pr-0' : ''} px-4 py-2 border-none border-transparent outline-none text-sm bg-transparent transition-all ease-in-out duration-600`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if(searchQuery.length > 1) setShowResults(true) }}
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="p-1 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-white/70 transition-all ease-in-out duration-600 cursor-pointer" title="Effacer la recherche">
                <XCircleIcon className="w-5 h-5 animate-pulse" />
              </button>
            )}
          </div>
          <button type="submit" className="ml-2 p-2 rounded-full bg-[#101828] text-white dark:bg-[#ff952aff] hover:bg-gray-400 transition-all ease-in-out duration-600 cursor-pointer" title="Rechercher">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Navigation */}
      <nav className="flex flex-row gap-6 items-center">
        <ul className={`mobile-menu flex items-start min-[1025px]:items-center gap-4 min-[1025px]:gap-6 text-base xl:text-lg font-medium max-[1025px]:flex-col max-[1025px]:absolute max-[1025px]:top-full max-[1025px]:left-0 max-[1025px]:w-full bg-[#FCFFF7] dark:bg-[#222222] max-[1025px]:shadow-lg max-[1025px]:py-4 max-[1025px]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} min-[1025px]:flex rounded-b-2xl`}>
          <li>
            <Link href="/events" className={`inline-flex whitespace-nowrap items-center gap-3 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group ${pathname === '/events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              <IconHomeButton className="size-5 -translate-y-1" />
              <span>Accueil</span>
            </Link>
          </li>

          {!isMounted ? (
            <>
              <li><span className="inline-flex whitespace-nowrap items-center gap-1 p-2 text-gray-400/50 animate-pulse"><FingerPrintIcon className="inline-block size-5" /><span>Se Connecter</span></span></li>
            </>
          ) : status === 'loading' ? (
            <li>Chargement...</li>
          ) : session ? (
            <>
              <li><Link href="/my-events" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/my-events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}><CalendarDateRangeIcon className="inline-block size-5" /><span>Mes Inscriptions</span></Link></li>
              <li><Link href="/account" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/account' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}><UserCircleIcon className="inline-block size-5" /><span>Compte</span></Link></li>
              {session.user.isAdmin && (
                <li><Link href="/admin" className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group" title="Aller à l'administration" onClick={() => setIsMobileMenuOpen(false)}><AdminLogo className="size-6 animate-bounce group-hover:animate-none" /><span>Admin</span></Link></li>
              )}
              <li><button onClick={handleSignOut} className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] w-full text-left cursor-pointer rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray]" title="Se déconnecter"><span>Hi {session.user.firstName} !</span><LogoutLogo /></button></li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  href={wordIndex === 0 ? '/login' : '/register'} 
                  className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${
                    (pathname === '/login' || pathname === '/register') ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FingerPrintIcon className="inline-block size-5" />
                  {/* Authantication text type writer */}
                  <span className="w-25 xl:w-28 text-left">
                    {animatedAuthText}
                    <span className="animate-pulse">|</span>
                  </span>
                </Link>
              </li>
            </>
          )}
        </ul>
        <button id="burgerBtn" className="flex min-[1025px]:hidden cursor-pointer" title="Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
        </button>
      </nav>
    </header>
    {showResults && (
      <SearchResults
        ref={searchResultsRef}
        results={results}
        isLoading={isSearching}
        onClose={handleClearSearch}
      />
    )}
    </>
  );
}