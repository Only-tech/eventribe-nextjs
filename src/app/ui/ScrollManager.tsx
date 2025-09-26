'use client';

import { useEffect } from 'react';

export function ScrollManager() {
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      document.body.classList.add('is-scrolling');

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 1500); 
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []); 

  return null; 
}