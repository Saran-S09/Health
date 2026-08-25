import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const ThresholdSettingsModal = ({ isOpen, onClose, patientId, patientName }) => {
  const { thresholds, updateThresholds } = usePatient();

  const [hrMin, setHrMin] = useState(60);
  const [hrMax, setHrMax] = useState(100);
  const [spo2Min, setSpo2Min] = useState(95);
  const [tempMin, setTempMin] = useState(36.5);
  const [tempMax, setTempMax] = useState(37.5);
  const [sysMin, setSysMin] = useState(90);
  const [sysMax, setSysMax] = useState(120);
  const [diaMin, setDiaMin] = useState(60);
  const [diaMax, setDiaMax] = useState(80);

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Absolute safety boundaries
  const BOUNDS = {
    heartRate: { min: 50, max: 120 },
    spo2: { min: 90 },
    temperature: { min: 35.0, max: 38.5 },
    systolic: { min: 85, max: 140 },
    diastolic: { min: 55, max: 90 }
  };

  useEffect(() => {
    if (thresholds) {
      setHrMin(thresholds.heartRate?.normalMin || 60);
      setHrMax(thresholds.heartRate?.normalMax || 100);
      setSpo2Min(thresholds.spo2?.normalMin || 95);
      setTempMin(thresholds.temperature?.normalMin || 36.5);
      setTempMax(thresholds.temperature?.normalMax || 37.5);
      setSysMin(thresholds.systolic?.normalMin || 90);
      setSysMax(thresholds.systolic?.normalMax || 120);
      setDiaMin(thresholds.diastolic?.normalMin || 60);
      setDiaMax(thresholds.diastolic?.normalMax || 80);
    }
  }, [thresholds, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};

    // Heart Rate
    if (Number(hrMin) < BOUNDS.heartRate.min) {
      errs.hr = `Heart Rate Min cannot be below safety limit (${BOUNDS.heartRate.min} BPM)`;
    } else if (Number(hrMax) > BOUNDS.heartRate.max) {
      errs.hr = `Heart Rate Max cannot exceed safety limit (${BOUNDS.heartRate.max} BPM)`;
    } else if (Number(hrMin) >= Number(hrMax)) {
      errs.hr = 'Heart Rate Min must be strictly less than Max';
    }

    // SpO2
    if (Number(spo2Min) < BOUNDS.spo2.min) {
      errs.spo2 = `SpO₂ Min cannot be below safety limit (${BOUNDS.spo2.min}%)`;
    } else if (Number(spo2Min) > 100) {
      errs.spo2 = 'SpO₂ Min cannot exceed 100%';
    }

    // Temperature
    if (Number(tempMin) < BOUNDS.temperature.min) {
      errs.temp = `Temperature Min cannot be below safety limit (${BOUNDS.temperature.min}°C)`;
    } else if (Number(tempMax) > BOUNDS.temperature.max) {
      errs.temp = `Temperature Max cannot exceed safety limit (${BOUNDS.temperature.max}°C)`;
    } else if (Number(tempMin) >= Number(tempMax)) {
      errs.temp = 'Temperature Min must be strictly less than Max';
    }

    // Systolic BP
    if (Number(sysMin) < BOUNDS.systolic.min) {
      errs.sys = `Systolic Min cannot be below safety limit (${BOUNDS.systolic.min} mmHg)`;
    } else if (Number(sysMax) > BOUNDS.systolic.max) {
      errs.sys = `Systolic Max cannot exceed safety limit (${BOUNDS.systolic.max} mmHg)`;
    } else if (Number(sysMin) >= Number(sysMax)) {
      errs.sys = 'Systolic Min must be strictly less than Max';
    }

    // Diastolic BP
    if (Number(diaMin) < BOUNDS.diastolic.min) {
      errs.dia = `Diastolic Min cannot be below safety limit (${BOUNDS.diastolic.min} mmHg)`;
    } else if (Number(diaMax) > BOUNDS.diastolic.max) {
      errs.dia = `Diastolic Max cannot exceed safety limit (${BOUNDS.diastolic.max} mmHg)`;
    } else if (Number(diaMin) >= Number(diaMax)) {
      errs.dia = 'Diastolic Min must be strictly less than Max';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      heartRate: { normalMin: Number(hrMin), normalMax: Number(hrMax) },
      spo2: { normalMin: Number(spo2Min) },
      temperature: { normalMin: Number(tempMin), normalMax: Number(tempMax) },
      systolic: { normalMin: Number(sysMin), normalMax: Number(sysMax) },
      diastolic: { normalMin: Number(diaMin), normalMax: Number(diaMax) }
    };

    try {
      await updateThresholds(patientId, payload);
      setSuccessMsg('Vitals thresholds updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (e) {
      setErrors({ global: 'Failed to update thresholds. Please check connection.' });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 9950,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '540px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '20px',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            width: '32px',
            height: '32px',
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
          title="Close Settings"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '2rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
          }}>
            <Sliders size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Customize Vitals Target Ranges
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Patient: <strong style={{ color: 'var(--text-main)' }}>{patientName}</strong> ({patientId})
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          fontSize: '0.78rem',
          color: '#475569',
          lineHeight: '1.4'
        }}>
          Customize target ranges based on this patient's clinical baseline. Values outside normal target will trigger <strong>ATTENTION</strong> alerts. Values exceeding safety limits will trigger <strong>CRITICAL</strong> emergency alerts.
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* SpO2 */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Oxygen Saturation (SpO₂) Target Min
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Safety limit: &ge;{BOUNDS.spo2.min}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                value={spo2Min}
                onChange={e => setSpo2Min(e.target.value)}
                style={{
                  width: '120px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.spo2 ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>%</span>
            </div>
            {errors.spo2 && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.spo2}</p>}
          </div>

          {/* Heart Rate */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Heart Rate Target Range
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Safety limits: {BOUNDS.heartRate.min} - {BOUNDS.heartRate.max} BPM
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={hrMin}
                onChange={e => setHrMin(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.hr ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={hrMax}
                onChange={e => setHrMax(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.hr ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>BPM</span>
            </div>
            {errors.hr && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.hr}</p>}
          </div>

          {/* Temperature */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Body Temperature Target Range
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Safety limits: {BOUNDS.temperature.min} - {BOUNDS.temperature.max}°C
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                step="0.1"
                placeholder="Min"
                value={tempMin}
                onChange={e => setTempMin(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.temp ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                step="0.1"
                placeholder="Max"
                value={tempMax}
                onChange={e => setTempMax(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.temp ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>°C</span>
            </div>
            {errors.temp && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.temp}</p>}
          </div>

          {/* Blood Pressure - Systolic */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Systolic Blood Pressure Target Range
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Safety limits: {BOUNDS.systolic.min} - {BOUNDS.systolic.max} mmHg
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={sysMin}
                onChange={e => setSysMin(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.sys ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={sysMax}
                onChange={e => setSysMax(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.sys ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mmHg</span>
            </div>
            {errors.sys && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.sys}</p>}
          </div>

          {/* Blood Pressure - Diastolic */}
          <div style={{ paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Diastolic Blood Pressure Target Range
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Safety limits: {BOUNDS.diastolic.min} - {BOUNDS.diastolic.max} mmHg
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={diaMin}
                onChange={e => setDiaMin(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.dia ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={diaMax}
                onChange={e => setDiaMax(e.target.value)}
                style={{
                  width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px',
                  border: errors.dia ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mmHg</span>
            </div>
            {errors.dia && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.dia}</p>}
          </div>

        </div>

        {/* Global Errors / Success */}
        {errors.global && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            <AlertTriangle size={14} />
            <span>{errors.global}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.82rem', marginTop: '0.25rem', backgroundColor: '#ecfdf5', padding: '0.5rem', borderRadius: '6px' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Target Ranges
          </button>
        </div>

      </div>
    </div>
  );
};
