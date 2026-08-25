import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { LineChart as LineChartIcon, Heart, Activity, Thermometer, Gauge } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';
import { generateHistoricalData } from '../../data/mockVitals';

export const VitalChart = () => {
  const { historicalData, patientProfile } = usePatient();
  const location = useLocation();
  const [selectedMetric, setSelectedMetric] = useState('spo2'); // spo2, heartRate, temperature, bloodPressure
  const [timeFilter, setTimeFilter] = useState('24h'); // 1h, today, 24h, 7d
  
  const activePatientId = location.state?.selectedPatient?.id || patientProfile?.id || 'CL-P10234';
  const isMainPatient = activePatientId === 'CL-P10234';

  const chartData = useMemo(() => {
    if (isMainPatient) {
      return historicalData;
    }
    // Generate simulated data specific to this visit if it's not the primary real-time monitored patient
    return generateHistoricalData();
  }, [historicalData, isMainPatient, activePatientId]);

  // Metric configuration map
  const metricConfigs = {
    spo2: {
      name: 'SpO₂ Oxygen Saturation',
      dataKey: 'spo2',
      unit: '%',
      color: '#06b6d4',
      domain: [70, 100],
      icon: Activity
    },
    heartRate: {
      name: 'Heart Rate',
      dataKey: 'heartRate',
      unit: 'BPM',
      color: '#f43f5e',
      domain: [40, 150],
      icon: Heart
    },
    temperature: {
      name: 'Body Temperature',
      dataKey: 'temperature',
      unit: '°C',
      color: '#f59e0b',
      domain: [34, 41],
      icon: Thermometer
    },
    bloodPressure: {
      name: 'Systolic Blood Pressure',
      dataKey: 'systolic',
      unit: 'mmHg',
      color: '#8b5cf6',
      domain: [70, 180],
      icon: Gauge
    }
  };

  const currentConfig = metricConfigs[selectedMetric];

  // Slice historical data based on timeFilter
  const getFilteredData = () => {
    if (timeFilter === '1h') return chartData.slice(-6);
    if (timeFilter === 'today') return chartData.slice(-12);
    if (timeFilter === '7d') {
      // Multiply simulated data for 7d view
      return chartData;
    }
    return chartData; // 24h default
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      {/* Chart Header & Selectors */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LineChartIcon size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Telemetry Vital Trends
          </h3>
        </div>

        {/* Metric Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
          {[
            { key: 'spo2', label: 'SpO₂' },
            { key: 'heartRate', label: 'Heart Rate' },
            { key: 'temperature', label: 'Temp' },
            { key: 'bloodPressure', label: 'Blood Pressure' }
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              style={{
                padding: '0.35rem 0.7rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: selectedMetric === m.key ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: selectedMetric === m.key ? metricConfigs[m.key].color : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Time Range Filter */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['1h', 'today', '24h', '7d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: timeFilter === tf ? 'var(--primary)' : 'transparent',
                color: timeFilter === tf ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getFilteredData()}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={12} />
            <YAxis domain={currentConfig.domain} stroke="var(--text-muted)" fontSize={12} unit={currentConfig.unit} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <Area
              type="monotone"
              dataKey={currentConfig.dataKey}
              stroke={currentConfig.color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
