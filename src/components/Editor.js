import React, { useRef } from 'react';
import { textStats } from '../tools/text';

const MAX_HIGHLIGHTS = 2000;

function Highlights({ text, highlights }) {
  const parts = [];
  let last = 0;
  highlights.slice(0, MAX_HIGHLIGHTS).forEach((h, i) => {
    if (!h.length) return;
    parts.push(text.slice(last, h.index));
    parts.push(
      <mark key={i} className={h.selected ? 'tu-hl tu-hl-selected' : 'tu-hl'}>
        {text.slice(h.index, h.index + h.length)}
      </mark>
    );
    last = h.index + h.length;
  });
  parts.push(text.slice(last));
  // A trailing newline needs a character after it to occupy a line, like in the textarea.
  if (text.endsWith('\n')) parts.push(' ');
  return parts;
}

function Stats({ text }) {
  const s = textStats(text);
  const minutes = s.readingMinutes < 1 ? (s.words ? '< 1' : '0') : Math.round(s.readingMinutes);
  return (
    <div className="tu-stats" aria-live="polite">
      <span>{s.words} words</span>
      <span>{s.characters} characters</span>
      <span>{s.charactersNoSpaces} without spaces</span>
      <span>{s.lines} lines</span>
      <span>{minutes} min read</span>
    </div>
  );
}

export default function Editor({ id, label, value, onChange, readOnly, placeholder, actions, status, highlights }) {
  const backdrop = useRef(null);
  const syncScroll = (e) => {
    if (backdrop.current) backdrop.current.scrollTop = e.target.scrollTop;
  };

  return (
    <section className="tu-pane">
      <div className="tu-pane-header">
        <label htmlFor={id} className="tu-pane-title">
          {label}
        </label>
        <div className="tu-pane-actions">{actions}</div>
      </div>
      {status}
      <div className={`tu-editor-wrap ${highlights ? 'has-highlights' : ''}`}>
        {highlights && (
          <div className="tu-editor tu-backdrop" ref={backdrop} aria-hidden="true">
            <Highlights text={value} highlights={highlights} />
          </div>
        )}
        <textarea
          id={id}
          className="tu-editor"
          value={value}
          onChange={onChange && ((e) => onChange(e.target.value))}
          onScroll={syncScroll}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
      <Stats text={value} />
    </section>
  );
}
