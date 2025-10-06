'use client';

import React from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

export function CustomScrollbarProvider({ children }: { children: React.ReactNode }) {
    return (
        <OverlayScrollbarsComponent
            options={{
                scrollbars: {
                    autoHide: 'scroll', // 'move', 'leave', 'never'
                    autoHideDelay: 500,
                },
            }}
            
            defer // Important for Next.js and SSR compatibility
            style={{ height: '100vh' }}
        >
        {children}
        </OverlayScrollbarsComponent>
    );
}