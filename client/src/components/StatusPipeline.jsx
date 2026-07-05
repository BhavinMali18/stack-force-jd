import React from 'react';

const STEPS = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
const STEP_ICONS = { Applied: '📥', Shortlisted: '⭐', Interview: '🎯', Selected: '🏆', Rejected: '✕' };

export default function StatusPipeline({ currentStatus, onStatusChange, disabled = false }) {
  const isRejected = currentStatus === 'Rejected';
  const currentIdx = STEPS.indexOf(currentStatus);

  return (
    <div>
      <div className="pipeline" style={{ marginBottom: '1rem' }}>
        {STEPS.map((step, i) => {
          const isActive = step === currentStatus;
          const isCompleted = currentIdx > i;
          return (
            <div
              key={step}
              className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <button
                type="button"
                className="pipeline-dot"
                onClick={() => !disabled && onStatusChange(step)}
                disabled={disabled}
                title={step}
                style={{ cursor: disabled ? 'default' : 'pointer' }}
              >
                {isCompleted ? '✓' : STEP_ICONS[step]}
              </button>
              <span className="pipeline-label">{step}</span>
            </div>
          );
        })}
      </div>

      {/* Reject button */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {!isRejected ? (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => !disabled && onStatusChange('Rejected')}
            disabled={disabled}
          >
            ✕ Reject Candidate
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => !disabled && onStatusChange('Applied')}
            disabled={disabled}
          >
            ↩ Restore to Applied
          </button>
        )}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Current: <strong style={{ color: 'var(--text-primary)' }}>{currentStatus}</strong>
        </span>
      </div>
    </div>
  );
}
