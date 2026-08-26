import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  LineChart, 
  Bell, 
  ShieldAlert, 
  Sliders, 
  User, 
  UserCheck, 
  ClipboardList,
  Stethoscope,
  Heart,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export const Sidebar = ({ onOpenSimulator, isMobileMenuOpen, onCloseMobileMenu }) => {
  const { currentUser, logout } = useAuth();
  const { evaluation } = usePatient();

  const isCritical = evaluation?.status === 'CRITICAL';

  // Define nav links per role
  let navItems = [];

  if (currentUser.role === 'patient') {
    navItems = [
      { to: '/', label: 'Overview Dashboard', icon: Activity },
      { to: '/vitals', label: 'Telemetry & Tuner', icon: Sliders },
      { to: '/history', label: 'Vitals Analytics', icon: LineChart },
      { to: '/careteam', label: 'Care Team', icon: Users },
      { to: '/alerts', label: 'Alert History', icon: ShieldAlert }
    ];
  } else if (currentUser.role === 'doctor') {
    navItems = [
      { to: '/doctor-dashboard', label: 'Doctor Overview', icon: Stethoscope },
      { to: '/doctor-patients', label: 'Connected Patients', icon: Users },
      { to: '/doctor-requests', label: 'Connection Requests', icon: UserCheck },
      { to: '/history', label: 'Patient Telemetry', icon: LineChart },
      { to: '/alerts', label: 'Critical Alerts', icon: ShieldAlert }
    ];
  } else if (currentUser.role === 'nurse') {
    navItems = [
      { to: '/nurse-dashboard', label: 'Nurse Triage Board', icon: Heart },
      { to: '/nurse-patients', label: 'Assigned Patients', icon: Users },
      { to: '/nurse-requests', label: 'Patient Requests', icon: UserCheck },
      { to: '/alerts', label: 'Ward Alert Log', icon: ShieldAlert }
    ];
  } else if (currentUser.role === 'guardian') {
    navItems = [
      { to: '/guardian-dashboard', label: 'Guardian Monitor', icon: Heart },
      { to: '/careteam', label: 'Patient Care Team', icon: Users },
      { to: '/history', label: 'Vitals History', icon: LineChart },
      { to: '/alerts', label: 'Alert Audit Log', icon: ShieldAlert }
    ];
  }

  return (
    <>
    {isMobileMenuOpen && <button className="app-mobile-menu-backdrop" onClick={onCloseMobileMenu} aria-label="Close navigation menu" />}
    <aside className={`app-sidebar${isMobileMenuOpen ? ' is-mobile-open' : ''}`} style={{
      width: '240px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <div className="app-sidebar-nav-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="app-sidebar-title" style={{
          padding: '0.5rem 0.75rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-dim)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Navigation ({currentUser.role.toUpperCase()})
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobileMenu}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                border: isActive ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.7rem 0.9rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#ef4444',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            marginTop: '1rem',
            transition: 'all 0.15s ease'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Simulator Shortcut Panel in Sidebar */}
      <div className="app-sidebar-simulator" style={{
        marginTop: '2rem',
        padding: '1rem',
        borderRadius: '12px',
        backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-glass)',
        border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {isCritical ? '🚨 Critical Alert Active' : 'Sensor Telemetry'}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Simulate normal, attention & critical values for demo.
        </p>
        <button
          onClick={onOpenSimulator}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', fontSize: '0.78rem' }}
        >
          <Sliders size={14} /> Open Simulator
        </button>
      </div>
    </aside>
    </>
  );
};
