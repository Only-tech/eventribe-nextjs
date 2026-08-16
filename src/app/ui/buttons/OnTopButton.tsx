'use client';

import { useState, useEffect } from 'react';
import { useScrollContainer } from '@/app/providers';
import { ArrowUpIcon } from '@heroicons/react/16/solid';

export default function OnTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollElement } = useScrollContainer();

  useEffect(() => {
    const el = scrollElement;
    if (!el) return; 

    const updateScrollProgress = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const ratio = scrollHeight === 0 ? 0 : scrollTop / scrollHeight;
      setScrollProgress(ratio);
      setIsVisible(scrollTop > 300);
    };

    el.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); 

    return () => el.removeEventListener('scroll', updateScrollProgress);
  }, [scrollElement]);

  const scrollToTop = () => {
    scrollElement?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offset = 100 - scrollProgress * 100;

  // Tracé SVG du triangle avec angles arrondis pour la barre de progression
  const pathData = "M 98,20 Q 98,4 84,18 L 18,84 Q 4,98 20,98 L 90,98 Q 98,98 98,90 Z";

  return (
    <>
      {/* Masque SVG réutilisable pour rogner le bouton avec des coins adoucis */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="rounded-triangle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 1,0.18 Q 1,0.02 0.84,0.16 L 0.16,0.84 Q 0.02,1 0.18,1 L 0.90,1 Q 1,1 1,0.90 Z" />
          </clipPath>
        </defs>
      </svg>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-0 right-0 z-[1000] w-16 h-16 dark:bg-black/30 bg-black/60 hover:bg-black/90 cursor-pointer transition-all duration-300 ease-in-out group drop-shadow-[0px_3px_3px_rgba(0,0,0,0.6)] dark:shadow-[0px_5px_5px_rgba(0,0,0,0.4)] ${
          isVisible ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'
        }`}
        style={{ clipPath: 'url(#rounded-triangle-clip)' }}
        title="Retour en Haut"
      >
        {/* SVG pour le suivi de progression */}
        <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full">
          {/* Ligne de fond discrète */}
          <path
            d={pathData}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="3.5"
          />
          {/* Barre de progression animée au scroll */}
          <path
            d={pathData}
            fill="none"
            stroke="#E8E5D8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-200 dark:stroke-[#03527780] group-hover:stroke-white"
            pathLength="100"
            style={{ strokeDasharray: 100, strokeDashoffset: offset }}
          />
        </svg>

        {/* Flèche d'orientation */}
        <ArrowUpIcon className="absolute bottom-2.5 right-2.5 size-5 text-[#E8E5D8] group-hover:text-white dark:text-white/60 dark:group-hover:text-white transition-all duration-300 ease-in-out group-active:scale-90" />
      </button>
    </>
  );
}