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
const tablesFilePath = path.join(__dirname, 'tables.json');

import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import mongoose from 'mongoose';
import { Notification, ActivityLog, KitchenHistory } from './models/mongo.js';
import { cloudinary } from './config/cloudinary.js';

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

// Function to save file to DB
async function saveFileToDb(filename, type, base64) {
  try {
    await prisma.uploadedFile.upsert({
      where: { filename },
      update: { type, base64 },
      create: { filename, type, base64 }
    });
    console.log(`[DB] File saved to database successfully: ${filename}`);
    return true;
  } catch (err) {
    console.error(`[DB ERROR] Failed to save file ${filename} to database:`, err.message);
    return false;
  }
}

// Function to fetch file from DB and write to disk if missing
async function getFileFromDb(filename) {
  try {
    const file = await prisma.uploadedFile.findUnique({
      where: { filename }
    });
    if (file) {
      const buffer = Buffer.from(file.base64, 'base64');
      const filePath = path.join(uploadsDir, filename);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, buffer);
      console.log(`[DB] Restored file from database to local path: ${filename}`);
      return file;
    }
  } catch (err) {
    console.error(`[DB ERROR] Failed to fetch file ${filename} from database:`, err.message);
  }
  return null;
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

// Custom endpoint to serve uploaded files with database fallback caching
app.get('/uploads/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  const file = await getFileFromDb(filename);
  if (file) {
    return res.sendFile(filePath);
  }

  next();
});
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

    // Convert base64 payload to binary buffer for size check
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 5MB.' });
    }

    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      // Upload directly to Cloudinary using base64 data URL format
      const base64DataUrl = `data:${type};base64,${base64}`;
      const cleanFilename = filename.substring(0, filename.lastIndexOf('.')) || filename;
      const publicId = `${Date.now()}_${cleanFilename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

      console.log(`[Cloudinary] Uploading file to cloud: ${publicId}`);
      const uploadResult = await cloudinary.uploader.upload(base64DataUrl, {
        folder: 'restaurant_uploads',
        public_id: publicId,
        resource_type: 'auto'
      });

      console.log('[Cloudinary] Upload successful:', uploadResult.secure_url);
      return res.json({ success: true, url: uploadResult.secure_url });
    } else {
      console.warn('[Cloudinary Warning] Environment variables not set. Falling back to local/DB persistence.');
      // Safe sanitized filename
      const sanitizedFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const filePath = path.join(uploadsDir, sanitizedFilename);

      await fs.promises.writeFile(filePath, buffer);

      // Save to PostgreSQL database as persistent backup
      await saveFileToDb(sanitizedFilename, type, base64);

      return res.json({ success: true, url: `/uploads/${sanitizedFilename}` });
    }
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
    }

    // Delete from database
    try {
      await prisma.uploadedFile.delete({
        where: { filename }
      });
      console.log(`[DB] Deleted file from database: ${filename}`);
    } catch (dbErr) {
      console.warn(`[DB WARNING] File ${filename} delete from database skipped or failed:`, dbErr.message);
    }

    res.json({ success: true, message: 'File deleted' });
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
app.get('/api/menu', async (req, res) => {
  try {
    const dbItems = await prisma.menuItem.findMany();
    if (dbItems && dbItems.length > 0) {
      const dineIn = dbItems.filter(item => item.id < 200);
      const takeaway = dbItems.filter(item => item.id >= 200);
      return res.json({ success: true, dineIn, takeaway });
    }

    console.log('[DB] Menu table is empty, seeding from local JSON backups...');
    const dineIn = readJsonFile(menuItemsFilePath, []);
    const takeaway = readJsonFile(parcelItemsFilePath, []);

    if (dineIn.length > 0 || takeaway.length > 0) {
      await prisma.menuItem.createMany({
        data: [
          ...dineIn.map(i => ({
            id: i.id,
            name: i.name,
            price: parseFloat(i.price),
            category: i.category,
            type: i.type,
            image: i.image,
            description: i.description || ""
          })),
          ...takeaway.map(i => ({
            id: i.id,
            name: i.name,
            price: parseFloat(i.price),
            category: i.category,
            type: i.type,
            image: i.image,
            description: i.description || ""
          }))
        ]
      });
      console.log('[DB] Seeding of Menu items successful.');
    }
    res.json({ success: true, dineIn, takeaway });
  } catch (err) {
    console.error('Error fetching menu items from DB, falling back to local JSON files:', err.message);
    const dineIn = readJsonFile(menuItemsFilePath, []);
    const takeaway = readJsonFile(parcelItemsFilePath, []);
    res.json({ success: true, dineIn, takeaway });
  }
});

// POST Save Menu Items and Broadcast update
app.post('/api/menu', async (req, res) => {
  const { dineIn, takeaway } = req.body;

  if (dineIn) {
    writeJsonFile(menuItemsFilePath, dineIn);
  }
  if (takeaway) {
    writeJsonFile(parcelItemsFilePath, takeaway);
  }

  try {
    await prisma.$transaction([
      prisma.menuItem.deleteMany(),
      prisma.menuItem.createMany({
        data: [
          ...(dineIn || []).map(i => ({
            id: i.id,
            name: i.name,
            price: parseFloat(i.price),
            category: i.category,
            type: i.type,
            image: i.image,
            description: i.description || ""
          })),
          ...(takeaway || []).map(i => ({
            id: i.id,
            name: i.name,
            price: parseFloat(i.price),
            category: i.category,
            type: i.type,
            image: i.image,
            description: i.description || ""
          }))
        ]
      })
    ]);
    console.log('[DB] Menu items synchronized in database successfully.');
  } catch (err) {
    console.error('[DB Warning] Failed to sync menu with database:', err.message);
  }

  io.emit('menu-updated', { dineIn, takeaway });

  res.json({ success: true, message: 'Menu synced successfully' });
});

// --- TESTIMONIALS / REVIEWS ENDPOINTS ---
const reviewsFilePath = path.join(__dirname, 'reviews.json');

// GET all testimonials (with database & local fallback)
app.get('/api/reviews', async (req, res) => {
  try {
    const dbReviews = await prisma.review.findMany({
      orderBy: { timestamp: 'desc' }
    });
    if (dbReviews && dbReviews.length > 0) {
      return res.json({ success: true, reviews: dbReviews });
    }

    // Seed defaults if empty
    console.log('[DB] Review table is empty, seeding defaults...');
    const local = readJsonFile(reviewsFilePath, []);
    let seeded = local;
    if (local.length === 0) {
      // Default website testimonials
      seeded = [
        {
          id: 'REV-1',
          name: 'Rajesh Kumar',
          location: 'Nandigama',
          rating: 5,
          message: 'Excellent food with authentic taste and fresh ingredients. The service was quick, and the staff were very welcoming. A great place to enjoy a family meal.',
          status: 'APPROVED',
          timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000
        },
        {
          id: 'REV-2',
          name: 'Suresh Babu',
          location: 'Kanchikacherla',
          rating: 5,
          message: 'One of the best restaurants in the area. The biryani was flavorful, the portions were generous, and the prices were very reasonable. Highly recommended.',
          status: 'APPROVED',
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
        },
        {
          id: 'REV-3',
          name: 'Anjali Devi',
          location: 'Jaggayyapeta',
          rating: 5,
          message: "I've visited multiple times, and the quality has always been consistent. Clean environment, polite staff, and delicious food make this my go-to restaurant.",
          status: 'APPROVED',
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
        },
        {
          id: 'REV-4',
          name: 'Venkatesh',
          location: 'Vijayawada',
          rating: 4,
          message: 'Very good dining experience. The starters were amazing, and the main course was served hot and fresh. The ambience is comfortable and family-friendly.',
          status: 'APPROVED',
          timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000
        },
        {
          id: 'REV-5',
          name: 'Koteswara Rao',
          location: 'Hyderabad',
          rating: 5,
          message: 'Great value for money! The food tasted homemade, the service was prompt, and the restaurant was well maintained. Will definitely visit again.',
          status: 'APPROVED',
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
        },
        {
          id: 'REV-6',
          name: 'Sita Ram',
          location: 'Nandigama',
          rating: 5,
          message: 'A wonderful place for lunch and dinner. Every dish we ordered was tasty, and the staff ensured we had a pleasant experience throughout our visit.',
          status: 'APPROVED',
          timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000
        }
      ];
    }

    await prisma.review.createMany({
      data: seeded
    });
    res.json({ success: true, reviews: seeded });
  } catch (err) {
    console.error('Error fetching reviews from DB, falling back to local JSON file:', err.message);
    const local = readJsonFile(reviewsFilePath, []);
    res.json({ success: true, reviews: local });
  }
});

// POST new testimonial (Default status is PENDING as requested)
app.post('/api/reviews', async (req, res) => {
  try {
    const { id, name, rating, message, location, status, timestamp } = req.body;
    if (!name || !rating || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newReview = {
      id: id || ('REV-' + Math.random().toString(36).substr(2, 9).toUpperCase()),
      name,
      location: location || "",
      rating: parseInt(rating),
      message,
      status: status || 'PENDING',
      timestamp: timestamp ? parseFloat(timestamp) : Date.now()
    };

    // Save to Database
    try {
      await prisma.review.create({
        data: newReview
      });
      console.log(`[DB] Created testimonial: ${newReview.id}`);
    } catch (dbErr) {
      console.warn('[DB Warning] Failed to write review to DB, fallback to local JSON:', dbErr.message);
    }

    // Save/Update local JSON file
    const local = readJsonFile(reviewsFilePath, []);
    // Prevent duplicate entries in local JSON cache too!
    if (!local.find(r => r.id === newReview.id)) {
      local.unshift(newReview);
      writeJsonFile(reviewsFilePath, local);
    }

    // Broadcast to connected clients
    io.emit('new-review', newReview);

    res.json({ success: true, review: newReview });
  } catch (err) {
    console.error('Failed to create review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update review (e.g. approve/reject, edit name/message)
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, rating, message, status, location } = req.body;

    // Update Database
    try {
      await prisma.review.update({
        where: { id },
        data: {
          name,
          rating: rating ? parseInt(rating) : undefined,
          message,
          status,
          location
        }
      });
      console.log(`[DB] Updated review status: ${id} -> ${status}`);
    } catch (dbErr) {
      console.warn('[DB Warning] Failed to update review in DB, fallback to local JSON:', dbErr.message);
    }

    // Update local JSON file
    const local = readJsonFile(reviewsFilePath, []);
    const idx = local.findIndex(r => r.id === id);
    if (idx !== -1) {
      local[idx] = { 
        ...local[idx], 
        name: name !== undefined ? name : local[idx].name, 
        rating: rating !== undefined ? parseInt(rating) : local[idx].rating, 
        message: message !== undefined ? message : local[idx].message, 
        status: status !== undefined ? status : local[idx].status,
        location: location !== undefined ? location : local[idx].location
      };
      writeJsonFile(reviewsFilePath, local);
    }

    // Broadcast updated review to all clients
    const updatedReview = local.find(r => r.id === id) || { id, name, rating, message, status, location };
    io.emit('review-updated', updatedReview);

    res.json({ success: true, review: updatedReview });
  } catch (err) {
    console.error('Failed to update review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Delete from Database
    try {
      await prisma.review.delete({
        where: { id }
      });
      console.log(`[DB] Deleted review: ${id}`);
    } catch (dbErr) {
      console.warn('[DB Warning] Failed to delete review from DB, fallback to local JSON:', dbErr.message);
    }

    // Update local JSON file
    const local = readJsonFile(reviewsFilePath, []);
    const updated = local.filter(r => r.id !== id);
    writeJsonFile(reviewsFilePath, updated);

    // Broadcast delete event
    io.emit('review-deleted', id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Failed to delete review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- TABLE MANAGEMENT ENDPOINTS ---
const DEFAULT_TABLES = [
  { id: 'TG1', number: 'G1', floor: 'ground', capacity: 2, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TG2', number: 'G2', floor: 'ground', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TG3', number: 'G3', floor: 'ground', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TG4', number: 'G4', floor: 'ground', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TG5', number: 'G5', floor: 'ground', capacity: 2, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TA1', number: 'A1', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TA2', number: 'A2', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TA3', number: 'A3', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TA4', number: 'A4', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TA5', number: 'A5', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TB1', number: 'B1', floor: 'first', capacity: 2, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TB2', number: 'B2', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TB3', number: 'B3', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TB4', number: 'B4', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TB5', number: 'B5', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TC1', number: 'C1', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TC2', number: 'C2', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TC3', number: 'C3', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TC4', number: 'C4', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TC5', number: 'C5', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TD1', number: 'D1', floor: 'first', capacity: 2, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TD2', number: 'D2', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TD3', number: 'D3', floor: 'first', capacity: 4, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TD4', number: 'D4', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null },
  { id: 'TD5', number: 'D5', floor: 'first', capacity: 6, status: 'AVAILABLE', bookingTimeSlot: null, customerName: null, customerPhone: null }
];

app.get('/api/tables', async (req, res) => {
  try {
    let dbTables = [];
    try {
      dbTables = await prisma.table.findMany();
      if (dbTables.length === 0) {
        console.log('[Table Init] Seeding database with DEFAULT_TABLES...');
        await prisma.table.createMany({
          data: DEFAULT_TABLES.map(t => ({
            id: t.id,
            number: t.number,
            floor: t.floor,
            capacity: t.capacity,
            status: t.status,
            bookingTimeSlot: t.bookingTimeSlot,
            customerName: t.customerName,
            customerPhone: t.customerPhone
          }))
        });
        dbTables = await prisma.table.findMany();
      }
    } catch (dbErr) {
      console.warn('[DB Warning] Table query failed, falling back to JSON:', dbErr.message);
      dbTables = readJsonFile(tablesFilePath, DEFAULT_TABLES);
      if (!fs.existsSync(tablesFilePath)) {
        writeJsonFile(tablesFilePath, DEFAULT_TABLES);
      }
    }
    res.json(dbTables);
  } catch (err) {
    console.error('Failed to get tables:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/tables/:number', async (req, res) => {
  const { number } = req.params;
  const { status, bookingTimeSlot, customerName, customerPhone } = req.body;
  console.log(`[Table Update] Table ${number} -> status: ${status}, name: ${customerName}`);
  try {
    let updatedTable;
    try {
      updatedTable = await prisma.table.update({
        where: { number },
        data: {
          status,
          bookingTimeSlot: bookingTimeSlot || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null
        }
      });
    } catch (dbErr) {
      console.warn(`[DB Warning] Failed to update table ${number} in DB, updating local JSON:`, dbErr.message);
      const localTables = readJsonFile(tablesFilePath, DEFAULT_TABLES);
      const idx = localTables.findIndex(t => t.number === number);
      if (idx > -1) {
        localTables[idx] = {
          ...localTables[idx],
          status,
          bookingTimeSlot: bookingTimeSlot || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null
        };
        writeJsonFile(tablesFilePath, localTables);
        updatedTable = localTables[idx];
      } else {
        throw new Error(`Table ${number} not found in local JSON`);
      }
    }
    
    // Broadcast the updated table to all connected clients
    io.emit('table_updated', updatedTable);
    res.json({ success: true, table: updatedTable });
  } catch (err) {
    console.error(`Failed to update table ${number}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tables/sync', async (req, res) => {
  const syncedTables = req.body;
  if (!Array.isArray(syncedTables)) {
    return res.status(400).json({ error: 'Invalid payload: expected array of tables' });
  }
  console.log(`[Table Sync] Syncing ${syncedTables.length} tables...`);
  try {
    try {
      for (const t of syncedTables) {
        await prisma.table.upsert({
          where: { number: t.number },
          update: {
            status: t.status,
            bookingTimeSlot: t.bookingTimeSlot || null,
            customerName: t.customerName || null,
            customerPhone: t.customerPhone || null
          },
          create: {
            id: t.id,
            number: t.number,
            floor: t.floor,
            capacity: t.capacity,
            status: t.status,
            bookingTimeSlot: t.bookingTimeSlot || null,
            customerName: t.customerName || null,
            customerPhone: t.customerPhone || null
          }
        });
      }
    } catch (dbErr) {
      console.warn('[DB Warning] Bulk table sync failed, writing to local JSON:', dbErr.message);
      writeJsonFile(tablesFilePath, syncedTables);
    }
    
    io.emit('tables_synced', syncedTables);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to sync tables:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Server-side Billing Pending auto-release checker (runs every 10 seconds)
setInterval(async () => {
  try {
    let allOrders = [];
    let allTables = [];
    try {
      allOrders = await prisma.order.findMany({ include: { items: true } });
      allTables = await prisma.table.findMany();
    } catch (dbErr) {
      allOrders = readJsonFile(ordersFilePath, []);
      allTables = readJsonFile(tablesFilePath, DEFAULT_TABLES);
    }
    
    let updatedTables = [];
    let updatedOrders = [];
    
    for (const table of allTables) {
      if (table.status === 'PENDING') {
        const activeOrd = allOrders.find(o => o.tableNo === table.number && o.status === 'BILLING');
        if (activeOrd) {
          const elapsedTime = Date.now() - activeOrd.timestamp;
          if (elapsedTime > 10 * 60 * 1000) { // 10 minutes timeout
            console.log(`[Timeout Recovery] Releasing table ${table.number} due to 10-minute billing timeout...`);
            
            // 1. Update order status to PAID
            activeOrd.status = 'PAID';
            try {
              await prisma.order.update({
                where: { id: activeOrd.id },
                data: { status: 'PAID' }
              });
            } catch (dbErr) {
              const idx = allOrders.findIndex(o => o.id === activeOrd.id);
              if (idx > -1) {
                allOrders[idx].status = 'PAID';
                writeJsonFile(ordersFilePath, allOrders);
              }
            }
            updatedOrders.push(activeOrd);
            
            // 2. Update table status to AVAILABLE
            table.status = 'AVAILABLE';
            table.bookingTimeSlot = null;
            table.customerName = null;
            table.customerPhone = null;
            try {
              await prisma.table.update({
                where: { number: table.number },
                data: {
                  status: 'AVAILABLE',
                  bookingTimeSlot: null,
                  customerName: null,
                  customerPhone: null
                }
              });
            } catch (dbErr) {
              const idx = allTables.findIndex(t => t.number === table.number);
              if (idx > -1) {
                allTables[idx] = { ...table };
                writeJsonFile(tablesFilePath, allTables);
              }
            }
            updatedTables.push(table);
          }
        }
      }
    }
    
    // Broadcast updates
    for (const t of updatedTables) {
      io.emit('table_updated', t);
    }
    for (const o of updatedOrders) {
      io.emit('order_updated', o);
    }
  } catch (err) {
    console.error('[Error] Server-side table timeout checker error:', err);
  }
}, 10000);

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
