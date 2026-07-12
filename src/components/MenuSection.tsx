import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Minus, ShoppingBag, ClipboardList, CreditCard, X, ShoppingCart } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';

const MenuSection: React.FC = () => {
  const { 
    activeTable, cart, addToCart, updateCartQty, 
    placeOrder, activeOrder, updateOrderStatus, menuItems, parcelItems, setBgImage 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItemDetails, setSelectedItemDetails] = useState<any | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Synchronize background image on category change
  useEffect(() => {
    if (selectedCategory.includes('Biryani')) {
      setBgImage('/special_dum_biryani.png');
    } else if (selectedCategory.includes('Starters') || selectedCategory.includes('Tandoori Non-Veg') || selectedCategory.includes('Egg')) {
      setBgImage('/tandoori_chicken.png');
    } else if (selectedCategory.includes('Tandoori Veg')) {
      setBgImage('/paneer_tikka.png');
    } else if (selectedCategory.includes('Dessert') || selectedCategory.includes('Sweet')) {
      setBgImage('/gulab_jamun.png');
    } else {
      setBgImage('/hero_background.png');
    }
  }, [selectedCategory, setBgImage]);

  // Checkout info form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    'All',
    'Veg Biryani',
    'Non-Veg Biryani',
    'Veg Fried Rice',
    'Non-Veg Fried Rice',
    'Veg Starters',
    'Non-Veg Starters',
    'Sea Food Starters',
    'Egg Items',
    'Tandoori Veg',
    'Tandoori Non-Veg',
    'Special Biryani',
    'Veg Curries',
    'Non-Veg Curries',
    'Roti Basket',
    'Soups Veg',
    'Soups Non-Veg'
  ];

  // Pre-populate customer details if dining session is already active
  useEffect(() => {
    if (activeOrder) {
      setCustName(activeOrder.customerName);
      setCustPhone(activeOrder.customerPhone);
    }
  }, [activeOrder]);

  // Merge and normalize all items from Dine-In and Takeaway
  const allMergedItems = [
    ...menuItems,
    ...parcelItems.map(item => {
      if (item.category === 'Couple Pack') {
        return { ...item, category: 'Couple Pack Biryani' };
      }
      if (item.category === 'Family Pack') {
        return { ...item, category: 'Family Pack Biryani' };
      }
      return item;
    })
  ];

  // Exclude Parcel & Takeaway ONLY categories from Dine-In menu
  const dineInItems = allMergedItems.filter(item => {
    return (
      item.category !== 'Couple Pack Biryani' &&
      item.category !== 'Family Pack Biryani' &&
      item.category !== 'Bucket Biryani' &&
      item.category !== 'Couple Pack' &&
      item.category !== 'Family Pack'
    );
  });

  // Filter menu dynamically based on search and category selection
  const filteredMenu = dineInItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = subtotal;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    let name = custName;
    let phone = custPhone;

    if (activeOrder) {
      name = activeOrder.customerName;
      phone = activeOrder.customerPhone;
    } else {
      if (!name || !phone) {
        alert('Please enter your name and 10-digit mobile number.');
        return;
      }
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    const success = placeOrder(name, phone, notes);
    if (success) {
      alert('Your order has been sent to the Kitchen!');
      setNotes('');
      setIsMobileCartOpen(false);
    }
  };

  return (
    <div className="relative">
      
      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Menu list, search, categories */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search bar with subtle ambient glow */}
          <div className="relative w-full group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 dark:text-neutral-500 group-focus-within:text-maroon dark:group-focus-within:text-saffron transition-colors">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input 
              type="text"
              placeholder="Search dishes (e.g. Biryani, Paneer, Starters)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-bg-dark text-xs focus:border-maroon dark:focus:border-saffron focus:ring-1 focus:ring-maroon/20 dark:focus:ring-saffron/20 outline-none shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all font-medium text-neutral-850 dark:text-neutral-100"
            />
          </div>

          {/* Sticky Category scroll row - beautifully styled */}
          <div className="sticky top-[112px] z-30 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur-md -mx-4 px-4 py-3 border-y border-neutral-200/50 dark:border-neutral-800/50 flex gap-2.5 overflow-x-auto scrollbar-none no-print">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-md scale-102'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-maroon/20 dark:hover:border-saffron/30 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Grid - Rebuilt cards for equal height, consistent aspect ratios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMenu.map(item => {
              const cartItem = cart.find(c => c.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              const orderedQty = activeOrder?.items.find(i => i.id === item.id)?.quantity || 0;

              return (
                <div 
                  key={item.id}
                  className={`flex flex-col justify-between bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/70 overflow-hidden shadow-sm hover:shadow-lg hover:border-maroon/15 dark:hover:border-saffron/20 transition-all duration-300 relative group cursor-pointer ${item.disabled ? 'opacity-55 select-none' : ''}`}
                  onClick={() => !item.disabled && setSelectedItemDetails(item)}
                >
                  
                  {/* Top Block: Aspect Ratio Image with Overlay Badges */}
                  <div className="w-full aspect-[4/3] sm:aspect-video overflow-hidden relative bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                    <ImageWithFallback 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Veg/Non-Veg Badge (Premium styled pill) */}
                    <div className="absolute top-3 left-3 z-10 flex gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border ${
                        item.type === 'veg' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Category Label (floating top right) */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-neutral-950/70 border border-white/10 text-white text-[8px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Info Block: Pushed down for equal heights */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Header + Description */}
                    <div className="space-y-1.5">
                      <h4 className="font-logo font-extrabold text-base text-neutral-850 dark:text-neutral-100 group-hover:text-maroon dark:group-hover:text-saffron transition-colors leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.description || 'Our master chef specialty prepared with hand-ground spices and organic farm ingredients.'}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/40" onClick={e => e.stopPropagation()}>
                      <span className="font-logo font-extrabold text-base text-maroon dark:text-saffron bg-maroon/5 dark:bg-saffron/5 px-2.5 py-1 rounded-xl">
                        ₹{item.price}
                      </span>
                      
                      {/* Add / Qty Control */}
                      {item.disabled ? (
                        <span className="px-3 py-1.5 bg-neutral-150 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-extrabold text-[10px] rounded-xl border border-neutral-200 dark:border-neutral-700 select-none uppercase tracking-wider">
                          Unavailable
                        </span>
                      ) : qty > 0 ? (
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-inner">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            disabled={qty <= orderedQty}
                            className={`px-3 py-1.5 text-neutral-500 hover:text-maroon dark:hover:text-saffron font-bold text-xs transition-colors ${
                              qty <= orderedQty ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-logo font-black text-neutral-800 dark:text-neutral-100">{qty}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="px-3 py-1.5 text-neutral-500 hover:text-maroon dark:hover:text-saffron font-bold text-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 px-4 py-2 bg-maroon dark:bg-saffron text-white dark:text-maroon font-logo font-bold text-xs rounded-xl shadow-sm hover:scale-103 hover:shadow-md active:scale-97 transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Strip: Ordered status indicators */}
                  {orderedQty > 0 && (
                    <div className="bg-maroon/5 dark:bg-saffron/5 border-t border-maroon/5 dark:border-saffron/5 px-5 py-2 flex items-center justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3 text-maroon dark:text-saffron" /> Already Ordered:</span>
                      <span className="text-maroon dark:text-saffron bg-white dark:bg-neutral-850 px-2 py-0.5 rounded-md border border-maroon/10 dark:border-saffron/10 font-logo">{orderedQty} Portions</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT: Order Checkout sidebar - Desktop only */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/70 rounded-3xl p-6 shadow-md sticky top-28 glass">
            
            <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 justify-between">
              <h3 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Order Details
              </h3>
              <span className="bg-saffron/10 border border-saffron/30 text-saffron text-xs font-bold px-2.5 py-0.5 rounded-lg font-logo">
                Table {activeTable || 'None'}
              </span>
            </div>

            {/* Cart list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto opacity-20 mb-2" />
                  Your order card is empty. <br />Add items from the menu.
                </div>
              ) : (
                cart.map(item => {
                  const orderedQty = activeOrder?.items.find(i => i.id === item.id)?.quantity || 0;
                  return (
                    <div key={item.id} className="flex justify-between items-center gap-4 border-b border-neutral-100 dark:border-neutral-800/40 pb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-extrabold truncate text-neutral-800 dark:text-neutral-100">{item.name}</h5>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <span>₹{item.price}</span>
                          {orderedQty > 0 && <span className="text-maroon dark:text-saffron font-bold bg-maroon/5 dark:bg-saffron/5 px-1.5 py-0.2 rounded-md">(Ordered: {orderedQty})</span>}
                        </div>
                      </div>
                      
                      {/* Qty controls */}
                      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateCartQty(item.id, -1)}
                          disabled={item.quantity <= orderedQty}
                          className={`p-1 px-2 text-neutral-500 font-bold text-xs ${
                            item.quantity <= orderedQty ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-1 text-xs font-bold font-logo text-neutral-800 dark:text-neutral-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.id, 1)}
                          className="p-1 px-2 text-neutral-500 font-bold text-xs"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4 space-y-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <div className="flex justify-between text-sm text-neutral-850 dark:text-neutral-100 font-extrabold border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-2.5 mt-1">
                  <span>Total Amount</span>
                  <span className="text-maroon dark:text-saffron font-logo text-sm sm:text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Session indicators & Checkout forms */}
            {cart.length > 0 && (
              <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
                {activeOrder ? (
                  // Active Dining session
                  <div className="space-y-3">
                    <div className="p-3 bg-maroon/5 dark:bg-saffron/5 border border-maroon/10 dark:border-saffron/10 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-maroon dark:text-saffron uppercase tracking-wider block font-logo">Active Dining Session</span>
                      <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{activeOrder.customerName}</h5>
                      <p className="text-[10px] text-neutral-400">{activeOrder.customerPhone}</p>
                    </div>
                    
                    {cart.some(c => c.quantity > (activeOrder.items.find(i => i.id === c.id)?.quantity || 0)) ? (
                      <button 
                        onClick={handlePlaceOrderClick}
                        className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-extrabold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5 animate-pulse-ring"
                      >
                        <ClipboardList className="w-4 h-4" /> Add items as "Additional Order"
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center text-[10px] font-bold text-neutral-400">
                          Orders are preparing in the kitchen.
                        </div>
                        <button 
                          onClick={() => updateOrderStatus(activeOrder.id, 'BILLING')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" /> Request Bill / Settle Table
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Customer Info Form
                  <div className="space-y-3">
                    {activeTable ? (
                      <form onSubmit={handlePlaceOrderClick} className="space-y-2">
                        <input 
                          type="text" 
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          placeholder="Customer Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                        />
                        <input 
                          type="tel" 
                          required
                          pattern="[0-9]{10}"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          placeholder="Mobile Number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                        />
                      </form>
                    ) : (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider font-logo">
                        Please select a table from "Dining Booking" tab first!
                      </div>
                    )}

                    <input 
                      type="text" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions (e.g. less spicy)..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                      disabled={!activeTable}
                    />

                    {activeTable && (
                      <button 
                        onClick={handlePlaceOrderClick}
                        className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-extrabold text-xs rounded-xl shadow-md hover:opacity-90 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ClipboardList className="w-4 h-4" /> Place Order &amp; Start Cooking
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>

      {/* MOBILE FLOATING CART ACTION TRIGGER BUTTON */}
      {totalCartItems > 0 && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setIsMobileCartOpen(true)}
          className="lg:hidden fixed bottom-24 right-6 z-40 bg-maroon dark:bg-saffron text-white dark:text-maroon shadow-2xl p-4 rounded-full flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all select-none"
          title="Open Shopping Cart"
        >
          <ShoppingCart className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5.5 h-5.5 rounded-full flex items-center justify-center font-logo font-extrabold border border-white shadow-md">
            {totalCartItems}
          </span>
        </motion.button>
      )}

      {/* MOBILE CART SLIDE-UP DRAWER */}
      <AnimatePresence>
        {isMobileCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            ></motion.div>

            {/* Bottom Sheet Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-bg-dark rounded-t-[32px] max-h-[85vh] overflow-y-auto p-6 z-50 border-t border-maroon/20 dark:border-saffron/20 shadow-2xl space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron flex items-center gap-1.5">
                    <ShoppingBag className="w-5 h-5" /> Cart Items ({totalCartItems})
                  </h3>
                  <button 
                    onClick={() => setIsMobileCartOpen(false)}
                    className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-4 py-4 max-h-[280px] overflow-y-auto scrollbar-thin">
                  {cart.map(item => {
                    const orderedQty = activeOrder?.items.find(i => i.id === item.id)?.quantity || 0;
                    return (
                      <div key={item.id} className="flex justify-between items-center gap-4 border-b border-neutral-100 dark:border-neutral-800/40 pb-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold truncate text-neutral-800 dark:text-neutral-100">{item.name}</h5>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span>₹{item.price}</span>
                            {orderedQty > 0 && <span className="text-maroon dark:text-saffron font-bold bg-maroon/5 dark:bg-saffron/5 px-1.5 py-0.2 rounded-md">(Ordered: {orderedQty})</span>}
                          </div>
                        </div>
                        
                        {/* Qty controls */}
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            disabled={item.quantity <= orderedQty}
                            className={`p-1 px-2.5 text-neutral-500 font-bold text-xs ${
                              item.quantity <= orderedQty ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1.5 text-xs font-bold font-logo text-neutral-800 dark:text-neutral-100">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 px-2.5 text-neutral-500 font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calculations */}
                <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-2 text-xs font-semibold text-neutral-500">
                  <div className="flex justify-between text-sm text-neutral-850 dark:text-neutral-100 font-black border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-2.5 mt-1.5">
                    <span>Total Amount</span>
                    <span className="text-maroon dark:text-saffron font-logo text-base">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout buttons / Forms */}
              <div className="space-y-3 pt-2">
                {activeOrder ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-maroon/5 dark:bg-saffron/5 border border-maroon/10 dark:border-saffron/10 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-maroon dark:text-saffron uppercase block font-logo">Active Dining Session</span>
                      <h5 className="font-bold">{activeOrder.customerName}</h5>
                      <p className="text-[10px] text-neutral-400">{activeOrder.customerPhone}</p>
                    </div>

                    {cart.some(c => c.quantity > (activeOrder.items.find(i => i.id === c.id)?.quantity || 0)) ? (
                      <button 
                        onClick={handlePlaceOrderClick}
                        className="w-full py-3.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 animate-pulse-ring"
                      >
                        <ClipboardList className="w-4 h-4" /> Add items as "Additional Order"
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            updateOrderStatus(activeOrder.id, 'BILLING');
                            setIsMobileCartOpen(false);
                          }}
                          className="w-full py-3.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CreditCard className="w-4 h-4" /> Request Bill / Settle Table
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTable ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          required
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          placeholder="Customer Name"
                          className="w-full px-3.5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                        />
                        <input 
                          type="tel" 
                          required
                          pattern="[0-9]{10}"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          placeholder="Mobile Number"
                          className="w-full px-3.5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                        />
                      </div>
                    ) : (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider font-logo">
                        Please select a table from "Dining Booking" tab first!
                      </div>
                    )}

                    <input 
                      type="text" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions (e.g. less spicy)..."
                      className="w-full px-3.5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-xs outline-none text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 font-medium transition-colors"
                      disabled={!activeTable}
                    />

                    {activeTable && (
                      <button 
                        onClick={handlePlaceOrderClick}
                        className="w-full py-4 bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <ClipboardList className="w-4 h-4" /> Place Order &amp; Start Cooking
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Food Item Expansion popup */}
      {selectedItemDetails && (
        <div 
          onClick={() => setSelectedItemDetails(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-bg-dark rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-850 relative glass animate-scale-up"
          >
            <button 
              onClick={() => setSelectedItemDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/55 text-white hover:bg-black/75 z-10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-64 overflow-hidden relative bg-neutral-150">
              <ImageWithFallback 
                src={selectedItemDetails.image} 
                alt={selectedItemDetails.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent"></div>
              <div className="absolute bottom-4 left-6 space-y-1">
                <span className="px-2.5 py-0.5 bg-saffron text-maroon text-[9px] font-black rounded-lg uppercase tracking-wider font-logo">
                  {selectedItemDetails.category}
                </span>
                <h3 className="font-logo font-extrabold text-2xl text-white">
                  {selectedItemDetails.name}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                {selectedItemDetails.description || 'Our signature chef recipe made with premium select spices and seasoned fresh toppings.'}
              </p>
              
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <span className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">₹{selectedItemDetails.price}</span>
                <button 
                  onClick={() => {
                    addToCart(selectedItemDetails);
                    setSelectedItemDetails(null);
                  }}
                  className="px-6 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-bold text-sm rounded-xl shadow-md hover:scale-102 transition-transform"
                >
                  Add +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuSection;
