import React from 'react';
import { ArrowRight, BookOpen, Clock, Phone, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  const { getAverageRating, ratings } = useApp();
  
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div 
      className="relative min-h-[80vh] flex items-center bg-cover bg-[center_top] sm:bg-center select-none overflow-hidden rounded-3xl border border-neutral-200/20 dark:border-neutral-850" 
      style={{ backgroundImage: "url('/hero_background.png')" }}
    >
      {/* Dark overlay with soft left-to-right gradient for readability */}
      <div className="absolute inset-0 bg-bg-dark/40 sm:bg-transparent z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-bg-dark/90 sm:from-bg-dark via-bg-dark/75 sm:via-bg-dark/85 to-transparent z-0"></div>
      
      {/* Ambient glowing gold orb in the background */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-saffron/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-12 relative z-10 py-16 md:py-28 flex justify-center sm:justify-start">
        <div className="w-[90%] sm:w-full sm:max-w-[700px] space-y-8 flex flex-col items-center sm:items-start text-center sm:text-left">
          

          {/* Badge Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center sm:justify-start gap-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-ping"></span>
              ❄️ Fully A/C Fine Dining
            </div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> 
              {getAverageRating()} / 5.0 ({ratings.length} Reviews)
            </div>
          </motion.div>

          {/* Heading */}
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-logo font-extrabold text-[clamp(1.75rem,5vw,4rem)] text-white leading-tight drop-shadow-lg"
            >
              The Best Meal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-amber-400 to-saffron-light drop-shadow-md">
                You Haven't Had Yet
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-[clamp(1rem,3vw,1.5rem)] text-neutral-100 leading-relaxed max-w-lg drop-shadow-md"
            >
              Welcome to Sri Vijaya Durga Family AC Restaurant. Savor authentic culinary delicacies, signature Hyderabadi Biryanis, claypot tandoori platters, and premium catering.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center sm:justify-start gap-4 pt-2 w-full"
          >
            <button 
              onClick={() => navigateTo('#booking')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-bold text-[clamp(0.875rem,2vw,1rem)] shadow-xl hover:-translate-y-0.5 active:translate-y-0 hover:shadow-maroon/20 dark:hover:shadow-saffron/20 transition-all duration-200 w-full sm:w-auto"
            >
              Reserve a Table <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigateTo('#menu')}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-neutral-900/80 text-white border border-neutral-700/60 font-logo font-bold text-[clamp(0.875rem,2vw,1rem)] shadow-md hover:-translate-y-0.5 active:translate-y-0 hover:bg-neutral-800 transition-all duration-200 backdrop-blur-sm w-full sm:w-auto"
            >
              Explore Digital Menu <BookOpen className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Quick Info Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-neutral-700/50 pt-8 w-full sm:max-w-md"
          >
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-850/80 border border-neutral-700/50 flex items-center justify-center text-saffron shadow-inner backdrop-blur-sm shrink-0">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider drop-shadow-md">Opening Hours</h4>
                <p className="text-xs sm:text-sm text-white font-extrabold font-logo drop-shadow-md">11:00 AM - 11:00 PM</p>
              </div>
            </div>
            <a 
              href="tel:+919966315544" 
              className="flex items-center justify-center sm:justify-start gap-4 cursor-pointer group select-none text-left no-underline"
              aria-label="Call Sri Vijaya Durga Restaurant for Orders and Catering at 9966315544"
              title="Call Now"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-850/80 border border-neutral-700/50 flex items-center justify-center text-saffron group-hover:bg-saffron group-hover:text-maroon transition-all duration-300 shadow-inner backdrop-blur-sm shrink-0">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider group-hover:text-saffron transition-colors duration-300 drop-shadow-md">Order & Catering</h4>
                <p className="text-xs sm:text-sm text-white font-extrabold font-logo group-hover:text-saffron transition-colors duration-300 drop-shadow-md">9966315544</p>
              </div>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
