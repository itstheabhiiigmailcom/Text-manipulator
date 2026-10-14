import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES, runTool } from '../tools/registry';
import { FIND_REPLACE_DOC, TOOL_DOCS } from '../tools/docs';
import { seededRandom } from '../tools/pipeline';
import './Docs.css';

// Distance from the top of the window (below the sticky navbar) where an entry counts as "being read".
const SPY_OFFSET = 140;

const showWhitespace = (text) => text.replace(/ /g, '·').replace(/\t/g, '→   ');

function describeOption(option) {
  if (option.type === 'checkbox') return `On/off, ${option.default ? 'on' : 'off'} by default.`;
  if (option.type === 'select') {
    const fallback = option.choices.find((c) => c.value === option.default);
    return `Choose ${option.choices.map((c) => c.label).join(', ')}. Default: ${fallback ? fallback.label : option.default}.`;
  }
  if (option.type === 'number') return `A number. Default: ${option.default}.`;
  return option.default ? `Text. Default: "${option.default}".` : 'Text you type.';
}

function Example({ tool, category, group, doc }) {
  const input = doc.example ?? group.sample ?? category.sample ?? 'hello world example';
  let output;
  let error;
  try {
    const result = runTool(tool, input, { ...doc.options, random: seededRandom(7) });
    output = result.output ?? result.message;
  } catch (e) {
    error = e.message;
  }
  const show = (text) => (doc.whitespace ? showWhitespace(text) : text);
  const optionNote =
    doc.options &&
    Object.entries(doc.options)
      .map(([key, value]) => {
        const option = tool.options?.find((o) => o.key === key);
        const choice = option?.choices?.find((c) => c.value === value);
        return `${option ? option.label : key}: ${choice ? choice.label : value === true ? 'on' : value}`;
      })
      .join(', ');

  return (
    <div className="tu-doc-example">
      <div>
        <div className="tu-doc-example-label">Input</div>
        <pre>{show(input)}</pre>
      </div>
      <div>
        <div className="tu-doc-example-label">
          Output{optionNote && <span className="fw-normal"> ({optionNote})</span>}
        </div>
        <pre className={error ? 'text-danger' : ''}>{error || show(output) || '(empty)'}</pre>
      </div>
      {doc.whitespace && <div className="tu-doc-example-note">· = space, → = tab</div>}
    </div>
  );
}

