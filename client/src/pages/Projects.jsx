import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rolesAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Briefcase, Zap, Bell, Search, MapPin, Users, UploadCloud, Trash2, ArrowRight } from 'lucide-react';

const EXP_COLORS = { Fresher: 'badge-blue', Junior: 'badge-green', Mid: 'badge-amber', Senior: 'badge-purple', Lead: 'badge-red', Any: 'badge-gray' };

export default function Projects() {
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
    if (!confirm('Delete this project and all its candidates?')) return;
    setDeleting(id);
    try {
      await rolesAPI.delete(id);
      setRoles((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="main-header" style={{ padding: '0 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.25rem' }}>Projects</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn btn-ghost btn-icon" style={{ padding: '0.4rem', color: '#9CA3AF' }}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      <div className="main-body" style={{ padding: '2rem 2.5rem' }}>
        <div className="container" style={{ padding: 0 }}>
          
          <div className="dashboard-search-bar">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="form-input" placeholder="Search" style={{ width: '100%', padding: '0.875rem 1.25rem 0.875rem 2.75rem' }} />
            </div>
            <Link to="/roles/new" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', background: '#4F46E5', color: 'white', border: 'none' }}>
              + Create new Project
            </Link>
          </div>

          {loading ? (
            <div className="roles-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  <div className="skeleton" style={{ height: 20, width: '60%' }} />
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5rem 2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Briefcase size={56} strokeWidth={1} color="#D1D5DB" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No projects yet</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first project to start managing talent, campaigns, and hiring progress.</p>
              <Link to="/roles/new" className="btn btn-primary" style={{ background: '#4F46E5', border: 'none' }}>+ Create new Project</Link>
            </div>
          ) : (
            <div className="roles-grid">
              {roles.map((role) => (
                <div key={role._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{role.title}</h3>
                      <span className={`badge ${EXP_COLORS[role.experienceLevel] || 'badge-gray'}`}>
                        {role.experienceLevel}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} /> {role.location}  ·  <Users size={12} /> {role.candidateCount || 0} candidates
                    </p>
                  </div>

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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: role.isActive ? 'var(--success)' : 'var(--text-muted)',
                    }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {role.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <Link
                      to={`/roles/${role._id}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center', background: '#4F46E5', gap: '0.4rem' }}
                    >
                      Manage <ArrowRight size={14} />
                    </Link>
                    <Link
                      to={`/roles/${role._id}/upload`}
                      className="btn btn-secondary btn-sm"
                      title="Upload resumes"
                    >
                      <UploadCloud size={16} />
                    </Link>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleDelete(role._id)}
                      disabled={deleting === role._id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
