import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAlertNotificationPayload, createSmsSimulationPayload } from '../services/notificationService';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('carelink_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: "INIT-01",
        title: "System Initialization",
        summary: "CareLink telemetry supplementary monitoring system online.",
        severity: "NORMAL",
        timestamp: "10:00 AM",
        read: true
      }
    ];
  });

  const [smsLogs, setSmsLogs] = useState(() => {
    const saved = localStorage.getItem('carelink_sms');
    return saved ? JSON.parse(saved) : [];
  });

  const [emergencyAudit, setEmergencyAudit] = useState(() => {
    const saved = localStorage.getItem('carelink_emergency_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [activeEmergencyData, setActiveEmergencyData] = useState(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const [isAlarmSounding, setIsAlarmSounding] = useState(false);

  // Sync data with backend on load
  useEffect(() => {
    const fetchNotificationsData = async () => {
      try {
        const notifs = await apiService.getNotifications();
        if (notifs && notifs.length > 0) {
          // Normalize API fields to UI field names if necessary
          // UI expects: id, title, summary (or message), severity (or type), timestamp, read (or isRead)
          const mappedNotifs = notifs.map(n => ({
            id: n.id,
            title: n.title,
            summary: n.message || n.summary,
            severity: n.type || n.severity || "INFO",
            timestamp: n.timestamp,
            read: n.isRead !== undefined ? n.isRead : n.read
          }));
          setNotifications(mappedNotifs);
        }

        const sms = await apiService.getSmsLogs();
        if (sms && sms.length > 0) {
          const mappedSms = sms.map(s => ({
            id: s.id,
            recipient: s.recipient,
            message: s.message,
            timestamp: s.timestamp,
            status: s.status || "SENT"
          }));
          setSmsLogs(mappedSms);
        }
      } catch (err) {
        console.warn("[NotificationContext] Backend notifications offline, using local state:", err.message);
      }
    };

    fetchNotificationsData();
    // Poll notifications every 5 seconds to show backend alert changes
    const interval = setInterval(fetchNotificationsData, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('carelink_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('carelink_sms', JSON.stringify(smsLogs));
  }, [smsLogs]);

  useEffect(() => {
    localStorage.setItem('carelink_emergency_audit', JSON.stringify(emergencyAudit));
  }, [emergencyAudit]);

  const addAlertNotification = (patient, evaluation, vitals, guardianAccount) => {
    const newNotif = createAlertNotificationPayload({ patient, evaluation, vitals });
    
    setNotifications(prev => [newNotif, ...prev]);

    // Handle Guardian SMS simulation - Always send from 7598974652 to linked guardian (default 9095521570)
    const guardianPhone = (guardianAccount && guardianAccount.phone) 
      ? guardianAccount.phone 
      : "+91 90955 21570";

    const smsPayload = createSmsSimulationPayload({
      phone: guardianPhone,
      patientName: patient.name,
      evaluation,
      vitals
    });
    setSmsLogs(prev => [smsPayload, ...prev]);

    if (evaluation.status === "CRITICAL") {
      setIsVibrating(true);
      setIsAlarmSounding(true);
      setActiveEmergencyData({ patient, evaluation, vitals });
    } else {
      setIsVibrating(false);
      setIsAlarmSounding(false);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiService.markNotificationsRead();
    } catch (e) {
      console.warn("Could not mark notifications read on backend");
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const openEmergencyModal = (emergencyData) => {
    setActiveEmergencyData(emergencyData);
    setIsEmergencyModalOpen(true);
  };

  const closeEmergencyModal = () => {
    setIsEmergencyModalOpen(false);
  };

  const logEmergencyCallAction = async (patientName, patientId, callerDetails = {}) => {
    const callerStr = callerDetails.phone ? `${callerDetails.name || 'Guardian'} (${callerDetails.phone})` : 'Guardian (+91 98765 11223)';
    const auditEntry = {
      id: `CALL-${Date.now()}`,
      action: "Ambulance Emergency Call Initiated",
      caller: callerStr,
      callerPhone: callerDetails.phone || "+91 98765 11223",
      patientName,
      patientId,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }),
      status: "Call Connected (Guardian → Ambulance 108)"
    };
    setEmergencyAudit(prev => [auditEntry, ...prev]);

    try {
      await apiService.logEmergencyCall(patientName, patientId, callerDetails);
      // Reload notifications & sms from backend immediately
      const notifs = await apiService.getNotifications();
      const mappedNotifs = notifs.map(n => ({
        id: n.id,
        title: n.title,
        summary: n.message || n.summary,
        severity: n.type || n.severity || "INFO",
        timestamp: n.timestamp,
        read: n.isRead !== undefined ? n.isRead : n.read
      }));
      setNotifications(mappedNotifs);

      const sms = await apiService.getSmsLogs();
      const mappedSms = sms.map(s => ({
        id: s.id,
        fromPhone: s.fromPhone || "7598974652",
        toPhone: s.toPhone || s.recipient,
        type: s.type || "CRITICAL",
        message: s.message,
        timestamp: s.timestamp,
        deliveryStatus: s.status || "SENT"
      }));
      setSmsLogs(mappedSms);
    } catch (err) {
      console.warn("Could not log emergency call to backend:", err.message);
    }
  };

  const silenceAlarm = () => {
    setIsVibrating(false);
    setIsAlarmSounding(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      smsLogs,
      emergencyAudit,
      unreadCount,
      isEmergencyModalOpen,
      activeEmergencyData,
      isVibrating,
      isAlarmSounding,
      addAlertNotification,
      markAllAsRead,
      markAsRead,
      openEmergencyModal,
      closeEmergencyModal,
      logEmergencyCallAction,
      silenceAlarm
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
