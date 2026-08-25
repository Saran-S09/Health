import React, { useState } from 'react';
import { Stethoscope, Users, UserCheck, ShieldAlert, Activity, CheckCircle, Sliders } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { ThresholdSettingsModal } from '../components/vitals/ThresholdSettingsModal';

export const DoctorDashboard = ({ onOpenSimulator }) => {
  const { currentUser } = useAuth();
  const { connectedPatients, requests, vitals, evaluation, respondToRequest } = usePatient();

  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [selectedPatientForThresholds, setSelectedPatientForThresholds] = useState(null);

  const handleOpenThresholds = (patient) => {
    setSelectedPatientForThresholds(patient);
    setThresholdModalOpen(true);
  };

  const pendingRequests = requests.filter(r => r.receiverId === currentUser.id && r.status === 'PENDING');
  const isCritical = evaluation.status === 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            backgroundColor: 'rgba(2, 132, 199, 0.12)', border: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
          }}>
            <Stethoscope size={30} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Doctor Portal: {currentUser.name}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {currentUser.title} • CareLink ID: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{currentUser.id}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/doctor-requests" className="btn btn-secondary">
            <UserCheck size={16} /> Pending Requests ({pendingRequests.length})
          </Link>
          <button onClick={onOpenSimulator} className="btn btn-primary">
            Test Patient Sensor Simulator
          </button>
        </div>
      </div>

      {/* Critical Triage Banner if patient telemetry critical */}
      {isCritical && (
        <div className="glass-panel animate-critical-flash" style={{
          padding: '1.25rem 1.5rem', borderRadius: '12px', borderColor: '#ef4444', backgroundColor: 'var(--status-critical-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={26} color="#ef4444" />
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                🚨 CRITICAL TRIAGE ALERT: Patient Saran Kumar (CL-P10234)
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>
                Telemetry value outside safety range: SpO₂: {vitals.spo2}% | HR: {vitals.heartRate} BPM. Immediate review recommended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connected Patients Overview Matrix */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" /> Connected Monitored Patients ({connectedPatients.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Only accepted connection permissions grant telemetry access.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {connectedPatients.map(p => {
            const isMainPatient = p.id === "CL-P10234";
            const patientVitals = isMainPatient ? vitals : p.lastVitals;
            const patientStatus = isMainPatient ? evaluation.status : p.status;

            return (
              <div key={p.id} className="glass-panel glass-panel-hover" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  
                  {/* Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {p.name}
                      </h4>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
                        ({p.id})
                      </span>
                      <StatusBadge status={patientStatus} size="sm" />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {p.surgery} • {p.room} • Connected: {p.connectedSince}
                    </p>
                  </div>

                  {/* Telemetry Snapshot Pills */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Heart Rate</span>
                      <strong style={{ fontSize: '0.95rem', color: '#e11d48', fontFamily: 'var(--font-mono)' }}>{patientVitals.heartRate} BPM</strong>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>SpO₂ Oxygen</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{patientVitals.spo2}%</strong>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Temperature</span>
                      <strong style={{ fontSize: '0.95rem', color: '#d97706', fontFamily: 'var(--font-mono)' }}>{patientVitals.temperature}°C</strong>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>BP</span>
                      <strong style={{ fontSize: '0.95rem', color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>{patientVitals.systolic}/{patientVitals.diastolic}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenThresholds(p)} 
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Sliders size={14} /> Configure Safety Limits
                    </button>
                    <Link to="/history" state={{ selectedPatient: p }} className="btn btn-secondary btn-sm">
                      <Activity size={14} /> Full Telemetry Graph
                    </Link>
                  </div>
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
