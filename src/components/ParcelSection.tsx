import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ShieldCheck, Flame } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const PhoneIcon: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-4 h-4 animate-bounce"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Clock: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"></path>
  </svg>
);

const ParcelSection: React.FC = () => {
  const { parcelItems, menuItems, setBgImage } = useApp();
  const [selectedPack, setSelectedPack] = useState<string>('ALL_PACKS');

  // Define final category list
  const categories = [
    { id: 'ALL_PACKS', name: 'Show All Packs' },
    { id: 'Couple Pack', name: 'Couple Pack' },
    { id: 'Family Pack', name: 'Family Pack' },
    { id: 'Bucket Biryani', name: 'Bucket Biryani' },
    { id: 'ALL', name: 'All' },
    { id: 'Veg Biryani', name: 'Veg Biryani' },
    { id: 'Non-Veg Biryani', name: 'Non-Veg Biryani' },
    { id: 'Veg Fried Rice', name: 'Veg Fried Rice' },
    { id: 'Non-Veg Fried Rice', name: 'Non-Veg Fried Rice' },
    { id: 'Veg Starters', name: 'Veg Starters' },
    { id: 'Non-Veg Starters', name: 'Non-Veg Starters' },
    { id: 'Sea Food Starters', name: 'Sea Food Starters' },
    { id: 'Egg Items', name: 'Egg Items' },
    { id: 'Tandoori Non-Veg', name: 'Tandoori Non-Veg' },
    { id: 'Tandoori Veg', name: 'Tandoori Veg' },
    { id: 'Veg Curries', name: 'Veg Curries' },
    { id: 'Non-Veg Curries', name: 'Non-Veg Curries' },
    { id: 'Roti Basket', name: 'Roti Basket' },
    { id: 'Soups Veg', name: 'Soups Veg' },
    { id: 'Soups Non-Veg', name: 'Soups Non-Veg' },
    { id: 'Specials', name: 'Specials' },
  ];

  // Combine packs and main menu items
  const combinedItems = [
    ...parcelItems.map(item => ({ ...item, isPack: true })),
    ...menuItems.map(item => ({ ...item, isPack: false }))
  ];

  // Filter items
  const filteredParcels = combinedItems.filter(item => {
    if (selectedPack === 'ALL_PACKS') {
      return item.isPack;
    }
    if (selectedPack === 'ALL') {
      return true;
    }
    return item.category === selectedPack;
  });

  return (
    <div className="w-full space-y-8 relative font-medium">
      
      {/* Background packaging info banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-maroon/5 via-saffron/5 to-maroon/5 p-6 sm:p-8 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/70 z-10 glass">
        
        {/* Ambient floating elements & Premium Animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
          <div className="absolute top-6 left-10 text-2xl animate-float" style={{ animationDelay: '0s' }}>🌶️</div>
          <div className="absolute top-1/2 right-20 text-3xl animate-float" style={{ animationDelay: '2s' }}>🛍️</div>
          <div className="absolute bottom-10 left-1/4 text-2xl animate-float" style={{ animationDelay: '4s' }}>🍗</div>
          <div className="absolute top-1/4 left-3/4 text-xl animate-float" style={{ animationDelay: '1.5s' }}>🧅</div>
          
          <div className="absolute bottom-12 left-1/2 text-2xl animate-steam" style={{ animationDelay: '0s' }}>♨️</div>
          <div className="absolute bottom-16 left-1/2 text-lg animate-steam" style={{ animationDelay: '1s' }}>♨️</div>
          
          <div className="absolute top-8 right-12 flex items-center gap-1.5 animate-pulse bg-white/20 dark:bg-black/20 p-2 rounded-2xl border border-white/10" style={{ animationDuration: '3s' }}>
            <span className="text-xl">📦</span>
            <span className="text-xl">👨‍🍳</span>
            <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest leading-none">Packing</span>
          </div>

          <div className="absolute left-0 bottom-1 w-full h-8 overflow-hidden">
            <div className="text-2xl animate-bike absolute bottom-0 font-logo">🛵💨</div>
          </div>
        </div>

        <div className="max-w-2xl text-center mx-auto space-y-3 relative z-10 py-4">
          <h2 className="font-logo font-extrabold text-2xl sm:text-3xl text-maroon dark:text-saffron">
            Freshly Packed Takeaways
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed max-w-xl mx-auto font-medium">
            Savor your favorite delicacies in the comfort of your home. We pack each event parcel and family combo with food-grade materials to preserve heat, flavor, and absolute hygiene.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-200/30 dark:border-neutral-800/30 mt-6 relative z-10 select-none">
          <div className="flex items-center gap-2.5 justify-center text-neutral-600 dark:text-neutral-400">
            <ShieldCheck className="w-5 h-5 text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Hygienic Packs</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-neutral-600 dark:text-neutral-400">
            <Flame className="w-5 h-5 text-maroon dark:text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Freshly Cooked</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-neutral-600 dark:text-neutral-400">
            <Clock className="w-5 h-5 text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Fast Setup</span>
          </div>
          <div className="flex items-center gap-2.5 justify-center text-neutral-600 dark:text-neutral-400">
            <Truck className="w-5 h-5 text-maroon dark:text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home Takeaway</span>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto relative z-10 px-2 select-none">
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedPack(cat.id)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all duration-200 ${
              selectedPack === cat.id
                ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm scale-[1.02]'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-maroon/20 dark:hover:border-saffron/30 hover:bg-neutral-50 dark:hover:bg-neutral-850'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Rebuilt Compact Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
        {filteredParcels.map(item => {
          return (
            <div 
              key={`${item.isPack ? 'pack' : 'menu'}-${item.id}`}
              onClick={() => !item.disabled && setBgImage(item.image)}
              className={`flex flex-col justify-between bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/70 overflow-hidden shadow-sm hover:shadow-lg hover:border-maroon/15 dark:hover:border-saffron/20 transition-all duration-300 relative group cursor-pointer ${item.disabled ? 'opacity-55 select-none' : ''}`}
            >
              {/* Aspect Ratio Image Container */}
              <div className="w-full aspect-[4/3] overflow-hidden relative bg-neutral-100 dark:bg-neutral-850 flex-shrink-0">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${item.disabled ? 'grayscale' : ''}`}
                />
                
                {/* Category tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-maroon to-red-700 dark:from-saffron dark:to-amber-500 text-white dark:text-neutral-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-logo shadow-md">
                    {item.category}
                  </span>
                </div>

                {/* Veg/Non-veg Dot */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border ${
                    item.type === 'veg' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
              </div>

              {/* Text / Price Info block */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-logo font-extrabold text-sm text-neutral-850 dark:text-neutral-100 group-hover:text-maroon dark:group-hover:text-saffron transition-colors leading-tight line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed h-8">
                    {item.description || 'Delicately cooked dish served hot with authentic spices and fresh ingredients.'}
                  </p>
                </div>
                
                {/* Footer block */}
                <div 
                  className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/40 mt-2 flex items-center justify-between"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="font-logo font-extrabold text-xs text-maroon dark:text-saffron bg-maroon/5 dark:bg-saffron/5 px-2.5 py-0.5 rounded-lg">
                    ₹{item.price}
                  </span>
                  
                  <a 
                    href="tel:9966315544"
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-maroon dark:bg-saffron text-white dark:text-maroon font-logo font-bold text-[11px] rounded-lg shadow-sm hover:scale-103 hover:shadow-md active:scale-97 transition-all text-center no-underline"
                  >
                    <span>📞</span> Call To Order
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Catering Callout */}
      <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-saffron/30 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none mt-12">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-saffron/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-maroon/15 blur-3xl pointer-events-none"></div>

        <div className="space-y-3 text-center md:text-left relative z-10 flex-1">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/25 text-saffron text-[9px] font-bold uppercase tracking-widest">
              ✨ Premium Services
            </span>
            <h3 className="font-logo font-black text-xl sm:text-2xl text-white tracking-wide leading-tight">
              Bulk Catering &amp; Event Orders
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
              Make your celebrations unforgettable. We cater premium wedding receptions, birthday celebrations, and corporate dinners with verified gourmet menus and high standards of taste.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto md:mx-0">
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🎉</span>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Parties &amp; Birthdays</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">💍</span>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Weddings &amp; Catering</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🏢</span>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Corporate Catering</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🍽️</span>
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Family AC Buffets</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0 flex justify-center w-full md:w-auto">
          <a 
            href="tel:9966315544"
            className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-saffron to-amber-500 hover:from-amber-500 hover:to-saffron text-neutral-950 font-logo font-black uppercase text-xs rounded-2xl shadow-lg hover:scale-103 transition-all flex items-center justify-center gap-2 border border-amber-400/20"
          >
            <PhoneIcon />
            <span>Call 9966315544</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default ParcelSection;
