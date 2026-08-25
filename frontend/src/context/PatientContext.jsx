import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_VITALS_STATE, generateHistoricalData } from '../data/mockVitals';
import { INITIAL_PATIENTS_LIST } from '../data/mockPatients';
import { INITIAL_REQUESTS } from '../data/mockRequests';
import { MOCK_PATIENT, MOCK_DOCTOR, MOCK_NURSE, MOCK_GUARDIAN_ACCOUNT } from '../data/mockUsers';
import { evaluateVitals } from '../services/thresholdEvaluator';
import { SENSOR_PRESETS, applyGradualDrift } from '../services/sensorSimulator';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const PatientContext = createContext();

const DEFAULT_THRESHOLDS = {
  heartRate: { normalMin: 60, normalMax: 100, criticalMin: 50, criticalMax: 120 },
  spo2: { normalMin: 95, criticalMin: 90 },
  temperature: { normalMin: 36.5, normalMax: 37.5, criticalMin: 35.0, criticalMax: 38.5 },
  systolic: { normalMin: 90, normalMax: 120, criticalMin: 85, criticalMax: 140 },
  diastolic: { normalMin: 60, normalMax: 80, criticalMin: 55, criticalMax: 90 }
};

export const PatientProvider = ({ children }) => {
  const { addAlertNotification } = useNotification();
  const { currentUser } = useAuth();

  // Vitals State
  const [vitals, setVitals] = useState(() => {
    const saved = localStorage.getItem('carelink_vitals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.vitals && parsed.vitals.heartRate !== undefined) return parsed.vitals;
        if (parsed && parsed.heartRate !== undefined) return parsed;
      } catch (e) {}
    }
    return INITIAL_VITALS_STATE;
  });

  // Customized Thresholds State
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem('carelink_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  // Current threshold status
  const [evaluation, setEvaluation] = useState(() => evaluateVitals(INITIAL_VITALS_STATE, thresholds || DEFAULT_THRESHOLDS));

  // Patient metadata
  const [patientProfile, setPatientProfile] = useState(() => {
    const saved = localStorage.getItem('carelink_patient_profile');
    return saved ? JSON.parse(saved) : MOCK_PATIENT;
  });

  // Connected Patients (For Doctor / Nurse view)
  const [connectedPatients, setConnectedPatients] = useState(() => {
    const saved = localStorage.getItem('carelink_connected_patients');
    if (saved) return JSON.parse(saved);
    if (!currentUser || currentUser.role === 'doctor' || currentUser.role === 'nurse') {
      return INITIAL_PATIENTS_LIST;
    }
    return [];
  });

  // Two-Way Connection Requests List
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('carelink_requests');
    if (saved) return JSON.parse(saved);
    const DEMO_IDS = ['CL-P10234', MOCK_DOCTOR.id, MOCK_NURSE.id, MOCK_GUARDIAN_ACCOUNT.id];
    const isDemo = !currentUser || DEMO_IDS.includes(currentUser?.id);
    return isDemo ? INITIAL_REQUESTS : [];
  });

  // Care Team Members for the main Patient (Saran Kumar CL-P10234)
  const [careTeam, setCareTeam] = useState(() => {
    const saved = localStorage.getItem('carelink_careteam');
    if (saved) return JSON.parse(saved);
    const isDemoPatient = !currentUser || currentUser.id === 'CL-P10234';
    return isDemoPatient ? [
      {
        id: MOCK_GUARDIAN_ACCOUNT.id,
        name: MOCK_GUARDIAN_ACCOUNT.name,
        role: "Guardian",
        phone: MOCK_GUARDIAN_ACCOUNT.phone,
        status: "CONNECTED",
        hasAccount: true
      },
      {
        id: MOCK_DOCTOR.id,
        name: MOCK_DOCTOR.name,
        role: "Doctor",
        phone: MOCK_DOCTOR.phone,
        status: "CONNECTED",
        hasAccount: true
      },
      {
        id: MOCK_NURSE.id,
        name: MOCK_NURSE.name,
        role: "Nurse",
        phone: MOCK_NURSE.phone,
        status: "CONNECTED",
        hasAccount: true
      }
    ] : [];
  });

  // Telemetry History for charts
  const [historicalData, setHistoricalData] = useState(() => {
    const saved = localStorage.getItem('carelink_history');
    return saved ? JSON.parse(saved) : generateHistoricalData();
  });

  // Organic live simulation toggle
  const [autoSimulate, setAutoSimulate] = useState(false);

  // Sync profile when currentUser role is patient
  useEffect(() => {
    if (currentUser && currentUser.role === 'patient') {
      setPatientProfile(currentUser);
      localStorage.setItem('carelink_patient_profile', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Re-initialize state data when currentUser changes (login/logout/switch)
  useEffect(() => {
    if (!currentUser) return;

    const DEMO_IDS = ['CL-P10234', MOCK_DOCTOR.id, MOCK_NURSE.id, MOCK_GUARDIAN_ACCOUNT.id];
    const isDemo = DEMO_IDS.includes(currentUser.id);
    const isDemoStaff = currentUser.role === 'doctor' || currentUser.role === 'nurse';
    const isDemoPatient = currentUser.id === 'CL-P10234';

    // Connected patients: staff (doctor/nurse) get mock list, others get empty
    if (isDemoStaff) {
      setConnectedPatients(INITIAL_PATIENTS_LIST);
      localStorage.setItem('carelink_connected_patients', JSON.stringify(INITIAL_PATIENTS_LIST));
    } else if (!localStorage.getItem('carelink_connected_patients')) {
      setConnectedPatients([]);
    }

    // Requests: demo users get mock requests, others get empty
    if (isDemo) {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem('carelink_requests', JSON.stringify(INITIAL_REQUESTS));
    } else if (!localStorage.getItem('carelink_requests')) {
      setRequests([]);
    }

    // Care team: only demo patient gets pre-filled care team
    if (isDemoPatient) {
      const demoCareTeam = [
        {
          id: MOCK_GUARDIAN_ACCOUNT.id,
          name: MOCK_GUARDIAN_ACCOUNT.name,
          role: "Guardian",
          phone: MOCK_GUARDIAN_ACCOUNT.phone,
          status: "CONNECTED",
          hasAccount: true
        },
        {
          id: MOCK_DOCTOR.id,
          name: MOCK_DOCTOR.name,
          role: "Doctor",
          phone: MOCK_DOCTOR.phone,
          status: "CONNECTED",
          hasAccount: true
        },
        {
          id: MOCK_NURSE.id,
          name: MOCK_NURSE.name,
          role: "Nurse",
          phone: MOCK_NURSE.phone,
          status: "CONNECTED",
          hasAccount: true
        }
      ];
      setCareTeam(demoCareTeam);
      localStorage.setItem('carelink_careteam', JSON.stringify(demoCareTeam));
    } else if (!localStorage.getItem('carelink_careteam')) {
      setCareTeam([]);
    }

    // Reset vitals to defaults for fresh state
    if (isDemoPatient || isDemoStaff) {
      setVitals(INITIAL_VITALS_STATE);
      setEvaluation(evaluateVitals(INITIAL_VITALS_STATE, thresholds || DEFAULT_THRESHOLDS));
    }

    // Reset patient profile
    if (!currentUser.role || currentUser.role !== 'patient') {
      setPatientProfile(MOCK_PATIENT);
    }

    // Regenerate history
    setHistoricalData(generateHistoricalData());
  }, [currentUser?.id]);

  // Load initial backend data on mount or when user changes
  useEffect(() => {
    const fetchBackendData = async () => {
      const activePatientId = (currentUser && currentUser.role === 'patient')
        ? currentUser.id
        : 'CL-P10234';

      try {
        const response = await apiService.getVitals(activePatientId);
        const vitalsObj = (response && response.vitals) ? response.vitals : response;
        
        let fetchedThresholds = DEFAULT_THRESHOLDS;
        if (response && response.thresholds) {
          fetchedThresholds = response.thresholds;
          setThresholds(fetchedThresholds);
          localStorage.setItem('carelink_thresholds', JSON.stringify(fetchedThresholds));
        } else {
          try {
            const thresh = await apiService.getThresholds(activePatientId);
            if (thresh) {
              fetchedThresholds = thresh;
              setThresholds(fetchedThresholds);
              localStorage.setItem('carelink_thresholds', JSON.stringify(thresh));
            }
          } catch (e) {
            console.warn("Failed to fetch thresholds separately", e);
          }
        }

        if (vitalsObj && vitalsObj.heartRate !== undefined) {
          setVitals(vitalsObj);
          const evalObj = (response && response.evaluation) ? response.evaluation : evaluateVitals(vitalsObj, fetchedThresholds);
          setEvaluation(evalObj);
        }

        const team = await apiService.getCareTeam(activePatientId);
        if (team) {
          setCareTeam(team);
        }

        const history = await apiService.getVitalsHistory(activePatientId);
        if (history) {
          setHistoricalData(history);
        }

        if (currentUser && currentUser.id) {
          const reqs = await apiService.getRequests(currentUser.id);
          setRequests(reqs);
        }
      } catch (err) {
        console.warn("[PatientContext] Failed to fetch data from backend, using local/fallback state:", err.message);
      }
    };

    fetchBackendData();
  }, [currentUser, patientProfile.id]);

  useEffect(() => {
    localStorage.setItem('carelink_vitals', JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem('carelink_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('carelink_careteam', JSON.stringify(careTeam));
  }, [careTeam]);

  useEffect(() => {
    localStorage.setItem('carelink_history', JSON.stringify(historicalData));
  }, [historicalData]);

  // Evaluate vitals whenever vitals update
  const applyVitalsUpdate = async (newVitalsObj) => {
    const activePatientId = (currentUser && currentUser.role === 'patient')
      ? currentUser.id
      : 'CL-P10234';

    try {
      const response = await apiService.updateVitals(activePatientId, newVitalsObj);
      const vitalsObj = (response && response.vitals) ? response.vitals : newVitalsObj;
      const evalObj = (response && response.evaluation) ? response.evaluation : evaluateVitals(vitalsObj, thresholds);
      setVitals(vitalsObj);
      setEvaluation(evalObj);

      // Reload history
      const history = await apiService.getVitalsHistory(activePatientId);
      if (history && history.length > 0) {
        setHistoricalData(history);
      }

      // Sync local UI triage view
      setConnectedPatients(prev => prev.map(p => {
        if (p.id === activePatientId) {
          return {
            ...p,
            status: response.evaluation.status,
            lastVitals: response.vitals
          };
        }
        return p;
      }));

      // Trigger alert notification & SMS payload whenever vitals have alert
      if (response.evaluation && response.evaluation.hasAlert) {
        const guardian = careTeam.find(m => m.role === "Guardian");
        addAlertNotification(patientProfile, response.evaluation, response.vitals, guardian);
      }
    } catch (e) {
      // Local fallback if API is offline
      const evalRes = evaluateVitals(newVitalsObj, thresholds);
      setVitals(newVitalsObj);
      setEvaluation(evalRes);

      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistoricalData(prev => [
        ...prev.slice(1),
        {
          timestamp: timeLabel,
          fullTime: timeLabel,
          heartRate: newVitalsObj.heartRate,
          spo2: newVitalsObj.spo2,
          temperature: newVitalsObj.temperature,
          systolic: newVitalsObj.systolic,
          diastolic: newVitalsObj.diastolic
        }
      ]);

      if (evalRes.hasAlert) {
        const guardian = careTeam.find(m => m.role === "Guardian");
        addAlertNotification(patientProfile, evalRes, newVitalsObj, guardian);
      }
    }
  };

  // Sensor simulator preset applier
  const applyPreset = (presetType) => {
    if (SENSOR_PRESETS[presetType]) {
      const updated = {
        ...SENSOR_PRESETS[presetType],
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      applyVitalsUpdate(updated);
    }
  };

  // Organic gradual interval drift effect
  useEffect(() => {
    let interval;
    if (autoSimulate) {
      interval = setInterval(() => {
        setVitals(prev => {
          const drifted = applyGradualDrift(prev);
          applyVitalsUpdate(drifted);
          return drifted;
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoSimulate]);

  // Two-Way Connection Request Actions
  const sendConnectionRequest = async (targetUser, direction = "OUTGOING") => {
    const sender = currentUser || patientProfile;
    try {
      await apiService.sendRequest({
        senderId: sender.id,
        senderName: sender.name,
        senderRole: sender.role,
        receiverId: targetUser.id,
        receiverName: targetUser.name,
        receiverRole: targetUser.role.toLowerCase()
      });

      // Reload requests & care team
      if (sender.id) {
        const reqs = await apiService.getRequests(sender.id);
        setRequests(reqs);
        const team = await apiService.getCareTeam(sender.id);
        setCareTeam(team);
      }
    } catch (e) {
      // Local fallback
      const newReq = {
        id: `REQ-${Date.now()}`,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: "patient",
        receiverId: targetUser.id || `CL-${targetUser.role.charAt(0).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`,
        receiverName: targetUser.name,
        receiverRole: targetUser.role.toLowerCase(),
        status: "PENDING",
        type: `${targetUser.role.toUpperCase()}_PATIENT`,
        timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      };

      setRequests(prev => [newReq, ...prev]);

      setCareTeam(prev => {
        const exists = prev.some(m => m.id === newReq.receiverId || m.name === targetUser.name);
        if (exists) return prev;
        return [...prev, {
          id: newReq.receiverId,
          name: targetUser.name,
          role: targetUser.role,
          phone: targetUser.phone || "+91 XXXXX XXXXX",
          status: "PENDING",
          hasAccount: targetUser.hasAccount !== false
        }];
      });
    }
  };

  const respondToRequest = async (requestId, acceptStatus) => {
    try {
      await apiService.respondRequest(requestId, acceptStatus);

      if (currentUser && currentUser.id) {
        const reqs = await apiService.getRequests(currentUser.id);
        setRequests(reqs);

        const activePatientId = currentUser.role === 'patient' ? currentUser.id : 'CL-P10234';
        const team = await apiService.getCareTeam(activePatientId);
        setCareTeam(team);
      }
    } catch (e) {
      // Local fallback
      const statusVal = acceptStatus ? "CONNECTED" : "DECLINED";

      setRequests(prev => prev.map(r => {
        if (r.id === requestId) {
          return { ...r, status: statusVal };
        }
        return r;
      }));

      const targetReq = requests.find(r => r.id === requestId);
      if (targetReq) {
        setCareTeam(prev => prev.map(member => {
          if (member.id === targetReq.senderId || member.id === targetReq.receiverId || member.name === targetReq.senderName || member.name === targetReq.receiverName) {
            return { ...member, status: statusVal };
          }
          return member;
        }));
      }
    }
  };

  // Link Guardian without account (Mobile SMS mode)
  const addSmsGuardian = async (name, phone) => {
    const activePatientId = (currentUser && currentUser.role === 'patient')
      ? currentUser.id
      : 'CL-P10234';

    try {
      await apiService.addSmsGuardian(activePatientId, name, phone);
      const team = await apiService.getCareTeam(activePatientId);
      setCareTeam(team);
    } catch (e) {
      // Local fallback
      const newMember = {
        id: `CL-G-SMS-${Math.floor(1000 + Math.random()*9000)}`,
        name: name,
        role: "Guardian",
        phone: phone,
        status: "CONNECTED",
        hasAccount: false
      };

      setCareTeam(prev => [...prev.filter(m => m.role !== "Guardian"), newMember]);
    }
  };

  const updateThresholds = async (patientId, newThresholds) => {
    try {
      const response = await apiService.updateThresholds(patientId, newThresholds);
      if (response && response.thresholds) {
        setThresholds(response.thresholds);
        localStorage.setItem('carelink_thresholds', JSON.stringify(response.thresholds));
        
        // Re-evaluate current vitals with new thresholds
        const evalRes = evaluateVitals(vitals, response.thresholds);
        setEvaluation(evalRes);
      }
    } catch (err) {
      console.error("Failed to update thresholds on backend:", err);
      // Local fallback
      setThresholds(newThresholds);
      localStorage.setItem('carelink_thresholds', JSON.stringify(newThresholds));
      const evalRes = evaluateVitals(vitals, newThresholds);
      setEvaluation(evalRes);
    }
  };

  return (
    <PatientContext.Provider value={{
      vitals,
      evaluation,
      patientProfile,
      connectedPatients,
      careTeam,
      requests,
      historicalData,
      autoSimulate,
      setAutoSimulate,
      applyVitalsUpdate,
      applyPreset,
      sendConnectionRequest,
      respondToRequest,
      addSmsGuardian,
      thresholds,
      updateThresholds
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext);
