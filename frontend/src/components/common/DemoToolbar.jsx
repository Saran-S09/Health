import React from 'react';
import { UserCheck, Sliders, MessageSquare, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { usePatient } from '../../context/PatientContext';

export const DemoToolbar = ({ onOpenSimulator, onOpenSmsDrawer }) => {
  const { currentUser, switchRole } = useAuth();
  const { isVibrating, isAlarmSounding, silenceAlarm } = useNotification();
  const { evaluation } = usePatient();

  const isCritical = evaluation?.status === 'CRITICAL';
  const isAttention = evaluation?.status === 'ATTENTION';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem'
    }}>
      {/* Brand & Demo Mode Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'rgba(2, 132, 199, 0.2)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
          padding: '0.25rem 0.6rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#38bdf8'
        }}>
          <Sparkles size={13} />
          PRESENTATION DEMO MODE
        </div>

        {/* Alarm warning badge if active */}
        {(isVibrating || isAlarmSounding) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#f87171',
            fontWeight: 700
          }}>
            <ShieldAlert size={14} className="vibrate-active" />
            🚨 EMERGENCY ALARM ACTIVE
            <button
              onClick={silenceAlarm}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                padding: '0.1rem 0.4rem',
                cursor: 'pointer',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <VolumeX size={12} /> Silence
            </button>
          </div>
        )}
      </div>

      {/* Role Switcher Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Switch View:
        </span>

        {[
          { key: 'patient', label: 'Patient (Saran)', id: 'CL-P10234' },
          { key: 'doctor', label: 'Doctor (Dr. Kumar)', id: 'CL-D1021' },
          { key: 'nurse', label: 'Nurse (Nurse Priya)', id: 'CL-N2042' },
          { key: 'guardian', label: 'Guardian (Ramesh)', id: 'CL-G3045' }
        ].map(r => (
          <button
            key={r.key}
            onClick={() => switchRole(r.key)}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: currentUser.role === r.key ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              backgroundColor: currentUser.role === r.key ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)',
              color: currentUser.role === r.key ? '#38bdf8' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Sensor & SMS Drawer Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onOpenSimulator}
          className="btn btn-primary btn-sm"
          style={{
            backgroundColor: isCritical ? '#dc2626' : isAttention ? '#d97706' : undefined
          }}
        >
          <Sliders size={14} />
          Sensor Simulator
        </button>

        <button
          onClick={onOpenSmsDrawer}
          className="btn btn-secondary btn-sm"
        >
          <MessageSquare size={14} />
          SMS Simulation Logs
        </button>
      </div>
    </div>
  );
};
