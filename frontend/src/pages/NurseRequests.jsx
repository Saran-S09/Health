import React, { useState } from 'react';
import { UserCheck, Search, Send, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { useAuth } from '../context/AuthContext';
import { ConnectionRequestCard } from '../components/careteam/ConnectionRequestCard';

export const NurseRequests = () => {
  const { currentUser } = useAuth();
  const { requests, respondToRequest, sendConnectionRequest } = usePatient();
  const [patientSearch, setPatientSearch] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const incomingRequests = requests.filter(r => r.receiverId === currentUser.id);

  const handleSendToPatient = (e) => {
    e.preventDefault();
    if (!patientSearch) return;
    sendConnectionRequest({
      name: patientSearch.startsWith('CL-') ? "Monitored Patient" : patientSearch,
      role: "Patient",
      id: patientSearch.startsWith('CL-') ? patientSearch : `CL-P${Math.floor(1000 + Math.random()*9000)}`
    }, "OUTGOING");
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setPatientSearch('');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Nurse Patient Connection Requests
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage incoming patient requests & send nursing telemetry connection requests
        </p>
      </div>

      {/* Nurse Search & Add Patient Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Request Connection with Patient
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Enter Patient ID (e.g. CL-P10234) or Patient Name:
        </p>

        {sentSuccess ? (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-normal-bg)', borderRadius: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: 700 }}>
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Nursing connection request dispatched. Status: PENDING.
          </div>
        ) : (
          <form onSubmit={handleSendToPatient} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="Enter Patient ID (CL-P10234) or Name..."
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Send size={16} /> Send Request
            </button>
          </form>
        )}
      </div>

      {/* Incoming Requests Feed */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={18} color="var(--accent-teal)" /> Patient Requests Received
        </h3>

        {incomingRequests.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#ffffff' }}>
            No incoming patient requests at this moment.
          </div>
        ) : (
          incomingRequests.map(req => (
            <ConnectionRequestCard key={req.id} request={req} onRespond={respondToRequest} />
          ))
        )}
      </div>
    </div>
  );
};
