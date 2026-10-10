/* global BigInt */
// Any-to-any conversion between text (UTF-8 bytes) and numbers in bases 2–36.

export const BASE_CHOICES = [
  { value: 'text', label: 'Text' },
  { value: '2', label: 'Binary (2)' },
  { value: '8', label: 'Octal (8)' },
  { value: '10', label: 'Decimal (10)' },
  { value: '16', label: 'Hex (16)' },
  { value: '32', label: 'Base 32' },
  { value: '36', label: 'Base 36' },
];

const PREFIX = { 2: '0b', 8: '0o', 16: '0x' };
const BYTE_WIDTH = { 2: 8, 8: 3, 16: 2 };
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const TOKEN = /[^\s,;]+/g;

const label = (base) => BASE_CHOICES.find((c) => c.value === String(base))?.label || `base ${base}`;

export function parseInBase(token, base) {
  let s = token.toLowerCase().replace(/_/g, '');
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);
  if (PREFIX[base] && s.startsWith(PREFIX[base])) s = s.slice(2);
  if (!s) throw new Error(`"${token}" is not a valid ${label(base)} number.`);
  const radix = BigInt(base);
  let value = BigInt(0);
  for (const ch of s) {
    const digit = DIGITS.indexOf(ch);
    if (digit < 0 || digit >= base) throw new Error(`"${token}" is not a valid ${label(base)} number.`);
    value = value * radix + BigInt(digit);
  }
  return negative ? -value : value;
}

function formatInBase(value, base, { prefix, uppercase, width = 0 }) {
  const negative = value < BigInt(0);
  let digits = (negative ? -value : value).toString(base).padStart(width, '0');
  if (uppercase) digits = digits.toUpperCase();
  return (negative ? '-' : '') + (prefix && PREFIX[base] ? PREFIX[base] : '') + digits;
}

export function convertBase(text, { from = '10', to = '2', prefix = false, uppercase = true } = {}) {
  if (from === to) return text;
  const options = { prefix, uppercase };

  if (from === 'text') {
    const base = Number(to);
    return Array.from(new TextEncoder().encode(text), (b) =>
      formatInBase(BigInt(b), base, { ...options, width: BYTE_WIDTH[base] || 0 })
    ).join(' ');
  }

  const base = Number(from);
  if (to === 'text') {
    const values = (text.match(TOKEN) || []).map((t) => Number(parseInBase(t, base)));
    if (values.some((v) => v < 0 || v > 0x10ffff)) throw new Error('Values must be between 0 and 1114111 to become text.');
    if (values.every((v) => v <= 255)) {
      try {
        return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(values));
      } catch (e) {
        return String.fromCharCode(...values);
      }
    }
    return String.fromCodePoint(...values);
  }

  return text.replace(TOKEN, (token) => formatInBase(parseInBase(token, base), Number(to), options));
}
