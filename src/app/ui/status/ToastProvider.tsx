// 'use client';

// import { createContext, useContext, useState, ReactNode } from 'react';
// import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

// type ToastType = 'success' | 'error' | 'info';

// type Toast = {
//     id: string;
//     message: string;
//     type: ToastType;
// };

// type ToastContextType = {
//     addToast: (message: string, type?: ToastType) => void;
// };

// const ToastContext = createContext<ToastContextType | undefined>(undefined);

// export function ToastProvider({ children }: { children: ReactNode }) {
//     const [toasts, setToasts] = useState<Toast[]>([]);

//     const addToast = (message: string, type: ToastType = 'info') => {
//         if (!message || !message.trim()) return; // Not display if empty message
//         // If there are multiple notifications at the same time, it creates different IDs so that they are all displayed
//         const id = crypto.randomUUID();
//         setToasts((prev) => [...prev, { id, message, type }]);

//         setTimeout(() => {
//             setToasts((prev) => prev.filter((t) => t.id !== id)); // "t" comes from the type Toast 
//         }, 5000);
//     };

//     return (
//         <ToastContext.Provider value={{ addToast }}>
//             {children}
//             {/* Toasts Display point */}
//             <div className="fixed max-sm:bottom-20 bottom-6 right-2 sm:right-6 flex flex-col gap-3 ml-2 z-1000000">
//                 {toasts.map((toast) => (
//                     <div
//                         key={toast.id}
//                         className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border
//                             animate-slide-in-out
//                             ${toast.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : ''}
//                             ${toast.type === 'error' ? 'bg-red-100 text-red-700 border-red-300' : ''}
//                             ${toast.type === 'info' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
//                         `}
//                     >
//                         {toast.type === 'success' && <span className='h-10 w-10'><CheckCircleIcon className="size-10!" /></span>}
//                         {toast.type === 'error' && <span className='h-10 w-10'><ExclamationCircleIcon className="size-10!" /></span>}
//                         {toast.type === 'info' && <span className='h-10 w-10'><InformationCircleIcon className="size-10!" /></span>}
//                         <span>{toast.message}</span>
//                     </div>
//                 ))}
//             </div>
//         </ToastContext.Provider>
//     );
// }

// export function useToast() {
//     const context = useContext(ToastContext);
//     if (!context) throw new Error('useToast must be used within a ToastProvider');
//     return context;
// }
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type ToastContextType = {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Sub-component to manage each individaul Toast  ---
const ToastItem = ({ 
    toast, 
    onRemove 
}: { 
    toast: Toast; 
    onRemove: (id: string) => void; 
}) => {
    const [isPaused, setIsPaused] = useState(false);
    const duration = 5000;

    // Timer and automatic close
    useEffect(() => {
        if (isPaused) return;

        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, onRemove, isPaused]);

    // Classes regarding the type
    const baseClasses = {
        success: 'bg-green-100 text-green-700 border-green-300',
        error: 'bg-red-100 text-red-700 border-red-300',
        info: 'bg-blue-100 text-blue-700 border-blue-300',
    };

    // Progress Bar Colors
    const progressColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-lg shadow-lg flex items-start gap-3 mx-2 border p-4 pr-10
                animate-slide-in-out transition-all duration-300
                ${baseClasses[toast.type]}
            `}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Icons */}
            <div className="shrink-0 my-auto">
                {toast.type === 'success' && <CheckCircleIcon className="size-10" />}
                {toast.type === 'error' && <ExclamationCircleIcon className="size-10" />}
                {toast.type === 'info' && <InformationCircleIcon className="size-10" />}
            </div>

            {/* Message */}
            <div className="text-sm font-medium break-words my-auto">
                {toast.message}
            </div>

            {/* Close button */}
            <button
                onClick={() => onRemove(toast.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
                aria-label="Fermer la notification"
            >
                <XMarkIcon className="size-4" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 w-full">
                <div
                    className={`h-full ${progressColors[toast.type]}`}
                    style={{
                        width: '100%',
                        animation: `progress ${duration}ms linear forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                />
            </div>

            {/* Keyframe animation progress bar */}
            <style jsx>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

// --- Provider ---
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        if (!message || !message.trim()) return; // Not display if empty message
        // If there are multiple notifications at the same time, it creates different IDs so that they are all displayed
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {/* Display Toasts */}
            <div className="fixed max-sm:bottom-20 bottom-6 right-0 max-sm:mx-auto! sm:right-6 flex flex-col gap-3 mx-2 z-100000 w-full max-w-lg">
                {toasts.map((toast) => (
                    <ToastItem 
                        key={toast.id} 
                        toast={toast} 
                        onRemove={removeToast} 
                    />
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