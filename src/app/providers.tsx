'use client';

import React, { createContext, useContext, useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import type { OverlayScrollbars } from 'overlayscrollbars';
import { ToastProvider } from '@/app/ui/status/ToastProvider';
import AOS from 'aos';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import 'aos/dist/aos.css';

type ScrollContextType = {
    scrollElement: HTMLElement | null;
    hostElement: HTMLElement | null;
};
const ScrollContext = createContext<ScrollContextType>({
    scrollElement: null,
    hostElement: null,
});
export const useScrollContainer = () => useContext(ScrollContext);

function debounce<F extends (...args: unknown[]) => void>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
}

export function Providers({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<OverlayScrollbarsComponentRef>(null);
    const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
    const [hostElement, setHostElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        AOS.init({ duration: 700, once: false });
    }, []);

    const debouncedAosRefresh = useMemo(() => debounce(() => AOS.refresh(), 50), []);

    const onScrollInitialized = useCallback((instance: OverlayScrollbars) => {
        if (!instance) return;
        const elements = instance.elements();
        setScrollElement(elements.scrollOffsetElement);
        setHostElement(elements.host);
    }, []);

    // Global keyboard routing: even if the focus in otherway
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!scrollRef.current) return;
            const osInstance = scrollRef.current.osInstance();
            if (!osInstance) return;

            const viewport = osInstance.elements().viewport;
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];

            if (keys.includes(e.key)) {
                // Don't interfer if user tying in input/textarea/select
                const target = e.target as HTMLElement;
                const isFormField =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable;

                if (isFormField) return;

                e.preventDefault();
                const step = 80;

                switch (e.key) {
                case 'ArrowUp':
                    viewport.scrollBy({ top: -step });
                    break;
                case 'ArrowDown':
                    viewport.scrollBy({ top: step });
                    break;
                case 'PageUp':
                    viewport.scrollBy({ top: -(viewport.clientHeight - 40), behavior: 'smooth' });
                    break;
                case 'PageDown':
                    viewport.scrollBy({ top: viewport.clientHeight - 40, behavior: 'smooth' });
                    break;
                case 'Home':
                    viewport.scrollTo({ top: 0, behavior: 'smooth' });
                    break;
                case 'End':
                    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
                    break;
                case ' ':
                    viewport.scrollBy({ top: viewport.clientHeight * 0.9, behavior: 'smooth' });
                    break;
                }
            }
        };

        window.addEventListener('keydown', handler, { passive: false });
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const contextValue = useMemo<ScrollContextType>(
        () => ({ scrollElement, hostElement }),
        [scrollElement, hostElement]
    );

    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="default"
                enableSystem={false}
                themes={['default', 'dark']}
                disableTransitionOnChange
            >
                <ScrollContext.Provider value={contextValue}>
                    <OverlayScrollbarsComponent
                        ref={scrollRef}
                        options={{ scrollbars: { autoHide: 'scroll', autoHideDelay: 500 } }}
                        events={{ scroll: debouncedAosRefresh, initialized: onScrollInitialized }}
                        tabIndex={0}
                        style={{ height: '100vh', width: '100vw' }}
                    >
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </OverlayScrollbarsComponent>
                </ScrollContext.Provider>
            </ThemeProvider>
        </SessionProvider>
    );
}
