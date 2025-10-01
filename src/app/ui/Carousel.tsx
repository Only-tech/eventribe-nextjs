'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/16/solid';
import ActionButton from '@/app/ui/buttons/ActionButton';

interface CarouselImage {
  url: string;
  alt: string;
  title: string;
  eventId: number;
}

interface CarouselProps {
  imageUrls: CarouselImage[];
}

export default function Carousel({ imageUrls }: CarouselProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(3);
  const [clonedImages, setClonedImages] = useState<CarouselImage[]>([]);
  const numClones = 3;

  const touchStartX = useRef<number | null>(null);

  // Clone images for infinite loop
  useEffect(() => {
    const clones = [
      ...imageUrls.slice(-numClones),
      ...imageUrls,
      ...imageUrls.slice(0, numClones),
    ];
    setClonedImages(clones);
  }, [imageUrls]);

  // Resize and responsiveness
  useEffect(() => {
    const updateSizes = () => {
      if (cardRef.current && trackRef.current) {
        const style = getComputedStyle(cardRef.current);
        const margin = parseFloat(style.marginRight) + parseFloat(style.marginLeft);
        setCardWidth(cardRef.current.offsetWidth + margin);
        setContainerWidth(trackRef.current.offsetWidth);
      }
      setIsMobile(window.innerWidth < 1024);
    };
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [currentIndex]);

  // Auto-scroll
  useEffect(() => {
    if (isHovered || clonedImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, clonedImages.length]);

  // Swipe gesture
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 50) {
        setCurrentIndex((prev) => prev + (deltaX < 0 ? 1 : -1));
      }
      touchStartX.current = null;
    };

    track.addEventListener('touchstart', handleTouchStart);
    track.addEventListener('touchend', handleTouchEnd);
    return () => {
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Dynamic centering
  const getTransform = useCallback(() => {
    const offset = -currentIndex * cardWidth;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    return `translateX(${offset + centerOffset}px)`;
  }, [currentIndex, cardWidth, containerWidth]);

  // Infinite loop logic
  useEffect(() => {
    if (!trackRef.current) return;

    const handleTransitionEnd = () => {
      if (currentIndex >= imageUrls.length + numClones) {
        setCurrentIndex(numClones);
        trackRef.current!.style.transition = 'none';
        trackRef.current!.style.transform = getTransform();
        setTimeout(() => {
          trackRef.current!.style.transition = 'transform 0.7s ease-in-out';
        }, 50);
      } else if (currentIndex < numClones) {
        setCurrentIndex(imageUrls.length + currentIndex);
        trackRef.current!.style.transition = 'none';
        trackRef.current!.style.transform = getTransform();
        setTimeout(() => {
          trackRef.current!.style.transition = 'transform 0.7s ease-in-out';
        }, 50);
      }
    };

    const track = trackRef.current;
    track.addEventListener('transitionend', handleTransitionEnd);
    return () => track.removeEventListener('transitionend', handleTransitionEnd);
  }, [currentIndex, imageUrls.length, getTransform]);

  return (
    <div
      className="relative w-full overflow-hidden pt-10 pb-25"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: getTransform() }}
        >
          {clonedImages.map((image, index) => {
            const isActive = index === currentIndex;
            const parallaxOffset = isActive ? 'translateY(0px)' : 'translateY(20px)';
            return (
              <div
                className={`w-78 sm:w-82 h-55 xl:w-96 xl:h-65 flex-shrink-0 bg-white/80 shadow-inner rounded-xl  transform transition-transform duration-700 hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)] ${
                  isActive ? 'scale-105 z-10 shadow-[0_0_16px_rgba(7,2,52,0.7)] border border-white/70 -translate-y-4' : 'translate-y-0 scale-90 opacity-70'
                }`}
                key={index}
                ref={index === numClones ? cardRef : null}
              >
                <div
                  onClick={() => router.push(`/event/${image.eventId}`)}
                  className="relative w-full h-full overflow-hidden rounded-xl group cursor-pointer"
                  style={{ transform: parallaxOffset, transition: 'transform 0.5s ease' }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    title={image.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className={`absolute inset-0 bg-black opacity-30 ${ isActive ? 'hidden' : ''}`}></div>

                  {(isMobile || (isActive && isHovered)) && (
                    <ActionButton variant="secondary" onClick={() => router.push(`/event/${image.eventId}`)} className="absolute pl-2 pr-4 py-2 bottom-4 left-1/2 transform -translate-x-1/2 h-9 text-sm text-white/70 group-hover:text-gray-800 border-white/40 bg-black/65 group-hover:bg-[#E8E5D8]">
                      <EyeIcon className="w-6 h-6 mr-2" />
                      <span className="whitespace-nowrap">Voir l&apos;événement</span>
                    </ActionButton>
                  )}
                </div>
                <div className="w-full flex justify-center ">
                  <p
                    className={`absolute w-[90%] text-center transform transition-all duration-1500 ease-out p-2 rounded-full text-base font-medium text-gray-800 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#E8E5D8] dark:bg-black/65 dark:text-white/85 ${
                    isActive ? "opacity-100 translate-y-4 scale-100" : "opacity-0 -translate-y-12 scale-50 pointer-events-none" }`}
                  >
                    {image.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/90 cursor-pointer"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/90 cursor-pointer"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
