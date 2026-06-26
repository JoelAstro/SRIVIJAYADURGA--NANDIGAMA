import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  tableNo: { type: String, required: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, required: true },
});

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  details: { type: Object },
  adminId: { type: String },
  timestamp: { type: Number, default: () => Date.now() },
});

const KitchenHistorySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Number, default: () => Date.now() },
});

export const Notification = mongoose.model('Notification', NotificationSchema);
export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export const KitchenHistory = mongoose.model('KitchenHistory', KitchenHistorySchema);
