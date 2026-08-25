import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { EmergencyCallModal } from './components/common/EmergencyCallModal';
import { SensorSimulator } from './components/vitals/SensorSimulator';
import { AddCareMemberModal } from './components/careteam/AddCareMemberModal';
import { NotificationPanel } from './components/notifications/NotificationPanel';
import { SmsSimulation } from './components/notifications/SmsSimulation';

import { PatientDashboard } from './pages/PatientDashboard';
import { PatientVitals } from './pages/PatientVitals';
import { PatientHistory } from './pages/PatientHistory';
import { PatientAlerts } from './pages/PatientAlerts';
import { PatientCareTeam } from './pages/PatientCareTeam';

import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorPatients } from './pages/DoctorPatients';
import { DoctorRequests } from './pages/DoctorRequests';

import { NurseDashboard } from './pages/NurseDashboard';
import { NursePatients } from './pages/NursePatients';
import { NurseRequests } from './pages/NurseRequests';

import { GuardianDashboard } from './pages/GuardianDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const AppContent = () => {
  const { currentUser } = useAuth();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSmsDrawerOpen, setIsSmsDrawerOpen] = useState(false);

  // If user is not authenticated, show only Login or Register route
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Main App Navigation */}
      <Navbar onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)} />

      <div className="main-layout" style={{ paddingTop: 0 }}>
        <Sidebar onOpenSimulator={() => setIsSimulatorOpen(true)} />

        <main className="content-area">
          <Routes>
            {/* Patient Routes */}
            <Route path="/" element={<PatientDashboard onOpenSimulator={() => setIsSimulatorOpen(true)} onOpenAddMember={() => setIsAddMemberOpen(true)} />} />
            <Route path="/vitals" element={<PatientVitals onOpenSimulator={() => setIsSimulatorOpen(true)} />} />
            <Route path="/history" element={<PatientHistory />} />
            <Route path="/alerts" element={<PatientAlerts />} />
            <Route path="/careteam" element={<PatientCareTeam onOpenAddMember={() => setIsAddMemberOpen(true)} />} />

            {/* Doctor Routes */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard onOpenSimulator={() => setIsSimulatorOpen(true)} />} />
            <Route path="/doctor-patients" element={<DoctorPatients />} />
            <Route path="/doctor-requests" element={<DoctorRequests />} />

            {/* Nurse Routes */}
            <Route path="/nurse-dashboard" element={<NurseDashboard onOpenSimulator={() => setIsSimulatorOpen(true)} />} />
            <Route path="/nurse-patients" element={<NursePatients />} />
            <Route path="/nurse-requests" element={<NurseRequests />} />

            {/* Guardian Routes */}
            <Route path="/guardian-dashboard" element={<GuardianDashboard onOpenSimulator={() => setIsSimulatorOpen(true)} onOpenSmsDrawer={() => setIsSmsDrawerOpen(true)} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <EmergencyCallModal />
      <SensorSimulator isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
      <AddCareMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} />
      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <SmsSimulation isOpen={isSmsDrawerOpen} onClose={() => setIsSmsDrawerOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PatientProvider>
          <Router>
            <AppContent />
          </Router>
        </PatientProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
