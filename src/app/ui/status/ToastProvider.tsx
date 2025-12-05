'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    addToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        if (!message || !message.trim()) return; // Not display if empty message
        // If there are multiple notifications at the same time, it creates different IDs so that they are all displayed
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id)); // "t" comes from the type Toast 
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toasts Display point */}
            <div className="fixed max-sm:bottom-20 bottom-6 right-2 sm:right-6 flex flex-col gap-3 ml-2 z-1000000">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border
                            animate-slide-in-out
                            ${toast.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                            ${toast.type === 'error' ? 'bg-red-100 text-red-700 border-red-300' : ''}
                            ${toast.type === 'info' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                        `}
                    >
                        {toast.type === 'success' && <span className='h-10 w-10'><CheckCircleIcon className="!size-10" /></span>}
                        {toast.type === 'error' && <span className='h-10 w-10'><ExclamationCircleIcon className="!size-10" /></span>}
                        {toast.type === 'info' && <span className='h-10 w-10'><InformationCircleIcon className="!size-10" /></span>}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
