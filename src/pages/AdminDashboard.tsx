import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Invoice } from '../context/AppContext';
import AuthGate from '../components/AuthGate';
import ImageWithFallback from '../components/ImageWithFallback';
import { 
  BarChart3, Users, DollarSign, ClipboardList, LogOut, Download, 
  Printer, QrCode, UtensilsCrossed, Star, Settings, Search, 
  Edit, Trash2, PlusCircle, X, 
  ToggleLeft, ToggleRight, ShoppingBag, Globe
} from 'lucide-react';

interface Dish {
  id: number;
  name: string;
  price: number;
  category: string;
  type: 'veg' | 'non-veg';
  image: string;
  description: string;
  disabled?: boolean;
}

const AdminDashboard: React.FC = () => {
  const { 
    tables, orders, invoices, adminSession, logout, 
    upiId, qrCodeUrl, ratings, reviews, menuItems, 
    updateUpiSettings, updateMenu, getAverageRating,
    paymentNotifications, dismissNotification, dismissAllNotifications,
    parcelItems, updateParcelMenu, releaseTable, settleBillAndReleaseTable,
    updateOrderStatus, cmsSettings, updateCmsSettings, cmsVersions, restoreCmsVersion,
    addReview, updateReview, deleteReview
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(!!adminSession);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'ratings' | 'invoices' | 'settings' | 'parcels' | 'cms'>('overview');
  
  const [cmsForm, setCmsForm] = useState<any>({});
  const [cmsSubTab, setCmsSubTab] = useState<string>('general');
  const [cmsSaving, setCmsSaving] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', image: '', couponCode: '', isActive: true });
  
  // Review management states
  const [ratingsSubTab, setRatingsSubTab] = useState<'checkout' | 'website'>('checkout');
  const [editingReview, setEditingReview] = useState<any>(null);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, message: '', status: 'APPROVED' as const });
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Sync CMS forms locally
  useEffect(() => {
    if (cmsSettings) {
      setCmsForm(cmsSettings);
    }
  }, [cmsSettings]);
  const [menuSubTab, setMenuSubTab] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'active-bills' | 'history'>('active-bills');
  const [parcelSubTab, setParcelSubTab] = useState<'active' | 'history'>('active');
  const [parcelHistoryTimeFilter, setParcelHistoryTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [parcelHistoryStatusFilter, setParcelHistoryStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedQRTable, setSelectedQRTable] = useState<string>('G1');
  
  // Table Release States
  const [selectedTableForRelease, setSelectedTableForRelease] = useState<string | null>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  // Confirm Table Release
  const confirmReleaseTable = () => {
    if (!selectedTableForRelease) return;
    releaseTable(selectedTableForRelease);
    setShowReleaseModal(false);
    setSelectedTableForRelease(null);
  };
  
  // Menu Management States
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [menuFilter, setMenuFilter] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [menuSearch, setMenuSearch] = useState('');
  const [dishForm, setDishForm] = useState({
    name: '',
    price: 0,
    category: 'Veg Biryani',
    type: 'veg' as 'veg' | 'non-veg',
    description: '',
    image: ''
  });

  // Settings States
  const [inputUpi, setInputUpi] = useState(upiId);
  const [inputQrUrl, setInputQrUrl] = useState(qrCodeUrl);

  // Invoice States
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Synchronize input fields when context loads/updates
  useEffect(() => {
    setInputUpi(upiId);
    setInputQrUrl(qrCodeUrl);
  }, [upiId, qrCodeUrl]);

  // Handle Auth success
  useEffect(() => {
    if (adminSession) {
      setIsAuthenticated(true);
    }
  }, [adminSession]);

  const handleLogoutClick = () => {
    if (confirm('Are you sure you want to log out from the Admin Suite?')) {
      logout('admin');
      setIsAuthenticated(false);
    }
  };

  // --- ANALYTICS COMPUTATIONS ---
  const totalTablesCount = tables.length;
  const availableTablesCount = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedTablesCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const pendingTablesCount = tables.filter(t => t.status === 'PENDING').length;

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => o.timestamp >= startOfToday);
  const todayRevenue = invoices
    .filter(inv => inv.timestamp >= startOfToday)
    .reduce((sum, inv) => sum + inv.total, 0);

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  // Takeaway volume count
  const todayTakeawayCount = orders.filter(o => o.isParcel && o.timestamp >= startOfToday).length;

  // --- REPORT FILTERING ---
  const getFilterTimestamp = () => {
    const now = Date.now();
    if (reportType === 'daily') return startOfToday;
    if (reportType === 'weekly') return now - 7 * 24 * 60 * 60 * 1000;
    return startOfMonth;
  };

  const filteredInvoices = invoices.filter(inv => inv.timestamp >= getFilterTimestamp());

  // --- CSV REPORT EXPORT ---
  const exportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No data to export!');
      return;
    }

    let csvContent = 'Invoice No,Date,Table,Customer Name,Payment Method,Subtotal,Tax,Service Charge,Total Amount\n';
    filteredInvoices.forEach(inv => {
      const dateStr = new Date(inv.timestamp).toLocaleDateString();
      csvContent += `"${inv.invoiceNo}","${dateStr}","Table ${inv.tableNo}","${inv.customerName}","${inv.paymentMethod}",${inv.subtotal},${inv.tax},${inv.serviceCharge},${inv.total}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SVD_Sales_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- SVG REVENUE TRENDS CHART ---
  const renderTrendsChart = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Mock baseline values
    const baselineSales = [12000, 8500, 9600, 11200, 14000, 18500, 22000];

    // Merge today's actual live revenue
    const currentDayIdx = new Date().getDay();
    baselineSales[currentDayIdx] = Math.max(baselineSales[currentDayIdx], todayRevenue);

    const maxSale = Math.max(...baselineSales);
    const height = 160;
    const width = 500;
    const barWidth = 40;
    const spacing = 25;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-neutral-400">
        {/* Draw Y-axis reference lines */}
        <line x1="30" y1="10" x2="30" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.2" />
        <line x1="30" y1="140" x2="480" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.2" />

        {baselineSales.map((val, idx) => {
          const barHeight = Math.max((val / maxSale) * 110, 8);
          const x = 40 + idx * (barWidth + spacing);
          const y = 140 - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="4"
                className="fill-maroon dark:fill-saffron hover:opacity-80 transition-all duration-300"
              />
              <text 
                x={x + barWidth / 2} 
                y={y - 6} 
                textAnchor="middle" 
                fontSize="10" 
                fontWeight="bold"
                className="fill-neutral-700 dark:fill-neutral-300"
              >
                ₹{Math.round(val / 1000)}k
              </text>
              <text 
                x={x + barWidth / 2} 
                y="152" 
                textAnchor="middle" 
                fontSize="10" 
                className="fill-neutral-500"
              >
                {weekdays[idx]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // --- PRINT SELECTED QR CODE ---
  const handlePrintQR = () => {
    const baseUrl = window.location.href.split('#')[0];
    const qrUrl = `${baseUrl}#menu?table=${selectedQRTable}`;

    const printWindow = window.open('', '_blank', 'width=400,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${selectedQRTable}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 2rem; }
            .qr-wrapper { margin: 2rem auto; width: max-content; }
            h2 { margin-bottom: 0.25rem; }
            p { color: #666; font-size: 0.9rem; margin-top: 1rem; }
            code { background-color: #f1f1f1; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
          </style>
        </head>
        <body>
          <h2>SRI VIJAYA DURGA RESTAURANT</h2>
          <h3>Table ${selectedQRTable} Menu QR</h3>
          <div class="qr-wrapper">
            ${document.getElementById('admin-qr-preview-graphic')?.innerHTML || ''}
          </div>
          <code>${qrUrl}</code>
          <p>Scan this QR code using any smartphone to browse the menu and place orders instantly.</p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Render SVG QR preview in settings tab
  const renderQRPreview = () => {
    let seed = 0;
    for (let i = 0; i < selectedQRTable.length; i++) {
      seed += selectedQRTable.charCodeAt(i) * (i + 1);
    }

    const dots = [];
    for (let r = 0; r < 18; r++) {
      for (let c = 0; c < 18; c++) {
        if ((r < 5 && c < 5) || (r < 5 && c > 12) || (r > 12 && c < 5)) continue;
        if (Math.sin(r * 12.3 + c * 35.7 + seed * 8.9) > 0.0) {
          dots.push({ x: 15 + c * 9, y: 15 + r * 9 });
        }
      }
    }

    return (
      <svg id="admin-qr-preview-graphic" width="160" height="160" viewBox="0 0 180 180" className="mx-auto bg-white p-2 rounded-xl border border-neutral-200 shadow-sm">
        <rect x="5" y="5" width="40" height="40" fill="#000" stroke="#000" strokeWidth="4" />
        <rect x="13" y="13" width="24" height="24" fill="#fff" />
        <rect x="19" y="19" width="12" height="12" fill="#000" />

        <rect x="135" y="5" width="40" height="40" fill="#000" stroke="#000" strokeWidth="4" />
        <rect x="143" y="13" width="24" height="24" fill="#fff" />
        <rect x="149" y="19" width="12" height="12" fill="#000" />

        <rect x="5" y="135" width="40" height="40" fill="#000" stroke="#000" strokeWidth="4" />
        <rect x="13" y="143" width="24" height="24" fill="#fff" />
        <rect x="19" y="149" width="12" height="12" fill="#000" />

        {dots.map((d, idx) => (
          <rect key={idx} x={d.x} y={d.y} width="6" height="6" fill="#000" />
        ))}

        <rect x="70" y="70" width="40" height="40" fill="#fff" stroke="#e2e8f0" strokeWidth="2" rx="4" />
        <text x="90" y="94" fontSize="10" fontFamily="Outfit" fontWeight="900" textAnchor="middle" fill="#d97706">T-{selectedQRTable}</text>
      </svg>
    );
  };

  // --- MENU MANAGEMENT LOGICS ---
  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      price: 0,
      category: menuSubTab === 'takeaway' ? 'Couple Pack' : 'Veg Biryani',
      type: 'veg',
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'
    });
    setShowDishModal(true);
  };

  const handleOpenEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      price: dish.price,
      category: dish.category,
      type: dish.type,
      description: dish.description || '',
      image: dish.image ? dish.image.split('?')[0] : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'
    });
    setShowDishModal(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name || dishForm.price <= 0) {
      alert('Please fill out dish name and a valid positive price.');
      return;
    }

    // Apply cache busting to the image URL to prevent browser caching stale images
    let finalImageUrl = dishForm.image.trim();
    if (finalImageUrl) {
      const cleanUrl = finalImageUrl.split('?')[0];
      finalImageUrl = `${cleanUrl}?v=${Date.now()}`;
    }

    const finalForm = {
      ...dishForm,
      image: finalImageUrl
    };

    if (menuSubTab === 'dine-in') {
      if (editingDish) {
        // Modify existing
        const updated = menuItems.map(m => m.id === editingDish.id ? { ...m, ...finalForm } : m);
        updateMenu(updated);
      } else {
        // Add new
        const nextId = menuItems.length > 0 ? Math.max(...menuItems.map(m => m.id)) + 1 : 1;
        const newDish = { id: nextId, ...finalForm, disabled: false };
        updateMenu([...menuItems, newDish]);
      }
    } else {
      if (editingDish) {
        // Modify existing
        const updated = parcelItems.map(m => m.id === editingDish.id ? { ...m, ...finalForm } : m);
        updateParcelMenu(updated);
      } else {
        // Add new
        const nextId = parcelItems.length > 0 ? Math.max(...parcelItems.map(m => m.id)) + 1 : 201;
        const newDish = { id: nextId, ...finalForm, disabled: false };
        updateParcelMenu([...parcelItems, newDish]);
      }
    }
    setShowDishModal(false);
  };

  const handleDeleteDish = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (menuSubTab === 'dine-in') {
        const updated = menuItems.filter(m => m.id !== id);
        updateMenu(updated);
      } else {
        const updated = parcelItems.filter(m => m.id !== id);
        updateParcelMenu(updated);
      }
    }
  };

  const handleToggleDish = (id: number, currentDisabled: boolean) => {
    if (menuSubTab === 'dine-in') {
      const updated = menuItems.map(m => m.id === id ? { ...m, disabled: !currentDisabled } : m);
      updateMenu(updated);
    } else {
      const updated = parcelItems.map(m => m.id === id ? { ...m, disabled: !currentDisabled } : m);
      updateParcelMenu(updated);
    }
  };

  // --- SAVE SETTINGS ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUpiSettings(inputUpi, inputQrUrl);
    alert('Merchant settings saved and synced across all devices!');
  };


  const currentItemsToManage = menuSubTab === 'dine-in' ? menuItems : parcelItems;

  const filteredMenuItems = currentItemsToManage.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          item.category.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesFilter = menuFilter === 'All' || 
                         (menuFilter === 'Veg' && item.type === 'veg') ||
                         (menuFilter === 'Non-Veg' && item.type === 'non-veg');
    return matchesSearch && matchesFilter;
  });

  // Invoice searching
  const searchedInvoices = invoices.filter(inv => {
    if (!invoiceSearch) return true;
    const q = invoiceSearch.toLowerCase();
    const dateStr = new Date(inv.timestamp).toLocaleDateString();
    return inv.invoiceNo.toLowerCase().includes(q) || 
           inv.customerName.toLowerCase().includes(q) || 
           `table ${inv.tableNo}`.toLowerCase().includes(q) || 
           dateStr.includes(q);
  });

  const filteredParcelHistory = orders.filter(o => {
    if (!o.isParcel) return false;
    const isCompleted = o.status === 'COMPLETED' || o.status === 'PICKED_UP' || o.status === 'PAID';
    const isCancelled = o.status === 'CANCELLED';
    if (!isCompleted && !isCancelled) return false;

    if (parcelHistoryStatusFilter !== 'ALL') {
      if (parcelHistoryStatusFilter === 'CANCELLED' && !isCancelled) return false;
      if (parcelHistoryStatusFilter === 'COMPLETED' && !isCompleted) return false;
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const startOfTodayVal = new Date().setHours(0, 0, 0, 0);

    if (parcelHistoryTimeFilter === 'today') {
      return o.timestamp >= startOfTodayVal;
    } else if (parcelHistoryTimeFilter === 'week') {
      return o.timestamp >= (now - 7 * oneDay);
    } else if (parcelHistoryTimeFilter === 'month') {
      return o.timestamp >= (now - 30 * oneDay);
    }
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 5MB.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload images or PDFs only.");
      return;
    }

    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          const base64Content = dataUrl.split(',')[1];

          try {
            const res = await fetch('/api/cms/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: file.name.substring(0, file.name.lastIndexOf('.')) + '.jpg',
                type: 'image/jpeg',
                base64: base64Content
              })
            });
            const data = await res.json();
            if (data.success && data.url) {
              setCmsForm((prev: any) => ({ ...prev, [fieldName]: data.url }));
            } else {
              alert(data.error || "Upload failed");
            }
          } catch (err) {
            console.error("Image upload failed:", err);
            alert("Image upload failed");
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = (event.target?.result as string).split(',')[1];
        try {
          const res = await fetch('/api/cms/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              type: file.type,
              base64: base64Content
            })
          });
          const data = await res.json();
          if (data.success && data.url) {
            setCmsForm((prev: any) => ({ ...prev, [fieldName]: data.url }));
          } else {
            alert(data.error || "Upload failed");
          }
        } catch (err) {
          console.error("Upload error:", err);
          alert("Upload error");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return <AuthGate role="admin" onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      
      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4 no-print">
        <div>
          <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Admin Control Suite
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Interactive live restaurant workspace &amp; databases</p>
        </div>

        <button 
          onClick={handleLogoutClick}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-neutral-300 dark:border-neutral-700 hover:border-red-500 rounded-xl text-xs font-bold transition-all hover:text-red-500 hover:bg-red-500/5"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700 no-print overflow-x-auto scrollbar-none gap-1 select-none font-logo">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
          { id: 'parcels', label: 'Parcel Orders', icon: ShoppingBag },
          { id: 'ratings', label: 'Guest Reviews', icon: Star },
          { id: 'invoices', label: 'Invoices', icon: ClipboardList },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'cms', label: 'Website CMS', icon: Globe },
        ].map(tab => {
          let notificationCount = 0;
          if (tab.id === 'parcels') {
            notificationCount = orders.filter(o => o.isParcel && o.status === 'NEW').length;
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedInvoice(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative border-none cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 bg-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-505 text-white rounded-full flex items-center justify-center text-[8px] font-black animate-bounce" style={{ backgroundColor: '#ef4444' }}>
                  {notificationCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER VIEWS */}

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm glass">
              <div className="w-10 h-10 rounded-xl bg-maroon/5 dark:bg-saffron/5 flex items-center justify-center text-maroon dark:text-saffron border border-maroon/20 dark:border-saffron/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] text-neutral-400 font-bold uppercase">Dining Occupancy</h4>
                <p className="text-sm font-extrabold font-logo">{availableTablesCount} / {totalTablesCount} Free</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">
                  {occupiedTablesCount} Eating • {pendingTablesCount} Bill Pending
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm glass">
              <div className="w-10 h-10 rounded-xl bg-maroon/5 dark:bg-saffron/5 flex items-center justify-center text-maroon dark:text-saffron border border-maroon/20 dark:border-saffron/20">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] text-neutral-400 font-bold uppercase">Orders Today</h4>
                <p className="text-sm font-extrabold font-logo">{todayOrders.length} Tickets</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">{todayTakeawayCount} Takeaway Deliveries</p>
              </div>
            </div>

            <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm glass">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/25">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] text-neutral-400 font-bold uppercase">Revenue Today</h4>
                <p className="text-sm font-extrabold font-logo text-green-600 dark:text-green-400">₹{todayRevenue.toLocaleString()}</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Settled bills &amp; takeaways</p>
              </div>
            </div>

            <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm glass">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/25">
                <Star className="w-5 h-5 fill-yellow-500" />
              </div>
              <div>
                <h4 className="text-[10px] text-neutral-400 font-bold uppercase">Average Review</h4>
                <p className="text-sm font-extrabold font-logo text-yellow-600 dark:text-yellow-500">⭐ {getAverageRating()} / 5.0</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Based on {ratings.length} customer logs</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Table Monitor */}
            <div className="lg:col-span-2 bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl p-6 shadow-sm glass space-y-4">
              <h3 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Real-Time Table Monitoring</h3>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                {tables.map(t => {
                  let statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400';
                  if (t.status === 'OCCUPIED') {
                    statusColor = 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400';
                  } else if (t.status === 'PENDING') {
                    statusColor = 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-400';
                  }
                  
                  return (
                    <div 
                      key={t.id}
                      onClick={() => {
                        if (t.status === 'OCCUPIED' || t.status === 'PENDING') {
                          setSelectedTableForRelease(t.number);
                          setShowReleaseModal(true);
                        }
                      }}
                      className={`py-3 text-center rounded-xl border font-bold text-xs shadow-inner flex flex-col items-center justify-center gap-0.5 select-none transition-transform duration-200 ${
                        t.status !== 'AVAILABLE' ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'opacity-80'
                      } ${statusColor}`}
                    >
                      <span>T-{t.number}</span>
                      <span className="text-[8px] font-semibold opacity-75">{t.capacity}S</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column wrapped in space-y-6 */}
            <div className="lg:col-span-1 space-y-6">
              {/* Weekly Sales Trend */}
              <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl p-6 shadow-sm glass flex flex-col justify-between">
                <h3 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Weekly Sales Trend</h3>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  {renderTrendsChart()}
                </div>
              </div>

              {/* Live Payment Alerts widget */}
              <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl p-6 shadow-sm glass space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Live Payment Alerts</h3>
                  </div>
                  {paymentNotifications.length > 0 && (
                    <button
                      onClick={dismissAllNotifications}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-all uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                  {paymentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 italic text-xs">
                      No new payment alerts.
                    </div>
                  ) : (
                    paymentNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className="border border-neutral-150 dark:border-neutral-850 p-3 rounded-xl bg-neutral-50/50 dark:bg-neutral-850/10 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/20 transition-all flex items-center justify-between gap-3 text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 rounded text-[9px] font-bold">
                              Table {notification.tableNo}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-mono">
                              {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                            {notification.customerName.startsWith('System')
                              ? `Table ${notification.tableNo} auto-released after Billing Pending timeout.`
                              : `₹${notification.amount} paid by ${notification.customerName}`}
                          </p>
                          <span className="text-[9px] text-neutral-400 font-semibold uppercase block">
                            ID: {notification.orderId}
                          </span>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                          title="Dismiss Alert"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}


      {/* 3. MENU MANAGEMENT VIEW */}
      {activeTab === 'menu' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-logo font-extrabold text-lg text-neutral-700 dark:text-neutral-200">Menu Management Panel</h3>
              <p className="text-xs text-neutral-500">Add, edit, delete, or toggle availability of menu card items instantly</p>
            </div>
            
            <button 
              onClick={handleOpenAddDish}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md transition-all hover:opacity-90"
            >
              <PlusCircle className="w-4 h-4" /> {menuSubTab === 'takeaway' ? 'Add Takeaway Item' : 'Add New Dish'}
            </button>
          </div>

          {/* Sub-tabs selection */}
          <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <button
              onClick={() => {
                setMenuSubTab('dine-in');
                setMenuFilter('All');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                menuSubTab === 'dine-in'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-maroon/30'
              }`}
            >
              Dine-In Menu
            </button>
            <button
              onClick={() => {
                setMenuSubTab('takeaway');
                setMenuFilter('All');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                menuSubTab === 'takeaway'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-maroon/30'
              }`}
            >
              Takeaway Menu (Parcels)
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-bg-dark p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm glass">
            <div className="relative flex-1 min-w-[240px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Search dishes by name or category..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
              />
            </div>

            <div className="flex gap-2 p-0.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700">
              {(['All', 'Veg', 'Non-Veg'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => setMenuFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    menuFilter === opt 
                      ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-sm'
                      : 'text-neutral-550 dark:text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
                  {/* Dishes Table (desktop/tablet) */}
          <div className="bg-white dark:bg-bg-dark border border-neutral-250 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm glass hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/30 text-neutral-400 font-bold uppercase text-[9px] tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                  {filteredMenuItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-neutral-400 italic">No menu items match search query.</td>
                    </tr>
                  ) : (
                    filteredMenuItems.map(dish => (
                      <tr 
                        key={dish.id} 
                        className={`hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-all ${
                          dish.disabled ? 'bg-neutral-100/50 dark:bg-neutral-850/5 text-neutral-400' : ''
                        }`}
                      >
                        <td className="p-4 flex items-center gap-3">
                          <ImageWithFallback 
                            src={dish.image} 
                            alt={dish.name} 
                            className={`w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0 ${dish.disabled ? 'grayscale' : ''}`} 
                          />
                          <div>
                            <h5 className="font-bold text-neutral-850 dark:text-neutral-100">{dish.name}</h5>
                            <p className="text-[10px] text-neutral-400 line-clamp-1 max-w-[200px]">{dish.description}</p>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-300 font-semibold">{dish.category}</td>
                        <td className="p-4 font-logo font-extrabold text-neutral-800 dark:text-neutral-100">₹{dish.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            dish.type === 'veg' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {dish.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleDish(dish.id, !!dish.disabled)}
                            className="focus:outline-none transition-transform active:scale-95"
                          >
                            {dish.disabled ? (
                              <div className="flex items-center gap-1.5 text-neutral-450 dark:text-neutral-500 font-semibold">
                                <ToggleLeft className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />
                                <span>Disabled</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <ToggleRight className="w-6 h-6 text-emerald-500" />
                                <span>Enabled</span>
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenEditDish(dish)}
                              className="p-1.5 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-lg text-neutral-550 dark:text-neutral-400 hover:text-maroon dark:hover:text-saffron transition-all"
                              title="Edit Dish"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDish(dish.id)}
                              className="p-1.5 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-lg text-neutral-550 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-450 transition-all"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dishes Card Grid (mobile only) */}
          <div className="block md:hidden space-y-4">
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-bg-dark rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-450 italic text-xs glass">
                No menu items match search query.
              </div>
            ) : (
              filteredMenuItems.map(dish => (
                <div 
                  key={dish.id} 
                  className={`bg-white dark:bg-bg-dark border rounded-2xl p-4 shadow-sm glass flex flex-col gap-3 transition-all ${
                    dish.disabled ? 'border-neutral-200/50 dark:border-neutral-800/60 opacity-75' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ImageWithFallback 
                      src={dish.image} 
                      alt={dish.name} 
                      className={`w-12 h-12 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0 ${dish.disabled ? 'grayscale' : ''}`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-logo font-bold text-xs text-neutral-850 dark:text-neutral-100 truncate">{dish.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide flex-shrink-0 ${
                          dish.type === 'veg' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                        }`}>
                          {dish.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-semibold mb-0.5">{dish.category}</p>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">{dish.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-neutral-150 dark:border-neutral-800/40">
                    <span className="font-logo font-extrabold text-xs text-maroon dark:text-saffron">₹{dish.price}</span>
                    
                    <div className="flex items-center gap-3">
                      {/* Availability toggle */}
                      <button
                        onClick={() => handleToggleDish(dish.id, !!dish.disabled)}
                        className="focus:outline-none transition-transform active:scale-95 flex items-center gap-1 text-[10px] font-bold"
                      >
                        {dish.disabled ? (
                          <>
                            <ToggleLeft className="w-5 h-5 text-neutral-305 dark:text-neutral-700" />
                            <span className="text-neutral-400">Disabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Enabled</span>
                          </>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => handleOpenEditDish(dish)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>      </div>
        </div>
      )}

      {/* 4. GUEST REVIEWS / RATINGS VIEW */}
      {activeTab === 'ratings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-logo font-extrabold text-lg text-neutral-700 dark:text-neutral-200">
                {ratingsSubTab === 'checkout' ? 'Guest Review Logs' : 'Website Testimonials Moderation'}
              </h3>
              <p className="text-xs text-neutral-500">
                {ratingsSubTab === 'checkout' 
                  ? 'Live average scores and rating surveys collected upon checkout' 
                  : 'Approve, edit, or reject customer-submitted testimonials displayed on the homepage'}
              </p>
            </div>
          </div>

          {/* Sub-tab Selection */}
          <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <button
              onClick={() => setRatingsSubTab('checkout')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingsSubTab === 'checkout'
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              ⭐ Checkout Feedback
            </button>
            <button
              onClick={() => setRatingsSubTab('website')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                ratingsSubTab === 'website'
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              🌐 Website Testimonials
            </button>
          </div>

          {ratingsSubTab === 'checkout' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              
              {/* Rating Scores Breakdown */}
              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass space-y-4">
                <h4 className="font-logo font-extrabold text-sm text-neutral-500 uppercase">Review Breakdowns</h4>
                
                <div className="space-y-3 font-semibold text-xs text-neutral-600 dark:text-neutral-300">
                  {['Food Quality', 'Service Quality', 'Ambience'].map((aspect, idx) => {
                    let avg = 4.8;
                    if (ratings.length > 0) {
                      const sum = ratings.reduce((acc, r) => {
                        if (idx === 0) return acc + r.food;
                        if (idx === 1) return acc + r.service;
                        return acc + r.ambience;
                      }, 0);
                      avg = Math.round((sum / ratings.length) * 10) / 10;
                    }
                    
                    return (
                      <div key={aspect} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{aspect}</span>
                          <span className="font-logo font-extrabold text-maroon dark:text-saffron">⭐ {avg} / 5.0</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-maroon dark:bg-saffron rounded-full transition-all" 
                            style={{ width: `${(avg / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comment logs */}
              <div className="md:col-span-2 bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass space-y-4">
                <h4 className="font-logo font-extrabold text-sm text-neutral-500 uppercase">Recent Guest Comments</h4>
                
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
                  {ratings.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 italic text-xs">No guest reviews submitted yet.</div>
                  ) : (
                    [...ratings].reverse().map(r => {
                      const singleAvg = Math.round(((r.food + r.service + r.ambience) / 3) * 10) / 10;
                      return (
                        <div key={r.id} className="border border-neutral-150 dark:border-neutral-850 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-850/10 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h5 className="font-logo font-bold text-xs text-neutral-700 dark:text-neutral-200">{r.customerName}</h5>
                              <span className="text-[9px] text-neutral-400 block mt-0.5">{r.customerPhone} • {new Date(r.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-extrabold font-logo">
                              ⭐ {singleAvg} / 5.0
                            </div>
                          </div>

                          {r.comment && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic bg-white dark:bg-bg-dark border border-neutral-100 dark:border-neutral-805 p-2.5 rounded-xl">
                              "{r.comment}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 p-4 rounded-3xl shadow-sm glass">
                {/* Filter controls */}
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => {
                    const count = filter === 'ALL' 
                      ? reviews.length 
                      : reviews.filter(r => r.status === filter).length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setReviewFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          reviewFilter === filter
                            ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800/50'
                        }`}
                      >
                        {filter === 'ALL' ? 'All Reviews' : filter === 'PENDING' ? 'Pending' : filter === 'APPROVED' ? 'Approved' : 'Rejected'} ({count})
                      </button>
                    );
                  })}
                </div>
                
                {/* Add review manually */}
                <button
                  onClick={() => {
                    setReviewForm({ name: '', rating: 5, message: '', status: 'APPROVED' });
                    setShowAddReviewForm(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md transition-all hover:opacity-90 cursor-pointer border-none"
                >
                  <PlusCircle className="w-4 h-4" /> Add Review Manually
                </button>
              </div>

              {/* Reviews Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.filter(r => reviewFilter === 'ALL' ? true : r.status === reviewFilter).length === 0 ? (
                  <div className="md:col-span-2 bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center text-neutral-400 italic text-xs glass">
                    No website testimonials match the selected filter.
                  </div>
                ) : (
                  reviews
                    .filter(r => reviewFilter === 'ALL' ? true : r.status === reviewFilter)
                    .map((r) => {
                      return (
                        <div key={r.id} className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all glass flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            {/* Header info */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="font-logo font-bold text-sm text-neutral-700 dark:text-neutral-200">{r.name}</h5>
                                <span className="text-[9px] text-neutral-400 block mt-0.5">Submitted on {new Date(r.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                {/* Rating Stars */}
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star 
                                      key={idx}
                                      className={`w-3.5 h-3.5 ${
                                        idx < r.rating ? 'text-saffron fill-saffron' : 'text-neutral-300 dark:text-neutral-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {/* Status badge */}
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  r.status === 'APPROVED' 
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                    : r.status === 'PENDING'
                                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                  {r.status === 'APPROVED' ? 'Approved & Live' : r.status === 'PENDING' ? 'Pending Approval' : 'Rejected'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Message */}
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic bg-neutral-50 dark:bg-neutral-850/20 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-850">
                              "{r.message}"
                            </p>
                          </div>

                          {/* Action controls */}
                          <div className="flex flex-wrap items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-3 gap-2">
                            <div className="flex gap-1.5">
                              {r.status !== 'APPROVED' && (
                                <button
                                  onClick={() => updateReview(r.id, r.name, r.rating, r.message, 'APPROVED')}
                                  className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {r.status !== 'REJECTED' && (
                                <button
                                  onClick={() => updateReview(r.id, r.name, r.rating, r.message, 'REJECTED')}
                                  className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                            
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingReview(r)}
                                className="p-1.5 text-neutral-500 hover:text-maroon dark:hover:text-saffron bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 transition-all cursor-pointer"
                                title="Edit review content"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to permanently delete this testimonial?')) {
                                    deleteReview(r.id);
                                  }
                                }}
                                className="p-1.5 text-neutral-400 hover:text-red-500 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 transition-all cursor-pointer"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Edit Review Modal */}
          {editingReview && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl max-w-md w-full glass animate-scale-in space-y-4">
                <h4 className="font-logo font-extrabold text-sm text-neutral-700 dark:text-neutral-200">Edit Website Review</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Reviewer Name</label>
                    <input 
                      type="text"
                      value={editingReview.name}
                      onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditingReview({ ...editingReview, rating: star })}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= editingReview.rating ? 'text-saffron fill-saffron' : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Review Message</label>
                    <textarea 
                      rows={4}
                      value={editingReview.message}
                      onChange={(e) => setEditingReview({ ...editingReview, message: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Approval Status</label>
                    <select
                      value={editingReview.status}
                      onChange={(e) => setEditingReview({ ...editingReview, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    >
                      <option value="PENDING">Pending Approval</option>
                      <option value="APPROVED">Approved & Live</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => setEditingReview(null)}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      updateReview(editingReview.id, editingReview.name, editingReview.rating, editingReview.message, editingReview.status);
                      setEditingReview(null);
                    }}
                    className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl text-xs font-bold shadow-md hover:opacity-90 cursor-pointer border-none"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Review Modal */}
          {showAddReviewForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl max-w-md w-full glass animate-scale-in space-y-4">
                <h4 className="font-logo font-extrabold text-sm text-neutral-700 dark:text-neutral-200">Add Website Review Manually</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Reviewer Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= reviewForm.rating ? 'text-saffron fill-saffron' : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Review Message</label>
                    <textarea 
                      rows={4}
                      required
                      placeholder="Type review content here..."
                      value={reviewForm.message}
                      onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Status</label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-850 text-xs focus:border-maroon outline-none text-neutral-700 dark:text-neutral-200"
                    >
                      <option value="PENDING">Pending Approval</option>
                      <option value="APPROVED">Approved & Live</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setShowAddReviewForm(false);
                      setReviewForm({ name: '', rating: 5, message: '', status: 'APPROVED' });
                    }}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (!reviewForm.name.trim() || !reviewForm.message.trim()) return;
                      addReview(reviewForm.name.trim(), reviewForm.rating, reviewForm.message.trim(), reviewForm.status);
                      setShowAddReviewForm(false);
                      setReviewForm({ name: '', rating: 5, message: '', status: 'APPROVED' });
                    }}
                    className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl text-xs font-bold shadow-md hover:opacity-90 cursor-pointer border-none"
                  >
                    Add Testimonial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SEARCH INVOICES VIEW */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Sub-tabs for Billing */}
          <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <button
              onClick={() => setInvoiceSubTab('active-bills')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                invoiceSubTab === 'active-bills'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Master Bill Management (Active Tables)
            </button>
            <button
              onClick={() => setInvoiceSubTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                invoiceSubTab === 'history'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Invoice History
            </button>
          </div>

          {!selectedInvoice ? (
            <>
              {invoiceSubTab === 'active-bills' ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass">
                    <h4 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                      Master Billing &amp; Table Release Console
                    </h4>
                    
                    {orders.filter(o => o.status !== 'PAID').length === 0 ? (
                      <div className="text-center py-12 text-neutral-450 italic text-xs">
                        No active tables or billing sessions currently.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.filter(o => o.status !== 'PAID').map(order => {
                          const orderTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                          return (
                            <div key={order.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-850/10 flex flex-col justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-805 pb-2">
                                  <span className="px-2 py-0.5 bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron rounded text-xs font-black font-logo">
                                    {order.tableNo === 'Takeaway' ? '🥡 Takeaway' : `Table ${order.tableNo}`}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    order.status === 'BILLING' || order.status === 'PENDING_VERIFY'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                
                                <div className="text-[10px] text-neutral-400 font-semibold space-y-1">
                                  <div>Order ID: <span className="font-mono text-neutral-600 dark:text-neutral-355">{order.id}</span></div>
                                  <div>Guest Name: <span className="text-neutral-700 dark:text-neutral-250 font-bold">{order.customerName}</span></div>
                                  <div>Contact: <span className="text-neutral-700 dark:text-neutral-250">{order.customerPhone}</span></div>
                                  {order.deliveryAddress && (
                                    <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800 mt-1 space-y-0.5 text-[10px]">
                                      <div>Address Type: <span className="font-bold text-neutral-700 dark:text-neutral-250">{order.addressType || 'Home'}</span></div>
                                      <div>Address: <span className="text-neutral-700 dark:text-neutral-250">{order.deliveryAddress}</span></div>
                                      {order.latitude && order.longitude && (
                                        <div className="pt-0.5">
                                          <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-0.5 text-blue-500 hover:underline font-bold"
                                          >
                                            📍 Open in Google Maps
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold block">Ordered Dishes</span>
                                  <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300 font-medium">
                                    {order.items.map((item, idx) => (
                                      <li key={idx} className="flex justify-between">
                                        <span>{item.name} &times; {item.quantity}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-805/50 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Total Bill</span>
                                  <span className="font-logo font-extrabold text-base text-maroon dark:text-saffron">₹{orderTotal}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm(`Settle bill of ₹${orderTotal} for ${order.tableNo === 'Takeaway' ? 'Takeaway' : `Table ${order.tableNo}`}?`)) {
                                      settleBillAndReleaseTable(order.id, 'CASH');
                                    }
                                  }}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center font-logo"
                                >
                                  Settle Bill &amp; Release Table
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
                    <div>
                      <h3 className="font-logo font-extrabold text-lg text-neutral-700 dark:text-neutral-200">Historical Sales Receipts</h3>
                      <p className="text-xs text-neutral-500">Query and print settled customer transaction records</p>
                    </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold cursor-pointer outline-none"
                  >
                    <option value="daily">Daily Sales</option>
                    <option value="weekly">Weekly Sales</option>
                    <option value="monthly">Monthly Sales</option>
                  </select>
                  
                  <button 
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 dark:bg-neutral-800 text-white dark:text-neutral-200 border border-neutral-700 hover:border-saffron text-xs font-bold rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Search Field */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  placeholder="Search invoices by Invoice No, Customer Name, Table, or Date (e.g. INV-2026)..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-bg-dark text-xs focus:border-maroon dark:focus:border-saffron outline-none"
                />
              </div>

              {/* Table (desktop/tablet) */}
              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm glass hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800/30 text-neutral-400 font-bold uppercase text-[9px] tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                        <th className="p-4">Invoice No</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Table</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
                      {searchedInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-neutral-400 italic">No invoices found matching search.</td>
                        </tr>
                      ) : (
                        searchedInvoices.map(inv => (
                          <tr key={inv.invoiceNo} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/20 transition-all text-neutral-600 dark:text-neutral-300">
                            <td className="p-4 font-bold text-neutral-800 dark:text-neutral-150">{inv.invoiceNo}</td>
                            <td className="p-4">{new Date(inv.timestamp).toLocaleDateString()}</td>
                            <td className="p-4">{inv.customerName}</td>
                            <td className="p-4">{inv.tableNo === 'Takeaway' ? 'Takeaway' : `Table ${inv.tableNo}`}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded text-[9px] font-bold">
                                {inv.paymentMethod}
                              </span>
                            </td>
                            <td className="p-4 font-logo font-extrabold text-neutral-800 dark:text-neutral-100">₹{inv.total}</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="p-1 px-2.5 bg-maroon/5 hover:bg-maroon/10 dark:bg-saffron/5 dark:hover:bg-saffron/10 text-maroon dark:text-saffron rounded-lg font-bold text-[10px] transition-all"
                              >
                                View Bill
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoices Card Grid (mobile only) */}
              <div className="block md:hidden space-y-4">
                {searchedInvoices.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-bg-dark rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-450 italic text-xs glass">
                    No invoices found matching search.
                  </div>
                ) : (
                  searchedInvoices.map(inv => (
                    <div 
                      key={inv.invoiceNo} 
                      className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm glass flex flex-col gap-2.5 text-xs text-neutral-600 dark:text-neutral-300"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-2">
                        <span className="font-bold text-neutral-800 dark:text-neutral-150">{inv.invoiceNo}</span>
                        <span className="text-[10px] text-neutral-400 font-semibold">{new Date(inv.timestamp).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-neutral-400 font-semibold">Customer:</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-100">{inv.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400 font-semibold">Table / Mode:</span>
                          <span>{inv.tableNo === 'Takeaway' ? 'Takeaway' : `Table ${inv.tableNo}`}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400 font-semibold">Payment Method:</span>
                          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded text-[9px] font-bold">
                            {inv.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Total Amount</span>
                          <span className="font-logo font-extrabold text-sm text-neutral-800 dark:text-neutral-100">₹{inv.total}</span>
                        </div>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 px-4 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          View Bill
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          </>
        ) : (
            // DETAILED RECEIPT / PRINTABLE VIEW
            <div className="max-w-md mx-auto bg-white dark:bg-bg-dark border border-neutral-250 dark:border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6 animate-scale-up relative">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-450 hover:text-neutral-600 z-10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <h4 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron">SRI VIJAYA DURGA RESTAURANT</h4>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Family Dining A/C Hall</p>
                <p className="text-[9px] text-neutral-400 leading-none">NH-16, Bypass Road, Guntur, AP</p>
              </div>

              <div className="border-t border-b border-neutral-150 dark:border-neutral-800/80 py-3 text-[10.5px] font-semibold text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="flex justify-between"><span>Invoice No:</span><span className="font-bold text-neutral-700 dark:text-neutral-200">{selectedInvoice.invoiceNo}</span></div>
                <div className="flex justify-between"><span>Order ID:</span><span>{selectedInvoice.orderId}</span></div>
                <div className="flex justify-between"><span>Date / Time:</span><span>{new Date(selectedInvoice.timestamp).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Dining Table:</span><span>{selectedInvoice.tableNo === 'Takeaway' ? 'Takeaway' : `Table ${selectedInvoice.tableNo}`}</span></div>
                <div className="flex justify-between"><span>Customer Name:</span><span>{selectedInvoice.customerName}</span></div>
                <div className="flex justify-between"><span>Payment Method:</span><span className="uppercase font-extrabold">{selectedInvoice.paymentMethod}</span></div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Bill Details</h5>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/40 text-xs">
                  {selectedInvoice.items.map((i, idx) => (
                    <li key={idx} className="py-2 flex justify-between">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{i.name} &times; {i.quantity}</span>
                      <span className="font-logo font-extrabold">₹{i.price * i.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Totals */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-1.5 text-xs text-neutral-500 font-semibold">
                <div className="flex justify-between text-sm font-extrabold text-neutral-800 dark:text-neutral-100 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                  <span>Total Amount Paid:</span>
                  <span className="text-maroon dark:text-saffron font-logo text-base">₹{selectedInvoice.total}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const printW = window.open('', '_blank', 'width=400,height=600');
                    if (!printW) return;
                    printW.document.write(`
                      <html>
                        <head>
                          <title>Receipt - ${selectedInvoice.invoiceNo}</title>
                          <style>
                            body { font-family: monospace; padding: 20px; font-size: 12px; }
                            .line { display: flex; justify-content: space-between; margin: 3px 0; }
                            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                            .center { text-align: center; }
                            .bold { font-weight: bold; }
                          </style>
                        </head>
                        <body>
                          <h2 class="center">SRI VIJAYA DURGA</h2>
                          <p class="center font-logo" style="margin:-10px 0 10px 0;">Family AC Restaurant</p>
                          <div class="divider"></div>
                          <div class="line"><span>Invoice:</span><span>${selectedInvoice.invoiceNo}</span></div>
                          <div class="line"><span>Table:</span><span>${selectedInvoice.tableNo}</span></div>
                          <div class="line"><span>Customer:</span><span>${selectedInvoice.customerName}</span></div>
                          <div class="line"><span>Method:</span><span>${selectedInvoice.paymentMethod}</span></div>
                          <div class="line"><span>Date:</span><span>${new Date(selectedInvoice.timestamp).toLocaleString()}</span></div>
                          <div class="divider"></div>
                          <div class="bold line"><span>Item</span><span>Qty * Price</span></div>
                          ${selectedInvoice.items.map(i => `
                            <div class="line"><span>${i.name}</span><span>${i.quantity} * ₹${i.price}</span></div>
                          `).join('')}
                          <div class="divider"></div>
                          <div class="bold line" style="font-size:14px;"><span>Total Amount:</span><span>₹${selectedInvoice.total}</span></div>
                          <div class="divider"></div>
                          <p class="center">Thank you for dining with us!</p>
                          <script>window.onload = function() { window.print(); window.close(); }</script>
                        </body>
                      </html>
                    `);
                    printW.document.close();
                  }}
                  className="flex-1 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-850 font-semibold text-xs rounded-xl transition-all"
                >
                  Back to List
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5b. PARCEL ORDERS VIEW */}
      {activeTab === 'parcels' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <button
              onClick={() => setParcelSubTab('active')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                parcelSubTab === 'active'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Active Takeaway Orders
            </button>
            <button
              onClick={() => setParcelSubTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                parcelSubTab === 'history'
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Takeaway History
            </button>
          </div>

          {parcelSubTab === 'active' ? (
            <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass">
              <h4 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                Active Takeaways &amp; Status Control
              </h4>
              
              {orders.filter(o => o.isParcel && o.status !== 'COMPLETED' && o.status !== 'PICKED_UP' && o.status !== 'PAID' && o.status !== 'CANCELLED').length === 0 ? (
                <div className="text-center py-12 text-neutral-450 italic text-xs">
                  No active takeaway orders currently in kitchen.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.filter(o => o.isParcel && o.status !== 'COMPLETED' && o.status !== 'PICKED_UP' && o.status !== 'PAID' && o.status !== 'CANCELLED').map(order => {
                    const orderTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                    const minutesElapsed = Math.floor((Date.now() - order.timestamp) / 60000);
                    return (
                      <div key={order.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-850/10 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-805 pb-2">
                            <span className="px-2 py-0.5 bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron rounded text-xs font-black font-logo">
                              🥡 Takeaway
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              order.status === 'NEW' 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                                : order.status === 'ACCEPTED'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                                : order.status === 'PREPARING'
                                ? 'bg-maroon/10 text-maroon dark:bg-saffron/10 dark:text-saffron'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-[10px] text-neutral-450 font-semibold space-y-1">
                            <div>Order ID: <span className="font-mono text-neutral-600 dark:text-neutral-350">{order.id}</span></div>
                            <div>Customer: <span className="text-neutral-700 dark:text-neutral-250 font-bold">{order.customerName}</span></div>
                            {order.customerPhone && <div>Phone: <span className="text-neutral-700 dark:text-neutral-250">{order.customerPhone}</span></div>}
                            <div className="flex items-center gap-1">
                              <span>Time:</span>
                              <span className={`flex items-center gap-0.5 font-bold ${minutesElapsed >= 15 ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-355'}`}>
                                {minutesElapsed}m ago
                              </span>
                            </div>
                            {order.paymentMethod && (
                              <div>Pay Mode: <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-neutral-700 dark:text-neutral-300">{order.paymentMethod}</span></div>
                            )}
                            {order.deliveryAddress && (
                              <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800 mt-1 space-y-0.5">
                                <div>Address Type: <span className="font-bold text-neutral-700 dark:text-neutral-250">{order.addressType || 'Home'}</span></div>
                                <div>Address: <span className="text-neutral-700 dark:text-neutral-250">{order.deliveryAddress}</span></div>
                                {order.latitude && order.longitude && (
                                  <div className="pt-0.5">
                                    <a 
                                      href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-blue-500 hover:underline font-bold"
                                    >
                                      📍 Open in Google Maps
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {order.specialNotes && (
                            <div className="p-2 bg-saffron/10 border border-saffron/20 rounded-xl text-[10px] text-neutral-650 dark:text-saffron italic">
                              Notes: "{order.specialNotes}"
                            </div>
                          )}

                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-wider text-neutral-450 font-bold block">Ordered Dishes</span>
                            <ul className="text-xs space-y-1 text-neutral-600 dark:text-neutral-300 font-medium">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between">
                                  <span>{item.name} &times; {item.quantity}</span>
                                  <span>₹{item.price * item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-805/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-450 font-bold uppercase">Total Bill</span>
                            <span className="font-logo font-extrabold text-base text-maroon dark:text-saffron">₹{orderTotal}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            {order.status === 'NEW' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer font-logo border-none"
                              >
                                Accept Takeaway Order
                              </button>
                            )}
                            {order.status === 'ACCEPTED' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer font-logo border-none"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'READY')}
                                className="w-full py-1.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow transition-all cursor-pointer font-logo border-none"
                              >
                                Mark Ready for Pickup
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer font-logo border-none"
                              >
                                Mark Picked Up &amp; Completed
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this takeaway order?')) {
                                  updateOrderStatus(order.id, 'CANCELLED');
                                }
                              }}
                              className="w-full py-1 bg-transparent text-red-500 hover:bg-red-50/10 font-bold text-[10px] rounded-xl transition-all cursor-pointer border border-red-500/20"
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm glass flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">Time Period</label>
                    <select
                      value={parcelHistoryTimeFilter}
                      onChange={(e) => setParcelHistoryTimeFilter(e.target.value as any)}
                      className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 rounded-xl text-xs font-semibold cursor-pointer outline-none text-neutral-800 dark:text-neutral-200"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-neutral-400 mb-1">Order Status</label>
                    <select
                      value={parcelHistoryStatusFilter}
                      onChange={(e) => setParcelHistoryStatusFilter(e.target.value as any)}
                      className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 rounded-xl text-xs font-semibold cursor-pointer outline-none text-neutral-800 dark:text-neutral-200"
                    >
                      <option value="ALL">All States</option>
                      <option value="COMPLETED">Completed / Picked Up</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">History Volume</span>
                  <span className="font-logo font-black text-sm text-neutral-750 dark:text-neutral-200">
                    {filteredParcelHistory.length} Tickets
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass">
                <h4 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  Takeaway Sales &amp; Cancellation Log
                </h4>

                {filteredParcelHistory.length === 0 ? (
                  <div className="text-center py-12 text-neutral-450 italic text-xs">
                    No historical orders match the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-bold">
                          <th className="py-3 px-2">Order ID</th>
                          <th className="py-3 px-2">Date / Time</th>
                          <th className="py-3 px-2">Customer Details</th>
                          <th className="py-3 px-2">Items</th>
                          <th className="py-3 px-2">Pay Mode</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParcelHistory.map(order => {
                          const orderTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                          const orderDate = new Date(order.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                          const orderTime = new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <tr key={order.id} className="border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/5">
                              <td className="py-3 px-2 font-mono font-bold text-neutral-700 dark:text-neutral-300">{order.id}</td>
                              <td className="py-3 px-2 text-neutral-500">
                                <div>{orderDate}</div>
                                <div className="text-[10px] opacity-75">{orderTime}</div>
                              </td>
                              <td className="py-3 px-2 font-semibold">
                                <div>{order.customerName}</div>
                                <div className="text-[10px] text-neutral-400 font-normal">{order.customerPhone}</div>
                              </td>
                              <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate animate-fade-in" title={order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}>
                                {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                              </td>
                              <td className="py-3 px-2">
                                <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-bold text-[9px] text-neutral-750 dark:text-neutral-300">
                                  {order.paymentMethod || 'UPI'}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  order.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right font-logo font-black text-maroon dark:text-saffron">₹{orderTotal}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Settings form panel */}
          <div className="lg:col-span-2 bg-white dark:bg-bg-dark border border-neutral-250 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass">
            <h3 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-155 dark:border-neutral-800 pb-3 mb-6 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-maroon dark:text-saffron" /> Merchant Checkout Configuration
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1">UPI Address (Virtual Payment Address)</label>
                <input 
                  type="text"
                  required
                  value={inputUpi}
                  onChange={(e) => setInputUpi(e.target.value)}
                  placeholder="9030121200-2@ybl"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none font-semibold font-logo"
                />
                <p className="text-[10px] text-neutral-450 mt-1">UPI address where customer scanning flows will transfer balances.</p>
              </div>

              {/* Visual QR Code Image Asset Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1">Select QR Code Banner Image</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: '/phonepe_qr.png', label: 'PhonePe Scanner' }
                  ].map(qrOpt => (
                    <div 
                      key={qrOpt.id}
                      onClick={() => setInputQrUrl(qrOpt.id)}
                      className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center gap-2 transition-all relative ${
                        inputQrUrl === qrOpt.id 
                          ? 'border-maroon dark:border-saffron bg-maroon/5 dark:bg-saffron/5' 
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20'
                      }`}
                    >
                      <img 
                        src={qrOpt.id} 
                        alt={qrOpt.label} 
                        className="w-full aspect-square object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                      />
                      <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">{qrOpt.label}</span>
                      {inputQrUrl === qrOpt.id && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-maroon dark:bg-saffron rounded-full flex items-center justify-center text-[8px] text-white dark:text-maroon font-bold shadow">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow-md transition-all hover:opacity-90"
              >
                Save configurations &amp; Sync
              </button>

            </form>
          </div>

          {/* QR Code generator/printer */}
          <div className="lg:col-span-1 bg-white dark:bg-bg-dark border border-neutral-255 dark:border-neutral-800 rounded-3xl p-6 shadow-md glass space-y-4">
            <h3 className="font-logo font-extrabold text-sm uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-150 dark:border-neutral-800 pb-3 mb-2 flex items-center gap-1.5">
              <QrCode className="w-4 h-4" /> Table QR Codes
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Select Table Number</label>
                <select 
                  value={selectedQRTable}
                  onChange={(e) => setSelectedQRTable(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold cursor-pointer outline-none"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.number}>Table {t.number}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl text-center bg-neutral-50/50 dark:bg-neutral-850/10">
                {renderQRPreview()}
                <h4 className="font-logo font-extrabold text-xs text-neutral-700 dark:text-neutral-200 mt-3">Table {selectedQRTable} Menu QR</h4>
              </div>

              <button 
                onClick={handlePrintQR}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-900 border border-neutral-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" /> Print QR Ticket
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 7. WEBSITE CMS VIEW */}
      {activeTab === 'cms' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in select-none">
          
          {/* CMS Sub-Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-bg-dark border border-neutral-250 dark:border-neutral-800 rounded-3xl p-5 shadow-sm glass space-y-2">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-neutral-450 dark:text-neutral-500 mb-3 px-2">CMS Modules</h4>
            {[
              { id: 'general', label: 'General Info' },
              { id: 'home', label: 'Home Page' },
              { id: 'about', label: 'About Section' },
              { id: 'contact', label: 'Contact Section' },
              { id: 'gallery', label: 'Gallery Showcase' },
              { id: 'menu_card', label: 'Menu Card PDF' },
              { id: 'footer', label: 'Footer Links' },
              { id: 'hours', label: 'Opening Hours' },
              { id: 'offers', label: 'Offers & Promos' },
              { id: 'popup', label: 'Popup Alert' },
              { id: 'seo', label: 'SEO Metadata' },
              { id: 'theme', label: 'Theme Assets' },
              { id: 'versions', label: 'Version History' }
            ].map(subTab => (
              <button
                key={subTab.id}
                type="button"
                onClick={() => setCmsSubTab(subTab.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative cursor-pointer border-none flex justify-between items-center ${
                  cmsSubTab === subTab.id
                    ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-850 bg-transparent'
                }`}
              >
                <span>{subTab.label}</span>
                {cmsSubTab === subTab.id && <span className="text-[10px]">●</span>}
              </button>
            ))}
          </div>

          {/* CMS Workspace Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-bg-dark border border-neutral-250 dark:border-neutral-800 rounded-3xl p-6 shadow-sm glass space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-150 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron capitalize">{cmsSubTab.replace('_', ' ')} Settings</h3>
                <p className="text-[10px] text-neutral-450">Edit website dynamic content variables and sync changes instantly.</p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="/#home" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  Preview Website
                </a>
                <button 
                  type="button"
                  onClick={() => {
                    if (confirm('Discard all unsaved edits?')) {
                      setCmsForm(cmsSettings);
                    }
                  }}
                  className="px-3 py-1.5 border hover:bg-red-500/5 hover:text-red-500 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Reset Tab
                </button>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCmsSaving(true);
              const success = await updateCmsSettings(cmsForm);
              setCmsSaving(false);
              if (success) {
                alert('CMS configuration saved & broadcasted successfully!');
              } else {
                alert('Failed to save CMS configuration. Check field validation.');
              }
            }} className="space-y-6">

              {/* Sub-tab forms */}
              {cmsSubTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Restaurant Name</label>
                      <input 
                        type="text" 
                        required
                        value={cmsForm.restaurantName || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, restaurantName: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Restaurant Tagline</label>
                      <input 
                        type="text" 
                        required
                        value={cmsForm.restaurantTagline || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, restaurantTagline: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.restaurantDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, restaurantDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Owner Name</label>
                      <input 
                        type="text" 
                        value={cmsForm.ownerName || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, ownerName: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Established Year</label>
                      <input 
                        type="text" 
                        value={cmsForm.establishedYear || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, establishedYear: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'home' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Hero Title</label>
                    <input 
                      type="text" 
                      value={cmsForm.heroTitle || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, heroTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Hero Description</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.heroDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, heroDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Primary Button Text</label>
                      <input 
                        type="text" 
                        value={cmsForm.primaryButtonText || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, primaryButtonText: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Primary Button URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.primaryButtonUrl || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, primaryButtonUrl: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Secondary Button Text</label>
                      <input 
                        type="text" 
                        value={cmsForm.secondaryButtonText || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, secondaryButtonText: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Secondary Button URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.secondaryButtonUrl || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, secondaryButtonUrl: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Hero Background Image</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.heroBgImage || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, heroBgImage: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'heroBgImage')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">About Us Section Title</label>
                    <input 
                      type="text" 
                      value={cmsForm.aboutTitle || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, aboutTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">History &amp; Culinary Story</label>
                    <textarea 
                      rows={4} 
                      value={cmsForm.aboutHistory || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, aboutHistory: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Special Features list</label>
                    <input 
                      type="text" 
                      value={cmsForm.aboutSpecialFeatures || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, aboutSpecialFeatures: e.target.value})}
                      placeholder="e.g. AC cabins, Free WiFi, Catering"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Opening / Founder Year</label>
                      <input 
                        type="text" 
                        value={cmsForm.aboutOpeningYear || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, aboutOpeningYear: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Founder / Owner Name</label>
                      <input 
                        type="text" 
                        value={cmsForm.aboutOwnerName || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, aboutOwnerName: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">About Image Showcase</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.aboutImage || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, aboutImage: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'aboutImage')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Street Address</label>
                      <input 
                        type="text" 
                        value={cmsForm.contactAddress || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, contactAddress: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Landmark</label>
                      <input 
                        type="text" 
                        value={cmsForm.contactLandmark || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, contactLandmark: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Primary Phone</label>
                      <input 
                        type="text" 
                        value={cmsForm.primaryPhone || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, primaryPhone: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Secondary Phone</label>
                      <input 
                        type="text" 
                        value={cmsForm.secondaryPhone || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, secondaryPhone: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">WhatsApp Number</label>
                      <input 
                        type="text" 
                        value={cmsForm.whatsappNumber || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, whatsappNumber: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Support Email</label>
                      <input 
                        type="email" 
                        value={cmsForm.contactEmail || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, contactEmail: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Google Maps URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.googleMapsUrl || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, googleMapsUrl: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Google Maps Card Image</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.googleMapsCardImage || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, googleMapsCardImage: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'googleMapsCardImage')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'gallery' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block mb-3 uppercase tracking-wider">Replace and Reorder Gallery Images</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {JSON.parse(cmsForm.galleryImages || '[]').map((img: any, idx: number, arr: any[]) => (
                        <div key={img.id || idx} className="border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-850/10 flex gap-3 relative">
                          <img src={img.url} alt={img.caption} className="w-20 h-20 rounded-xl object-cover border border-neutral-200 dark:border-neutral-750" />
                          <div className="flex-1 space-y-2">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Image Caption / Title</label>
                              <input 
                                type="text"
                                value={img.caption}
                                onChange={(e) => {
                                  const updatedArr = [...arr];
                                  updatedArr[idx] = { ...img, caption: e.target.value };
                                  setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(updatedArr) });
                                }}
                                className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-750 bg-white dark:bg-neutral-800 text-xs outline-none"
                              />
                            </div>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  if (file.size > 5 * 1024 * 1024) {
                                    alert("File size exceeds 5MB");
                                    return;
                                  }

                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const imageObj = new Image();
                                    imageObj.onload = async () => {
                                      const canvas = document.createElement('canvas');
                                      let width = imageObj.width;
                                      let height = imageObj.height;
                                      const MAX_WIDTH = 1000;
                                      if (width > MAX_WIDTH) {
                                        height = Math.round((height * MAX_WIDTH) / width);
                                        width = MAX_WIDTH;
                                      }
                                      canvas.width = width;
                                      canvas.height = height;
                                      const ctx = canvas.getContext('2d');
                                      ctx?.drawImage(imageObj, 0, 0, width, height);

                                      const base64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
                                      const uploadRes = await fetch('/api/cms/upload', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          filename: file.name,
                                          type: 'image/jpeg',
                                          base64
                                        })
                                      });
                                      const uploadData = await uploadRes.json();
                                      if (uploadData.success && uploadData.url) {
                                        const updatedArr = [...arr];
                                        updatedArr[idx] = { ...img, url: uploadData.url };
                                        setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(updatedArr) });
                                      }
                                    };
                                    imageObj.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }}
                                className="text-[10px]"
                              />
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const updatedArr = [...arr];
                                const temp = updatedArr[idx];
                                updatedArr[idx] = updatedArr[idx - 1];
                                updatedArr[idx - 1] = temp;
                                setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(updatedArr) });
                              }}
                              className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-black flex items-center justify-center cursor-pointer disabled:opacity-30 border-none"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => {
                                const updatedArr = [...arr];
                                const temp = updatedArr[idx];
                                updatedArr[idx] = updatedArr[idx + 1];
                                updatedArr[idx + 1] = temp;
                                setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(updatedArr) });
                              }}
                              className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-black flex items-center justify-center cursor-pointer disabled:opacity-30 border-none"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this gallery item?')) {
                                  const updatedArr = arr.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(updatedArr) });
                                }
                              }}
                              className="w-5 h-5 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 text-xs flex items-center justify-center cursor-pointer border-none"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-150 dark:border-neutral-800 pt-4">
                    <h5 className="font-extrabold text-xs text-neutral-800 dark:text-neutral-200 mb-3">Upload New Gallery Image</h5>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB");
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageObj = new Image();
                            imageObj.onload = async () => {
                              const canvas = document.createElement('canvas');
                              let width = imageObj.width;
                              let height = imageObj.height;
                              const MAX_WIDTH = 1000;
                              if (width > MAX_WIDTH) {
                                height = Math.round((height * MAX_WIDTH) / width);
                                width = MAX_WIDTH;
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(imageObj, 0, 0, width, height);

                              const base64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
                              const uploadRes = await fetch('/api/cms/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  filename: file.name,
                                  type: 'image/jpeg',
                                  base64
                                })
                              });
                              const uploadData = await uploadRes.json();
                              if (uploadData.success && uploadData.url) {
                                const currentArr = JSON.parse(cmsForm.galleryImages || '[]');
                                currentArr.push({
                                  id: 'GAL-' + Date.now(),
                                  url: uploadData.url,
                                  caption: file.name.substring(0, file.name.lastIndexOf('.'))
                                });
                                setCmsForm({ ...cmsForm, galleryImages: JSON.stringify(currentArr) });
                                e.target.value = '';
                              }
                            };
                            imageObj.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'menu_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Menu Card Title</label>
                    <input 
                      type="text" 
                      value={cmsForm.menuCardTitle || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, menuCardTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.menuCardDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, menuCardDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Menu Card Cover Image</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.menuCardCoverImage || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, menuCardCoverImage: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'menuCardCoverImage')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Menu Card PDF File Link</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.menuPdfUrl || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, menuPdfUrl: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, 'menuPdfUrl')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'footer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Footer Description</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.footerDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, footerDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Copyright Line</label>
                    <input 
                      type="text" 
                      value={cmsForm.footerCopyright || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, footerCopyright: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Facebook URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.facebookLink || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, facebookLink: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Instagram URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.instagramLink || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, instagramLink: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">YouTube URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.youtubeLink || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, youtubeLink: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Twitter URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.twitterLink || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, twitterLink: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Website URL</label>
                      <input 
                        type="text" 
                        value={cmsForm.websiteLink || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, websiteLink: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'hours' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day}>
                        <label className="block text-xs font-bold text-neutral-500 mb-1">{day}</label>
                        <input 
                          type="text" 
                          value={cmsForm[`hours${day}`] || ''} 
                          onChange={(e) => setCmsForm({...cmsForm, [`hours${day}`]: e.target.value})}
                          className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Holiday / Maintenance Notice</label>
                    <input 
                      type="text" 
                      value={cmsForm.holidayNotice || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, holidayNotice: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              )}

              {cmsSubTab === 'offers' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h5 className="font-extrabold text-xs text-neutral-800 dark:text-neutral-200">Current Promotions &amp; Banners</h5>
                    <div className="space-y-2">
                      {JSON.parse(cmsForm.offersList || '[]').map((off: any, idx: number, arr: any[]) => (
                        <div key={off.id} className="flex gap-4 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-850/15 justify-between items-start">
                          <div className="flex gap-3 items-start">
                            <img src={off.image || '/tandoori_chicken.png'} alt={off.title} className="w-14 h-14 rounded-xl object-cover border border-neutral-200 dark:border-neutral-750 mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-black ${off.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-400'}`}>
                                  {off.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                {off.couponCode && <span className="font-mono text-[9px] font-black text-[#F4B400] bg-[#F4B400]/10 px-1.5 py-0.5 rounded border border-[#F4B400]/20">{off.couponCode}</span>}
                              </div>
                              <h6 className="font-black text-neutral-850 dark:text-neutral-100 text-xs uppercase leading-tight">{off.title}</h6>
                              <p className="text-[10px] text-neutral-500 leading-normal">{off.description}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedArr = [...arr];
                                updatedArr[idx] = { ...off, isActive: !off.isActive };
                                setCmsForm({ ...cmsForm, offersList: JSON.stringify(updatedArr) });
                              }}
                              className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[10px] font-bold cursor-pointer border-none"
                            >
                              Toggle
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this offer?')) {
                                  const updatedArr = arr.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, offersList: JSON.stringify(updatedArr) });
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 text-[10px] font-bold cursor-pointer border-none"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-150 dark:border-neutral-800 pt-4 space-y-4">
                    <h5 className="font-extrabold text-xs text-neutral-800 dark:text-neutral-200">Create New Promotion Banner</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">Offer Title</label>
                        <input 
                          type="text" 
                          value={newOffer.title}
                          onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                          className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none text-neutral-800 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">Coupon Code (Optional)</label>
                        <input 
                          type="text" 
                          value={newOffer.couponCode}
                          onChange={(e) => setNewOffer({...newOffer, couponCode: e.target.value})}
                          className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none text-neutral-800 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">Offer Description</label>
                      <input 
                        type="text" 
                        value={newOffer.description}
                        onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                        className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none text-neutral-800 dark:text-white font-bold"
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">Banner Image URL</label>
                        <input 
                          type="text" 
                          value={newOffer.image}
                          onChange={(e) => setNewOffer({...newOffer, image: e.target.value})}
                          className="w-full px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none text-neutral-800 dark:text-white font-bold"
                        />
                      </div>
                      <div className="pt-4">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.size > 5 * 1024 * 1024) {
                              alert("File size exceeds 5MB");
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const imageObj = new Image();
                              imageObj.onload = async () => {
                                const canvas = document.createElement('canvas');
                                let width = imageObj.width;
                                let height = imageObj.height;
                                const MAX_WIDTH = 1000;
                                if (width > MAX_WIDTH) {
                                  height = Math.round((height * MAX_WIDTH) / width);
                                  width = MAX_WIDTH;
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(imageObj, 0, 0, width, height);

                                const base64 = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
                                const uploadRes = await fetch('/api/cms/upload', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    filename: file.name,
                                    type: 'image/jpeg',
                                    base64
                                  })
                                });
                                const uploadData = await uploadRes.json();
                                if (uploadData.success && uploadData.url) {
                                  setNewOffer(prev => ({ ...prev, image: uploadData.url }));
                                }
                              };
                              imageObj.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newOffer.title || !newOffer.description) {
                          alert('Title and description are required');
                          return;
                        }
                        const currentArr = JSON.parse(cmsForm.offersList || '[]');
                        currentArr.push({
                          id: 'OFF-' + Date.now(),
                          ...newOffer
                        });
                        setCmsForm({ ...cmsForm, offersList: JSON.stringify(currentArr) });
                        setNewOffer({ title: '', description: '', image: '', couponCode: '', isActive: true });
                      }}
                      className="px-4 py-2 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow cursor-pointer border-none"
                    >
                      Create Promo
                    </button>
                  </div>
                </div>
              )}

              {cmsSubTab === 'popup' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 mb-2 dark:border-neutral-800">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">Enable Popup Alert Notice</span>
                      <p className="text-[10px] text-neutral-450">Displays a floating alert modal overlay to first-time landing guests.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCmsForm({ ...cmsForm, popupEnabled: !cmsForm.popupEnabled })}
                      className="border-none bg-transparent cursor-pointer"
                    >
                      {cmsForm.popupEnabled ? (
                        <ToggleRight className="w-10 h-10 text-maroon dark:text-saffron" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-neutral-450" />
                      )}
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Popup Notice Title</label>
                    <input 
                      type="text" 
                      value={cmsForm.popupTitle || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, popupTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Description / Content</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.popupDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, popupDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Popup Banner Image</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="text" 
                          value={cmsForm.popupImage || ''} 
                          onChange={(e) => setCmsForm({...cmsForm, popupImage: e.target.value})}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'popupImage')}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Popup Action Button Text</label>
                      <input 
                        type="text" 
                        value={cmsForm.popupButtonText || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, popupButtonText: e.target.value})}
                        placeholder="e.g. Order Now, Explore Menu"
                        className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Website Browser Title (Tab name)</label>
                    <input 
                      type="text" 
                      value={cmsForm.seoTitle || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, seoTitle: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Meta Keywords</label>
                    <input 
                      type="text" 
                      value={cmsForm.seoMetaKeywords || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, seoMetaKeywords: e.target.value})}
                      placeholder="comma-separated tags: restaurant, ac, food, near me"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Meta Description (Search engine summary snippet)</label>
                    <textarea 
                      rows={3} 
                      value={cmsForm.seoMetaDescription || ''} 
                      onChange={(e) => setCmsForm({...cmsForm, seoMetaDescription: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Social Preview Card OG Image</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={cmsForm.seoOgImage || ''} 
                        onChange={(e) => setCmsForm({...cmsForm, seoOgImage: e.target.value})}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'seoOgImage')}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'theme' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Header Brand Logo</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="text" 
                          value={cmsForm.restaurantLogo || ''} 
                          onChange={(e) => setCmsForm({...cmsForm, restaurantLogo: e.target.value})}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'restaurantLogo')}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Website Browser Favicon</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="text" 
                          value={cmsForm.favicon || ''} 
                          onChange={(e) => setCmsForm({...cmsForm, favicon: e.target.value})}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-755 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold outline-none"
                        />
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'favicon')}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cmsSubTab === 'versions' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-neutral-850 dark:text-neutral-200 text-xs uppercase tracking-wider">Save History logs</h4>
                  {cmsVersions.length === 0 ? (
                    <div className="p-8 border dark:border-neutral-800 rounded-2xl text-center text-xs text-neutral-500">
                      No saved versions found. Save changes to create logs.
                    </div>
                  ) : (
                    <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-850/10">
                      <table className="w-full border-collapse text-left text-xs font-semibold">
                        <thead>
                          <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                            <th className="p-3">Version ID</th>
                            <th className="p-3">Saved By</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cmsVersions.map((v, i) => (
                            <tr key={v.id} className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/30">
                              <td className="p-3 font-bold text-neutral-800 dark:text-neutral-200">
                                #{v.id} {i === 0 && <span className="ml-1 text-[9px] bg-[#F4B400]/20 text-[#F4B400] font-black px-1.5 py-0.5 rounded">LATEST</span>}
                              </td>
                              <td className="p-3 text-neutral-500 font-mono">{v.author}</td>
                              <td className="p-3 text-neutral-500">{new Date(v.createdAt).toLocaleString()}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to restore the website to Version #${v.id}?`)) {
                                      setCmsSaving(true);
                                      const success = await restoreCmsVersion(v.id);
                                      setCmsSaving(false);
                                      if (success) {
                                        alert(`Website content restored successfully to version #${v.id}!`);
                                      } else {
                                        alert('Failed to restore version.');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#F4B400]/10 hover:bg-[#F4B400]/25 text-[#F4B400] font-bold text-[10px] cursor-pointer border-none"
                                >
                                  Restore Version
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {cmsSubTab !== 'versions' && (
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-150 dark:border-neutral-800">
                  <button 
                    type="button"
                    onClick={() => setCmsForm(cmsSettings)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-350 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                  >
                    Cancel changes
                  </button>
                  <button 
                    type="submit"
                    disabled={cmsSaving}
                    className="px-5 py-2.5 rounded-xl bg-maroon text-white dark:bg-saffron dark:text-maroon font-logo font-bold text-xs shadow-md cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {cmsSaving ? 'Saving...' : 'Save & Publish Live'}
                  </button>
                </div>
              )}

            </form>
          </div>

        </div>
      )}

      {/* --- ADD / EDIT DISH FORM MODAL --- */}
      {showDishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden glass relative">
            <div className="h-1.5 bg-gradient-to-r from-maroon to-saffron"></div>
            
            <form onSubmit={handleSaveDish} className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                <h3 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron">
                  {editingDish ? 'Edit Dish details' : 'Add New Dish'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowDishModal(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-850"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-neutral-500">
                <div>
                  <label className="block mb-1">Dish Name</label>
                  <input 
                    type="text" 
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Price (INR)</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={dishForm.price || ''}
                      onChange={(e) => setDishForm(prev => ({ ...prev, price: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Type</label>
                    <select
                      value={dishForm.type}
                      onChange={(e) => setDishForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none cursor-pointer text-neutral-850 dark:text-neutral-100 font-semibold"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Category</label>
                  {menuSubTab === 'takeaway' ? (
                    <select
                      value={dishForm.category}
                      onChange={(e) => setDishForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none cursor-pointer text-neutral-850 dark:text-neutral-100 font-semibold"
                    >
                      <option value="Couple Pack">Couple Pack</option>
                      <option value="Family Pack">Family Pack</option>
                      <option value="Bucket Biryani">Bucket Biryani</option>
                    </select>
                  ) : (
                    <select
                      value={dishForm.category}
                      onChange={(e) => setDishForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none cursor-pointer text-neutral-850 dark:text-neutral-100 font-semibold"
                    >
                      <option value="Veg Biryani">Veg Biryani</option>
                      <option value="Non-Veg Biryani">Non-Veg Biryani</option>
                      <option value="Veg Fried Rice">Veg Fried Rice</option>
                      <option value="Non-Veg Fried Rice">Non-Veg Fried Rice</option>
                      <option value="Veg Starters">Veg Starters</option>
                      <option value="Non-Veg Starters">Non-Veg Starters</option>
                      <option value="Sea Food Starters">Sea Food Starters</option>
                      <option value="Egg Items">Egg Items</option>
                      <option value="Tandoori Non-Veg">Tandoori Non-Veg</option>
                      <option value="Tandoori Veg">Tandoori Veg</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Image URL</label>
                  <input 
                    type="text" 
                    required
                    value={dishForm.image}
                    onChange={(e) => setDishForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block mb-1">Dish Description</label>
                  <textarea 
                    rows={3}
                    value={dishForm.description}
                    onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short summary of spices, main ingredients..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDishModal(false)}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-855 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-xs rounded-xl shadow"
                >
                  {editingDish ? 'Update Dish' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLE RELEASE CONFIRMATION MODAL --- */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden glass">
            
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-logo font-extrabold text-neutral-800 dark:text-neutral-100 text-sm tracking-wide uppercase">
                Force Release Table
              </h3>
              <button 
                onClick={() => setShowReleaseModal(false)}
                className="text-neutral-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50">
                <span className="font-logo font-extrabold text-xl">T-{selectedTableForRelease}</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                Are you sure you want to forcibly release <strong className="text-neutral-900 dark:text-white">Table {selectedTableForRelease}</strong> back to Available?
              </p>
              <p className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-2 rounded-lg font-semibold">
                Warning: This clears any active booking immediately!
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
              <button 
                onClick={() => setShowReleaseModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReleaseTable}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
              >
                Action: Release Table
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
