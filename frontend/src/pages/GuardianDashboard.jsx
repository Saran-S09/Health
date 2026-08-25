import React from 'react';
import { Shield, PhoneCall, Smartphone, Bell, Heart, Volume2, Vibrate, User } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GuardianNotification } from '../components/notifications/GuardianNotification';
import { VitalCard } from '../components/vitals/VitalCard';
import { StatusBadge } from '../components/common/StatusBadge';

export const GuardianDashboard = ({ onOpenSimulator, onOpenSmsDrawer }) => {
  const { currentUser } = useAuth();
  const { vitals, evaluation, patientProfile, careTeam } = usePatient();
  const { openEmergencyModal, isVibrating, isAlarmSounding } = useNotification();

  const isCritical = evaluation.status === 'CRITICAL';
  const doctor = careTeam.find(m => m.role === 'Doctor');
  const nurse = careTeam.find(m => m.role === 'Nurse');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            backgroundColor: 'rgba(124, 58, 237, 0.12)', border: '2px solid var(--accent-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)'
          }}>
            <Shield size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Guardian Care Portal: {currentUser.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Monitoring Linked Patient: <strong style={{ color: 'var(--text-main)' }}>{patientProfile.name} ({patientProfile.id})</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onOpenSmsDrawer} className="btn btn-secondary">
            <Smartphone size={16} /> SMS Alert Log
          </button>
          <button onClick={onOpenSimulator} className="btn btn-primary">
            Test Sensor Simulator
          </button>
        </div>
      </div>

      {/* Emergency Guardian Alert Banner */}
      <GuardianNotification />

      {/* Linked Patient Real-time Telemetry */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="var(--accent-purple)" /> Monitored Patient Vitals ({patientProfile.name})
          </h3>
          <StatusBadge status={evaluation.status} />
        </div>

        <div className="grid-4">
          <VitalCard
            title="Heart Rate"
            value={vitals.heartRate}
            unit="BPM"
            status={vitals.heartRate < 50 || vitals.heartRate > 120 ? 'CRITICAL' : (vitals.heartRate < 60 || vitals.heartRate > 100) ? 'ATTENTION' : 'NORMAL'}
            targetRange="60 - 100 BPM"
            lastUpdated={vitals.lastUpdated}
            iconType="hr"
          />

          <VitalCard
            title="SpO₂ Oxygen"
            value={`${vitals.spo2}%`}
            unit="Oxygen"
            status={vitals.spo2 < 90 ? 'CRITICAL' : vitals.spo2 <= 94 ? 'ATTENTION' : 'NORMAL'}
            targetRange="≥ 95%"
            lastUpdated={vitals.lastUpdated}
            iconType="spo2"
          />

          <VitalCard
            title="Body Temperature"
            value={`${vitals.temperature}°C`}
            unit="Celsius"
            status={vitals.temperature > 38.5 || vitals.temperature < 35.0 ? 'CRITICAL' : (vitals.temperature >= 37.6 || vitals.temperature < 36.5) ? 'ATTENTION' : 'NORMAL'}
            targetRange="36.5 - 37.5 °C"
            lastUpdated={vitals.lastUpdated}
            iconType="temp"
          />

          <VitalCard
            title="Blood Pressure"
            value={`${vitals.systolic}/${vitals.diastolic}`}
            unit="mmHg"
            status={vitals.systolic >= 140 || vitals.diastolic >= 90 ? 'CRITICAL' : (vitals.systolic > 120 || vitals.diastolic > 80) ? 'ATTENTION' : 'NORMAL'}
            targetRange="120/80 mmHg"
            lastUpdated={vitals.lastUpdated}
            iconType="bp"
          />
        </div>
      </div>

      {/* Care Team Emergency Contact List */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Authorized Patient Medical Contacts
        </h3>

        <div className="grid-2">
          {doctor && (
            <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{doctor.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Assigned Doctor • {doctor.phone}</span>
                </div>
                <a href={`tel:${doctor.phone}`} className="btn btn-secondary btn-sm">
                  <PhoneCall size={14} /> Call Doctor
                </a>
              </div>
            </div>
          )}

          {nurse && (
            <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{nurse.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ward Nurse Specialist • {nurse.phone}</span>
                </div>
                <a href={`tel:${nurse.phone}`} className="btn btn-secondary btn-sm">
                  <PhoneCall size={14} /> Call Nurse
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
