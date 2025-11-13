'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/app/ui/header'
import Footer from '@/app/ui/footer'
import Loader from '@/app/ui/animation/Loader'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setShowOverlay(true)
        setLoading(true)
        setProgress(0)

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 95 ? prev + 5 : prev))
        }, 100)

        // End progress
        const timer = setTimeout(() => {
            clearInterval(interval)
            setProgress(100)
            setLoading(false)
            setTimeout(() => setShowOverlay(false), 300)
        }, 800)

        return () => {
            clearInterval(interval)
            clearTimeout(timer)
        }
    }, [pathname])

    const hideLayout = pathname === '/register' || pathname === '/login' || pathname === '/password' || pathname === '/legal-mentions'

    return (
        <div className="min-h-screen w-full flex flex-col text-[#333] dark:text-white/85 bg-cover bg-fixed bg-center font-sans bg-[url('/images/SplashPaintBreak.svg')] dark:bg-none">
            {!hideLayout && <Header />}

            {showOverlay && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-[#fcfff7] dark:bg-[#222222] transition-opacity duration-300 ${
                        loading ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <Loader variant="both" progress={progress} />
                </div>
            )}

            <main className="flex-grow w-full pt-20 pb-10 mx-auto my-6">
                {children}
            </main>

            {!hideLayout && <Footer />}
        </div>
    )
}