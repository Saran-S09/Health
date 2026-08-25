// Connected patients list for Doctor and Nurse views
export const INITIAL_PATIENTS_LIST = [
  {
    id: "CL-P10234",
    name: "Saran Kumar",
    age: 42,
    gender: "Male",
    room: "Bed 4B, Ward 3",
    surgery: "Post-Op Cardiac Bypass",
    status: "ATTENTION",
    connectedSince: "2026-08-11",
    doctor: "Dr. Kumar Rajan",
    nurse: "Nurse Priya Sharma",
    guardian: "Ramesh Kumar (+91 98765 11223)",
    lastVitals: {
      heartRate: 78,
      spo2: 98,
      temperature: 36.7,
      systolic: 120,
      diastolic: 80
    }
  },
  {
    id: "CL-P10882",
    name: "Ananya Roy",
    age: 58,
    gender: "Female",
    room: "Bed 12A, Ward 2",
    surgery: "Total Knee Replacement",
    status: "NORMAL",
    connectedSince: "2026-08-12",
    doctor: "Dr. Kumar Rajan",
    nurse: "Nurse Priya Sharma",
    guardian: "Suresh Roy (+91 91122 33445)",
    lastVitals: {
      heartRate: 72,
      spo2: 99,
      temperature: 36.5,
      systolic: 118,
      diastolic: 76
    }
  },
  {
    id: "CL-P10499",
    name: "Vikram Malhotra",
    age: 65,
    gender: "Male",
    room: "Bed 02, ICU Recovery",
    surgery: "Abdominal Aortic Repair",
    status: "NORMAL",
    connectedSince: "2026-08-10",
    doctor: "Dr. Kumar Rajan",
    nurse: "Nurse Priya Sharma",
    guardian: "Meena Malhotra (+91 94455 66778)",
    lastVitals: {
      heartRate: 84,
      spo2: 96,
      temperature: 37.1,
      systolic: 130,
      diastolic: 84
    }
  }
];
