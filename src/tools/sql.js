// A small, dependency-free SQL tokenizer, beautifier and minifier.

const TOKEN = /(\s+)|(--[^\n]*)|(\/\*[\s\S]*?(?:\*\/|$))|('(?:[^']|'')*'?)|("(?:[^"]|"")*"?|`[^`]*`?)|(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_@$#][\w$#@]*)|(<=|>=|<>|!=|==|\|\||::|->>|->|:=)|([(),;.])|([\s\S])/g;
const TYPES = [null, 'space', 'lineComment', 'blockComment', 'string', 'quoted', 'number', 'word', 'operator', 'punct', 'operator'];

const FUNCTIONS = new Set(
  'COUNT SUM AVG MIN MAX COALESCE NULLIF UPPER LOWER LENGTH SUBSTRING SUBSTR TRIM LTRIM RTRIM ROUND FLOOR CEIL CEILING ABS NOW CONCAT CAST CONVERT DATE_FORMAT DATEADD DATEDIFF EXTRACT IFNULL ISNULL ROW_NUMBER RANK DENSE_RANK LAG LEAD STRING_AGG GROUP_CONCAT REPLACE'.split(' ')
);

export const SQL_KEYWORDS = new Set([
  ...FUNCTIONS,
  ...'SELECT FROM WHERE AND OR NOT IN IS NULL LIKE ILIKE BETWEEN EXISTS AS ON JOIN INNER LEFT RIGHT FULL OUTER CROSS NATURAL GROUP BY ORDER HAVING LIMIT OFFSET UNION ALL DISTINCT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP ADD COLUMN INDEX VIEW PRIMARY KEY FOREIGN REFERENCES DEFAULT CONSTRAINT UNIQUE CHECK CASE WHEN THEN ELSE END ASC DESC WITH RECURSIVE RETURNING TOP FETCH NEXT ROWS ROW ONLY EXCEPT INTERSECT USING TRUE FALSE IF TRUNCATE GRANT REVOKE BEGIN COMMIT ROLLBACK TRANSACTION DATABASE SCHEMA PROCEDURE FUNCTION TRIGGER RETURNS DECLARE OVER PARTITION WINDOW ANY SOME LATERAL NULLS FIRST LAST INT INTEGER VARCHAR CHAR TEXT DATE TIMESTAMP BOOLEAN DECIMAL NUMERIC FLOAT DOUBLE BIGINT SMALLINT SERIAL AUTO_INCREMENT'.split(' '),
]);

const PHRASES = [
  ['GROUP', 'BY'], ['ORDER', 'BY'], ['PARTITION', 'BY'], ['INSERT', 'INTO'], ['DELETE', 'FROM'], ['UNION', 'ALL'],
  ['LEFT', 'OUTER', 'JOIN'], ['RIGHT', 'OUTER', 'JOIN'], ['FULL', 'OUTER', 'JOIN'],
  ['LEFT', 'JOIN'], ['RIGHT', 'JOIN'], ['FULL', 'JOIN'], ['INNER', 'JOIN'], ['CROSS', 'JOIN'], ['NATURAL', 'JOIN'],
];

const CLAUSES = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'EXCEPT',
  'INTERSECT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH', 'RETURNING', 'FETCH', 'WINDOW',
  'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'INNER JOIN', 'CROSS JOIN', 'NATURAL JOIN',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
]);
const LIST_CLAUSES = new Set(['SELECT', 'SET', 'VALUES']);
const SET_OPERATORS = new Set(['UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT']);

export function tokenizeSql(text) {
  const tokens = [];
  for (const m of text.matchAll(TOKEN)) {
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    tokens.push({ type: TYPES[group], value: m[0] });
  }
  return tokens;
}

const upper = (t) => (t && t.type === 'word' ? t.value.toUpperCase() : null);
const isKeyword = (t) => t.type === 'word' && SQL_KEYWORDS.has(t.value.toUpperCase());

// Merges multi-word keywords such as ORDER BY into a single token.
function mergePhrases(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const phrase = PHRASES.find((p) => p.every((word, k) => upper(tokens[i + k]) === word));
    if (phrase) {
      out.push({ type: 'word', value: phrase.join(' '), keyword: true });
      i += phrase.length - 1;
    } else out.push(tokens[i]);
  }
  return out;
}

const applyKeywordCase = (tokens, toUpper) =>
  tokens.map((t) => (t.keyword || isKeyword(t) ? { ...t, value: toUpper ? t.value.toUpperCase() : t.value.toLowerCase() } : t));

export const sqlKeywordsUpper = (text) => applyKeywordCase(tokenizeSql(text), true).map((t) => t.value).join('');
export const sqlKeywordsLower = (text) => applyKeywordCase(tokenizeSql(text), false).map((t) => t.value).join('');

