'use client'; 

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, XCircleIcon,  } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FingerPrintIcon, CalendarDateRangeIcon, UserCircleIcon} from '@heroicons/react/24/solid';
import LogoButton from '@/app/ui/buttons/LogoButton';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';

export default function Header() {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null); 
    const [scrollingUp, setScrollingUp] = useState(true); 
    const lastScrollY = useRef(0); 

    const pathname = usePathname();

    const router = useRouter();
    const searchParams = useSearchParams(); 
    const initialSearchQuery = searchParams.get('query') || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/events' }); 
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
    }, []); // runs once on mount

    // Update search query state if URL search param changes 
    useEffect(() => {
        setSearchQuery(searchParams.get('query') || ''); 
    }, [searchParams]);

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
        router.push(`/events?query=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileMenuOpen(false);
        } else {
        router.push('/events'); 
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.push('/events'); 
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            ref={headerRef} // Attach the ref to the header
            className={`fixed top-0 z-10000 w-full bg-[#f5f5dc] dark:bg-[#222222] text-gray-800 dark:text-white/70 shadow-lg transition-all ease-in-out duration-800 py-1 px-3 min-[425px]:px-[5%] flex flex-row justify-between items-center ${
                scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            >
             <LogoButton onClick={() => router.push(`/`)} className="w-26 h-18"/>

            {/*search Bar */}
            <div className="relative flex-grow mx-4 min-[425px]:mx-6 max-xl:max-w-sm max-w-lg">
                <form onSubmit={handleSearchSubmit} className="group flex items-center">
                <div className="group w-full flex flex-row rounded-full border-[0.1px] text-gray-800 dark:text-white/70 border-gray-300 dark:border-white/20 transition-all ease-in-out duration-600 hover:border-[#ff952aff] focus-within:border-[#ff952aff] overflow-hidden">
                    <input
                    type="text"
                    name="search"
                    placeholder="Rechercher un événement..."
                    className={`w-full ${searchQuery ? 'max-[425px]:pl-3 max-[425px]:pr-0' : ''} px-4 py-2 border-none border-transparent outline-none text-sm bg-transparent transition-all ease-in-out duration-600`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-white/70 transition-all ease-in-out duration-600 cursor-pointer"
                        title="Effacer la recherche"
                    >
                        <XCircleIcon className="w-5 h-5 animate-pulse" /> 
                    </button>
                    )}
                </div>
                <button type="submit" className="ml-2 p-2 rounded-full bg-[#ff952aff] text-white hover:bg-[#111827] dark:hover:bg-gray-400 transition-all ease-in-out duration-600  cursor-pointer" title="Rechercher">
                    <MagnifyingGlassIcon className="w-5 h-5" /> 
                </button>
                </form>
            </div>

            <nav className="flex flex-row gap-6 items-center">
                <ul className={`mobile-menu flex items-start min-[1025px]:items-center gap-4 min-[1025px]:gap-6 text-base xl:text-lg font-medium max-[1025px]:flex-col max-[1025px]:absolute max-[1025px]:top-full max-[1025px]:left-0 max-[1025px]:w-full bg-[#f5f5dc] dark:bg-[#222222] max-[1025px]:shadow-lg max-[1025px]:py-4 max-[1025px]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} min-[1025px]:flex rounded-b-2xl`}>
                <li>
                    <Link href="/events" 
                        className={`inline-flex whitespace-nowrap items-center gap-3 transition-all ease-in-out duration-600  hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group ${ 
                        pathname === '/events' ? ' shadow-[inset_0px_2px_1px_#ff952aff]' : '' }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <IconHomeButton className="size-5 -translate-y-1" />
                        <span>Accueil</span>
                    </Link>
                </li>
                {status === 'loading' ? (
                    <li>Chargement...</li>
                ) : session ? (
                    <>
                    <li>
                        <Link href="/my-events" 
                            className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600  hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/my-events' ? ' shadow-[inset_0px_2px_1px_#ff952aff]' : '' }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <CalendarDateRangeIcon className="inline-block size-5 -translate-y-0.5" />
                            <span>Mes Inscriptions</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/account" 
                            className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600  hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/account' ? ' shadow-[inset_0px_2px_1px_#ff952aff]' : '' }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <UserCircleIcon className="inline-block size-5" />
                            <span>Compte</span>
                        </Link>
                    </li>
                    {session.user.isAdmin && (
                        <li>
                        <Link href="/admin" className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] group" 
                            title="Aller à l'administration"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <AdminLogo className="size-6 animate-bounce group-hover:animate-none"/>
                            <span>Admin</span>
                        </Link>
                        </li>
                    )}
                    <li>
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center gap-2 whitespace-nowrap transition-all ease-in-out duration-600 hover:text-[#ff952aff] w-full text-left cursor-pointer rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] "
                            title="Se déconnecter"
                        >
                            <span>Hi {session.user.firstName} !</span>
                            <LogoutLogo/>
                        </button>
                    </li>
                    </>
                ) : (
                    <>
                    <li>
                        <Link href="/login" 
                            className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600  hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/login' ? ' shadow-[inset_0px_2px_1px_#ff952aff]' : '' }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FingerPrintIcon  className="inline-block size-5"/>
                            <span>Se Connecter</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/register" 
                            className={`inline-flex whitespace-nowrap items-center gap-1 transition-all ease-in-out duration-600  hover:text-[#ff952aff] rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/register' ? ' shadow-[inset_0px_2px_1px_#ff952aff]' : '' }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FingerPrintIcon  className="inline-block size-5"/>
                            <span>S&apos;Inscrire</span>
                        </Link>
                    </li>
                    </>
                )}
                </ul>
                <button
                id="burgerBtn"
                className="flex min-[1025px]:hidden cursor-pointer"
                title="Menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
                </button>
            </nav>
        </header>
    );
}