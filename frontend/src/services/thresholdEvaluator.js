/**
 * Threshold Evaluator Service for CareLink Telemetry
 * Evaluates patient vitals against medical supplementary monitoring ranges.
 * 
 * States:
 * - NORMAL: Within target range.
 * - ATTENTION: Crossed low/high warning boundaries. Requires care team review.
 * - CRITICAL: Reached critical emergency levels. Triggers immediate escalation.
 */

export const VITAL_THRESHOLDS = {
  heartRate: {
    name: "Heart Rate",
    unit: "BPM",
    normalMin: 60,
    normalMax: 100,
    attentionMin: 50,
    attentionMax: 120,
    // Below 50 or above 120 is CRITICAL
  },
  spo2: {
    name: "SpO₂",
    unit: "%",
    normalMin: 95,
    normalMax: 100,
    attentionMin: 90,
    attentionMax: 94,
    // Below 90% is CRITICAL
  },
  temperature: {
    name: "Body Temperature",
    unit: "°C",
    normalMin: 36.5,
    normalMax: 37.5,
    attentionMin: 35.5,
    attentionMax: 38.5,
    // Above 38.5 or below 35.5 is CRITICAL
  },
  systolic: {
    name: "Systolic Blood Pressure",
    unit: "mmHg",
    normalMin: 90,
    normalMax: 120,
    attentionMin: 80,
    attentionMax: 139,
    // >140 or <80 is CRITICAL
  },
  diastolic: {
    name: "Diastolic Blood Pressure",
    unit: "mmHg",
    normalMin: 60,
    normalMax: 80,
    attentionMin: 55,
    attentionMax: 89,
    // >90 or <55 is CRITICAL
  }
};

export const evaluateVitals = (vitals, thresholds) => {
  const issues = [];
  let highestSeverity = "NORMAL"; // NORMAL -> ATTENTION -> CRITICAL

  const { heartRate, spo2, temperature, systolic, diastolic } = vitals;

  const t = thresholds || {
    heartRate: { normalMin: 60, normalMax: 100, criticalMin: 50, criticalMax: 120 },
    spo2: { normalMin: 95, criticalMin: 90 },
    temperature: { normalMin: 36.5, normalMax: 37.5, criticalMin: 35.0, criticalMax: 38.5 },
    systolic: { normalMin: 90, normalMax: 120, criticalMin: 85, criticalMax: 140 },
    diastolic: { normalMin: 60, normalMax: 80, criticalMin: 55, criticalMax: 90 }
  };

  // 1. SpO₂ Evaluation
  if (spo2 < t.spo2.criticalMin) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "SpO₂", val: `${spo2}%`, severity: "CRITICAL", msg: `SpO₂ critically low (< ${t.spo2.criticalMin}%). High risk of hypoxia.` });
  } else if (spo2 >= t.spo2.criticalMin && spo2 < t.spo2.normalMin) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "SpO₂", val: `${spo2}%`, severity: "ATTENTION", msg: `SpO₂ reading outside optimal target range (${t.spo2.criticalMin}-${t.spo2.normalMin - 1}%).` });
  }

  // 2. Heart Rate Evaluation
  if (heartRate < t.heartRate.criticalMin || heartRate > t.heartRate.criticalMax) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Heart Rate", val: `${heartRate} BPM`, severity: "CRITICAL", msg: `Heart rate critical (${heartRate} BPM).` });
  } else if ((heartRate >= t.heartRate.criticalMin && heartRate < t.heartRate.normalMin) || (heartRate > t.heartRate.normalMax && heartRate <= t.heartRate.criticalMax)) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Heart Rate", val: `${heartRate} BPM`, severity: "ATTENTION", msg: `Heart rate border range (${heartRate} BPM).` });
  }

  // 3. Temperature Evaluation
  if (temperature > t.temperature.criticalMax || temperature < t.temperature.criticalMin) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Temperature", val: `${temperature}°C`, severity: "CRITICAL", msg: `Body temperature critical (${temperature}°C).` });
  } else if ((temperature >= t.temperature.normalMax && temperature <= t.temperature.criticalMax) || (temperature >= t.temperature.criticalMin && temperature < t.temperature.normalMin)) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Temperature", val: `${temperature}°C`, severity: "ATTENTION", msg: `Low-grade fever or mild hypothermia detected (${temperature}°C).` });
  }

  // 4. Blood Pressure Evaluation
  let bpCritical = false;
  let bpAttention = false;

  if (systolic < t.systolic.criticalMin || systolic >= t.systolic.criticalMax) {
    bpCritical = true;
  } else if ((systolic >= t.systolic.criticalMin && systolic < t.systolic.normalMin) || (systolic > t.systolic.normalMax && systolic < t.systolic.criticalMax)) {
    bpAttention = true;
  }

  if (diastolic < t.diastolic.criticalMin || diastolic >= t.diastolic.criticalMax) {
    bpCritical = true;
  } else if ((diastolic >= t.diastolic.criticalMin && diastolic < t.diastolic.normalMin) || (diastolic > t.diastolic.normalMax && diastolic < t.diastolic.criticalMax)) {
    bpAttention = true;
  }

  if (bpCritical) {
    highestSeverity = "CRITICAL";
    issues.push({ vital: "Blood Pressure", val: `${systolic}/${diastolic} mmHg`, severity: "CRITICAL", msg: `Blood Pressure in critical range (${systolic}/${diastolic} mmHg).` });
  } else if (bpAttention) {
    if (highestSeverity !== "CRITICAL") highestSeverity = "ATTENTION";
    issues.push({ vital: "Blood Pressure", val: `${systolic}/${diastolic} mmHg`, severity: "ATTENTION", msg: `Elevated Blood Pressure (${systolic}/${diastolic} mmHg). Monitoring recommended.` });
  }

  return {
    status: highestSeverity,
    issues: issues,
    hasAlert: highestSeverity !== "NORMAL",
    summary: highestSeverity === "CRITICAL"
      ? "🚨 CRITICAL ALERT: Immediate medical review may be required."
      : highestSeverity === "ATTENTION"
      ? "⚠️ ATTENTION REQUIRED: Monitored vital reading outside configured target range."
      : "● All vitals within normal target monitoring range."
  };
};
