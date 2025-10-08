import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import OnTopButton from '@/app/ui/buttons/OnTopButton';
import { Providers } from './providers';

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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
            {children}
          <OnTopButton /> 
        </Providers>
      </body>
    </html>
  );
}
