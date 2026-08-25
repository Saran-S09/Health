import React from 'react';
import { UserCheck, Shield, Phone, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const CareTeamCard = ({ member, onRemove }) => {
  const isDoctor = member.role === "Doctor";
  const isNurse = member.role === "Nurse";
  const isGuardian = member.role === "Guardian";

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: isDoctor ? 'rgba(2, 132, 199, 0.12)' : isNurse ? 'rgba(13, 148, 136, 0.12)' : 'rgba(124, 58, 237, 0.12)',
            border: `1px solid ${isDoctor ? 'var(--primary)' : isNurse ? 'var(--accent-teal)' : 'var(--accent-purple)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDoctor ? 'var(--primary)' : isNurse ? 'var(--accent-teal)' : 'var(--accent-purple)',
            fontWeight: 800
          }}>
            {member.name.charAt(0)}
          </div>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {member.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {member.role} • <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{member.id}</strong>
            </span>
          </div>
        </div>

        <StatusBadge status={member.status || "CONNECTED"} size="sm" />
      </div>

      {/* Account vs Non-Account Guardian Badge */}
      {isGuardian && (
        <div style={{
          fontSize: '0.75rem',
          padding: '0.45rem 0.65rem',
          borderRadius: '6px',
          backgroundColor: member.hasAccount ? 'var(--status-normal-bg)' : 'var(--status-attention-bg)',
          border: `1px solid ${member.hasAccount ? 'var(--status-normal-border)' : 'var(--status-attention-border)'}`,
          color: member.hasAccount ? '#059669' : '#b45309',
          fontWeight: 700,
          marginBottom: '0.85rem'
        }}>
          {member.hasAccount ? 'Guardian Account: CONNECTED (In-App + Alarm Enabled)' : `Guardian Mobile: SMS ENABLED (${member.phone || '9095521570'})`}
        </div>
      )}

      {/* Contact Options */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <a
          href={`tel:${member.phone}`}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, fontSize: '0.78rem' }}
        >
          <Phone size={13} /> {member.phone || "Call Member"}
        </a>
        <button
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem' }}
        >
          <MessageSquare size={13} /> Message
        </button>
      </div>
    </div>
  );
};
