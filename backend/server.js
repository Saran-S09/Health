/* Backend server for CareLink demo accounts */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Threshold Evaluator for backend vitals analysis
const evaluateVitals = (vitals) => {
  const issues = [];
  let highestSeverity = "NORMAL";

  const { heartRate, spo2, temperature, systolic, diastolic } = vitals;

  if (spo2 < 90) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "SpO₂", val: `${spo2}%`, severity: "CRITICAL", msg: "SpO₂ critically low (< 90%). High risk of hypoxia." });
  } else if (spo2 >= 90 && spo2 <= 94) {
    highestSeverity = "ATTENTION";
    issues.push({ vital: "SpO₂", val: `${spo2}%`, severity: "ATTENTION", msg: "SpO₂ reading outside optimal target range (90-94%)." });
  }

  if (heartRate < 50 || heartRate > 120) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Heart Rate", val: `${heartRate} BPM`, severity: "CRITICAL", msg: `Heart rate critically ${heartRate < 50 ? 'bradycardic' : 'tachycardic'} (${heartRate} BPM).` });
  } else if ((heartRate >= 50 && heartRate < 60) || (heartRate > 100 && heartRate <= 120)) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Heart Rate", val: `${heartRate} BPM`, severity: "ATTENTION", msg: `Heart rate border range (${heartRate} BPM). Attention advised.` });
  }

  if (temperature > 38.5 || temperature < 35.0) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Temperature", val: `${temperature}°C`, severity: "CRITICAL", msg: `Body temperature critical (${temperature}°C). ${temperature > 38.5 ? 'High fever/hyperthermia' : 'Hypothermia risk'}.` });
  } else if ((temperature >= 37.6 && temperature <= 38.5) || (temperature >= 35.0 && temperature < 36.5)) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Temperature", val: `${temperature}°C`, severity: "ATTENTION", msg: `Low-grade fever or mild hypothermia detected (${temperature}°C).` });
  }

  if (systolic >= 140 || diastolic >= 90 || systolic < 85) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Blood Pressure", val: `${systolic}/${diastolic} mmHg`, severity: "CRITICAL", msg: `Blood Pressure in critical range (${systolic}/${diastolic} mmHg).` });
  } else if ((systolic > 120 && systolic < 140) || (diastolic > 80 && diastolic < 90)) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Blood Pressure", val: `${systolic}/${diastolic} mmHg`, severity: "ATTENTION", msg: `Elevated Blood Pressure (${systolic}/${diastolic} mmHg). Monitoring recommended.` });
  }

  return {
    status: highestSeverity,
    issues: issues,
    hasAlert: highestSeverity !== "NORMAL",
    summary: highestSeverity === "CRITICAL"
      ? "🚨 CRITICAL ALERT: Immediate medical review may be required."
      : highestSeverity === "ATTENTION"
      ? "⚠️ ATTENTION REQUIRED: Monitored vital reading outside configured target range."
      : "● All vitals within normal target monitoring range."
  };
};

// --- AUTH API ---

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Clear password for security
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login successful', user: userWithoutPassword });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone, age, gender, roomNo, surgery, title, hospital, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const exists = db.getUserByEmail(email);
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // Generate role-specific ID
  let prefix = 'CL-U';
  if (role === 'patient') prefix = 'CL-P';
  else if (role === 'doctor') prefix = 'CL-D';
  else if (role === 'nurse') prefix = 'CL-N';
  else if (role === 'guardian') prefix = 'CL-G';
  
  const id = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

  const newUser = {
    id,
    name,
    email,
    password,
    role: role.toLowerCase(),
    phone: phone || "+91 XXXXX XXXXX",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    ...(role === 'patient' && { age: parseInt(age) || 40, gender: gender || 'Male', roomNo, surgery, admissionDate: new Date().toISOString().split('T')[0] }),
    ...(role === 'doctor' && { title: title || 'Medical Practitioner', hospital: hospital || 'CareLink Health' }),
    ...(role === 'nurse' && { title: title || 'Ward Nurse', department: department || 'General Ward' })
  };

  db.addUser(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(211).json({ message: 'Registration successful', user: userWithoutPassword });
});

