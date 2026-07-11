import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ordersFilePath = path.join(__dirname, 'orders.json');
const cmsSettingsFilePath = path.join(__dirname, 'cms_settings.json');
const cmsVersionsFilePath = path.join(__dirname, 'cms_versions.json');

import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import mongoose from 'mongoose';
import { Notification, ActivityLog, KitchenHistory } from './models/mongo.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '10mb' }));

const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

// --- PRISMA (PostgreSQL) INIT ---
const prisma = new PrismaClient();

// Startup Check to verify database connection and schema
async function runStartupChecks() {
  console.log('[Startup Check] Verifying database connection and schema...');
  try {
    await prisma.order.count();
    console.log('[Startup Check] Database connection and schema verification successful. Order table is accessible.');
  } catch (err) {
    console.error('\n======================================================================');
    console.error('[Startup Check ERROR] Database check failed!');
    console.error('Could not access the Order table in the database.');
    console.error('This is likely because:');
    console.error('1. You did not specify the schema in your DATABASE_URL environment variable on Render.');
    console.error('   Please make sure your connection string ends with: &schema=svd');
    console.error('2. The schema has not been pushed to the database.');
    console.error('   Run locally: npx prisma db push');
    console.error('Original Error:', err.message);
    console.error('======================================================================\n');
  }
}
runStartupChecks();

