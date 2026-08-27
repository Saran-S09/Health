/* Backend server for CareLink demo accounts */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

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
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await db.getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Clear password for security
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login successful', user: userWithoutPassword });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone, age, gender, roomNo, surgery, title, hospital, department } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const exists = await db.getUserByEmail(email);
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

  await db.addUser(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(211).json({ message: 'Registration successful', user: userWithoutPassword });
});

// Demo accounts endpoint
app.get('/api/auth/demo-users', async (req, res) => {
  const allUsers = await db.getUsers();
  // Group demo users by role for presentation quick fills
  const patients = allUsers.filter(u => u.role === 'patient');
  const doctors = allUsers.filter(u => u.role === 'doctor');
  const nurses = allUsers.filter(u => u.role === 'nurse');
  const guardians = allUsers.filter(u => u.role === 'guardian');
  
  res.json({ patients, doctors, nurses, guardians });
});


// --- CARE TEAM API ---

// Get care team members for a patient
app.get('/api/careteam/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const team = await db.getCareTeam(patientId);
  res.json(team);
});

// Link Guardian without account (Mobile SMS mode)
app.post('/api/careteam/add-sms-guardian', async (req, res) => {
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

  await db.addCareTeamMember(patientId, member);

  // Log SMS simulation
  await db.addSmsLog({
    recipient: phone,
    message: `[CareLink Connected] You have been added as Guardian for Saran Kumar (+91 98765 43210).`
  });

  res.json({ message: 'Guardian added successfully', member });
});

// --- REQUESTS API ---

// Get requests for a user
app.get('/api/requests/:userId', async (req, res) => {
  const { userId } = req.params;
  const reqs = await db.getRequests(userId);
  res.json(reqs);
});

// Send connection request
app.post('/api/requests/send', async (req, res) => {
  const { senderId, senderName, senderRole, receiverId, receiverName, receiverRole, status, type } = req.body;
  if (!senderId || !senderName || !receiverName) {
    return res.status(400).json({ error: 'Missing request sender or receiver info' });
  }

  // Determine receiver ID if missing
  let resolvedReceiverId = receiverId;
  if (!resolvedReceiverId) {
    const allUsers = await db.getUsers();
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

  await db.addRequest(newRequest);

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
    await db.addCareTeamMember(senderId, careMember);
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
    await db.addCareTeamMember(resolvedReceiverId, careMember);
  }

  res.json({ message: 'Request sent successfully', request: newRequest });
});

// Respond to request
app.put('/api/requests/respond', async (req, res) => {
  const { requestId, accept } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }

  const statusVal = accept ? "CONNECTED" : "DECLINED";
  const updatedReq = await db.updateRequestStatus(requestId, statusVal);

  if (!updatedReq) {
    return res.status(404).json({ error: 'Request not found' });
  }

  // Synchronize status in care team list
  const patientId = updatedReq.senderRole === 'patient' ? updatedReq.senderId : updatedReq.receiverId;
  const otherId = updatedReq.senderRole === 'patient' ? updatedReq.receiverId : updatedReq.senderId;
  const otherName = updatedReq.senderRole === 'patient' ? updatedReq.receiverName : updatedReq.senderName;
  const otherRole = updatedReq.senderRole === 'patient' ? updatedReq.receiverRole : updatedReq.senderRole;

  const team = await db.getCareTeam(patientId);
  const matchedMember = team.find(m => m.id === otherId || m.name === otherName);

  if (matchedMember) {
    matchedMember.status = statusVal;
    await db.addCareTeamMember(patientId, matchedMember);
  }

  // Create standard welcome notification if accepted
  if (accept) {
    await db.addNotification({
      title: "Care Team Connection Established",
      message: `${otherName} (${otherRole.toUpperCase()}) is now connected.`,
      type: "INFO"
    });
  }

  res.json({ message: 'Request updated successfully', request: updatedReq });
});

// --- TELEMETRY / VITALS API ---

