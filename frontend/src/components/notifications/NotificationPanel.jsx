import React from 'react';
import { Bell, CheckCheck, ShieldAlert, UserCheck, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../common/StatusBadge';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAllAsRead, markAsRead } = useNotification();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '124px',
      right: '2rem',
      width: '380px',
      maxHeight: '520px',
      zIndex: 8500
    }} className="glass-panel app-notification-panel">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="#38bdf8" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>Notification Center</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={markAllAsRead}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Mark all read
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No notifications available.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                backgroundColor: n.read ? 'transparent' : 'var(--primary-light)',
                border: `1px solid ${n.read ? 'var(--border-color)' : 'rgba(2, 132, 199, 0.3)'}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {n.title}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {n.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
