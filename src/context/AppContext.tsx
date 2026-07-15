import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MENU_ITEMS, PARCEL_ITEMS } from '../data/menuData';

export interface Table {
  id: string;
  number: string;
  floor: 'ground' | 'first';
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'PENDING' | 'HELD'; // AVAILABLE=Green, OCCUPIED=Red, PENDING=Orange, HELD=Purple
  bookingTimeSlot?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  isAdditional?: boolean;
  addedAt?: number;
}

export interface Order {
  id: string;
  tableNo: string;
  customerName: string;
  customerPhone: string;
  status: 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'BILLING' | 'PENDING_VERIFY' | 'PAID' | 'NEW' | 'ACCEPTED' | 'PICKED_UP' | 'CANCELLED' | 'NO_FOOD_ORDER';
  items: OrderItem[];
  timestamp: number;
  isParcel: boolean;
  specialNotes?: string;
  pickupTime?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
  addressType?: string;
  latitude?: number;
  longitude?: number;
}

export interface Invoice {
  invoiceNo: string;
  orderId: string;
  tableNo: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  timestamp: number;
  isParcel: boolean;
  paymentMethod: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  type: 'veg' | 'non-veg';
  image: string;
  description: string;
  quantity: number;
}

export interface PaymentNotification {
  id: string;
  orderId: string;
  tableNo: string;
  customerName: string;
  amount: number;
  timestamp: number;
}

export interface Rating {
  id: string;
  customerName: string;
  customerPhone: string;
  food: number;
  service: number;
  ambience: number;
  comment?: string;
  timestamp: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  location?: string;
}

export interface CmsSettings {
  restaurantName: string;
  restaurantTagline: string;
  restaurantDescription: string;
  ownerName: string;
  establishedYear: string;
  restaurantLogo: string;
  favicon: string;

  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  heroBgImage: string;

  aboutTitle: string;
  aboutHistory: string;
  aboutSpecialFeatures: string;
  aboutOpeningYear: string;
  aboutOwnerName: string;
  aboutImage: string;

  contactAddress: string;
  contactLandmark: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  googleMapsUrl: string;
  googleMapsCardImage: string;

  galleryImages: string; // JSON string
  galleryAutoSlide: boolean;
  gallerySlideInterval: number;

  menuCardTitle: string;
  menuCardDescription: string;
  menuCardCoverImage: string;
  menuPdfUrl: string;
  menuCardPages: string; // JSON string

  footerDescription: string;
  footerCopyright: string;
  facebookLink: string;
  instagramLink: string;
  youtubeLink: string;
  twitterLink: string;
  websiteLink: string;

  hoursMonday: string;
  hoursTuesday: string;
  hoursWednesday: string;
  hoursThursday: string;
  hoursFriday: string;
  hoursSaturday: string;
  hoursSunday: string;
  holidayNotice: string;

  offersList: string; // JSON string

  popupEnabled: boolean;
  popupTitle: string;
  popupDescription: string;
  popupImage: string;
  popupButtonText: string;

  seoTitle: string;
  seoMetaDescription: string;
  seoMetaKeywords: string;
  seoOgImage: string;
}

