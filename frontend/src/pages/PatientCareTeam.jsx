import React from 'react';
import { Users, UserPlus, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { CareTeamCard } from '../components/careteam/CareTeamCard';
import { ConnectionRequestCard } from '../components/careteam/ConnectionRequestCard';

export const PatientCareTeam = ({ onOpenAddMember }) => {
  const { careTeam, requests, respondToRequest } = usePatient();

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Patient Care Team Management
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Two-way permission system governing telemetry monitoring access
          </p>
        </div>

        <button onClick={onOpenAddMember} className="btn btn-primary">
          <UserPlus size={16} /> Add Care Member
        </button>
      </div>

      {/* Connection Requests Manager Section */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Pending Connection Requests ({pendingRequests.length})
          </h3>
          {pendingRequests.map(req => (
            <ConnectionRequestCard key={req.id} request={req} onRespond={respondToRequest} />
          ))}
        </div>
      )}

      {/* Connected Care Team Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary)" /> Active Care Team Matrix
        </h3>

        <div className="grid-3">
          {careTeam.map(member => (
            <CareTeamCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};
