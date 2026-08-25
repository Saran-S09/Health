// Two-way connection requests dataset

export const INITIAL_REQUESTS = [
  {
    id: "REQ-101",
    senderId: "CL-D1021",
    senderName: "Dr. Kumar Rajan",
    senderRole: "doctor",
    receiverId: "CL-P10234",
    receiverName: "Saran Kumar",
    receiverRole: "patient",
    status: "CONNECTED", // PENDING, CONNECTED, DECLINED
    type: "DOCTOR_PATIENT",
    timestamp: "2026-08-11 09:30 AM"
  },
  {
    id: "REQ-102",
    senderId: "CL-N2042",
    senderName: "Nurse Priya Sharma",
    senderRole: "nurse",
    receiverId: "CL-P10234",
    receiverName: "Saran Kumar",
    receiverRole: "patient",
    status: "CONNECTED",
    type: "NURSE_PATIENT",
    timestamp: "2026-08-11 10:15 AM"
  },
  {
    id: "REQ-103",
    senderId: "CL-P10234",
    senderName: "Saran Kumar",
    senderRole: "patient",
    receiverId: "CL-G3045",
    receiverName: "Ramesh Kumar",
    receiverRole: "guardian",
    status: "CONNECTED",
    type: "PATIENT_GUARDIAN",
    timestamp: "2026-08-10 04:00 PM"
  }
];
