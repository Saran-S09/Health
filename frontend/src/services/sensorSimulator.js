/**
 * Sensor Simulator Engine for CareLink
 * Mimics IoT wireless telemetry hardware sending telemetry to CareLink API.
 */

export const SENSOR_PRESETS = {
  NORMAL: {
    heartRate: 76,
    spo2: 98,
    temperature: 36.7,
    systolic: 120,
    diastolic: 80
  },
  ATTENTION: {
    heartRate: 106,
    spo2: 92,
    temperature: 37.9,
    systolic: 135,
    diastolic: 86
  },
  ATTENTION_SPO2: {
    heartRate: 84,
    spo2: 92,
    temperature: 36.8,
    systolic: 124,
    diastolic: 82
  },
  CRITICAL: {
    heartRate: 135,
    spo2: 84,
    temperature: 39.1,
    systolic: 155,
    diastolic: 98
  },
  CRITICAL_SPO2: {
    heartRate: 108,
    spo2: 88,
    temperature: 37.4,
    systolic: 142,
    diastolic: 92
  },
  CRITICAL_HR: {
    heartRate: 135,
    spo2: 96,
    temperature: 37.0,
    systolic: 138,
    diastolic: 88
  },
  FEVER_ATTENTION: {
    heartRate: 94,
    spo2: 97,
    temperature: 38.1,
    systolic: 126,
    diastolic: 82
  }
};

/**
 * Applies slight organic drift to emulate physical physiological fluctuation
 */
export const applyGradualDrift = (currentVitals) => {
  const driftHR = Math.round(currentVitals.heartRate + (Math.random() * 2 - 1));
  const driftSpO2 = Math.min(100, Math.max(70, Math.round(currentVitals.spo2 + (Math.random() * 1 - 0.5))));
  const driftTemp = parseFloat((currentVitals.temperature + (Math.random() * 0.1 - 0.05)).toFixed(1));
  const driftSys = Math.round(currentVitals.systolic + (Math.random() * 2 - 1));
  const driftDia = Math.round(currentVitals.diastolic + (Math.random() * 2 - 1));

  return {
    ...currentVitals,
    heartRate: driftHR,
    spo2: driftSpO2,
    temperature: driftTemp,
    systolic: driftSys,
    diastolic: driftDia,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
};
