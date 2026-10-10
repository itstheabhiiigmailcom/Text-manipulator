// Encoders/decoders. Everything that works on bytes uses UTF-8.

const toBytes = (text) => new TextEncoder().encode(text);

function fromBytes(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
  } catch (e) {
    throw new Error('The decoded bytes are not valid UTF-8 text.');
  }
}

/* ---------- Base64 ---------- */

export function base64Encode(text, { urlSafe = false } = {}) {
  let binary = '';
  toBytes(text).forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const encoded = btoa(binary);
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
}

export function base64Decode(text) {
  let clean = text.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) throw new Error('Invalid Base64: it contains characters outside A–Z, a–z, 0–9, +, /, =.');
  clean = clean.replace(/=+$/, '');
  if (clean.length % 4 === 1) throw new Error('Invalid Base64: the input length is wrong (is it truncated?).');
  clean += '='.repeat((4 - (clean.length % 4)) % 4);
  const binary = atob(clean);
  return fromBytes(Array.from(binary, (c) => c.charCodeAt(0)));
}

/* ---------- URL ---------- */

export const urlEncode = (text) => encodeURIComponent(text);

export function urlDecode(text, { plusAsSpace = false } = {}) {
  try {
    return decodeURIComponent(plusAsSpace ? text.replace(/\+/g, ' ') : text);
  } catch (e) {
    throw new Error('Invalid URL encoding: found a "%" that is not followed by a valid escape sequence.');
  }
}

/* ---------- Unicode escapes ---------- */

export function unicodeEncode(text, { escapeAll = false } = {}) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out += escapeAll || code > 0x7e || code < 0x20 ? `\\u${code.toString(16).padStart(4, '0')}` : text[i];
  }
  return out;
}

export const unicodeDecode = (text) =>
  text
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}|[Uu]\+([0-9a-fA-F]{4,6})/g, (m, a, b) => {
      const code = parseInt(a || b, 16);
      return code <= 0x10ffff ? String.fromCodePoint(code) : m;
    })
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
