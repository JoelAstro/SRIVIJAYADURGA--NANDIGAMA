import React, { useState, useEffect } from 'react';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
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

// Append first two items to the end to allow seamless infinite loop with 2 items per view
const DISPLAY_IMAGES = [...GALLERY_IMAGES, GALLERY_IMAGES[0], GALLERY_IMAGES[1]];

const GallerySection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Interval timer - restarts whenever currentIndex changes to prevent overlapping animations
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
    }, 5000); // Slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Reset index to 0 after transitioning past the last original slide to achieve an infinite loop
  useEffect(() => {
    if (currentIndex === GALLERY_IMAGES.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700); // Matches the transition-transform duration
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="w-full space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Restaurant Gallery</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Take a visual tour of our premium dining hall, reception POS desks, and restaurant facade</p>
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
            transform: `translateX(-${currentIndex * 50}%)`
          }}
        >
          {DISPLAY_IMAGES.map((image, idx) => (
            <div 
              key={`${image.id}-${idx}`} 
              className="w-1/2 flex-shrink-0 px-2 sm:px-3"
            >
              <div className="h-32 sm:h-44 md:h-52 lg:h-60 rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800/60 relative shadow-md bg-neutral-900 group">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Premium floating glassmorphic caption overlay */}
                <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 bg-neutral-950/70 backdrop-blur-md border border-white/10 rounded-xl p-2 sm:p-3 text-white pointer-events-none select-none">
                  <span className="text-[7px] sm:text-[9px] font-bold text-saffron uppercase tracking-widest mb-0.5 block">Gallery Tour</span>
                  <p className="text-[9px] sm:text-xs font-semibold leading-normal sm:leading-relaxed drop-shadow-md line-clamp-2">
                    {image.alt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center items-center gap-2.5 pt-2 select-none">
        {GALLERY_IMAGES.map((_, idx) => {
          // Highlight active dot (maps index 5 back to 0)
          const isActive = idx === (currentIndex % GALLERY_IMAGES.length);
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

    </div>
  );
};

export default GallerySection;
