import React from 'react';
import { Heart, Activity, Thermometer, Gauge } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const VitalCard = ({ 
  title, 
  value, 
  unit, 
  status, 
  targetRange, 
  lastUpdated, 
  iconType,
  isCritical 
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'hr':
        return <Heart size={18} color="#f43f5e" />;
      case 'spo2':
        return <Activity size={18} color="#0284c7" />;
      case 'temp':
        return <Thermometer size={18} color="#d97706" />;
      case 'bp':
      default:
        return <Gauge size={18} color="#7c3aed" />;
    }
  };

  const getStatusColor = () => {
    if (status === 'CRITICAL') return '#dc2626';
    if (status === 'ATTENTION') return '#d97706';
    return '#059669';
  };

  return (
    <div className={`glass-panel glass-panel-hover ${isCritical ? 'animate-critical-flash' : ''}`} style={{
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      borderColor: isCritical ? 'rgba(239, 68, 68, 0.6)' : undefined,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }}>
      {/* Header: Icon + Title on left, Status Badge on right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        minWidth: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '0.4rem',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getIcon()}
          </div>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </span>
        </div>

        <div style={{ flexShrink: 0 }}>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      {/* Primary Value Display */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.35rem',
        margin: '0.25rem 0 0.5rem 0'
      }}>
        <span style={{
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: getStatusColor(),
          letterSpacing: '-0.03em',
          lineHeight: 1.1
        }}>
          {value}
        </span>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}>
          {unit}
        </span>
      </div>

      {/* Target Range & Last Update Footer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        paddingTop: '0.65rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <span style={{ lineHeight: 1.35 }}>
          Target: <strong style={{ color: 'var(--text-main)' }}>{targetRange}</strong>
        </span>
        <span style={{ lineHeight: 1.35 }}>
          Updated: {lastUpdated}
        </span>
      </div>
    </div>
  );
};
