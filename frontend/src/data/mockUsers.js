// Pre-configured demo users for CareLink Multi-Role platform

export const MOCK_PATIENT = {
  id: "CL-P10234",
  name: "Saran Kumar",
  role: "patient",
  email: "saran@example.com",
  phone: "+91 98765 43210",
  age: 42,
  gender: "Male",
  roomNo: "Bed 4B, Ward 3",
  surgery: "Post-Operative Cardiac Bypass (Day 3)",
  admissionDate: "2026-08-10",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
};

export const MOCK_DOCTOR = {
  id: "CL-D1021",
  name: "Dr. Kumar Rajan",
  role: "doctor",
  title: "Chief Cardiac Surgeon, MD",
  email: "dr.kumar@carelink.org",
  phone: "+91 94433 22110",
  hospital: "Metropolitan General Hospital",
  avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250"
};

export const MOCK_NURSE = {
  id: "CL-N2042",
  name: "Nurse Priya Sharma",
  role: "nurse",
  title: "Senior ICU/Post-Op Specialist",
  email: "priya.n@carelink.org",
  phone: "+91 91234 56789",
  department: "Post-Operative Recovery Ward B",
  avatar: "https://images.unsplash.com/photo-1594824813571-215f396469a0?auto=format&fit=crop&q=80&w=250"
};

export const MOCK_GUARDIAN_ACCOUNT = {
  id: "CL-G3045",
  name: "Ramesh Kumar (Brother)",
  role: "guardian",
  hasAccount: true,
  email: "ramesh.k@example.com",
  phone: "+91 90955 21570",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
};

export const MOCK_GUARDIAN_SMS = {
  name: "Lakshmi Kumar (Mother)",
  role: "guardian",
  hasAccount: false,
  phone: "+91 90955 21570"
};
