import React, { useState, useRef, useEffect } from 'react';
import { COMMON_SKILLS } from '../data/skills.js';

/**
 * Phase 2: Skill tag input with must-have / nice-to-have type toggle.
 * value shape: [{ skill: string, type: 'must-have' | 'nice-to-have' }]
 */
export default function WeightedSkillInput({ value = [], onChange, placeholder = 'Add a skill...' }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return; }
    const lower = input.toLowerCase();
    const existing = new Set(value.map((v) => v.skill.toLowerCase()));
    const filtered = COMMON_SKILLS
      .filter((s) => s.toLowerCase().includes(lower) && !existing.has(s.toLowerCase()))
      .slice(0, 8);
    setSuggestions(filtered);
  }, [input, value]);

  const addSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const exists = value.some((v) => v.skill.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    onChange([...value, { skill: trimmed, type: 'must-have' }]);
    setInput('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSkill = (skillName) => onChange(value.filter((v) => v.skill !== skillName));

  const toggleType = (skillName) => {
    onChange(value.map((v) =>
      v.skill === skillName
        ? { ...v, type: v.type === 'must-have' ? 'nice-to-have' : 'must-have' }
        : v
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (input.trim()) addSkill(input.trim()); }
    if (e.key === 'Backspace' && !input && value.length) removeSkill(value[value.length - 1].skill);
    if (e.key === 'Escape') setSuggestions([]);
  };

  const mustHaveCount = value.filter((v) => v.type === 'must-have').length;
  const niceCount = value.filter((v) => v.type === 'nice-to-have').length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      {value.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>Click skill label to toggle type:</span>
          <span style={{ color: 'var(--danger)' }}>🔴 Must-have ({mustHaveCount})</span>
          <span style={{ color: 'var(--warning)' }}>🟡 Nice-to-have ({niceCount})</span>
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
          cursor: 'text', minHeight: 52,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(({ skill, type }) => {
          const isMust = type === 'must-have';
          return (
            <span
              key={skill}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500,
                background: isMust ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${isMust ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                color: isMust ? 'var(--danger)' : 'var(--warning)',
                cursor: 'default',
              }}
            >
              <button
                type="button"
                title={`Click to make ${isMust ? 'nice-to-have' : 'must-have'}`}
                onClick={(e) => { e.stopPropagation(); toggleType(skill); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'inherit', fontSize: '0.7rem', padding: 0,
                }}
              >
                {isMust ? '🔴' : '🟡'}
              </button>
              {skill}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, fontSize: '0.75rem', padding: '0 2px' }}
                aria-label={`Remove ${skill}`}
              >✕</button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
            flex: 1, minWidth: 140, padding: '0.15rem 0.25rem',
          }}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)', zIndex: 50, overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          {suggestions.map((s) => (
            <button
              key={s} type="button" onMouseDown={() => addSkill(s)}
              style={{
                width: '100%', padding: '0.6rem 1rem', background: 'transparent',
                border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem',
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >{s}</button>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
        Type a skill + Enter. Click the 🔴/🟡 icon to toggle must-have vs nice-to-have.
      </p>
    </div>
  );
}
