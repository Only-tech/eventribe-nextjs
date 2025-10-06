'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react';
import Header from '@/app/ui/header'; 
import Footer from '@/app/ui/footer';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname()
  const hideLayout = pathname === '/register' || pathname === '/login' || pathname === '/legal-mentions'

  return (
    <> {/* Using a fragment because <html> and <body> are in the global root layout */}
      <div className="min-h-screen w-full flex flex-col text-[#333] dark:text-white/40  bg-cover bg-fixed bg-center font-sans bg-[url('/images/SplashPaintBreak.svg')] dark:bg-none">
        <Suspense fallback={<div className="text-center py-4">Chargement du menu...</div>}>
          {!hideLayout && <Header />}
        </Suspense>
        <main className="flex-grow w-full pt-20 pb-10 mx-auto my-6">
          {children}
        </main>
        {!hideLayout && <Footer />} 
      </div>
    </>
  );
}
