import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ScrollManager } from '@/app/ui/ScrollManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'eventribe - Événement à venir',
  description: 'Gestion d\'événements et inscriptions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers> {/* The SessionProvider cover entire apps */}
          {children}
        </Providers>
        <ScrollManager />
      </body>
    </html>
  );
}
