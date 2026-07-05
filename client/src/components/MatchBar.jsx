import React, { useEffect, useRef } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return { bar: 'var(--success)', glow: 'rgba(16,185,129,0.4)' };
  if (score >= 50) return { bar: 'var(--warning)', glow: 'rgba(245,158,11,0.4)' };
  return { bar: 'var(--danger)', glow: 'rgba(244,63,94,0.4)' };
};

export default function MatchBar({ score, showLabel = true, height = 8, animated = true }) {
  const fillRef = useRef(null);
  const { bar, glow } = getScoreColor(score);

  useEffect(() => {
    if (!fillRef.current || !animated) return;
    // Animate from 0 to score
    fillRef.current.style.width = '0%';
    const timeout = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = `${score}%`;
    }, 80);
    return () => clearTimeout(timeout);
  }, [score, animated]);

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match Score</span>
          <span style={{
            fontSize: '0.9rem', fontWeight: 700,
            color: bar,
            textShadow: `0 0 8px ${glow}`,
          }}>
            {score}%
          </span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          ref={fillRef}
          className="progress-fill"
          style={{
            width: animated ? '0%' : `${score}%`,
            background: `linear-gradient(90deg, ${bar}, ${glow.replace('0.4', '0.8')})`,
            boxShadow: `0 0 8px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}
