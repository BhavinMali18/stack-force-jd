import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { rolesAPI } from '../api/index.js';
import WeightedSkillInput from '../components/WeightedSkillInput.jsx';

const EXP_LEVELS = ['Any', 'Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];

export default function RoleCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    weightedSkills: [],
    experienceLevel: 'Any',
    location: 'Remote',
    minExperience: 0,
    maxExperience: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Role title is required.'); return; }
    if (form.weightedSkills.length === 0) { setError('Add at least one skill requirement.'); return; }

    setLoading(true); setError('');
    try {
      const res = await rolesAPI.create(form);
      navigate(`/roles/${res.data.role._id}/upload`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-light)' }}>Dashboard</Link>
          <span>/</span>
          <span>Post New Role</span>
        </div>

        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Post a New Role</h1>
            <p>Define the role requirements — candidates will be ranked against these skills.</p>
          </div>
          <div>
            <input 
              type="file" 
              id="jd-upload" 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                if(e.target.files.length > 0) {
                  // Simulate AI Auto-fill
                  setLoading(true);
                  setTimeout(() => {
                    setForm(prev => ({
                      ...prev,
                      title: 'Senior Frontend Engineer',
                      experienceLevel: 'Senior',
                      location: 'Remote',
                      minExperience: 4,
                      maxExperience: 8,
                      description: 'We are looking for a Senior Frontend Engineer to join our core team. You will be responsible for architecting and building out our new AI-powered features using React and modern CSS.',
                      weightedSkills: [
                        { name: 'React', weight: 10, isMandatory: true },
                        { name: 'JavaScript', weight: 8, isMandatory: true },
                        { name: 'CSS', weight: 6, isMandatory: false }
                      ]
                    }));
                    setLoading(false);
                    alert('✨ Auto-filled project details from Job Description!');
                  }, 1500);
                }
              }}
            />
            <button 
              className="btn btn-secondary" 
              style={{ border: '1px solid #C7D2FE', color: '#4F46E5', background: '#EEF2FF', fontWeight: 600 }}
              onClick={() => document.getElementById('jd-upload').click()}
            >
              ✨ Auto-fill from JD
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="role-title">Job Title *</label>
              <input id="role-title" type="text" className="form-input" placeholder="e.g. Senior Full Stack Engineer" value={form.title} onChange={set('title')} required autoFocus />
            </div>

            {/* Experience + Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="exp-level">Experience Level</label>
                <select id="exp-level" className="form-input" value={form.experienceLevel} onChange={set('experienceLevel')}>
                  {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input id="location" type="text" className="form-input" placeholder="Remote / Bangalore / Hybrid" value={form.location} onChange={set('location')} />
              </div>
            </div>

            {/* Exp range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="min-exp">Min Experience (years)</label>
                <input id="min-exp" type="number" className="form-input" min={0} max={50} value={form.minExperience} onChange={set('minExperience')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="max-exp">Max Experience (years)</label>
                <input id="max-exp" type="number" className="form-input" min={0} max={50} value={form.maxExperience} onChange={set('maxExperience')} />
              </div>
            </div>

            {/* Required Skills (Phase 2 weighted) */}
            <div className="form-group">
              <label className="form-label">Required Skills * ({form.weightedSkills.length} added)</label>
              <WeightedSkillInput
                value={form.weightedSkills}
                onChange={(ws) => setForm((prev) => ({ ...prev, weightedSkills: ws }))}
                placeholder="Search skills — React, Node.js, AWS..."
              />
            </div>

            {/* JD */}
            <div className="form-group">
              <label className="form-label" htmlFor="jd-text">Job Description (optional)</label>
              <textarea id="jd-text" className="form-input" placeholder="Paste or type the full job description here..." value={form.description} onChange={set('description')} style={{ minHeight: 140 }} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Link to="/dashboard" className="btn btn-secondary">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={loading} id="submit-role">
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</> : '✓ Post Role & Upload Resumes →'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

