import { mapLines } from './text';

// Splits "helloWorld", "hello_world", "Hello-World 42" etc. into lowercase words.
export function splitWords(text) {
  return text
    .replace(/['’]/g, '')
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const capitalize = (word) => {
  const [first = '', ...rest] = Array.from(word);
  return first.toUpperCase() + rest.join('');
};

// Programming cases work line by line so a list of names converts in one go.
const perLine = (joinWords) => (text) =>
  mapLines(text, (lines) => lines.map((line) => {
    const words = splitWords(line);
    return words.length ? joinWords(words) : line;
  }));

export const upperCase = (text) => text.toUpperCase();
export const lowerCase = (text) => text.toLowerCase();

export const titleCase = (text) =>
  text.replace(/\p{L}[\p{L}\p{N}'’]*/gu, (word) => capitalize(word.toLowerCase()));

export const sentenceCase = (text) =>
  text
    .toLowerCase()
    .replace(/(^|[.!?]\s+|\n\s*)(\p{L})/gu, (_, before, letter) => before + letter.toUpperCase())
    .replace(/(^|[^\p{L}])i(?=$|[^\p{L}])/gu, '$1I');

export const camelCase = perLine((w) => w[0] + w.slice(1).map(capitalize).join(''));
export const pascalCase = perLine((w) => w.map(capitalize).join(''));
export const snakeCase = perLine((w) => w.join('_'));
export const kebabCase = perLine((w) => w.join('-'));
export const constantCase = perLine((w) => w.join('_').toUpperCase());
export const dotCase = perLine((w) => w.join('.'));
export const slashCase = perLine((w) => w.join('/'));
export const trainCase = perLine((w) => w.map(capitalize).join('-'));

function alternate(text, upperFirst) {
  let upper = upperFirst;
  return Array.from(text)
    .map((ch) => {
      if (ch.toLowerCase() === ch.toUpperCase()) return ch;
      const out = upper ? ch.toUpperCase() : ch.toLowerCase();
      upper = !upper;
      return out;
    })
    .join('');
}

export const alternatingCase = (text) => alternate(text, false);
export const alternatingCaseUpperFirst = (text) => alternate(text, true);

export const inverseCase = (text) =>
  Array.from(text)
    .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
    .join('');
