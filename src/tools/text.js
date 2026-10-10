// Pure text transformations used by the "Clean & Format" and "Lines" categories.

const LINE_BREAK = /\r\n|\r|\n/;
const TRAILING_BREAK = /(\r\n|\r|\n)$/;

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// Runs `fn` over the lines of `text`. A single trailing line break is kept out of the
// line list (so sorting doesn't float an empty line to the top) and restored afterwards.
export function mapLines(text, fn) {
  const hasTrailingBreak = TRAILING_BREAK.test(text);
  const body = hasTrailingBreak ? text.replace(TRAILING_BREAK, '') : text;
  const lines = fn(body.split(LINE_BREAK));
  return lines.join('\n') + (hasTrailingBreak && lines.length ? '\n' : '');
}

const eachLine = (text, fn) => mapLines(text, (lines) => lines.map(fn));

// Lets option fields accept "\n" and "\t" as separators.
export const unescapeOption = (value) =>
  String(value).replace(/\\(n|t|r|\\)/g, (_, c) => ({ n: '\n', t: '\t', r: '\r', '\\': '\\' }[c]));

const toCount = (value, fallback = 1) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

/* ---------- Whitespace ---------- */

export const removeExtraSpaces = (text) =>
  eachLine(text, (line) => line.replace(/[ \t\u00A0]+/g, ' ').trim());

export const collapseSpaces = (text) => text.replace(/ {2,}/g, ' ');

export const removeLeadingSpaces = (text) => eachLine(text, (line) => line.replace(/^[ \t\u00A0]+/, ''));

export const removeTrailingSpaces = (text) => eachLine(text, (line) => line.replace(/[ \t\u00A0]+$/, ''));

export const trimLines = (text) => eachLine(text, (line) => line.replace(/^[ \t\u00A0]+|[ \t\u00A0]+$/g, ''));

export function tabsToSpaces(text, { tabWidth = 4 } = {}) {
  const width = Math.max(1, toCount(tabWidth, 4));
  return eachLine(text, (line) => {
    let out = '';
    for (const ch of line) {
      if (ch === '\t') out += ' '.repeat(width - (out.length % width));
      else out += ch;
    }
    return out;
  });
}

export function spacesToTabs(text, { tabWidth = 4 } = {}) {
  const width = Math.max(1, toCount(tabWidth, 4));
  return text.replace(new RegExp(` {${width}}`, 'g'), '\t');
}

export const normalizeLineBreaks = (text) =>
  text.replace(/\r\n|\r|\u2028|\u2029|\u0085/g, '\n').replace(/\n[ \t]*(\n[ \t]*)+\n/g, '\n\n');

/* ---------- Empty lines & duplicates ---------- */

export const removeBlankLines = (text) => mapLines(text, (lines) => lines.filter((l) => l.trim() !== ''));

export const removeEmptyLines = (text) => mapLines(text, (lines) => lines.filter((l) => l !== ''));

