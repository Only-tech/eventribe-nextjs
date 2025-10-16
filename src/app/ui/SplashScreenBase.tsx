'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Loader from '@/app/ui/Loader'

interface ImagePosition {
    url: string;
    top: string;
    left: string;
    delay: string;
    duration: string;
}

interface SplashScreenBaseProps {
    imageUrls: string[];
    title: string;
    redirectTo: string;
    backgroundClass?: string;
}

export default function SplashScreenBase({ imageUrls, title, redirectTo, backgroundClass }: SplashScreenBaseProps) {
    const router = useRouter();
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [images, setImages] = useState<ImagePosition[]>([]);
    const [progress, setProgress] = useState(0);
    const [displayedH1, setDisplayedH1] = useState('');

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
        const intervalTime = 20;
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
            router.push(redirectTo);
        }, 4000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(fadeOutTimer);
            clearTimeout(redirectTimer);
        };
    }, [router, imageUrls, redirectTo]);

    // Text H1 typeWriter
    useEffect(() => {
        setDisplayedH1("");
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedH1(title.slice(0, index + 1));
            index++;
            if (index === title.length) {
                clearInterval(interval);
            }
        }, 50); 
        return () => clearInterval(interval);
    }, [title]);

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
                                className="rounded-2xl sm:rounded-3xl border-4 ring ring-gray-300 shadow-xl"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 w-xs min-[400px]:w-[400px] sm:w-xl md:w-2xl lg:w-210 drop-shadow-[3px_15px_5px_rgba(0,0,0,0.65)]">
            <div className="bg-white/25 p-2 rounded-3xl min-[500px]:[clip-path:var(--clip-path-squircle-60)] ">
            <div className={`min-h-60 flex flex-col justify-center items-center ${ backgroundClass ?? "[background-color:#FCFFF7]/85 bg-[url('/images/SplashPaintBreak.svg')]" } bg-contain bg-fixed p-6 lg:p-12 rounded-2xl min-[500px]:[clip-path:var(--clip-path-squircle-60)]`}>
                <h1 className="text-center text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg mb-10">
                    {displayedH1}
                    <span className="animate-pulse text-3xl lg:text-5xl font-light">|</span>
                </h1>
                <Loader variant="both" progress={progress} Light />

            </div>
            </div>
            </div>
        </div>
    );
}