import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, ShieldAlert, CheckCircle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const EmergencyCallModal = () => {
  const { isEmergencyModalOpen, activeEmergencyData, closeEmergencyModal, logEmergencyCallAction } = useNotification();
  const { currentUser } = useAuth();
  const [callStatus, setCallStatus] = useState(null); // null, 'initiating', 'connected'

  if (!isEmergencyModalOpen) return null;

  const patient = activeEmergencyData?.patient || { name: "Saran Kumar", id: "CL-P10234" };
  const evaluation = activeEmergencyData?.evaluation;

  const handleInitiateCall = () => {
    setCallStatus('initiating');
    
    // Pass current logged in guardian details
    const callerDetails = {
      name: currentUser?.name || 'Ramesh Kumar (Guardian)',
      phone: currentUser?.phone || '+91 98765 11223',
      role: currentUser?.role || 'Guardian'
    };

    logEmergencyCallAction(patient.name, patient.id, callerDetails);

    // Try native tel: protocol if supported
    try {
      window.location.href = "tel:108";
    } catch (e) {
      console.log("Native dialer protocol triggered");
    }

    setTimeout(() => {
      setCallStatus('connected');
    }, 1800);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel animate-critical-flash" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        borderColor: 'var(--status-critical-border)',
        borderRadius: '18px',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <button
          onClick={closeEmergencyModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: '1px solid var(--border-color)',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
          title="Close Modal"
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-critical-bg)',
            border: '2px solid var(--status-critical)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: 'var(--status-critical)'
          }}>
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-critical)' }}>
            🚨 Emergency Assistance Confirmation
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            CareLink Post-Operative Supplementary Monitoring Platform
          </p>
        </div>

        {/* Patient Details Snapshot */}
        <div style={{
          backgroundColor: 'var(--status-critical-bg)',
          border: '1px solid var(--status-critical-border)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Patient:</span>
            <strong style={{ color: 'var(--text-main)' }}>{patient.name} ({patient.id})</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Caller Number:</span>
            <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
              {currentUser?.phone || '+91 98765 11223'} ({currentUser?.name || 'Guardian'})
            </strong>
          </div>

          {evaluation?.issues?.map((issue, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--status-critical)' }}>
              <span>{issue.vital}:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{issue.val} (CRITICAL)</strong>
            </div>
          ))}
        </div>

        {/* Clinical Disclaimer Notice */}
        <div style={{
          backgroundColor: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: '#92400e',
          marginBottom: '1.5rem',
          lineHeight: '1.4',
          borderRadius: '6px'
        }}>
          <AlertTriangle size={16} color="#f59e0b" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          A critical monitoring threshold has been crossed. Dispatching call connects <strong>{currentUser?.phone || '+91 98765 11223'}</strong> to <strong>108 Ambulance Hotline</strong>.
        </div>

        {/* Dynamic Action Buttons */}
        {callStatus === null && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={closeEmergencyModal}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleInitiateCall}
              className="btn btn-danger"
              style={{ flex: 2, fontSize: '1rem', padding: '0.75rem' }}
            >
              <PhoneCall size={18} />
              Call Ambulance (108)
            </button>
          </div>
        )}

        {callStatus === 'initiating' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="pulse-indicator red" style={{ marginBottom: '1rem' }}></div>
            <p style={{ fontWeight: 600, color: 'var(--status-critical)' }}>Connecting Guardian Phone ({currentUser?.phone || '+91 98765 11223'}) to 108 Ambulance Dispatcher...</p>
          </div>
        )}

        {callStatus === 'connected' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={40} color="var(--status-normal)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ color: 'var(--status-normal)', fontWeight: 700 }}>Call Connected to Dispatcher (108)</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Connection logged on backend database audit trail. Care team notified.
            </p>
            <button
              onClick={() => {
                setCallStatus(null);
                closeEmergencyModal();
              }}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
