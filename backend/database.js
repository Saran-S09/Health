const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Generate realistic vitals history
const generateHistoricalData = () => {
  const points = [];
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hours = time.getHours().toString().padStart(2, '0') + ':00';
    const hr = Math.floor(74 + Math.sin(i * 0.5) * 6 + (Math.random() * 4 - 2));
    const spo2 = Math.min(100, Math.floor(98 + (Math.random() * 2 - 1)));
    const temp = parseFloat((36.6 + (Math.sin(i * 0.3) * 0.3) + (Math.random() * 0.2 - 0.1)).toFixed(1));
    const sys = Math.floor(118 + Math.cos(i * 0.4) * 8 + (Math.random() * 4 - 2));
    const dia = Math.floor(78 + Math.cos(i * 0.4) * 4 + (Math.random() * 2 - 1));

    points.push({
      timestamp: hours,
      fullTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: hr,
      spo2: spo2,
      temperature: temp,
      systolic: sys,
      diastolic: dia
    });
  }
  return points;
};

// Initial Seed Data
const defaultData = {
  users: [
    {
      id: "CL-P10234",
      name: "Saran Kumar",
      role: "patient",
      email: "saran@example.com",
      password: "password123",
      phone: "+91 98765 43210",
      age: 42,
      gender: "Male",
      roomNo: "Bed 4B, Ward 3",
      surgery: "Post-Operative Cardiac Bypass (Day 3)",
      admissionDate: "2026-08-10",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    },
    {
      id: "CL-D1021",
      name: "Dr. Kumar Rajan",
      role: "doctor",
      title: "Chief Cardiac Surgeon, MD",
      email: "dr.kumar@carelink.org",
      password: "password123",
      phone: "+91 94433 22110",
      hospital: "Metropolitan General Hospital",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250"
    },
    {
      id: "CL-N2042",
      name: "Nurse Priya Sharma",
      role: "nurse",
      title: "Senior ICU/Post-Op Specialist",
      email: "priya.n@carelink.org",
      password: "password123",
      phone: "+91 91234 56789",
      department: "Post-Operative Recovery Ward B",
      avatar: "https://images.unsplash.com/photo-1594824813571-215f396469a0?auto=format&fit=crop&q=80&w=250"
    },
    {
      id: "CL-G3045",
      name: "Ramesh Kumar (Brother)",
      role: "guardian",
      hasAccount: true,
      email: "ramesh.k@example.com",
      password: "password123",
      phone: "+91 90955 21570",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    },
    // More demo users
    {
      id: "CL-G3001",
      name: "Anita Sharma",
      role: "guardian",
      hasAccount: true,
      email: "anita@example.com",
      password: "password123",
      phone: "+91 98765 43211",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250"
    },
    {
      id: "CL-D3001",
      name: "Dr. Neha Verma",
      role: "doctor",
      title: "Cardiologist, MD",
      email: "neha.verma@example.com",
      password: "password123",
      phone: "+91 98765 43212",
      hospital: "Metropolitan General Hospital",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250"
    },
    {
      id: "CL-N3001",
      name: "Nurse Maya",
      role: "nurse",
      title: "ICU Charge Nurse",
      email: "maya.nurse@example.com",
      password: "password123",
      phone: "+91 98765 43213",
      department: "Ward 3",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250"
    }
  ],
  careTeams: {
    "CL-P10234": [
      {
        id: "CL-G3045",
        name: "Ramesh Kumar (Brother)",
        role: "Guardian",
        phone: "+91 98765 11223",
        status: "CONNECTED",
        hasAccount: true
      },
      {
        id: "CL-D1021",
        name: "Dr. Kumar Rajan",
        role: "Doctor",
        phone: "+91 94433 22110",
        status: "CONNECTED",
        hasAccount: true
      },
      {
        id: "CL-N2042",
        name: "Nurse Priya Sharma",
        role: "Nurse",
        phone: "+91 91234 56789",
        status: "CONNECTED",
        hasAccount: true
      }
    ]
  },
  requests: [
    {
      id: "REQ-101",
      senderId: "CL-D1021",
      senderName: "Dr. Kumar Rajan",
      senderRole: "doctor",
      receiverId: "CL-P10234",
      receiverName: "Saran Kumar",
      receiverRole: "patient",
      status: "CONNECTED",
      type: "DOCTOR_PATIENT",
      timestamp: "2026-08-11 09:30 AM"
    },
    {
      id: "REQ-102",
      senderId: "CL-N2042",
      senderName: "Nurse Priya Sharma",
      senderRole: "nurse",
      receiverId: "CL-P10234",
      receiverName: "Saran Kumar",
      receiverRole: "patient",
      status: "CONNECTED",
      type: "NURSE_PATIENT",
      timestamp: "2026-08-11 10:15 AM"
    },
    {
      id: "REQ-103",
      senderId: "CL-P10234",
      senderName: "Saran Kumar",
      senderRole: "patient",
      receiverId: "CL-G3045",
      receiverName: "Ramesh Kumar",
      receiverRole: "guardian",
      status: "CONNECTED",
      type: "PATIENT_GUARDIAN",
      timestamp: "2026-08-10 04:00 PM"
    }
  ],
  vitals: {
    "CL-P10234": {
      heartRate: 78,
      spo2: 98,
      temperature: 36.7,
      systolic: 120,
      diastolic: 80,
      status: "NORMAL",
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  },
  vitalsHistory: {
    "CL-P10234": generateHistoricalData()
  },
  notifications: [
    {
      id: "NOT-001",
      title: "Care Team Connected",
      message: "Dr. Kumar Rajan has successfully linked to your patient profile.",
      type: "INFO",
      timestamp: new Date().toLocaleString(),
      isRead: false
    }
  ],
  smsLogs: [
    {
      id: "SMS-001",
      fromPhone: "7598974652",
      toPhone: "+91 90955 21570",
      message: "[CareLink Critical Alert] Saran Kumar's SpO2 fell to 92%. Immediate attention required.",
      timestamp: new Date().toLocaleTimeString(),
      status: "DELIVERED"
    }
  ]
};

// Database utility class
class Database {
  constructor() {
    this.data = { ...defaultData };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Failed to load db.json, using defaults:", e);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to save db.json:", e);
    }
  }

  getUsers() {
    return this.data.users;
  }

  addUser(user) {
    this.data.users.push(user);
    this.save();
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getCareTeam(patientId) {
    return this.data.careTeams[patientId] || [];
  }

  addCareTeamMember(patientId, member) {
    if (!this.data.careTeams[patientId]) {
      this.data.careTeams[patientId] = [];
    }
    // Remove if already exists
    this.data.careTeams[patientId] = this.data.careTeams[patientId].filter(m => m.id !== member.id);
    this.data.careTeams[patientId].push(member);
    this.save();
  }

  removeCareTeamMember(patientId, memberId) {
    if (this.data.careTeams[patientId]) {
      this.data.careTeams[patientId] = this.data.careTeams[patientId].filter(m => m.id !== memberId);
      this.save();
    }
  }

  getRequests(userId) {
    // Return requests where this user is sender or receiver
    return this.data.requests.filter(r => r.senderId === userId || r.receiverId === userId);
  }

  addRequest(request) {
    this.data.requests.push(request);
    this.save();
  }

  updateRequestStatus(requestId, status) {
    const req = this.data.requests.find(r => r.id === requestId);
    if (req) {
      req.status = status;
      this.save();
    }
    return req;
  }

  getVitals(patientId) {
    return this.data.vitals[patientId] || {
      heartRate: 75,
      spo2: 98,
      temperature: 36.6,
      systolic: 120,
      diastolic: 80,
      status: "NORMAL",
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }

  updateVitals(patientId, vitals) {
    this.data.vitals[patientId] = {
      ...vitals,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    // Push to history
    if (!this.data.vitalsHistory[patientId]) {
      this.data.vitalsHistory[patientId] = [];
    }
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.data.vitalsHistory[patientId].push({
      timestamp: timeLabel,
      fullTime: timeLabel,
      heartRate: vitals.heartRate,
      spo2: vitals.spo2,
      temperature: vitals.temperature,
      systolic: vitals.systolic,
      diastolic: vitals.diastolic
    });

    // Keep history bounded to 30 elements
    if (this.data.vitalsHistory[patientId].length > 30) {
      this.data.vitalsHistory[patientId].shift();
    }

    this.save();
  }

  getVitalsHistory(patientId) {
    return this.data.vitalsHistory[patientId] || [];
  }

  getNotifications() {
    return this.data.notifications;
  }

  addNotification(notification) {
    const newNot = {
      id: `NOT-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      isRead: false,
      ...notification
    };
    this.data.notifications.push(newNot);
    this.save();
    return newNot;
  }

  markNotificationsRead() {
    this.data.notifications.forEach(n => n.isRead = true);
    this.save();
  }

  getSmsLogs() {
    return this.data.smsLogs;
  }

  addSmsLog(sms) {
    const newSms = {
      id: `SMS-${Date.now()}`,
      fromPhone: sms.fromPhone || "7598974652",
      toPhone: sms.toPhone || sms.recipient || "+91 90955 21570",
      message: sms.message,
      timestamp: new Date().toLocaleTimeString(),
      status: sms.status || "DELIVERED",
      type: sms.type || "ALERT"
    };
    this.data.smsLogs.push(newSms);
    this.save();
    return newSms;
  }
}

module.exports = new Database();
