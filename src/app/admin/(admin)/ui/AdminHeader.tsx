'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; 
import { useState, useEffect, useRef } from 'react';
import { useScrollContainer } from '@/app/providers';
import { useToast } from '@/app/ui/status/ToastProvider';
import { Bars3Icon, XMarkIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import LogoutLogo from '@/app/ui/logo/LogoutLogo';
import AdminLogo from '@/app/ui/logo/AdminLogo';
import IconButton from '@/app/ui/buttons/IconButton';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';

export default function AdminHeader() {
    const { data: session, status } = useSession(); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null); 
    const [scrollingUp, setScrollingUp] = useState(true); 
    const lastScrollY = useRef(0); 

    const router = useRouter();
    const pathname = usePathname()

    const { scrollElement } = useScrollContainer();

    const { addToast } = useToast();

    // For back button
    const isDashboardPage = pathname === '/admin' || pathname === '/admin/dashboard';
    const handleBack = () => {
        router.back();
    };

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

    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/' });
            addToast('Vous avez été déconnecté avec succès.', 'success');
        } catch {
            addToast('Erreur lors de la déconnexion.', 'error');
        }
    }; 

    return (
        <header
            ref={headerRef} 
            className={`fixed top-0 z-10000 w-full bg-gray-900 text-white shadow-lg transition-transform duration-500 py-4 px-[5%] flex flex-row justify-between items-center ${
                scrollingUp ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                    
                {/* Back Button if not in DashboardPage) */}
                {!isDashboardPage ? (
                    <IconButton 
                        onClick={handleBack} 
                        className="p-1! -ml-2 bg-transparent shadow-none hover:bg-gray-800! transition-all transform duration-600 ease-out cursor-pointer"
                        aria-label="Retour"
                        title="Retour"
                    >
                        <ChevronLeftIcon className="size-9 sm:size-10 flex-1" />
                    </IconButton>
                ) : (
                    null 
                )}

                {/* Admin logo */}
                <Link href="/admin" className="group" title="Administration">
                    <AdminLogo className="size-9 sm:size-12 animate-pulse group-hover:animate-none transition-all duration-300 group-hover:opacity-65 group-hover:scale-110" />
                </Link>
            </div>

            <nav className="flex flex-row gap-8 items-center">
                <Link href="/admin/dashboard" className={`text-lg transition-all duration-300 hover:opacity-65 whitespace-nowrap rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                    pathname === '/admin/dashboard' ? ' shadow-[inset_0px_2px_1px_white]' : '' }`}
                >
                    Tableau de bord
                </Link>
                <ul className={`mobile-menu flex items-start min-[1025px]:items-center gap-3 min-[1025px]:gap-8 text-lg font-medium max-[1025px]:flex-col max-[1025px]:absolute max-[1025px]:top-full max-[1025px]:left-0 max-[1025px]:w-full bg-gray-900 max-[1025px]:shadow-lg max-[1025px]:py-4 max-[1025px]:px-5 ${isMobileMenuOpen ? 'flex' : 'hidden'} min-[1025px]:flex rounded-b-2xl`}>
                    <li>
                        <Link href="/admin/manage-events" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all duration-300 hover:opacity-65 rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/admin/manage-events' ? ' shadow-[inset_0px_2px_1px_white]' : '' }`} onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Cog6ToothIcon className="inline-block w-5 h-5" />
                            <span>Événements</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/manage-registrations" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all duration-300 hover:opacity-65 rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/admin/manage-registrations' ? ' shadow-[inset_0px_2px_1px_white]' : '' }`} onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Cog6ToothIcon className="inline-block w-5 h-5" /> 
                            <span>Inscriptions</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/manage-users" className={`inline-flex whitespace-nowrap items-center gap-1 transition-all duration-300 hover:opacity-65 rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray] ${ 
                            pathname === '/admin/manage-users' ? ' shadow-[inset_0px_2px_1px_white]' : '' }`} onClick={() => setIsMobileMenuOpen(false)}
                        >
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
                                className="inline-flex whitespace-nowrap items-center gap-2 transition-all duration-300 hover:opacity-65 w-full text-left rounded-full p-2 hover:shadow-[inset_0px_2px_1px_gray]"
                                title="Se déconnecter"
                            >
                                <span>Hi {session.user.firstName} !</span>
                                <LogoutLogo/>
                            </button>
                        </li>
                    ) : null}
                </ul>
                <button
                    id="burgerBtn"
                    className="flex text-4xl min-[1025px]:hidden cursor-pointer"
                    data-title="Menu"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
                </button>
            </nav>
        </header>
    );
}
