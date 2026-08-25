import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VitalChart } from '../components/vitals/VitalChart';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';

export const PatientHistory = () => {
  const { patientProfile, connectedPatients } = usePatient();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const activePatientName = location.state?.selectedPatient?.name || patientProfile?.name || 'Saran Kumar';
  const activePatientId = location.state?.selectedPatient?.id || patientProfile?.id || 'CL-P10234';

  const isStaff = currentUser?.role === 'doctor' || currentUser?.role === 'nurse';

  const handlePatientChange = (e) => {
    const selectedId = e.target.value;
    let selectedPatient = connectedPatients.find(p => p.id === selectedId);
    if (!selectedPatient && selectedId === patientProfile?.id) {
        selectedPatient = patientProfile; 
    }
    
    if (selectedPatient) {
        navigate('/history', { state: { selectedPatient }, replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Historical Telemetry Analytics
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Continuous time-series tracking for Heart Rate, SpO₂, Temperature, and Blood Pressure
          </p>
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>Patient: {activePatientName}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>({activePatientId})</span>
          </div>
        </div>

        {isStaff && connectedPatients && connectedPatients.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Switch Patient:</label>
            <select 
              value={activePatientId} 
              onChange={handlePatientChange}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {connectedPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <VitalChart />
    </div>
  );
};
