"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Image from 'next/image';
import '@/app/globals.css'; 


type TimeoutId = ReturnType<typeof setInterval> | null;

const AUTOPLAY_DURATION = 6000;

const slidesData = [
  {
    id: 1,
    src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/bannerImage/adore_soire.png",
    alt: "Pour les habitués des soirées festives",
    title: "Pour les habitués des soirées festives",
    credit: "Wendy Wei, Pexels",
    desc: "Trouvez l'endroit parfait pour faire la fête et danser jusqu'au bout de la nuit !"
  },
  {
    id: 2,
    src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/bannerImage/aime_apprendre.png",
    alt: "Pour les curieux qui aiment apprendre",
    title: "Pour les curieux qui aiment apprendre",
    credit: "The Connected, Pexels",
    desc: "Élargissez vos horizons en rencontrant des experts et des passionnés."
  },
  {
    id: 3,
    src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/bannerImage/passionne.png",
    alt: "Pour les passionnés qui vibrent au stade",
    title: "Pour les passionnés qui vibrent au stade",
    credit: "Melvin Bühn, Pexels",
    desc: "Vivez l'adrénaline des matchs et des compétitions"
  },
  {
    id: 4,
    src: "https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/bannerImage/jeune-creer.png",
    alt: "Pour les jeunes qui veulent créer",
    title: "Pour les jeunes qui veulent créer",
    credit: "Generated",
    desc: "Des ateliers de création, des hackathons, des sessions de gaming et bien plus encore"
  }
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progressKey, setProgressKey] = useState(0); // force dot animation reset

  const intervalRef = useRef<TimeoutId>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const TOTAL = slidesData.length;

  // Clear interval helper
  const clearAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start autoplay with fresh interval and restart dot animation
  const startAutoplay = useCallback(() => {
    setUserPaused(false);
    if (isComplete) setIsComplete(false);
    setIsPaused(false);
    clearAutoplay();
    setProgressKey((k) => k + 1);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % TOTAL;
        if (next === 0 && TOTAL > 1) {
          setIsComplete(true);
          setIsPaused(true);
          clearAutoplay();
        }
        return next;
      });
    }, AUTOPLAY_DURATION);
  }, [isComplete, TOTAL]);


  const pauseAutoplay = () => {
    setUserPaused(true);
    setIsPaused(true);
    clearAutoplay();
    // Keep progressKey as-is; dot stops without resetting
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= TOTAL) return;
    setCurrentIndex(index);
    if (isComplete) setIsComplete(false);

    // If playing, reset interval and restart active dot animation
    if (!isPaused) {
      clearAutoplay();
      setProgressKey((k) => k + 1);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % TOTAL;
          if (next === 0 && TOTAL > 1) {
            setIsComplete(true);
            setIsPaused(true);
            clearAutoplay();
          }
          return next;
        });
      }, AUTOPLAY_DURATION);
    }
  };

  // IntersectionObserver: start autoplay on visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          navRef.current?.classList.remove("below");
          if (!isComplete && isPaused && !userPaused) {
            startAutoplay();
          }
        } else {
            el.classList.remove("is-visible");
            setIsPaused(true);
            clearAutoplay();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isPaused, isComplete, userPaused, startAutoplay]);

  // On mount: small fallback to start autoplay and ensure first dot anim,
  // in case observer doesn’t trigger 
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isComplete && isPaused && !userPaused) {
        startAutoplay();
      }
    }, 50);
    return () => clearTimeout(t);
  }, [isComplete, isPaused, userPaused, startAutoplay]);


  // When currentIndex changes while playing, restart dot animation
  useEffect(() => {
    if (!isPaused) {
      setProgressKey((k) => k + 1);
    }
  }, [currentIndex, isPaused]);

  useEffect(() => {
    return () => {
      clearAutoplay();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="carousel-container relative w-full mb-12 -mt-8 rounded-lg shadow-lg bg-gradient-to-b from-[#111] to-[#1E1E1E] border border-[rgba(255,255,255,0.08)] overflow-hidden"
    >
      {/* Slides track */}
      <div
        className="slides relative flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slidesData.map((slide, index) => (
          <div
            key={index}
            className={`slide w-full flex-shrink-0 transition-all duration-500 ${
              index === currentIndex
                ? "opacity-100 pointer-events-auto"
                : "opacity-50 pointer-events-none"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center max-h-60 sm:max-h-50 lg:max-h-55">
              <div className="flex-1 p-4 md:p-6 lg:p-10 max-w-full sm:max-w-[35%]">
                <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-300 mb-3 md:mb-4">
                  {slide.title}
                </h2>
                <p className="text-xs md:text-base text-gray-400">
                  {slide.desc}
                </p>
              </div>

              <div className="flex-1 relative w-full h-40 md:h-55 overflow-hidden flex justify-center items-center">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={640}
                  height={200}
                  className="relative object-cover bg-contain w-full h-auto max-w-[65%]]"
                />
                <span className="absolute z-10 bottom-3 right-3 bg-black/60 px-2 py-1 rounded-md text-xs text-gray-400">
                    {slide.credit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div
        ref={navRef}
        className="carousel-nav absolute bottom-2  flex items-center gap-4 group"
      >
        <button
          id="play-pause-btn"
          aria-label={isComplete ? "Rejouer" : isPaused ? "Lire" : "Mettre en pause"}
          onClick={() => {
          if (isComplete) {
            setIsComplete(false);
            setCurrentIndex(0);
            setUserPaused(false);
            startAutoplay();
          } else if (isPaused) {
            setUserPaused(false);
            startAutoplay();
          } else {
            pauseAutoplay(); // met userPaused = true
          }
          }}
          className="flex items-center justify-center text-white rounded-full h-10 w-10 bg-[rgba(144,144,146,0.25)] backdrop-blur-sm transition-all ease-in-out duration-300 group group-hover:backdrop-blur-3xl cursor-pointer"
        >
          {isComplete ? (
            <svg
              className="replay-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          ) : isPaused ? (
            <svg
              className="play-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg
              className="pause-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>

        {/* Dots with morphing + progress */}
        <div className="progress-bar-container relative w-35 h-11 rounded-full flex items-center justify-center bg-[rgba(144,144,146,0.25)] backdrop-blur-sm transition-all ease-in-out duration-300 group group-hover:backdrop-blur-3xl">
          <div className="dots-container absolute inset-0 flex px-3">
            {slidesData.map((_, idx) => {
              const active = idx === currentIndex && !isPaused && !isComplete;
              return (
                <div key={idx} className="dot-item flex-1 flex items-center">
                  <div
                    // key includes progressKey so animation restarts each time we (re)start or advance
                    key={`${idx}-${active ? progressKey : "idle"}`}
                    onClick={() => goToSlide(idx)}
                    className={`dot mx-auto cursor-pointer ${
                      active ? "transforming progressing" : ""
                    }`}
                    style={
                      active
                        ? ({
                            ["--progress-duration" as string]: `${AUTOPLAY_DURATION}ms`
                          } as React.CSSProperties)
                        : undefined
                    }
                    title={`Aller à la slide ${idx + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



