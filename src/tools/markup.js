// XML & HTML tools. Both share one tag-level tokenizer.

const TAG = String.raw`<\/?[A-Za-z_:][^\s/>]*(?:"[^"]*"|'[^']*'|[^'">])*>`;
const RAW_ELEMENT = String.raw`<(script|style|pre|textarea)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?<\/\1\s*>`;
const COMMON = String.raw`<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<![^>]*>|${TAG}|[^<]+|<`;

const XML_TOKENS = new RegExp(COMMON, 'g');
const HTML_TOKENS = new RegExp(`${RAW_ELEMENT}|${COMMON}`, 'gi');

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);
const BLOCK_ELEMENTS = new Set([
  'address', 'article', 'aside', 'blockquote', 'body', 'div', 'dl', 'dd', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'li',
  'link', 'main', 'meta', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'title', 'tr', 'ul', 'br', 'script', 'style', 'noscript', 'option', 'select', 'textarea',
]);

function classify(value, html) {
  if (value.startsWith('<!--')) return { type: 'comment', value };
  if (value.startsWith('<![CDATA[') || value.startsWith('<?') || value.startsWith('<!')) return { type: 'special', value };
  const tag = /^<(\/?)([A-Za-z_:][^\s/>]*)/.exec(value);
  if (!tag) return { type: 'text', value };
  const name = html ? tag[2].toLowerCase() : tag[2];
  if (html && /^(script|style|pre|textarea)$/.test(name) && /<\/[^>]+>\s*$/.test(value) && !tag[1]) {
    return { type: 'raw', value, name };
  }
  if (tag[1]) return { type: 'close', value, name };
  if (/\/\s*>$/.test(value) || (html && VOID_ELEMENTS.has(name))) return { type: 'single', value, name };
  return { type: 'open', value, name };
}

const tokenize = (text, html) => (text.match(html ? HTML_TOKENS : XML_TOKENS) || []).map((v) => classify(v, html));

function formatMarkup(text, { indent = '2' } = {}, html) {
  const unit = indent === 'tab' ? '\t' : ' '.repeat(Number(indent) || 2);
  const tokens = tokenize(text, html);
  const stack = [];
  const out = [];
  const pad = () => unit.repeat(stack.length);
  const cleanText = (t) => (html ? t.replace(/\s+/g, ' ').trim() : t.trim());

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'text') {
      const value = cleanText(t.value);
      if (value) out.push(pad() + value);
    } else if (t.type === 'close') {
      const at = stack.lastIndexOf(t.name);
      if (at >= 0) stack.length = at;
      out.push(pad() + t.value);
    } else if (t.type === 'open') {
      const next = tokens[i + 1];
      const after = tokens[i + 2];
      if (next && next.type === 'close' && next.name === t.name) {
        out.push(pad() + t.value + next.value);
        i += 1;
      } else if (next && next.type === 'text' && after && after.type === 'close' && after.name === t.name) {
        out.push(pad() + t.value + cleanText(next.value) + after.value);
        i += 2;
      } else {
        out.push(pad() + t.value);
        stack.push(t.name);
      }
    } else {
      out.push(pad() + t.value.trim());
    }
  }
  return out.join('\n');
}

const collapseTagWhitespace = (tag) =>
  tag.replace(/("[^"]*"|'[^']*')|\s+/g, (m, quoted) => quoted || ' ').replace(/\s+(\/?>)$/, '$1');

/* ---------- XML ---------- */

const XML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

export const escapeXml = (text) => text.replace(/[&<>"']/g, (c) => XML_ENTITIES[c]);

export const unescapeXml = (text) =>
  text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, (m, e) => {
    const key = e.toLowerCase();
    if (key[0] === '#') {
      const code = key[1] === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : m;
    }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[key];
  });

function xmlError(text) {
  if (!text.trim()) return 'Input is empty — paste some XML first.';
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const error = doc.getElementsByTagName('parsererror')[0];
  if (!error) return null;
  const detail = error.textContent.replace(/\s+/g, ' ').trim();
  return `Invalid XML: ${detail || 'the document is not well-formed.'}`;
}

export function validateXml(text) {
  const error = xmlError(text);
  if (error) throw new Error(error);
  return { message: 'Valid XML — the document is well-formed.' };
}

export function formatXml(text, options) {
  const error = xmlError(text);
  if (error) throw new Error(error);
  return formatMarkup(text, options, false);
}

export function minifyXml(text, { removeComments = true } = {}) {
  const error = xmlError(text);
  if (error) throw new Error(error);
  return tokenize(text, false)
    .map((t) => {
      if (t.type === 'comment') return removeComments ? '' : t.value;
      if (t.type === 'text') return t.value.trim() ? t.value.trim() : '';
      if (t.type === 'special') return t.value;
      return collapseTagWhitespace(t.value);
    })
    .join('');
}

/* ---------- HTML ---------- */

export function encodeHtmlEntities(text, { encodeNonAscii = false } = {}) {
  const basic = text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return encodeNonAscii ? basic.replace(/[\u0080-\u{10FFFF}]/gu, (c) => `&#${c.codePointAt(0)};`) : basic;
}

// Parsing inside a <textarea> treats markup as plain text but still decodes every named entity.
export function decodeHtmlEntities(text) {
  const area = document.createElement('textarea');
  area.innerHTML = text.replace(/<\/textarea/gi, '&lt;/textarea');
  return area.value;
}

export const formatHtml = (text, options) => formatMarkup(text, options, true);

export function minifyHtml(text, { removeComments = true } = {}) {
  const tokens = tokenize(text, true);
  const isBlockish = (t) =>
    !t || t.type === 'comment' || t.type === 'special' || t.type === 'raw' || (t.name && BLOCK_ELEMENTS.has(t.name));
  return tokens
    .map((t, i) => {
      switch (t.type) {
        case 'comment':
          return removeComments && !t.value.startsWith('<!--[if') ? '' : t.value;
        case 'text':
          if (t.value.trim()) return t.value.replace(/\s+/g, ' ');
          return isBlockish(tokens[i - 1]) || isBlockish(tokens[i + 1]) ? '' : ' ';
        case 'raw':
          return t.value;
        default:
          return collapseTagWhitespace(t.value);
      }
    })
    .join('')
    .trim();
}

export const stripHtmlTags = (text) =>
  text
    .replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(new RegExp(TAG, 'g'), '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export function extractTextFromHtml(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  doc.querySelectorAll('script, style, noscript, template').forEach((el) => el.remove());
  let out = '';
  const walk = (node) => {
    if (node.nodeType === 3) {
      out += node.nodeValue.replace(/\s+/g, ' ');
      return;
    }
    if (node.nodeType !== 1) return;
    const name = node.nodeName.toLowerCase();
    if (name === 'br') {
      out += '\n';
      return;
    }
    const block = BLOCK_ELEMENTS.has(name);
    if (block) out += '\n';
    node.childNodes.forEach(walk);
    if (block) out += '\n';
  };
  walk(doc.body);
  return out
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
