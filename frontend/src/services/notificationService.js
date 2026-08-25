/**
 * Notification & SMS Dispatch Service
 * Handles notification dispatch to Guardians, Doctors, and Nurses.
 */

export const createAlertNotificationPayload = ({ patient, evaluation, vitals, timestamp }) => {
  const isCritical = evaluation.status === "CRITICAL";

  return {
    id: `ALERT-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    patientRoom: patient.roomNo || patient.room || "Ward 3",
    status: evaluation.status,
    severity: evaluation.status,
    title: isCritical ? "🚨 CRITICAL VITAL ALERT" : "⚠️ ATTENTION REQUIRED",
    issues: evaluation.issues,
    summary: evaluation.summary,
    vitalsSnapshot: { ...vitals },
    timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    careTeamNotified: ["Doctor", "Nurse", "Guardian"]
  };
};

export const createSmsSimulationPayload = ({ phone, patientName, evaluation, vitals }) => {
  const isCritical = evaluation.status === "CRITICAL";
  const primaryIssue = evaluation.issues[0] ? `${evaluation.issues[0].vital} (${evaluation.issues[0].val})` : "Telemetry reading";

  const msgText = isCritical
    ? `🚨 CareLink Critical Alert: Patient ${patientName}'s ${primaryIssue} has reached a critical level. Please check the patient immediately and contact emergency medical assistance if required.`
    : `⚠️ CareLink Alert: Patient ${patientName}'s ${primaryIssue} requires attention. Please check the patient and contact the care team.`;

  return {
    id: `SMS-${Date.now()}`,
    fromPhone: '7598974652',
    toPhone: phone,
    patientName: patientName,
    message: msgText,
    type: isCritical ? "CRITICAL ALERT" : "ATTENTION ALERT",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    deliveryStatus: "SENT (Simulated)"
  };
};
