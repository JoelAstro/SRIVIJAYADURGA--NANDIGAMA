import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MENU_PAGES = [
  { src: '/menu_page_3.png', alt: 'Sri Vijaya Durga - Main Menu Cover' },
  { src: '/menu_page_4.png', alt: 'Veg & Non-Veg Starters' },
  { src: '/menu_page_7.png', alt: 'Sea Food, Egg, & Tandoori Starters' },
  { src: '/menu_page_8.png', alt: 'Veg & Non-Veg Biryanis' },
  { src: '/menu_page_9.png', alt: 'Veg & Non-Veg Fried Rice' },
  { src: '/menu_page_5.png', alt: 'Roti Basket & Soups' },
  { src: '/menu_page_6.png', alt: 'Veg & Non-Veg Curries' },
  { src: '/menu_page_11.png', alt: 'Family Packs, Specials, Couple & Bucket Biryanis' }
];

export default function OurMenuSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % MENU_PAGES.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + MENU_PAGES.length) % MENU_PAGES.length);
  };

  // Autoplay functionality: switches slides every 5 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex]);

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

  return (
    <div className="w-full relative group">
      {/* Slider Container */}
      <div 
        className="relative aspect-[1/1.4] w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Track */}
        <div 
          className="flex h-full w-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {MENU_PAGES.map((page, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={page.src} 
                alt={page.alt}
                loading={idx === 0 ? "eager" : "lazy"}
                className="w-full h-full object-contain bg-white dark:bg-neutral-955 transition-opacity duration-300"
              />
              {/* Overlay description badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-bg-dark/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/50 text-white flex justify-between items-center text-xs shadow-md">
                <span className="font-bold tracking-wide text-neutral-250">{page.alt}</span>
                <span className="px-2 py-0.5 bg-saffron text-maroon rounded-md font-logo font-black text-[10px] whitespace-nowrap">
                  {idx + 1} / {MENU_PAGES.length}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrow Controls */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Page"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-lg transition-all active:scale-90 hover:scale-105 z-10 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Page"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-lg transition-all active:scale-90 hover:scale-105 z-10 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicator Navigation Dots */}
      <div className="flex justify-center items-center gap-2 py-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-850">
        {MENU_PAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveIndex(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer h-2 border-none ${
              idx === activeIndex 
                ? 'w-6 bg-maroon dark:bg-saffron' 
                : 'w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
