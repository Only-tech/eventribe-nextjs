'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FingerPrintIcon, CalendarDaysIcon as CalendarDateRangeIcon } from '@heroicons/react/24/solid';
import { Bars3CenterLeftIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { XMarkIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';
import { useScrollContainer } from '@/app/providers';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';;
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

    const handleBack = () => {
        router.back();
    };

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


    // ===== Type writing authentication =====
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
 
                className={`fixed top-0 z-1010 w-full bg-[#FCFFF7] dark:bg-[#222222] text-gray-800 dark:text-white/90 shadow-lg transition-all ease-in-out duration-500 max-md:py-1.5 px-3 min-[425px]:px-[5%] 
                    flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 gap-x-2
                    ${scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                `}
            >
                          
                <div className={`flex items-center gap-2 shrink-0 md:mr-6 transition-all duration-500 ease-in-out cursor-pointer ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Back Button if not in HomePage) */}
                    {!isHomePage ? (
                        <IconButton 
                            onClick={handleBack} 
                            className="p-1! -ml-1 bg-transparent shadow-none dark:hover:bg-white/10 transition-all transform duration-600 ease-out cursor-pointer"
                            aria-label="Retour"
                            title="Retour"
                        >
                            <ChevronLeftIcon className="size-9 flex-1" />
                        </IconButton>
                    ) : (
                        null 
                    )}

                    {/* Menu Burger button */}
                    <IconButton                     
                        className="min-[1025px]:hidden p-1.5! rounded-md! bg-transparent shadow-none hover:bg-gray-100 dark:hover:bg-white/10 transition-all transform duration-600 ease-out cursor-pointer"
                        aria-label="Menu"
                        title={isMobileMenuOpen ? 'Fermer le Menu' : 'Ouvrir le Menu'} 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <XMarkIcon className="size-7 flex-1" /> : <Bars3CenterLeftIcon className="size-7 flex-1" />}
                    </IconButton>
                </div>

                {/* Logo eventribe */}
                <div className={`transition-all duration-500 ease-in-out max-lg:-ml-5 ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <LogoButton onClick={() => router.push(`/`)} className="w-28 h-auto md:w-32 md:h-15" />
                </div>

                {/* User logo router Account */}
                <div className={`min-[1025px]:hidden order-2 md:order-3 ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <IconButton
                        className="bg-transparent shadow-none hover:bg-gray-100 dark:hover:bg-white/10"
                        onClick={() => router.push(`/account`)}
                        title='Espace Personnel'
                    >
                        <UserLogo className='size-7! flex-1'/>
                    </IconButton>
                </div>
       
                {/* ========== Search container =========== */}
                <section
                    ref={searchContainerRef}
                    className={`relative flex transition-all duration-500 ease-in-out
                        order-3 w-full grow md:mx-10 md:order-2 ${
                        hasValue ? 'absolute inset-x-0 top-5 h-full z-50 flex items-center p-0 w-full' : ' '
                    }`}
                >
                    <div
                        className={`flex items-center w-full bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border text-gray-800 dark:text-white/90 border-gray-200 dark:border-white/10 max-sm:px-1 
                        transition-all ease-in-out duration-600 overflow-hiddenshadow-[hsl(var(--always-black)/5.1%)]
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

                {/* ========= Desktop Navigation ============== */}
                <nav className={`hidden  flex-row gap-6 items-center order-4 transition-all duration-500 ease-in-out ${
                        hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100 min-[1025px]:flex'
                    }`}
                >
                    <ul className={`flex items-center gap-4 min-[1025px]:gap-6 text-base xl:text-lg font-medium max-[1025px]:absolute max-[1025px]:top-full max-[1025px]:left-0 max-[1025px]:w-full bg-[#FCFFF7] dark:bg-[#222222] max-[1025px]:shadow-lg max-[1025px]:py-4 max-[1025px]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} min-[1025px]:flex rounded-b-2xl`}>
                        <li>
                            <Link href="/events" className={`inline-flex whitespace-nowrap items-center gap-3 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group ${pathname === '/events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                <IconHomeButton className="size-5 -translate-y-1" />
                                <span>Accueil</span>
                            </Link>
                        </li>

                    {!isMounted ? (
                        <span className="inline-flex whitespace-nowrap items-center gap-1 p-2 text-gray-400/50 animate-pulse"><FingerPrintIcon className="inline-block size-5" /><span>Se Connecter</span></span>
                    ) : status === 'loading' ? (
                        <Loader variant='dots' />
                    ) : session ? (
                        <>
                             {/* Registrations events link Desktop */}
                            <Link href="/my-events" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${pathname === '/my-events' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''}`}><CalendarDateRangeIcon className="inline-block size-5" /><span>Mes Inscriptions</span></Link>
                            
                            {/* User Menu Dropdown Desktop */}
                            <li className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600 dark:hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] cursor-pointer ${
                                        pathname === '/account' ? ' shadow-[inset_0px_2px_1px_#101828]  dark:shadow-[inset_0px_2px_1px_#ff952aff]' : ''
                                    }`}
                                >
                                    <Avatar src={session.user?.image} alt={`${session.user.firstName} ${session.user.lastName}`.trim() || "Utilisateur"} className="size-6 text-xs ring-1 ring-gray-300 dark:ring-white/40" />
                                    <span className='ml-1'>{session.user.firstName}</span>
                                    <ChevronDownIcon className={`size-6 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className={`absolute px-3 right-0 top-full mt-2 w-64 bg-white dark:bg-[#1f1f1f] rounded-lg translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease shadow-[0_10px_15px_rgb(0,0,0,0.4)] hover:shadow-[0_12px_20px_rgb(0,0,0,0.5)] dark:shadow-[0_15px_25px_rgb(0,0,0,0.8)] dark:hover:shadow-[0_15px_25px_rgb(0,0,0,0.9)] py-2 z-20 border border-gray-300 dark:border-white/20  ${isUserMenuOpen ? 'animate-slide-top' : ' animate-slide-bottom'}`} >
                                        <div className="p-2 border-b border-gray-300 dark:border-white/20">
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
                                                    className="flex items-center gap-3 p-2 text-sm text-gray-900 dark:text-white/95 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    {/* <UserCircleIcon className="size-5" /> */}
                                                    <Avatar src={session.user?.image} alt={`${session.user.firstName} ${session.user.lastName}`.trim() || "Utilisateur"} className="size-5 text-xs ring-1 ring-gray-300 dark:ring-white/40" />
                                                    <span>Mon Espace Personnel</span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/my-events"
                                                    className="flex items-center gap-3 p-2 text-sm text-gray-900 dark:text-white/95 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
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
                                                        className="flex justify-start items-center bg-[url('/images/SplashPaintLeftSide.svg')] bg-no-repeat bg-cover bg-top p-2 pr-0 gap-3 text-base text-gray-950 dark:text-white  hover:bg-gray-100 dark:hover:bg-white/10 rounded-md border border-gray-300 dark:border-white/20 my-2"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <AdminLogo className='size-14! drop-shadow-2xl' />
                                                        <span className='drop-shadow-2xl'>Interface Administrateur</span>
                                                    </Link>
                                                </li>
                                            )}
                                            <li className="border-t border-gray-300 dark:border-white/20 mt-1 pt-1">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex items-center gap-3 w-full text-left p-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-900/20    cursor-pointer"
                                                >
                                                    <LogoutLogo />
                                                    <span>Se Déconnecter</span>
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
                                        onClick={() => setIsUserMenuOpen(false)}
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
           
                </nav>

                {/* ============ Mobile Navigation ==============*/}
                {isMobileMenuOpen && (
                    <div
                        className="min-[1025px]:hidden fixed inset-0 bg-black/50 z-1 h-screen backdrop-blur-xs"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className={`min-[1025px]:hidden fixed top-0 left-0 pl-4 pr-0 w-[85%] max-w-sm bg-[#FCFFF7] dark:bg-[#1f1f1f] z-10000 shadow-xl transition-transform transform duration-600 ease
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Menu burger/close button and eventrive logo */}
                    <div className="min-[1025px]:hidden absolute top-0 left-0 w-full bg-[#FCFFF7] dark:bg-[#1f1f1f] p-4 md:py-1 z-10001 flex items-center justify-between">
                        <IconButton 
                            className="p-1.5! rounded-md! bg-gray-100/50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 transition-all transform duration-600 ease-out cursor-pointer"
                            aria-label="Menu"
                            title={isMobileMenuOpen ? 'Fermer le Menu' : 'Ouvrir le Menu'} 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <XMarkIcon className="size-7 transition-all transform-3d duration-500 ease-in" /> : <Bars3CenterLeftIcon className="size-7 transition-all transform-3d duration-500 ease-in" />}
                        </IconButton>

                        <div className={`transition-all duration-500 ease-in-out max-lg:-ml-5 ${hasValue ? 'hidden opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <LogoButton onClick={() => router.push(`/`)} className="w-28 h-auto md:w-32 md:h-15" />
                        </div>
                        <div className='size-5'></div>
                    </div>

                    <OverlayScrollbarsComponent className="mb-2 h-screen pr-5 relative shadow-[hsl(var(--always-black)/5.1%)]">                        
                        {/* User info */}
                        <div className="mt-15 sm:mt-16 w-full flex items-center gap-3 py-3 border-b border-gray-300 dark:border-white/10">
                            {session ? (
                                <>
                                    {/* <UserLogo className="size-10! text-gray-400 dark:text-[#444]" /> */}
                                    <Avatar src={session.user?.image} alt={`${session.user.firstName} ${session.user.lastName}`.trim() || "Utilisateur"} className="size-10 sm:size-14 text-xl sm:text-3xl ring-1 ring-gray-300 dark:ring-white/40" />
                                    <div>
                                        <p className="text-base font-semibold">{session.user.name}</p>
                                        <p className="text-sm text-gray-400">{session.user.email}</p>
                                    </div>
                                </>
                            ) : (
                                null
                            )}
                        </div>
                    
                        {/* Navigation Links  */}
                        <ul className="flex flex-col gap-2 py-4 text-base mb-20">
                            <li>
                                <Link 
                                    href="/events" 
                                    className="flex items-center gap-4 rounded-md p-2 text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-white/10"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <IconHomeButton className="size-5 -translate-y-1" />
                                    <span>Accueil</span>
                                </Link>
                            </li>
                            {session ? (
                                <>
                                    <li>
                                        <Link
                                            href="/my-events"
                                            className="flex items-center gap-3 rounded-md p-2 text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-white/10"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <CalendarDateRangeIcon className="size-5" />
                                            <span>Mes Inscriptions</span>
                                        </Link>
                                    </li>                      
                                    {session.user.isAdmin && (
                                        <li className='flex items-center'>
                                            <Link
                                                href="/admin"
                                                className="w-full mx-auto flex justify-start items-center bg-[url('/images/SplashPaintLeftSide.svg')] bg-no-repeat bg-cover bg-top p-[4%] pr-0 gap-[7%] text-lg text-gray-950 dark:text-white  hover:bg-gray-100 dark:hover:bg-white/10 rounded-md border border-gray-300 dark:border-white/20 my-2"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <AdminLogo className='size-14! drop-shadow-2xl' />
                                                <span className='drop-shadow-2xl font-medium'>Interface <br/>Administrateur</span>
                                            </Link>
                                        </li>
                                    )}
                                    <li className="border-t border-gray-300 dark:border-white/20 mt-1 pt-1">
                                        <button
                                            onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                                            className="flex items-center gap-3 w-full text-left rounded-md p-2 text-red-600 dark:text-red-400 hover:bg-red-900/20 cursor-pointer"
                                        >
                                            <LogoutLogo />
                                            <span>Se Déconnecter</span>
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-md p-2 text-gray-900 dark:text-white/95 hover:bg-gray-100 dark:hover:bg-white/10">
                                        <FingerPrintIcon className="inline-block size-5" />
                                        <span>Se Connecter</span>
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </OverlayScrollbarsComponent>
                    
                </div>
            </header>
        </>
    );
}