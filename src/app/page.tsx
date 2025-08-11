'use client';

// homepage component

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function App() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Redirects to main page
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500); 

    const redirectTimer = setTimeout(() => {
      router.push('/id');
    }, 2000); 

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-[#f5f5dc] transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Bienvenue sur eventribe, votre meilleur plan événements
        </h1>
        <p className="text-xl md:text-2xl text-gray-700">
          Chargement des événements...
        </p>
      </div>
    </div>
  );
}
