import React from 'react';
import { Activity, Bell, Shield, User, HeartPulse, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { usePatient } from '../../context/PatientContext';
import { StatusBadge } from './StatusBadge';

export const Navbar = ({ onToggleNotifications, onToggleMenu, isMobileMenuOpen }) => {
  const { currentUser } = useAuth();
  const { unreadCount } = useNotification();
  const { evaluation } = usePatient();

  if (!currentUser) return null;

  return (
    <header className="app-navbar" style={{
      height: '64px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: '0px',
      zIndex: 8000
    }}>
      <button
        className="app-mobile-menu-button"
        onClick={onToggleMenu}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* Brand & System Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 15px rgba(2, 132, 199, 0.2)'
        }}>
          <HeartPulse size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            CareLink <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>RPM</span>
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Post-Operative Remote Patient Monitoring Platform
          </p>
        </div>
      </div>

      {/* Monitoring Telemetry Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="app-navbar-hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Telemetry System:</span>
          <StatusBadge status={evaluation?.status || 'NORMAL'} size="sm" />
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onToggleNotifications}
          style={{
            position: 'relative',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-secondary)'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Logged in User Identity */}
        <div className="app-navbar-hide-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <img
            src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
            alt={currentUser.name}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary)'
            }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              ID: {currentUser.id}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
