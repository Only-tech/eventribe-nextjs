'use client'

import React from 'react';

type LoaderVariant = 'bar' | 'dots' | 'both';

interface LoaderProps {
    variant?: LoaderVariant;   // loader type
    progress?: number; 
    barColor?: string; 
    bgColor?: string; 
    className?: string;
}

export default function Loader({
    variant = 'both',
    progress = 0,
    barColor = 'bg-gray-900',
    bgColor = 'bg-gray-300',
}: LoaderProps) {
    return (
        <>
            {/* Progress bar */}
            {(variant === 'bar' || variant === 'both') && (
                <div 
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className={`${bgColor} w-64 h-2 rounded-full overflow-hidden mx-auto mb-6`}
                >
                    <div
                        className={`${barColor} h-full rounded-full transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%`, backgroundColor: undefined }}
                    />
                </div>
            )}

            {/* Dots */}
            {(variant === 'dots' || variant === 'both') && (
                <div  
                    role="status" 
                    aria-live="polite" 
                    className="flex justify-center items-center space-x-2"
                >
                    <div className="animate-dot-bounce-1 w-2 h-2 rounded-full bg-gray-900"></div>
                    <div className="animate-dot-bounce-2 w-2 h-2 rounded-full bg-gray-900"></div>
                    <div className="animate-dot-bounce-3 w-2 h-2 rounded-full bg-gray-900"></div>
                </div>
            )}
        </>
    );
}
