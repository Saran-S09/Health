import React, { useState } from 'react';
import { UserPlus, Search, PhoneCall, CheckCircle2, X } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

export const AddCareMemberModal = ({ isOpen, onClose }) => {
  const { sendConnectionRequest, addSmsGuardian } = usePatient();
  const [role, setRole] = useState('Doctor'); // Doctor, Nurse, Guardian
  const [searchQuery, setSearchQuery] = useState('');
  const [guardianMode, setGuardianMode] = useState('account'); // 'account' or 'sms'
  const [smsName, setSmsName] = useState('');
  const [smsPhone, setSmsPhone] = useState('+91 90955 21570');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (role === 'Guardian' && guardianMode === 'sms') {
      if (!smsPhone) return;
      addSmsGuardian(smsName || "Emergency Guardian", smsPhone);
    } else {
      sendConnectionRequest({
        name: searchQuery || `${role} Search Result`,
        role: role,
        id: searchQuery.startsWith('CL-') ? searchQuery : `CL-${role.charAt(0)}${Math.floor(1000 + Math.random()*9000)}`,
        phone: "+91 90955 21570"
      });
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSearchQuery('');
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      zIndex: 9600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: '18px', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>Add Care Team Member</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: '#059669', fontWeight: 700 }}>Connection Request Dispatched</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status set to PENDING. Waiting for recipient approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSendRequest}>
            {/* Role Switcher */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Select Role to Connect:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['Doctor', 'Nurse', 'Guardian'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: role === r ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: role === r ? 'rgba(2, 132, 199, 0.12)' : '#f8fafc',
                      color: role === r ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Guardian Mode Toggle */}
            {role === 'Guardian' && (
              <div style={{ marginBottom: '1.25rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  Guardian Account Status:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setGuardianMode('account')}
                    style={{
                      flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px',
                      border: guardianMode === 'account' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: guardianMode === 'account' ? '#ffffff' : 'transparent',
                      color: guardianMode === 'account' ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Registered User (ID Search)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuardianMode('sms')}
                    style={{
                      flex: 1, padding: '0.4rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px',
                      border: guardianMode === 'sms' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: guardianMode === 'sms' ? '#ffffff' : 'transparent',
                      color: guardianMode === 'sms' ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Direct Mobile (+91 SMS Alert)
                  </button>
                </div>
              </div>
            )}

            {role === 'Guardian' && guardianMode === 'sms' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Guardian Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={smsName}
                    onChange={e => setSmsName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    Guardian Mobile Phone (+91):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 90955 21570"
                    value={smsPhone}
                    onChange={e => setSmsPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Automated SMS alerts will be sent from <strong>7598974652</strong> to this mobile number.
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Search by CareLink ID or Name:
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder={`Enter ${role} ID (e.g. CL-${role.charAt(0)}1021) or name...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Two-Way Connection Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
