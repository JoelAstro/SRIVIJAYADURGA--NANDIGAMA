import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ShieldCheck, Flame, X, ShoppingBag, Loader2, Trash2 } from 'lucide-react';
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
  const { menuItems, parcelItems, setBgImage, orders, placeParcelOrder } = useApp();
  const [selectedPack, setSelectedPack] = useState<string>('ALL');

  // Modal & Form State
  const [selectedItem, setSelectedItem] = React.useState<any | null>(null);
  const [itemQuantity, setItemQuantity] = React.useState(1);
  const [itemNotes, setItemNotes] = React.useState('');
  
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [takeawayCart, setTakeawayCart] = React.useState<any[]>(() => {
    const stored = localStorage.getItem('svd_takeaway_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [orderNotes, setOrderNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Error & Status States
  const [errorMsg, setErrorMsg] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [successToast, setSuccessToast] = React.useState<string | null>(null);
  
  const [successOrderId, setSuccessOrderId] = React.useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = React.useState<string | null>(() => 
    localStorage.getItem('svd_active_takeaway_order_id')
  );

  // Delivery Address Fields & States
  const [deliveryHouseNo, setDeliveryHouseNo] = React.useState('');
  const [deliveryStreet, setDeliveryStreet] = React.useState('');
  const [deliveryLandmark, setDeliveryLandmark] = React.useState('');
  const [deliveryCity, setDeliveryCity] = React.useState('');
  const [deliveryState, setDeliveryState] = React.useState('');
  const [deliveryPincode, setDeliveryPincode] = React.useState('');
  const [deliveryAddressType, setDeliveryAddressType] = React.useState<'Home' | 'Work' | 'Other'>('Home');
  const [deliveryCustomAddressType, setDeliveryCustomAddressType] = React.useState('');
  const [deliveryLat, setDeliveryLat] = React.useState<number | undefined>(undefined);
  const [deliveryLon, setDeliveryLon] = React.useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [whatsappLink, setWhatsappLink] = React.useState('');
  const [showTrackingModal, setShowTrackingModal] = React.useState(false);

  // Address validation errors
  const [houseNoError, setHouseNoError] = React.useState('');
  const [streetError, setStreetError] = React.useState('');
  const [cityError, setCityError] = React.useState('');
  const [stateError, setStateError] = React.useState('');
  const [pincodeError, setPincodeError] = React.useState('');

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDeliveryLat(latitude);
        setDeliveryLon(longitude);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setDeliveryHouseNo(addr.house_number || addr.building || '');
            setDeliveryStreet(addr.road || addr.suburb || addr.neighbourhood || '');
            setDeliveryCity(addr.city || addr.town || addr.village || '');
            setDeliveryState(addr.state || '');
            setDeliveryPincode(addr.postcode || '');
            
            setHouseNoError('');
            setStreetError('');
            setCityError('');
            setStateError('');
            setPincodeError('');
          }
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn("Location permission denied or error:", error);
        alert("Location access denied or unavailable. Please enter your address manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  React.useEffect(() => {
    localStorage.setItem('svd_takeaway_cart', JSON.stringify(takeawayCart));
  }, [takeawayCart]);

  // Sync state with localStorage if active order is completed
  const activeTrackingId = trackingOrderId || localStorage.getItem('svd_active_takeaway_order_id');
  const trackedOrder = orders.find(o => o.id === activeTrackingId);

  const getTrackingStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PLACED':
        return '✅ Order Received';
      case 'ACCEPTED':
        return '➡ Accepted by Kitchen';
      case 'PREPARING':
        return '➡ Preparing';
      case 'READY':
        return '➡ Ready';
      case 'COMPLETED':
      case 'PICKED_UP':
      case 'PAID':
        return '➡ Completed';
      case 'CANCELLED':
        return '❌ Cancelled';
      default:
        return '🟡 Order Received';
    }
  };

  const subtotal = takeawayCart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const allTakeawayItems = [
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

  const categoryOrder = [
    'Veg Biryani', 'Non-Veg Biryani', 'Veg Fried Rice', 'Non-Veg Fried Rice',
    'Veg Starters', 'Non-Veg Starters', 'Sea Food Starters', 'Egg Items',
    'Tandoori Non-Veg', 'Tandoori Veg', 'Couple Pack Biryani', 'Family Pack Biryani', 'Special Biryani', 'Bucket Biryani'
  ];

  const uniqueCategories = Array.from(new Set(allTakeawayItems.map(item => item.category)));
  const sortedCategories = uniqueCategories.sort((a, b) => {
    const idxA = categoryOrder.indexOf(a);
    const idxB = categoryOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const categories = ['ALL', ...sortedCategories];

  // Filter items
  const filteredParcels = allTakeawayItems.filter(item => {
    return selectedPack === 'ALL' || item.category === selectedPack;
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear validation states
    setNameError('');
    setPhoneError('');
    setHouseNoError('');
    setStreetError('');
    setCityError('');
    setStateError('');
    setPincodeError('');
    setErrorMsg('');

    let hasValidationError = false;

    if (takeawayCart.length === 0) {
      setErrorMsg('Your takeaway cart is empty.');
      hasValidationError = true;
    }
    if (!customerName.trim()) {
      setNameError('Customer name is required.');
      hasValidationError = true;
    }
    if (!/^[0-9]{10}$/.test(customerPhone.trim())) {
      setPhoneError('Mobile number must be exactly 10 digits.');
      hasValidationError = true;
    }
    if (!deliveryHouseNo.trim()) {
      setHouseNoError('House/Flat No. is required.');
      hasValidationError = true;
    }
    if (!deliveryStreet.trim()) {
      setStreetError('Street / Area is required.');
      hasValidationError = true;
    }
    if (!deliveryCity.trim()) {
      setCityError('City is required.');
      hasValidationError = true;
    }
    if (!deliveryState.trim()) {
      setStateError('State is required.');
      hasValidationError = true;
    }
    if (!deliveryPincode.trim()) {
      setPincodeError('Pincode is required.');
      hasValidationError = true;
    }
    if (!paymentMethod) {
      setErrorMsg('Payment mode must be selected.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      console.warn('[Takeaway Modal Submit] Validation failed');
      return;
    }

    setIsSubmitting(true);
    console.log('[Takeaway Modal Submit] Validation passed. Submitting order...');

    const fullAddress = `${deliveryHouseNo.trim()}, ${deliveryStreet.trim()}${deliveryLandmark.trim() ? ', ' + deliveryLandmark.trim() : ''}, ${deliveryCity.trim()}, ${deliveryState.trim()} - ${deliveryPincode.trim()}`;
    const addressType = deliveryAddressType === 'Other' ? (deliveryCustomAddressType.trim() || 'Other') : deliveryAddressType;

    try {
      const orderId = await placeParcelOrder(
        takeawayCart.map(c => ({ 
          id: c.itemId, 
          name: c.customization ? `${c.name} (${c.customization})` : c.name, 
          price: c.price, 
          quantity: c.quantity 
        })),
        customerName.trim(),
        customerPhone.trim(),
        orderNotes.trim(),
        paymentMethod,
        {
          address: fullAddress,
          addressType,
          latitude: deliveryLat,
          longitude: deliveryLon
        }
      );

      if (orderId) {
        console.log('[Takeaway Modal Submit] Order placed successfully:', orderId);
        setSuccessOrderId(orderId);
        setTrackingOrderId(orderId);
        localStorage.setItem('svd_active_takeaway_order_id', orderId);
        
        // Build manual WhatsApp link before clearing form states
        const itemsText = takeawayCart.map(c => `• ${c.name}${c.customization ? ' (' + c.customization + ')' : ''} ×${c.quantity}`).join('\n\n');
        const orderTimeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        const rawMessage = `🍽️ NEW TAKEAWAY ORDER

Order ID:
${orderId}

Customer Name:
${customerName.trim()}

Phone:
${customerPhone.trim()}

Delivery Address:
${fullAddress}

Payment Mode:
${paymentMethod}

Ordered Items:
${itemsText}

Special Instructions:
${orderNotes.trim() || 'None'}

Grand Total:
₹${subtotal}

Order Time:
${orderTimeStr}

Restaurant:
Sri Vijaya Durga Family Restaurant`;

        const encodedMessage = encodeURIComponent(rawMessage);
        const waLink = `https://wa.me/919966315544?text=${encodedMessage}`;
        setWhatsappLink(waLink);

        // Show success modal and close checkout modal
        setShowSuccessModal(true);
        setIsCartOpen(false);

        // Clear form and cart states
        setCustomerName('');
        setCustomerPhone('');
        setOrderNotes('');
        setNameError('');
        setPhoneError('');
        setDeliveryHouseNo('');
        setDeliveryStreet('');
        setDeliveryLandmark('');
        setDeliveryCity('');
        setDeliveryState('');
        setDeliveryPincode('');
        setDeliveryAddressType('Home');
        setDeliveryCustomAddressType('');
        setDeliveryLat(undefined);
        setDeliveryLon(undefined);
        setTakeawayCart([]);
      } else {
        setErrorMsg('Unable to place your order. Please try again.');
      }
    } catch (err: any) {
      console.error('[Takeaway Modal Submit] API execution failed:', err);
      setErrorMsg('Unable to place your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTakeawayItem = (item: any) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNotes('');
    setErrorMsg('');
    setNameError('');
    setPhoneError('');
    setSuccessOrderId(null);
  };

  const handleAddToCart = () => {
    if (itemQuantity < 1) return;
    setTakeawayCart(prev => {
      // Find if an item with the same itemId AND same customization already exists
      const existingIdx = prev.findIndex(
        c => c.itemId === selectedItem.id && c.customization.trim() === itemNotes.trim()
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + itemQuantity
        };
        return next;
      }
      // Otherwise, add as a new cart item
      const cartId = `${selectedItem.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      return [
        ...prev,
        {
          id: cartId,
          itemId: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          image: selectedItem.image,
          quantity: itemQuantity,
          customization: itemNotes.trim()
        }
      ];
    });
    setSelectedItem(null); // Close customization popup
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PLACED':
        return 1;
      case 'ACCEPTED':
        return 2;
      case 'PREPARING':
        return 3;
      case 'READY':
        return 4;
      case 'COMPLETED':
      case 'PICKED_UP':
      case 'PAID':
        return 5;
      default:
        return 1;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PLACED':
        return 'Waiting for Acceptance';
      case 'ACCEPTED':
        return 'Order Accepted by Kitchen';
      case 'PREPARING':
        return 'Preparing in Kitchen';
      case 'READY':
        return 'Ready for Pickup! 🥡';
      case 'COMPLETED':
      case 'PICKED_UP':
      case 'PAID':
        return 'Completed & Picked Up';
      case 'CANCELLED':
        return 'Order Cancelled';
      default:
        return 'Processing';
    }
  };

  const clearTracking = () => {
    setTrackingOrderId(null);
    localStorage.removeItem('svd_active_takeaway_order_id');
  };

  return (
    <div className="w-full space-y-8 relative">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white font-logo font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce border border-emerald-500">
          <span>{successToast}</span>
          <button 
            type="button" 
            onClick={() => setSuccessToast(null)} 
            className="bg-transparent border-none text-white hover:text-neutral-100 cursor-pointer font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Live Order Tracker */}
      {trackingOrderId && (
        <div id="live-order-tracker" className="relative overflow-hidden bg-gradient-to-r from-maroon/10 via-saffron/10 to-maroon/10 p-6 rounded-3xl border border-maroon/20 dark:border-saffron/30 z-10 glass shadow-md">
          {trackedOrder ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-200/40 dark:border-neutral-800/40 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Live Order Status</span>
                  <h3 className="font-logo font-extrabold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5 mt-0.5">
                    Order ID: <span className="text-maroon dark:text-saffron">{trackedOrder.id}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-logo flex items-center gap-1.5 ${
                    trackedOrder.status === 'CANCELLED' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                      : trackedOrder.status === 'READY'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 animate-pulse'
                      : 'bg-saffron/20 text-maroon dark:text-saffron'
                  }`}>
                    {trackedOrder.status !== 'CANCELLED' && (
                      <span className={`w-2 h-2 rounded-full ${trackedOrder.status === 'READY' ? 'bg-emerald-500' : 'bg-saffron'} animate-ping`}></span>
                    )}
                    {getStatusText(trackedOrder.status)}
                  </span>
                  
                  {/* Clear tracking for completed/cancelled orders */}
                  {(trackedOrder.status === 'COMPLETED' || trackedOrder.status === 'PICKED_UP' || trackedOrder.status === 'PAID' || trackedOrder.status === 'CANCELLED') && (
                    <button 
                      onClick={clearTracking}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                      title="Clear Status Tracker"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {trackedOrder.status !== 'CANCELLED' && (
                <div className="py-2">
                  {/* Stepper Bar */}
                  <div className="relative flex justify-between items-center w-full max-w-xl mx-auto">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 -z-10"></div>
                    
                    {/* Fill line */}
                    <div 
                      className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-maroon to-saffron -translate-y-1/2 -z-10 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, (getStatusStep(trackedOrder.status) - 1) * 25))}%` }}
                    ></div>

                    {[
                      { step: 1, label: 'Placed' },
                      { step: 2, label: 'Accepted' },
                      { step: 3, label: 'Cooking' },
                      { step: 4, label: 'Ready' },
                      { step: 5, label: 'Collected' }
                    ].map(node => {
                      const currentStep = getStatusStep(trackedOrder.status);
                      const isPast = node.step < currentStep;
                      const isCurrent = node.step === currentStep;

                      return (
                        <div key={node.step} className="flex flex-col items-center gap-1.5 bg-transparent">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-black transition-all ${
                            isPast 
                              ? 'bg-maroon dark:bg-saffron text-white dark:text-maroon border-maroon dark:border-saffron scale-105' 
                              : isCurrent
                              ? 'bg-white dark:bg-bg-dark text-maroon dark:text-saffron border-maroon dark:border-saffron scale-110 shadow-md ring-4 ring-maroon/10 dark:ring-saffron/10'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700'
                          }`}>
                            {node.step}
                          </div>
                          <span className={`text-[9px] font-logo font-bold uppercase tracking-wider ${
                            isCurrent 
                              ? 'text-maroon dark:text-saffron font-black' 
                              : isPast 
                              ? 'text-neutral-700 dark:text-neutral-300' 
                              : 'text-neutral-400'
                          }`}>
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white/40 dark:bg-neutral-900/40 border border-neutral-200/20 dark:border-neutral-800/20 rounded-2xl p-3 text-xs flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-logo font-extrabold text-neutral-700 dark:text-neutral-300">
                    {trackedOrder.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </span>
                  {trackedOrder.specialNotes && (
                    <p className="text-[10px] text-neutral-500 italic">Notes: "{trackedOrder.specialNotes}"</p>
                  )}
                </div>
                <span className="font-logo font-extrabold text-neutral-800 dark:text-neutral-100 bg-neutral-100/50 dark:bg-neutral-800/50 px-2 py-1 rounded-lg">
                  ₹{trackedOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
              <span className="italic">Order #{trackingOrderId} has been created and is syncing...</span>
              <button 
                onClick={clearTracking}
                className="text-maroon dark:text-saffron font-bold underline hover:no-underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

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
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed max-w-xl mx-auto">
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
      <div className="flex flex-wrap gap-2.5 justify-center relative z-10">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedPack(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
              selectedPack === cat
                ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-md scale-102'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-maroon/20 dark:hover:border-saffron/30 hover:bg-neutral-50 dark:hover:bg-neutral-850'
            }`}
          >
            {cat === 'ALL' ? 'Show All' : cat}
          </button>
        ))}
      </div>

      {/* Parcel Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        {filteredParcels.map(item => {
          return (
            <div 
              key={item.id}
              onClick={() => !item.disabled && setBgImage(item.image)}
              className={`flex flex-col justify-between bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200/50 dark:border-neutral-800/70 overflow-hidden shadow-sm hover:shadow-lg hover:border-maroon/15 dark:hover:border-saffron/20 transition-all duration-300 relative group cursor-pointer ${item.disabled ? 'opacity-55 select-none' : ''}`}
            >
              <div className="w-full aspect-[4/3] sm:aspect-video overflow-hidden relative bg-neutral-100 dark:bg-neutral-850 flex-shrink-0">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${item.disabled ? 'grayscale' : ''}`}
                />
                
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-maroon to-red-700 dark:from-saffron dark:to-amber-500 text-white dark:text-neutral-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider font-logo shadow-md">
                    {item.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3 z-10">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border ${
                    item.type === 'veg' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-logo font-extrabold text-base text-neutral-850 dark:text-neutral-100 group-hover:text-maroon dark:group-hover:text-saffron transition-colors leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.description || 'Delicately crafted family pack served with authentic basmati rice, raita, and sherva side dishes.'}
                  </p>
                </div>
                
                <div 
                  className="pt-3 border-t border-neutral-100 dark:border-neutral-800/40 mt-3 flex items-center justify-between"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="font-logo font-extrabold text-base text-maroon dark:text-saffron bg-maroon/5 dark:bg-saffron/5 px-3 py-1 rounded-xl">
                    ₹{item.price}
                  </span>
                  
                  {item.disabled ? (
                    <span className="px-3 py-1.5 bg-red-55/10 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-[9px] rounded-xl border border-red-200 dark:border-red-900/30 uppercase tracking-wider select-none">
                      Unavailable
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleAddTakeawayItem(item)}
                      className="flex items-center gap-1 px-4 py-2 bg-maroon dark:bg-saffron text-white dark:text-maroon font-logo font-bold text-xs rounded-xl shadow-sm hover:scale-103 hover:shadow-md active:scale-97 transition-all text-center border-none cursor-pointer"
                    >
                      Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden glass animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-850 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron uppercase tracking-widest font-logo">
                  🥡 Customize Dish
                </span>
                <h3 className="font-logo font-extrabold text-base text-neutral-850 dark:text-neutral-100 mt-1">
                  {selectedItem.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="flex gap-3 bg-neutral-50 dark:bg-neutral-850/30 border border-neutral-100 dark:border-neutral-800/40 p-3 rounded-2xl">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                  <ImageWithFallback src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-logo font-bold text-xs text-neutral-850 dark:text-neutral-255 line-clamp-1">
                    {selectedItem.name}
                  </h5>
                  <span className="font-logo font-extrabold text-xs text-maroon dark:text-saffron">
                    ₹{selectedItem.price}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Quantity</label>
                <div className="flex items-center justify-between border border-neutral-200 dark:border-neutral-800 rounded-xl bg-[#1F1F1F] h-[38px] px-1">
                  <button 
                    type="button"
                    disabled={itemQuantity <= 1}
                    onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold bg-transparent border-none cursor-pointer transition-colors ${
                      itemQuantity <= 1 
                        ? 'text-[#6B7280] cursor-not-allowed' 
                        : 'text-[#F4B400] hover:bg-[#2A2A2A] hover:text-[#FFD54F]'
                    }`}
                  >
                    -
                  </button>
                  <span className="font-logo font-semibold text-base text-[#FFFFFF] px-2">
                    {itemQuantity}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setItemQuantity(prev => prev + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg font-bold bg-transparent border-none cursor-pointer transition-colors text-[#F4B400] hover:bg-[#2A2A2A] hover:text-[#FFD54F]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Special Instructions / Customization (Optional)</label>
                <input 
                  type="text" 
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  placeholder="e.g. Extra spicy, no onions, double masala"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-850 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl font-logo font-bold text-xs text-neutral-500 dark:text-neutral-450 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-maroon dark:bg-saffron text-white dark:text-maroon font-logo font-black uppercase text-xs rounded-xl shadow-md hover:scale-101 active:scale-99 transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Takeaway Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden glass animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-850 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron uppercase tracking-widest font-logo">
                  🥡 Takeaway Cart
                </span>
                <h3 className="font-logo font-extrabold text-base text-neutral-850 dark:text-neutral-100 mt-1">
                  Review &amp; Checkout
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  setSuccessOrderId(null);
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all border-none bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Cart Items List */}
                <div className="space-y-3 pr-1">
                  {takeawayCart.map(cartItem => (
                    <div 
                      key={cartItem.id} 
                      className="flex items-center justify-between bg-neutral-55/10 dark:bg-neutral-850/30 border border-neutral-200/20 dark:border-neutral-800/20 p-3 rounded-2xl animate-fade-in"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                          <ImageWithFallback src={cartItem.image} alt={cartItem.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="font-logo font-bold text-xs text-neutral-850 dark:text-neutral-200 line-clamp-1">
                            {cartItem.name}
                          </h5>
                          {cartItem.customization && (
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                              Notes: "{cartItem.customization}"
                            </p>
                          )}
                          <span className="font-logo font-extrabold text-[11px] text-maroon dark:text-saffron">
                            ₹{cartItem.price}
                          </span>
                        </div>
                      </div>
                      
                      {/* Quantity controls & Remove */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#3A3A3A] rounded-xl bg-[#1F1F1F] h-8 px-1">
                          <button 
                            type="button"
                            onClick={() => {
                              setTakeawayCart(prev => {
                                const idx = prev.findIndex(c => c.id === cartItem.id);
                                if (idx === -1) return prev;
                                const next = [...prev];
                                if (next[idx].quantity <= 1) {
                                  return prev.filter(c => c.id !== cartItem.id);
                                }
                                next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
                                return next;
                              });
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold bg-transparent border-none cursor-pointer transition-colors text-[#F4B400] hover:bg-[#2A2A2A] hover:text-[#FFD54F]"
                          >
                            -
                          </button>
                          <span className="font-logo font-semibold text-base text-[#FFFFFF] px-2 min-w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setTakeawayCart(prev => {
                                const idx = prev.findIndex(c => c.id === cartItem.id);
                                if (idx === -1) return prev;
                                const next = [...prev];
                                next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
                                return next;
                              });
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold bg-transparent border-none cursor-pointer transition-colors text-[#F4B400] hover:bg-[#2A2A2A] hover:text-[#FFD54F]"
                          >
                            +
                          </button>
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTakeawayCart(prev => prev.filter(c => c.id !== cartItem.id));
                          }}
                          className="p-1 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer hover:scale-105 transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {takeawayCart.length === 0 && (
                    <p className="text-center text-xs text-neutral-500 py-6">
                      Your takeaway cart is empty.
                    </p>
                  )}
                </div>

                {takeawayCart.length > 0 && (
                  <>
                    {/* Error Banner */}
                    {errorMsg && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 p-2.5 rounded-xl text-center text-[10px] font-bold text-red-650 dark:text-red-400">
                        {errorMsg}
                      </div>
                    )}

                    {/* Input Fields */}
                    <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Customer Name *</label>
                        <input 
                          type="text" 
                          required
                          value={customerName}
                          onChange={e => {
                            const val = e.target.value;
                            setCustomerName(val);
                            if (val.trim()) setNameError('');
                          }}
                          placeholder="Enter customer name"
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                        />
                        {nameError && (
                          <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1 animate-pulse">
                            ⚠️ {nameError}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Mobile Number *</label>
                        <input 
                          type="tel" 
                          required
                          maxLength={10}
                          value={customerPhone}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCustomerPhone(val);
                            if (val.length === 10) setPhoneError('');
                          }}
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                        />
                        {phoneError && (
                          <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1 animate-pulse">
                            ⚠️ {phoneError}
                          </p>
                        )}
                      </div>

                      {/* Delivery Address Section */}
                      <div className="border-t border-neutral-100 dark:border-neutral-850 pt-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">
                            Delivery Location *
                          </label>
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="px-2.5 py-1 text-[10px] font-bold bg-[#1F1F1F] text-[#F4B400] hover:bg-[#2A2A2A] hover:text-[#FFD54F] border border-[#3A3A3A] rounded-lg cursor-pointer flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <span>📍</span>
                            <span>{isLocating ? 'Locating...' : 'Use Current Location'}</span>
                          </button>
                        </div>

                        {/* House/Flat No. & Street/Area */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">House/Flat No. *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryHouseNo}
                              onChange={e => {
                                setDeliveryHouseNo(e.target.value);
                                if (e.target.value.trim()) setHouseNoError('');
                              }}
                              placeholder="e.g. Flat 101, H.No"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                            {houseNoError && (
                              <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1">
                                ⚠️ {houseNoError}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">Street / Area *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryStreet}
                              onChange={e => {
                                setDeliveryStreet(e.target.value);
                                if (e.target.value.trim()) setStreetError('');
                              }}
                              placeholder="e.g. Nethaji Nagar"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                            {streetError && (
                              <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1">
                                ⚠️ {streetError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Landmark & Pincode */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">Landmark (Optional)</label>
                            <input 
                              type="text" 
                              value={deliveryLandmark}
                              onChange={e => setDeliveryLandmark(e.target.value)}
                              placeholder="e.g. Near Temple"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">Pincode *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryPincode}
                              onChange={e => {
                                setDeliveryPincode(e.target.value);
                                if (e.target.value.trim()) setPincodeError('');
                              }}
                              placeholder="e.g. 521185"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                            {pincodeError && (
                              <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1">
                                ⚠️ {pincodeError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">City *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryCity}
                              onChange={e => {
                                setDeliveryCity(e.target.value);
                                if (e.target.value.trim()) setCityError('');
                              }}
                              placeholder="e.g. Nandigama"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                            {cityError && (
                              <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1">
                                ⚠️ {cityError}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">State *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryState}
                              onChange={e => {
                                setDeliveryState(e.target.value);
                                if (e.target.value.trim()) setStateError('');
                              }}
                              placeholder="e.g. Andhra Pradesh"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                            {stateError && (
                              <p className="text-[10px] text-red-500 font-bold mt-0.5 ml-1">
                                ⚠️ {stateError}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address Type */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">Address Type</label>
                          <div className="flex gap-2">
                            {(['Home', 'Work', 'Other'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setDeliveryAddressType(type)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                  deliveryAddressType === type
                                    ? 'bg-[#1F1F1F] text-[#F4B400] border-[#F4B400]'
                                    : 'bg-white text-[#111827] border-[#D1D5DB] dark:bg-neutral-900 dark:text-white dark:border-neutral-800'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Address Type textbox */}
                        {deliveryAddressType === 'Other' && (
                          <div className="space-y-1 animate-fade-in">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 dark:text-[#D1D5DB]">Custom Address Name *</label>
                            <input 
                              type="text" 
                              required
                              value={deliveryCustomAddressType}
                              onChange={e => setDeliveryCustomAddressType(e.target.value)}
                              placeholder="e.g. Friend's House, Office"
                              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Payment Mode</label>
                        <select 
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value as any)}
                          className="w-full border border-[#D1D5DB] rounded-xl bg-white text-[#111827] dark:bg-neutral-900 dark:text-white focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 cursor-pointer text-xs h-[38px] px-2.5"
                        >
                          <option value="UPI">UPI (Quick Scan)</option>
                          <option value="Cash">Cash at Counter</option>
                          <option value="Card">Card at Counter</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#D1D5DB]">Order Notes (Optional)</label>
                        <input 
                          type="text" 
                          value={orderNotes}
                          onChange={e => setOrderNotes(e.target.value)}
                          placeholder="e.g. Extra spicy, no onions"
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#D1D5DB] bg-white text-[#111827] placeholder-[#6B7280] dark:bg-neutral-900 dark:text-white dark:placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4B400] focus:ring-2 focus:ring-[#F4B400]/20 caret-[#F4B400]"
                        />
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Subtotal</span>
                      <span className="font-logo font-black text-base text-maroon dark:text-saffron bg-maroon/5 dark:bg-saffron/5 px-3 py-1 rounded-xl">
                        ₹{subtotal}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl font-logo font-bold text-xs text-neutral-500 dark:text-neutral-455 hover:bg-neutral-50 dark:hover:bg-neutral-855 transition-all bg-transparent cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-maroon dark:bg-saffron text-white dark:text-maroon font-logo font-black uppercase text-xs rounded-xl shadow-md hover:scale-101 active:scale-99 transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Send to Kitchen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
          </div>
        </div>
      )}

      {/* Dedicated Success Popup/Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl border border-neutral-200 dark:border-neutral-850 animate-scale-in">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#F4B400]/10 rounded-full flex items-center justify-center mx-auto text-[#F4B400] font-logo font-bold text-3xl animate-bounce">
              ✓
            </div>
            
            <div className="space-y-2">
              <h3 className="font-logo font-black text-xl text-neutral-850 dark:text-neutral-105">
                ✅ Order Placed Successfully!
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                Thank you for ordering from Sri Vijaya Durga Family Restaurant.
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Your order has been received and sent to our kitchen.
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-[#252525] border border-neutral-200/50 dark:border-[#333333] rounded-2xl p-4 space-y-2 text-xs text-left">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Order ID:</span>
                <span className="font-extrabold text-neutral-855 dark:text-neutral-100 font-mono">{successOrderId}</span>
              </div>
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Estimated Preparation Time:</span>
                <span className="font-bold text-[#F4B400]">20–30 Minutes</span>
              </div>
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400 border-t border-neutral-250/20 dark:border-neutral-700/25 pt-1.5 mt-1.5">
                <span>Current Status:</span>
                <span className="font-bold text-amber-500">🟡 Order Received</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowTrackingModal(true);
                }}
                className="w-full py-3 bg-[#F4B400] hover:bg-[#FFD54F] text-[#111827] font-logo font-extrabold text-xs rounded-xl shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>📦</span>
                <span>Track Order</span>
              </button>

              <button
                onClick={() => {
                  window.open(whatsappLink, 'SVDTakeawayWhatsAppWindow');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-logo font-extrabold text-xs rounded-xl shadow-md transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>📲</span>
                <span>Send Order on WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#3A3A3A] font-logo font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>🛒</span>
                  <span>Continue Ordering</span>
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 font-logo font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>❌</span>
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Floating Takeaway Cart Button */}
      {takeawayCart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-maroon dark:bg-saffron text-white dark:text-maroon p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="bg-red-650 dark:bg-maroon text-white dark:text-saffron text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
            {takeawayCart.reduce((sum, c) => sum + c.quantity, 0)}
          </span>
        </button>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && activeTrackingId && (
        <div className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-neutral-200 dark:border-neutral-850 animate-scale-in max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron uppercase tracking-widest font-logo">
                  📦 Takeaway Order Tracking
                </span>
                <h3 className="font-logo font-extrabold text-sm text-neutral-850 dark:text-neutral-100 mt-1">
                  Order ID: {activeTrackingId}
                </h3>
              </div>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all border-none bg-transparent cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live Status Tracker Banner */}
            {trackedOrder ? (
              <div className="bg-neutral-50 dark:bg-[#252525] border border-neutral-200/50 dark:border-[#333333] p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase">Current Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black font-logo ${
                    trackedOrder.status === 'CANCELLED' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                      : trackedOrder.status === 'READY'
                      ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-400 animate-pulse'
                      : 'bg-saffron/20 text-maroon dark:text-saffron'
                  }`}>
                    {getTrackingStatusText(trackedOrder.status)}
                  </span>
                </div>
                
                {/* Visual steps indicator */}
                <div className="relative pt-2 pb-1">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-maroon to-saffron -translate-y-1/2 transition-all duration-500"
                    style={{
                      width: `${
                        trackedOrder.status === 'CANCELLED' ? 0 :
                        (trackedOrder.status === 'NEW' || trackedOrder.status === 'PLACED') ? 10 :
                        trackedOrder.status === 'ACCEPTED' ? 35 :
                        trackedOrder.status === 'PREPARING' ? 60 :
                        trackedOrder.status === 'READY' ? 85 : 100
                      }%`
                    }}
                  ></div>
                  <div className="flex justify-between items-center relative z-10">
                    {['Received', 'Accepted', 'Preparing', 'Ready', 'Completed'].map((stepLabel, idx) => {
                      const stepMapping = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
                      const currentIdx = stepMapping.indexOf(trackedOrder.status);
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-black ${
                            isPast 
                              ? 'bg-maroon dark:bg-saffron text-white dark:text-maroon border-maroon dark:border-saffron'
                              : isCurrent
                              ? 'bg-white dark:bg-bg-dark text-maroon dark:text-saffron border-maroon dark:border-saffron scale-110 shadow-md ring-2 ring-maroon/10 dark:ring-saffron/10'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[8px] font-bold ${isCurrent ? 'text-maroon dark:text-saffron font-black' : 'text-neutral-400'}`}>
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-400 text-center font-medium">
                ⏳ Live connection syncing with kitchen... Status will update shortly.
              </div>
            )}

            {/* Customer & Address Details */}
            <div className="border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-4 space-y-2.5 text-xs">
              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block border-b border-neutral-150/40 dark:border-neutral-800/40 pb-1">
                Customer Details
              </span>
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-neutral-500">Customer Name:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-250 text-right">{trackedOrder?.customerName || 'Customer'}</span>
                
                <span className="text-neutral-500">Mobile Number:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-250 text-right">{trackedOrder?.customerPhone || 'N/A'}</span>
                
                <span className="text-neutral-500">Address Type:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-250 text-right">{trackedOrder?.addressType || 'Home'}</span>
                
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-250 text-right line-clamp-2">{trackedOrder?.deliveryAddress || 'N/A'}</span>

                <span className="text-neutral-500">Payment Mode:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-250 text-right">{trackedOrder?.paymentMethod || 'UPI'}</span>

                <span className="text-neutral-500">Est. Preparation Time:</span>
                <span className="font-bold text-[#F4B400] text-right">20–30 Minutes</span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-4 space-y-2.5 text-xs">
              <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block border-b border-neutral-150/40 dark:border-neutral-800/40 pb-1">
                Ordered Dishes
              </span>
              <ul className="space-y-1.5">
                {trackedOrder?.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-neutral-700 dark:text-neutral-355">
                    <span>{item.name} &times; {item.quantity}</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800/40 pt-2 mt-2 font-bold text-neutral-850 dark:text-neutral-200">
                <span>Total Amount:</span>
                <span className="text-maroon dark:text-saffron font-black text-sm">
                  ₹{trackedOrder?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowTrackingModal(false)}
              className="w-full py-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white font-logo font-bold text-xs rounded-xl transition-all cursor-pointer border-none"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* Floating Order Tracking Reopener Button */}
      {activeTrackingId && (
        <button
          onClick={() => setShowTrackingModal(true)}
          className="fixed bottom-6 left-6 z-40 bg-[#F4B400] hover:bg-[#FFD54F] text-[#111827] p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border-none cursor-pointer"
          title="Track Latest Takeaway Order"
        >
          <span>📦</span>
          <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Track Order</span>
        </button>
      )}

    </div>
  );
};

export default ParcelSection;
