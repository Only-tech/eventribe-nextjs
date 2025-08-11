'use client';

import { SessionProvider } from 'next-auth/react';
import React, { useEffect } from 'react';
import AOS from 'aos'; 

export function Providers({ children }: { children: React.ReactNode }) {
useEffect(() => {
    AOS.init();
    AOS.refresh();
}); 

return (
    <SessionProvider>
    {children}
    </SessionProvider>
);
}
