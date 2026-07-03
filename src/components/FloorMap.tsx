import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, User, Phone as PhoneIcon, Calendar } from 'lucide-react';

const FloorMap: React.FC = () => {
  const { tables, reserveTable, activeTable } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'PENDING'>('ALL');
  
  // Reservation modal states
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [slot, setSlot] = useState('12:00 PM - 02:00 PM');

  const handleTableClick = (tableNum: string, currentStatus: string) => {
    if (currentStatus === 'AVAILABLE') {
      setSelectedTable(tableNum);
    }
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    if (!customerName || !customerPhone) {
      alert('Please fill out all fields.');
      return;
    }
    if (customerPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const success = reserveTable(selectedTable, customerName, customerPhone, slot);
    if (success) {
      const tableNum = selectedTable;
      setSelectedTable(null);
      setCustomerName('');
      setCustomerPhone('');
      // Navigate to menu
      window.location.hash = `#menu?table=${tableNum}`;
    } else {
      alert('Table is no longer available.');
    }
  };

  // Filter tables
  const filteredTables = tables.filter(t => {
    const matchesSearch = t.number.toLowerCase().includes(search.toLowerCase()) || `table ${t.number}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const groundTables = filteredTables.filter(t => t.floor === 'ground');
  const firstTables = filteredTables.filter(t => t.floor === 'first');

  // Helper to get first floor tables by section letter
  const getSectionTables = (letter: string) => {
    return firstTables.filter(t => t.number.startsWith(letter));
  };

  const getTableClasses = (status: string, isCurTable: boolean) => {
    let borderClass = 'border-neutral-300 dark:border-neutral-700';
    let bgClass = 'bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-emerald-500 cursor-pointer hover:-translate-y-1';
    let statusLabel = 'Available';

    switch (status) {
      case 'OCCUPIED':
        borderClass = 'border-rose-450/70 dark:border-rose-900/50';
        bgClass = 'bg-rose-50/30 dark:bg-rose-950/10 text-rose-800/80 dark:text-rose-400/80 cursor-not-allowed opacity-60';
        statusLabel = 'Occupied / Eating';
        break;
      case 'PENDING':
        borderClass = 'border-orange-450/70 dark:border-orange-900/50';
        bgClass = 'bg-orange-50/30 dark:bg-orange-950/10 text-orange-800/80 dark:text-orange-400/80 cursor-not-allowed opacity-60';
        statusLabel = 'Billing Pending';
        break;
    }

    if (isCurTable) {
      borderClass += ' ring-2 ring-saffron dark:ring-maroon';
    }

    return { borderClass, bgClass, statusLabel };
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-bg-dark p-4 rounded-2xl border border-maroon/10 dark:border-saffron/10 shadow-sm glass">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            placeholder="Search tables (e.g. Table G3, A4)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
          />
        </div>

        {/* Filter select */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none font-semibold cursor-pointer"
          >
            <option value="ALL">All Tables</option>
            <option value="AVAILABLE">Available (Green)</option>
            <option value="OCCUPIED">Occupied / Dining (Red)</option>
            <option value="PENDING">Billing Pending (Orange)</option>
          </select>
        </div>
      </div>

      {/* Color Status Legend */}
      <div className="flex flex-wrap gap-6 justify-center bg-white dark:bg-bg-dark border border-maroon/5 dark:border-saffron/5 p-4 rounded-2xl shadow-sm glass text-xs font-semibold select-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/30 animate-pulse"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/30 animate-pulse"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-md shadow-orange-500/30 animate-pulse"></span>
          <span>Billing Pending</span>
        </div>
      </div>

      {/* visual dining floor layout */}
      <div className="bg-white dark:bg-bg-dark rounded-3xl p-6 sm:p-10 border border-maroon/10 dark:border-saffron/10 shadow-lg relative glass">
        
        {/* Stage Indicator */}
        <div className="w-full text-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 py-2 rounded-xl text-xs font-logo tracking-widest text-neutral-500 dark:text-neutral-400 font-extrabold uppercase mb-12 select-none shadow-inner">
          Dining Hall Center (A/C Fine Dine)
        </div>

        {/* Floor Sections Grid */}
        <div className="space-y-12">
          
          {/* Ground Floor layout */}
          {groundTables.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-logo font-extrabold text-maroon dark:text-saffron text-lg border-b border-maroon/10 dark:border-saffron/10 pb-1">
                Ground Floor
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {groundTables.map((t) => {
                  const isCurTable = activeTable === t.number;
                  const { borderClass, bgClass, statusLabel } = getTableClasses(t.status, isCurTable);

                  return (
                    <div 
                      key={t.id}
                      onClick={() => handleTableClick(t.number, t.status)}
                      className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm transition-all duration-300 select-none relative ${borderClass} ${bgClass}`}
                    >
                      <h4 className="font-logo font-extrabold text-xl mb-1">{t.number}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        t.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* First Floor layout */}
          {firstTables.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <h3 className="font-logo font-extrabold text-maroon dark:text-saffron text-lg border-b border-maroon/10 dark:border-saffron/10 pb-1">
                First Floor
              </h3>
              
              <div className="space-y-8">
                {(['A', 'B', 'C', 'D'] as const).map(sect => {
                  const sectTables = getSectionTables(sect);
                  if (sectTables.length === 0) return null;
                  
                  return (
                    <div key={sect} className="space-y-3 pl-4 border-l-2 border-maroon/20 dark:border-saffron/20">
                      <h4 className="font-logo font-extrabold text-sm text-neutral-600 dark:text-neutral-300 uppercase tracking-widest">Section {sect}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {sectTables.map((t) => {
                          const isCurTable = activeTable === t.number;
                          const { borderClass, bgClass, statusLabel } = getTableClasses(t.status, isCurTable);

                          return (
                            <div 
                              key={t.id}
                              onClick={() => handleTableClick(t.number, t.status)}
                              className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm transition-all duration-300 select-none relative ${borderClass} ${bgClass}`}
                            >
                              <h4 className="font-logo font-extrabold text-xl mb-1">{t.number}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                t.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                                'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400'
                              }`}>
                                {statusLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reservation details Form Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-bg-dark border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden glass relative">
            <div className="h-1.5 bg-gradient-to-r from-maroon to-saffron"></div>
            
            <div className="p-6">
              <h3 className="font-logo font-extrabold text-xl text-maroon dark:text-saffron mb-1">Reserve Dining Table</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">Completing reservation for Table {selectedTable}</p>
              
              <form onSubmit={handleReserveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Customer Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                      <PhoneIcon className="w-4 h-4" />
                    </span>
                    <input 
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10 digit mobile number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Dining Slot</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <select
                      value={slot}
                      onChange={(e) => setSlot(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm focus:border-maroon dark:focus:border-saffron outline-none cursor-pointer font-medium"
                    >
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                      <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                      <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                      <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                      <option value="07:00 PM - 09:00 PM">07:00 PM - 09:00 PM</option>
                      <option value="09:00 PM - 11:00 PM">09:00 PM - 11:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon rounded-xl text-xs font-bold shadow-md"
                  >
                    Confirm &amp; Proceed to Menu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FloorMap;
