/**
 * AutoSuggestPanel.jsx — Pool Candidates Matched to This Role
 * ─────────────────────────────────────────────────────────────
 * Appears on the Role Detail page.
 * Shows pool resumes ranked by match score.
 * "Add to role" button copies them into the role's candidate list.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MatchBar from './MatchBar.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('sf_token')}` });

export default function AutoSuggestPanel({ roleId, onCandidateAdded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poolTotal, setPoolTotal] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [mustHaveOnly, setMustHaveOnly] = useState(false);
  const [adding, setAdding] = useState({});
  const [added, setAdded] = useState(new Set());
  const [expanded, setExpanded] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const [suggestRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/roles/${roleId}/suggestions`, {
          params: { limit: 50, minScore, mustHaveOnly },
          headers: authHeaders(),
        }),
        axios.get(`${API}/api/pool/stats`, { headers: authHeaders() }),
      ]);
      setSuggestions(suggestRes.data.suggestions || []);
      setPoolTotal(statsRes.data.done || 0);
    } catch (e) {
      console.error('Auto-suggest failed:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuggestions(); }, [roleId, minScore, mustHaveOnly]);

  const handleAdd = async (poolResumeId) => {
    setAdding(prev => ({ ...prev, [poolResumeId]: true }));
    try {
      await axios.post(`${API}/api/roles/${roleId}/suggest-add/${poolResumeId}`, {}, { headers: authHeaders() });
      setAdded(prev => new Set([...prev, poolResumeId]));
      onCandidateAdded?.();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add candidate');
    } finally {
      setAdding(prev => ({ ...prev, [poolResumeId]: false }));
    }
  };

  if (poolTotal === 0) return null; // No pool yet — don't show the panel

  return (
    <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🎯</span>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              Auto-Suggest from Talent Pool
              {!loading && (
                <span style={{ marginLeft: '0.5rem', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-light)', borderRadius: 9999, padding: '0.1rem 0.5rem', fontSize: '0.78rem', fontWeight: 700 }}>
                  {suggestions.length} matches
                </span>
              )}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Scanned {poolTotal} resumes from your talent pool
            </p>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '1rem 1.25rem' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <label>Min score:</label>
              {[0, 30, 50, 70].map(s => (
                <button key={s}
                  className={`btn btn-sm ${minScore === s ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setMinScore(s)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                  {s}%+
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" id="pool-must-have" checked={mustHaveOnly} onChange={e => setMustHaveOnly(e.target.checked)} style={{ accentColor: 'var(--success)' }} />
              <label htmlFor="pool-must-have">Must-haves only</label>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />)}
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p>No pool candidates match the current filters.</p>
              <p style={{ marginTop: '0.35rem' }}>
                Try lowering the min score or <span style={{ color: 'var(--accent-light)' }}>adding more resumes to your pool</span>.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 400, overflowY: 'auto' }}>
              {suggestions.map(s => {
                const isAdded = added.has(s._id);
                const isAdding = adding[s._id];
                return (
                  <div key={s._id} style={{
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    alignItems: 'center', gap: '1rem',
                    padding: '0.75rem 1rem',
                    background: isAdded ? 'rgba(34,197,94,0.06)' : 'var(--bg-secondary)',
                    border: `1px solid ${isAdded ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</span>
                        {s.college && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {s.college}</span>}
                        {s.yearsOfExperience != null && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {s.yearsOfExperience}y exp</span>}
                      </div>
                      <MatchBar score={s.matchScore} />
                      {s.matchedSkills?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {s.matchedSkills.slice(0, 5).map(skill => (
                            <span key={skill} style={{ fontSize: '0.68rem', background: 'rgba(34,197,94,0.12)', color: 'var(--success)', borderRadius: 9999, padding: '0.1rem 0.4rem' }}>{skill}</span>
                          ))}
                          {s.matchedSkills.length > 5 && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{s.matchedSkills.length - 5}</span>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span style={{
                        fontWeight: 800, fontSize: '1.1rem',
                        color: s.matchScore >= 80 ? 'var(--success)' : s.matchScore >= 50 ? 'var(--warning)' : 'var(--danger)',
                      }}>{s.matchScore}%</span>
                      {isAdded ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✅ Added</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAdd(s._id)} disabled={isAdding}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
                          {isAdding ? '...' : '+ Add to Role'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
