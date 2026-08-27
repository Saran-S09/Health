require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn("Failed to set DNS servers", e);
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const DB_PATH = path.join(__dirname, 'db.json');

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { versionKey: false });

const keyedDataSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { versionKey: false });

const requestSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { versionKey: false });

const eventSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { versionKey: false });

const User = mongoose.model('User', userSchema);
const CareTeam = mongoose.model('CareTeam', keyedDataSchema);
const Vital = mongoose.model('Vital', keyedDataSchema);
const VitalsHistory = mongoose.model('VitalsHistory', keyedDataSchema);
const Request = mongoose.model('Request', requestSchema);
const Notification = mongoose.model('Notification', eventSchema);
const SmsLog = mongoose.model('SmsLog', eventSchema);

class Database {
  async connect() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<db_password>')) {
      throw new Error('MONGODB_URI is missing or still contains <db_password> in backend/.env');
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    await this.seedIfEmpty();
  }

  async seedIfEmpty() {
    if (await User.exists({})) return;
    if (!fs.existsSync(DB_PATH)) throw new Error('No db.json found for the initial MongoDB seed');

    const source = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    await User.insertMany((source.users || []).map(user => ({
      id: user.id, email: user.email.toLowerCase(), data: user
    })));
    await CareTeam.insertMany(Object.entries(source.careTeams || {}).map(([key, data]) => ({ key, data })));
    await Vital.insertMany(Object.entries(source.vitals || {}).map(([key, data]) => ({ key, data })));
    await VitalsHistory.insertMany(Object.entries(source.vitalsHistory || {}).map(([key, data]) => ({ key, data })));
    await Request.insertMany((source.requests || []).map(data => ({ id: data.id, data })));
    await Notification.insertMany((source.notifications || []).map(data => ({ id: data.id, data })));
    await SmsLog.insertMany((source.smsLogs || []).map(data => ({ id: data.id, data })));
    console.log('MongoDB collections seeded from db.json');
  }

  async getUsers() {
    const users = await User.find().lean();
    return users.map(user => user.data);
  }

  async addUser(user) {
    await User.create({ id: user.id, email: user.email.toLowerCase(), data: user });
  }

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    return user ? user.data : null;
  }

  async getCareTeam(patientId) {
    const team = await CareTeam.findOne({ key: patientId }).lean();
    return team ? team.data : [];
  }

  async addCareTeamMember(patientId, member) {
    const current = await this.getCareTeam(patientId);
    const updated = [...current.filter(existing => existing.id !== member.id), member];
    await CareTeam.findOneAndUpdate({ key: patientId }, { key: patientId, data: updated }, { upsert: true });
  }

  async getRequests(userId) {
    const requests = await Request.find().lean();
    return requests.map(request => request.data)
      .filter(request => request.senderId === userId || request.receiverId === userId);
  }

  async addRequest(request) {
    await Request.create({ id: request.id, data: request });
  }

  async updateRequestStatus(requestId, status) {
    const request = await Request.findOne({ id: requestId }).lean();
    if (!request) return null;
    const updated = { ...request.data, status };
    await Request.updateOne({ id: requestId }, { data: updated });
    return updated;
  }

  async getVitals(patientId) {
    const vital = await Vital.findOne({ key: patientId }).lean();
    return vital ? vital.data : {
      heartRate: 75, spo2: 98, temperature: 36.6, systolic: 120, diastolic: 80,
      status: 'NORMAL', lastUpdated: new Date().toLocaleTimeString()
    };
  }

  async updateVitals(patientId, vitals) {
    const updated = { ...vitals, lastUpdated: new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) };
    await Vital.findOneAndUpdate({ key: patientId }, { key: patientId, data: updated }, { upsert: true });
    const existing = await this.getVitalsHistory(patientId);
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const history = [...existing, { timestamp: timeLabel, fullTime: timeLabel, ...vitals }].slice(-30);
    await VitalsHistory.findOneAndUpdate({ key: patientId }, { key: patientId, data: history }, { upsert: true });
  }

  async getVitalsHistory(patientId) {
    const history = await VitalsHistory.findOne({ key: patientId }).lean();
    return history ? history.data : [];
  }

  async getNotifications() {
    const notifications = await Notification.find().sort({ _id: 1 }).lean();
    return notifications.map(notification => notification.data);
  }

  async addNotification(notification) {
    const newNotification = {
      id: `NOT-${Date.now()}`, timestamp: new Date().toLocaleString(), isRead: false, ...notification
    };
    await Notification.create({ id: newNotification.id, data: newNotification });
    return newNotification;
  }

  async markNotificationsRead() {
    const notifications = await Notification.find().lean();
    await Promise.all(notifications.map(notification => Notification.updateOne(
      { id: notification.id }, { data: { ...notification.data, isRead: true } }
    )));
  }

  async getSmsLogs() {
    const logs = await SmsLog.find().sort({ _id: 1 }).lean();
    return logs.map(log => log.data);
  }

  async addSmsLog(sms) {
    const newSms = {
      id: `SMS-${Date.now()}`, fromPhone: sms.fromPhone || '7598974652',
      toPhone: sms.toPhone || sms.recipient || '+91 90955 21570', message: sms.message,
      timestamp: new Date().toLocaleTimeString(), status: sms.status || 'DELIVERED',
      type: sms.type || 'ALERT'
    };
    await SmsLog.create({ id: newSms.id, data: newSms });
    return newSms;
  }
}

module.exports = new Database();
