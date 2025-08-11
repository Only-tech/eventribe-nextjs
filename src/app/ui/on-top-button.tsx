'use client';

import { useState, useEffect } from 'react';

export default function OnTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const updateScrollProgress = () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const ratio = scrollHeight === 0 ? 0 : scrollTop / scrollHeight;
        setScrollProgress(ratio); 

        if (scrollTop > 300) {
        setIsVisible(true);
        } else {
        setIsVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', updateScrollProgress); 
        updateScrollProgress(); 

        return () => {
        window.removeEventListener('scroll', updateScrollProgress);
        };
    }, []); 

    const scrollToTop = () => {
        window.scrollTo({
        top: 0,
        behavior: 'smooth', 
        });
    };

    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    // The offset controls the portion of the circle that is drawn (progression).
    const offset = circumference * (1 - scrollProgress);

    return (
        // Progression button container.
        <div
        id="scrollProgressWrapper"
        className={`fixed bottom-8 right-8 z-1001 flex w-12 h-12 bg-[rgba(255,255,255,0.5)] hover:bg-white rounded-full overflow-hidden cursor-pointer justify-center items-center transition-opacity duration-300 ease-in-out active:scale-90 group ${
            isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        title="Aller en Haut"
        >
        {/* Progression circle SVG */}
        <svg
            id="scrollProgressSvg"
            viewBox="0 0 60 60"
            className="absolute top-0 left-0 w-12 h-12"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} 
        >
            <circle
            id="progressActive"
            cx="30"
            cy="30"
            r={radius}
            stroke="#ff952aff"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className="transition-colors duration-300 group-hover:stroke-[#111827]"
            style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset, 
            }}
            ></circle>
        </svg>
        <button
            onClick={scrollToTop} 
            id="scrollTopBtn"
            className="relative w-12 h-12 animate-[moveButton_3s_infinite] transition-all duration-300 ease-in-out group-hover:animate-none rounded-full cursor-pointer flex justify-center items-center group"
            aria-label="Retour en Haut" 
        >
            {/* Arrow SVG */}
            <svg className=" w-6 h-6" viewBox="34 -7.5 80 80" xmlns="http://www.w3.org/2000/svg">
                <path className="group-hover:fill-[#111827]" d="M 38 24 L 38 36 L 74 15 L 110 36 L 110 24 L 74 2 L 38 24 Z" fill="#ff952aff" />
                <path className="group-hover:fill-[#ff952aff]" d="M 46 53 L 46 63 L 74 45 L 102 63 L 102 53 L 74 33 L 46 53 Z" fill="#111827" />
            </svg>
        </button>
        </div>
    );
}