interface AppContextType {
  tables: Table[];
  orders: Order[];
  invoices: Invoice[];
  activeTable: string | null;
  cart: CartItem[];
  theme: 'dark' | 'light';
  adminSession: string | null;
  kitchenSession: string | null;
  upiId: string;
  qrCodeUrl: string;
  ratings: Rating[];
  reviews: Review[];
  menuItems: any[];
  addReview: (name: string, rating: number, message: string, status?: 'PENDING' | 'APPROVED' | 'REJECTED', location?: string) => void;
  updateReview: (id: string, name: string, rating: number, message: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', location?: string) => void;
  deleteReview: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  reserveTable: (tableNo: string, customerName: string, customerPhone: string, slot?: string) => Promise<boolean>;
  reserveTableOnly: (tableNo: string, customerName: string, customerPhone: string, slot?: string) => Promise<boolean>;
  releaseTable: (tableNo: string) => void;
  holdTable: (tableNo: string) => void;
  addToCart: (item: any) => void;
  updateCartQty: (itemId: number, change: number) => void;
  clearCart: () => void;
  placeOrder: (customerName: string, customerPhone: string, specialNotes?: string, isParcel?: boolean, pickupTime?: string) => boolean;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  settleBillAndReleaseTable: (orderId: string, paymentMethod: string) => void;
  login: (role: 'admin' | 'kitchen', email: string) => void;
  logout: (role: 'admin' | 'kitchen') => void;
  activeOrder: Order | null;
  triggerSync: () => void;
  updateUpiSettings: (newUpi: string, newQrUrl: string) => void;
  addRating: (customerName: string, customerPhone: string, food: number, service: number, ambience: number, comment?: string) => void;
  paymentNotifications: PaymentNotification[];
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  getAverageRating: () => number;
  updateMenu: (updated: any[]) => void;
  parcelItems: any[];
  updateParcelMenu: (updated: any[]) => void;
  bgImage: string | null;
  setBgImage: (img: string | null) => void;
  placeParcelOrder: (
    items: any[],
    customerName: string,
    customerPhone: string,
    specialNotes?: string,
    paymentMethod?: string,
    deliveryDetails?: {
      address: string;
      addressType: string;
      latitude?: number;
      longitude?: number;
    }
  ) => Promise<string>;
  cmsSettings: CmsSettings;
  updateCmsSettings: (settings: Partial<CmsSettings>) => Promise<boolean>;
  cmsVersions: any[];
  fetchCmsVersions: () => Promise<void>;
  restoreCmsVersion: (versionId: number) => Promise<boolean>;
  API_URL: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Expanded 25 tables layout (G1-G5 on Ground Floor, A1-A5, B1-B5, C1-C5, D1-D5 on First Floor)
const DEFAULT_TABLES: Table[] = [
  { id: 'TG1', number: 'G1', floor: 'ground', capacity: 2, status: 'AVAILABLE' },
  { id: 'TG2', number: 'G2', floor: 'ground', capacity: 4, status: 'AVAILABLE' },
  { id: 'TG3', number: 'G3', floor: 'ground', capacity: 4, status: 'AVAILABLE' },
  { id: 'TG4', number: 'G4', floor: 'ground', capacity: 6, status: 'AVAILABLE' },
  { id: 'TG5', number: 'G5', floor: 'ground', capacity: 2, status: 'AVAILABLE' },
  
  { id: 'TA1', number: 'A1', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TA2', number: 'A2', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TA3', number: 'A3', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TA4', number: 'A4', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  { id: 'TA5', number: 'A5', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  
  { id: 'TB1', number: 'B1', floor: 'first', capacity: 2, status: 'AVAILABLE' },
  { id: 'TB2', number: 'B2', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TB3', number: 'B3', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TB4', number: 'B4', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  { id: 'TB5', number: 'B5', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  
  { id: 'TC1', number: 'C1', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TC2', number: 'C2', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TC3', number: 'C3', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TC4', number: 'C4', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  { id: 'TC5', number: 'C5', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  
  { id: 'TD1', number: 'D1', floor: 'first', capacity: 2, status: 'AVAILABLE' },
  { id: 'TD2', number: 'D2', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TD3', number: 'D3', floor: 'first', capacity: 4, status: 'AVAILABLE' },
  { id: 'TD4', number: 'D4', floor: 'first', capacity: 6, status: 'AVAILABLE' },
  { id: 'TD5', number: 'D5', floor: 'first', capacity: 6, status: 'AVAILABLE' },
];

const DEFAULT_CMS_SETTINGS: CmsSettings = {
  restaurantName: "Sri Vijaya Durga Restaurant",
  restaurantTagline: "Family AC Restaurant",
  restaurantDescription: "Sri Vijaya Durga Family AC Restaurant serves delicious, authentic Indian cuisine in a warm, welcoming family environment.",
  ownerName: "Sri Vijaya Durga Team",
  establishedYear: "2018",
  restaurantLogo: "/logo17.jpg",
  favicon: "/logo17.jpg",

  heroTitle: "Experience Authentic Flavors",
  heroSubtitle: "Welcome to Sri Vijaya Durga",
  heroDescription: "Indulge in our exquisite collection of family recipe biryanis, tandooris, and authentic meals prepared with passion.",
  primaryButtonText: "View Dining Menu",
  primaryButtonUrl: "#menu",
  secondaryButtonText: "Order Takeaway",
  secondaryButtonUrl: "#parcels",
  heroBgImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",

  aboutTitle: "Our Culinary Journey",
  aboutHistory: "Established with a vision to serve premium quality food, Sri Vijaya Durga has become a landmark for fine dining. Our master chefs bring decades of expertise to your table.",
  aboutSpecialFeatures: "AC Dining Hall, Family Cabins, Live Catering Services, Takeaway Counter",
  aboutOpeningYear: "2018",
  aboutOwnerName: "SVD Management Team",
  aboutImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",

  contactAddress: "Beside TTD Kalyana Mandapam, Vijaya talkies Road, Nandigama",
  contactLandmark: "Beside TTD Kalyana Mandapam",
  primaryPhone: "9966315544",
  secondaryPhone: "9030121200",
  whatsappNumber: "9030121200",
  contactEmail: "info@srivijayadurga.com",
  googleMapsUrl: "https://maps.app.goo.gl/qAypkmgzgzxfD6ND8?g_st=aw",
  googleMapsCardImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600",

  galleryImages: JSON.stringify([
    { id: 1, url: "/gallery_0.jpg", caption: "Sri Vijaya Durga Restaurant Front View (Evening lights)" },
    { id: 2, url: "/gallery_1.jpg", caption: "Sri Vijaya Durga Restaurant Entrance and AC Hall front" },
    { id: 3, url: "/gallery_2.jpg", caption: "Premium AC Dining Hall interior with family guests" },
    { id: 4, url: "/gallery_3.jpg", caption: "Cashier Terminal desk and POS billing portal counter" },
    { id: 5, url: "/gallery_4.jpg", caption: "Comfortable family dining cabins and beverage chilling station" }
  ]),
  galleryAutoSlide: true,
  gallerySlideInterval: 3,

  menuCardTitle: "Our Signature Menu",
  menuCardDescription: "Explore our rich variety of authentic dishes compiled in our physical menu card.",
  menuCardCoverImage: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=80&w=800",
  menuPdfUrl: "",
  menuCardPages: JSON.stringify([
    { id: 1, url: "/menu_card_page_1.png" },
    { id: 2, url: "/menu_card_page_2.png" },
    { id: 3, url: "/menu_card_page_3.png" },
    { id: 4, url: "/menu_card_page_4.png" },
    { id: 5, url: "/menu_card_page_5.png" },
    { id: 6, url: "/menu_card_page_6.png" },
    { id: 7, url: "/menu_card_page_7.png" },
    { id: 8, url: "/menu_card_page_8.png" }
  ]),

  footerDescription: "Serving happiness and authentic family hospitality since 2018.",
  footerCopyright: "© 2026 Sri Vijaya Durga Restaurant. All Rights Reserved.",
  facebookLink: "https://facebook.com",
  instagramLink: "https://instagram.com",
  youtubeLink: "https://youtube.com",
  twitterLink: "https://twitter.com",
  websiteLink: "https://srivijayadurga.com",

  hoursMonday: "11:00 AM - 11:00 PM",
  hoursTuesday: "11:00 AM - 11:00 PM",
  hoursWednesday: "11:00 AM - 11:00 PM",
  hoursThursday: "11:00 AM - 11:00 PM",
  hoursFriday: "11:00 AM - 11:00 PM",
  hoursSaturday: "11:00 AM - 11:00 PM",
  hoursSunday: "11:00 AM - 11:00 PM",
  holidayNotice: "Open All Days",

  offersList: JSON.stringify([
    { id: 1, title: "Weekend Family Feast Offer", description: "Get a free dessert on family orders above ₹1000. Valid Fri-Sun.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500", couponCode: "FEAST10", isActive: true },
    { id: 2, title: "First Takeaway Discount", description: "10% Flat discount on your first takeaway order placed via QR portal.", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=500", couponCode: "PARCEL10", isActive: true }
  ]),

  popupEnabled: false,
  popupTitle: "Festive Season Hours",
  popupDescription: "Enjoy delicious food at Sri Vijaya Durga. Extended dining hall hours till midnight during the festive week!",
  popupImage: "",
  popupButtonText: "Explore Menu",

  seoTitle: "Sri Vijaya Durga - Best Family AC Restaurant in Nandigama",
  seoMetaDescription: "Welcome to Sri Vijaya Durga Restaurant. Taste the best biryani, tandoori, and authentic Indian family cuisines in Nandigama.",
  seoMetaKeywords: "Sri Vijaya Durga, Nandigama Restaurant, AC Restaurant, Best Biryani",
  seoOgImage: ""
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDev = import.meta.env.DEV;
  const API_URL = isDev ? `http://${window.location.hostname}:3002` : '';

  // --- STATE ---
  const [tables, setTables] = useState<Table[]>(() => {
    const stored = localStorage.getItem('svd_tables');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasG1 = parsed.some((t: any) => t.number === 'G1');
        if (!hasG1) {
          localStorage.setItem('svd_tables', JSON.stringify(DEFAULT_TABLES));
          return DEFAULT_TABLES;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_TABLES;
      }
    }
    return DEFAULT_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const stored = localStorage.getItem('svd_invoices');
    return stored ? JSON.parse(stored) : [];
  });

  const [upiId, setUpiId] = useState<string>(() => {
    const stored = localStorage.getItem('svd_upi_id');
    return stored || '9030121200-2@ybl';
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>(() => {
    const stored = localStorage.getItem('svd_qr_url');
    if (!stored || stored.includes('payment_qr_') || stored === '/phonepe_qr.jpg') {
      localStorage.setItem('svd_qr_url', '/phonepe_qr.png');
      return '/phonepe_qr.png';
    }
    return stored;
  });

  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>(() => {
    const stored = localStorage.getItem('svd_payment_notifications');
    return stored ? JSON.parse(stored) : [];
  });

  const [ratings, setRatings] = useState<Rating[]>(() => {
    const stored = localStorage.getItem('svd_ratings');
    return stored ? JSON.parse(stored) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('svd_reviews');
    if (stored) return JSON.parse(stored);
    
    const defaultReviews: Review[] = [
      {
        id: 'REV-1',
        name: 'Sayyad Shama Ruksar',
        rating: 5,
        message: 'Excellent food with authentic taste and fresh ingredients. The service was quick, and the staff were very welcoming. A great place to enjoy a family meal.',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      },
      {
        id: 'REV-2',
        name: 'Joel R.',
        rating: 5,
        message: 'One of the best restaurants in the area. The biryani was flavorful, the portions were generous, and the prices were very reasonable. Highly recommended.',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      },
      {
        id: 'REV-3',
        name: 'Praisy R.',
        rating: 5,
        message: "I've visited multiple times, and the quality has always been consistent. Clean environment, polite staff, and delicious food make this my go-to restaurant.",
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      },
      {
        id: 'REV-4',
        name: 'Pardhu S.',
        rating: 4,
        message: 'Very good dining experience. The starters were amazing, and the main course was served hot and fresh. The ambience is comfortable and family-friendly.',
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      },
      {
        id: 'REV-5',
        name: 'Mahita P.',
        rating: 5,
        message: 'Great value for money! The food tasted homemade, the service was prompt, and the restaurant was well maintained. Will definitely visit again.',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      },
      {
        id: 'REV-6',
        name: 'Veda Jasmitha',
        rating: 5,
        message: 'A wonderful place for lunch and dinner. Every dish we ordered was tasty, and the staff ensured we had a pleasant experience throughout our visit.',
        timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        status: 'APPROVED'
      }
    ];
    localStorage.setItem('svd_reviews', JSON.stringify(defaultReviews));
    return defaultReviews;
  });

  const [menuItems, setMenuItems] = useState<any[]>(() => {
    const stored = localStorage.getItem('svd_menu_items');
    if (!stored) return MENU_ITEMS;
    try {
      const parsed = JSON.parse(stored);
      const merged = [...parsed];
      MENU_ITEMS.forEach(defItem => {
        const idx = merged.findIndex(i => i.id === defItem.id || i.name === defItem.name);
        if (idx === -1) {
          merged.push(defItem);
        } else {
          merged[idx] = { ...defItem, ...merged[idx], price: defItem.price, category: defItem.category, name: defItem.name };
        }
      });
      return merged;
    } catch {
      return MENU_ITEMS;
    }
  });

  const [parcelItems, setParcelItems] = useState<any[]>(() => {
    const stored = localStorage.getItem('svd_parcel_items');
    if (!stored) return PARCEL_ITEMS;
    try {
      const parsed = JSON.parse(stored);
      const merged = [...parsed];
      PARCEL_ITEMS.forEach(defItem => {
        const idx = merged.findIndex(i => i.id === defItem.id || i.name === defItem.name);
        if (idx === -1) {
          merged.push(defItem);
        } else {
          merged[idx] = { ...defItem, ...merged[idx], price: defItem.price, category: defItem.category, name: defItem.name };
        }
      });
      return merged;
    } catch {
      return PARCEL_ITEMS;
    }
  });

  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bgImage, setBgImage] = useState<string | null>('/hero_background.png');
  
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });

  const [adminSession, setAdminSession] = useState<string | null>(() => sessionStorage.getItem('svd_session_admin'));
  const [kitchenSession, setKitchenSession] = useState<string | null>(() => sessionStorage.getItem('svd_session_kitchen'));
  const tablesRef = React.useRef(tables);
  const ordersRef = React.useRef(orders);
  const paymentNotificationsRef = React.useRef(paymentNotifications);
  const [cmsSettings, setCmsSettings] = useState<CmsSettings>(DEFAULT_CMS_SETTINGS);
  const [cmsVersions, setCmsVersions] = useState<any[]>([]);

  // Fetch settings and versions on startup
  useEffect(() => {
    fetch(`${API_URL}/api/cms`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setCmsSettings(data.settings);
        }
      })
      .catch(err => console.error('Failed to load CMS settings:', err));

    fetchCmsVersions();
  }, []);

  // Socket listener for real-time cms-updated events
  useEffect(() => {
    const socket = io();
    socket.on('cms-updated', (updatedSettings: CmsSettings) => {
      setCmsSettings(updatedSettings);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Apply SEO, Title, Favicon dynamically
  useEffect(() => {
    if (cmsSettings.seoTitle) {
      document.title = cmsSettings.seoTitle;
    }
    
    // Favicon link element updating
    const faviconUrl = cmsSettings.favicon || '/favicon.ico';
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;

    // Meta Description updating
    let metaDesc: HTMLMetaElement | null = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.getElementsByTagName('head')[0].appendChild(metaDesc);
    }
    metaDesc.content = cmsSettings.seoMetaDescription || '';

    // Meta Keywords updating
    let metaKeywords: HTMLMetaElement | null = document.querySelector("meta[name='keywords']");
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    metaKeywords.content = cmsSettings.seoMetaKeywords || '';
  }, [cmsSettings.seoTitle, cmsSettings.favicon, cmsSettings.seoMetaDescription, cmsSettings.seoMetaKeywords]);

  // Update CMS
  const updateCmsSettings = async (settingsToUpdate: Partial<CmsSettings>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/cms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settingsToUpdate,
          author: adminSession || 'admin@srivijayadurga.com'
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCmsSettings(data.settings);
          fetchCmsVersions();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to save CMS settings:', err);
      return false;
    }
  };

  // Fetch CMS versions history
  const fetchCmsVersions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cms/versions`);
      const data = await res.json();
      if (data.success) {
        setCmsVersions(data.versions);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    }
  };

  // Restore CMS version
  const restoreCmsVersion = async (versionId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/cms/versions/${versionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: adminSession || `Restored version #${versionId}`
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCmsSettings(data.settings);
          fetchCmsVersions();
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to restore CMS version:', err);
      return false;
    }
  };
  const socketRef = React.useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(isDev ? `http://${window.location.hostname}:3002` : undefined, { 
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity
    });
    
    fetch(`${API_URL}/api/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log('[Kitchen Fetch Response] Loaded initial orders from backend');
          setOrders(data);
        } else {
          console.warn('[Kitchen Fetch Response] Backend returned non-array:', data);
        }
      })
      .catch(err => console.error('Failed to fetch orders:', err));

    fetch(`${API_URL}/api/tables`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log('[Table Fetch Response] Loaded initial tables from backend');
          setTables(data);
          localStorage.setItem('svd_tables', JSON.stringify(data));
        }
      })
      .catch(err => console.error('Failed to fetch tables:', err));

    socketRef.current.on('table_updated', (updatedTable: Table) => {
      console.log('[Realtime Events] Received table_updated:', updatedTable.number, updatedTable.status);
      setTables(prev => {
        const next = prev.map(t => t.number === updatedTable.number ? updatedTable : t);
        localStorage.setItem('svd_tables', JSON.stringify(next));
        return next;
      });
    });

    socketRef.current.on('tables_synced', (syncedTables: Table[]) => {
      console.log('[Realtime Events] Received tables_synced:', syncedTables.length);
      setTables(syncedTables);
      localStorage.setItem('svd_tables', JSON.stringify(syncedTables));
    });

    socketRef.current.on('new-order', (newOrder: Order) => {
      console.log('[Realtime Events] Received new-order:', newOrder.id);
      setOrders(prev => {
        if (!prev.find(o => o.id === newOrder.id)) return [...prev, newOrder];
        return prev;
      });
    });

    socketRef.current.on('order_updated', (updatedOrder: Order) => {
      console.log('[Realtime Events] Received order_updated:', updatedOrder.id);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    socketRef.current.on('orders_synced', (syncedOrders: Order[]) => {
      setOrders(syncedOrders);
    });

    socketRef.current.on('new_notification', (notification: PaymentNotification) => {
      console.log('[Realtime Events] Received new_notification:', notification.id);
      setPaymentNotifications(prev => {
        if (!prev.find(n => n.id === notification.id)) return [notification, ...prev];
        return prev;
      });
    });

    socketRef.current.on('menu-updated', (data: { dineIn: any[], takeaway: any[] }) => {
      console.log('[Realtime Events] Received menu-updated:', data);
      if (data.dineIn) {
        setMenuItems(data.dineIn);
        localStorage.setItem('svd_menu_items', JSON.stringify(data.dineIn));
      }
      if (data.takeaway) {
        setParcelItems(data.takeaway);
        localStorage.setItem('svd_parcel_items', JSON.stringify(data.takeaway));
      }
    });

    socketRef.current.on('new-review', (newRev: Review) => {
      setReviews(prev => {
        if (!prev.find(r => r.id === newRev.id)) {
          const updated = [newRev, ...prev];
          localStorage.setItem('svd_reviews', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    });

    socketRef.current.on('review-updated', (updatedRev: Review) => {
      setReviews(prev => {
        const updated = prev.map(r => r.id === updatedRev.id ? updatedRev : r);
        localStorage.setItem('svd_reviews', JSON.stringify(updated));
        return updated;
      });
    });

    socketRef.current.on('review-deleted', (deletedId: string) => {
      setReviews(prev => {
        const updated = prev.filter(r => r.id !== deletedId);
        localStorage.setItem('svd_reviews', JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // Load menu items from server on startup
  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.dineIn && data.takeaway) {
          if (data.dineIn.length > 0) {
            setMenuItems(data.dineIn);
            localStorage.setItem('svd_menu_items', JSON.stringify(data.dineIn));
          } else {
            // Server is empty, initialize it with current client-side defaults
            fetch(`${API_URL}/api/menu`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dineIn: menuItems, takeaway: parcelItems })
            }).catch(err => console.error('Failed to initialize server menu:', err));
          }

          if (data.takeaway.length > 0) {
            setParcelItems(data.takeaway);
            localStorage.setItem('svd_parcel_items', JSON.stringify(data.takeaway));
          }
        }
      })
      .catch(err => console.error('Failed to load menu items from backend:', err));

    // Load reviews on startup
    fetch(`${API_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.reviews) {
          setReviews(data.reviews);
          localStorage.setItem('svd_reviews', JSON.stringify(data.reviews));
        }
      })
      .catch(err => console.error('Failed to load reviews from server:', err));
  }, []);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    paymentNotificationsRef.current = paymentNotifications;
  }, [paymentNotifications]);

  // --- PARSE TABLE FROM URL HASH ---
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash || '#home';
      const parts = hash.split('?');
      if (parts[1]) {
        const queryParams = new URLSearchParams(parts[1]);
        const table = queryParams.get('table');
        if (table) {
          setActiveTable(table);
        }
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // --- LOAD CART WHEN ACTIVE TABLE CHANGES ---
  useEffect(() => {
    if (activeTable) {
      const stored = localStorage.getItem(`svd_cart_T${activeTable}`);
      const parsedCart = stored ? JSON.parse(stored) : [];
      
      // Sync cart with active order items
      const activeOrd = orders.find(o => o.tableNo === activeTable && o.status !== 'PAID');
      if (activeOrd) {
        const syncedCart = [...parsedCart];
        
        // Sum quantities of same items (both non-additional and additional)
        const orderQtyMap: { [key: number]: number } = {};
        activeOrd.items.forEach(ordItem => {
          orderQtyMap[ordItem.id] = (orderQtyMap[ordItem.id] || 0) + ordItem.quantity;
        });

        Object.entries(orderQtyMap).forEach(([idStr, orderedQty]) => {
          const id = Number(idStr);
          const cartIdx = syncedCart.findIndex(c => c.id === id);
          if (cartIdx > -1) {
            syncedCart[cartIdx].quantity = Math.max(syncedCart[cartIdx].quantity, orderedQty);
          } else {
            const menuItem = menuItems.find(m => m.id === id);
            syncedCart.push({
              id,
              name: menuItem?.name || 'Item',
              price: menuItem?.price || 0,
              category: menuItem?.category || 'Other',
              type: menuItem?.type || 'veg',
              image: menuItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300',
              description: menuItem?.description || '',
              quantity: orderedQty
            });
          }
        });
        setCart(syncedCart);
      } else {
        setCart(parsedCart);
      }
    } else {
      setCart([]);
    }
  }, [activeTable, orders, menuItems]);

  // --- THEME SYNC ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- LOCALSTORAGE PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('svd_tables', JSON.stringify(tables));
  }, [tables]);



  useEffect(() => {
    localStorage.setItem('svd_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('svd_upi_id', upiId);
  }, [upiId]);

  useEffect(() => {
    localStorage.setItem('svd_qr_url', qrCodeUrl);
  }, [qrCodeUrl]);

  useEffect(() => {
    localStorage.setItem('svd_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('svd_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('svd_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('svd_parcel_items', JSON.stringify(parcelItems));
  }, [parcelItems]);

  useEffect(() => {
    localStorage.setItem('svd_payment_notifications', JSON.stringify(paymentNotifications));
  }, [paymentNotifications]);

  useEffect(() => {
    if (activeTable && cart.length > 0) {
      localStorage.setItem(`svd_cart_T${activeTable}`, JSON.stringify(cart));
    } else if (activeTable && cart.length === 0) {
      localStorage.removeItem(`svd_cart_T${activeTable}`);
    }
  }, [cart, activeTable]);

  // --- SYNC CART WITH LIVE MENU CHANGES ---
  useEffect(() => {
    setCart(prevCart => {
      if (prevCart.length === 0) return prevCart;
      let changed = false;
      const updatedCart = prevCart.map(cartItem => {
        const match = menuItems.find(m => m.id === cartItem.id);
        if (match && (
          cartItem.price !== match.price || 
          cartItem.name !== match.name || 
          cartItem.image !== match.image ||
          cartItem.description !== match.description ||
          cartItem.category !== match.category ||
          cartItem.type !== match.type
        )) {
          changed = true;
          return {
            ...cartItem,
            price: match.price,
            name: match.name,
            image: match.image,
            description: match.description,
            category: match.category,
            type: match.type
          };
        }
        return cartItem;
      });
      return changed ? updatedCart : prevCart;
    });
  }, [menuItems]);

  // --- BROADCAST SYNC EVENTS ---
  // We use BroadcastChannel to sync localStorage data (Tables, Menu, Invoices) across tabs instantly.
  // We DO NOT sync Orders here because Orders are handled robustly via Socket.io events.

  const syncChannel = React.useMemo(() => new BroadcastChannel('svd_restaurant_sync'), []);




  const triggerSync = () => {
    syncChannel.postMessage('sync');
  };

  useEffect(() => {
    const handleSync = (e: MessageEvent) => {
      if (e.data === 'sync') {
        const storedInvoices = localStorage.getItem('svd_invoices');
        const storedUpi = localStorage.getItem('svd_upi_id');
        const storedQr = localStorage.getItem('svd_qr_url');
        const storedRatings = localStorage.getItem('svd_ratings');
        const storedMenuItems = localStorage.getItem('svd_menu_items');
        const storedParcelItems = localStorage.getItem('svd_parcel_items');
        const storedNotifications = localStorage.getItem('svd_payment_notifications');
        
        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
        if (storedUpi) setUpiId(storedUpi);
        if (storedQr) setQrCodeUrl(storedQr);
        if (storedRatings) setRatings(JSON.parse(storedRatings));
        const storedReviews = localStorage.getItem('svd_reviews');
        if (storedReviews) setReviews(JSON.parse(storedReviews));
        if (storedMenuItems) setMenuItems(JSON.parse(storedMenuItems));
        if (storedParcelItems) setParcelItems(JSON.parse(storedParcelItems));
        if (storedNotifications) setPaymentNotifications(JSON.parse(storedNotifications));

        // Note: Orders are INTENTIONALLY ignored here. Socket.io 'new-order' handles them.
      }
    };
    syncChannel.addEventListener('message', handleSync);
    return () => syncChannel.removeEventListener('message', handleSync);
  }, [syncChannel]);

  // --- ACTIVE ORDER SELECTOR ---
  const activeOrder = activeTable 
    ? orders.find(o => o.tableNo === activeTable && o.status !== 'PAID') || null
    : null;

  // --- THEME MUTATOR ---
  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
  };

  // --- TABLE ACTIONS ---
  const reserveTable = async (tableNo: string, customerName: string, customerPhone: string, slot?: string) => {
    const table = tables.find(t => t.number === tableNo);
    if (!table || table.status !== 'AVAILABLE') return false;
    
    const nextTable = {
      ...table,
      status: 'OCCUPIED' as const,
      bookingTimeSlot: slot || null,
      customerName,
      customerPhone
    };
    
    try {
      const res = await fetch(`${API_URL}/api/tables/${tableNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTable)
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Failed to reserve table:', err);
      return false;
    }
  };

  const reserveTableOnly = async (tableNo: string, customerName: string, customerPhone: string, slot?: string) => {
    const table = tables.find(t => t.number === tableNo);
    if (!table || table.status !== 'AVAILABLE') return false;
    
    const nextTable = {
      ...table,
      status: 'OCCUPIED' as const,
      bookingTimeSlot: slot || null,
      customerName,
      customerPhone
    };
    
    const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order = {
      id: newOrderId,
      tableNo,
      customerName,
      customerPhone,
      status: 'NO_FOOD_ORDER',
      items: [],
      timestamp: Date.now(),
      isParcel: false,
      specialNotes: 'Table Reservation Only (No Food Order)'
    };

    try {
      await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      const res = await fetch(`${API_URL}/api/tables/${tableNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTable)
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Failed to reserve table only:', err);
      return false;
    }
  };

  const releaseTable = async (tableNo: string) => {
    const table = tables.find(t => t.number === tableNo);
    if (!table) return;
    
    const nextTable = {
      ...table,
      status: 'AVAILABLE' as const,
      bookingTimeSlot: null,
      customerName: null,
      customerPhone: null
    };

    try {
      await fetch(`${API_URL}/api/tables/${tableNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTable)
      });
      
      const activeOrd = orders.find(o => o.tableNo === tableNo && o.status !== 'PAID');
      if (activeOrd) {
        const nextOrder = { ...activeOrd, status: 'PAID' as const };
        await fetch(`${API_URL}/api/orders/${activeOrd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOrder)
        });
      }
    } catch (err) {
      console.error('Failed to release table:', err);
    }

    if (activeTable === tableNo) {
      setCart([]);
    }
    localStorage.removeItem(`svd_cart_T${tableNo}`);
  };

  const holdTable = async (tableNo: string) => {
    const table = tables.find(t => t.number === tableNo);
    if (!table) return;
    
    let nextStatus: Table['status'] = 'HELD';
    if (table.status === 'HELD') {
      nextStatus = table.customerName ? 'OCCUPIED' : 'AVAILABLE';
    }
    
    const nextTable = {
      ...table,
      status: nextStatus
    };

    try {
      await fetch(`${API_URL}/api/tables/${tableNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTable)
      });
    } catch (err) {
      console.error('Failed to hold table:', err);
    }
  };


  // --- SETTINGS ACTIONS ---
  const updateUpiSettings = (newUpi: string, newQrUrl: string) => {
    localStorage.setItem('svd_upi_id', newUpi);
    localStorage.setItem('svd_qr_url', newQrUrl);
    setUpiId(newUpi);
    setQrCodeUrl(newQrUrl);
    triggerSync();
  };

  const addRating = (customerName: string, customerPhone: string, food: number, service: number, ambience: number, comment?: string) => {
    const newRating: Rating = {
      id: 'RTG-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName,
      customerPhone,
      food,
      service,
      ambience,
      comment,
      timestamp: Date.now()
    };
    const updated = [...ratings, newRating];
    localStorage.setItem('svd_ratings', JSON.stringify(updated));
    setRatings(updated);
    triggerSync();
  };

  const addReview = (name: string, rating: number, message: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING', location?: string) => {
    const newReview: Review = {
      id: 'REV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name,
      rating,
      message,
      timestamp: Date.now(),
      status,
      location: location || ""
    };
    
    // Update local state immediately
    setReviews(prev => {
      const updated = [newReview, ...prev];
      localStorage.setItem('svd_reviews', JSON.stringify(updated));
      return updated;
    });
    triggerSync();

    // Call backend API
    fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    }).catch(err => console.error('Failed to create review on backend:', err));
  };

  const updateReview = (id: string, name: string, rating: number, message: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', location?: string) => {
    // Update local state immediately
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, name, rating, message, status, location } : r);
      localStorage.setItem('svd_reviews', JSON.stringify(updated));
      return updated;
    });
    triggerSync();

    // Call backend API
    fetch(`${API_URL}/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating, message, status, location })
    }).catch(err => console.error('Failed to update review on backend:', err));
  };

  const deleteReview = (id: string) => {
    // Update local state immediately
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('svd_reviews', JSON.stringify(updated));
      return updated;
    });
    triggerSync();

    // Call backend API
    fetch(`${API_URL}/api/reviews/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Failed to delete review on backend:', err));
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 4.8;
    const total = ratings.reduce((sum, r) => sum + (r.food + r.service + r.ambience) / 3, 0);
    return Math.round((total / ratings.length) * 10) / 10;
  };

  const updateMenu = (newMenu: any[]) => {
    localStorage.setItem('svd_menu_items', JSON.stringify(newMenu));
    setMenuItems(newMenu);
    triggerSync();
    fetch(`${API_URL}/api/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dineIn: newMenu, takeaway: parcelItems })
    }).catch(err => console.error('Failed to sync menu with server:', err));
  };

  const updateParcelMenu = (newMenu: any[]) => {
    localStorage.setItem('svd_parcel_items', JSON.stringify(newMenu));
    setParcelItems(newMenu);
    triggerSync();
    fetch(`${API_URL}/api/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dineIn: menuItems, takeaway: newMenu })
    }).catch(err => console.error('Failed to sync parcel menu with server:', err));
  };

  // --- CART ACTIONS ---
  const addToCart = (item: any) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        // Create a new object reference to avoid React StrictMode double mutation
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQty = (itemId: number, change: number) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === itemId);
      if (idx === -1) return prev;
      
      const activeOrd = orders.find(o => o.tableNo === activeTable && o.status !== 'PAID');
      const orderedQty = activeOrd?.items.find(i => i.id === itemId)?.quantity || 0;

      const next = [...prev];
      const newQty = next[idx].quantity + change;
      
      if (newQty <= 0 || (change < 0 && newQty < orderedQty)) {
        if (orderedQty > 0) {
          // Create a new object reference
          next[idx] = { ...next[idx], quantity: orderedQty };
          return next;
        }
        return prev.filter(c => c.id !== itemId);
      }
      
      // Create a new object reference to avoid StrictMode double mutation
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- ORDER PLACEMENT ---
  const placeOrder = (customerName: string, customerPhone: string, specialNotes?: string, isParcel = false, pickupTime?: string) => {
    if (cart.length === 0) return false;

    const activeOrd = orders.find(o => o.tableNo === activeTable && o.status !== 'PAID');

    if (activeOrd) {
      // Append or update items in existing active order
      const updatedItems = [...activeOrd.items];
      cart.forEach(cartItem => {
        // Quantities that are already in the order (excluding any additional items from this exact session)
        const existingIdx = updatedItems.findIndex(i => i.id === cartItem.id && !i.isAdditional);
        const orderedQty = existingIdx > -1 ? updatedItems[existingIdx].quantity : 0;
        
        if (cartItem.quantity > orderedQty) {
          const additionalQty = cartItem.quantity - orderedQty;
          
          const addIdx = updatedItems.findIndex(i => i.id === cartItem.id && i.isAdditional);
          if (addIdx > -1) {
            updatedItems[addIdx].quantity = additionalQty;
            updatedItems[addIdx].addedAt = Date.now();
          } else {
            updatedItems.push({
              id: cartItem.id,
              name: cartItem.name,
              price: cartItem.price,
              quantity: additionalQty,
              isAdditional: true,
              addedAt: Date.now()
            });
          }
        }
      });

      const updatedOrder = {
        ...activeOrd,
        items: updatedItems,
        status: 'PLACED' as const,
        timestamp: Date.now(),
        specialNotes: specialNotes || activeOrd.specialNotes
      };

      fetch(`${API_URL}/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder)
      });

      setOrders(prev => prev.map(o => o.id === activeOrd.id ? updatedOrder : o));

      if (activeTable) {
        const table = tables.find(t => t.number === activeTable);
        if (table && table.status !== 'OCCUPIED') {
          const nextTable = { ...table, status: 'OCCUPIED' as const };
          fetch(`${API_URL}/api/tables/${activeTable}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextTable)
          }).catch(err => console.error('Failed to update table status:', err));
        }
      }
    } else {
      // Create new order
      const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newOrder: Order = {
        id: newOrderId,
        tableNo: activeTable || 'Takeaway',
        customerName,
        customerPhone,
        status: 'PLACED',
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        timestamp: Date.now(),
        isParcel,
        specialNotes,
        pickupTime
      };

      fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });

      setOrders(prev => {
        if (prev.some(o => o.id === newOrderId)) return prev;
        return [...prev, newOrder];
      });

      if (activeTable) {
        const table = tables.find(t => t.number === activeTable);
        if (table && table.status !== 'OCCUPIED') {
          const nextTable = { ...table, status: 'OCCUPIED' as const };
          fetch(`${API_URL}/api/tables/${activeTable}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextTable)
          }).catch(err => console.error('Failed to update table status:', err));
        }
      }
    }

    return true;
  };

  const placeParcelOrder = async (
    items: any[],
    customerName: string,
    customerPhone: string,
    specialNotes?: string,
    paymentMethod?: string,
    deliveryDetails?: {
      address: string;
      addressType: string;
      latitude?: number;
      longitude?: number;
    }
  ) => {
    const newOrderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order & { deliveryAddress?: string; addressType?: string; latitude?: number; longitude?: number } = {
      id: newOrderId,
      tableNo: 'Takeaway',
      customerName,
      customerPhone,
      status: 'NEW',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      timestamp: Date.now(),
      isParcel: true,
      specialNotes,
      paymentMethod,
      deliveryAddress: deliveryDetails?.address,
      addressType: deliveryDetails?.addressType,
      latitude: deliveryDetails?.latitude,
      longitude: deliveryDetails?.longitude
    };

    console.log('[placeParcelOrder] Attempting to place order:', newOrder);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[placeParcelOrder] Server response error:', response.status, errorText);
        let serverErrorMsg = 'Failed to create order on server';
        try {
          const parsed = JSON.parse(errorText);
          serverErrorMsg = parsed.error || parsed.message || serverErrorMsg;
        } catch (e) {}
        throw new Error(serverErrorMsg);
      }
      
      const savedOrder = await response.json();
      console.log('[placeParcelOrder] Order created successfully:', savedOrder);
      
      if (savedOrder && savedOrder.success) {
        const orderToSave = savedOrder.order || newOrder;
        setOrders(prev => {
          if (prev.some(o => o.id === orderToSave.id)) return prev;
          return [...prev, orderToSave];
        });
        triggerSync();
        return orderToSave.id;
      } else {
        const errorMsg = (savedOrder && savedOrder.error) ? savedOrder.error : 'Failed to create order on server';
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('[placeParcelOrder] Connection or database error:', err);
      throw err;
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const nextOrders = orders.map(o => {
      if (o.id === orderId) {
        const nextOrder = { ...o, status };
        
        // If order status advances to PREPARING, map table status to occupied
        if (status === 'PREPARING' && o.tableNo !== 'Takeaway') {
          const table = tables.find(t => t.number === o.tableNo);
          if (table && table.status !== 'OCCUPIED') {
            const nextTable = { ...table, status: 'OCCUPIED' as const };
            fetch(`${API_URL}/api/tables/${o.tableNo}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nextTable)
            });
          }
        }
        // If order status advances to BILLING (Ready for Billing), map table to PENDING (Orange)
        if (status === 'BILLING' && o.tableNo !== 'Takeaway') {
          nextOrder.timestamp = Date.now(); // Mark exact start time of Billing Pending
          const table = tables.find(t => t.number === o.tableNo);
          if (table && table.status !== 'PENDING') {
            const nextTable = { ...table, status: 'PENDING' as const };
            fetch(`${API_URL}/api/tables/${o.tableNo}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nextTable)
            });
          }
        }
        
        fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOrder)
        });
        return nextOrder;
      }
      return o;
    });

    setOrders(nextOrders);
  };

  // --- BILL SETTLEMENT & RELEASE TABLE ---
  const settleBillAndReleaseTable = (orderId: string, paymentMethod: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = 0;
    const serviceCharge = 0;
    const total = subtotal;

    const newInvoice: Invoice = {
      invoiceNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: order.id,
      tableNo: order.tableNo,
      customerName: order.customerName,
      items: order.items,
      subtotal,
      tax,
      serviceCharge,
      total,
      timestamp: Date.now(),
      isParcel: order.isParcel,
      paymentMethod
    };

    const nextInvoices = [...invoices, newInvoice];
    setInvoices(nextInvoices);
    localStorage.setItem('svd_invoices', JSON.stringify(nextInvoices));
    
    // Mark order as PAID
    const nextOrders = orders.map(o => {
      if (o.id === orderId) {
        const nextOrder = { ...o, status: 'PAID' as const };
        fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextOrder)
        });
        return nextOrder;
      }
      return o;
    });
    setOrders(nextOrders);

    // Release table & set to AVAILABLE (Green)
    if (order.tableNo !== 'Takeaway') {
      const table = tables.find(t => t.number === order.tableNo);
      if (table) {
        const nextTable = { 
          ...table, 
          status: 'AVAILABLE' as const,
          bookingTimeSlot: null,
          customerName: null,
          customerPhone: null
        };
        fetch(`${API_URL}/api/tables/${order.tableNo}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextTable)
        });
      }
      
      // Clear current tab's active cart if this was the table
      if (activeTable === order.tableNo) {
        setCart([]);
      }
      localStorage.removeItem(`svd_cart_T${order.tableNo}`);
    }

    // Automatically push real-time Admin notification
    const newNotification: PaymentNotification = {
      id: 'NTF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      orderId: order.id,
      tableNo: order.tableNo,
      customerName: order.customerName,
      amount: total,
      timestamp: Date.now()
    };
    const nextNotifications = [newNotification, ...paymentNotifications];
    setPaymentNotifications(nextNotifications);
    localStorage.setItem('svd_payment_notifications', JSON.stringify(nextNotifications));

    triggerSync();
  };

  // --- AUTH SERVICES ---
  const login = (role: 'admin' | 'kitchen', email: string) => {
    sessionStorage.setItem(`svd_session_${role}`, email);
    if (role === 'admin') setAdminSession(email);
    else setKitchenSession(email);
  };

  const logout = (role: 'admin' | 'kitchen') => {
    sessionStorage.removeItem(`svd_session_${role}`);
    if (role === 'admin') setAdminSession(null);
    else setKitchenSession(null);
  };

  const dismissNotification = (id: string) => {
    const nextNotifications = paymentNotifications.filter(n => n.id !== id);
    localStorage.setItem('svd_payment_notifications', JSON.stringify(nextNotifications));
    setPaymentNotifications(nextNotifications);
    triggerSync();
  };

  const dismissAllNotifications = () => {
    localStorage.setItem('svd_payment_notifications', JSON.stringify([]));
    setPaymentNotifications([]);
    triggerSync();
  };

  return (
    <AppContext.Provider value={{
      tables,
      orders,
      invoices,
      activeTable,
      cart,
      theme,
      adminSession,
      kitchenSession,
      upiId,
      qrCodeUrl,
      ratings,
      reviews,
      menuItems,
      addReview,
      updateReview,
      deleteReview,
      setTheme,
      reserveTable,
      reserveTableOnly,
      releaseTable,
      holdTable,
      addToCart,
      updateCartQty,
      clearCart,
      placeOrder,
      updateOrderStatus,
      settleBillAndReleaseTable,
      login,
      logout,
      activeOrder,
      triggerSync,
      updateUpiSettings,
      addRating,
      getAverageRating,
      updateMenu,
      paymentNotifications,
      dismissNotification,
      dismissAllNotifications,
      parcelItems,
      updateParcelMenu,
      bgImage,
      setBgImage,
      placeParcelOrder,
      cmsSettings,
      updateCmsSettings,
      cmsVersions,
      fetchCmsVersions,
      restoreCmsVersion,
      API_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
