export const MAX_MATCHES = 5000;

export const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

// Returns a global RegExp for the given settings, or null when there is nothing to find.
// Throws a SyntaxError for an invalid user-supplied pattern.
export function buildRegex(find, { useRegex, caseSensitive, wholeWord, multiline, dotAll } = {}) {
  if (!find) return null;
  let source = useRegex ? find : escapeRegExp(find);
  if (wholeWord) source = `(?<!\\w)(?:${source})(?!\\w)`;
  const flags = 'g' + (caseSensitive ? '' : 'i') + (multiline ? 'm' : '') + (dotAll ? 's' : '');
  return new RegExp(source, flags);
}

export function findMatches(text, regex, limit = MAX_MATCHES) {
  const matches = [];
  if (!regex) return matches;
  for (const m of text.matchAll(regex)) {
    matches.push({ index: m.index, length: m[0].length, text: m[0], captures: [...m], named: m.groups });
    if (matches.length >= limit) break;
  }
  return matches;
}

// Expands $&, $1, $<name>, $$ etc. the same way String.prototype.replace does,
// plus \n and \t escapes so a regex replacement can introduce line breaks.
export function expandReplacement(template, match, input, useRegex) {
  if (!useRegex) return template;
  const groupCount = match.captures.length - 1;
  return template
    .replace(/\\(n|t|\\)/g, (_, c) => ({ n: '\n', t: '\t', '\\': '\\' }[c]))
    .replace(/\$(\$|&|`|'|\d{1,2}|<[^>]*>)/g, (token, ref) => {
      if (ref === '$') return '$';
      if (ref === '&') return match.text;
      if (ref === '`') return input.slice(0, match.index);
      if (ref === "'") return input.slice(match.index + match.length);
      if (ref[0] === '<') {
        if (!match.named) return token;
        return match.named[ref.slice(1, -1)] ?? '';
      }
      const n = Number(ref);
      if (n >= 1 && n <= groupCount) return match.captures[n] ?? '';
      if (ref.length === 2) {
        const single = Number(ref[0]);
        if (single >= 1 && single <= groupCount) return (match.captures[single] ?? '') + ref[1];
      }
      return token;
    });
}

// Replaces the matches whose position in `matches` is in `selected` (all when omitted).
export function replaceMatches(text, matches, template, useRegex, selected) {
  let out = '';
  let last = 0;
  matches.forEach((m, i) => {
    if (selected && !selected.has(i)) return;
    out += text.slice(last, m.index) + expandReplacement(template, m, text, useRegex);
    last = m.index + m.length;
  });
  return out + text.slice(last);
}

export function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  return { line, column: index - before.lastIndexOf('\n') };
}
