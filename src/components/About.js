import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../tools/registry';
import Logo from './Logo';
import './About.css';

const PRINCIPLES = [
  {
    title: 'Private by design',
    text: 'Everything runs inside your browser. Your text is never uploaded, stored on a server or shared with anyone.',
  },
  {
    title: 'Free, no sign-up',
    text: 'No accounts, no paywalls, no limits on how much you use it. Open the page and start working.',
  },
  {
    title: 'Simple first',
    text: 'The everyday actions are one click away. Advanced tools are there when you need them, without getting in the way.',
  },
  {
    title: 'Fast and offline-friendly',
    text: 'Results appear instantly as you type because nothing has to travel to a server and back.',
  },
];

const AUDIENCES = [
  { title: 'Writers & students', text: 'Count words, fix spacing, change case and clean up copied text.' },
  { title: 'Developers', text: 'Format JSON, XML, HTML and SQL, convert naming styles, encode data and test regex.' },
  { title: 'Data & office work', text: 'Sort lists, remove duplicates, convert CSV ↔ JSON and tidy spreadsheet exports.' },
  { title: 'Marketers & SEO', text: 'Make URL slugs, strip HTML, and keep within character limits for posts and ads.' },
];

const FAQ = [
  {
    q: 'Is my text safe?',
    a: 'Yes. Textsmith works entirely in your browser — your text is processed on your own device and never sent anywhere. Your last input is remembered only in your browser’s local storage so it is still there when you come back.',
  },
  {
    q: 'Can I use several actions at once?',
    a: 'Yes. On All Tools, every action you select stays selected and runs in order, so you can, for example, remove blank lines, then sort, then convert to uppercase — and the output updates live as you type.',
  },
  {
    q: 'Does it work on my phone?',
    a: 'Yes. The layout adapts to small screens, and it works in any modern browser such as Chrome, Firefox, Edge and Safari.',
  },
  {
    q: 'How do I learn what an action does?',
    a: 'Hover over any action to see a short explanation, or open the Docs page for detailed descriptions with real examples.',
  },
];

export default function About() {
  const toolCount = CATEGORIES.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.tools.length, 0), 0) + 1;

  return (
    <div className="container tu-about">
      <section className="tu-about-hero">
        <Logo size={64} />
        <h1 className="mt-3">About Textsmith</h1>
        <p className="lead">
          Textsmith is a free, private toolbox for everything you do with text — from counting words to formatting JSON — right in your
          browser.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/tools" className="btn btn-primary">
            Explore all tools
          </Link>
          <Link to="/docs" className="btn btn-outline-primary">
            Read the docs
          </Link>
        </div>
      </section>

      <section className="tu-about-section">
        <h2>Our goal</h2>
        <p>
          Everyone works with text: emails, essays, spreadsheets, code, logs. Small jobs like removing extra spaces, sorting a list or
          converting a JSON file usually mean searching for a different website each time — often full of ads, sign-ups or uploads you
          can’t trust.
        </p>
        <p>
          Textsmith brings all of those everyday jobs together in one clean, fast place. Our goal is simple: <strong>make working with text
          effortless, for everyone, without giving up your privacy.</strong>
        </p>
        <div className="tu-about-stats">
          <div>
            <strong>{toolCount}+</strong>
            <span>text actions</span>
          </div>
          <div>
            <strong>{CATEGORIES.length}</strong>
            <span>categories</span>
          </div>
          <div>
            <strong>0</strong>
            <span>uploads to servers</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>free, no sign-up</span>
          </div>
        </div>
      </section>

      <section className="tu-about-section">
        <h2>What you can do</h2>
        <div className="tu-about-grid">
          <div className="tu-about-card">
            <span className="tu-about-glyph" aria-hidden="true">Aa</span>
            <h3>Quick edits</h3>
            <p>
              The <Link to="/">Textsmith</Link> home page gives you instant word and character counts, reading time, and the most-used
              actions in one click.
            </p>
          </div>
          {CATEGORIES.map((c) => (
            <div key={c.id} className="tu-about-card">
              <span className="tu-about-glyph" aria-hidden="true">{c.glyph}</span>
              <h3>{c.label}</h3>
              <p>{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tu-about-section">
        <h2>How it works</h2>
        <ol className="tu-about-steps">
          <li>
            <strong>Paste your text</strong>
            <span>Type or paste anything into the Input box.</span>
          </li>
          <li>
            <strong>Pick actions</strong>
            <span>Choose one or more actions from the tools panel. They stay selected and run in order.</span>
          </li>
          <li>
            <strong>Copy the result</strong>
            <span>The Output updates live. Copy it, or use it as new input and keep going.</span>
          </li>
        </ol>
      </section>

      <section className="tu-about-section">
        <h2>What we believe in</h2>
        <div className="tu-about-grid">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="tu-about-card">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tu-about-section">
        <h2>Who it’s for</h2>
        <div className="tu-about-grid">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="tu-about-card">
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tu-about-section">
        <h2>Frequently asked questions</h2>
        <div className="accordion" id="aboutFaq">
          {FAQ.map((item, i) => (
            <div className="accordion-item" key={item.q}>
              <h3 className="accordion-header">
                <button
                  className={`accordion-button ${i === 0 ? '' : 'collapsed'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#faq-${i}`}
                  aria-expanded={i === 0}
                  aria-controls={`faq-${i}`}
                >
                  {item.q}
                </button>
              </h3>
              <div id={`faq-${i}`} className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`} data-bs-parent="#aboutFaq">
                <div className="accordion-body">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tu-about-cta">
        <h2>Ready to try it?</h2>
        <p>Paste some text and see what Textsmith can do in seconds.</p>
        <Link to="/tools" className="btn btn-primary btn-lg">
          Open All Tools
        </Link>
      </section>
    </div>
  );
}
