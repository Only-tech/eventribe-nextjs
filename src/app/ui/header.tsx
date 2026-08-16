'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FingerPrintIcon, CalendarDaysIcon as CalendarDateRangeIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid';
import { Bars3CenterLeftIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { XMarkIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';
import { useScrollContainer } from '@/app/providers';
import { type OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import SearchResults from '@/app/ui/SearchResults';
import { Event } from '@/app/lib/definitions';
import { usePathname, useRouter } from 'next/navigation';
import Loader from '@/app/ui/animation/Loader';
import IconButton from '@/app/ui/buttons/IconButton';
import UserLogo from '@/app/ui/logo/UserLogo';
import { Avatar } from '@/app/ui/Avatar';

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
    const isHomePage = pathname === '/' || pathname === '/events';

    const handleClearSearch = () => {
        setSearchQuery('');
        setResults([]);
        setShowResults(false);
    };

    const closeAllMenus = () => {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/events' });
            closeAllMenus();
            addToast('Vous avez été déconnecté avec succès.', 'success');
        } catch {
            addToast('Erreur lors de la déconnexion.', 'error');
        }
    };

    // Keyboard Escape for Search
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClearSearch(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Type writing authentication
    useEffect(() => {
        if (status !== 'unauthenticated') return;
        const words = ['Se Connecter', 'S\'Inscrire'];
        const currentWord = words[wordIndex];
        let timeoutId: NodeJS.Timeout;

        if (isTyping) {
            if (animatedAuthText.length < currentWord.length) {
                timeoutId = setTimeout(() => setAnimatedAuthText(currentWord.slice(0, animatedAuthText.length + 1)), 120);
            } else {
                timeoutId = setTimeout(() => setIsTyping(false), 1500);
            }
        } else {
            if (animatedAuthText.length > 0) {
                timeoutId = setTimeout(() => setAnimatedAuthText(animatedAuthText.slice(0, animatedAuthText.length - 1)), 80);
            } else {
                setIsTyping(true);
                setWordIndex((prev) => (prev + 1) % words.length);
            }
        }
        return () => clearTimeout(timeoutId);
    }, [animatedAuthText, isTyping, wordIndex, status]);

    // Instant Search
    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            setShowResults(true);
            setIsSearching(true);
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery.trim())}`);
                    if (response.ok) setResults(await response.json());
                } catch (error) {
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setShowResults(false);
            setResults([]);
        }
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery]);

    // Handle Click Outside (Search & Desktop User Menu)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const searchResultsElement = searchResultsRef.current?.getElement();
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node) && searchResultsElement && !searchResultsElement.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (window.innerWidth >= 1025 && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchContainerRef, searchResultsRef, userMenuRef]);
    
    useEffect(() => { if (showResults) setShowResults(false); }, [pathname]);

    // Hide/unhide header on scroll
    useEffect(() => {
        const el = scrollElement;
        if (!el) return;
        const handleScroll = () => {
            const currentScrollY = el.scrollTop; 
            if (currentScrollY < lastScrollY.current) setScrollingUp(true);
            else if (currentScrollY > lastScrollY.current && currentScrollY > 80) setScrollingUp(false);
            lastScrollY.current = currentScrollY;
        };
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [scrollElement]);

    useEffect(() => setIsMounted(true), []);

    return (
        <>
            <header
                ref={headerRef}
                className={`fixed top-0 z-[1010] w-full bg-[#FCFFF7] dark:bg-[#222222] text-gray-800 dark:text-white/90 shadow-lg transition-all ease-in-out duration-500 max-md:py-1.5 px-3 min-[425px]:px-[5%] flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-2 ${scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
            >
                {/* Back / Mobile Menu Toggle */}
                <div className={`flex items-center gap-2 shrink-0 md:mr-6 transition-all duration-500 ease-in-out ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    {!isHomePage && (
                        <IconButton onClick={() => router.back()} className="p-1! -ml-1 bg-transparent shadow-none dark:hover:bg-white/10" title="Retour">
                            <ChevronLeftIcon className="size-9 flex-1" />
                        </IconButton>
                    )}
                    <IconButton className="min-[1025px]:hidden p-1.5! rounded-md! bg-gray-100/50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10" title="Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <XMarkIcon className="size-7" /> : <Bars3CenterLeftIcon className="size-7" />}
                    </IconButton>
                </div>

                {/* Logo */}
                <div className={`transition-all duration-500 ease-in-out max-lg:-ml-5 ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <LogoButton onClick={() => router.push(`/events`)} className="w-28 h-auto md:w-32 md:h-15" />
                </div>

                {/* Mobile Espace Personnel Shortcut */}
                <div className={`min-[1025px]:hidden order-2 md:order-3 ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <IconButton className="bg-transparent hover:bg-gray-100 dark:hover:bg-white/10" onClick={() => router.push(`/account`)} title='Espace Personnel'>
                        <UserLogo className='size-7!'/>
                    </IconButton>
                </div>
       
                {/* Search */}
                <section
                    ref={searchContainerRef}
                    className={`relative flex transition-all duration-500 ease-in-out
                        order-3 w-full grow md:mx-10 md:order-2 ${
                        hasValue ? 'absolute inset-x-0 top-5 h-full z-50 flex items-center p-0 w-full' : ' '
                    }`}
                >
                    <div
                        className={`flex items-center w-full bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border text-gray-800 dark:text-white/90 border-gray-200 dark:border-white/10 max-sm:px-1 
                        transition-all ease-in-out duration-600 overflow-hidden shadow-[hsl(var(--always-black)/5.1%)]
                        ${showResults 
                            ? ' bg-white dark:bg-[#222222] rounded-t-2xl md:rounded-t-3xl  ' 
                            : 'rounded-full hover:border-[#0088aa] dark:hover:border-[#ff952aff] shadow-sm '}
                        `}
                    >
                        {/* Search button when tying */}
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

                        {/* Clear button */}
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

                        {/* Search button on mobile display */}
                        {!hasValue && (
                            <button
                                type="submit"
                                className="sm:hidden p-2 my-auto rounded-full bg-[#101828] text-white dark:bg-[#ff952aff] hover:bg-gray-400 transition-all duration-500 ease-out cursor-pointer"
                                title="Rechercher"
                            >
                                <MagnifyingGlassIcon className="size-5" />
                            </button>
                        )}
                    </div>

                    {/* Search button */}
                    {!hasValue && (
                        <button
                            type="submit"
                            className="max-sm:hidden ml-2 p-2 size-10 my-auto rounded-full bg-[#101828] text-white dark:bg-[#ff952aff] hover:bg-gray-400 transition-all duration-500 ease-out cursor-pointer"
                            title="Rechercher"
                        >
                            <MagnifyingGlassIcon className="size-6" />
                        </button>
                    )}
                </section>

                {/* MOBILE SIDEBAR + DESKTOP NAVBAR) */}
                {isMobileMenuOpen && <div className="min-[1025px]:hidden fixed inset-0 bg-black/50 z-999 h-dvh backdrop-blur-xs" onClick={closeAllMenus} />}

                <nav className={`fixed top-0 left-0 h-dvh w-[85%] max-w-sm bg-[#FCFFF7] dark:bg-[#1f1f1f] shadow-xl z-1000 flex flex-col transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} min-[1025px]:static min-[1025px]:translate-x-0 min-[1025px]:h-auto min-[1025px]:w-auto min-[1025px]:max-w-none min-[1025px]:bg-transparent min-[1025px]:dark:bg-transparent min-[1025px]:shadow-none min-[1025px]:flex-row min-[1025px]:items-center order-4 ${hasValue ? 'min-[1025px]:hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Mobile Only: Top Header with logo & close */}
                    <div className="min-[1025px]:hidden flex items-center justify-between p-4 bg-[#FCFFF7] dark:bg-[#1f1f1f]">
                        <IconButton className="p-1.5! rounded-md! bg-gray-100/50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10" onClick={() => setIsMobileMenuOpen(false)}>
                            <XMarkIcon className="size-7" />
                        </IconButton>
                        <LogoButton onClick={() => { router.push(`/events`); setIsMobileMenuOpen(false); }} className="w-28 h-auto" />
                        <div className="size-5"/>
                    </div>
                    <div className="min-[1025px]:hidden flex items-center gap-3 pb-3 px-4 border-b border-gray-200 dark:border-white/10">
                        <Avatar src={session?.user?.image} alt={`${session?.user.firstName} ${session?.user.lastName}`.trim() || "Utilisateur"} className="size-12 text-2xl ring-1 ring-gray-300 dark:ring-white/40" />
                        <span className="flex flex-col">
                            <span className="font-semibold">{session ? `${session.user.firstName} ${session.user.lastName}` : "Invité"}</span>
                            <span className="text-sm text-gray-500">{session?.user.email}</span>
                        </span>
                    </div>

                    {/* Single shared list for both desktop and mobile */}
                    <ul className="flex flex-col min-[1025px]:flex-row min-[1025px]:items-center gap-2 min-[1025px]:gap-6 px-4 py-6 min-[1025px]:p-0 overflow-y-auto min-[1025px]:overflow-visible text-base xl:text-lg font-medium h-full">
                        <li>
                            <Link href="/events" onClick={closeAllMenus} className={`flex items-center gap-4 min-[1025px]:gap-3 p-2 rounded-md min-[1025px]:rounded-full hover:bg-gray-100 dark:hover:bg-white/10 min-[1025px]:hover:bg-transparent min-[1025px]:hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/events' ? 'min-[1025px]:shadow-[inset_0px_2px_1px_#101828] min-[1025px]:dark:shadow-[inset_0px_2px_1px_#ff952aff] bg-blue-50 dark:bg-white/5 min-[1025px]:bg-transparent' : ''}`}>
                                <IconHomeButton className="size-5 -translate-y-1" />
                                <span>Accueil</span>
                            </Link>
                        </li>

                        {!isMounted ? (
                            <span className="flex items-center gap-1 p-2 text-gray-400/50 animate-pulse"><FingerPrintIcon className="size-5" /><span>Se Connecter</span></span>
                        ) : status === 'loading' ? (
                            <Loader variant='dots' />
                        ) : session && (
                            <>

                                {/* Registrations */}
                                <li className="mt-2 min-[1025px]:mt-0">
                                    <Link href="/my-events" onClick={closeAllMenus} className={`flex items-center gap-3 p-2 whitespace-nowrap rounded-md min-[1025px]:rounded-full hover:bg-gray-100 dark:hover:bg-white/10 min-[1025px]:hover:bg-transparent min-[1025px]:hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/my-events' ? 'min-[1025px]:shadow-[inset_0px_2px_1px_#101828] min-[1025px]:dark:shadow-[inset_0px_2px_1px_#ff952aff] bg-blue-50 dark:bg-white/5 min-[1025px]:bg-transparent' : ''}`}>
                                        <CalendarDateRangeIcon className="size-5 shrink-0" />
                                        <span>Mes Inscriptions</span>
                                    </Link>
                                </li>

                                {/* User Actions Wrapper: Dropdown on Desktop, Standard list on Mobile */}
                                <li className="relative mt-2 min-[1025px]:mt-0" ref={userMenuRef}>
                                    {/* Desktop User Avatar Button (Hidden on Mobile) */}
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`hidden min-[1025px]:flex items-center gap-1 p-2 rounded-full hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/account' ? 'min-[1025px]:shadow-[inset_0px_2px_1px_#101828] min-[1025px]:dark:shadow-[inset_0px_2px_1px_#ff952aff] bg-blue-50 dark:bg-white/5 min-[1025px]:bg-transparent' : ''}`}>
                                        <Avatar src={session.user?.image} alt={`${session.user.firstName} ${session.user.lastName}`.trim() || "Utilisateur"} className="size-6 text-xs ring-1 ring-gray-300 dark:ring-white/40" />
                                        <span className="ml-1">{session.user.firstName}</span>
                                        <ChevronDownIcon className={`size-6 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Desktop Dropdown Box / Mobile List */}
                                    <ul className={`flex flex-col min-[1025px]:absolute min-[1025px]:right-0 min-[1025px]:top-full min-[1025px]:mt-2 min-[1025px]:w-72 min-[1025px]:bg-white min-[1025px]:dark:bg-[#111] min-[1025px]:rounded-lg min-[1025px]:rounded-tl-4xl min-[1025px]:drop-shadow-[0_16px_20px_rgb(0,0,0,0.6)] dark:min-[1025px]:drop-shadow-[0_16px_20px_rgb(0,0,0,0.9)] min-[1025px]:border min-[1025px]:border-gray-300 min-[1025px]:dark:border-white/20 min-[1025px]:p-3 min-[1025px]:z-20 ${isUserMenuOpen ? 'min-[1025px]:flex min-[1025px]:animate-slide-top' : 'min-[1025px]:hidden'}`}>
                                        <li className="hidden min-[1025px]:flex items-center gap-3 pb-3 mb-2 border-b border-gray-300 dark:border-white/10">
                                            <Avatar src={session.user?.image} alt={`${session.user.firstName} ${session.user.lastName}`.trim() || "Utilisateur"} className="size-12 text-2xl ring-1 ring-gray-300 dark:ring-white/40" />
                                            <span className="flex flex-col">
                                                <span className="font-semibold">{session.user.name}</span>
                                                <span className="text-sm text-gray-500">{session.user.email}</span>
                                            </span>
                                        </li>
                                        <li>
                                            <Link href="/account" onClick={closeAllMenus} className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white/95 text-base min-[1025px]:text-sm ${pathname === '/account' ? 'bg-blue-50 dark:bg-white/5 min-[1025px]:bg-transparent' : ''}`}>
                                                <ComputerDesktopIcon className="size-5 shrink-0" />
                                                <span>Mon Espace Personnel</span>
                                            </Link>
                                        </li>

                                        {session.user.isAdmin && (
                                            <li>
                                                <Link href="/admin" onClick={closeAllMenus} className="flex items-center gap-4 min-[1025px]:gap-3 p-3 min-[1025px]:p-2 my-2 rounded-md border border-gray-300 dark:border-white/20 bg-[url('/images/SplashPaintLeftSide.svg')] bg-no-repeat bg-cover bg-top hover:bg-gray-100 dark:hover:bg-white/10">
                                                    <AdminLogo className="size-12! drop-shadow-2xl" />
                                                    <span className="drop-shadow-2xl font-medium min-[1025px]:text-base">Interface <br/>Administrateur</span>
                                                </Link>
                                            </li>
                                        )}
                                        <li className="hidden min-[1025px]:block mt-1 pt-1 border-t border-gray-300 dark:border-white/20">
                                            <button onClick={handleSignOut} className="flex items-center gap-3 w-full text-left p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-900/20 text-base min-[1025px]:text-sm">
                                                <LogoutLogo />
                                                <span>Se Déconnecter</span>
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}

                    </ul>
                    <ul className="py-2 px-4 min-[1025px]:pl-6 max-[1025px]:border-t border-gray-200 dark:border-white/10 text-base xl:text-lg font-medium">
                        {session ? (
                            <button onClick={handleSignOut} className="min-[1025px]:hidden flex items-center gap-3 w-full text-left p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-900/20 text-base min-[1025px]:text-sm">
                                <LogoutLogo />
                                <span>Se Déconnecter</span>
                            </button>
                        ) : (
                            <Link 
                                href='/login' 
                                className={`w-full inline-flex whitespace-nowrap items-center gap-2 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] p-2 rounded-md min-[1025px]:rounded-full hover:bg-gray-100 dark:hover:bg-white/10 min-[1025px]:hover:bg-transparent min-[1025px]:hover:shadow-[inset_0px_2px_1px_gray] ${
                                    (pathname === '/login') ? ' min-[1025px]:shadow-[inset_0px_2px_1px_#101828]  dark:min-[1025px]:shadow-[inset_0px_2px_1px_#ff952aff] bg-blue-50 dark:bg-white/5 min-[1025px]:bg-transparent' : ''
                                }`}
                                onClick={closeAllMenus} 
                            >
                                <FingerPrintIcon className="inline-block size-5" />
                                <span className="w-25 xl:w-28 text-left">
                                    {animatedAuthText}
                                    <span className="animate-pulse">|</span>
                                </span>
                            </Link>
                        )}
                    </ul>
                </nav>
            </header>
        </>
    );
}