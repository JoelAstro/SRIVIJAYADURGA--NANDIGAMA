/* ==========================================================================
   Sri Vijaya Durga Restaurant - Core Application Script
   ========================================================================== */

// --- STATIC MENU DATABASE ---
const MENU_ITEMS = [
  // Starters - Veg
  {
    id: 101,
    name: "Veg. Manchurian",
    description: "Crispy vegetable balls tossed in sweet, sour and spicy manchurian sauce.",
    price: 170,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 102,
    name: "Paneer Majestic",
    description: "Strips of cottage cheese cooked in curd, mint and green chillies glaze.",
    price: 240,
    category: "Starters",
    image: "paneer_tikka.png"
  },
  {
    id: 103,
    name: "Chilli Paneer",
    description: "Wok-tossed paneer cubes with bell peppers, onions and spicy soy-chilli glaze.",
    price: 230,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 104,
    name: "Mushroom 65",
    description: "Spicy deep-fried button mushrooms marinated in traditional South Indian spices.",
    price: 250,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 105,
    name: "Crispy Baby Corn",
    description: "Tender baby corn golden-fried and seasoned with chat masala and pepper.",
    price: 180,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=300"
  },

  // Starters - Non-Veg
  {
    id: 110,
    name: "RRR Chicken",
    description: "A spicy, dry-tossed green chilli and garlic seasoned chicken starter.",
    price: 300,
    category: "Starters",
    image: "tandoori_chicken.png"
  },
  {
    id: 111,
    name: "Chicken 65",
    description: "Classic deep-fried chicken cubes marinated in red chillies, ginger, and curry leaves.",
    price: 300,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1610057099443-fde8c4d90ef8?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 112,
    name: "Chilli Chicken",
    description: "Wok-tossed battered chicken cubes with peppers, green chillies, and soy sauce.",
    price: 290,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1598511726623-d73400609b40?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 113,
    name: "Chicken Lollipop (Dry)",
    description: "Crispy, deep-fried chicken wings pulled down, seasoned with Indo-Chinese spices.",
    price: 300,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 114,
    name: "Chicken Majestic",
    description: "Strips of chicken breast marinated in buttermilk, deep-fried and sautéed in curd.",
    price: 300,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 115,
    name: "Apollo Fish",
    description: "Spicy, batter-fried boneless fish cubes tossed in yogurt, curry leaves and green chillies.",
    price: 300,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 116,
    name: "Loose Prawns (Dry)",
    description: "Deep fried prawns lightly battered and tossed with garlic, green chillies and spring onions.",
    price: 360,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300"
  },

  // Starters - Tandoori
  {
    id: 120,
    name: "Tandoori Chicken (Half)",
    description: "Half chicken marinated in yogurt and Indian spices, grilled in a traditional tandoor.",
    price: 260,
    category: "Starters",
    image: "tandoori_chicken.png"
  },
  {
    id: 121,
    name: "Paneer Tikka",
    description: "Paneer chunks marinated in spiced yogurt and grilled in the tandoor with onions.",
    price: 250,
    category: "Starters",
    image: "paneer_tikka.png"
  },

  // Main Course - Biryani
  {
    id: 201,
    name: "Chicken Dum Biryani",
    description: "Signature Basmati rice layered with spiced raw chicken, saffron, and pure ghee cooked on slow dum.",
    price: 260,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 202,
    name: "Chicken Fry Biryani",
    description: "Long-grain basmati biryani rice served with crispy, spiced deep-fried chicken pieces.",
    price: 270,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 203,
    name: "Veg. Biryani",
    description: "Basmati rice cooked slow with seasonal vegetables, aromatic spices and rose water.",
    price: 180,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 204,
    name: "Paneer Biryani",
    description: "Richly flavored basmati rice layered with spiced paneer chunks and saffron.",
    price: 230,
    category: "Main Course",
    image: "paneer_tikka.png"
  },
  {
    id: 205,
    name: "Sp Mutton Biryani (Bone)",
    description: "Aromatic basmati rice cooked on slow dum with tender goat meat bone pieces and rich spices.",
    price: 420,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1545247181-516773cae76d?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 206,
    name: "Prawns Fry Biryani",
    description: "Dum biryani rice paired with delicious spicy pan-fried marinated prawns.",
    price: 360,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300"
  },

  // Main Course - Curries & Roti
  {
    id: 210,
    name: "Paneer Butter Masala",
    description: "Paneer cubes cooked in a sweet, rich and creamy tomato-butter-cashew gravy.",
    price: 230,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 211,
    name: "Butter Chicken",
    description: "Tandoori chicken shreds cooked in a classic, buttery, mildly spiced tomato gravy.",
    price: 300,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 212,
    name: "Plain Naan",
    description: "Traditional soft leavened clay oven flatbread.",
    price: 40,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 213,
    name: "Butter Naan",
    description: "Tandoor naan brushed generously with melted butter.",
    price: 50,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 214,
    name: "Garlic Naan",
    description: "Tandoor naan topped with minced fresh garlic and coriander leaves.",
    price: 60,
    category: "Main Course",
    image: "https://images.unsplash.com/photo-1601356616077-695728ecf769?auto=format&fit=crop&q=80&w=300"
  },

  // Beverages
  {
    id: 301,
    name: "Sweet Lassi",
    description: "Thick creamy churned yogurt beverage blended with sugar.",
    price: 70,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1546173159-3159d44d68b4?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 302,
    name: "Masala Chai",
    description: "Aromatic spiced Indian milk tea brewed with ginger and cardamom.",
    price: 30,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 303,
    name: "Fresh Lime Soda",
    description: "Refreshing soda water served with lime juice, sugar syrup, and black salt.",
    price: 60,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300"
  },

  // Desserts
  {
    id: 401,
    name: "Gulab Jamun (2 Pcs)",
    description: "Warm, golden-brown dumplings soaked in cardamom sugar syrup.",
    price: 80,
    category: "Desserts",
    image: "gulab_jamun.png"
  },
  {
    id: 402,
    name: "Double Ka Meetha",
    description: "Hyderabadi style golden bread pudding soaked in saffron syrup and milk.",
    price: 100,
    category: "Desserts",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=300"
  },

  // Special Items
  {
    id: 501,
    name: "SVD Special Biryani",
    description: "Durga special double-layered biryani with assorted meats and rich spices.",
    price: 460,
    category: "Special Items",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 502,
    name: "Family Dum Biryani (Chicken)",
    description: "Family pack size of our delicious Dum Biryani. Serves 3-4 persons.",
    price: 630,
    category: "Special Items",
    image: "special_dum_biryani.png"
  },
  {
    id: 503,
    name: "Family Sp Veg Biryani",
    description: "A large family portion of special vegetable kaju paneer biryani. Serves 3-4.",
    price: 550,
    category: "Special Items",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300"
  }
];

// --- APP STATE INITIALIZATION ---
class RestaurantApp {
  constructor() {
    this.syncChannel = new BroadcastChannel('sri_vijaya_durga_sync');
    this.currentPortal = 'customer';
    
    // Core state
    this.tables = [];
    this.orders = [];
    this.invoices = [];
    this.cart = [];
    
    // UI state
    this.selectedTable = null;
    this.selectedCategory = 'All';
    this.paymentProvider = 'upi';
    this.kitchenFilter = 'all';
    
    // Bindings
    this.handleSyncMessage = this.handleSyncMessage.bind(this);
    this.syncChannel.onmessage = this.handleSyncMessage;
  }

  // --- INITIALIZE USERS & PORTALS ---
  initUsers() {
    const storedUsers = localStorage.getItem('svd_users');
    if (!storedUsers) {
      const defaultUsers = [
        { email: 'admin@durga.com', password: '123456', role: 'admin' },
        { email: 'kitchen@durga.com', password: '654321', role: 'kitchen' }
      ];
      localStorage.setItem('svd_users', JSON.stringify(defaultUsers));
    }
  }

