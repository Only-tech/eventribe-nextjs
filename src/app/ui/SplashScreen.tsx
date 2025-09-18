'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImagePosition {
    url: string;
    top: string;
    left: string;
    delay: string;
    duration: string;
}

interface SplashScreenProps {
    imageUrls: string[];
}

export default function SplashScreen({ imageUrls }: SplashScreenProps) {
    const router = useRouter();
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [images, setImages] = useState<ImagePosition[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Create images positions and random animations
        const loadedImages = imageUrls.map((url) => {
            const top = `${Math.random() * 80}%`;
            const left = `${Math.random() * 80}%`;
            const delay = `${Math.random() * 5}s`;
            const duration = `${10 + Math.random() * 15}s`;
            return { url, top, left, delay, duration };
        });
        setImages(loadedImages);

        // Progress bar animation
        const totalDuration = 4000;
        const intervalTime = 10;
        const increment = (100 / (totalDuration / intervalTime));

        const progressInterval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                clearInterval(progressInterval);
                return 100;
                }
                return prevProgress + increment;
            });
        }, intervalTime);

        // Start redirection
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 4000);

        const redirectTimer = setTimeout(() => {
            router.push('/events');
        }, 4000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(fadeOutTimer);
            clearTimeout(redirectTimer);
        };
    }, [router, imageUrls]);

    return (
        <div
            className={`relative p-2 flex min-h-screen items-center justify-center transition-opacity duration-500 ease-in-out overflow-hidden ${
                isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className="absolute inset-0 z-0">
                <div className="relative w-full h-full">
                    
                    {images.map((img, index) => (
                        <div
                        key={index}
                        className="absolute animate-float"
                        style={{
                            top: img.top,
                            left: img.left,
                            animationDelay: img.delay,
                            animationDuration: img.duration,
                        }}
                        >
                            <Image
                                src={img.url}
                                alt="Événement"
                                width={200}
                                height={200}
                                className="rounded-3xl border-4 ring ring-gray-300 shadow-xl"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 bg-white/65 p-2 shadow-2xl overflow-hidden rounded-4xl" style={{ clipPath: "var(--clip-path-squircle-60)" }}>
            <div className=" relative text-center bg-white/45 bg-contain bg-fixed backdrop-blur-md p-6 lg:p-12" style={{ backgroundImage: "url('/images/SplashPaintBreak.svg')", clipPath: "var(--clip-path-squircle-60)" }}>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg mb-10">
                    Bienvenue sur eventribe
                </h1>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mb-6">
                    <div
                        className="h-full bg-gray-900 rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-center items-center space-x-2">
                    <div className="animate-dot-bounce-1 w-2 h-2 rounded-full bg-gray-900"></div>
                    <div className="animate-dot-bounce-2 w-2 h-2 rounded-full bg-gray-900"></div>
                    <div className="animate-dot-bounce-3 w-2 h-2 rounded-full bg-gray-900"></div>
                </div>
            </div>
            </div>
        </div>
    );
}