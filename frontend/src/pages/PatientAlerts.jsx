import React from 'react';
import { ShieldAlert, PhoneCall, CheckCircle, Clock } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const PatientAlerts = () => {
  const { notifications, emergencyAudit } = useNotification();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Alert & Emergency Action Audit History
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Audit trail for telemetry threshold alerts and emergency call dispatches
        </p>
      </div>

      {/* Emergency Action Audit Section */}
      {emergencyAudit.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'var(--status-critical-border)', backgroundColor: '#ffffff' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--status-critical)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={18} /> Emergency Call Audit Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {emergencyAudit.map(audit => (
              <div key={audit.id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--status-critical-bg)', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.82rem', border: '1px solid var(--status-critical-border)' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{audit.action}</strong> ({audit.patientName} - {audit.patientId})
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{audit.timestamp} • {audit.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Alert History Feed */}
      <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} color="var(--primary)" /> Chronological Telemetry Alert Feed
        </h3>

        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No alerts logged in history yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: n.severity === 'CRITICAL' ? 'var(--status-critical-bg)' : n.severity === 'ATTENTION' ? 'var(--status-attention-bg)' : '#f8fafc',
                border: `1px solid ${n.severity === 'CRITICAL' ? 'var(--status-critical-border)' : n.severity === 'ATTENTION' ? 'var(--status-attention-border)' : 'var(--border-color)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{n.title}</span>
                    <StatusBadge status={n.severity || n.status} size="sm" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {n.summary}
                </p>
                {n.careTeamNotified && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                    Notified Care Team: {n.careTeamNotified.join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
