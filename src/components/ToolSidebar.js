import React, { useState } from 'react';
import { CATEGORIES, defaultOptions, searchTools } from '../tools/registry';
import FindReplacePanel from './FindReplacePanel';
import HoverInfo from './HoverInfo';

function OptionField({ tool, option, value, onChange }) {
  const id = `${tool.id}-${option.key}`;
  if (option.type === 'checkbox') {
    return (
      <div className="form-check tu-option-check">
        <input id={id} type="checkbox" className="form-check-input" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <label className="form-check-label" htmlFor={id}>
          {option.label}
        </label>
      </div>
    );
  }
  return (
    <div className="tu-option">
      <label htmlFor={id}>{option.label}</label>
      {option.type === 'select' ? (
        <select id={id} className="form-select form-select-sm" value={value} onChange={(e) => onChange(e.target.value)}>
          {option.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={option.type}
          min={option.min}
          className="form-control form-control-sm"
          value={value}
          placeholder={option.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ToolToggle({ tool, tag, alwaysShowOptions, steps, toolOptions, onToggle, onOptionsChange }) {
  const position = steps.findIndex((s) => s.toolId === tool.id);
  const selected = position >= 0;
  const values = { ...defaultOptions(tool), ...toolOptions[tool.id] };
  const showOptions = tool.options && (selected || alwaysShowOptions);

  const button = (
    <HoverInfo
      title={tool.label}
      description={`${tool.description}${selected ? ' Click again to remove it.' : ''}`}
      docId={`tool-${tool.id}`}
      block={Boolean(showOptions)}
    >
      <button
        type="button"
        className={`tu-toggle-btn ${selected ? 'is-selected' : ''}`}
        aria-pressed={selected}
        onClick={() => onToggle(tool.id)}
      >
        <span className="tu-toggle-check" aria-hidden="true">{selected ? position + 1 : '+'}</span>
        <span className="tu-toggle-text">
          <span>{tool.label}</span>
          {tool.hint && <span className="tu-toggle-hint">{tool.hint}</span>}
          {tag && <span className="tu-toggle-hint">{tag}</span>}
        </span>
      </button>
    </HoverInfo>
  );

  if (!showOptions) return button;
  return (
    <div className={`tu-toggle-with-options ${selected ? 'is-selected' : ''}`}>
      {button}
      <div className="tu-options">
        {tool.options.map((option) => (
          <OptionField
            key={option.key}
            tool={tool}
            option={option}
            value={values[option.key]}
            onChange={(value) => onOptionsChange(tool.id, { ...toolOptions[tool.id], [option.key]: value })}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryBody({ category, toggleProps }) {
  const [tab, setTab] = useState(() => {
    const withSelection = category.groups.findIndex((g) => g.tools.some((t) => toggleProps.steps.some((s) => s.toolId === t.id)));
    return Math.max(0, withSelection);
  });
  const [showMore, setShowMore] = useState(false);
  const isSelected = (tool) => toggleProps.steps.some((s) => s.toolId === tool.id);
  const groups = category.layout === 'tabs' ? [category.groups[tab]] : category.groups;
  const hiddenCount = groups.reduce((n, g) => n + g.tools.filter((t) => t.more && !isSelected(t)).length, 0);

  return (
    <>
      {category.layout === 'tabs' && (
        <div className="tu-subtabs" role="tablist">
          {category.groups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              role="tab"
              aria-selected={i === tab}
              className={`tu-subtab ${i === tab ? 'is-active' : ''}`}
              onClick={() => setTab(i)}
            >
              {g.title}
            </button>
          ))}
        </div>
      )}
      {groups.map((group) => {
        const visible = group.tools.filter((t) => showMore || !t.more || isSelected(t));
        if (!visible.length) return null;
        return (
          <div className="tu-group" key={group.title}>
            {category.layout !== 'tabs' && <div className="tu-group-title">{group.title}</div>}
            {group.description && <div className="tu-group-description">{group.description}</div>}
            <div className="tu-tools">
              {visible.map((tool) => (
                <ToolToggle key={tool.id} tool={tool} alwaysShowOptions={category.groups.length === 1 && group.tools.length === 1} {...toggleProps} />
              ))}
            </div>
          </div>
        );
      })}
      {(hiddenCount > 0 || showMore) && (
        <button type="button" className="btn btn-link btn-sm px-0 tu-more" onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Show fewer tools' : `Show ${hiddenCount} more tool${hiddenCount === 1 ? '' : 's'}`}
        </button>
      )}
    </>
  );
}

export default function ToolSidebar({ collapsed, onCollapse, steps, onClearSteps, fr, findSelected, onToggleFind, toggleProps, initialOpen = 'clean' }) {
  const [query, setQuery] = useState('');
  // Only one section is open at a time; opening another closes the previous one.
  const [openId, setOpenId] = useState(initialOpen);
  const results = searchTools(query);
  const selectedIn = (category) =>
    category.custom === 'findReplace' ? (findSelected ? 1 : 0) : steps.filter((s) => category.groups.some((g) => g.tools.some((t) => t.id === s.toolId))).length;

  const toggleSection = (id) => setOpenId((current) => (current === id ? null : id));

  if (collapsed) {
    return (
      <aside className="tu-sidebar is-collapsed">
        <button type="button" className="tu-rail-btn" onClick={() => onCollapse(false)} aria-label="Show tools panel" title="Show tools panel">
          <span aria-hidden="true">«</span>
          <span className="tu-rail-label">Tools</span>
          {steps.length > 0 && <span className="badge rounded-pill text-bg-primary">{steps.length}</span>}
        </button>
      </aside>
    );
  }

  return (
    <aside className="tu-sidebar" aria-label="Tools panel">
      <div className="tu-sidebar-header">
        <div className="d-flex align-items-center gap-2">
          <h2 className="tu-sidebar-title">Tools</h2>
          {steps.length > 0 && <span className="badge rounded-pill text-bg-primary">{steps.length} selected</span>}
        </div>
        <div className="d-flex gap-1">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onCollapse(true)} aria-label="Hide tools panel" title="Hide tools panel">
            »
          </button>
        </div>
      </div>
      <input
        type="search"
        className="form-control form-control-sm tu-sidebar-search"
        placeholder="Search tools (e.g. json, sort, hex)…"
        aria-label="Search all tools"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="tu-sidebar-body">
        {query ? (
          <div className="tu-search-results">
            {results.length === 0 && <p className="small text-body-secondary">No tools match “{query}”.</p>}
            <div className="tu-tools">
              {results.map((tool) => (
                <ToolToggle key={tool.id} tool={tool} tag={`${tool.category.label} · ${tool.group.title}`} {...toggleProps} />
              ))}
            </div>
          </div>
        ) : (
          CATEGORIES.map((category) => {
            const isOpen = openId === category.id;
            const count = selectedIn(category);
            return (
              <section key={category.id} className={`tu-section ${isOpen ? 'is-open' : ''}`}>
                <button type="button" className="tu-section-header" aria-expanded={isOpen} onClick={() => toggleSection(category.id)}>
                  <span className="tu-section-glyph" aria-hidden="true">{category.glyph}</span>
                  <span className="tu-section-text">
                    <span className="tu-section-label">{category.label}</span>
                    <span className="tu-section-description">{category.description}</span>
                  </span>
                  {count > 0 && <span className="badge rounded-pill text-bg-primary">{count}</span>}
                  <span className="tu-chevron" aria-hidden="true">▾</span>
                </button>
                {isOpen && (
                  <div className="tu-section-body">
                    {category.custom === 'findReplace' ? (
                      <FindReplacePanel fr={fr} selected={findSelected} onToggle={onToggleFind} />
                    ) : (
                      <CategoryBody category={category} toggleProps={toggleProps} />
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {steps.length > 0 && (
        <div className="tu-sidebar-footer">
          <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={onClearSteps}>
            Remove all selected tools
          </button>
        </div>
      )}
    </aside>
  );
}
