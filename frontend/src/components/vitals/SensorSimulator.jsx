import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, Play, Pause, X } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const SensorSimulator = ({ isOpen, onClose }) => {
  const { vitals, applyVitalsUpdate, applyPreset, autoSimulate, setAutoSimulate } = usePatient();

  const [localHR, setLocalHR] = useState(vitals.heartRate);
  const [localSpO2, setLocalSpO2] = useState(vitals.spo2);
  const [localTemp, setLocalTemp] = useState(vitals.temperature);
  const [localSys, setLocalSys] = useState(vitals.systolic);
  const [localDia, setLocalDia] = useState(vitals.diastolic);

  // Keep local inputs in sync with parent vitals when preset is clicked
  useEffect(() => {
    setLocalHR(vitals.heartRate);
    setLocalSpO2(vitals.spo2);
    setLocalTemp(vitals.temperature);
    setLocalSys(vitals.systolic);
    setLocalDia(vitals.diastolic);
  }, [vitals]);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    applyVitalsUpdate({
      heartRate: Number(localHR),
      spo2: Number(localSpO2),
      temperature: Number(localTemp),
      systolic: Number(localSys),
      diastolic: Number(localDia),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      zIndex: 9900,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '580px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '20px',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-color)'
      }}>
        
        {/* Prominent Close Button (Never Hidden Above) */}
        <button
          onClick={onClose}
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
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          title="Close Simulator"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', paddingRight: '2.5rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            border: '1px solid var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>SENSOR SIMULATOR TUNER</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time telemetry generator • Dispatches SMS (7598974652 → 9095521570)
            </p>
          </div>
        </div>

        {/* Vital Tuner Inputs Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          
          {/* Heart Rate */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Heart Rate</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 60–100 BPM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={localHR}
                onChange={e => setLocalHR(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: 'var(--primary)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '35px' }}>BPM</span>
            </div>
          </div>

          {/* SpO2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>SpO₂ Oxygen Saturation</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: ≥ 95%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={localSpO2}
                onChange={e => setLocalSpO2(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: Number(localSpO2) < 90 ? '#dc2626' : Number(localSpO2) < 95 ? '#d97706' : '#059669',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '35px' }}>%</span>
            </div>
          </div>

          {/* Temperature */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Body Temperature</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 36.5–37.5 °C</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                step="0.1"
                value={localTemp}
                onChange={e => setLocalTemp(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#d97706',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '35px' }}>°C</span>
            </div>
          </div>

          {/* Systolic BP */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Systolic Blood Pressure</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 90–120 mmHg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={localSys}
                onChange={e => setLocalSys(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#7c3aed',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '35px' }}>mmHg</span>
            </div>
          </div>

          {/* Diastolic BP */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Diastolic Blood Pressure</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 60–80 mmHg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                value={localDia}
                onChange={e => setLocalDia(e.target.value)}
                style={{
                  width: '85px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#7c3aed',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '35px' }}>mmHg</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyCustom}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}
        >
          <RefreshCw size={18} /> Apply Custom Vitals Reading
        </button>

        {/* Rapid Simulation Presets */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            QUICK PRESET SCENARIOS (Sends SMS from 7598974652 → 9095521570)
          </span>

          <div className="app-simulator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
            <button
              onClick={() => applyPreset('NORMAL')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#059669', color: '#059669', fontWeight: 700, padding: '0.5rem' }}
            >
              <CheckCircle2 size={15} /> Normal Baseline
            </button>

            <button
              onClick={() => applyPreset('ATTENTION_SPO2')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#d97706', color: '#d97706', fontWeight: 700, padding: '0.5rem' }}
            >
              <AlertTriangle size={15} /> SpO₂ Warning (92%)
            </button>

            <button
              onClick={() => applyPreset('CRITICAL_SPO2')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#dc2626', color: '#dc2626', fontWeight: 700, padding: '0.5rem' }}
            >
              <ShieldAlert size={15} /> SpO₂ Severe Critical (88%)
            </button>

            <button
              onClick={() => applyPreset('CRITICAL_HR')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#dc2626', color: '#dc2626', fontWeight: 700, padding: '0.5rem' }}
            >
              <ShieldAlert size={15} /> Tachycardia (135 BPM)
            </button>

            <button
              onClick={() => applyPreset('FEVER_ATTENTION')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#d97706', color: '#d97706', fontWeight: 700, padding: '0.5rem' }}
            >
              <AlertTriangle size={15} /> Mild Fever (38.1°C)
            </button>

            <button
              onClick={() => setAutoSimulate(prev => !prev)}
              className={`btn btn-sm ${autoSimulate ? 'btn-danger' : 'btn-secondary'}`}
              style={{ fontWeight: 700, padding: '0.5rem' }}
            >
              {autoSimulate ? <Pause size={15} /> : <Play size={15} />} {autoSimulate ? 'Stop Auto Drift' : 'Start Live Drift'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
