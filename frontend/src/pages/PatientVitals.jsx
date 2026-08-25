import React from 'react';
import { Sliders, Activity, Heart, Thermometer, Gauge, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { VitalCard } from '../components/vitals/VitalCard';

export const PatientVitals = ({ onOpenSimulator }) => {
  const { vitals, evaluation, thresholds } = usePatient();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Telemetry & Vital Threshold Configuration
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time metric assessment rules & target supplementary monitoring parameters
          </p>
        </div>

        <button onClick={onOpenSimulator} className="btn btn-primary">
          <Sliders size={16} /> Open Sensor Tuner
        </button>
      </div>

      {/* Live Vitals Grid */}
      <div className="grid-4">
        <VitalCard
          title="Heart Rate"
          value={vitals.heartRate}
          unit="BPM"
          status={
            vitals.heartRate < thresholds.heartRate.criticalMin || vitals.heartRate > thresholds.heartRate.criticalMax
              ? 'CRITICAL'
              : vitals.heartRate < thresholds.heartRate.normalMin || vitals.heartRate > thresholds.heartRate.normalMax
              ? 'ATTENTION'
              : 'NORMAL'
          }
          targetRange={`${thresholds.heartRate.normalMin} - ${thresholds.heartRate.normalMax} BPM`}
          lastUpdated={vitals.lastUpdated}
          iconType="hr"
        />

        <VitalCard
          title="SpO₂ Oxygen"
          value={`${vitals.spo2}%`}
          unit="Oxygen"
          status={
            vitals.spo2 < thresholds.spo2.criticalMin
              ? 'CRITICAL'
              : vitals.spo2 < thresholds.spo2.normalMin
              ? 'ATTENTION'
              : 'NORMAL'
          }
          targetRange={`≥ ${thresholds.spo2.normalMin}%`}
          lastUpdated={vitals.lastUpdated}
          iconType="spo2"
        />

        <VitalCard
          title="Body Temperature"
          value={`${vitals.temperature}°C`}
          unit="Celsius"
          status={
            vitals.temperature < thresholds.temperature.criticalMin || vitals.temperature > thresholds.temperature.criticalMax
              ? 'CRITICAL'
              : vitals.temperature < thresholds.temperature.normalMin || vitals.temperature > thresholds.temperature.normalMax
              ? 'ATTENTION'
              : 'NORMAL'
          }
          targetRange={`${thresholds.temperature.normalMin} - ${thresholds.temperature.normalMax} °C`}
          lastUpdated={vitals.lastUpdated}
          iconType="temp"
        />

        <VitalCard
          title="Blood Pressure"
          value={`${vitals.systolic}/${vitals.diastolic}`}
          unit="mmHg"
          status={
            vitals.systolic < thresholds.systolic.criticalMin || vitals.systolic >= thresholds.systolic.criticalMax ||
            vitals.diastolic < thresholds.diastolic.criticalMin || vitals.diastolic >= thresholds.diastolic.criticalMax
              ? 'CRITICAL'
              : (vitals.systolic < thresholds.systolic.normalMin || vitals.systolic > thresholds.systolic.normalMax ||
                 vitals.diastolic < thresholds.diastolic.normalMin || vitals.diastolic > thresholds.diastolic.normalMax)
              ? 'ATTENTION'
              : 'NORMAL'
          }
          targetRange={`${thresholds.systolic.normalMin}-${thresholds.systolic.normalMax}/${thresholds.diastolic.normalMin}-${thresholds.diastolic.normalMax} mmHg`}
          lastUpdated={vitals.lastUpdated}
          iconType="bp"
        />
      </div>

      {/* Monitoring Range Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Configured Clinical Supplementary Monitoring Thresholds
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem' }}>Vital Metric</th>
              <th style={{ padding: '0.75rem' }}>● Normal Target</th>
              <th style={{ padding: '0.75rem' }}>⚠️ Attention Warning</th>
              <th style={{ padding: '0.75rem' }}>🚨 Critical Emergency</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>SpO₂ Oxygen Saturation</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-normal)', fontWeight: 700 }}>{thresholds.spo2.normalMin}% – 100%</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-attention)', fontWeight: 700 }}>{thresholds.spo2.criticalMin}% – {thresholds.spo2.normalMin - 1}%</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-critical)', fontWeight: 700 }}>&lt; {thresholds.spo2.criticalMin}%</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Heart Rate</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-normal)', fontWeight: 700 }}>{thresholds.heartRate.normalMin} – {thresholds.heartRate.normalMax} BPM</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-attention)', fontWeight: 700 }}>{thresholds.heartRate.criticalMin}–{thresholds.heartRate.normalMin - 1} / {thresholds.heartRate.normalMax + 1}–{thresholds.heartRate.criticalMax} BPM</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-critical)', fontWeight: 700 }}>&lt; {thresholds.heartRate.criticalMin} or &gt; {thresholds.heartRate.criticalMax} BPM</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Body Temperature</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-normal)', fontWeight: 700 }}>{thresholds.temperature.normalMin}°C – {thresholds.temperature.normalMax}°C</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-attention)', fontWeight: 700 }}>{thresholds.temperature.normalMax + 0.1}°C–{thresholds.temperature.criticalMax}°C / {thresholds.temperature.criticalMin}°C–{(thresholds.temperature.normalMin - 0.1).toFixed(1)}°C</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-critical)', fontWeight: 700 }}>&gt; {thresholds.temperature.criticalMax}°C or &lt; {thresholds.temperature.criticalMin}°C</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Blood Pressure</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-normal)', fontWeight: 700 }}>{thresholds.systolic.normalMin}-{thresholds.systolic.normalMax} / {thresholds.diastolic.normalMin}-{thresholds.diastolic.normalMax} mmHg</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-attention)', fontWeight: 700 }}>{thresholds.systolic.criticalMin}–{thresholds.systolic.normalMin - 1} or {thresholds.systolic.normalMax + 1}–{thresholds.systolic.criticalMax - 1} mmHg (Sys)</td>
              <td style={{ padding: '0.75rem', color: 'var(--status-critical)', fontWeight: 700 }}>&lt; {thresholds.systolic.criticalMin} or &ge; {thresholds.systolic.criticalMax} (Sys) / &lt; {thresholds.diastolic.criticalMin} or &ge; {thresholds.diastolic.criticalMax} (Dia)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
