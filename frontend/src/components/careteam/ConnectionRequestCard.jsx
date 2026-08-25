import React from 'react';
import { UserCheck, Check, X, Clock } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ConnectionRequestCard = ({ request, onRespond }) => {
  const isPending = request.status === 'PENDING';

  return (
    <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '0.75rem', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(2, 132, 199, 0.12)',
            color: 'var(--primary)'
          }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {request.senderName} ({request.senderRole.toUpperCase()})
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              CareLink ID: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{request.senderId}</strong> • {request.timestamp}
            </p>
          </div>
        </div>

        {isPending ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onRespond(request.id, false)}
              className="btn btn-secondary btn-sm"
              style={{ color: '#dc2626' }}
            >
              <X size={14} /> Decline
            </button>
            <button
              onClick={() => onRespond(request.id, true)}
              className="btn btn-success btn-sm"
            >
              <Check size={14} /> Accept Request
            </button>
          </div>
        ) : (
          <StatusBadge status={request.status} size="sm" />
        )}
      </div>
    </div>
  );
};