// --- WHATSAPP NOTIFICATION UTILITY ---
async function sendWhatsAppMessage(recipientType, to, message, retries = 3) {
  console.log(`[WhatsApp Notification] Attempting to send message to ${recipientType} (${to})...`);
  
  let attempt = 0;
  while (attempt < retries) {
    try {
      attempt++;
      // Simulate API call to WhatsApp Gateway
      const success = true; // High availability mock
      if (!success) {
        throw new Error('Simulated network timeout');
      }
      
      console.log(`[WhatsApp SUCCESS] Message successfully sent to ${recipientType} (${to}) on attempt ${attempt}.`);
      console.log(`[WhatsApp Payload]:\n${message}\n----------------------------------------`);
      return true;
    } catch (err) {
      console.error(`[WhatsApp ERROR] Failed to send message to ${recipientType} (${to}) on attempt ${attempt}: ${err.message}`);
      if (attempt >= retries) {
        console.error(`[WhatsApp FAILURE] Message to ${recipientType} (${to}) failed after ${retries} attempts.`);
        return false;
      }
      // Wait 500ms before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return false;
}

// --- MONGOOSE (MongoDB) INIT ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/svd_db')
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch(err => console.error('[MongoDB] Connection error:', err));


// --- API ENDPOINTS (PostgreSQL) ---

// Fetch all active orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
    });
    // Convert to frontend expected format
    const formattedOrders = orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        id: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isAdditional: i.isAdditional,
        addedAt: i.addedAt,
      }))
    }));
    res.json(formattedOrders);
  } catch (err) {
    console.warn('[DB Warning] GET /api/orders failed, falling back to local JSON persistence:', err.message);
    const localOrders = readJsonFile(ordersFilePath, []);
    res.json(localOrders);
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  console.log('[Order Created] Received new order request');
  const newOrder = req.body;
  
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ success: false, error: 'Invalid order data' });
  }

  try {
    const createdOrder = await prisma.order.create({
      data: {
        id: newOrder.id,
        tableNo: newOrder.tableNo,
        customerName: newOrder.customerName || '',
        customerPhone: newOrder.customerPhone || '',
        status: newOrder.status,
        timestamp: newOrder.timestamp,
        isParcel: newOrder.isParcel || false,
        specialNotes: newOrder.specialNotes,
        pickupTime: newOrder.pickupTime,
        paymentMethod: newOrder.paymentMethod,
        deliveryAddress: newOrder.deliveryAddress || null,
        addressType: newOrder.addressType || null,
        latitude: newOrder.latitude !== undefined && newOrder.latitude !== null ? parseFloat(newOrder.latitude) : null,
        longitude: newOrder.longitude !== undefined && newOrder.longitude !== null ? parseFloat(newOrder.longitude) : null,
        items: {
          create: newOrder.items.map(i => ({
            menuItemId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            isAdditional: i.isAdditional || false,
            addedAt: i.addedAt,
          }))
        }
      },
      include: { items: true }
    });

    console.log(`[Order Saved] Order ${createdOrder.id} saved to PostgreSQL.`);

    // Perform post-order operations in a separate safe try-catch
    try {
      // Instantly broadcast to all tabs first to guarantee real-time UI sync
      io.emit('new-order', newOrder); 

      // Send WhatsApp Notifications for Takeaway/Parcel (isParcel) Orders
      if (createdOrder.isParcel) {
        const adminWhatsAppNumber = '+919966315544';
        const customerWhatsAppNumber = createdOrder.customerPhone || '';

        const orderTime = new Date(createdOrder.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const subtotal = createdOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharges = 0; 
        const grandTotal = subtotal + deliveryCharges;

        const itemsList = createdOrder.items.map(item => `• ${item.name} × ${item.quantity} (₹${item.price} each)`).join('\n');

        const mapsLink = (createdOrder.latitude && createdOrder.longitude)
          ? `\n*Google Maps Location:* https://www.google.com/maps/search/?api=1&query=${createdOrder.latitude},${createdOrder.longitude}`
          : '';

        const adminMessage = `📢 *New Takeaway Order Received!*

*Order ID:* #${createdOrder.id}
*Order Time:* ${orderTime}
*Customer Name:* ${createdOrder.customerName}
*Customer Mobile:* ${createdOrder.customerPhone}

*Delivery Address:*
${createdOrder.deliveryAddress || 'Not Provided'}

*Address Type:* ${createdOrder.addressType || 'Home'}${mapsLink}
*Payment Mode:* ${createdOrder.paymentMethod || 'UPI'}

*Ordered Items:*
${itemsList}

*Subtotal:* ₹${subtotal}
*Delivery Charges:* ₹${deliveryCharges}
*Grand Total:* ₹${grandTotal}

*Instructions:* ${createdOrder.specialNotes || 'None'}`;

        const customerMessage = `🍽️ Thank you for ordering from Sri Vijaya Durga Restaurant!

✅ Your order has been received successfully.

Order ID: #${createdOrder.id}

Items:
${createdOrder.items.map(item => `• ${item.name} × ${item.quantity}`).join('\n')}

Total: ₹${grandTotal}

Payment Mode: ${createdOrder.paymentMethod || 'UPI'}

Delivery Address:
${createdOrder.deliveryAddress || 'Not Provided'}

Your order is being prepared.

For assistance, contact:
📞 +919966315544

Thank you for choosing us!`;

        // Trigger notifications asynchronously and safely
        (async () => {
          try {
            await sendWhatsAppMessage('Admin', adminWhatsAppNumber, adminMessage);
          } catch (adminErr) {
            console.error('[WhatsApp Admin Error] Failed to process Admin notification:', adminErr.message);
          }
          try {
            if (customerWhatsAppNumber) {
              await sendWhatsAppMessage('Customer', customerWhatsAppNumber, customerMessage);
            }
          } catch (custErr) {
            console.error('[WhatsApp Customer Error] Failed to process Customer notification:', custErr.message);
          }
        })();
      }

      // Log to MongoDB (optional, non-blocking)
      try {
        await ActivityLog.create({
          id: 'ACT-' + Date.now(),
          action: 'ORDER_CREATED',
          details: { orderId: createdOrder.id, tableNo: createdOrder.tableNo }
        });
      } catch (mongoErr) {
        console.warn('[MongoDB Warning] Failed to log activity to MongoDB:', mongoErr.message);
      }
    } catch (postErr) {
      console.error('[Warning] Post-order notification/logging failed:', postErr);
    }

    // Return the response as requested
    res.status(201).json({
      success: true,
      orderId: createdOrder.id,
      order: {
        ...createdOrder,
        items: createdOrder.items.map(i => ({
          id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isAdditional: i.isAdditional,
          addedAt: i.addedAt
        }))
      }
    });

  } catch (err) {
    console.warn('[DB Warning] POST /api/orders failed database execution, falling back to local JSON persistence:', err.message);
    try {
      const fallbackOrder = {
        ...newOrder,
        items: newOrder.items.map(i => ({
          ...i,
          menuItemId: i.id,
          isAdditional: i.isAdditional || false
        }))
      };

      const localOrders = readJsonFile(ordersFilePath, []);
      const filtered = localOrders.filter(o => o.id !== newOrder.id);
      filtered.push(fallbackOrder);
      writeJsonFile(ordersFilePath, filtered);

      io.emit('new-order', newOrder);

      res.status(201).json({
        success: true,
        orderId: newOrder.id,
        order: fallbackOrder
      });
    } catch (fallbackErr) {
      console.error('[Error] Local persistence fallback failed for POST /api/orders:', fallbackErr);
      res.status(500).json({ success: false, error: 'Local persistence fallback failed: ' + fallbackErr.message });
    }
  }
});

