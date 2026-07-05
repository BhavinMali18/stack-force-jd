import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rolesAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

const EXP_COLORS = { Fresher: 'badge-blue', Junior: 'badge-green', Mid: 'badge-amber', Senior: 'badge-purple', Lead: 'badge-red', Any: 'badge-gray' };

export default function Dashboard() {
  const { company } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    rolesAPI.list()
      .then((res) => setRoles(res.data.roles))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this role and all its candidates?')) return;
    setDeleting(id);
    try {
      await rolesAPI.remove(id);
      setRoles((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const totalCandidates = roles.reduce((sum, r) => sum + (r.candidateCount || 0), 0);
  const activeRoles = roles.filter((r) => r.isActive).length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Welcome, {company?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your roles and candidate shortlists</p>
          </div>
          <Link to="/roles/new" className="btn btn-primary" id="create-role-btn">
            + Post New Role
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '📋', label: 'Total Roles', value: roles.length },
            { icon: '✅', label: 'Active Roles', value: activeRoles },
            { icon: '👥', label: 'Total Candidates', value: totalCandidates },
            { icon: '🏢', label: 'Industry', value: company?.industry || '—' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 700 }}>Open Roles</h3>
        </div>

        {loading ? (
          <div className="roles-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                <div className="skeleton" style={{ height: 20, width: '60%' }} />
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 8, borderRadius: 9999 }} />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-state-icon">📋</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No roles yet</p>
            <p style={{ fontSize: '0.875rem' }}>Post your first role to start receiving and ranking candidates.</p>
            <Link to="/roles/new" className="btn btn-primary">+ Post First Role</Link>
          </div>
        ) : (
          <div className="roles-grid">
            {roles.map((role) => (
              <div key={role._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Role header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{role.title}</h3>
                    <span className={`badge ${EXP_COLORS[role.experienceLevel] || 'badge-gray'}`}>
                      {role.experienceLevel}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    📍 {role.location}  ·  👥 {role.candidateCount || 0} candidates
                  </p>
                </div>

                {/* Skills */}
                {role.requiredSkills.length > 0 && (
                  <div className="skill-pills">
                    {role.requiredSkills.slice(0, 5).map((s) => (
                      <span key={s} className="skill-pill">{s}</span>
                    ))}
                    {role.requiredSkills.length > 5 && (
                      <span className="badge badge-gray">+{role.requiredSkills.length - 5}</span>
                    )}
                  </div>
                )}

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: role.isActive ? 'var(--success)' : 'var(--text-muted)',
                    boxShadow: role.isActive ? '0 0 6px var(--success)' : 'none',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {role.isActive ? 'Active' : 'Closed'} · {new Date(role.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link
                    to={`/roles/${role._id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    View Candidates
                  </Link>
                  <Link
                    to={`/roles/${role._id}/upload`}
                    className="btn btn-secondary btn-sm"
                    title="Upload resumes"
                  >
                    ⬆
                  </Link>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => handleDelete(role._id)}
                    disabled={deleting === role._id}
                    title="Delete role"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
