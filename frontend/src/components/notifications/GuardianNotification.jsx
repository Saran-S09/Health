import React from 'react';
import { ShieldAlert, PhoneCall, Volume2, Vibrate, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { usePatient } from '../../context/PatientContext';

export const GuardianNotification = () => {
  const { evaluation, careTeam, patientProfile } = usePatient();
  const { openEmergencyModal, isVibrating, isAlarmSounding, silenceAlarm } = useNotification();

  if (!evaluation || evaluation.status === 'NORMAL') return null;

  const isCritical = evaluation.status === 'CRITICAL';
  const doctor = careTeam.find(m => m.role === 'Doctor');
  const nurse = careTeam.find(m => m.role === 'Nurse');

  return (
    <div className={`glass-panel ${isCritical ? 'animate-critical-flash vibrate-active' : ''}`} style={{
      padding: '1.25rem 1.5rem',
      borderRadius: '16px',
      borderColor: isCritical ? 'var(--status-critical-border)' : 'var(--status-attention-border)',
      backgroundColor: isCritical ? 'var(--status-critical-bg)' : 'var(--status-attention-bg)',
      marginBottom: '1.5rem'
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(217, 119, 6, 0.2)',
            color: isCritical ? '#dc2626' : '#d97706'
          }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isCritical ? '#dc2626' : '#d97706' }}>
              {isCritical ? '🚨 CRITICAL PATIENT ALERT' : '⚠️ GUARDIAN ATTENTION REQUIRED'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Patient: <strong style={{ color: 'var(--text-main)' }}>{patientProfile.name} ({patientProfile.id})</strong>
            </p>
          </div>
        </div>

        {/* Visual Vibration & Sound Sim Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isVibrating && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: '20px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626'
            }}>
              <Vibrate size={14} className="vibrate-active" /> 📳 Alert Vibration Active
            </span>
          )}
          {isAlarmSounding && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
              borderRadius: '20px', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#d97706'
            }}>
              <Volume2 size={14} /> 🔔 Alarm Sounding
            </span>
          )}
        </div>
      </div>

      {/* Issues Snapshot */}
      <div style={{ marginBottom: '1rem' }}>
        {evaluation.issues.map((issue, idx) => (
          <div key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0.2rem 0' }}>
            ● <strong>{issue.vital}</strong>: {issue.val} — <span style={{ color: isCritical ? '#dc2626' : '#b45309', fontWeight: 700 }}>{issue.msg}</span>
          </div>
        ))}
      </div>

      {/* Emergency Action Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        {isCritical && (
          <button
            onClick={() => openEmergencyModal({ patient: patientProfile, evaluation })}
            className="btn btn-danger"
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.25rem' }}
          >
            <PhoneCall size={16} /> 📞 CALL AMBULANCE
          </button>
        )}

        {doctor && (
          <a
            href={`tel:${doctor.phone}`}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            👨‍⚕️ Contact Doctor ({doctor.name})
          </a>
        )}

        {nurse && (
          <a
            href={`tel:${nurse.phone}`}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            👩‍⚕️ Contact Nurse ({nurse.name})
          </a>
        )}

        {isAlarmSounding && (
          <button
            onClick={silenceAlarm}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', marginLeft: 'auto' }}
          >
            Silence Local Alarm
          </button>
        )}
      </div>
    </div>
  );
};
