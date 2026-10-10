import React, { useEffect, useMemo, useState } from 'react';
import {
  MAX_MATCHES,
  buildRegex,
  escapeRegExp,
  expandReplacement,
  findMatches,
  lineAndColumn,
  replaceMatches,
} from '../tools/findReplace';
import { Link } from 'react-router-dom';
import usePersistentState from '../usePersistentState';

const LISTED_MATCHES = 200;

const DEFAULT_SETTINGS = {
  find: '',
  replace: '',
  useRegex: false,
  caseSensitive: false,
  wholeWord: false,
  multiline: true,
  dotAll: false,
};

export function useFindReplace(input) {
  const [settings, setSettings] = usePersistentState('textutils.findReplace', DEFAULT_SETTINGS);
  const [deselected, setDeselected] = useState(() => new Set());

  const { regex, error } = useMemo(() => {
    try {
      return { regex: buildRegex(settings.find, settings) };
    } catch (e) {
      return { error: e.message };
    }
  }, [settings]);

  const matches = useMemo(() => findMatches(input, regex), [input, regex]);

  useEffect(() => setDeselected(new Set()), [matches]);

  const selected = useMemo(
    () => new Set(matches.map((_, i) => i).filter((i) => !deselected.has(i))),
    [matches, deselected]
  );

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const toggleMatch = (i) =>
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const selectOnly = (keep) => setDeselected(new Set(matches.map((_, i) => i).filter((i) => !keep(i))));

  // Pipeline step. Per-match selection only applies while the step sees the original input.
  const tool = useMemo(
    () => ({
      id: 'find-replace',
      label: 'Find & Replace',
      run: (text) => {
        if (error) throw new Error(`Invalid regular expression: ${error.replace(/^Invalid regular expression: /, '')}`);
        if (!regex) return text;
        const own = text === input;
        return replaceMatches(text, own ? matches : findMatches(text, regex), settings.replace, settings.useRegex, own ? selected : undefined);
      },
    }),
    [error, regex, input, matches, selected, settings.replace, settings.useRegex]
  );

  return { settings, update, regex, error, matches, selected, toggleMatch, selectOnly, tool, input };
}

const TOGGLES = [
  { key: 'caseSensitive', label: 'Match case', short: 'Aa' },
  { key: 'wholeWord', label: 'Whole word', short: 'ab' },
  { key: 'useRegex', label: 'Regex', short: '.*' },
  { key: 'multiline', label: '^ $ per line', short: 'm', regexOnly: true },
  { key: 'dotAll', label: '. matches newline', short: 's', regexOnly: true },
];

const visible = (s) => s.replace(/\n/g, '↵').replace(/\t/g, '→');

export default function FindReplacePanel({ fr, selected: applied, onToggle }) {
  const { settings, update, error, matches, selected, input } = fr;
  const truncated = matches.length >= MAX_MATCHES;

  const listed = useMemo(
    () =>
      matches.slice(0, LISTED_MATCHES).map((m, i) => ({
        ...m,
        i,
        position: lineAndColumn(input, m.index),
        replacement: expandReplacement(settings.replace, m, input, settings.useRegex),
      })),
    [matches, input, settings.replace, settings.useRegex]
  );

  let summary;
  if (error) summary = <span className="text-danger">Invalid regex: {error.replace(/^Invalid regular expression: /, '')}</span>;
  else if (!settings.find) summary = <span className="text-body-secondary">Matches are highlighted in the Input box.</span>;
  else if (!matches.length) summary = <span className="text-body-secondary">No matches in the input.</span>;
  else
    summary = (
      <span>
        <strong>{matches.length}{truncated ? '+' : ''}</strong> match{matches.length === 1 ? '' : 'es'}
        <span className="text-body-secondary"> · {selected.size} will be replaced</span>
      </span>
    );

  return (
    <div className="tu-find">
      <label htmlFor="fr-find" className="tu-field-label">Find</label>
      <div className="input-group input-group-sm mb-2">
        <input
          id="fr-find"
          className={`form-control font-monospace ${error ? 'is-invalid' : ''}`}
          value={settings.find}
          placeholder={settings.useRegex ? 'e.g. User:\\s*(.*)' : 'Text to find'}
          onChange={(e) => update({ find: e.target.value })}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          title="Escape special regex characters in the Find box and switch Regex on"
          disabled={!settings.find}
          onClick={() => update({ find: escapeRegExp(settings.find), useRegex: true })}
        >
          Escape
        </button>
      </div>

      <label htmlFor="fr-replace" className="tu-field-label">Replace with</label>
      <input
        id="fr-replace"
        className="form-control form-control-sm font-monospace mb-2"
        value={settings.replace}
        placeholder={settings.useRegex ? 'e.g. $1' : 'Leave empty to delete matches'}
        onChange={(e) => update({ replace: e.target.value })}
      />

      <div className="tu-chip-row" role="group" aria-label="Search options">
        {TOGGLES.map((t) => {
          const off = t.regexOnly && !settings.useRegex;
          if (off) return null;
          return (
            <button
              key={t.key}
              type="button"
              className={`tu-chip ${settings[t.key] ? 'is-selected' : ''}`}
              aria-pressed={settings[t.key]}
              onClick={() => update({ [t.key]: !settings[t.key] })}
            >
              <code>{t.short}</code> {t.label}
            </button>
          );
        })}
      </div>

      {settings.useRegex && (
        <div className="form-text mt-1">
          <code>$1</code> capture group, <code>$&lt;name&gt;</code> named group, <code>$&amp;</code> whole match, <code>\n</code> new line.
        </div>
      )}

      <div className="small my-2 d-flex justify-content-between gap-2">
        <span>{summary}</span>
        <Link to="/docs#tool-find-replace" className="text-nowrap">How it works</Link>
      </div>

      <button
        type="button"
        className={`tu-toggle-btn w-100 ${applied ? 'is-selected' : ''}`}
        aria-pressed={applied}
        disabled={!settings.find && !applied}
        onClick={onToggle}
      >
        <span className="tu-toggle-check" aria-hidden="true">{applied ? '✓' : '+'}</span>
        <span className="tu-toggle-text">{applied ? 'Replacing in output (click to stop)' : 'Apply replacement to output'}</span>
      </button>

      {listed.length > 0 && (
        <div className="tu-match-list mt-2">
          <div className="tu-match-list-header">
            <span>Untick to skip</span>
            <span className="d-flex gap-2">
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => fr.selectOnly(() => true)}>All</button>
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => fr.selectOnly(() => false)}>None</button>
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => fr.selectOnly((i) => i === 0)}>First only</button>
            </span>
          </div>
          <ul className="list-unstyled mb-0">
            {listed.map((m) => (
              <li key={m.i}>
                <label className="tu-match">
                  <input type="checkbox" className="form-check-input mt-0" checked={selected.has(m.i)} onChange={() => fr.toggleMatch(m.i)} />
                  <span className="tu-match-pos">{m.position.line}:{m.position.column}</span>
                  <code className="tu-match-old">{visible(m.text) || '(empty)'}</code>
                  <span aria-hidden="true">→</span>
                  <code className="tu-match-new">{visible(m.replacement) || '(delete)'}</code>
                </label>
              </li>
            ))}
          </ul>
          {matches.length > LISTED_MATCHES && (
            <div className="small text-body-secondary p-2">Showing the first {LISTED_MATCHES} of {matches.length} matches.</div>
          )}
        </div>
      )}
    </div>
  );
}
