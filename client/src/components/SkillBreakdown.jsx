import React from 'react';

export default function SkillBreakdown({ candidate }) {
  const {
    matchedSkills = [], missingSkills = [],
    mustHaveMatched = [], mustHaveMissing = [],
    niceToHaveMatched = [], niceToHaveMissing = [],
    hasMissingMustHave = false,
  } = candidate;

  const hasWeightedData = mustHaveMatched.length > 0 || mustHaveMissing.length > 0 || niceToHaveMatched.length > 0 || niceToHaveMissing.length > 0;

  if (hasWeightedData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {hasMissingMustHave && (
          <div className="alert alert-error" style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>⚠️</span>
            <div>
              <strong style={{ display: 'block' }}>Must-have skills missing</strong>
              <span>Score capped at 40% maximum.</span>
            </div>
          </div>
        )}

        {/* Must Haves */}
        <div>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔴 Must-Have Skills</span>
            <span>{mustHaveMatched.length}/{mustHaveMatched.length + mustHaveMissing.length}</span>
          </h4>
          <div className="skill-pills">
            {mustHaveMatched.map((s) => <span key={s} className="skill-pill matched">{s}</span>)}
            {mustHaveMissing.map((s) => <span key={s} className="skill-pill missing">{s}</span>)}
            {mustHaveMatched.length === 0 && mustHaveMissing.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None defined</span>}
          </div>
        </div>

        {/* Nice to Haves */}
        <div>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>🟡 Nice-to-Have Skills</span>
            <span>{niceToHaveMatched.length}/{niceToHaveMatched.length + niceToHaveMissing.length}</span>
          </h4>
          <div className="skill-pills">
            {niceToHaveMatched.map((s) => <span key={s} className="skill-pill matched">{s}</span>)}
            {niceToHaveMissing.map((s) => <span key={s} className="skill-pill missing">{s}</span>)}
            {niceToHaveMatched.length === 0 && niceToHaveMissing.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None defined</span>}
          </div>
        </div>

        {/* Extracted Extras */}
        {candidate.extractedSkills?.length > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>✨ Other Skills Found in Resume</h4>
            <div className="skill-pills">
              {candidate.extractedSkills
                .filter((s) => !matchedSkills.includes(s) && !missingSkills.includes(s))
                .slice(0, 10)
                .map((s) => <span key={s} className="skill-pill" style={{ opacity: 0.7 }}>{s}</span>)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Phase 1 Fallback
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Required Skills Match</h4>
        <div className="skill-pills">
          {matchedSkills.map((s) => <span key={s} className="skill-pill matched">{s}</span>)}
          {missingSkills.map((s) => <span key={s} className="skill-pill missing">{s}</span>)}
        </div>
      </div>
    </div>
  );
}
