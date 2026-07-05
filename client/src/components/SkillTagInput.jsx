import React, { useState, useRef, useEffect } from 'react';
import { COMMON_SKILLS } from '../data/skills.js';

export default function SkillTagInput({ value = [], onChange, placeholder = 'Add a skill...' }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!input.trim()) { setSuggestions([]); return; }
    const lower = input.toLowerCase();
    const filtered = COMMON_SKILLS
      .filter((s) => s.toLowerCase().includes(lower) && !value.includes(s))
      .slice(0, 8);
    setSuggestions(filtered);
  }, [input, value]);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => onChange(value.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addSkill(input.trim());
    }
    if (e.key === 'Backspace' && !input && value.length) {
      removeSkill(value[value.length - 1]);
    }
    if (e.key === 'Escape') setSuggestions([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          cursor: 'text',
          minHeight: 48,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((skill) => (
          <span key={skill} className="skill-pill">
            {skill}
            <button
              type="button"
              className="skill-pill-remove"
              onClick={(e) => { e.stopPropagation(); removeSkill(skill); }}
              aria-label={`Remove ${skill}`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 150)}
          placeholder={value.length === 0 ? placeholder : ''}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            flex: 1,
            minWidth: 120,
            padding: '0.15rem 0.25rem',
          }}
        />
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-md)',
          zIndex: 50,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => addSkill(s)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
        Type a skill and press Enter or comma. Use Backspace to remove.
      </p>
    </div>
  );
}
