import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Invoice } from '../context/AppContext';
import AuthGate from '../components/AuthGate';
import ImageWithFallback from '../components/ImageWithFallback';
import { 
  BarChart3, Users, DollarSign, ClipboardList, LogOut, Download, 
  Printer, QrCode, UtensilsCrossed, Star, Settings, Search, 
  Edit, Trash2, PlusCircle, X, 
  ToggleLeft, ToggleRight
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

const getTableCapacityText = (tableNum: string, defaultCapacity: number) => {
  switch (tableNum) {
    // Ground Floor
    case 'G1': return '👥 4 Members';
    case 'G2': return '👥 6 Members';
    case 'G3': return '👥 6 Members';
    case 'G4': return '👥 6 Members';
    case 'G5': return '👥 5 Members';
    
    // Section A
    case 'A1': return '👥 10 Members';
    case 'A2': return '👥 10 Members';
    case 'A3': return '👥 6 Members';
    case 'A4': return '👥 2 Members';
    case 'A5': return '👥 2 Members';
    
    // Section B
    case 'B1': return '👥 6 Members (Mandi)';
    case 'B2': return '👥 4 Members (Mandi)';
    case 'B3': return '👥 6 Members (Mandi)';
    
    // Section C
    case 'C1': return '👥 4 Members';
    case 'C2': return '👥 4 Members';
    case 'C3': return '👥 4 Members';
    
    // Section D
    case 'D1': return '👥 4 Members';
    case 'D2': return '👥 4 Members';
    case 'D3': return '👥 2 Members';
    
    default: return `👥 ${defaultCapacity} Members`;
  }
};

const AdminDashboard: React.FC = () => {
  const { 
    tables, orders, invoices, adminSession, logout, 
    upiId, qrCodeUrl, ratings, menuItems, 
    updateUpiSettings, updateMenu, getAverageRating,
    paymentNotifications, dismissNotification, dismissAllNotifications,
    parcelItems, updateParcelMenu, releaseTable, occupyTable, settleBillAndReleaseTable
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(!!adminSession);
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'ratings' | 'invoices' | 'settings'>('overview');
  const [menuSubTab, setMenuSubTab] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'active-bills' | 'history'>('active-bills');

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedQRTable, setSelectedQRTable] = useState<string>('G1');
  
  // Table Action States
  const [selectedTableForAction, setSelectedTableForAction] = useState<any | null>(null);
  const [showTableActionModal, setShowTableActionModal] = useState(false);

  const handleTableAction = (action: 'occupy' | 'release') => {
    if (!selectedTableForAction) return;
    if (action === 'occupy') {
      occupyTable(selectedTableForAction.number);
    } else if (action === 'release') {
      releaseTable(selectedTableForAction.number);
    }
    setShowTableActionModal(false);
    setSelectedTableForAction(null);
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
      <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700 no-print overflow-x-auto scrollbar-none gap-1 select-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
          { id: 'ratings', label: 'Guest Reviews', icon: Star },
          { id: 'invoices', label: 'Invoices', icon: ClipboardList },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedInvoice(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === tab.id
                ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
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
                        setSelectedTableForAction(t);
                        setShowTableActionModal(true);
                      }}
                      className={`py-3 text-center rounded-xl border font-bold text-xs shadow-inner flex flex-col items-center justify-center gap-0.5 select-none transition-transform duration-200 cursor-pointer hover:scale-105 hover:shadow-md ${statusColor}`}
                    >
                      <span>{t.number}</span>
                      <span className="text-[8px] font-semibold opacity-75 mt-0.5">{getTableCapacityText(t.number, t.capacity)}</span>
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
          </div>

          {/* Menu Items Card Grid */}
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-bg-dark rounded-3xl border border-neutral-200 dark:border-neutral-800 text-neutral-450 italic text-xs glass">
              No menu items match search query.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMenuItems.map(dish => (
                <div 
                  key={dish.id} 
                  className={`flex flex-col justify-between bg-white dark:bg-neutral-900/60 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md hover:border-maroon/20 dark:hover:border-saffron/30 transition-all duration-200 relative group ${
                    dish.disabled ? 'border-neutral-200/50 dark:border-neutral-800/50 opacity-75' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {/* Aspect Ratio Image Container */}
                  <div className="w-full aspect-[16/10] overflow-hidden relative bg-neutral-100 dark:bg-neutral-850 flex-shrink-0">
                    <ImageWithFallback 
                      src={dish.image} 
                      alt={dish.name} 
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-103 ${dish.disabled ? 'grayscale' : ''}`}
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md border ${
                        dish.type === 'veg' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${dish.type === 'veg' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {dish.type}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-neutral-950/70 border border-white/10 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-wider backdrop-blur-xs">
                        {dish.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h5 className="font-logo font-extrabold text-xs text-neutral-850 dark:text-neutral-100 line-clamp-1 leading-tight group-hover:text-maroon dark:group-hover:text-saffron transition-colors" title={dish.name}>
                        {dish.name}
                      </h5>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-2 leading-relaxed h-7">
                        {dish.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Pricing, Status, & Actions */}
                    <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/40 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-logo font-extrabold text-xs text-maroon dark:text-saffron bg-maroon/5 dark:bg-saffron/5 px-2 py-0.5 rounded-md">
                          ₹{dish.price}
                        </span>

                        {/* Toggle availability */}
                        <button
                          onClick={() => handleToggleDish(dish.id, !!dish.disabled)}
                          className="focus:outline-none transition-transform active:scale-95 flex items-center gap-1 text-[9px] font-extrabold tracking-wide"
                        >
                          {dish.disabled ? (
                            <div className="flex items-center gap-1">
                              <ToggleLeft className="w-5 h-5 text-neutral-300 dark:text-neutral-700" />
                              <span className="text-neutral-405 dark:text-neutral-500 uppercase">Disabled</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 uppercase">Enabled</span>
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Buttons (Edit / Delete) */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEditDish(dish)}
                          className="flex-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 border border-neutral-200/40 dark:border-neutral-700/40"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteDish(dish.id)}
                          className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 dark:hover:text-red-300/90 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 border border-red-500/20"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. GUEST REVIEWS / RATINGS VIEW */}
      {activeTab === 'ratings' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="font-logo font-extrabold text-lg text-neutral-700 dark:text-neutral-200">Guest Review Logs</h3>
            <p className="text-xs text-neutral-500">Live average scores and rating surveys collected upon checkout</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
                                  <div>Order ID: <span className="font-mono text-neutral-600 dark:text-neutral-350">{order.id}</span></div>
                                  <div>Guest Name: <span className="text-neutral-700 dark:text-neutral-250 font-bold">{order.customerName}</span></div>
                                  <div>Contact: <span className="text-neutral-700 dark:text-neutral-250">{order.customerPhone}</span></div>
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
                      <option value="Specials">Specials</option>
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
                      <option value="Veg Curries">Veg Curries</option>
                      <option value="Non-Veg Curries">Non-Veg Curries</option>
                      <option value="Roti Basket">Roti Basket</option>
                      <option value="Soups Veg">Soups Veg</option>
                      <option value="Soups Non-Veg">Soups Non-Veg</option>
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
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow"
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

      {/* --- TABLE ACTION MODAL --- */}
      {showTableActionModal && selectedTableForAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden glass">
            
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-logo font-extrabold text-neutral-800 dark:text-neutral-100 text-sm tracking-wide uppercase">
                Table Management
              </h3>
              <button 
                onClick={() => {
                  setShowTableActionModal(false);
                  setSelectedTableForAction(null);
                }}
                className="text-neutral-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border font-logo font-extrabold text-xl ${
                selectedTableForAction.status === 'AVAILABLE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                  : selectedTableForAction.status === 'OCCUPIED'
                  ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-850/50'
              }`}>
                <span>{selectedTableForAction.number}</span>
              </div>

              <div>
                <p className="text-xs text-neutral-400 uppercase font-extrabold">Current Status</p>
                <p className={`text-sm font-bold mt-0.5 ${
                  selectedTableForAction.status === 'AVAILABLE'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selectedTableForAction.status === 'OCCUPIED'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {selectedTableForAction.status === 'AVAILABLE'
                    ? 'Available'
                    : selectedTableForAction.status === 'OCCUPIED'
                    ? 'Occupied'
                    : 'Billing Pending'}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1.5 font-semibold opacity-85">
                  {getTableCapacityText(selectedTableForAction.number, selectedTableForAction.capacity)}
                </p>
              </div>

              {selectedTableForAction.status === 'OCCUPIED' && (
                <div className="text-left text-xs bg-neutral-50 dark:bg-neutral-850/30 border border-neutral-100 dark:border-neutral-805 p-3 rounded-xl space-y-1 font-medium">
                  {selectedTableForAction.customerName && (
                    <div>Guest: <span className="font-bold text-neutral-700 dark:text-neutral-250">{selectedTableForAction.customerName}</span></div>
                  )}
                  {selectedTableForAction.customerPhone && (
                    <div>Phone: <span className="font-bold text-neutral-700 dark:text-neutral-250">{selectedTableForAction.customerPhone}</span></div>
                  )}
                  {selectedTableForAction.bookingTimeSlot && (
                    <div>Slot: <span className="font-bold text-neutral-700 dark:text-neutral-250">{selectedTableForAction.bookingTimeSlot}</span></div>
                  )}
                </div>
              )}

              <p className="text-xs text-neutral-550 dark:text-neutral-400 font-medium">
                {selectedTableForAction.status === 'AVAILABLE'
                  ? 'Mark this table as Occupied for walk-in diners. This will prevent customers from booking it online.'
                  : 'Release this table to make it Available for new bookings.'}
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
              <button 
                onClick={() => {
                  setShowTableActionModal(false);
                  setSelectedTableForAction(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
              >
                Cancel
              </button>
              {selectedTableForAction.status === 'AVAILABLE' ? (
                <button 
                  onClick={() => handleTableAction('occupy')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all"
                >
                  Mark Occupied
                </button>
              ) : (
                <button 
                  onClick={() => handleTableAction('release')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  Release Table
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