export function removeDuplicateLines(text, { ignoreCase = false } = {}) {
  return mapLines(text, (lines) => {
    const seen = new Set();
    return lines.filter((line) => {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
}

export function removeDuplicateWords(text) {
  const seen = new Set();
  return eachLine(text, (line) =>
    line
      .split(/\s+/)
      .filter((word) => {
        if (!word) return false;
        const key = word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') || word;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join(' ')
  );
}

// One-click cleanup: trim, collapse spaces, drop blank and duplicate lines.
export const cleanText = (text) =>
  removeDuplicateLines(removeBlankLines(removeExtraSpaces(normalizeLineBreaks(text)))).replace(/\n$/, '');

/* ---------- Indentation ---------- */

const indentUnit = (style) => (style === 'tab' ? '\t' : ' '.repeat(Number(style) || 2));

export const indentLines = (text, { style = '2' } = {}) =>
  eachLine(text, (line) => (line === '' ? line : indentUnit(style) + line));

export function outdentLines(text, { style = '2' } = {}) {
  const width = style === 'tab' ? 4 : Number(style) || 2;
  const pattern = new RegExp(`^(\\t| {1,${width}})`);
  return eachLine(text, (line) => line.replace(pattern, ''));
}

/* ---------- Reverse ---------- */

export const reverseText = (text) => Array.from(text).reverse().join('');

export const reverseWords = (text) =>
  eachLine(text, (line) => line.split(/\s+/).filter(Boolean).reverse().join(' '));

export const reverseEachWord = (text) =>
  eachLine(text, (line) => line.replace(/\S+/g, (word) => Array.from(word).reverse().join('')));

/* ---------- Sorting & ordering ---------- */

export const sortAZ = (text) => mapLines(text, (lines) => [...lines].sort(collator.compare));

export const sortZA = (text) => mapLines(text, (lines) => [...lines].sort((a, b) => collator.compare(b, a)));

export const sortByLength = (text, { order = 'asc' } = {}) =>
  mapLines(text, (lines) =>
    [...lines].sort((a, b) => (order === 'desc' ? b.length - a.length : a.length - b.length))
  );

export const reverseLines = (text) => mapLines(text, (lines) => [...lines].reverse());

export function shuffleLines(text, { random = Math.random } = {}) {
  return mapLines(text, (lines) => {
    const out = [...lines];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  });
}

/* ---------- Filtering ---------- */

const lineMatcher = (query, ignoreCase) => {
  const needle = ignoreCase ? query.toLowerCase() : query;
  return (line) => (ignoreCase ? line.toLowerCase() : line).includes(needle);
};

export function removeLinesContaining(text, { query = '', ignoreCase = true } = {}) {
  if (!query) throw new Error('Enter the text that lines should contain.');
  const matches = lineMatcher(query, ignoreCase);
  return mapLines(text, (lines) => lines.filter((l) => !matches(l)));
}

export function keepLinesContaining(text, { query = '', ignoreCase = true } = {}) {
  if (!query) throw new Error('Enter the text that lines should contain.');
  const matches = lineMatcher(query, ignoreCase);
  return mapLines(text, (lines) => lines.filter(matches));
}

export function uniqueLinesOnly(text) {
  return mapLines(text, (lines) => {
    const counts = new Map();
    lines.forEach((l) => counts.set(l, (counts.get(l) || 0) + 1));
    return lines.filter((l) => counts.get(l) === 1);
  });
}

export const duplicateLines = (text, { times = 2 } = {}) =>
  mapLines(text, (lines) => lines.flatMap((l) => Array(Math.max(1, toCount(times, 2))).fill(l)));

/* ---------- Selecting ---------- */

export const keepFirstLines = (text, { count = 10 } = {}) =>
  mapLines(text, (lines) => lines.slice(0, toCount(count, 10)));

export const keepLastLines = (text, { count = 10 } = {}) =>
  mapLines(text, (lines) => {
    const n = toCount(count, 10);
    return n === 0 ? [] : lines.slice(-n);
  });

export const removeFirstLines = (text, { count = 1 } = {}) =>
  mapLines(text, (lines) => lines.slice(toCount(count, 1)));

export const removeLastLines = (text, { count = 1 } = {}) =>
  mapLines(text, (lines) => lines.slice(0, Math.max(0, lines.length - toCount(count, 1))));

export function everyNthLine(text, { step = 2, start = 1 } = {}) {
  const n = Math.max(1, toCount(step, 2));
  const first = Math.max(1, toCount(start, 1)) - 1;
  return mapLines(text, (lines) => lines.filter((_, i) => i >= first && (i - first) % n === 0));
}

/* ---------- Join & split ---------- */

export const mergeLines = (text, { separator = ' ', skipEmpty = true } = {}) =>
  text
    .split(LINE_BREAK)
    .filter((l) => !skipEmpty || l.trim() !== '')
    .join(unescapeOption(separator));

export function splitToLines(text, { delimiter = ',', trim = true } = {}) {
  const sep = unescapeOption(delimiter);
  if (!sep) throw new Error('Enter a delimiter to split on.');
  return text
    .split(sep)
    .map((part) => (trim ? part.trim() : part))
    .join('\n');
}

/* ---------- Decorate ---------- */

export const addPrefix = (text, { prefix = '' } = {}) =>
  eachLine(text, (line) => unescapeOption(prefix) + line);

export const addSuffix = (text, { suffix = '' } = {}) =>
  eachLine(text, (line) => line + unescapeOption(suffix));

export function addLineNumbers(text, { start = 1, separator = '. ' } = {}) {
  const first = Math.floor(Number(start));
  const from = Number.isFinite(first) ? first : 1;
  const sep = unescapeOption(separator);
  return mapLines(text, (lines) => {
    const width = String(from + lines.length - 1).length;
    return lines.map((line, i) => String(from + i).padStart(width, ' ') + sep + line);
  });
}

export const removeLineNumbers = (text) =>
  eachLine(text, (line) => line.replace(/^[ \t]*\d+[ \t]*[.):\]|-]?[ \t]?/, ''));

/* ---------- Stats ---------- */

export function textStats(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return {
    words,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    lines: text === '' ? 0 : text.split(LINE_BREAK).length,
    readingMinutes: words / 200,
  };
}
