import React from 'react';

/**
 * Pure CSS funnel / bar chart for the analytics page.
 * Shows the hiring pipeline from Applied → Selected.
 */
export function FunnelChart({ funnel = {}, total = 0 }) {
  const stages = [
    { key: 'Applied', label: 'Applied', color: 'var(--accent)', icon: '📥' },
    { key: 'Shortlisted', label: 'Shortlisted', color: '#8B5CF6', icon: '⭐' },
    { key: 'Interview', label: 'Interview', color: 'var(--warning)', icon: '🎯' },
    { key: 'Selected', label: 'Selected', color: 'var(--success)', icon: '🏆' },
    { key: 'Rejected', label: 'Rejected', color: 'var(--danger)', icon: '✕' },
  ];

  const max = Math.max(...Object.values(funnel), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {stages.map(({ key, label, color, icon }) => {
        const count = funnel[key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = max > 0 ? (count / max) * 100 : 0;

        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Icon + label */}
            <div style={{ width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.85rem' }}>{icon}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
            </div>
            {/* Bar */}
            <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', height: 28, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${barWidth}%`, minWidth: count > 0 ? 4 : 0,
                background: `linear-gradient(90deg, ${color}, ${color}99)`,
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem',
              }}>
                {count > 0 && barWidth > 15 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{count}</span>
                )}
              </div>
            </div>
            {/* Count + % */}
            <div style={{ width: 55, textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{count}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Horizontal skill bar — shows how many candidates have/miss a skill.
 */
export function SkillBar({ skill, count, total, color = 'var(--accent)' }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {skill}
      </span>
      <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 'var(--radius-full)',
          transition: 'width 0.7s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 28, textAlign: 'right', flexShrink: 0 }}>{count}</span>
    </div>
  );
}
