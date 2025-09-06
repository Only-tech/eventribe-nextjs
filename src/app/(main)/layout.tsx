import { Suspense } from 'react';
import Header from '@/app/ui/header'; 
import OnTopButton from '@/app/ui/on-top-button';
import Footer from '@/app/ui/footer';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <> {/* Using a fragment because <html> and <body> are in the global root layout */}
      <div className="main min-h-screen w-full flex flex-col text-[#333] dark:text-gray-300  bg-cover bg-fixed bg-center font-sans bg-[url('/images/SplashPaintOrange.svg')] dark:bg-none">
        <Suspense fallback={<div className="text-center py-4">Chargement du menu...</div>}>
          <Header />
        </Suspense>
        <main className="flex-grow max-w-[95%] w-full py-20 mx-auto mt-15">
          {children}
        </main>
        <OnTopButton /> 
        <Footer /> 
      </div>
    </>
  );
}
