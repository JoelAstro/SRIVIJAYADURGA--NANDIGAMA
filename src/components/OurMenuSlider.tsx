import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FALLBACK_PAGES = [
  { src: '/menu_card_page_1.png' },
  { src: '/menu_card_page_2.png' },
  { src: '/menu_card_page_3.png' },
  { src: '/menu_card_page_4.png' },
  { src: '/menu_card_page_5.png' }
];

export default function OurMenuSlider() {
  const { cmsSettings } = useApp();
  const touchStartX = useRef<number | null>(null);

  // Parse menu pages dynamically from CMS settings
  const menuPages = useMemo(() => {
    if (cmsSettings?.menuCardPages) {
      try {
        const parsed = JSON.parse(cmsSettings.menuCardPages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            src: item.url || '/tandoori_chicken.png'
          }));
        }
      } catch (e) {
        console.error('Failed to parse menuCardPages JSON:', e);
      }
    }
    return FALLBACK_PAGES;
  }, [cmsSettings?.menuCardPages]);

  // For infinite looping we append the first element to the end of the array
  const displayPages = useMemo(() => {
    if (menuPages.length === 0) return [];
    return [...menuPages, menuPages[0]];
  }, [menuPages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = () => {
    if (menuPages.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (menuPages.length <= 1) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      if (prev === 0) {
        // Instantly jump to cloned end, then slide left to length - 1
        setTimeout(() => {
          setIsTransitioning(false);
          setActiveIndex(menuPages.length);
          setTimeout(() => {
            setIsTransitioning(true);
            setActiveIndex(menuPages.length - 1);
          }, 50);
        }, 0);
        return prev;
      }
      return prev - 1;
    });
  };

  // Handle loop reset when reaching the cloned slide at the end
  useEffect(() => {
    if (menuPages.length <= 1) return;
    if (activeIndex === menuPages.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(0);
      }, 700); // Matches transition duration (0.7 seconds)
      return () => clearTimeout(timer);
    }
  }, [activeIndex, menuPages.length]);

  // Autoplay functionality: switches slides every 5 seconds.
  useEffect(() => {
    if (menuPages.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, menuPages.length]);

  // Touch handlers for swipe support on mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  if (menuPages.length === 0) return null;

  return (
    <div className="w-full relative px-11 sm:px-14 pt-3 pb-2 select-none bg-transparent">
      {/* Slider Container */}
      <div 
        className="relative aspect-[1/1.4] w-full select-none overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Track */}
        <div 
          className={`flex h-full w-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {displayPages.map((page, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={page.src} 
                alt={`Menu Page ${idx + 1}`}
                loading={idx === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover rounded-2xl border border-neutral-200/50 dark:border-neutral-800/60 bg-[#0d0d0d]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrow Controls - Placed outside the overflow-hidden slider container */}
      {menuPages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Page"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-neutral-905/95 dark:bg-neutral-950/95 backdrop-blur-md text-saffron border border-saffron/40 hover:border-saffron rounded-full shadow-lg transition-all active:scale-95 hover:scale-105 z-10 hover:shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Page"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-neutral-905/95 dark:bg-neutral-950/95 backdrop-blur-md text-saffron border border-saffron/40 hover:border-saffron rounded-full shadow-lg transition-all active:scale-95 hover:scale-105 z-10 hover:shadow-[0_0_10px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Indicator Navigation Dots */}
      {menuPages.length > 1 && (
        <div className="flex justify-center items-center gap-2 pt-3">
          {menuPages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex(idx);
                setIsTransitioning(true);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer h-2 border-none ${
                idx === (activeIndex % menuPages.length)
                  ? 'w-6 bg-maroon dark:bg-saffron shadow-[0_0_8px_rgba(245,158,11,0.25)]' 
                  : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
