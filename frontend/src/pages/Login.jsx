import React, { useState } from 'react';
import { HeartPulse, KeyRound, Mail, UserCheck, Shield, Stethoscope, Heart, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('saran@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-configured demo account credentials
  const demoAccounts = [
    {
      role: 'Patient',
      name: 'Saran Kumar',
      id: 'CL-P10234',
      email: 'saran@example.com',
      password: 'password123',
      icon: HeartPulse,
      color: '#0284c7'
    },
    {
      role: 'Doctor',
      name: 'Dr. Kumar Rajan',
      id: 'CL-D1021',
      email: 'dr.kumar@carelink.org',
      password: 'password123',
      icon: Stethoscope,
      color: '#0d9488'
    },
    {
      role: 'Nurse',
      name: 'Nurse Priya Sharma',
      id: 'CL-N2042',
      email: 'priya.n@carelink.org',
      password: 'password123',
      icon: Heart,
      color: '#0891b2'
    },
    {
      role: 'Guardian',
      name: 'Ramesh Kumar',
      id: 'CL-G3045',
      email: 'ramesh.k@example.com',
      password: 'password123',
      icon: Shield,
      color: '#7c3aed'
    }
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Authenticate against Express Backend API
      const response = await apiService.login(email, password);
      login(response.user);
      
      // Navigate to corresponding dashboard
      if (response.user.role === 'doctor') navigate('/doctor-dashboard');
      else if (response.user.role === 'nurse') navigate('/nurse-dashboard');
      else if (response.user.role === 'guardian') navigate('/guardian-dashboard');
      else navigate('/');
    } catch (err) {
      // Fallback for offline client demo
      const matched = demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        const fallbackUser = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role.toLowerCase(),
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
        };
        login(fallbackUser);
        if (fallbackUser.role === 'doctor') navigate('/doctor-dashboard');
        else if (fallbackUser.role === 'nurse') navigate('/nurse-dashboard');
        else if (fallbackUser.role === 'guardian') navigate('/guardian-dashboard');
        else navigate('/');
      } else {
        setError(err.message || "Authentication failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-auth-page" style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="app-login-grid" style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Side: Demo Quick-Login Cards */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Demo User Accounts
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Select a pre-seeded account below to auto-fill credentials for testing:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {demoAccounts.map(acc => {
              const Icon = acc.icon;
              const isSelected = email === acc.email;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleQuickFill(acc)}
                  className="app-demo-account glass-panel"
                  style={{
                    padding: '0.85rem 1.1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: isSelected ? `2px solid ${acc.color}` : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 15px rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.5rem',
                      borderRadius: '10px',
                      backgroundColor: `${acc.color}15`,
                      color: acc.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {acc.name} <span style={{ fontSize: '0.72rem', color: acc.color, fontWeight: 700 }}>({acc.role})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ID: {acc.id} • {acc.email}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: acc.color }}>
                    {isSelected ? 'Selected' : 'Use Account'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="app-login-form glass-panel" style={{ padding: '2.5rem', borderRadius: '20px', backgroundColor: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', margin: '0 auto 0.75rem auto'
            }}>
              <HeartPulse size={26} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>CareLink Account Sign In</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connected to Express Telemetry API Backend</p>
          </div>

          {error && (
            <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email Address:</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Password:</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.4rem', fontSize: '0.95rem' }}>
              {loading ? 'Authenticating...' : 'Sign In to CareLink'} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Need a new patient or provider account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Register Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
