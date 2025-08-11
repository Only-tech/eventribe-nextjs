'use client'; 

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bars3Icon, XMarkIcon, CalendarDaysIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Header() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null); 
    const [scrollingUp, setScrollingUp] = useState(true); 
    const lastScrollY = useRef(0); 

    const router = useRouter();
    const searchParams = useSearchParams(); 
    const initialSearchQuery = searchParams.get('query') || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

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

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    // Update search query state if URL search param changes (e.g., from external navigation)
    useEffect(() => {
        setSearchQuery(searchParams.get('query') || ''); 
    }, [searchParams]);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
        router.push(`/?query=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileMenuOpen(false);
        } else {
        router.push('/'); 
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.push('/'); 
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            ref={headerRef} // Attach the ref to the header
            className={`fixed top-0 z-10000 w-full bg-[#f5f5dc] text-gray-800 shadow-lg transition-transform duration-500 py-1 px-[5%] flex flex-row justify-between items-center ${
                scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            >
            <Link href="/" className=" relative text-lg font-semibold w-18 h-18 flex items-center justify-center group" title="eventribe, plus proches des événements à venir">
                <span className="relative z-10 text-base group-hover:text-[#ff952aff] bg-[#f5f5dc] transition-colors duration-300 ease-in-out cursor-pointer">eventribe</span>
                <Image
                src="/images/SplashPaintOrange.svg"
                alt="Logo Eventribe"
                width={72}
                height={72}
                className="absolute inset-0 filter grayscale transition duration-300 ease-in-out group-hover:filter-none bg-contain animate-pulse group-hover:animate-none"
                />
            </Link>

            {/*search Bar */}
            <div className="relative flex-grow mx-6 max-w-lg">
                <form onSubmit={handleSearchSubmit} className="group flex items-center">
                <div className="group w-full flex flex-row rounded-full border border-gray-300 transition duration-300 hover:border-[#ff952aff] focus-within:border-[#ff952aff] overflow-hidden">
                    <input
                    type="text"
                    name="search"
                    placeholder="Rechercher un événement..."
                    className="w-full px-4 py-2 border-none border-transparent outline-none text-sm bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        title="Effacer la recherche"
                    >
                        <XCircleIcon className="w-5 h-5 animate-pulse" /> 
                    </button>
                    )}
                </div>
                <button type="submit" className="ml-2 p-2 rounded-full bg-[#ff952aff] text-white hover:bg-[#111827] transition-colors duration-300  cursor-pointer" title="Rechercher">
                    <MagnifyingGlassIcon className="w-5 h-5" /> 
                </button>
                </form>
            </div>

            <nav className="flex flex-row gap-8 items-center">
                <ul className={`mobile-menu flex items-center gap-8 text-lg font-medium [@media(max-width:1024px)]:flex-col [@media(max-width:1024px)]:absolute [@media(max-width:1024px)]:top-full [@media(max-width:1024px)]:left-0 [@media(max-width:1024px)]:w-full [@media(max-width:1024px)]:bg-[#f5f5dc] [@media(max-width:1024px)]:shadow-lg [@media(max-width:1024px)]:py-4 [@media(max-width:1024px)]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} [@media(min-width:1024px)]:flex`}>
                <li>
                    <Link href="/" className="transition-colors duration-300 hover:text-[#ff952aff] whitespace-nowrap py-2 block" onClick={() => setIsMobileMenuOpen(false)}>
                    Accueil
                    </Link>
                </li>
                <li>
                    <Link href="/my-events" className="relative flex flex-row items-center gap-1 transition-colors duration-300 hover:text-[#ff952aff] py-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <CalendarDaysIcon className="inline-block w-5 h-5" />
                    <span>Mes Inscriptions</span>
                    </Link>
                </li>
                {status === 'loading' ? (
                    <li>Chargement...</li>
                ) : session ? (
                    <>
                    {session.user.isAdmin && (
                        <li>
                        <Link href="/admin" className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-[#ff952aff] py-2 group" 
                            title="Aller à l'administration"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {/* admin icons container */}
                            <div className="relative w-6 h-6"> 
                                <Image
                                    src="/images/adminGray-logo.svg"
                                    alt="Logo admin"
                                    width={24}
                                    height={24}
                                    className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0 animate-bounce"
                                />
                                <Image
                                    src="/images/adminOrange-logo.svg"
                                    alt="Logo admin"
                                    width={24}
                                    height={24}
                                    className="absolute inset-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                                />
                            </div>
                            <span>Admin</span>
                        </Link>
                        </li>
                    )}
                    <li>
                        <button
                        onClick={handleSignOut}
                        className="flex flex-row items-center gap-2 transition-colors duration-300 hover:text-[#ff952aff] py-2 w-full text-left cursor-pointer"
                        title="Se déconnecter">
                            <span>({session.user.name})</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </li>
                    </>
                ) : (
                    <>
                    <li>
                        <Link href="/login" className="transition-colors duration-300 hover:text-[#ff952aff] py-2 block" onClick={() => setIsMobileMenuOpen(false)}>
                        Connexion
                        </Link>
                    </li>
                    <li>
                        <Link href="/register" className="transition-colors duration-300 hover:text-[#ff952aff] py-2 block" onClick={() => setIsMobileMenuOpen(false)}>
                        Inscription
                        </Link>
                    </li>
                    </>
                )}
                </ul>
                <button
                id="burgerBtn"
                className="flex text-4xl [@media(min-width:1024px)]:hidden cursor-pointer"
                title="Menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
                </button>
            </nav>
        </header>
    );
}