// Demo accounts endpoint
app.get('/api/auth/demo-users', (req, res) => {
  const allUsers = db.getUsers();
  // Group demo users by role for presentation quick fills
  const patients = allUsers.filter(u => u.role === 'patient');
  const doctors = allUsers.filter(u => u.role === 'doctor');
  const nurses = allUsers.filter(u => u.role === 'nurse');
  const guardians = allUsers.filter(u => u.role === 'guardian');
  
  res.json({ patients, doctors, nurses, guardians });
});


// --- CARE TEAM API ---

// Get care team members for a patient
app.get('/api/careteam/:patientId', (req, res) => {
  const { patientId } = req.params;
  const team = db.getCareTeam(patientId);
  res.json(team);
});

// Link Guardian without account (Mobile SMS mode)
app.post('/api/careteam/add-sms-guardian', (req, res) => {
  const { patientId, name, phone } = req.body;
  if (!patientId || !name || !phone) {
    return res.status(400).json({ error: 'Patient ID, name, and phone are required' });
  }

  const member = {
    id: `CL-G-SMS-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    role: "Guardian",
    phone,
    status: "CONNECTED",
    hasAccount: false
  };

  db.addCareTeamMember(patientId, member);

  // Log SMS simulation
  db.addSmsLog({
    recipient: phone,
    message: `[CareLink Connected] You have been added as Guardian for Saran Kumar (+91 98765 43210).`
  });

  res.json({ message: 'Guardian added successfully', member });
});

// --- REQUESTS API ---

// Get requests for a user
app.get('/api/requests/:userId', (req, res) => {
  const { userId } = req.params;
  const reqs = db.getRequests(userId);
  res.json(reqs);
});

// Send connection request
app.post('/api/requests/send', (req, res) => {
  const { senderId, senderName, senderRole, receiverId, receiverName, receiverRole, status, type } = req.body;
  if (!senderId || !senderName || !receiverName) {
    return res.status(400).json({ error: 'Missing request sender or receiver info' });
  }

  // Determine receiver ID if missing
  let resolvedReceiverId = receiverId;
  if (!resolvedReceiverId) {
    const allUsers = db.getUsers();
    // Try to find by name or role matching
    const matched = allUsers.find(u => u.name.toLowerCase() === receiverName.toLowerCase() && u.role === receiverRole.toLowerCase());
    if (matched) {
      resolvedReceiverId = matched.id;
    } else {
      resolvedReceiverId = `CL-${receiverRole.charAt(0).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const newRequest = {
    id: `REQ-${Date.now()}`,
    senderId,
    senderName,
    senderRole: senderRole.toLowerCase(),
    receiverId: resolvedReceiverId,
    receiverName,
    receiverRole: receiverRole.toLowerCase(),
    status: status || "PENDING",
    type: type || `${senderRole.toUpperCase()}_${receiverRole.toUpperCase()}`,
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
  };

  db.addRequest(newRequest);

  // Sync to Care Team pending list
  // If patient is the sender, add receiver to care team list
  if (senderRole === 'patient') {
    const careMember = {
      id: resolvedReceiverId,
      name: receiverName,
      role: receiverRole.charAt(0).toUpperCase() + receiverRole.slice(1),
      phone: "+91 XXXXX XXXXX",
      status: "PENDING",
      hasAccount: true
    };
    db.addCareTeamMember(senderId, careMember);
  } else if (receiverRole === 'patient') {
    // If patient is receiver, add sender to care team list
    const careMember = {
      id: senderId,
      name: senderName,
      role: senderRole.charAt(0).toUpperCase() + senderRole.slice(1),
      phone: "+91 XXXXX XXXXX",
      status: "PENDING",
      hasAccount: true
    };
    db.addCareTeamMember(resolvedReceiverId, careMember);
  }

  res.json({ message: 'Request sent successfully', request: newRequest });
});

// Respond to request
app.put('/api/requests/respond', (req, res) => {
  const { requestId, accept } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  const statusVal = accept ? "CONNECTED" : "DECLINED";
  const updatedReq = db.updateRequestStatus(requestId, statusVal);

  if (!updatedReq) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Synchronize status in care team list
  const patientId = updatedReq.senderRole === 'patient' ? updatedReq.senderId : updatedReq.receiverId;
  const otherId = updatedReq.senderRole === 'patient' ? updatedReq.receiverId : updatedReq.senderId;
  const otherName = updatedReq.senderRole === 'patient' ? updatedReq.receiverName : updatedReq.senderName;
  const otherRole = updatedReq.senderRole === 'patient' ? updatedReq.receiverRole : updatedReq.senderRole;

  const team = db.getCareTeam(patientId);
  const matchedMember = team.find(m => m.id === otherId || m.name === otherName);

  if (matchedMember) {
    matchedMember.status = statusVal;
    db.addCareTeamMember(patientId, matchedMember); // saves state
  }

  // Create standard welcome notification if accepted
  if (accept) {
    db.addNotification({
      title: "Care Team Connection Established",
      message: `${otherName} (${otherRole.toUpperCase()}) is now connected.`,
      type: "INFO"
    });
  }

  res.json({ message: 'Request updated successfully', request: updatedReq });
});

// --- TELEMETRY / VITALS API ---

// Get current vitals
app.get('/api/vitals/:patientId', (req, res) => {
  const { patientId } = req.params;
  const v = db.getVitals(patientId);
  res.json(v);
});

// Update vitals
app.post('/api/vitals/update', (req, res) => {
  const { patientId, vitals } = req.body;
  if (!patientId || !vitals) {
    return res.status(400).json({ error: 'Patient ID and vitals payload are required' });
  }

  const evaluation = evaluateVitals(vitals);
  const updatedVitals = {
    ...vitals,
    status: evaluation.status
  };

  db.updateVitals(patientId, updatedVitals);

  // Dispatch alert notification & SMS logs if alert triggered
  if (evaluation.hasAlert) {
    const isCritical = evaluation.status === "CRITICAL";
    db.addNotification({
      title: isCritical ? "🚨 CRITICAL OUT-OF-RANGE ALERT" : "⚠️ ATTENTION: Target Limit Warning",
      message: `Saran Kumar: ${evaluation.issues.map(i => i.msg).join('; ')}`,
      type: evaluation.status
    });

    // Check if there is a guardian phone to send simulated SMS
    const team = db.getCareTeam(patientId);
    const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
    const recipientPhone = guardian ? guardian.phone : "+91 90955 21570";

    db.addSmsLog({
      fromPhone: "7598974652",
      toPhone: recipientPhone,
      message: `[CareLink ${evaluation.status}] Saran Kumar vitals out of range! ${evaluation.issues.map(i => `${i.vital}: ${i.val}`).join(', ')}.`,
      type: evaluation.status
    });
  }

  res.json({ message: 'Vitals updated successfully', vitals: updatedVitals, evaluation });
});

// Get vitals history
app.get('/api/vitals/history/:patientId', (req, res) => {
  const { patientId } = req.params;
  const history = db.getVitalsHistory(patientId);
  res.json(history);
});

// --- NOTIFICATIONS API ---

// Get all notifications
app.get('/api/notifications', (req, res) => {
  const list = db.getNotifications();
  res.json(list);
});

// Mark all notifications read
app.put('/api/notifications/mark-read', (req, res) => {
  db.markNotificationsRead();
  res.json({ message: 'All notifications marked read' });
});

// Get SMS logs
app.get('/api/notifications/sms-logs', (req, res) => {
  const list = db.getSmsLogs();
  res.json(list);
});

// Log emergency call
app.post('/api/notifications/emergency-call', (req, res) => {
  const { patientName, patientId, callerName, callerPhone, callerRole } = req.body;
  if (!patientId || !patientName) {
    return res.status(400).json({ error: 'Patient ID and name are required' });
  }

  const callerInfo = callerPhone ? `${callerName || 'Guardian'} (${callerPhone})` : 'Guardian (+91 90955 21570)';

  db.addNotification({
    title: "🚑 AMBULANCE CALL DISPATCHED",
    message: `Emergency connection: ${callerInfo} → Ambulance Hotline (108) for ${patientName} (${patientId}).`,
    type: "CRITICAL"
  });

  const team = db.getCareTeam(patientId);
  const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
  const recipientPhone = callerPhone || (guardian ? guardian.phone : "+91 90955 21570");

  db.addSmsLog({
    fromPhone: "7598974652",
    toPhone: recipientPhone,
    message: `[CareLink EMERGENCY] Ambulance (108) requested by ${callerInfo} for ${patientName}. Dispatch active.`,
    type: "CRITICAL"
  });

  res.json({ message: 'Emergency call logged' });
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CareLink backend running on port ${PORT}`);
});