const wordish = (t) => ['word', 'number', 'string', 'quoted'].includes(t.type);

export function minifySql(text) {
  const tokens = tokenizeSql(text).filter((t) => !['space', 'lineComment', 'blockComment'].includes(t.type));
  let out = '';
  let prev = null;
  for (const t of tokens) {
    const needsSpace =
      prev &&
      ((wordish(prev) && wordish(t)) ||
        (prev.type === 'operator' && t.type === 'operator') ||
        (prev.value.endsWith('-') && t.value.startsWith('-')) ||
        (prev.value.endsWith('/') && t.value.startsWith('*')));
    out += (needsSpace ? ' ' : '') + t.value;
    prev = t;
  }
  return out;
}

export function formatSql(text, { indent = '4' } = {}) {
  if (!text.trim()) throw new Error('Input is empty — paste a SQL query first.');
  const unit = indent === 'tab' ? '\t' : ' '.repeat(Number(indent) || 4);
  const tokens = applyKeywordCase(
    mergePhrases(tokenizeSql(text).filter((t) => t.type !== 'space')),
    true
  );

  let out = '';
  let level = 0;
  let atLineStart = true;
  let clause = null;
  let clauseDepth = 0;
  let betweenPending = false;
  let noSpaceNext = false;
  const parens = [];

  const newline = (extra = 0) => {
    out = atLineStart ? out.replace(/[ \t]*$/, '') : `${out.replace(/[ \t]+$/, '')}\n`;
    out += unit.repeat(level + extra);
    atLineStart = true;
  };
  const write = (value, space = true) => {
    if (!atLineStart && space && !noSpaceNext) out += ' ';
    out += value;
    atLineStart = false;
    noSpaceNext = false;
  };
  const nextSignificant = (i) => tokens.slice(i + 1).find((t) => t.type !== 'lineComment' && t.type !== 'blockComment');

  tokens.forEach((t, i) => {
    const prev = tokens[i - 1];
    const word = t.type === 'word' ? t.value.toUpperCase() : null;

    if (t.type === 'lineComment') {
      write(t.value);
      newline(LIST_CLAUSES.has(clause) && parens.length === clauseDepth ? 1 : 0);
    } else if (t.type === 'blockComment') {
      write(t.value);
    } else if (word && CLAUSES.has(word)) {
      if (SET_OPERATORS.has(word)) {
        newline();
        write(word);
        newline();
      } else {
        if (out.trim()) newline();
        write(word);
        if (LIST_CLAUSES.has(word)) {
          const next = nextSignificant(i);
          if (word === 'SELECT' && next && ['DISTINCT', 'ALL'].includes(upper(next))) {
            clause = word;
            clauseDepth = parens.length;
            return;
          }
          newline(1);
        }
      }
      clause = word;
      clauseDepth = parens.length;
    } else if (clause === 'SELECT' && word && ['DISTINCT', 'ALL'].includes(word) && upper(prev) === 'SELECT') {
      write(word);
      newline(1);
    } else if ((word === 'AND' || word === 'OR') && parens.length === clauseDepth && !(word === 'AND' && betweenPending)) {
      newline(1);
      write(word);
    } else if (t.value === '(') {
      const next = nextSignificant(i);
      const isSubquery = next && ['SELECT', 'WITH'].includes(upper(next));
      const callLike =
        prev && ((prev.type === 'word' && (FUNCTIONS.has(prev.value.toUpperCase()) || (!isKeyword(prev) && clause !== 'INSERT INTO'))) || prev.type === 'quoted');
      write('(', !callLike);
      noSpaceNext = true;
      parens.push({ isSubquery, level, clause, clauseDepth });
      if (isSubquery) level += 1;
    } else if (t.value === ')') {
      const open = parens.pop();
      if (open && open.isSubquery) {
        level = open.level;
        newline();
        write(')', false);
      } else write(')', false);
      if (open) {
        clause = open.clause;
        clauseDepth = open.clauseDepth;
      }
    } else if (t.value === ',') {
      write(',', false);
      if (LIST_CLAUSES.has(clause) && parens.length === clauseDepth) newline(1);
    } else if (t.value === ';') {
      write(';', false);
      out += '\n\n';
      atLineStart = true;
      level = 0;
      clause = null;
      clauseDepth = 0;
      parens.length = 0;
    } else if (t.value === '.' || t.value === '::') {
      write(t.value, false);
      noSpaceNext = true;
    } else if (t.type === 'operator' && (t.value === '-' || t.value === '+') && (!prev || ['operator', 'punct'].includes(prev.type) || isKeyword(prev))) {
      write(t.value);
      noSpaceNext = true;
    } else {
      if (word === 'BETWEEN') betweenPending = true;
      else if (word === 'AND' && betweenPending) betweenPending = false;
      write(t.value);
    }
  });

  return out
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim();
}
