import React, { useState } from 'react';
import { Heart, Users, ShieldAlert, Activity, CheckCircle, PhoneCall, Sliders } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { ThresholdSettingsModal } from '../components/vitals/ThresholdSettingsModal';

export const NurseDashboard = ({ onOpenSimulator }) => {
  const { currentUser } = useAuth();
  const { connectedPatients, vitals, evaluation, sensorConnected } = usePatient();
  
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [selectedPatientForThresholds, setSelectedPatientForThresholds] = useState(null);

  const handleOpenThresholds = (patient) => {
    setSelectedPatientForThresholds(patient);
    setThresholdModalOpen(true);
  };

  const isCritical = evaluation.status === 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #ccfbf1 0%, #ffffff 100%)',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            backgroundColor: 'rgba(13, 148, 136, 0.12)', border: '2px solid var(--accent-teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)'
          }}>
            <Heart size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Nurse Triage Station: {currentUser.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {currentUser.title} • Department: {currentUser.department}
            </p>
          </div>
        </div>

        <button onClick={onOpenSimulator} className="btn btn-primary">
          Simulate Ward Telemetry
        </button>
      </div>

      {/* Ward Alert Overview */}
      {isCritical && (
        <div className="glass-panel animate-critical-flash" style={{
          padding: '1.25rem 1.5rem', borderRadius: '12px', borderColor: '#ef4444', backgroundColor: 'var(--status-critical-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={26} color="#ef4444" />
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                  🚨 CRITICAL WARD ALERT: Bed 4B (Saran Kumar)
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  SpO₂ at {vitals.spo2}% | HR: {vitals.heartRate} BPM. Nursing response requested.
                </p>
              </div>
            </div>
            <a href="tel:+919876543210" className="btn btn-danger btn-sm">
              <PhoneCall size={14} /> Immediate Bedside Dispatch
            </a>
          </div>
        </div>
      )}

      {/* Assigned Patients Ward Board */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="var(--accent-teal)" /> Post-Operative Ward Monitoring Board
        </h3>

        <div className="grid-2">
          {connectedPatients.map(p => {
            const isMain = p.id === "CL-P10234";
            const curVitals = isMain ? vitals : p.lastVitals;
            const curStatus = isMain ? evaluation.status : p.status;

            return (
              <div key={p.id} className="glass-panel glass-panel-hover" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>{p.room} • ID: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{p.id}</strong></span>
                      {isMain && (
                        sensorConnected ? (
                          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            ● Sensor Online
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            ○ Sensor Offline (Simulated)
                          </span>
                        )
                      )}
                    </span>
                  </div>
                  <StatusBadge status={curStatus} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>SpO₂ Level</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{curVitals.spo2}%</strong>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Heart Rate</span>
                    <strong style={{ fontSize: '1.1rem', color: '#e11d48', fontFamily: 'var(--font-mono)' }}>{curVitals.heartRate} BPM</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => handleOpenThresholds(p)} 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Sliders size={14} /> Safety Limits
                  </button>
                  <Link to="/history" state={{ selectedPatient: p }} className="btn btn-secondary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={14} /> Analytics
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPatientForThresholds && (
        <ThresholdSettingsModal
          isOpen={thresholdModalOpen}
          onClose={() => {
            setThresholdModalOpen(false);
            setSelectedPatientForThresholds(null);
          }}
          patientId={selectedPatientForThresholds.id}
          patientName={selectedPatientForThresholds.name}
        />
      )}
    </div>
  );
};
