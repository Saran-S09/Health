import React from 'react';
import { Activity, Users, ShieldAlert, Sliders, LineChart, Plus, HeartPulse } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { VitalCard } from '../components/vitals/VitalCard';
import { CareTeamCard } from '../components/careteam/CareTeamCard';
import { GuardianNotification } from '../components/notifications/GuardianNotification';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';

export const PatientDashboard = ({ onOpenSimulator, onOpenAddMember }) => {
  const { vitals, evaluation, patientProfile, careTeam, thresholds, sensorConnected } = usePatient();
  const isCritical = evaluation.status === 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Supplementary Monitoring Clinical Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 15px rgba(2, 132, 199, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <HeartPulse size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Welcome back, {patientProfile.name}
              </h2>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: 'var(--primary-hover)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                ID: {patientProfile.id}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {patientProfile.surgery} • {patientProfile.roomNo}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }} className="app-dashboard-actions">
          <button onClick={onOpenSimulator} className="btn btn-primary">
            <Sliders size={16} /> Sensor Simulator
          </button>
          <Link to="/history" className="btn btn-secondary">
            <LineChart size={16} /> View Analytics
          </Link>
        </div>
      </div>

      {/* Emergency Guardian Notification Banner if ATTENTION or CRITICAL */}
      <GuardianNotification />

      {/* Vitals Telemetry Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Live Telemetry Vitals
            </h3>
            <span className="pulse-indicator green" style={{ marginLeft: '4px' }}></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {sensorConnected ? (
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                ESP32 Online
              </span>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-dim)', display: 'inline-block' }}></span>
                ESP32 Offline (Simulated)
              </span>
            )}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Last Update: {vitals.lastUpdated}
            </span>
          </div>
        </div>

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
            isCritical={vitals.heartRate < thresholds.heartRate.criticalMin || vitals.heartRate > thresholds.heartRate.criticalMax}
          />

          <VitalCard
            title="SpO₂ Saturation"
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
            isCritical={vitals.spo2 < thresholds.spo2.criticalMin}
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
            isCritical={vitals.temperature < thresholds.temperature.criticalMin || vitals.temperature > thresholds.temperature.criticalMax}
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
            isCritical={
              vitals.systolic < thresholds.systolic.criticalMin || vitals.systolic >= thresholds.systolic.criticalMax ||
              vitals.diastolic < thresholds.diastolic.criticalMin || vitals.diastolic >= thresholds.diastolic.criticalMax
            }
          />
        </div>
      </div>

      {/* Care Team Section */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Connected Care Team
            </h3>
          </div>

          <button onClick={onOpenAddMember} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Add Care Member
          </button>
        </div>

        <div className="grid-3">
          {careTeam.map(member => (
            <CareTeamCard key={member.id} member={member} />
          ))}
        </div>
      </div>

    </div>
  );
};
