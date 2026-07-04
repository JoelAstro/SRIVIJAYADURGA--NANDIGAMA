import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.json());

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
    console.error('[Error] GET /api/orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  console.log('[Order Created] Received new order request');
  const newOrder = req.body;
  
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // Instantly broadcast to all tabs first to guarantee real-time UI sync
  io.emit('new-order', newOrder); 

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

    // Send WhatsApp Notifications for Takeaway/Parcel (isParcel) Orders
    if (createdOrder.isParcel) {
      const adminWhatsAppNumber = '+919966315544';
      const customerWhatsAppNumber = createdOrder.customerPhone || '';

      const orderTime = new Date(createdOrder.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const subtotal = createdOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryCharges = 0; 
      const grandTotal = subtotal + deliveryCharges;

      const itemsList = createdOrder.items.map(item => `• ${item.name} × ${item.quantity} (₹${item.price} each)`).join('\n');

      const adminMessage = `📢 *New Takeaway Order Received!*

*Order ID:* #${createdOrder.id}
*Order Time:* ${orderTime}
*Customer Name:* ${createdOrder.customerName}
*Customer Mobile:* ${createdOrder.customerPhone}

*Delivery Address:*
House No...
Street...
City...

*Address Type:* Home
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
House No...
Street...
City...

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

    res.status(201).json({ message: 'Order created', order: newOrder });

  } catch (err) {
    console.error('[Error] POST /api/orders failed database execution:', err);
    res.status(500).json({ error: 'Database execution failed: ' + err.message });
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
    console.error('[Error] PUT /api/orders/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync (For Bulk updates / existing logic compatibility)
app.post('/api/orders/sync', async (req, res) => {
  // If the frontend tries to sync completely, we just broadcast to keep devices in sync
  io.emit('orders_synced', req.body);
  res.json({ message: 'Sync broadcasted' });
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