  // --- INITIALIZE APPLICATION DATA ---
  init() {
    // Initialize user accounts
    this.initUsers();

    // 1. Initialize Tables based on Floor Layout requirements
    const storedTables = localStorage.getItem('svd_tables');
    let tablesParsed = null;
    try { tablesParsed = JSON.parse(storedTables); } catch(e) {}

    // Force reset if tables count isn't 19 (G1-G5 + A1-D3 = 19 tables)
    if (tablesParsed && tablesParsed.length === 19 && tablesParsed[0].floor) {
      this.tables = tablesParsed;
    } else {
      const groundTableNames = ['G1', 'G2', 'G3', 'G4', 'G5'];
      const firstTableNames = [
        'A1', 'A2', 'A3', 'A4', 'A5',
        'B1', 'B2', 'B3',
        'C1', 'C2', 'C3',
        'D1', 'D2', 'D3'
      ];
      
      const tables = [];
      
      // Ground Floor G1-G5
      groundTableNames.forEach((name, i) => {
        tables.push({
          id: `ground_${name}`,
          number: name,
          floor: 'ground',
          capacity: i % 2 === 0 ? 4 : 2,
          status: 'AVAILABLE'
        });
      });
      
      // First Floor A1-D3
      firstTableNames.forEach((name, i) => {
        tables.push({
          id: `first_${name}`,
          number: name,
          floor: 'first',
          capacity: name.startsWith('A') ? 6 : (name.startsWith('B') ? 4 : 2),
          status: 'AVAILABLE'
        });
      });

      this.tables = tables;
      this.saveTables();
    }

    // 2. Initialize Orders
    const storedOrders = localStorage.getItem('svd_orders');
    this.orders = storedOrders ? JSON.parse(storedOrders) : [];

    // 3. Initialize Invoices
    const storedInvoices = localStorage.getItem('svd_invoices');
    this.invoices = storedInvoices ? JSON.parse(storedInvoices) : [];

    // 4. Setup Theme
    const savedTheme = localStorage.getItem('svd_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.toggleThemeIcon(savedTheme);

    // 5. Watch URL changes
    window.addEventListener('hashchange', () => this.handleRouting());
    
    // 6. Register service worker
    this.registerServiceWorker();

    // 7. Initial Route Resolution
    this.handleRouting();
    this.updatePortalUI();
    this.renderAdminQRTableSelect();
  }

  // --- LOCAL PERSISTENCE ---
  saveTables() {
    localStorage.setItem('svd_tables', JSON.stringify(this.tables));
  }

  saveOrders() {
    localStorage.setItem('svd_orders', JSON.stringify(this.orders));
  }

  saveInvoices() {
    localStorage.setItem('svd_invoices', JSON.stringify(this.invoices));
  }

  // --- REAL-TIME BROADCAST ENGINE ---
  broadcastChange(type, data = {}) {
    this.syncChannel.postMessage({ type, data });
  }

  handleSyncMessage(event) {
    const { type, data } = event.data;
    console.log(`Sync Message Received: ${type}`, data);

    // Reload state from local storage
    this.tables = JSON.parse(localStorage.getItem('svd_tables')) || this.tables;
    this.orders = JSON.parse(localStorage.getItem('svd_orders')) || this.orders;
    this.invoices = JSON.parse(localStorage.getItem('svd_invoices')) || this.invoices;

    // Perform specific UI refreshes based on trigger
    if (type === 'TABLE_RESERVED') {
      this.showToast(`Table ${data.tableNo} has been reserved!`, 'info');
      this.playChime();
    } else if (type === 'ORDER_PLACED') {
      this.showToast(`New order placed for Table ${data.tableNo}!`, 'success');
      this.playChime();
    } else if (type === 'ORDER_STATUS_CHANGED') {
      this.showToast(`Order for Table ${data.tableNo} is now ${data.status.toLowerCase()}!`, 'info');
      this.playChime();
      
      // If customer is on menu page for this table, refresh status
      if (this.selectedTable === data.tableNo) {
        this.updateActiveOrderUI();
      }
    } else if (type === 'TABLE_RELEASED') {
      this.showToast(`Table ${data.tableNo} has been released.`, 'info');
      if (this.selectedTable === data.tableNo) {
        this.releaseCurrentTableLocal();
      }
    }

    // Refresh whichever portal view is currently open
    this.refreshCurrentView();
    this.updatePortalUI();
  }

  // --- ROUTING ENGINE ---
  handleRouting() {
    const hash = window.location.hash || '#home';
    const viewContainer = document.getElementById('app-view-container');
    
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    // Extract query parameters (e.g. ?table=3)
    const cleanHash = hash.split('?')[0];
    const params = this.getQueryParams(hash);

    // Display Table Indicator bar if table parameter is active
    const statusBar = document.getElementById('table-status-bar');
    if (params.table) {
      this.selectedTable = params.table;
      document.getElementById('current-table-number').innerText = this.selectedTable;
      statusBar.style.display = 'block';
    } else if (!this.selectedTable) {
      statusBar.style.display = 'none';
    }

    switch (cleanHash) {
      case '#home':
        document.getElementById('view-home').classList.add('active');
        this.renderFeaturedDishes();
        break;
      
      case '#booking':
        document.getElementById('view-booking').classList.add('active');
        this.renderTables();
        break;
      
      case '#menu':
        document.getElementById('view-menu').classList.add('active');
        if (params.table) {
          this.selectedTable = params.table;
        }
        if (!this.selectedTable) {
          // If no table is selected, push to booking first
          this.showToast("Please select a dining table first!", "warning");
          window.location.hash = '#booking';
          return;
        }
        this.loadTableCart();
        this.renderMenu();
        break;
      
      case '#payment':
        document.getElementById('view-payment').classList.add('active');
        this.renderPaymentView();
        break;
      
      case '#invoice':
        document.getElementById('view-invoice').classList.add('active');
        this.renderInvoiceView(params.id);
        break;
      
      case '#kitchen':
        document.getElementById('view-kitchen').classList.add('active');
        this.renderKitchenDashboard();
        break;
      
      case '#admin':
        document.getElementById('view-admin').classList.add('active');
        this.renderAdminDashboard();
        break;
      
      default:
        document.getElementById('view-home').classList.add('active');
    }

    window.scrollTo(0, 0);
  }

  refreshCurrentView() {
    const hash = window.location.hash || '#home';
    const cleanHash = hash.split('?')[0];
    
    if (cleanHash === '#booking') this.renderTables();
    else if (cleanHash === '#menu') this.renderMenu();
    else if (cleanHash === '#kitchen') this.renderKitchenDashboard();
    else if (cleanHash === '#admin') this.renderAdminDashboard();
  }

  getQueryParams(url) {
    const params = {};
    const parser = document.createElement('a');
    parser.href = url;
    const query = parser.search.substring(1);
    if (!query) {
      // Fallback parser if search fails inside hashes
      const parts = url.split('?');
      if (parts[1]) {
        const queryParts = parts[1].split('&');
        for (let i = 0; i < queryParts.length; i++) {
          const pair = queryParts[i].split('=');
          params[pair[0]] = decodeURIComponent(pair[1]);
        }
      }
      return params;
    }
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  }

  // --- PORTAL NAVIGATION CONTROLLER ---
  switchPortal(portal) {
    this.currentPortal = portal;
    
    // Toggle active classes in switcher UI
    document.querySelectorAll('.portal-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`btn-portal-${portal}`).classList.add('active');

    // Route to home page of specific portal
    if (portal === 'customer') {
      window.location.hash = this.selectedTable ? `#menu?table=${this.selectedTable}` : '#home';
    } else if (portal === 'kitchen') {
      window.location.hash = '#kitchen';
    } else if (portal === 'admin') {
      window.location.hash = '#admin';
    }
  }

  updatePortalUI() {
    // 1. Update Kitchen badge
    const pendingOrders = this.orders.filter(o => o.status === 'PLACED' || o.status === 'PREPARING').length;
    const badge = document.getElementById('kitchen-pending-badge');
    if (badge) {
      if (pendingOrders > 0) {
        badge.innerText = pendingOrders;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // --- CUSTOMER PORTAL LOGIC ---
  renderFeaturedDishes() {
    const grid = document.getElementById('featured-dishes-grid');
    if (!grid) return;
    
    // Filter out 3 featured dishes
    const featured = MENU_ITEMS.filter(item => item.id === 201 || item.id === 501 || item.id === 102);
    
    grid.innerHTML = featured.map(item => `
      <div class="featured-card">
        <img src="${item.image}" alt="${item.name}">
        <div class="featured-card-body">
          <div class="featured-card-header">
            <h4>${item.name}</h4>
            <span class="featured-price">₹${item.price}</span>
          </div>
          <p>${item.description}</p>
          <button class="btn btn-outline btn-sm mt-4 btn-block" onclick="app.featuredToCart(${item.id})">Quick Add</button>
        </div>
      </div>
    `).join('');
  }

  featuredToCart(itemId) {
    if (!this.selectedTable) {
      this.showToast("Please choose a table first!", "warning");
      window.location.hash = '#booking';
      return;
    }
    this.loadTableCart();
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const cartIndex = this.cart.findIndex(c => c.id === itemId);
    if (cartIndex > -1) {
      this.cart[cartIndex].quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    
    this.saveTableCart();
    this.showToast(`${item.name} added to Order Card!`, 'success');
    window.location.hash = `#menu?table=${this.selectedTable}`;
  }

  // --- INTERACTIVE TABLE SELECTION ---
  renderTables() {
    const grid = document.getElementById('tables-selection-grid');
    if (!grid) return;

    const searchQuery = document.getElementById('search-tables-input').value.toLowerCase();
    const filterStatus = document.getElementById('filter-tables-select').value;

    const filteredTables = this.tables.filter(table => {
      const matchesSearch = `table ${table.number}`.toLowerCase().includes(searchQuery) || table.number.toLowerCase().includes(searchQuery);
      let matchesFilter = true;
      if (filterStatus === 'available') matchesFilter = table.status === 'AVAILABLE';
      else if (filterStatus === 'pending') matchesFilter = table.status === 'PENDING';
      else if (filterStatus === 'occupied') matchesFilter = table.status === 'OCCUPIED';
      
      return matchesSearch && matchesFilter;
    });

    if (filteredTables.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No tables found matching criteria.</div>`;
      return;
    }

    // Split into Ground Floor and First Floor
    const ground = filteredTables.filter(t => t.floor === 'ground');
    const first = filteredTables.filter(t => t.floor === 'first');

    let html = '';

    const renderTableCard = (table) => {
      let statusClass = 'status-available';
      let statusLabel = 'Available';
      if (table.status === 'PENDING') { statusClass = 'status-pending'; statusLabel = 'Ordered'; }
      else if (table.status === 'OCCUPIED') { statusClass = 'status-occupied'; statusLabel = 'Occupied'; }

      return `
        <div class="table-selector-cell ${statusClass}" onclick="app.selectAndReserveTable('${table.number}', '${table.status}')">
          <div class="table-capacity">${table.capacity} Seater</div>
          <h4>Table ${table.number}</h4>
          <span class="table-status-label">${statusLabel}</span>
        </div>
      `;
    };

    if (ground.length > 0) {
      html += `
        <div class="floor-section" style="grid-column: 1/-1; margin-top: 1rem; width: 100%;">
          <h3 class="floor-title" style="margin-bottom: 1.25rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.5rem; color: var(--primary-color); font-family: 'Outfit', sans-serif; font-weight: 800;">Ground Floor (G1-G5)</h3>
          <div class="cinema-table-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem;">
            ${ground.map(renderTableCard).join('')}
          </div>
        </div>
      `;
    }

    if (first.length > 0) {
      html += `
        <div class="floor-section" style="grid-column: 1/-1; margin-top: 2rem; width: 100%;">
          <h3 class="floor-title" style="margin-bottom: 1.25rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.5rem; color: var(--primary-color); font-family: 'Outfit', sans-serif; font-weight: 800;">First Floor (A, B, C, D Tables)</h3>
          <div class="cinema-table-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem;">
            ${first.map(renderTableCard).join('')}
          </div>
        </div>
      `;
    }

    grid.innerHTML = html;
  }

  filterTables() {
    this.renderTables();
  }

  selectAndReserveTable(tableNo, status) {
    if (status !== 'AVAILABLE') {
      // If table is occupied or pending, customer proceeds directly to menu or payment
      this.selectedTable = tableNo;
      window.location.hash = `#menu?table=${tableNo}`;
      return;
    }

    // Reserve instantly
    const tableIndex = this.tables.findIndex(t => t.number === tableNo);
    if (tableIndex > -1) {
      this.tables[tableIndex].status = 'OCCUPIED';
      this.saveTables();
      this.selectedTable = tableNo;
      
      // Broadcast table reservation
      this.broadcastChange('TABLE_RESERVED', { tableNo });
      
      this.showToast(`Table ${tableNo} reserved successfully!`, 'success');
      
      // Navigate to digital menu
      window.location.hash = `#menu?table=${tableNo}`;
    }
  }

  releaseCurrentTable() {
    if (confirm("Are you sure you want to release this table? Unsaved orders will be lost.")) {
      const tableNo = this.selectedTable;
      
      // Update DB status
      const tableIndex = this.tables.findIndex(t => t.number === tableNo);
      if (tableIndex > -1) {
        this.tables[tableIndex].status = 'AVAILABLE';
        this.saveTables();
      }

      this.releaseCurrentTableLocal();

      // Broadcast release
      this.broadcastChange('TABLE_RELEASED', { tableNo });
      this.showToast(`Table ${tableNo} released.`, 'info');
    }
  }

  releaseCurrentTableLocal() {
    this.selectedTable = null;
    this.cart = [];
    localStorage.removeItem(`svd_cart_t${this.selectedTable}`);
    document.getElementById('table-status-bar').style.display = 'none';
    window.location.hash = '#booking';
  }

  // --- DIGITAL MENU AND CART LOGIC ---
  // --- DIGITAL MENU AND CART LOGIC ---
  renderMenu() {
    // 1. Render badges
    document.getElementById('menu-table-badge').innerText = `Table ${this.selectedTable}`;
    document.getElementById('cart-table-badge').innerText = `Table ${this.selectedTable}`;

    // 2. Render categories scroller
    const categories = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts', 'Special Items'];
    const tabsContainer = document.getElementById('menu-category-tabs');
    if (tabsContainer) {
      tabsContainer.innerHTML = categories.map(cat => `
        <button class="category-tab ${this.selectedCategory === cat ? 'active' : ''}" onclick="app.setCategory('${cat}')">
          ${cat}
        </button>
      `).join('');
    }

    // 3. Render food items grid
    const grid = document.getElementById('menu-food-grid');
    if (!grid) return;

    const searchQuery = document.getElementById('search-food-input').value.toLowerCase();

    const filteredMenu = MENU_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery);
      const matchesCat = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (filteredMenu.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No food items found.</div>`;
      return;
    }

    grid.innerHTML = filteredMenu.map(item => {
      const cartItem = this.cart.find(c => c.id === item.id);
      const qty = cartItem ? cartItem.quantity : 0;
      const orderedQty = cartItem && cartItem.orderedQty ? cartItem.orderedQty : 0;
      
      let cartControlHtml = '';
      if (qty > 0) {
        const isMinusDisabled = qty <= orderedQty ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
        cartControlHtml = `
          <div class="quantity-controls">
            <button class="qty-btn" ${isMinusDisabled} onclick="app.updateCartQty(${item.id}, -1)">&minus;</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" onclick="app.updateCartQty(${item.id}, 1)">&plus;</button>
          </div>
        `;
      } else {
        cartControlHtml = `
          <button class="btn btn-primary btn-sm" onclick="app.updateCartQty(${item.id}, 1)">
            Add +
          </button>
        `;
      }

      return `
        <div class="food-card" style="cursor: pointer;">
          <img src="${item.image}" alt="${item.name}" onclick="app.showFoodPopup(${item.id})">
          <div class="food-card-body" onclick="event.target.tagName !== 'BUTTON' && app.showFoodPopup(${item.id})">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="food-card-footer" onclick="event.stopPropagation()">
              <span class="food-price">₹${item.price}</span>
              ${cartControlHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.renderCartSidebar();
  }

  setCategory(category) {
    this.selectedCategory = category;
    this.renderMenu();
  }

  // --- CART PERSISTENCE & COMPUTATION ---
  loadTableCart() {
    const stored = localStorage.getItem(`svd_cart_t${this.selectedTable}`);
    this.cart = stored ? JSON.parse(stored) : [];

    // Sync with active order if exists (eating state)
    const activeOrder = this.orders.find(o => o.tableNo === this.selectedTable && o.status !== 'PAID');
    if (activeOrder) {
      activeOrder.items.forEach(orderItem => {
        const cartItem = this.cart.find(c => c.id === orderItem.id);
        if (cartItem) {
          cartItem.orderedQty = orderItem.quantity;
          if (cartItem.quantity < orderItem.quantity) {
            cartItem.quantity = orderItem.quantity;
          }
        } else {
          const menuItem = MENU_ITEMS.find(i => i.id === orderItem.id);
          this.cart.push({
            ...menuItem,
            quantity: orderItem.quantity,
            orderedQty: orderItem.quantity
          });
        }
      });
    } else {
      this.cart.forEach(c => delete c.orderedQty);
    }
  }

  saveTableCart() {
    // Save only items that are new or still being edited (no need to save clean orderedQty items unless modified)
    localStorage.setItem(`svd_cart_t${this.selectedTable}`, JSON.stringify(this.cart));
  }

  updateCartQty(itemId, change) {
    const itemIndex = this.cart.findIndex(c => c.id === itemId);
    
    if (itemIndex > -1) {
      this.cart[itemIndex].quantity += change;
      if (this.cart[itemIndex].quantity <= 0) {
        this.cart.splice(itemIndex, 1);
      }
    } else if (change > 0) {
      const menuItem = MENU_ITEMS.find(i => i.id === itemId);
      this.cart.push({ ...menuItem, quantity: 1 });
    }

    this.saveTableCart();
    this.renderMenu();
  }

  renderCartSidebar() {
    const container = document.getElementById('cart-items-container');
    const customerArea = document.getElementById('checkout-customer-info-area');
    if (!container || !customerArea) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 3rem 0;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🛒</span>
          Your order card is empty
        </div>
      `;
      this.updateCartTotals(0);
      document.getElementById('btn-place-order').style.display = 'block';
      document.getElementById('btn-place-order').innerText = 'Place Order';
      document.getElementById('btn-place-order').disabled = true;
      document.getElementById('cart-order-status').style.display = 'none';
      customerArea.innerHTML = '';
      return;
    }

    // Check if table order is already active (placed/preparing/completed)
    const activeOrder = this.orders.find(o => o.tableNo === this.selectedTable && o.status !== 'PAID');
    const hasActiveOrder = !!activeOrder;

    // Render cart items list
    container.innerHTML = this.cart.map(item => {
      const oQty = item.orderedQty || 0;
      const isMinusDisabled = item.quantity <= oQty ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
      
      let badgeHtml = '';
      if (oQty > 0) {
        badgeHtml = `<span style="font-size: 0.7rem; background-color: var(--primary-color); color: white; padding: 0.1rem 0.3rem; border-radius: 4px; margin-left: 0.5rem;">Ordered: ${oQty}</span>`;
      }

      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name" style="display:flex; align-items:center;">
              ${item.name} ${badgeHtml}
            </div>
            <div class="cart-item-price">₹${item.price}</div>
          </div>
          <div class="quantity-controls">
            <button class="qty-btn" ${isMinusDisabled} onclick="app.updateCartQty(${item.id}, -1)">&minus;</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateCartQty(${item.id}, 1)">&plus;</button>
          </div>
        </div>
      `;
    }).join('');

    // Check if there are new items to place
    const hasNewItems = this.cart.some(item => item.quantity > (item.orderedQty || 0));

    if (hasActiveOrder) {
      // Render customer details as read-only tags
      customerArea.innerHTML = `
        <div style="background: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius); border-left: 4px solid var(--color-occupied); margin-bottom: 0.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">ACTIVE DINING SESSION</div>
          <div style="font-size: 0.9rem; font-weight: bold; margin-top: 0.25rem; color: var(--text-main);">${activeOrder.customerName}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${activeOrder.customerPhone}</div>
        </div>
      `;

      if (hasNewItems) {
        // Show place order button to append items
        document.getElementById('btn-place-order').style.display = 'block';
        document.getElementById('btn-place-order').innerText = 'Add to Active Order';
        document.getElementById('btn-place-order').disabled = false;
        document.getElementById('cart-order-status').style.display = 'none';
      } else {
        // No new items. Hide place order button, show active order status card
        document.getElementById('btn-place-order').style.display = 'none';
        const statusCard = document.getElementById('cart-order-status');
        statusCard.style.display = 'block';

        const statusText = document.getElementById('order-status-text');
        const payBtn = document.getElementById('btn-pay-bill-trigger');
        statusText.innerText = `Order Status: ${activeOrder.status}`;
        
        if (activeOrder.status === 'COMPLETED') {
          payBtn.style.display = 'block';
          statusCard.querySelector('.pulse-dot').style.backgroundColor = 'var(--color-available)';
        } else {
          payBtn.style.display = 'none';
          statusCard.querySelector('.pulse-dot').style.backgroundColor = 'var(--color-pending)';
        }
      }
    } else {
      // Render customer details input form
      customerArea.innerHTML = `
        <div style="background: var(--bg-surface-alt); padding: 0.75rem; border-radius: var(--radius); border: 1px solid var(--border-color);">
          <h4 style="margin-bottom: 0.5rem; font-size: 0.85rem; font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--text-main);">Customer Information</h4>
          <div class="form-group mb-2">
            <input type="text" id="customer-name-input" class="form-select" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); background: var(--bg-surface); color: var(--text-main);" placeholder="Your Name" required>
          </div>
          <div class="form-group mb-0">
            <input type="tel" id="customer-phone-input" class="form-select" style="width: 100%; padding: 0.4rem 0.6rem; font-size: 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius); background: var(--bg-surface); color: var(--text-main);" pattern="[0-9]{10}" placeholder="Mobile Number (10 digits)" required>
          </div>
        </div>
      `;

      document.getElementById('btn-place-order').style.display = 'block';
      document.getElementById('btn-place-order').innerText = 'Place Order';
      document.getElementById('btn-place-order').disabled = false;
      document.getElementById('cart-order-status').style.display = 'none';
    }

    // Compute Totals
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.updateCartTotals(subtotal);
  }

  updateCartTotals(subtotal) {
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const service = Math.round(subtotal * 0.025); // 2.5% Service Charge
    const grand = subtotal + tax + service;

    document.getElementById('cart-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').innerText = `₹${tax.toFixed(2)}`;
    document.getElementById('cart-service').innerText = `₹${service.toFixed(2)}`;
    document.getElementById('cart-grand-total').innerText = `₹${grand.toFixed(2)}`;
  }

  // --- PLACE ORDER FLOW ---
  placeOrder() {
    if (this.cart.length === 0) return;

    // Check if table order is already active (placed/preparing/completed)
    const activeOrder = this.orders.find(o => o.tableNo === this.selectedTable && o.status !== 'PAID');
    
    let customerName = "";
    let customerPhone = "";
    
    if (activeOrder) {
      // Reuse existing details
      customerName = activeOrder.customerName;
      customerPhone = activeOrder.customerPhone;
    } else {
      // Get input details
      const nameInput = document.getElementById('customer-name-input');
      const phoneInput = document.getElementById('customer-phone-input');
      
      customerName = nameInput ? nameInput.value.trim() : "";
      customerPhone = phoneInput ? phoneInput.value.trim() : "";
      
      if (!customerName || !customerPhone) {
        this.showToast("Please enter your Name and Mobile Number to place the order!", "warning");
        return;
      }
      
      if (customerPhone.length < 10) {
        this.showToast("Please enter a valid 10-digit mobile number!", "warning");
        return;
      }
    }

    if (activeOrder) {
      // Append new items or update quantities
      this.cart.forEach(cartItem => {
        const existingItem = activeOrder.items.find(item => item.id === cartItem.id);
        if (existingItem) {
          existingItem.quantity = cartItem.quantity;
        } else {
          activeOrder.items.push({
            id: cartItem.id,
            name: cartItem.name,
            quantity: cartItem.quantity,
            price: cartItem.price
          });
        }
      });
      
      // Mark as appended/updated, set status to PLACED (so it returns to kitchen board)
      activeOrder.isAppended = true;
      activeOrder.status = 'PLACED';
      activeOrder.timestamp = Date.now(); // reset timer for kitchen visibility
      
      this.saveOrders();
      
      // Update table status to PENDING
      const tableIndex = this.tables.findIndex(t => t.number === this.selectedTable);
      if (tableIndex > -1) {
        this.tables[tableIndex].status = 'PENDING';
        this.saveTables();
      }

      this.broadcastChange('ORDER_PLACED', { orderId: activeOrder.id, tableNo: this.selectedTable });
      this.showToast("Dished added! Your order has been updated in the Kitchen.", "success");
      this.playChime();
    } else {
      // Create new Order
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const order = {
        id: orderId,
        tableNo: this.selectedTable,
        customerName,
        customerPhone,
        status: 'PLACED',
        items: this.cart.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        timestamp: Date.now()
      };

      this.orders.push(order);
      this.saveOrders();

      // Lock table status to PENDING
      const tableIndex = this.tables.findIndex(t => t.number === this.selectedTable);
      if (tableIndex > -1) {
        this.tables[tableIndex].status = 'PENDING';
        this.saveTables();
      }

      this.broadcastChange('ORDER_PLACED', { orderId, tableNo: this.selectedTable });
      this.showToast("Your order has been sent to the Kitchen!", "success");
      this.playChime();
    }

    // Refresh cart in menu
    this.loadTableCart();
    this.renderMenu();
  }

  updateActiveOrderUI() {
    // Re-render menu to update locks and states
    this.renderMenu();
  }

  goToPayment() {
    window.location.hash = `#payment?table=${this.selectedTable}`;
  }

  // --- PAYMENT GATEWAY FLOW ---
  renderPaymentView() {
    const tableNo = this.selectedTable;
    document.getElementById('payment-table-no').innerText = tableNo;

    // Find the COMPLETED order for this table
    const order = this.orders.find(o => o.tableNo === tableNo && o.status === 'COMPLETED');
    if (!order) {
      document.getElementById('payment-order-id').innerText = '---';
      document.getElementById('payment-items-list').innerHTML = `<p class="text-center text-muted">No completed order found to bill.</p>`;
      return;
    }

    document.getElementById('payment-order-id').innerText = order.id;

    // Render Items
    const list = document.getElementById('payment-items-list');
    list.innerHTML = order.items.map(item => `
      <div class="receipt-item">
        <span>${item.name} &times; ${item.quantity}</span>
        <strong>₹${item.price * item.quantity}</strong>
      </div>
    `).join('');

    // Totals calculations
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    const service = Math.round(subtotal * 0.025);
    const total = subtotal + tax + service;

    document.getElementById('payment-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('payment-tax').innerText = `₹${tax.toFixed(2)}`;
    document.getElementById('payment-service').innerText = `₹${service.toFixed(2)}`;
    document.getElementById('payment-total').innerText = `₹${total.toFixed(2)}`;

    this.renderPaymentQR(total);
  }

  setPaymentProvider(provider) {
    this.paymentProvider = provider;
    
    // Toggle active classes
    document.querySelectorAll('.pay-app-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Set active button
    event.currentTarget.classList.add('active');

    // Re-render QR with correct logo mock
    const order = this.orders.find(o => o.tableNo === this.selectedTable && o.status === 'COMPLETED');
    if (order) {
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = Math.round(subtotal * 0.05);
      const service = Math.round(subtotal * 0.025);
      this.renderPaymentQR(subtotal + tax + service);
    }
  }

  // Pure SVG Mock QR Generator (Highly creative, 100% offline, looks exactly like a real QR code)
  renderPaymentQR(amount) {
    const container = document.getElementById('payment-qr-graphic');
    if (!container) return;

    // Generate simulated QR module pixels (mock grid)
    let paths = '';
    // Draw 3 corner alignment boxes
    // Top-Left
    paths += '<rect x="10" y="10" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="20" y="20" width="25" height="25" fill="#fff" />';
    paths += '<rect x="27" y="27" width="11" height="11" fill="#000" />';
    
    // Top-Right
    paths += '<rect x="145" y="10" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="155" y="20" width="25" height="25" fill="#fff" />';
    paths += '<rect x="162" y="27" width="11" height="11" fill="#000" />';
    
    // Bottom-Left
    paths += '<rect x="10" y="145" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="20" y="155" width="25" height="25" fill="#fff" />';
    paths += '<rect x="27" y="162" width="11" height="11" fill="#000" />';

    // Randomize middle dots to look authentic
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        // Skip corner alignment marks
        if ((r < 6 && c < 6) || (r < 6 && c > 13) || (r > 13 && c < 6)) continue;
        
        // Pseudo-random dots based on formula
        if (Math.sin(r * 12.3 + c * 35.7) > 0.0) {
          const x = 10 + c * 9;
          const y = 10 + r * 9;
          paths += `<rect x="${x}" y="${y}" width="7" height="7" fill="#000" />`;
        }
      }
    }

    // Add Logo brand overlay in center
    let centerLogo = '';
    if (this.paymentProvider === 'upi') centerLogo = '<text x="100" y="105" font-size="16" font-family="Outfit" font-weight="900" text-anchor="middle" fill="#0b5c9c">UPI</text>';
    else if (this.paymentProvider === 'phonepe') centerLogo = '<text x="100" y="105" font-size="14" font-family="Outfit" font-weight="900" text-anchor="middle" fill="#5f259f">Pe</text>';
    else if (this.paymentProvider === 'gpay') centerLogo = '<text x="100" y="105" font-size="14" font-family="Outfit" font-weight="900" text-anchor="middle" fill="#4285f4">G</text>';
    else if (this.paymentProvider === 'paytm') centerLogo = '<text x="100" y="105" font-size="14" font-family="Outfit" font-weight="900" text-anchor="middle" fill="#00b9f5">Paytm</text>';

    container.innerHTML = `
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#ffffff" />
        ${paths}
        <rect x="80" y="80" width="40" height="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="4" />
        ${centerLogo}
      </svg>
    `;
  }

  confirmPayment() {
    const tableNo = this.selectedTable;
    
    // Find active order
    const orderIndex = this.orders.findIndex(o => o.tableNo === tableNo && o.status === 'COMPLETED');
    if (orderIndex === -1) return;
    
    // Update order status -> PAID
    const order = this.orders[orderIndex];
    order.status = 'PAID';
    this.saveOrders();

    // Calculate billing amounts
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    const service = Math.round(subtotal * 0.025);
    const total = subtotal + tax + service;

    // Generate Invoice
    const invoiceNo = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = {
      invoiceNo,
      orderId: order.id,
      tableNo,
      items: order.items,
      subtotal,
      tax,
      serviceCharge: service,
      total,
      paymentMethod: this.paymentProvider.toUpperCase(),
      timestamp: Date.now()
    };
    this.invoices.push(invoice);
    this.saveInvoices();

    // Release table
    const tableIndex = this.tables.findIndex(t => t.number === tableNo);
    if (tableIndex > -1) {
      this.tables[tableIndex].status = 'AVAILABLE';
      this.saveTables();
    }

    // Clear cart
    this.cart = [];
    localStorage.removeItem(`svd_cart_t${tableNo}`);

    // Broadcast release & payment
    this.broadcastChange('TABLE_RELEASED', { tableNo });
    
    this.showToast("Payment Successful! Table released automatically.", "success");
    this.playChime();

    // Clear state
    this.selectedTable = null;
    document.getElementById('table-status-bar').style.display = 'none';

    // Route to printed invoice
    window.location.hash = `#invoice?id=${invoiceNo}`;
  }

  // --- PRINT BILLING INVOICE VIEW ---
  renderInvoiceView(invoiceNo) {
    const invoice = this.invoices.find(inv => inv.invoiceNo === invoiceNo);
    if (!invoice) {
      document.getElementById('invoice-printable-area').innerHTML = `<p class="text-center text-muted">Invoice not found.</p>`;
      return;
    }

    document.getElementById('inv-number').innerText = invoice.invoiceNo;
    document.getElementById('inv-date').innerText = new Date(invoice.timestamp).toLocaleString();
    document.getElementById('inv-table-no').innerText = invoice.tableNo;

    // Items
    const tbody = document.getElementById('inv-items-body');
    tbody.innerHTML = invoice.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">₹${item.price.toFixed(2)}</td>
        <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Math
    const cgst = invoice.tax / 2;
    const sgst = invoice.tax / 2;

    document.getElementById('inv-subtotal').innerText = `₹${invoice.subtotal.toFixed(2)}`;
    document.getElementById('inv-cgst').innerText = `₹${cgst.toFixed(2)}`;
    document.getElementById('inv-sgst').innerText = `₹${sgst.toFixed(2)}`;
    document.getElementById('inv-service').innerText = `₹${invoice.serviceCharge.toFixed(2)}`;
    document.getElementById('inv-total').innerText = `₹${invoice.total.toFixed(2)}`;
  }

  downloadInvoicePDF() {
    // Since this runs in client mode, we can download a raw text invoice or launch standard browser save dialogue.
    // Triggering print is the cleanest mechanism, as PDF printers are built into all modern browsers.
    window.print();
  }

  // --- KITCHEN DASHBOARD LOGIC ---
  renderKitchenDashboard() {
    if (!this.checkAuth('kitchen')) {
      this.renderLoginScreen('kitchen');
      return;
    }

    const loginWrapper = document.getElementById('kitchen-login-wrapper');
    const contentWrapper = document.getElementById('kitchen-content-wrapper');
    if (loginWrapper && contentWrapper) {
      loginWrapper.style.display = 'none';
      contentWrapper.style.display = 'block';
    }

    const container = document.getElementById('kitchen-orders-container');
    if (!container) return;

    // Get orders that are not PAID
    const activeOrders = this.orders.filter(order => {
      if (order.status === 'PAID') return false;
      
      if (this.kitchenFilter === 'all') return true;
      return order.status === this.kitchenFilter.toUpperCase();
    });

    if (activeOrders.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 5rem 0;">No pending cooking tickets.</div>`;
      return;
    }

    container.innerHTML = activeOrders.map(order => {
      let statusHeaderClass = 'status-placed';
      let actionBtnHtml = '';

      if (order.status === 'PLACED') {
        statusHeaderClass = 'status-placed';
        actionBtnHtml = `<button class="btn btn-primary btn-sm btn-block" onclick="app.updateOrderStatus('${order.id}', 'PREPARING')">Start Cooking (Preparing)</button>`;
      } else if (order.status === 'PREPARING') {
        statusHeaderClass = 'status-preparing';
        actionBtnHtml = `<button class="btn btn-primary btn-sm btn-block" style="background-color: var(--color-available)" onclick="app.updateOrderStatus('${order.id}', 'COMPLETED')">Ready (Mark Completed)</button>`;
      } else if (order.status === 'COMPLETED') {
        statusHeaderClass = 'status-completed';
        actionBtnHtml = `<span class="badge badge-green text-center btn-block p-2">Ready for Table</span>`;
      }

      const orderTime = new Date(order.timestamp).toLocaleTimeString();
      const elapsedMins = Math.floor((Date.now() - order.timestamp) / 60000);

      // Appended order priority alert banner
      const addedFoodAlertHtml = order.isAppended ? `
        <div class="added-food-banner" style="background-color: rgba(234, 88, 12, 0.15); border-left: 4px solid #ea580c; padding: 0.5rem; margin-bottom: 0.75rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem; animation: pulse 2s infinite;">
          <span style="font-size: 1.15rem;">🔥</span>
          <div>
            <strong style="color: #ea580c; font-size: 0.8rem; display: block; line-height: 1.2;">ALREADY EATING - ADDED FOOD!</strong>
            <span style="font-size: 0.7rem; color: var(--text-muted);">Prepare this item immediately.</span>
          </div>
        </div>
      ` : '';

      return `
        <div class="kitchen-ticket" style="${order.isAppended ? 'border: 2px solid #ea580c;' : ''}">
          <div class="ticket-header ${statusHeaderClass}">
            <h4>Table ${order.tableNo}</h4>
            <span class="ticket-time">${orderTime} (${elapsedMins}m ago)</span>
          </div>
          <div class="ticket-body">
            <div class="ticket-customer-info" style="margin-bottom: 0.75rem; font-size: 0.8rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem; color: var(--text-main);">
              <div style="margin-bottom: 0.15rem;">👤 <strong>Cust:</strong> ${order.customerName || 'N/A'}</div>
              <div>📞 <strong>Phone:</strong> ${order.customerPhone || 'N/A'}</div>
            </div>
            ${addedFoodAlertHtml}
            <ul class="ticket-items-list">
              ${order.items.map(item => `
                <li class="ticket-item" style="font-weight: 500;">
                  <span><span class="ticket-item-qty">${item.quantity}x</span> ${item.name}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="ticket-footer">
            ${actionBtnHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  filterKitchenOrders(status) {
    this.kitchenFilter = status;
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    this.renderKitchenDashboard();
  }

  updateOrderStatus(orderId, newStatus) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    this.orders[orderIndex].status = newStatus;
    this.saveOrders();

    const tableNo = this.orders[orderIndex].tableNo;

    // Broadcast change
    this.broadcastChange('ORDER_STATUS_CHANGED', { orderId, tableNo, status: newStatus });

    this.showToast(`Order for Table ${tableNo} is now ${newStatus}!`, 'info');
    
    this.renderKitchenDashboard();
    this.updatePortalUI();
  }

  // --- ADMIN PORTAL LOGIC ---
  renderAdminDashboard() {
    if (!this.checkAuth('admin')) {
      this.renderLoginScreen('admin');
      return;
    }

    const loginWrapper = document.getElementById('admin-login-wrapper');
    const contentWrapper = document.getElementById('admin-content-wrapper');
    if (loginWrapper && contentWrapper) {
      loginWrapper.style.display = 'none';
      contentWrapper.style.display = 'block';
    }

    // 1. Calculate dashboard statistics
    const totalTables = this.tables.length;
    const availableTables = this.tables.filter(t => t.status === 'AVAILABLE').length;
    const occupiedTables = this.tables.filter(t => t.status === 'OCCUPIED').length;
    const pendingTables = this.tables.filter(t => t.status === 'PENDING').length;

    const startOfToday = new Date().setHours(0,0,0,0);
    const todayOrders = this.orders.filter(o => o.timestamp >= startOfToday);
    const todayRevenue = this.invoices
      .filter(inv => inv.timestamp >= startOfToday)
      .reduce((sum, inv) => sum + inv.total, 0);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const monthRevenue = this.invoices
      .filter(inv => inv.timestamp >= startOfMonth)
      .reduce((sum, inv) => sum + inv.total, 0);

    document.getElementById('stat-tables-count').innerText = `${totalTables} / ${availableTables} Available`;
    document.getElementById('stat-orders-today').innerText = `${todayOrders.length} Orders`;
    document.getElementById('stat-revenue-today').innerText = `₹${todayRevenue.toFixed(2)}`;
    document.getElementById('stat-revenue-month').innerText = `₹${monthRevenue.toFixed(2)}`;

    // 2. Render occupancy monitoring grid
    const tracker = document.getElementById('admin-table-tracker');
    tracker.innerHTML = this.tables.map(table => {
      let statusClass = 'status-available';
      if (table.status === 'PENDING') statusClass = 'status-pending';
      else if (table.status === 'OCCUPIED') statusClass = 'status-occupied';

      return `
        <div class="table-tracker-cell ${statusClass}">
          T-${table.number}
        </div>
      `;
    }).join('');

    // 3. Render dynamic interactive SVG Chart
    this.renderRevenueChart();

    // 4. Generate report list
    this.generateSalesReport();

    // 5. Render selected QR in admin sidebar preview
    this.renderAdminQR();
  }

  renderRevenueChart() {
    const container = document.getElementById('admin-svg-chart');
    if (!container) return;

    // Generate simulated weekly sales data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesData = [12000, 8500, 9600, 11200, 14000, 18500, 22000]; // Simulated week
    
    // Add today's real revenue to current weekday index
    const todayIndex = new Date().getDay();
    const startOfToday = new Date().setHours(0,0,0,0);
    const todayRealRevenue = this.invoices
      .filter(inv => inv.timestamp >= startOfToday)
      .reduce((sum, inv) => sum + inv.total, 0);
    
    salesData[todayIndex] = Math.max(salesData[todayIndex], todayRealRevenue);

    const maxSale = Math.max(...salesData);
    const height = 200;
    const width = 500;
    const barWidth = 45;
    const spacing = 20;

    let bars = '';
    let texts = '';

    salesData.forEach((val, i) => {
      const barHeight = Math.max((val / maxSale) * (height - 40), 5);
      const x = 40 + i * (barWidth + spacing);
      const y = height - 20 - barHeight;

      // Draw bar rect
      bars += `
        <rect class="chart-bar animate-svg-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4">
          <title>Revenue: ₹${val}</title>
        </rect>
      `;

      // Draw labels
      texts += `
        <text class="chart-text" x="${x + barWidth/2}" y="${height - 5}" text-anchor="middle">${days[i]}</text>
        <text class="chart-text" x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-weight="bold" fill="var(--text-main)">₹${Math.round(val/1000)}k</text>
      `;
    });

    container.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
        <!-- Y-Axis ticks -->
        <line class="chart-axis" x1="30" y1="10" x2="30" y2="${height - 20}" />
        <line class="chart-axis" x1="30" y1="${height - 20}" x2="${width - 10}" y2="${height - 20}" />
        
        <!-- Graph Elements -->
        ${bars}
        ${texts}
      </svg>
    `;
  }

  generateSalesReport() {
    const type = document.getElementById('report-type-select').value;
    const tbody = document.getElementById('admin-report-table-body');
    if (!tbody) return;

    let filterTimestamp = 0;
    const now = Date.now();

    if (type === 'daily') {
      filterTimestamp = new Date().setHours(0,0,0,0);
    } else if (type === 'weekly') {
      filterTimestamp = now - (7 * 24 * 60 * 60 * 1000);
    } else if (type === 'monthly') {
      filterTimestamp = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    }

    const filteredInvoices = this.invoices.filter(inv => inv.timestamp >= filterTimestamp);

    if (filteredInvoices.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No transactions recorded for this period.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredInvoices.map(inv => `
      <tr>
        <td><strong>${inv.invoiceNo}</strong></td>
        <td>${new Date(inv.timestamp).toLocaleDateString()}</td>
        <td>Table ${inv.tableNo}</td>
        <td>₹${inv.subtotal.toFixed(2)}</td>
        <td>₹${inv.tax.toFixed(2)}</td>
        <td>₹${inv.serviceCharge.toFixed(2)}</td>
        <td><strong>₹${inv.total.toFixed(2)}</strong></td>
      </tr>
    `).join('');
  }

  exportReportCSV() {
    const type = document.getElementById('report-type-select').value;
    let filterTimestamp = 0;
    if (type === 'daily') filterTimestamp = new Date().setHours(0,0,0,0);
    else if (type === 'weekly') filterTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
    else if (type === 'monthly') filterTimestamp = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const filteredInvoices = this.invoices.filter(inv => inv.timestamp >= filterTimestamp);

    if (filteredInvoices.length === 0) {
      this.showToast("No data to export!", "warning");
      return;
    }

    // Generate CSV contents
    let csv = 'Invoice No,Date,Table Number,Payment Method,Subtotal,Tax,Service Charge,Total Amount\n';
    
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.timestamp).toLocaleDateString();
      csv += `"${inv.invoiceNo}","${date}","Table ${inv.tableNo}","${inv.paymentMethod}",${inv.subtotal},${inv.tax},${inv.serviceCharge},${inv.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `svd_${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("CSV Sales Report downloaded successfully!", "success");
  }

  renderAdminQRTableSelect() {
    const select = document.getElementById('admin-qr-table-select');
    if (!select) return;
    select.innerHTML = this.tables.map(table => `
      <option value="${table.number}">Table ${table.number}</option>
    `).join('');
  }

  renderAdminQR() {
    const tableSelect = document.getElementById('admin-qr-table-select');
    if (!tableSelect) return;
    
    const tableNo = tableSelect.value;
    const container = document.getElementById('admin-qr-preview-graphic');
    
    // Draw pure SVG mock QR code
    let paths = '';
    // Corner marks
    paths += '<rect x="10" y="10" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="20" y="20" width="25" height="25" fill="#fff" />';
    paths += '<rect x="27" y="27" width="11" height="11" fill="#000" />';
    
    paths += '<rect x="145" y="10" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="155" y="20" width="25" height="25" fill="#fff" />';
    paths += '<rect x="162" y="27" width="11" height="11" fill="#000" />';
    
    paths += '<rect x="10" y="145" width="45" height="45" fill="#000" stroke="#000" stroke-width="5" />';
    paths += '<rect x="20" y="155" width="25" height="25" fill="#fff" />';
    paths += '<rect x="27" y="162" width="11" height="11" fill="#000" />';

    // Randomize modules based on table number seed
    let seed = 0;
    for (let j = 0; j < tableNo.length; j++) {
      seed += tableNo.charCodeAt(j) * (j + 1);
    }

    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        if ((r < 6 && c < 6) || (r < 6 && c > 13) || (r > 13 && c < 6)) continue;
        if (Math.sin(r * 12.3 + c * 35.7 + seed * 8.9) > 0.0) {
          const x = 10 + c * 9;
          const y = 10 + r * 9;
          paths += `<rect x="${x}" y="${y}" width="7" height="7" fill="#000" />`;
        }
      }
    }

    container.innerHTML = `
      <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#ffffff" />
        ${paths}
        <rect x="80" y="80" width="40" height="40" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="4" />
        <text x="100" y="105" font-size="14" font-family="Outfit" font-weight="900" text-anchor="middle" fill="#d97706">T-${tableNo}</text>
      </svg>
    `;

    document.getElementById('admin-qr-preview-title').innerText = `Table ${tableNo} Booking QR`;
    
    // Resolve absolute landing page URL
    const baseUrl = window.location.href.split('#')[0];
    document.getElementById('admin-qr-preview-link').innerText = `${baseUrl}#menu?table=${tableNo}`;
  }

  printSelectedQR() {
    const tableNo = document.getElementById('admin-qr-table-select').value;
    const baseUrl = window.location.href.split('#')[0];
    const url = `${baseUrl}#menu?table=${tableNo}`;
    
    // Open print window specifically for QR
    const qrWin = window.open('', 'Print QR', 'width=400,height=500');
    qrWin.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${tableNo}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 2rem; }
            .qr-container { margin: 2rem auto; width: max-content; }
            h2 { margin-bottom: 0.5rem; }
            p { color: #666; font-size: 0.9rem; margin-top: 1rem; }
            code { background-color: #f1f1f1; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
          </style>
        </head>
        <body>
          <h2>SRI VIJAYA DURGA RESTAURANT</h2>
          <h3>Table ${tableNo} Ordering Menu</h3>
          <div class="qr-container">
            ${document.getElementById('admin-qr-preview-graphic').innerHTML}
          </div>
          <code>${url}</code>
          <p>Scan to place food orders directly from your mobile phone.</p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    qrWin.document.close();
  }

  // --- THEME SWITCHER CONTROLLER ---
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('svd_theme', newTheme);
    this.toggleThemeIcon(newTheme);
    this.showToast(`Switched to ${newTheme} mode`, 'info');
  }

  toggleThemeIcon(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (!sun || !moon) return;

    if (theme === 'dark') {
      sun.style.display = 'block';
      moon.style.display = 'none';
    } else {
      sun.style.display = 'none';
      moon.style.display = 'block';
    }
  }

  // --- TOAST SYSTEMS ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-messages-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `
      <span>${icon}</span>
      <div>${message}</div>
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Auto-destruct
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // --- SYNTHESIZED SOUND EFFECTS (Web Audio API) ---
  playChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Node chains
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Sweet major chord chime: C5 & E5
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      
      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      
      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime);
      
      osc1.stop(audioCtx.currentTime + 0.8);
      osc2.stop(audioCtx.currentTime + 0.8);
    } catch(e) {
      console.warn("Audio Context failed to initialize (interaction required first).");
    }
  }

  // --- AUTHENTICATION SHIELD SYSTEM ---
  checkAuth(role) {
    const session = sessionStorage.getItem(`svd_session_${role}`);
    return !!session;
  }

  handleLogout(role) {
    if (confirm(`Are you sure you want to log out from the ${role === 'admin' ? 'Admin Suite' : 'Kitchen Dashboard'}?`)) {
      sessionStorage.removeItem(`svd_session_${role}`);
      this.showToast("Logged out successfully.", "info");
      this.handleRouting();
    }
  }

  renderLoginScreen(role) {
    const loginWrapper = document.getElementById(`${role}-login-wrapper`);
    const contentWrapper = document.getElementById(`${role}-content-wrapper`);
    if (!loginWrapper || !contentWrapper) return;

    loginWrapper.style.display = 'flex';
    contentWrapper.style.display = 'none';

    loginWrapper.innerHTML = `
      <div class="container py-12" style="min-height: 70vh; display: flex; align-items: center; justify-content: center; width: 100%;">
        <div class="login-card glass-panel" style="width: 100%; max-width: 400px; padding: 2.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); background: var(--bg-surface); box-shadow: var(--shadow-xl);">
          <div class="text-center mb-6">
            <span style="font-size: 3rem; display: block; margin-bottom: 0.5rem;">🔒</span>
            <h2 class="auth-title" style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.75rem; color: var(--text-main); margin-bottom: 0.25rem; line-height: 1.2;">
              ${role === 'kitchen' ? 'Kitchen Dashboard' : 'Admin Portal'}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Authorized Personnel Only</p>
          </div>
          
          <form id="${role}-auth-login-form" onsubmit="app.handleLogin(event, '${role}')">
            <div class="form-group mb-4">
              <label for="${role}-login-email" class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-main);">Mail ID</label>
              <input type="email" id="${role}-login-email" class="form-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; font-family: inherit; background: var(--bg-surface-alt); color: var(--text-main);" placeholder="name@durga.com" required>
            </div>
            
            <div class="form-group mb-6">
              <label for="${role}-login-password" class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-main);">6-Digit Password</label>
              <input type="password" id="${role}-login-password" class="form-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; font-family: inherit; background: var(--bg-surface-alt); color: var(--text-main);" pattern="\\d{6}" maxlength="6" placeholder="******" required>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block btn-lg" style="width: 100%; padding: 0.85rem; font-weight: 600;">
              Access Portal
            </button>
          </form>
          
          <div class="text-center mt-6">
            <a href="javascript:void(0)" onclick="app.showForgotPasswordModal('${role}')" style="color: var(--primary-color); font-size: 0.875rem; font-weight: 500; text-decoration: none;">Forgot Password?</a>
          </div>
        </div>
      </div>
    `;
  }

  handleLogin(event, role) {
    event.preventDefault();
    const email = document.getElementById(`${role}-login-email`).value.trim();
    const password = document.getElementById(`${role}-login-password`).value.trim();

    const users = JSON.parse(localStorage.getItem('svd_users')) || [];
    const user = users.find(u => u.email === email && u.role === role);

    if (!user) {
      this.showToast("No registered account found for this portal!", "warning");
      return;
    }

    if (user.password !== password) {
      this.showToast("Invalid 6-digit password!", "warning");
      return;
    }

    sessionStorage.setItem(`svd_session_${role}`, email);
    this.showToast(`Logged in successfully!`, 'success');
    this.playChime();
    this.handleRouting();
  }

  showForgotPasswordModal(role) {
    const email = prompt("Enter your registered Mail ID to receive password reset link:");
    if (email === null) return;
    if (!email.trim()) {
      this.showToast("Email cannot be empty!", "warning");
      return;
    }

    const users = JSON.parse(localStorage.getItem('svd_users')) || [];
    const user = users.find(u => u.email === email.trim() && u.role === role);

    if (!user) {
      this.showToast("This email is not registered for this portal!", "warning");
      return;
    }

    this.showToast("Local reset email triggered!", "success");
    this.showSimulatedInbox(email.trim(), role);
  }

  showSimulatedInbox(email, role) {
    const existing = document.getElementById('simulated-mail-modal');
    if (existing) existing.remove();

    const mailModal = document.createElement('div');
    mailModal.id = 'simulated-mail-modal';
    mailModal.style.position = 'fixed';
    mailModal.style.top = '0';
    mailModal.style.left = '0';
    mailModal.style.width = '100%';
    mailModal.style.height = '100%';
    mailModal.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
    mailModal.style.zIndex = '100000';
    mailModal.style.display = 'flex';
    mailModal.style.alignItems = 'center';
    mailModal.style.justifyContent = 'center';
    mailModal.style.padding = '1rem';

    mailModal.innerHTML = `
      <div class="glass-panel" style="width: 100%; max-width: 500px; padding: 2rem; border-radius: var(--radius-lg); border: 2px solid var(--primary-color); background: var(--bg-surface); box-shadow: var(--shadow-2xl); animation: scaleUp 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-weight: 800; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span>📨</span> Simulated Inbox (Mails)
          </h3>
          <button onclick="document.getElementById('simulated-mail-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); padding: 0;">&times;</button>
        </div>
        
        <div style="background: var(--bg-surface-alt); padding: 1.25rem; border-radius: var(--radius); margin-bottom: 1.5rem; border-left: 4px solid var(--primary-color);">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; line-height: 1.4;">
            <strong>From:</strong> accounts@srivijayadurga.com<br>
            <strong>To:</strong> ${email}<br>
            <strong>Subject:</strong> Reset Password Link
          </div>
          <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; color: var(--text-main); font-size: 0.9rem; line-height: 1.5;">
            <p>Dear Local ${role === 'admin' ? 'Administrator' : 'Kitchen Master'},</p>
            <p>We received a password reset request. Click the button below to update your 6-digit credential for the Sri Vijaya Durga portal.</p>
            <div style="text-align: center; margin: 1.5rem 0;">
              <button onclick="app.openResetPasswordScreen('${email}', '${role}')" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; font-weight: bold; border-radius: var(--radius); cursor: pointer; font-size: 0.9rem; transition: background 0.2s;">
                Change Password Link
              </button>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Security note: Only registered portal employees can trigger this client simulation.</p>
          </div>
        </div>
        
        <button class="btn btn-outline btn-block" onclick="document.getElementById('simulated-mail-modal').remove()" style="width: 100%;">
          Close Inbox
        </button>
      </div>
    `;

    document.body.appendChild(mailModal);
  }

  openResetPasswordScreen(email, role) {
    const mailModal = document.getElementById('simulated-mail-modal');
    if (mailModal) mailModal.remove();

    const resetModal = document.createElement('div');
    resetModal.id = 'password-reset-modal';
    resetModal.style.position = 'fixed';
    resetModal.style.top = '0';
    resetModal.style.left = '0';
    resetModal.style.width = '100%';
    resetModal.style.height = '100%';
    resetModal.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
    resetModal.style.zIndex = '100000';
    resetModal.style.display = 'flex';
    resetModal.style.alignItems = 'center';
    resetModal.style.justifyContent = 'center';
    resetModal.style.padding = '1rem';

    resetModal.innerHTML = `
      <div class="glass-panel" style="width: 100%; max-width: 400px; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); background: var(--bg-surface); box-shadow: var(--shadow-2xl); animation: scaleUp 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-weight: 800; color: var(--text-main); margin: 0;">
            🔑 Reset Password
          </h3>
          <button onclick="document.getElementById('password-reset-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); padding: 0;">&times;</button>
        </div>
        
        <form id="password-reset-form" onsubmit="app.handlePasswordReset(event, '${email}', '${role}')">
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Resetting password for: <strong style="color: var(--text-main);">${email}</strong>
          </div>
          
          <div class="form-group mb-4">
            <label for="new-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-main);">New 6-Digit Password</label>
            <input type="password" id="new-password" class="form-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; background: var(--bg-surface-alt); color: var(--text-main);" pattern="\\d{6}" maxlength="6" placeholder="******" required>
          </div>
          
          <div class="form-group mb-6">
            <label for="confirm-new-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-main);">Confirm 6-Digit Password</label>
            <input type="password" id="confirm-new-password" class="form-select" style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.75rem; background: var(--bg-surface-alt); color: var(--text-main);" pattern="\\d{6}" maxlength="6" placeholder="******" required>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="width: 100%; padding: 0.85rem; font-weight: 600;">
            Update Password
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(resetModal);
  }

  handlePasswordReset(event, email, role) {
    event.preventDefault();
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-new-password').value;

    if (newPass !== confirmPass) {
      this.showToast("Passwords do not match!", "warning");
      return;
    }

    const users = JSON.parse(localStorage.getItem('svd_users')) || [];
    const userIndex = users.findIndex(u => u.email === email && u.role === role);

    if (userIndex > -1) {
      users[userIndex].password = newPass;
      localStorage.setItem('svd_users', JSON.stringify(users));
      
      this.showToast("Password updated successfully! Log in now.", "success");
      this.playChime();
      
      const modal = document.getElementById('password-reset-modal');
      if (modal) modal.remove();
      
      this.renderLoginScreen(role);
    } else {
      this.showToast("User registration error.", "warning");
    }
  }

  // --- PREMIUM FOOD CARD POPUP ---
  showFoodPopup(itemId) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const existing = document.getElementById('food-popup-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'food-popup-modal';
    modal.className = 'food-popup-overlay';
    modal.onclick = (e) => {
      if (e.target === modal || e.target.classList.contains('close-popup-btn')) {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
      }
    };

    modal.innerHTML = `
      <div class="food-popup-card">
        <button class="close-popup-btn">&times;</button>
        <div class="food-popup-img-wrapper">
          <img src="${item.image}" alt="${item.name}" class="food-popup-img">
        </div>
        <div class="food-popup-info">
          <span class="food-popup-category">${item.category}</span>
          <h2 class="food-popup-title">${item.name}</h2>
          <p class="food-popup-description">${item.description}</p>
          <div class="food-popup-footer">
            <span class="food-popup-price">₹${item.price}</span>
            <button class="btn btn-primary" onclick="app.addItemFromPopup(${item.id})">Add to Order +</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  addItemFromPopup(itemId) {
    this.updateCartQty(itemId, 1);
    const modal = document.getElementById('food-popup-modal');
    if (modal) {
      modal.classList.add('fade-out');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // --- PWA SERVICE WORKER REGISTRATION ---
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker Registered successfully.', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed.', err));
    }
  }
}

// Instantiate global app runner
window.app = new RestaurantApp();
window.onload = () => {
  window.app.init();
};
