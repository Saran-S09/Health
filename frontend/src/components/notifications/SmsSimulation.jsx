import React, { useState } from 'react';
import { Smartphone, Send, ShieldAlert, CheckCircle, X, Wifi, Battery, Signal, User, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const SmsSimulation = ({ isOpen, onClose }) => {
  const { smsLogs, addAlertNotification } = useNotification();
  const [customText, setCustomText] = useState('');
  const [localSmsLogs, setLocalSmsLogs] = useState([]);

  if (!isOpen) return null;

  // Merge context logs with local interactive test messages
  const allLogs = [...localSmsLogs, ...smsLogs];

  const handleSendCustomSms = (textToSend) => {
    const text = textToSend || customText;
    if (!text.trim()) return;

    const newSms = {
      id: `SMS-MANUAL-${Date.now()}`,
      fromPhone: '7598974652',
      toPhone: '+91 90955 21570',
      message: text,
      type: text.includes('CRITICAL') || text.includes('🚨') ? 'CRITICAL ALERT' : 'ATTENTION ALERT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'DELIVERED (Carrier Network)'
    };

    setLocalSmsLogs(prev => [newSms, ...prev]);
    setCustomText('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(10px)',
      zIndex: 9500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Mobile Smartphone Frame Wrapper */}
      <div style={{
        maxWidth: '420px',
        width: '100%',
        height: '760px',
        maxHeight: '92vh',
        backgroundColor: '#f8fafc',
        borderRadius: '40px',
        border: '10px solid #0f172a',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>

        {/* Top Speaker & Camera Notch Bar */}
        <div style={{
          width: '130px',
          height: '20px',
          backgroundColor: '#0f172a',
          borderRadius: '0 0 14px 14px',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '40px', height: '4px', backgroundColor: '#334155', borderRadius: '2px' }}></div>
        </div>

        {/* Mobile Status Bar */}
        <div style={{
          padding: '0.6rem 1.25rem 0.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#0f172a',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 20
        }}>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Signal size={12} />
            <span style={{ fontSize: '0.65rem' }}>5G</span>
            <Battery size={14} />
          </div>
        </div>

        {/* SMS App Header */}
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>CareLink Emergency SMS</h4>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>VERIFIED</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'var(--font-mono)' }}>
                Sender: <strong>7598974652</strong> • Receiver: <strong>9095521570</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close Phone Screen"
          >
            <X size={18} />
          </button>
        </div>

        {/* SMS Message Thread View */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          backgroundColor: '#f1f5f9',
          backgroundImage: 'radial-gradient(#cbd5e1 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '1rem'
        }}>
          {allLogs.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', padding: '2rem 1rem', color: '#64748b' }}>
              <Smartphone size={38} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>No Mobile SMS Messages Yet</h4>
              <p style={{ fontSize: '0.78rem', marginTop: '4px', lineHeight: '1.4' }}>
                When patient vitals drop or severe alerts occur, SMS messages from <strong>7598974652</strong> will appear here as text message bubbles sent to <strong>+91 90955 21570</strong>.
              </p>
            </div>
          ) : (
            allLogs.map(sms => {
              const isCritical = sms.type ? sms.type.includes('CRITICAL') : false;

              return (
                <div key={sms.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '88%' }}>
                  
                  {/* Sender Label */}
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', marginBottom: '3px', marginLeft: '4px', fontFamily: 'var(--font-mono)' }}>
                    📱 FROM: {sms.fromPhone || '7598974652'} → TO: {sms.toPhone || '+91 90955 21570'}
                  </span>

                  {/* SMS Bubble */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${isCritical ? '#fca5a5' : '#fde68a'}`,
                    borderLeft: `5px solid ${isCritical ? '#ef4444' : '#d97706'}`,
                    borderRadius: '16px 16px 16px 4px',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                    position: 'relative'
                  }}>
                    {/* Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: isCritical ? '#fef2f2' : '#fffbeb',
                        color: isCritical ? '#dc2626' : '#b45309'
                      }}>
                        {isCritical ? '🚨 CRITICAL SMS ALERT' : '⚠️ ATTENTION SMS ALERT'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {sms.timestamp}
                      </span>
                    </div>

                    {/* Text Message Content */}
                    <p style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      lineHeight: '1.45',
                      margin: 0
                    }}>
                      {sms.message}
                    </p>

                    {/* Delivery Receipt */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      paddingTop: '0.35rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.68rem',
                      color: '#64748b'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#059669', fontWeight: 700 }}>
                        <CheckCircle size={12} /> {sms.deliveryStatus || 'DELIVERED (Carrier SMS)'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {sms.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick SMS Presets Toolbar & Composer */}
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          zIndex: 20
        }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
            <button
              onClick={() => handleSendCustomSms("🚨 CareLink Emergency Alert: Saran Kumar's SpO2 fell to 88%! Guardian mobile 9095521570 notified.")}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              + Send SpO₂ Alert SMS
            </button>
            <button
              onClick={() => handleSendCustomSms("⚠️ CareLink Warning: Saran Kumar Heart Rate elevated to 118 BPM. Check patient status.")}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: '12px',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              + Send HR Warning SMS
            </button>
          </div>

          {/* Text Message Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCustomSms();
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              placeholder="Send text message to +91 90955 21570..."
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.85rem',
                borderRadius: '20px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#0f172a',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Send Text Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
