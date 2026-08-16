import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '@/app/globals.css';
import OnTopButton from '@/app/ui/buttons/OnTopButton';
import { Providers } from '@/app/providers';
import { cookies } from 'next/headers';
import CookieBanner from '@/app/ui/CookieBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'eventribe',
    description: 'evenements à venir. Gestion d\'événements et inscriptions, avec eventribe, l\événementiel au plus près de vous !',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies();
  const consent = cookieStore.get('cookie-consent')?.value;
  
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
                    {!consent && <CookieBanner />}
                </Providers>

                {/* Tawk.to Script pour chat */}
                <Script id="tawk-to" strategy="lazyOnload">
                    {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/6a818a66dcdbf81d4fafbbf6/1k05098d6';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                    })();
                    `}
                </Script>
            </body>
        </html>
    );
}