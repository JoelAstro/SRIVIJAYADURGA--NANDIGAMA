import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface GalleryItem {
  id: string | number;
  src: string;
  alt: string;
}

const FALLBACK_IMAGES: GalleryItem[] = [
  {
    id: 1,
    src: '/gallery_0.jpg',
    alt: 'Sri Vijaya Durga Restaurant Front View (Evening lights)'
  },
  {
    id: 2,
    src: '/gallery_1.jpg',
    alt: 'Sri Vijaya Durga Restaurant Entrance and AC Hall front'
  },
  {
    id: 3,
    src: '/gallery_2.jpg',
    alt: 'Premium AC Dining Hall interior with family guests'
  },
  {
    id: 4,
    src: '/gallery_3.jpg',
    alt: 'Cashier Terminal desk and POS billing portal counter'
  },
  {
    id: 5,
    src: '/gallery_4.jpg',
    alt: 'Comfortable family dining cabins and beverage chilling station'
  }
];

const GallerySection: React.FC = () => {
  const { cmsSettings } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const galleryList = React.useMemo(() => {
    if (cmsSettings?.galleryImages) {
      try {
        const parsed = JSON.parse(cmsSettings.galleryImages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id || Math.random().toString(),
            src: item.url || '/tandoori_chicken.png',
            alt: item.caption || ''
          }));
        }
      } catch (e) {
        console.error('Failed to parse gallery images JSON:', e);
      }
    }
    return FALLBACK_IMAGES;
  }, [cmsSettings?.galleryImages]);

  // Append first two items to the end to allow seamless infinite loop with 2 items per view
  const displayImages = React.useMemo(() => {
    if (galleryList.length === 0) return [];
    if (galleryList.length === 1) return [galleryList[0], galleryList[0]];
    return [...galleryList, galleryList[0], galleryList[1]];
  }, [galleryList]);

  // Interval timer - restarts whenever currentIndex changes to prevent overlapping animations
  useEffect(() => {
    if (galleryList.length <= 1) return;
    const autoSlide = cmsSettings?.galleryAutoSlide !== false;
    if (!autoSlide) return;

    const intervalSeconds = cmsSettings?.gallerySlideInterval || 3;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
    }, intervalSeconds * 1000);
    
    return () => clearInterval(interval);
  }, [currentIndex, galleryList.length, cmsSettings?.galleryAutoSlide, cmsSettings?.gallerySlideInterval]);

  // Reset index to 0 after transitioning past the last original slide to achieve an infinite loop
  useEffect(() => {
    if (galleryList.length <= 1) return;
    if (currentIndex === galleryList.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700); // Matches the transition-transform duration
      return () => clearTimeout(timer);
    }
  }, [currentIndex, galleryList.length]);

  if (galleryList.length === 0) return null;

  return (
    <div className="w-full space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Restaurant Gallery</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Take a visual tour of our premium dining hall, dishes, and restaurant layout</p>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative w-full overflow-hidden rounded-3xl bg-neutral-950 p-2 sm:p-3 border border-neutral-200 dark:border-neutral-800 shadow-2xl select-none">
        
        {/* Left edge shadow fade */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-neutral-950 to-transparent pointer-events-none z-10 rounded-l-3xl" />
        {/* Right edge shadow fade */}
        <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none z-10 rounded-r-3xl" />

        {/* Sliding Track */}
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{
            transform: `translateX(-${currentIndex * (galleryList.length === 1 ? 100 : 50)}%)`
          }}
        >
          {displayImages.map((image, idx) => (
            <div 
              key={`${image.id}-${idx}`} 
              className={`${galleryList.length === 1 ? 'w-full' : 'w-1/2'} flex-shrink-0 px-2 sm:px-3`}
            >
              <div className="h-32 sm:h-44 md:h-52 lg:h-60 rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/60 relative shadow-md bg-neutral-900 group">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Dot Indicators */}
      {galleryList.length > 1 && (
        <div className="flex justify-center items-center gap-2.5 pt-2 select-none">
          {galleryList.map((_, idx) => {
            const isActive = idx === (currentIndex % galleryList.length);
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'w-7 bg-maroon dark:bg-saffron shadow-[0_0_10px_rgba(245,158,11,0.35)]' 
                    : 'w-2.5 bg-neutral-350 dark:bg-neutral-850 hover:bg-neutral-400 dark:hover:bg-neutral-750'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

export default GallerySection;
