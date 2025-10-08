'use client';

import { useState, useEffect } from 'react';
import { useScrollContainer } from '@/app/providers';

export default function OnTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollElement } = useScrollContainer();

console.log('[OnTopButton] Reçu scrollElement:', scrollElement);
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

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - scrollProgress);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-2 right-2 z-[1001] flex size-11 dark:bg-black/20 bg-black/50 hover:bg-black/90 rounded-full overflow-hidden cursor-pointer justify-center items-center transition-opacity duration-300 ease-in-out group ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      title="Retour en Haut"
    >
      <svg
        viewBox="0 0 60 60"
        className="absolute top-0 left-0 size-11"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      >
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#E8E5D8"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="transition-colors duration-300 dark:[stroke:#03527780] group-hover:stroke-[#fff]"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <svg
        className="relative size-5 animate-[moveButton_3s_infinite] transition-all duration-300 ease-in-out group-hover:animate-none group-active:scale-90"
        viewBox="34 -7.5 80 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="group-hover:fill-[#fff] dark:[fill:#03527780]"
          d="M 38 24 L 38 36 L 74 15 L 110 36 L 110 24 L 74 2 L 38 24 Z"
          fill="#E8E5D8"
        />
        <path
          className="group-hover:fill-[#E8E5D8] dark:[fill:white]/55"
          d="M 46 53 L 46 63 L 74 45 L 102 63 L 102 53 L 74 33 L 46 53 Z"
          fill="#fff"
        />
      </svg>
    </button>
  );
}