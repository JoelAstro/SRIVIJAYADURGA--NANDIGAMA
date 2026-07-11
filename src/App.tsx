import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CustomerPortal from './pages/CustomerPortal';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Sun, Moon, ChefHat, ShieldAlert, UtensilsCrossed } from 'lucide-react';

const AppContent: React.FC = () => {
  const { theme, setTheme, activeTable, adminSession, kitchenSession, bgImage, setBgImage, orders, tables, cmsSettings } = useApp();
  const [currentView, setCurrentView] = useState<string>('customer'); // 'customer' | 'kitchen' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'booking' | 'menu' | 'parcels'

  // --- ROUTING ENGINE ---
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash || '#home';
      const cleanHash = hash.split('?')[0];

      if (cleanHash === '#kitchen') {
        setCurrentView('kitchen');
      } else if (cleanHash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
        if (cleanHash === '#booking') {
          setActiveTab('booking');
        } else if (cleanHash === '#menu') {
          setActiveTab('menu');
        } else if (cleanHash === '#parcels') {
          setActiveTab('parcels');
        } else {
          setActiveTab('home');
        }
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  // --- DYNAMIC BACKGROUND SYNC ---
  useEffect(() => {
    if (currentView === 'customer') {
      const activeOrder = activeTable 
        ? orders.find(o => o.tableNo === activeTable && o.status !== 'PAID') || null
        : null;
      const tableObj = activeTable ? tables.find(t => t.number === activeTable) : null;
      const isBilling = tableObj?.status === 'PENDING' || activeOrder?.status === 'BILLING';

      if (isBilling) {
        setBgImage('/payment_qr_0.jpeg');
      } else if (activeOrder) {
        if (activeOrder.status === 'PLACED') {
          setBgImage('/gallery_1.jpg');
        } else if (activeOrder.status === 'PREPARING') {
          setBgImage('/gallery_2.jpg');
        } else if (activeOrder.status === 'READY') {
          setBgImage('/gallery_4.jpg');
        } else if (activeOrder.status === 'COMPLETED') {
          setBgImage('/gallery_2.jpg');
        }
      } else {
        // Fall back to tab-based background if no active order session
        if (activeTab === 'booking') {
          setBgImage('/gallery_2.jpg');
        } else if (activeTab === 'menu') {
          setBgImage('/special_dum_biryani.png');
        } else if (activeTab === 'parcels') {
          setBgImage('/paneer_tikka.png');
        } else {
          setBgImage('/hero_background.png');
        }
      }
    } else if (currentView === 'kitchen') {
      setBgImage('/gallery_1.jpg');
    } else if (currentView === 'admin') {
      setBgImage('/gallery_3.jpg');
    }
  }, [currentView, activeTab, activeTable, orders, tables, setBgImage]);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-neutral-800 dark:text-neutral-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic Ambient Background Image with Crossfade */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 z-0 opacity-15 dark:opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Floating Spices Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25 dark:opacity-15">
        <div className="absolute top-10 left-10 w-8 h-8 bg-saffron rounded-full filter blur-md animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-maroon rounded-full filter blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-saffron rounded-full filter blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-maroon rounded-full filter blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* App Shell Header */}
      <header className="sticky top-0 z-50 glass border-b border-maroon/10 dark:border-saffron/10 px-4 py-3 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Area */}
          <div 
            className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none"
            onClick={() => navigateTo('#home')}
          >
            {cmsSettings?.restaurantLogo ? (
              <div className="relative w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-saffron via-amber-500/20 to-saffron shadow-[0_0_12px_rgba(245,158,11,0.22)] flex items-center justify-center flex-shrink-0 border border-saffron/20">
                <img 
                  src={cmsSettings.restaurantLogo} 
                  alt="Restaurant Logo" 
                  className="w-full h-full rounded-full object-cover brightness-[1.10] contrast-[1.10] saturate-[1.08] shadow-inner" 
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full bg-maroon dark:bg-saffron flex items-center justify-center text-white dark:text-maroon shadow-[0_0_12px_rgba(245,158,11,0.22)] flex-shrink-0 border-2 border-saffron">
                <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
              </div>
            )}
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="font-logo font-extrabold text-sm sm:text-lg leading-tight text-maroon dark:text-saffron truncate">
                {cmsSettings?.restaurantName || 'Sri Vijaya Durga Restaurant'}
              </h1>
              <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[11px] text-saffron dark:text-saffron/90 font-medium font-serif italic tracking-widest select-none leading-none mt-1.5 w-full">
                <span>✦</span>
                <span className="mx-0.5">Nandigama</span>
                <span>✦</span>
              </div>
            </div>
          </div>

          {/* Portal Switcher - Icon-based on mobile, text-based on tablet/desktop */}
          <nav className="flex bg-neutral-250/60 dark:bg-neutral-800/60 p-1 rounded-full border border-neutral-300/50 dark:border-neutral-700/50 shadow-inner flex-shrink-0">
            <button 
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                currentView === 'customer' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-850 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo(activeTable ? `#menu?table=${activeTable}` : '#home')}
              title="Customer Portal"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Customer</span>
            </button>
            <button 
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all duration-200 relative ${
                currentView === 'kitchen' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-850 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo('#kitchen')}
              title="Kitchen Dashboard"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kitchen</span>
              {kitchenSession && <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 w-2 h-2 rounded-full bg-emerald-500"></span>}
            </button>
            <button 
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition-all duration-200 relative ${
                currentView === 'admin' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-850 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo('#admin')}
              title="Admin Panel"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
              {adminSession && <span className="absolute top-0 right-0 sm:-top-1 sm:-right-1 w-2 h-2 rounded-full bg-emerald-500"></span>}
            </button>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              className="p-1.5 sm:p-2 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 hover:text-saffron transition-all"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {currentView === 'customer' && <CustomerPortal activeTab={activeTab} setActiveTab={setActiveTab} />}
        {currentView === 'kitchen' && <KitchenDashboard />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Sticky Table Identifier Bar */}
      {activeTable && currentView === 'customer' && (
        <div className="fixed bottom-0 left-0 right-0 bg-maroon dark:bg-saffron text-white dark:text-maroon px-4 py-2.5 z-40 flex items-center justify-between shadow-2xl border-t border-saffron/20 dark:border-maroon/20 font-logo select-none no-print">
          <div className="flex items-center gap-2">
            <span className="bg-saffron dark:bg-maroon text-maroon dark:text-white px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">
              Table {activeTable}
            </span>
            <span className="text-xs font-semibold opacity-90">Reserved &amp; Active Dining Session</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo(`#menu?table=${activeTable}`)}
              className="text-xs font-extrabold underline hover:text-saffron-light dark:hover:text-maroon-light transition-all"
            >
              Order Food Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
