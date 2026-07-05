import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { rolesAPI } from '../api/index.js';
import WeightedSkillInput from '../components/WeightedSkillInput.jsx';

const EXP_LEVELS = ['Any', 'Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    rolesAPI.get(id)
      .then((res) => {
        const role = res.data.role;
        setForm({
          title: role.title || '',
          description: role.description || '',
          weightedSkills: role.weightedSkills?.length
            ? role.weightedSkills
            : (role.requiredSkills || []).map((s) => ({ skill: s, type: 'must-have' })),
          experienceLevel: role.experienceLevel || 'Any',
          location: role.location || 'Remote',
          minExperience: role.minExperience || 0,
          maxExperience: role.maxExperience || 20,
          isActive: role.isActive !== false,
        });
      })
      .catch(() => setError('Role not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Role title is required.'); return; }
    setSaving(true); setError('');
    try {
      await rolesAPI.update(id, form);
      navigate(`/roles/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page"><div className="container" style={{ maxWidth: 700 }}>
      <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)' }} />
    </div></div>
  );

  if (!form) return (
    <div className="page"><div className="container">
      <div className="alert alert-error">{error || 'Role not found.'}</div>
    </div></div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-light)' }}>Dashboard</Link>
          <span>/</span>
          <Link to={`/roles/${id}`} style={{ color: 'var(--accent-light)' }}>{form.title}</Link>
          <span>/</span>
          <span>Edit</span>
        </div>

        <div className="page-header">
          <h1>Edit Role</h1>
          <p>Update skills or role details. Existing candidate scores will reflect old scoring.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">Job Title *</label>
              <input id="edit-title" type="text" className="form-input" value={form.title} onChange={set('title')} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-input" value={form.experienceLevel} onChange={set('experienceLevel')}>
                  {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" value={form.location} onChange={set('location')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Min Experience (years)</label>
                <input type="number" className="form-input" min={0} max={50} value={form.minExperience} onChange={set('minExperience')} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Experience (years)</label>
                <input type="number" className="form-input" min={0} max={50} value={form.maxExperience} onChange={set('maxExperience')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills ({form.weightedSkills.length} defined)</label>
              <WeightedSkillInput
                value={form.weightedSkills}
                onChange={(ws) => setForm((prev) => ({ ...prev, weightedSkills: ws }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description</label>
              <textarea className="form-input" value={form.description} onChange={set('description')} style={{ minHeight: 120 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox" id="role-active"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              <label htmlFor="role-active" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Role is active (accepting candidates)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link to={`/roles/${id}`} className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={saving} id="save-role">
                {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
