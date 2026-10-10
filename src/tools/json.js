const indentValue = (indent) => (indent === 'tab' ? '\t' : Number(indent) || 2);

function positionToLineColumn(text, position) {
  const before = text.slice(0, position);
  const line = before.split('\n').length;
  return `line ${line}, column ${position - before.lastIndexOf('\n')}`;
}

export function parseJson(text) {
  if (!text.trim()) throw new Error('Input is empty — paste some JSON first.');
  try {
    return JSON.parse(text);
  } catch (e) {
    const position = /position (\d+)/.exec(e.message);
    const where = position && !/line \d+/.test(e.message) ? ` (${positionToLineColumn(text, Number(position[1]))})` : '';
    throw new Error(`Invalid JSON: ${e.message}${where}`);
  }
}

export const formatJson = (text, { indent = '2' } = {}) => JSON.stringify(parseJson(text), null, indentValue(indent));

export const minifyJson = (text) => JSON.stringify(parseJson(text));

export function validateJson(text) {
  const value = parseJson(text);
  let summary;
  if (Array.isArray(value)) summary = `an array with ${value.length} item${value.length === 1 ? '' : 's'}`;
  else if (value && typeof value === 'object') {
    const keys = Object.keys(value).length;
    summary = `an object with ${keys} key${keys === 1 ? '' : 's'}`;
  } else summary = `a ${value === null ? 'null' : typeof value} value`;
  return { message: `Valid JSON — ${summary}.` };
}

export const escapeJson = (text) => JSON.stringify(text).slice(1, -1);

export function unescapeJson(text) {
  const trimmed = text.trim();
  const quoted = trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"');
  const body = quoted ? trimmed.slice(1, -1) : text;
  const simple = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
  return body.replace(/\\(?:u([0-9a-fA-F]{4})|(["\\/bfnrt]))/g, (_, hex, c) =>
    hex ? String.fromCharCode(parseInt(hex, 16)) : simple[c]
  );
}

/* ---------- CSV ---------- */

const csvCell = (value, delimiter) => {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return text.includes(delimiter) || /["\r\n]|^\s|\s$/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function jsonToCsv(text, { delimiter = ',' } = {}) {
  const data = parseJson(text);
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.length) throw new Error('The JSON array is empty — nothing to convert.');
  const d = delimiter === '\\t' ? '\t' : delimiter || ',';
  const line = (cells) => cells.map((c) => csvCell(c, d)).join(d);

  if (rows.every(Array.isArray)) return rows.map(line).join('\n');

  const isRecord = (r) => r && typeof r === 'object' && !Array.isArray(r);
  if (!rows.some(isRecord)) return ['value', ...rows.map((r) => line([r]))].join('\n');

  const headers = [];
  rows.forEach((r) => isRecord(r) && Object.keys(r).forEach((k) => !headers.includes(k) && headers.push(k)));
  return [line(headers), ...rows.map((r) => line(headers.map((h) => (isRecord(r) ? r[h] : undefined))))].join('\n');
}

export function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
      } else if (c === '"') {
        inQuotes = false;
        i++;
      } else {
        field += c;
        i++;
      }
    } else if (c === '"' && field === '') {
      inQuotes = true;
      i++;
    } else if (text.startsWith(delimiter, i)) {
      row.push(field);
      field = '';
      i += delimiter.length;
    } else if (c === '\n' || c === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
    } else {
      field += c;
      i++;
    }
  }
  if (inQuotes) throw new Error('Invalid CSV: a quoted field is never closed.');
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const candidates = [',', ';', '\t', '|'];
  const counts = candidates.map((d) => firstLine.split(d).length - 1);
  const best = counts.indexOf(Math.max(...counts));
  return counts[best] > 0 ? candidates[best] : ',';
}

const typedValue = (value) => {
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(value)) return Number(value);
  if (value === 'true' || value === 'false') return value === 'true';
  if (value === 'null') return null;
  return value;
};

export function csvToJson(text, { delimiter = 'auto', detectTypes = true } = {}) {
  if (!text.trim()) throw new Error('Input is empty — paste some CSV first.');
  const d = delimiter === 'auto' ? detectDelimiter(text) : delimiter === '\\t' ? '\t' : delimiter || ',';
  const [header, ...rows] = parseCsv(text, d);
  const keys = header.map((h, i) => h.trim() || `column${i + 1}`);
  const records = rows.map((cells) =>
    Object.fromEntries(keys.map((k, i) => [k, detectTypes ? typedValue(cells[i] ?? '') : cells[i] ?? '']))
  );
  return JSON.stringify(records, null, 2);
}

/* ---------- YAML ---------- */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const hasChildren = (v) => (Array.isArray(v) ? v.length > 0 : isPlainObject(v) && Object.keys(v).length > 0);

function yamlString(value) {
  if (value === '') return "''";
  const needsQuotes =
    /^\s|\s$/.test(value) ||
    /[:#[\]{},&*!|>'"%@`\n\r\t\\]/.test(value) ||
    /^[-?~]/.test(value) ||
    /^(true|false|yes|no|on|off|null|y|n)$/i.test(value) ||
    !Number.isNaN(Number(value));
  return needsQuotes ? JSON.stringify(value) : value;
}

function yamlScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return '[]';
  if (typeof value === 'object') return '{}';
  if (typeof value === 'string') return yamlString(value);
  return String(value);
}

function yamlLines(value, level) {
  const pad = '  '.repeat(level);
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (!hasChildren(item)) return [`${pad}- ${yamlScalar(item)}`];
      const inner = yamlLines(item, level + 1);
      inner[0] = `${pad}- ${inner[0].trimStart()}`;
      return inner;
    });
  }
  return Object.keys(value).flatMap((key) => {
    const child = value[key];
    if (!hasChildren(child)) return [`${pad}${yamlString(key)}: ${yamlScalar(child)}`];
    return [`${pad}${yamlString(key)}:`, ...yamlLines(child, level + 1)];
  });
}

export function jsonToYaml(text) {
  const data = parseJson(text);
  return hasChildren(data) ? yamlLines(data, 0).join('\n') : yamlScalar(data);
}
