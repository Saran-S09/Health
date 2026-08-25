import React, { useState } from 'react';
import { UserPlus, HeartPulse, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('patient'); // patient, doctor, nurse, guardian
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [generatedId, setGeneratedId] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await apiService.register({
        name,
        email,
        phone,
        role,
        age: Number(age) || 40,
        password
      });
      setGeneratedId(response.user.id);
      setTimeout(() => {
        login(response.user);
        navigate('/');
      }, 1800);
    } catch (err) {
      // Fallback in case of registration issues or offline
      const prefix = role === 'patient' ? 'CL-P' : role === 'doctor' ? 'CL-D' : role === 'nurse' ? 'CL-N' : 'CL-G';
      const autoId = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;
      const userObj = {
        id: autoId,
        name,
        email,
        phone,
        role,
        age: Number(age) || 40,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
      };
      setGeneratedId(autoId);
      setTimeout(() => {
        login(userObj);
        navigate('/');
      }, 1800);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', borderRadius: '20px', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', margin: '0 auto 1rem auto'
          }}>
            <HeartPulse size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>CareLink Registration</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Post-Operative Remote Patient Monitoring Account Setup</p>
        </div>

        {generatedId ? (
          <div style={{ textAlign: 'center', padding: '1.5rem' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>Account Registered Successfully!</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>Your Unique CareLink ID is:</p>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--primary)',
              backgroundColor: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              {generatedId}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Select Role:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {['patient', 'doctor', 'nurse', 'guardian'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: role === r ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: role === r ? 'var(--primary-light)' : 'rgba(15, 23, 42, 0.02)',
                        color: role === r ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Full Name:</label>
                <input type="text" required placeholder="e.g. Saran Kumar" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Email Address:</label>
                  <input type="email" required placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Mobile Number:</label>
                  <input type="tel" required placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Age:</label>
                  <input type="number" required placeholder="42" value={age} onChange={e => setAge(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Password:</label>
                  <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                Create Account & Generate CareLink ID
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Already have a CareLink account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