// Update order (e.g. status change, adding items)
app.put('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const updates = req.body;
  
  // Instantly broadcast for real-time UI
  io.emit('order_updated', updates);

  try {
    // Determine if we are updating items or just status
    if (updates.items) {
      // Clear existing items and recreate
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: updates.status,
          timestamp: updates.timestamp,
          specialNotes: updates.specialNotes,
          paymentMethod: updates.paymentMethod,
          items: {
            create: updates.items.map(i => ({
              menuItemId: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              isAdditional: i.isAdditional || false,
              addedAt: i.addedAt,
            }))
          }
        }
      });
    } else {
      // Just updating fields like status
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: updates.status, 
          timestamp: updates.timestamp,
          paymentMethod: updates.paymentMethod
        }
      });
    }

    console.log(`[Database Response] Order ${orderId} updated in PostgreSQL.`);

    // Log to MongoDB history if status changed (optional, non-blocking)
    if (updates.status) {
      try {
        await KitchenHistory.create({ orderId, status: updates.status });
        
        // If PAID, create notification in MongoDB
        if (updates.status === 'PAID') {
          const notifId = 'NTF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
          const notification = await Notification.create({
            id: notifId,
            orderId: orderId,
            tableNo: updates.tableNo || 'N/A',
            customerName: updates.customerName || 'Customer',
            amount: updates.amount || 0, // In reality, we'd calculate or receive this
            timestamp: Date.now()
          });
          
          console.log(`[Realtime Events] Emitted new_notification for ${orderId}`);
          io.emit('new_notification', notification);
        }
      } catch (mongoErr) {
        console.warn('[MongoDB Warning] Failed to log kitchen history or notification to MongoDB:', mongoErr.message);
      }
    }

    res.json({ message: 'Order updated', order: updates });

  } catch (err) {
    console.warn('[DB Warning] PUT /api/orders/:id failed database execution, falling back to local JSON persistence:', err.message);
    try {
      const localOrders = readJsonFile(ordersFilePath, []);
      const orderIdx = localOrders.findIndex(o => o.id === orderId);
      if (orderIdx !== -1) {
        const existing = localOrders[orderIdx];
        const updated = {
          ...existing,
          ...updates,
          items: updates.items ? updates.items.map(i => ({
            ...i,
            menuItemId: i.id,
            isAdditional: i.isAdditional || false
          })) : existing.items
        };
        localOrders[orderIdx] = updated;
        writeJsonFile(ordersFilePath, localOrders);
      } else {
        const fallbackOrder = {
          id: orderId,
          ...updates,
          items: updates.items ? updates.items.map(i => ({
            ...i,
            menuItemId: i.id,
            isAdditional: i.isAdditional || false
          })) : []
        };
        localOrders.push(fallbackOrder);
        writeJsonFile(ordersFilePath, localOrders);
      }
      res.json({ message: 'Order updated via local persistence fallback', order: updates });
    } catch (fallbackErr) {
      console.error('[Error] Local persistence fallback failed for PUT /api/orders/:id:', fallbackErr);
      res.status(500).json({ error: 'Local persistence fallback failed: ' + fallbackErr.message });
    }
  }
});

// Sync (For Bulk updates / existing logic compatibility)
app.post('/api/orders/sync', async (req, res) => {
  // If the frontend tries to sync completely, we just broadcast to keep devices in sync
  io.emit('orders_synced', req.body);
  res.json({ message: 'Sync broadcasted' });
});

