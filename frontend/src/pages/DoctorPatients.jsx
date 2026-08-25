import React, { useState } from 'react';
import { Users, Search, Activity } from 'lucide-react';
import { usePatient } from '../context/PatientContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';

export const DoctorPatients = () => {
  const { connectedPatients, vitals, evaluation } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = connectedPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Doctor's Monitored Patient Directory
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Patients with accepted two-way connection permissions
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search patient name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map(p => {
          const isMain = p.id === "CL-P10234";
          const curVitals = isMain ? vitals : p.lastVitals;
          const curStatus = isMain ? evaluation.status : p.status;

          return (
            <div key={p.id} className="glass-panel glass-panel-hover" style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{p.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>({p.id})</span>
                    <StatusBadge status={curStatus} size="sm" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {p.surgery} • {p.room} • Guardian: {p.guardian}
                  </p>
                </div>

                <Link to="/history" state={{ selectedPatient: p }} className="btn btn-secondary btn-sm">
                  <Activity size={14} /> Telemetry Analytics
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
