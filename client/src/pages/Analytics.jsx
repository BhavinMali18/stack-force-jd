import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { candidatesAPI, rolesAPI } from '../api/index.js';
import MatchBar from '../components/MatchBar.jsx';
import { FunnelChart, SkillBar } from '../components/FunnelChart.jsx';

export default function Analytics() {
  const { id: roleId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    candidatesAPI.analytics(roleId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [roleId]);

  if (loading) return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="page"><div className="container">
      <div className="alert alert-error">{error}</div>
    </div></div>
  );

  const { role, analytics } = data;
  const {
    total, funnel, scoreDistribution, avgScore,
    mustHaveCompliant, topMatchedSkills, topMissingSkills,
    avgCGPA, avgExp,
  } = analytics;

  const conversionRate = funnel.Applied > 0
    ? Math.round(((funnel.Selected || 0) / funnel.Applied) * 100)
    : 0;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/dashboard" style={{ color: 'var(--accent-light)' }}>Dashboard</Link>
          <span>/</span>
          <Link to={`/roles/${roleId}`} style={{ color: 'var(--accent-light)' }}>{role?.title}</Link>
          <span>/</span>
          <span>Analytics</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>📊 Analytics</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{role?.title} · {total} candidates total</p>
          </div>
          <Link to={`/roles/${roleId}`} className="btn btn-secondary btn-sm">← Back to Shortlist</Link>
        </div>

        {total === 0 ? (
          <div className="empty-state card">
            <span className="empty-state-icon">📊</span>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No data yet</p>
            <p>Upload resumes to see analytics.</p>
            <Link to={`/roles/${roleId}/upload`} className="btn btn-primary">⬆ Upload Resumes</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Top stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '👥', label: 'Total Candidates', value: total, color: 'var(--accent-light)' },
                { icon: '📈', label: 'Avg Match Score', value: `${avgScore}%`, color: avgScore >= 60 ? 'var(--success)' : avgScore >= 40 ? 'var(--warning)' : 'var(--danger)' },
                { icon: '🔴', label: 'Must-Have Compliant', value: mustHaveCompliant, color: 'var(--success)' },
                { icon: '🏆', label: 'Conversion Rate', value: `${conversionRate}%`, color: conversionRate >= 10 ? 'var(--success)' : 'var(--warning)' },
                ...(avgCGPA ? [{ icon: '🎓', label: 'Avg CGPA', value: `${avgCGPA}/10`, color: avgCGPA >= 7.5 ? 'var(--success)' : 'var(--warning)' }] : []),
                ...(avgExp !== null && avgExp !== undefined ? [{ icon: '💼', label: 'Avg Experience', value: `${avgExp} yrs`, color: 'var(--accent-light)' }] : []),
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <span className="stat-icon">{s.icon}</span>
                  <span className="stat-value" style={{ fontSize: '1.6rem', color: s.color, WebkitTextFillColor: s.color }}>{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Score distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Score bands */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Score Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'Strong Match (80%+)', count: scoreDistribution.high, color: 'var(--success)' },
                    { label: 'Moderate (50–79%)', count: scoreDistribution.mid, color: 'var(--warning)' },
                    { label: 'Weak (<50%)', count: scoreDistribution.low, color: 'var(--danger)' },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>({total > 0 ? Math.round(count/total*100) : 0}%)</span></span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${total > 0 ? (count/total)*100 : 0}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                  {/* Must-have compliant */}
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🔴 Must-have Compliant</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>{mustHaveCompliant}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${total > 0 ? (mustHaveCompliant/total)*100 : 0}%`, background: 'var(--success)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Avg score gauge */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', alignSelf: 'flex-start' }}>Average Match Score</h3>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: `conic-gradient(${avgScore >= 80 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'} ${avgScore * 3.6}deg, var(--bg-tertiary) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: avgScore >= 80 ? 'var(--success)' : avgScore >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{avgScore}%</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>avg score</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                  {avgCGPA && <div style={{ textAlign: 'center' }}><p style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{avgCGPA}</p><p style={{ color: 'var(--text-muted)' }}>Avg CGPA</p></div>}
                  {avgExp !== null && avgExp !== undefined && <div style={{ textAlign: 'center' }}><p style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{avgExp} yrs</p><p style={{ color: 'var(--text-muted)' }}>Avg Exp</p></div>}
                </div>
              </div>
            </div>

            {/* Hiring funnel */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Hiring Funnel</h3>
              <FunnelChart funnel={funnel} total={total} />
            </div>

            {/* Top skills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--success)' }}>✓ Most Commonly Matched</h3>
                {topMatchedSkills.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data</p>
                  : topMatchedSkills.map(({ skill, count }) => (
                      <SkillBar key={skill} skill={skill} count={count} total={total} color="var(--success)" />
                    ))}
              </div>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--danger)' }}>✗ Most Commonly Missing</h3>
                {topMissingSkills.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data</p>
                  : topMissingSkills.map(({ skill, count }) => (
                      <SkillBar key={skill} skill={skill} count={count} total={total} color="var(--danger)" />
                    ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
