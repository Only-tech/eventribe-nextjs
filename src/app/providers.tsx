'use client';

import React, { createContext, useContext, useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import type { OverlayScrollbars } from 'overlayscrollbars';
import AOS from 'aos';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import 'aos/dist/aos.css';

type ScrollContextType = {
  scrollElement: HTMLElement | null;
};
const ScrollContext = createContext<ScrollContextType>({
  scrollElement: null,
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

  useEffect(() => {
    AOS.init({ duration: 700, once: false });
  }, []);

  const debouncedAosRefresh = useMemo(() => debounce(() => AOS.refresh(), 50), []);

  const onScrollInitialized = useCallback((instance: OverlayScrollbars) => {
    if (instance) {
      const el = instance.elements().scrollOffsetElement;
      
      console.log('[Providers] Scrollbar initialisée. Instance et élément trouvés:', { instance, el });

      setScrollElement(el);
      instance.elements().host.focus();
    } else {
      console.error('[Providers] "initialized" event fired, MAIS l\'instance est null/undefined.');
    }
  }, []); 

  const contextValue = useMemo<ScrollContextType>(
    () => ({
      scrollElement,
    }),
    [scrollElement]
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
            options={{
              scrollbars: { autoHide: 'scroll', autoHideDelay: 500 },
            }}
            events={{ 
              scroll: debouncedAosRefresh,
              initialized: onScrollInitialized, 
            }}
            defer
            tabIndex={0}
            style={{ height: '100vh', width: '100vw' }}
          >
            {children}
          </OverlayScrollbarsComponent>
        </ScrollContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}