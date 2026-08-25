// Historical telemetry simulation data for charts (HR, SpO2, Temp, BP)

export const generateHistoricalData = () => {
  const points = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hours = time.getHours().toString().padStart(2, '0') + ':00';
    
    // Add subtle realistic fluctuations
    const hr = Math.floor(74 + Math.sin(i * 0.5) * 6 + (Math.random() * 4 - 2));
    const spo2 = Math.min(100, Math.floor(98 + (Math.random() * 2 - 1)));
    const temp = parseFloat((36.6 + (Math.sin(i * 0.3) * 0.3) + (Math.random() * 0.2 - 0.1)).toFixed(1));
    const sys = Math.floor(118 + Math.cos(i * 0.4) * 8 + (Math.random() * 4 - 2));
    const dia = Math.floor(78 + Math.cos(i * 0.4) * 4 + (Math.random() * 2 - 1));

    points.push({
      timestamp: hours,
      fullTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: hr,
      spo2: spo2,
      temperature: temp,
      systolic: sys,
      diastolic: dia
    });
  }
  return points;
};

export const INITIAL_VITALS_STATE = {
  heartRate: 78,
  spo2: 98,
  temperature: 36.7,
  systolic: 120,
  diastolic: 80,
  status: "NORMAL", // NORMAL, ATTENTION, CRITICAL
  lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
};
