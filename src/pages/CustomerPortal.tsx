import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import FloorMap from '../components/FloorMap';
import MenuSection from '../components/MenuSection';
import ParcelSection from '../components/ParcelSection';
import ReviewsSection from '../components/ReviewsSection';
import GallerySection from '../components/GallerySection';
import ContactSection from '../components/ContactSection';
import { 
  Home, Calendar, BookOpen, Truck, Copy, 
  Star, CreditCard, Send 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomerPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ activeTab, setActiveTab }) => {
  const { 
    activeTable, orders, tables, 
    upiId, addRating, settleBillAndReleaseTable 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ tableNo: string; amount: number } | null>(null);
  
  // Rating states
  const [ratingFood, setRatingFood] = useState(5);
  const [ratingService, setRatingService] = useState(5);
  const [ratingAmbience, setRatingAmbience] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingName, setRatingName] = useState('');
  const [ratingPhone, setRatingPhone] = useState('');

  // Find active order for table
  const activeOrder = activeTable 
    ? orders.find(o => o.tableNo === activeTable && o.status !== 'PAID') || null
    : null;

  // Track the last order to pre-fill feedback details
  useEffect(() => {
    if (activeOrder) {
      setRatingName(activeOrder.customerName);
      setRatingPhone(activeOrder.customerPhone);
    }
  }, [activeOrder]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '#home' : `#${tab}${activeTable ? `?table=${activeTable}` : ''}`;
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRating(
      ratingName || 'Valued Guest',
      ratingPhone || '0000000000',
      ratingFood,
      ratingService,
      ratingAmbience,
      ratingComment
    );
    setPaymentSuccessData(null);
    alert('Thank you so much for your feedback!');
    window.location.hash = '#home';
  };

  // --- BILL CALCULATIONS ---
  const calculateBill = () => {
    if (!activeOrder) return { subtotal: 0, tax: 0, service: 0, total: 0 };
    const subtotal = activeOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = 0;
    const service = 0;
    const total = subtotal;
    return { subtotal, tax, service, total };
  };

  const { total } = calculateBill();

  // Stepper helper
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  // Renders the real-time horizontal status tracker
  const renderStatusTracker = () => {
    if (!activeOrder || activeOrder.status === 'BILLING' || activeOrder.status === 'PENDING_VERIFY') return null;

    const steps = [
      { label: 'Placed', desc: 'Order placed' },
      { label: 'Cooking', desc: 'Preparing dishes' },
      { label: 'Ready', desc: 'Ready on tray' },
      { label: 'Completed', desc: 'Enjoy meal!' }
    ];

    const currentIdx = getStepIndex(activeOrder.status);

    return (
      <div className="w-full bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-5 rounded-2xl glass no-print mb-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold font-logo text-maroon dark:text-saffron">
            <span className="w-2.5 h-2.5 rounded-full bg-saffron dark:bg-maroon animate-ping"></span>
            Live Order Status
          </div>
          <span className="text-[10px] text-neutral-400 font-semibold uppercase">ID: {activeOrder.id}</span>
        </div>

        {/* Stepper tracker */}
        <div className="relative flex justify-between items-center w-full mt-2">
          {/* Horizontal line */}
          <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-800 z-0">
            <div 
              className="h-full bg-maroon dark:bg-saffron transition-all duration-500" 
              style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {steps.map((s, idx) => {
            const isCompleted = currentIdx >= idx;
            const isActive = currentIdx === idx;
            
            return (
              <div key={idx} className="flex flex-col items-center text-center z-10 space-y-1">
                <div 
                  className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border font-logo font-bold text-xs transition-all ${
                    isActive ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron scale-110 shadow-md ring-4 ring-maroon/10 dark:ring-saffron/10' :
                    isCompleted ? 'bg-emerald-500 text-white border-emerald-500' :
                    'bg-white dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {isCompleted && !isActive ? '✓' : idx + 1}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold block ${isActive ? 'text-maroon dark:text-saffron' : 'text-neutral-500'}`}>{s.label}</span>
                  <span className="text-[8px] text-neutral-400 font-medium hidden sm:block">{s.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- DEDICATED BILLING SCREEN (BLOCKED MODE) ---
  const tableObj = activeTable ? tables.find(t => t.number === activeTable) : null;
  const isBillingMode = tableObj?.status === 'PENDING' || (activeOrder && activeOrder.status === 'BILLING');

  const handleCheckoutSettle = () => {
    if (activeOrder) {
      setPaymentSuccessData({
        tableNo: activeOrder.tableNo,
        amount: total
      });
      settleBillAndReleaseTable(activeOrder.id, 'UPI');
    }
  };

  if (paymentSuccessData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Outer Premium Card with dark background */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <div className="p-6 text-center space-y-6">
            {/* Success Checkmark Ring */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-450 mx-auto border border-emerald-500/20">
              <span className="text-3xl">✅</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-logo font-extrabold text-2xl text-emerald-400 tracking-wide">Payment Successful</h3>
              <p className="text-xs text-neutral-300 font-semibold">Thank you for dining with us.</p>
            </div>

            {/* Inner Premium Dark Glass Payment Summary Card */}
            <div className="bg-neutral-950/70 border border-neutral-800 p-5 rounded-2xl shadow-inner text-left text-xs font-semibold space-y-3 max-w-sm mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Table:</span>
                <span className="text-white font-logo font-extrabold text-sm">Table {paymentSuccessData.tableNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Amount Paid:</span>
                <span className="text-amber-405 dark:text-saffron font-logo font-extrabold text-base">₹{paymentSuccessData.amount}</span>
              </div>
              <div className="border-t border-neutral-800/80 pt-3 text-[11px] text-neutral-305 font-medium text-center leading-normal">
                Your payment has been received successfully.<br />Your table has been released.
              </div>
            </div>

            <p className="text-xs font-bold text-neutral-200">Visit Again!</p>

            {/* Direct Feedback Form Embed */}
            <div className="border-t border-neutral-800 pt-6 mt-6">
              <form onSubmit={handleRatingSubmit} className="space-y-5 text-left">
                <div className="text-center space-y-1 mb-2">
                  <h4 className="font-logo font-extrabold text-sm text-white uppercase tracking-wider">Share Your Dining Experience</h4>
                  <p className="text-[10px] text-neutral-400 font-semibold">Your feedback helps us maintain premium quality standards.</p>
                </div>

                <div className="space-y-3 bg-neutral-950/50 p-4 border border-neutral-800 rounded-2xl shadow-inner">
                  {/* Food Quality */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">Food Quality:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          onClick={() => setRatingFood(star)}
                          className={`w-5 h-5 cursor-pointer transition-all duration-200 transform hover:scale-125 ${
                            ratingFood >= star 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-white hover:text-amber-405'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Service Quality */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">Service Quality:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          onClick={() => setRatingService(star)}
                          className={`w-5 h-5 cursor-pointer transition-all duration-200 transform hover:scale-125 ${
                            ratingService >= star 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-white hover:text-amber-405'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ambience */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300">Ambience:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          onClick={() => setRatingAmbience(star)}
                          className={`w-5 h-5 cursor-pointer transition-all duration-200 transform hover:scale-125 ${
                            ratingAmbience >= star 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-white hover:text-amber-405'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Review Comment</label>
                  <textarea 
                    rows={2}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Share details of your experience (optional)..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-white placeholder-neutral-500 text-xs focus:border-maroon dark:focus:border-saffron outline-none font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={ratingName}
                      onChange={(e) => setRatingName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-white placeholder-neutral-500 text-xs focus:border-maroon dark:focus:border-saffron outline-none font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Mobile Number</label>
                    <input 
                      type="tel" 
                      required
                      pattern="[0-9]{10}"
                      value={ratingPhone}
                      onChange={(e) => setRatingPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950/80 text-white placeholder-neutral-500 text-xs focus:border-maroon dark:focus:border-saffron outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-maroon to-red-700 hover:from-red-800 hover:to-maroon text-white dark:from-saffron dark:to-amber-500 dark:hover:from-amber-500 dark:hover:to-saffron dark:text-neutral-950 font-logo font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Review &amp; Return Home
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (isBillingMode && activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl shadow-xl overflow-hidden glass relative">
          <div className="h-1.5 bg-gradient-to-r from-maroon to-saffron"></div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto border border-orange-500/20 mb-2">
                <CreditCard className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-logo font-extrabold text-xl text-maroon dark:text-saffron">Dining Settlement Terminal</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Order ID: {activeOrder.id} | Table: {activeOrder.tableNo}</p>
            </div>

            {/* Receipt Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden mb-4">
              <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 text-xs font-logo font-extrabold border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                Bill Summary Details
              </div>
              <div className="p-4 space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    <span>{item.name} &times; {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Summary Totals */}
              <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-1.5 text-xs font-semibold text-neutral-500">
                <div className="flex justify-between text-sm text-neutral-800 dark:text-neutral-100 font-extrabold pt-2 border-t border-neutral-200 dark:border-neutral-800 mt-2">
                  <span>Total Amount:</span>
                  <span className="text-maroon dark:text-saffron font-logo text-base">₹{total}</span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="space-y-4 pt-2 text-center">
              <div className="space-y-1">
                <h4 className="font-logo font-extrabold text-sm text-neutral-700 dark:text-neutral-200">Scan to Pay &amp; Settle Bill</h4>
                <p className="text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-normal max-w-xs mx-auto">Scan using any UPI app (PhonePe, Google Pay, Paytm, BHIM, etc.)</p>
              </div>
              
              {/* Premium QR Graphic */}
              <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl max-w-xs mx-auto text-center space-y-3 shadow-inner">
                <img 
                  src="/phonepe_qr.png" 
                  alt="Merchant UPI Payment QR Code" 
                  className="w-48 h-48 mx-auto rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700"
                />
                <div className="space-y-1 border-t border-neutral-200 dark:border-neutral-800/60 pt-3">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">UPI Address</p>
                  <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-sm max-w-max mx-auto">
                    <code className="text-xs font-extrabold text-neutral-700 dark:text-neutral-200 font-logo">{upiId}</code>
                    <button 
                      onClick={copyUPI}
                      className="p-1 text-neutral-400 hover:text-maroon dark:hover:text-saffron transition-all"
                      title="Copy UPI Address"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copied && <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse block mt-1">UPI ID Copied to clipboard!</span>}
                </div>
              </div>

              {/* Payment instructions */}
              <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 rounded-2xl p-4 text-[10.5px] leading-relaxed text-neutral-500 dark:text-orange-300 text-left">
                <p className="font-bold mb-1">Payment Instructions:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open PhonePe, or any UPI banking app.</li>
                  <li>Scan the Merchant QR Code above, or copy the UPI ID directly.</li>
                  <li>Pay the exact amount: <strong>₹{total}</strong>.</li>
                  <li>Click <strong>"Confirm Payment"</strong> below to automatically release the table.</li>
                </ol>
              </div>

              <button 
                onClick={handleCheckoutSettle}
                className="w-full py-3.5 bg-emerald-650 hover:bg-emerald-755 text-white font-extrabold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Sticky Tab Bar */}
      <div className="bg-white dark:bg-bg-dark border-b border-maroon/5 dark:border-saffron/5 shadow-sm sticky top-[64px] z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto scrollbar-none py-1">
          <button 
            onClick={() => handleTabChange('home')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'home' 
                ? 'border-maroon text-maroon dark:border-saffron dark:text-saffron' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Home className="w-4 h-4" /> Home
          </button>
          <button 
            onClick={() => handleTabChange('booking')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'booking' 
                ? 'border-maroon text-maroon dark:border-saffron dark:text-saffron' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Dining Booking
          </button>
          <button 
            onClick={() => handleTabChange('menu')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'menu' 
                ? 'border-maroon text-maroon dark:border-saffron dark:text-saffron' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Order Menu
          </button>
          <button 
            onClick={() => handleTabChange('parcels')}
            className={`flex items-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'parcels' 
                ? 'border-maroon text-maroon dark:border-saffron dark:text-saffron' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Truck className="w-4 h-4" /> Parcels Takeaway
          </button>
        </div>
      </div>

      {/* Render Active View tab */}
      <div className="max-w-7xl mx-auto px-4 z-10 relative">
        
        {/* Render Order Stepper Tracker if they are cooking */}
        {renderStatusTracker()}

        {activeTab === 'home' && (
          <div className="space-y-12">
            <HeroSection />
            
            {/* About Us section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-8 sm:p-12 rounded-3xl glass">
              <div className="space-y-4">
                <h3 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">About Our Restaurant</h3>
                <div className="space-y-3 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                  <p>
                    <strong>Restaurant History:</strong> Sri Vijaya Durga Restaurant has been a benchmark of culinary excellence in Guntur, dedicated to serving rich signature Biryanis, Claypot Tandoori platters, and authentic North Indian curries with premium standards.
                  </p>
                  <p>
                    <strong>Special Features:</strong> We specialize in bulk catering for marriages, events, corporate events, and parties. We offer a ❄️ Fully Air Conditioned family dining hall, prompt 🛵 Home Delivery, and a completely digital QR Menu Ordering System.
                  </p>
                  <p>
                    <strong>Opening Year:</strong> Established in the year 2012 by proprietor Udarapu Navaneeth, SVD continues its legacy of "Tradition in Every Bite".
                  </p>
                </div>
              </div>
              
              <div className="h-64 sm:h-80 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative bg-neutral-100 dark:bg-neutral-800">
                <img 
                  src="/restaurant_front.jpg" 
                  alt="Sri Vijaya Durga Restaurant Front"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-bg-dark/85 backdrop-blur-md p-3 border border-neutral-700/50 rounded-xl text-white">
                  <h4 className="text-[10px] text-saffron uppercase font-bold tracking-wider">Restaurant Owner</h4>
                  <p className="text-xs font-extrabold font-logo">Udarapu Navaneeth</p>
                </div>
              </div>
            </div>

            {/* Menu Card showcase preview */}
            <div className="space-y-4 text-center">
              <h3 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Our Menu Card</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">Browse our delicious printed offerings. Scan the table QR code to place orders instantly from your mobile phone!</p>
              <div className="max-w-md mx-auto rounded-3xl border border-neutral-300 dark:border-neutral-700 overflow-hidden shadow-lg bg-white dark:bg-neutral-900">
                <img 
                  src="/menu_card.jpg" 
                  alt="Sri Vijaya Durga printed menu card cover"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <GallerySection />
            <ReviewsSection />
            <ContactSection />
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Table Reservation</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Select an available dining table in our A/C hall. No registration required.</p>
            </div>
            <FloorMap />
          </div>
        )}

        {activeTab === 'menu' && (
          <MenuSection />
        )}

        {activeTab === 'parcels' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">Takeaway Parcels</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Order premium Couple packs, Family packs, and Bucket Biryanis packed securely for takeout.</p>
            </div>
            <ParcelSection />
          </div>
        )}
      </div>



    </div>
  );
};

export default CustomerPortal;