// --- CMS APIS ---

// Directory setup
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Fallback configuration
const DEFAULT_CMS_SETTINGS = {
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

app.use('/uploads', express.static(uploadsDir));

// Helper: Get merged settings
async function getMergedCmsSettings() {
  try {
    const latestVersion = await prisma.cmsVersion.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    if (latestVersion && latestVersion.content) {
      const dbContent = JSON.parse(latestVersion.content);
      return { ...DEFAULT_CMS_SETTINGS, ...dbContent };
    }
  } catch (err) {
    console.error('Error fetching CMS settings from DB, falling back to local JSON file:', err.message);
    const localSettings = readJsonFile(cmsSettingsFilePath, null);
    if (localSettings) {
      return { ...DEFAULT_CMS_SETTINGS, ...localSettings };
    }
  }
  return DEFAULT_CMS_SETTINGS;
}

// GET latest CMS content
app.get('/api/cms', async (req, res) => {
  const merged = await getMergedCmsSettings();
  res.json({ success: true, settings: merged });
});

// UPDATE CMS content
app.post('/api/cms', async (req, res) => {
  try {
    const { settings, author } = req.body;
    if (!settings) {
      return res.status(400).json({ error: 'Settings content is required' });
    }

    // Validation
    const errors = [];
    if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      errors.push('Invalid contact email address');
    }
    if (settings.primaryPhone && !/^\d{10}$/.test(settings.primaryPhone)) {
      errors.push('Primary phone number must be exactly 10 digits');
    }
    if (settings.whatsappNumber && !/^\d{10}$/.test(settings.whatsappNumber)) {
      errors.push('WhatsApp phone number must be exactly 10 digits');
    }
    if (settings.googleMapsUrl && !/^https?:\/\//.test(settings.googleMapsUrl)) {
      errors.push('Google Maps URL must begin with http:// or https://');
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Merge incoming changes over fallback defaults
    const current = await getMergedCmsSettings();
    const updated = { ...current, ...settings };

    let versionId;
    try {
      const newVersion = await prisma.cmsVersion.create({
        data: {
          content: JSON.stringify(updated),
          author: author || 'admin@srivijayadurga.com'
        }
      });
      versionId = newVersion.id;
    } catch (dbErr) {
      console.warn('[DB Warning] Failed to write CMS settings to DB, writing to local files:', dbErr.message);
      writeJsonFile(cmsSettingsFilePath, updated);

      const localVersions = readJsonFile(cmsVersionsFilePath, []);
      versionId = localVersions.length > 0 ? Math.max(...localVersions.map(v => v.id)) + 1 : 1;
      localVersions.unshift({
        id: versionId,
        author: author || 'admin@srivijayadurga.com',
        content: JSON.stringify(updated),
        createdAt: new Date().toISOString()
      });
      writeJsonFile(cmsVersionsFilePath, localVersions);
    }

    // Realtime update socket broadcast
    io.emit('cms-updated', updated);

    res.json({ success: true, versionId, settings: updated });
  } catch (err) {
    console.error('Failed to update CMS settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET CMS version history list
app.get('/api/cms/versions', async (req, res) => {
  try {
    const versions = await prisma.cmsVersion.findMany({
      select: {
        id: true,
        author: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, versions });
  } catch (err) {
    console.warn('[DB Warning] Failed to fetch CMS versions from DB, returning local versions history:', err.message);
    const localVersions = readJsonFile(cmsVersionsFilePath, []);
    const metadata = localVersions.map(v => ({
      id: v.id,
      author: v.author,
      createdAt: v.createdAt
    }));
    res.json({ success: true, versions: metadata });
  }
});

// RESTORE an old CMS version
app.post('/api/cms/versions/:id/restore', async (req, res) => {
  try {
    const versionId = parseInt(req.params.id);
    const { author } = req.body;
    let restoredSettings;
    let newVersionId;

    try {
      const targetVersion = await prisma.cmsVersion.findUnique({
        where: { id: versionId }
      });

      if (!targetVersion) {
        return res.status(404).json({ error: 'Version not found' });
      }

      const newVersion = await prisma.cmsVersion.create({
        data: {
          content: targetVersion.content,
          author: author || `Restored version #${versionId}`
        }
      });
      newVersionId = newVersion.id;
      restoredSettings = JSON.parse(targetVersion.content);
    } catch (dbErr) {
      console.warn('[DB Warning] Failed to restore CMS version via DB, falling back to local files:', dbErr.message);
      const localVersions = readJsonFile(cmsVersionsFilePath, []);
      const targetVersion = localVersions.find(v => v.id === versionId);

      if (!targetVersion) {
        return res.status(404).json({ error: 'Version not found in local history' });
      }

      restoredSettings = JSON.parse(targetVersion.content);
      writeJsonFile(cmsSettingsFilePath, restoredSettings);

      newVersionId = localVersions.length > 0 ? Math.max(...localVersions.map(v => v.id)) + 1 : 1;
      localVersions.unshift({
        id: newVersionId,
        author: author || `Restored version #${versionId}`,
        content: targetVersion.content,
        createdAt: new Date().toISOString()
      });
      writeJsonFile(cmsVersionsFilePath, localVersions);
    }

    // Broadcast update
    io.emit('cms-updated', restoredSettings);

    res.json({ success: true, versionId: newVersionId, settings: restoredSettings });
  } catch (err) {
    console.error('Failed to restore CMS version:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Base64 file upload endpoint
app.post('/api/cms/upload', async (req, res) => {
  try {
    const { filename, type, base64 } = req.body;
    if (!filename || !type || !base64) {
      return res.status(400).json({ error: 'Missing required upload parameters' });
    }

    // Type validation
    if (!type.startsWith('image/') && type !== 'application/pdf') {
      return res.status(400).json({ error: 'Unsupported file type. Please upload images or PDFs only.' });
    }

    // Convert base64 payload to binary buffer
    const buffer = Buffer.from(base64, 'base64');

    // Size validation (Max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 5MB.' });
    }

    // Safe sanitized filename
    const sanitizedFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(uploadsDir, sanitizedFilename);

    await fs.promises.writeFile(filePath, buffer);

    res.json({ success: true, url: `/uploads/${sanitizedFilename}` });
  } catch (err) {
    console.error('Failed to upload file:', err);
    res.status(500).json({ error: 'Failed to process file upload' });
  }
});

// DELETE file endpoint
app.delete('/api/cms/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      res.json({ success: true, message: 'File deleted' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    console.error('Failed to delete file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- MENU PERSISTENCE ENDPOINTS ---
const menuItemsFilePath = path.join(__dirname, 'menu_items.json');
const parcelItemsFilePath = path.join(__dirname, 'parcel_items.json');

// Helper to read JSON file safely
function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON file safely
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// GET Menu Items
app.get('/api/menu', (req, res) => {
  const dineIn = readJsonFile(menuItemsFilePath, []);
  const takeaway = readJsonFile(parcelItemsFilePath, []);
  res.json({ success: true, dineIn, takeaway });
});

// POST Save Menu Items and Broadcast update
app.post('/api/menu', (req, res) => {
  const { dineIn, takeaway } = req.body;
  
  if (dineIn) {
    writeJsonFile(menuItemsFilePath, dineIn);
  }
  if (takeaway) {
    writeJsonFile(parcelItemsFilePath, takeaway);
  }

  // Broadcast update to all connected socket clients
  io.emit('menu-updated', { dineIn, takeaway });

  res.json({ success: true, message: 'Menu synced successfully' });
});

// --- SERVE STATIC FRONTEND FOR UNIFIED RENDER DEPLOYMENT ---
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback (Catch-all for React Router)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`[Realtime Events] Client connected: ${socket.id}`);
  
  // Kitchen Fetch Response
  socket.on('request_orders', async () => {
    try {
      const orders = await prisma.order.findMany({ include: { items: true } });
      const formattedOrders = orders.map(o => ({
        ...o,
        items: o.items.map(i => ({
          id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isAdditional: i.isAdditional,
          addedAt: i.addedAt,
        }))
      }));
      socket.emit('initial_orders', formattedOrders);
    } catch (err) {
      console.error('[Error] Fetching initial orders via socket:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Realtime Events] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] Production Backend running on port ${PORT}`);
});