// ESP32 Sensor telemetry upload endpoint
app.post('/api/sensor/upload', async (req, res) => {
  const apiKeyHeader = req.headers['x-api-key'] || req.query.apiKey || req.body.apiKey;
  const expectedApiKey = process.env.ESP32_API_KEY || 'carelink_esp32_secret';

  if (!apiKeyHeader || apiKeyHeader !== expectedApiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  const { patientId = 'CL-P10234', heartRate, spo2 } = req.body;

  if (heartRate === undefined || spo2 === undefined) {
    return res.status(400).json({ error: 'Heart rate (heartRate) and SpO2 (spo2) are required' });
  }

  try {
    const existingVitals = await db.getVitals(patientId);
    
    // Merge incoming ESP32 readings (heartRate and spo2) with existing vitals
    const mergedVitals = {
      ...existingVitals,
      heartRate: parseFloat(heartRate),
      spo2: parseFloat(spo2)
    };

    const evaluation = evaluateVitals(mergedVitals);
    const updatedVitals = {
      ...mergedVitals,
      status: evaluation.status
    };

    await db.updateVitals(patientId, updatedVitals);
    currentSensorStatus = 'CONNECTED';
    resetDisconnectTimeout();
    io.emit('sensorStatus', { status: 'CONNECTED' });
    io.emit('vitalsUpdate', { patientId, vitals: updatedVitals, evaluation });
    console.log(`Wi-Fi sensor reading received: HR=${mergedVitals.heartRate}, SpO2=${mergedVitals.spo2}`);

    // Dispatch alert notification & SMS logs if alert triggered
    if (evaluation.hasAlert) {
      const isCritical = evaluation.status === "CRITICAL";
      // Find patient details
      const allUsers = await db.getUsers();
      const patient = allUsers.find(u => u.id === patientId) || { name: 'Saran Kumar' };

      await db.addNotification({
        title: isCritical ? "🚨 CRITICAL OUT-OF-RANGE ALERT" : "⚠️ ATTENTION: Target Limit Warning",
        message: `${patient.name}: ${evaluation.issues.map(i => i.msg).join('; ')}`,
        type: evaluation.status
      });

      // Check if there is a guardian phone to send simulated SMS
      const team = await db.getCareTeam(patientId);
      const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
      const recipientPhone = guardian ? guardian.phone : "+91 90955 21570";

      await db.addSmsLog({
        fromPhone: "7598974652",
        toPhone: recipientPhone,
        message: `[CareLink ${evaluation.status}] ${patient.name} vitals out of range! ${evaluation.issues.map(i => `${i.vital}: ${i.val}`).join(', ')}.`,
        type: evaluation.status
      });
    }

    res.json({
      success: true,
      message: 'Vitals updated from ESP32 successfully',
      vitals: updatedVitals,
      evaluation
    });
  } catch (error) {
    console.error('Error handling ESP32 sensor upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current vitals
app.get('/api/vitals/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const v = await db.getVitals(patientId);
  res.json(v);
});

// Update vitals
app.post('/api/vitals/update', async (req, res) => {
  const { patientId, vitals } = req.body;
  if (!patientId || !vitals) {
    return res.status(400).json({ error: 'Patient ID and vitals payload are required' });
  }

  const evaluation = evaluateVitals(vitals);
  const updatedVitals = {
    ...vitals,
    status: evaluation.status
  };

  await db.updateVitals(patientId, updatedVitals);

  // Dispatch alert notification & SMS logs if alert triggered
  if (evaluation.hasAlert) {
    const isCritical = evaluation.status === "CRITICAL";
    await db.addNotification({
      title: isCritical ? "🚨 CRITICAL OUT-OF-RANGE ALERT" : "⚠️ ATTENTION: Target Limit Warning",
      message: `Saran Kumar: ${evaluation.issues.map(i => i.msg).join('; ')}`,
      type: evaluation.status
    });

    // Check if there is a guardian phone to send simulated SMS
    const team = await db.getCareTeam(patientId);
    const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
    const recipientPhone = guardian ? guardian.phone : "+91 90955 21570";

    await db.addSmsLog({
      fromPhone: "7598974652",
      toPhone: recipientPhone,
      message: `[CareLink ${evaluation.status}] Saran Kumar vitals out of range! ${evaluation.issues.map(i => `${i.vital}: ${i.val}`).join(', ')}.`,
      type: evaluation.status
    });
  }

  res.json({ message: 'Vitals updated successfully', vitals: updatedVitals, evaluation });
});

// Get vitals history
app.get('/api/vitals/history/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const history = await db.getVitalsHistory(patientId);
  res.json(history);
});

// --- NOTIFICATIONS API ---

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  const list = await db.getNotifications();
  res.json(list);
});

// Mark all notifications read
app.put('/api/notifications/mark-read', async (req, res) => {
  await db.markNotificationsRead();
  res.json({ message: 'All notifications marked read' });
});

// Get SMS logs
app.get('/api/notifications/sms-logs', async (req, res) => {
  const list = await db.getSmsLogs();
  res.json(list);
});

// Log emergency call
app.post('/api/notifications/emergency-call', async (req, res) => {
  const { patientName, patientId, callerName, callerPhone, callerRole } = req.body;
  if (!patientId || !patientName) {
    return res.status(400).json({ error: 'Patient ID and name are required' });
  }

  const callerInfo = callerPhone ? `${callerName || 'Guardian'} (${callerPhone})` : 'Guardian (+91 90955 21570)';

  await db.addNotification({
    title: "🚑 AMBULANCE CALL DISPATCHED",
    message: `Emergency connection: ${callerInfo} → Ambulance Hotline (108) for ${patientName} (${patientId}).`,
    type: "CRITICAL"
  });

  const team = await db.getCareTeam(patientId);
  const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
  const recipientPhone = callerPhone || (guardian ? guardian.phone : "+91 90955 21570");

  await db.addSmsLog({
    fromPhone: "7598974652",
    toPhone: recipientPhone,
    message: `[CareLink EMERGENCY] Ambulance (108) requested by ${callerInfo} for ${patientName}. Dispatch active.`,
    type: "CRITICAL"
  });

  res.json({ message: 'Emergency call logged' });
});

// Global state for sensor status
let currentSensorStatus = 'DISCONNECTED';
let disconnectTimeout = null;

const resetDisconnectTimeout = () => {
  if (disconnectTimeout) clearTimeout(disconnectTimeout);
  disconnectTimeout = setTimeout(() => {
    if (currentSensorStatus !== 'DISCONNECTED') {
      currentSensorStatus = 'DISCONNECTED';
      console.log('ESP32 disconnected (timeout - no readings received)');
      io.emit('sensorStatus', { status: 'DISCONNECTED' });
    }
  }, 10000); // 10 seconds stale timeout
};

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// GET ESP32 sensor connection status
app.get('/api/sensor/status', (req, res) => {
  res.json({ status: currentSensorStatus });
});


// Handle socket connections
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.emit('sensorStatus', { status: currentSensorStatus });
  
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Initialize ESP32 SerialPort if SENSOR_MODE is real
const sensorMode = (process.env.SENSOR_MODE || 'simulated').toLowerCase();
const serialPortName = process.env.ESP32_SERIAL_PORT;
const serialBaudRate = parseInt(process.env.ESP32_BAUD_RATE) || 115200;

if (sensorMode === 'real') {
  if (!serialPortName) {
    console.warn('[CareLink ESP32] SENSOR_MODE=real but ESP32_SERIAL_PORT is not defined in .env');
  } else {
    try {
      const port = new SerialPort({
        path: serialPortName,
        baudRate: serialBaudRate,
        autoOpen: false
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      let reconnectTimer;

      const scheduleReconnect = () => {
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
          reconnectTimer = undefined;
          if (!port.isOpen) openSerialPort();
        }, 5000);
      };

      const openSerialPort = () => {
        if (port.isOpen) return;
        port.open((err) => {
          if (err) {
            console.error(`ESP32 serial connection error: ${err.message}`);
            currentSensorStatus = 'DISCONNECTED';
            io.emit('sensorStatus', { status: 'DISCONNECTED' });
            scheduleReconnect();
            return;
          }
          console.log(`ESP32 serial connection opened: ${serialPortName}`);
          currentSensorStatus = 'CONNECTED';
          io.emit('sensorStatus', { status: 'CONNECTED' });
          resetDisconnectTimeout();
        });
      };

      // Register error handler BEFORE opening port to prevent unhandled error crashes
      port.on('error', (err) => {
        console.error(`ESP32 serial port error: ${err.message}`);
        currentSensorStatus = 'DISCONNECTED';
        io.emit('sensorStatus', { status: 'DISCONNECTED' });
      });

      port.on('close', () => {
        console.log('ESP32 disconnected');
        currentSensorStatus = 'DISCONNECTED';
        io.emit('sensorStatus', { status: 'DISCONNECTED' });
        if (disconnectTimeout) clearTimeout(disconnectTimeout);
        scheduleReconnect();
      });

      openSerialPort();

      let pendingSensorReading = {};
      parser.on('data', async (data) => {
        const line = data.trim();
        if (!line) return;
        console.log(`[ESP32 RAW] ${line}`);

        try {
          // Accept JSON telemetry and the text format printed by the ESP32 sketch.
          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (jsonError) {
            const heartRateMatch = line.match(/Heart\s*Rate\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
            const spo2Match = line.match(/SpO\s*2\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
            if (!heartRateMatch && !spo2Match) return;
            pendingSensorReading = {
              ...pendingSensorReading,
              ...(heartRateMatch && { heartRate: heartRateMatch[1] }),
              ...(spo2Match && { spo2: spo2Match[1] })
            };
            if (pendingSensorReading.heartRate === undefined || pendingSensorReading.spo2 === undefined) {
              console.log(`[ESP32 PARSER] Waiting for the other vital: ${JSON.stringify(pendingSensorReading)}`);
              return;
            }
            parsed = pendingSensorReading;
            pendingSensorReading = {};
          }

          const { heartRate, spo2 } = parsed;

          // Reject zero/NaN/invalid values
          if (heartRate === undefined || spo2 === undefined || isNaN(heartRate) || isNaN(spo2)) {
            return;
          }

          const hrVal = parseFloat(heartRate);
          const spo2Val = parseFloat(spo2);

          // Validation range check (HR: 30-220, SpO2: 50-100)
          if (hrVal < 30 || hrVal > 220 || spo2Val < 50 || spo2Val > 100) {
            return; // Reject invalid/noisy readings
          }

          // Valid sensor reading received - maintain connection status
          if (currentSensorStatus !== 'CONNECTED') {
            currentSensorStatus = 'CONNECTED';
            io.emit('sensorStatus', { status: 'CONNECTED' });
          }
          resetDisconnectTimeout();

          console.log(`MAX30102 reading received: HR=${hrVal}, SpO2=${spo2Val}`);

          // Update active patient vitals (default CL-P10234)
          const patientId = 'CL-P10234';
          const existingVitals = await db.getVitals(patientId);

          // Merge: update only heartRate and spo2, preserve others (temperature, systolic, diastolic)
          const mergedVitals = {
            ...existingVitals,
            heartRate: hrVal,
            spo2: spo2Val
          };

          const evaluation = evaluateVitals(mergedVitals);
          const updatedVitals = {
            ...mergedVitals,
            status: evaluation.status
          };

          // Save to database
          await db.updateVitals(patientId, updatedVitals);
          console.log(`Vitals updated for patient ${patientId}`);
          console.log('MongoDB vitals saved');

          // Emit to React frontend using Socket.IO
          io.emit('vitalsUpdate', { patientId, vitals: updatedVitals, evaluation });
          console.log('Frontend vitals event emitted');

          // Dispatch alert notification & SMS logs if alert triggered
          if (evaluation.hasAlert) {
            const isCritical = evaluation.status === "CRITICAL";
            const allUsers = await db.getUsers();
            const patient = allUsers.find(u => u.id === patientId) || { name: 'Saran Kumar' };

            await db.addNotification({
              title: isCritical ? "🚨 CRITICAL OUT-OF-RANGE ALERT" : "⚠️ ATTENTION: Target Limit Warning",
              message: `${patient.name}: ${evaluation.issues.map(i => i.msg).join('; ')}`,
              type: evaluation.status
            });

            // Find guardian phone
            const team = await db.getCareTeam(patientId);
            const guardian = team.find(m => m.role.toLowerCase() === 'guardian');
            const recipientPhone = guardian ? guardian.phone : "+91 90955 21570";

            await db.addSmsLog({
              fromPhone: "7598974652",
              toPhone: recipientPhone,
              message: `[CareLink ${evaluation.status}] ${patient.name} vitals out of range! ${evaluation.issues.map(i => `${i.vital}: ${i.val}`).join(', ')}.`,
              type: evaluation.status
            });
          }
        } catch (parseError) {
          console.warn(`Malformed JSON from ESP32: ${line}`);
        }
      });
    } catch (err) {
      console.error(`Failed to initialize SerialPort: ${err.message}`);
    }
  }
}

const PORT = process.env.PORT || 5000;
db.connect()
  .then(() => server.listen(PORT, () => console.log(`CareLink backend running on port ${PORT}`)))
  .catch(error => {
    console.error('Unable to start CareLink backend:', error.message);
    process.exit(1);
  });
