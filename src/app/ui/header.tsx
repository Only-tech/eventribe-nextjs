'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FingerPrintIcon, CalendarDaysIcon as CalendarDateRangeIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';
import { useScrollContainer } from '@/app/providers';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import SearchResults from '@/app/ui/SearchResults';
import { Event } from '@/app/lib/definitions';
import { usePathname, useRouter } from 'next/navigation';

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

    const { addToast } = useToast();

    const [animatedAuthText, setAnimatedAuthText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLLIElement>(null);

    const hasValue = searchQuery.trim() !== '';

    const handleClearSearch = () => {
        setSearchQuery('');
        setResults([]);
        setShowResults(false);
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClearSearch();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);


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
            if (animatedAuthText.length < currentWord.length) {
                timeoutId = setTimeout(() => {
                    setAnimatedAuthText(currentWord.slice(0, animatedAuthText.length + 1));
                }, typingSpeed);
            } else {
                timeoutId = setTimeout(() => {
                    setIsTyping(false);
                }, pauseDuration);
            }
        } else {
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


    // ====== handleClickOutside, userMenuRef) ======
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
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        }
            document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef, searchResultsRef, userMenuRef]);
    
    useEffect(() => {
        if (showResults) {
        setShowResults(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
    
    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/events' });
            addToast('Vous avez été déconnecté avec succès.', 'success');
        } catch {
            addToast('Erreur lors de la déconnexion.', 'error');
        }
    };

    // ====== hide/unhide header on scroll ======
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
                className={`fixed top-0 z-10000 w-full bg-[#FCFFF7] dark:bg-[#222222] text-gray-800 dark:text-white/90 shadow-lg transition-all ease-in-out duration-800 py-1 px-3 min-[425px]:px-[5%] flex flex-row gap-3 justify-between items-center ${
                scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            >
                <div
                    className={`transition-all duration-500 ease-in-out ${
                        hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                >
                    <LogoButton onClick={() => router.push(`/`)} className="w-26 h-18" />
                </div>

                {/* SearchBar */}
                <section
                    ref={searchContainerRef}
                    className={`relative flex flex-grow w-full transition-all duration-500 ease-in-out ${
                        hasValue ? 'absolute inset-x-0 top-5 h-full z-50 flex items-center p-0 w-full' : ' max-w-lg'
                    }`}
                >
                    <div
                        className={`flex items-center w-full bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border text-gray-800 dark:text-white/90 border-gray-200 dark:border-white/10 
                        transition-all ease-in-out duration-600 overflow-hidden shadow-[hsl(var(--always-black)/5.1%)]
                        ${showResults 
                            ? ' bg-white dark:bg-[#222222] rounded-t-2xl md:rounded-t-3xl  ' 
                            : 'rounded-full hover:border-[#0088aa] dark:hover:border-[#ff952aff]'}
                        `}
                    >
                        <button
                            type="submit"
                            className={`ml-4 p-2 size-10 my-auto rounded-full text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-[#ff952aff] transition-all duration-500 ease-out cursor-pointer ${hasValue ? 'flex ' : 'hidden'} `}
                            title="Rechercher"
                        >
                            <MagnifyingGlassIcon className="size-6" />
                        </button>

                        <input
                            type="text"
                            name="search"
                            placeholder="Rechercher un événement..."
                            className={`w-full ${hasValue ? 'px-3' : 'px-6'} py-3 border-none outline-none text-sm bg-transparent`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchQuery.length > 1) setShowResults(true);
                            }}
                            autoComplete="off"
                        />

                        {showResults && (
                            <SearchResults
                                ref={searchResultsRef}
                                results={results}
                                isLoading={isSearching}
                                onClose={handleClearSearch}
                                anchorRef={searchContainerRef}  
                            />
                        )}
                        {hasValue && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="p-1 mr-2 text-gray-500 dark:text-white/70 hover:text-red-600 transition-all duration-500 ease-out cursor-pointer"
                                title="Effacer la recherche"
                            >
                                <XCircleIcon className="size-6" />
                            </button>
                        )}

                    </div>
                    {!hasValue && (
                        <button
                            type="submit"
                            className="ml-2 p-2 size-10 my-auto rounded-full bg-[#101828] text-white dark:bg-[#ff952aff] hover:bg-gray-400 transition-all duration-500 ease-out cursor-pointer"
                            title="Rechercher"
                        >
                            <MagnifyingGlassIcon className="size-6" />
                        </button>
                    )}
                </section>

                {/* Navigation */}
                <nav
                    className={`flex flex-row gap-6 items-center transition-all duration-500 ease-in-out ${
                        hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                >
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
                            {/* --- Navigation Mobile links hidden on desktop display --- */}
                            <li className="min-[1025px]:hidden"><Link href="/my-events" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/my-events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}><CalendarDateRangeIcon className="inline-block size-5" /><span>Mes Inscriptions</span></Link></li>
                            <li className="min-[1025px]:hidden"><Link href="/account" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/account' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}><UserCircleIcon className="inline-block size-5" /><span>Compte</span></Link></li>
                            {session.user.isAdmin && (
                                <li className="min-[1025px]:hidden"><Link href="/admin" className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group" title="Aller à l'administration" onClick={() => setIsMobileMenuOpen(false)}><AdminLogo className="size-6 animate-bounce group-hover:animate-none" /><span>Admin</span></Link></li>
                            )}
                            <li className="min-[1025px]:hidden"><button onClick={handleSignOut} className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] w-full text-left cursor-pointer rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray]" title="Se déconnecter"><span>Hi {session.user.firstName} !</span><LogoutLogo /></button></li>
                            
                            {/* --- Navigation Desktop links hidden on mobile display --- */}
                            <li className="max-[1025px]:hidden"><Link href="/my-events" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/my-events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`}><CalendarDateRangeIcon className="inline-block size-5" /><span>Mes Inscriptions</span></Link></li>
                            
                            {/* --- NavCollapsed --- */}
                            <li className="relative max-[1025px]:hidden" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] cursor-pointer ${
                                        pathname === '/account' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''
                                    }`}
                                >
                                    <UserCircleIcon className="inline-block size-5" />
                                    <span>{session.user.firstName}</span>
                                    <ChevronDownIcon className={`size-6 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className={`absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#222222] rounded-lg translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease shadow-[0_10px_15px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_20px_rgb(0,0,0,0.5)] dark:shadow-[0_15px_25px_rgb(0,0,0,0.8)] dark:hover:shadow-[0_15px_25px_rgb(0,0,0,0.9)] py-2 z-20 border border-gray-300 dark:border-white/20  ${isUserMenuOpen ? 'animate-slide-top' : ' animate-slide-bottom'}`} >
                                        <div className="px-4 py-2 border-b border-gray-300 dark:border-white/20">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white/95 truncate">
                                                {session.user.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-white/70 truncate">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <ul className="py-1">
                                            <li>
                                                <Link
                                                    href="/account"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <UserCircleIcon className="size-5" />
                                                    <span>Mon Compte</span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/my-events"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-gray-500"
                                                    onClick={() => {
                                                        setIsUserMenuOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <CalendarDateRangeIcon className="size-5" />
                                                    <span>Mes Inscriptions</span>
                                                </Link>
                                            </li>                      
                                            {session.user.isAdmin && (
                                                <li>
                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-gray-500"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <AdminLogo className="size-5" />
                                                        <span>Admin</span>
                                                    </Link>
                                                </li>
                                            )}
                                            <li className="border-t border-gray-300 dark:border-white/20 mt-1 pt-1">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer"
                                                >
                                                    <LogoutLogo />
                                                    <span>Déconnexion</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    )}
                                </li>
                            </>
                        ) : (
                            <>
                                {/* --- login/register --- */}
                                <li>
                                    <Link 
                                        href={wordIndex === 0 ? '/login' : '/register'} 
                                        className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${
                                            (pathname === '/login' || pathname === '/register') ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FingerPrintIcon className="inline-block size-5" />
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

        </>
    );
}