function ToolDoc({ tool, category, group, isTarget }) {
  const doc = TOOL_DOCS[tool.id] || {};
  return (
    <article id={`tool-${tool.id}`} className={`tu-doc-tool ${isTarget ? 'is-target' : ''}`}>
      <header className="tu-doc-tool-header">
        <h4>
          {category.layout === 'tabs' || category.pairs ? `${group.title} · ` : ''}
          {tool.label}
        </h4>
        <Link className="btn btn-sm btn-outline-primary" to={`/tools?select=${tool.id}`}>
          Try it →
        </Link>
      </header>
      <p className="tu-doc-summary">{tool.description}</p>
      {doc.details && <p>{doc.details}</p>}
      {doc.use && (
        <p>
          <strong>Good for:</strong> {doc.use}
        </p>
      )}
      {tool.options && (
        <dl className="tu-doc-options">
          {tool.options.map((option) => (
            <React.Fragment key={option.key}>
              <dt>{option.label}</dt>
              <dd>{describeOption(option)}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      <Example tool={tool} category={category} group={group} doc={doc} />
      <div className="tu-doc-where">
        Find it in: All Tools → {category.label}
        {category.layout === 'tabs' || category.groups.length > 1 ? ` → ${group.title}` : ''}
        {tool.more ? ' (under "Show more")' : ''}
      </div>
    </article>
  );
}

function FindReplaceDoc({ isTarget }) {
  const d = FIND_REPLACE_DOC;
  return (
    <article id="tool-find-replace" className={`tu-doc-tool ${isTarget ? 'is-target' : ''}`}>
      <header className="tu-doc-tool-header">
        <h4>Find & Replace</h4>
        <Link className="btn btn-sm btn-outline-primary" to="/tools?select=find-replace">
          Try it →
        </Link>
      </header>
      <p className="tu-doc-summary">Search the text with plain words or regular expressions and replace what you find.</p>
      <p>{d.details}</p>
      <dl className="tu-doc-options">
        {d.options.map(([name, text]) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd>{text}</dd>
          </React.Fragment>
        ))}
      </dl>
      <p className="mb-1">
        <strong>Special codes in "Replace with"</strong> (Regex on):
      </p>
      <dl className="tu-doc-options">
        {d.tokens.map(([code, text]) => (
          <React.Fragment key={code}>
            <dt>
              <code>{code}</code>
            </dt>
            <dd>{text}</dd>
          </React.Fragment>
        ))}
      </dl>
      <div className="tu-doc-example">
        <div>
          <div className="tu-doc-example-label">Input</div>
          <pre>{d.example.input}</pre>
        </div>
        <div>
          <div className="tu-doc-example-label">
            Output <span className="fw-normal">(Find: <code>{d.example.find}</code>, Replace: <code>{d.example.replace}</code>, Regex on)</span>
          </div>
          <pre>{d.example.output}</pre>
        </div>
      </div>
    </article>
  );
}

const tocLabel = (section, group, tool) =>
  section.category.layout === 'tabs' || section.category.pairs ? `${group.title} ${tool.label}` : tool.label;

const matchesQuery = (query, ...texts) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = texts.join(' ').toLowerCase();
  return terms.every((t) => haystack.includes(t));
};

export default function Docs() {
  const { hash, key } = useLocation();
  const navigate = useNavigate();
  const target = decodeURIComponent(hash.slice(1));
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!target) return undefined;
    setQuery('');
    // Wait a frame so the (unfiltered) list is rendered before scrolling.
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(target);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [target, key]);

  // On small screens the contents list is a dropdown under a sticky bar.
  const [tocOpen, setTocOpen] = useState(false);
  const asideRef = useRef(null);

  useEffect(() => {
    if (!tocOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setTocOpen(false);
    const onPointer = (e) => asideRef.current && !asideRef.current.contains(e.target) && setTocOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [tocOpen]);

  const jump = (event, id) => {
    event.preventDefault();
    setTocOpen(false);
    navigate({ hash: id }, { replace: true });
  };

  const sections = useMemo(
    () =>
      CATEGORIES.map((category) => {
        if (category.custom === 'findReplace') {
          const show = !query || matchesQuery(query, 'find replace regex search', FIND_REPLACE_DOC.details);
          return { category, groups: [], showFind: show };
        }
        const groups = category.groups
          .map((group) => ({
            group,
            tools: group.tools.filter(
              (tool) =>
                !query ||
                matchesQuery(query, tool.label, tool.description, tool.keywords, TOOL_DOCS[tool.id]?.details, group.title, category.label)
            ),
          }))
          .filter((g) => g.tools.length);
        return { category, groups };
      }).filter((s) => s.groups.length || s.showFind),
    [query]
  );

  // Scroll-spy: the entry nearest the top of the screen is the "current" one in the contents list.
  const [activeId, setActiveId] = useState(target || 'getting-started');
  const tocRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const entries = document.querySelectorAll('#getting-started, .tu-doc-tool');
      if (!entries.length) return;
      const scrollable = document.documentElement.scrollHeight > window.innerHeight;
      const atBottom = scrollable && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = entries[0].id;
      if (atBottom) {
        // The last entries can never reach the top, so keep a visible jump target or take the last one.
        const targetEl = target && document.getElementById(target);
        const targetVisible = targetEl && targetEl.getBoundingClientRect().top < window.innerHeight;
        current = targetVisible ? target : entries[entries.length - 1].id;
      } else {
        for (const el of entries) {
          if (el.getBoundingClientRect().top > SPY_OFFSET) break;
          current = el.id;
        }
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [sections, target]);

  // Keep the highlighted link visible inside the (separately scrolling) contents list.
  useEffect(() => {
    const toc = tocRef.current;
    const link = toc && toc.querySelector('.tu-toc-tool.is-active, .tu-toc-category.is-active');
    if (!link) return;
    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    if (top < toc.scrollTop + 60) toc.scrollTop = Math.max(0, top - 60);
    else if (bottom > toc.scrollTop + toc.clientHeight - 20) toc.scrollTop = bottom - toc.clientHeight + 60;
  }, [activeId, tocOpen]);

  const linkClass = (base, id) => `${base} ${activeId === id ? 'is-active' : ''}`;
  const activeLabel = useMemo(() => {
    if (activeId === 'getting-started') return 'Getting started';
    if (activeId === 'tool-find-replace') return 'Find & Replace';
    for (const section of sections) {
      for (const { group, tools } of section.groups) {
        const tool = tools.find((t) => activeId === `tool-${t.id}`);
        if (tool) return `${section.category.label} · ${tocLabel(section, group, tool)}`;
      }
    }
    return 'Documentation';
  }, [activeId, sections]);
  const categoryHasActive = ({ groups, showFind }) =>
    (showFind && activeId === 'tool-find-replace') || groups.some(({ tools }) => tools.some((t) => activeId === `tool-${t.id}`));

  return (
    <div className="container-fluid tu-container tu-docs">
      <aside className={`tu-docs-toc ${tocOpen ? 'is-open' : ''}`} aria-label="Contents" ref={asideRef}>
        <button
          type="button"
          className="tu-docs-toc-toggle"
          aria-expanded={tocOpen}
          aria-controls="docs-toc-panel"
          onClick={() => setTocOpen(!tocOpen)}
        >
          <span className="tu-docs-toc-heading">Contents</span>
          <span className="tu-docs-toc-current">{activeLabel}</span>
          <span className="tu-chevron" aria-hidden="true">▾</span>
        </button>
        <div id="docs-toc-panel" className="tu-docs-toc-panel" ref={tocRef}>
          <input
            type="search"
            className="form-control form-control-sm mb-2"
            placeholder="Filter actions…"
            aria-label="Filter documentation"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <nav>
            {!query && (
              <a
                href="#getting-started"
                className={linkClass('tu-toc-category', 'getting-started')}
                aria-current={activeId === 'getting-started' ? 'location' : undefined}
                onClick={(e) => jump(e, 'getting-started')}
              >
                Getting started
              </a>
            )}
            {sections.map((section) => (
              <div key={section.category.id}>
                <a
                  href={`#cat-${section.category.id}`}
                  className={`tu-toc-category ${categoryHasActive(section) ? 'is-current' : ''}`}
                  onClick={(e) => jump(e, `cat-${section.category.id}`)}
                >
                  {section.category.label}
                </a>
                {section.showFind && (
                  <a
                    href="#tool-find-replace"
                    className={linkClass('tu-toc-tool', 'tool-find-replace')}
                    aria-current={activeId === 'tool-find-replace' ? 'location' : undefined}
                    onClick={(e) => jump(e, 'tool-find-replace')}
                  >
                    Find & Replace
                  </a>
                )}
                {section.groups.flatMap(({ group, tools }) =>
                  tools.map((tool) => (
                    <a
                      key={tool.id}
                      href={`#tool-${tool.id}`}
                      className={linkClass('tu-toc-tool', `tool-${tool.id}`)}
                      aria-current={activeId === `tool-${tool.id}` ? 'location' : undefined}
                      onClick={(e) => jump(e, `tool-${tool.id}`)}
                    >
                      {tocLabel(section, group, tool)}
                    </a>
                  ))
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="tu-docs-content">
        <h1>Documentation</h1>
        <p className="lead">Everything Textsmith can do, explained in plain words with a real example for each action.</p>

        {!query && (
          <section id="getting-started" className="tu-doc-intro">
            <h2>Getting started</h2>
            <ol>
              <li>
                <strong>Quick edits:</strong> the <Link to="/">Textsmith</Link> home page has the most common actions — uppercase, lowercase, title case, removing extra spaces and cleaning text — plus word and character counts.
              </li>
              <li>
                <strong>All tools:</strong> on <Link to="/tools">All Tools</Link>, type or paste into <em>Input</em>. Open a section in the Tools panel (on the right, or the Tools button on phones) and click an action to select it. The result appears in <em>Output</em> immediately and keeps updating while you type.
              </li>
              <li>
                <strong>Combine actions:</strong> selected actions stay highlighted and numbered. Select several and they run in that order (1, 2, 3…). Click an action again, or the × in the "Applied" bar, to remove it.
              </li>
              <li>
                <strong>Keep going:</strong> "Use as input" moves the output into the input so you can start fresh with new actions.
              </li>
              <li>
                <strong>Need help?</strong> Hover over any action to see what it does, then click "Learn more" to jump to its entry on this page.
              </li>
            </ol>
            <p className="mb-0">Your text never leaves your browser — nothing is uploaded to a server.</p>
          </section>
        )}

        {sections.length === 0 && <p className="text-body-secondary">No actions match “{query}”.</p>}

        {sections.map(({ category, groups, showFind }) => (
          <section key={category.id} id={`cat-${category.id}`} className="tu-doc-category">
            <h2>
              <span className="tu-doc-glyph" aria-hidden="true">{category.glyph}</span>
              {category.label}
            </h2>
            <p className="text-body-secondary">{category.description}</p>
            {showFind && <FindReplaceDoc isTarget={target === 'tool-find-replace'} />}
            {groups.map(({ group, tools }) => (
              <div key={group.title} className="tu-doc-group">
                {(category.layout === 'tabs' || category.groups.length > 1) && <h3>{group.title}</h3>}
                {tools.map((tool) => (
                  <ToolDoc key={tool.id} tool={tool} category={category} group={group} isTarget={target === `tool-${tool.id}`} />
                ))}
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}