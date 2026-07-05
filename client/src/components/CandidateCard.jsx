import React from 'react';
import { Link } from 'react-router-dom';
import MatchBar from './MatchBar.jsx';

const STATUS_COLORS = {
  Applied: 'badge-gray',
  Shortlisted: 'badge-blue',
  Interview: 'badge-amber',
  Selected: 'badge-green',
  Rejected: 'badge-red',
};

export default function CandidateCard({ candidate, roleId }) {
  const c = candidate;
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative' }}>
      
      {/* Must-have warning badge */}
      {c.hasMissingMustHave && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          background: 'var(--danger)', color: '#fff', fontSize: '0.65rem',
          fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)', zIndex: 10,
        }} title="Missing one or more MUST-HAVE skills (Score capped at 40%)">
          ⚠️ Missing Must-Haves
        </div>
      )}

      {/* Header: Avatar + Name + Status */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, hsl(${(c.name?.charCodeAt(0) || 0) * 7 % 360}, 60%, 40%), hsl(${(c.name?.charCodeAt(0) || 0) * 11 % 360}, 70%, 55%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 700, color: '#fff',
        }}>
          {c.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.name}
            </h3>
            <span className={`badge ${STATUS_COLORS[c.status] || 'badge-gray'}`} style={{ fontSize: '0.7rem' }}>
              {c.status}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.email}
          </p>
        </div>
      </div>

      {/* Phase 2: Metadata (College, CGPA, Exp) */}
      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        {c.college && <span title="College">🎓 {c.college}</span>}
        {c.cgpa !== null && <span title="CGPA">📊 {c.cgpa}/10</span>}
        {c.yearsOfExperience !== null && <span title="Experience">💼 {c.yearsOfExperience} yrs</span>}
      </div>

      {/* Match Score */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Match Score {c.aiScore != null && <span title="AI Generated Score" style={{ cursor: 'help' }}>✨</span>}
          </span>
          <span style={{ fontWeight: 700, color: c.matchScore >= 80 ? 'var(--success)' : c.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {c.matchScore}%
          </span>
        </div>
        <MatchBar score={c.matchScore} height={8} />
      </div>

      <Link
        to={`/roles/${roleId}/candidates/${c._id}`}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
      >
        View Profile
      </Link>
    </div>
  );
}
