'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/16/solid';

interface CarouselImage {
  url: string;
  alt: string;
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
  }, []);

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
      className="relative w-full overflow-hidden py-10"
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
                key={index}
                ref={index === numClones ? cardRef : null}
                className={`mx-4 w-72 h-60 xl:w-96 xl:h-72 flex-shrink-0 rounded-4xl bg-white/80 shadow-inner transition-transform duration-500 ${
                  isActive ? 'scale-105 z-10 shadow-[0_0_16px_rgba(7,2,52,0.7)]' : 'scale-90 opacity-70'
                }`}
              >
                <div
                  className="relative w-full h-full rounded-4xl overflow-hidden group"
                  style={{ transform: parallaxOffset, transition: 'transform 0.5s ease' }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-4xl group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-black opacity-30 rounded-4xl"></div>

                  {(isMobile || (isActive && isHovered)) && (
                    <button
                      onClick={() => router.push(`/event/${image.eventId}`)}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base font-medium transition-colors group border-[0.5px] text-shadow-white hover:text-gray-800 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-black/65 hover:bg-[#E8E5D8] hover:border-transparent"
                    >
                      <EyeIcon className="w-6 h-6 mr-2" />
                      <span className="whitespace-nowrap">Voir l&apos;événement</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/90"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/90"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
