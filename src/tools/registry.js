import * as T from './text';
import * as C from './case';
import * as J from './json';
import * as M from './markup';
import * as S from './sql';
import * as E from './encoding';
import * as N from './numberBase';

// Tool shape: { id, label, description, run(text, options), options?, hint?, keywords? }
// `run` returns the new output text, or { message } for validators that don't change the text.

const indentOption = (fallback = '2') => ({
  key: 'indent',
  label: 'Indent',
  type: 'select',
  default: fallback,
  choices: [
    { value: '2', label: '2 spaces' },
    { value: '4', label: '4 spaces' },
    { value: 'tab', label: 'Tab' },
  ],
});
const countOption = (fallback, label = 'N') => ({ key: 'count', label, type: 'number', default: fallback, min: 0 });
const ignoreCaseOption = (fallback) => ({ key: 'ignoreCase', label: 'Ignore case', type: 'checkbox', default: fallback });

export const CATEGORIES = [
  {
    id: 'clean',
    label: 'Clean & Format',
    glyph: '¶',
    description: 'Fix messy whitespace, blank lines, duplicates and indentation.',
    sample: '   hello\nhello   \n   world\n\n\nworld\n\tthis  has   extra    spaces',
    groups: [
      {
        title: 'One-click clean',
        description: 'Trim every line, collapse spaces, then drop blank and duplicate lines.',
        tools: [
          {
            id: 'clean-text',
            label: 'Clean Text',
            primary: true,
            description: 'Trims each line, collapses repeated spaces/tabs, removes blank lines and duplicate lines.',
            keywords: 'tidy sanitize fix',
            run: T.cleanText,
          },
        ],
      },
      {
        title: 'Spaces & tabs',
        tools: [
          { id: 'remove-extra-spaces', label: 'Remove extra spaces', description: 'Collapses runs of spaces/tabs to one space and trims each line.', run: T.removeExtraSpaces },
          { id: 'collapse-spaces', label: 'Multiple spaces → single', description: 'Turns every run of spaces into a single space. Line breaks are kept.', run: T.collapseSpaces },
          { id: 'remove-leading-spaces', label: 'Remove leading spaces', description: 'Removes spaces and tabs at the start of every line.', run: T.removeLeadingSpaces },
          { id: 'remove-trailing-spaces', label: 'Remove trailing spaces', description: 'Removes spaces and tabs at the end of every line.', run: T.removeTrailingSpaces },
          { id: 'trim-lines', label: 'Trim every line', description: 'Removes leading and trailing spaces from every line.', run: T.trimLines },
          {
            id: 'tabs-to-spaces',
            label: 'Tabs → spaces',
            description: 'Replaces tabs with spaces, respecting tab stops.',
            options: [{ key: 'tabWidth', label: 'Tab width', type: 'number', default: 4, min: 1 }],
            run: T.tabsToSpaces,
          },
          {
            id: 'spaces-to-tabs',
            label: 'Spaces → tabs',
            description: 'Replaces every group of N spaces with a tab.',
            options: [{ key: 'tabWidth', label: 'Spaces per tab', type: 'number', default: 4, min: 1 }],
            run: T.spacesToTabs,
          },
        ],
      },
      {
        title: 'Blank lines & duplicates',
        tools: [
          { id: 'remove-blank-lines', label: 'Remove blank lines', description: 'Removes lines that are empty or contain only whitespace.', run: T.removeBlankLines },
          { id: 'remove-empty-lines', label: 'Remove empty lines', description: 'Removes only completely empty lines (whitespace-only lines are kept).', run: T.removeEmptyLines },
          { id: 'normalize-line-breaks', label: 'Normalize line breaks', description: 'Converts CRLF/CR line endings to LF and squeezes runs of blank lines into one.', keywords: 'crlf lf newline eol', run: T.normalizeLineBreaks },
          {
            id: 'remove-duplicate-lines',
            label: 'Remove duplicate lines',
            description: 'Keeps the first occurrence of each line and removes later repeats.',
            keywords: 'dedupe unique distinct',
            options: [ignoreCaseOption(false)],
            run: T.removeDuplicateLines,
          },
          { id: 'remove-duplicate-words', label: 'Remove duplicate words', description: 'Keeps the first occurrence of each word (case-insensitive) and removes repeats.', keywords: 'dedupe', run: T.removeDuplicateWords },
        ],
      },
      {
        title: 'Indentation',
        tools: [
          {
            id: 'indent',
            label: 'Add indentation',
            description: 'Indents every non-empty line by one level.',
            options: [{ ...indentOption('2'), key: 'style', label: 'Level' }],
            run: T.indentLines,
          },
          {
            id: 'outdent',
            label: 'Remove indentation',
            description: 'Removes one level of indentation from every line.',
            keywords: 'outdent dedent unindent',
            options: [{ ...indentOption('2'), key: 'style', label: 'Level' }],
            run: T.outdentLines,
          },
        ],
      },
      {
        title: 'Reverse',
        tools: [
          { id: 'reverse-text', label: 'Reverse text', description: 'Reverses the whole text, character by character.', hint: 'abc def → fed cba', run: T.reverseText },
          { id: 'reverse-words', label: 'Reverse words', description: 'Reverses the order of words on each line.', hint: 'abc def → def abc', run: T.reverseWords },
          { id: 'reverse-characters', label: 'Reverse characters', description: 'Reverses the letters inside each word, keeping word order.', hint: 'abc def → cba fed', run: T.reverseEachWord },
        ],
      },
    ],
  },
  {
    id: 'find',
    label: 'Find & Replace',
    glyph: '.*',
    description: 'Search with plain text or regex, preview and replace matches.',
    keywords: 'search regex regexp replace match highlight',
    sample: 'User: John\nUser: Rahul\nUser: Amit',
    custom: 'findReplace',
    groups: [],
  },
  {
    id: 'lines',
    label: 'Lines',
    glyph: '≡',
    description: 'Sort, filter, pick, join and number lines.',
    sample: 'banana\napple\ncherry\napple\ndate\nelderberry\nfig\ngrape',
    groups: [
      {
        title: 'Sort & order',
        tools: [
          { id: 'sort-az', label: 'Sort A → Z', description: 'Sorts lines alphabetically (numbers in natural order).', keywords: 'alphabetical ascending', run: T.sortAZ },
          { id: 'sort-za', label: 'Sort Z → A', description: 'Sorts lines in reverse alphabetical order.', keywords: 'alphabetical descending', run: T.sortZA },
          {
            id: 'sort-length',
            label: 'Sort by length',
            description: 'Sorts lines by number of characters.',
            options: [
              {
                key: 'order',
                label: 'Order',
                type: 'select',
                default: 'asc',
                choices: [
                  { value: 'asc', label: 'Shortest first' },
                  { value: 'desc', label: 'Longest first' },
                ],
              },
            ],
            run: T.sortByLength,
          },
          { id: 'reverse-lines', label: 'Reverse lines', description: 'Flips the order of lines (last line first).', run: T.reverseLines },
          { id: 'shuffle-lines', label: 'Shuffle lines', description: 'Puts lines in random order.', keywords: 'random', run: T.shuffleLines },
        ],
      },
      {
        title: 'Filter',
        tools: [
          {
            id: 'remove-lines-containing',
            label: 'Remove lines containing…',
            description: 'Deletes every line that contains the given text.',
            options: [{ key: 'query', label: 'Text', type: 'text', default: '', placeholder: 'e.g. error' }, ignoreCaseOption(true)],
            run: T.removeLinesContaining,
          },
          {
            id: 'keep-lines-containing',
            label: 'Keep lines containing…',
            description: 'Keeps only the lines that contain the given text.',
            keywords: 'grep filter',
            options: [{ key: 'query', label: 'Text', type: 'text', default: '', placeholder: 'e.g. error' }, ignoreCaseOption(true)],
            run: T.keepLinesContaining,
          },
          { id: 'unique-lines', label: 'Unique lines', description: 'Keeps only lines that appear exactly once (every repeated line is dropped entirely).', keywords: 'distinct once', run: T.uniqueLinesOnly },
          {
            id: 'duplicate-lines',
            label: 'Duplicate lines',
            description: 'Repeats every line N times.',
            keywords: 'repeat copy',
            options: [{ key: 'times', label: 'Times', type: 'number', default: 2, min: 1 }],
            run: T.duplicateLines,
          },
        ],
      },
      {
        title: 'Pick lines',
        tools: [
          { id: 'keep-first', label: 'Keep first N lines', description: 'Keeps only the first N lines.', keywords: 'head top', options: [countOption(10)], run: T.keepFirstLines },
          { id: 'keep-last', label: 'Keep last N lines', description: 'Keeps only the last N lines.', keywords: 'tail bottom', options: [countOption(10)], run: T.keepLastLines },
          { id: 'remove-first', label: 'Remove first N lines', description: 'Deletes the first N lines.', options: [countOption(1)], run: T.removeFirstLines },
          { id: 'remove-last', label: 'Remove last N lines', description: 'Deletes the last N lines.', options: [countOption(1)], run: T.removeLastLines },
          {
            id: 'every-nth',
            label: 'Select every Nth line',
            description: 'Keeps line "start", then every Nth line after it.',
            options: [
              { key: 'step', label: 'Every', type: 'number', default: 2, min: 1 },
              { key: 'start', label: 'Starting at line', type: 'number', default: 1, min: 1 },
            ],
            run: T.everyNthLine,
          },
        ],
      },
      {
        title: 'Join & split',
        tools: [
          {
            id: 'merge-lines',
            label: 'Merge all lines',
            description: 'Joins all lines into one using the separator (use \\t for tab, \\n for newline).',
            keywords: 'join combine',
            options: [
              { key: 'separator', label: 'Separator', type: 'text', default: ', ', placeholder: ', ' },
              { key: 'skipEmpty', label: 'Skip empty lines', type: 'checkbox', default: true },
            ],
            run: T.mergeLines,
          },
          {
            id: 'split-lines',
            label: 'Split text into lines',
            description: 'Breaks the text into lines at every delimiter (use \\t for tab).',
            keywords: 'explode separate',
            options: [
              { key: 'delimiter', label: 'Delimiter', type: 'text', default: ',', placeholder: ',' },
              { key: 'trim', label: 'Trim pieces', type: 'checkbox', default: true },
            ],
            run: T.splitToLines,
          },
        ],
      },
      {
        title: 'Prefix, suffix & numbering',
        tools: [
          {
            id: 'add-prefix',
            label: 'Add prefix to every line',
            description: 'Puts the given text at the start of every line.',
            options: [{ key: 'prefix', label: 'Prefix', type: 'text', default: '- ', placeholder: '- ' }],
            run: T.addPrefix,
          },
          {
            id: 'add-suffix',
            label: 'Add suffix to every line',
            description: 'Puts the given text at the end of every line.',
            options: [{ key: 'suffix', label: 'Suffix', type: 'text', default: ',', placeholder: ',' }],
            run: T.addSuffix,
          },
          {
            id: 'add-line-numbers',
            label: 'Add line numbers',
            description: 'Numbers every line.',
            keywords: 'number count',
            options: [
              { key: 'start', label: 'Start at', type: 'number', default: 1 },
              { key: 'separator', label: 'Separator', type: 'text', default: '. ', placeholder: '. ' },
            ],
            run: T.addLineNumbers,
          },
          { id: 'remove-line-numbers', label: 'Remove line numbers', description: 'Strips numbers like "1. ", "2) " or "3: " from the start of each line.', run: T.removeLineNumbers },
        ],
      },
    ],
  },
  {
    id: 'case',
    label: 'Case',
    glyph: 'Aa',
    description: 'Change letter case for writing or for code identifiers.',
    sample: 'hello world example',
    groups: [
      {
        title: 'Writing',
        tools: [
          { id: 'upper', label: 'UPPERCASE', hint: 'HELLO WORLD', description: 'Converts every letter to upper case.', keywords: 'caps capital', run: C.upperCase },
          { id: 'lower', label: 'lowercase', hint: 'hello world', description: 'Converts every letter to lower case.', run: C.lowerCase },
          { id: 'sentence', label: 'Sentence case', hint: 'Hello world', description: 'Capitalizes the first letter of every sentence.', run: C.sentenceCase },
          { id: 'title', label: 'Title Case', hint: 'Hello World', description: 'Capitalizes the first letter of every word.', keywords: 'capitalize headline', run: C.titleCase },
        ],
      },
      {
        title: 'Programming',
        description: 'Applied line by line, so a list of names converts in one go.',
        tools: [
          { id: 'camel', label: 'camelCase', hint: 'helloWorldExample', description: 'Joins words; every word after the first is capitalized.', run: C.camelCase },
          { id: 'pascal', label: 'PascalCase', hint: 'HelloWorldExample', description: 'Joins words; every word is capitalized.', keywords: 'upper camel', run: C.pascalCase },
          { id: 'snake', label: 'snake_case', hint: 'hello_world_example', description: 'Lower-case words joined with underscores.', keywords: 'underscore', run: C.snakeCase },
          { id: 'kebab', label: 'kebab-case', hint: 'hello-world-example', description: 'Lower-case words joined with hyphens.', keywords: 'dash hyphen slug', run: C.kebabCase },
          { id: 'constant', label: 'CONSTANT_CASE', hint: 'HELLO_WORLD_EXAMPLE', description: 'Upper-case words joined with underscores (also called SCREAMING_SNAKE_CASE).', keywords: 'screaming snake upper', run: C.constantCase },
          { id: 'dot', label: 'dot.case', hint: 'hello.world.example', description: 'Lower-case words joined with dots.', run: C.dotCase },
          { id: 'slash', label: 'slash/case', hint: 'hello/world/example', description: 'Lower-case words joined with slashes.', keywords: 'path', run: C.slashCase },
          { id: 'train', label: 'Train-Case', hint: 'Hello-World-Example', description: 'Capitalized words joined with hyphens.', keywords: 'http header', run: C.trainCase },
        ],
      },
      {
        title: 'Fun',
        tools: [
          { id: 'alternating', label: 'aLtErNaTiNg cAsE', hint: 'hElLo wOrLd', description: 'Alternates letters starting with lower case.', keywords: 'mocking spongebob', run: C.alternatingCase },
          { id: 'alternating-upper', label: 'AlTeRnAtInG CaSe', hint: 'HeLlO WoRlD', description: 'Alternates letters starting with upper case.', keywords: 'mocking', run: C.alternatingCaseUpperFirst },
          { id: 'inverse', label: 'InVeRsE CaSe', hint: 'Hello → hELLO', description: 'Swaps the case of every letter.', keywords: 'swap toggle invert', run: C.inverseCase },
        ],
      },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    glyph: '</>',
    description: 'Format, minify and validate JSON, XML, HTML and SQL.',
    layout: 'tabs',
    groups: [
      {
        title: 'JSON',
        sample: '{"name":"John","age":25,"skills":["js","sql"],"address":{"city":"Delhi","zip":"110001"}}',
        tools: [
          { id: 'json-format', label: 'Format', primary: true, description: 'Pretty-prints JSON with indentation.', keywords: 'beautify pretty', options: [indentOption('2')], run: J.formatJson },
          { id: 'json-minify', label: 'Minify', description: 'Removes all unnecessary whitespace.', keywords: 'compact compress', run: J.minifyJson },
          { id: 'json-validate', label: 'Validate', description: 'Checks whether the input is valid JSON and shows where it breaks.', keywords: 'lint check', run: J.validateJson },
          { id: 'json-escape', label: 'Escape', description: 'Escapes text so it can be pasted inside a JSON string.', keywords: 'stringify', run: J.escapeJson },
          { id: 'json-unescape', label: 'Unescape', description: 'Turns an escaped JSON string back into plain text.', run: J.unescapeJson },
          { id: 'json-to-csv', label: 'JSON → CSV', description: 'Converts an array of objects into CSV (one column per key).', keywords: 'spreadsheet excel', run: J.jsonToCsv },
          {
            id: 'csv-to-json',
            label: 'CSV → JSON',
            description: 'Converts CSV (first row = headers) into an array of objects.',
            keywords: 'spreadsheet excel',
            options: [
              {
                key: 'delimiter',
                label: 'Delimiter',
                type: 'select',
                default: 'auto',
                choices: [
                  { value: 'auto', label: 'Auto-detect' },
                  { value: ',', label: 'Comma' },
                  { value: ';', label: 'Semicolon' },
                  { value: '\\t', label: 'Tab' },
                  { value: '|', label: 'Pipe' },
                ],
              },
              { key: 'detectTypes', label: 'Detect numbers & booleans', type: 'checkbox', default: true },
            ],
            run: J.csvToJson,
          },
          { id: 'json-to-yaml', label: 'JSON → YAML', description: 'Converts JSON into YAML.', keywords: 'yml', run: J.jsonToYaml },
        ],
      },
      {
        title: 'XML',
        sample: '<?xml version="1.0"?><catalog><book id="1"><title>XML Basics</title><price>29.99</price></book><book id="2"><title>Advanced XML</title><price>39.99</price></book></catalog>',
        tools: [
          { id: 'xml-format', label: 'Format', primary: true, description: 'Pretty-prints XML with indentation.', keywords: 'beautify pretty', options: [indentOption('2')], run: M.formatXml },
          { id: 'xml-minify', label: 'Minify', description: 'Removes whitespace between tags.', keywords: 'compact', options: [{ key: 'removeComments', label: 'Remove comments', type: 'checkbox', default: true }], run: M.minifyXml },
          { id: 'xml-validate', label: 'Validate', description: 'Checks whether the XML is well-formed.', keywords: 'lint check', run: M.validateXml },
          { id: 'xml-escape', label: 'Escape', description: 'Escapes & < > " \' as XML entities.', keywords: 'entities', run: M.escapeXml },
          { id: 'xml-unescape', label: 'Unescape', description: 'Turns XML entities back into characters.', keywords: 'entities', run: M.unescapeXml },
        ],
      },
      {
        title: 'HTML',
        sample: '<!DOCTYPE html><html><head><title>Demo &amp; Test</title><style>body{color:red}</style></head><body><!-- main --><div class="card"><h1>Hello &lt;World&gt;</h1><p>Some <b>bold</b> text.</p><ul><li>One</li><li>Two</li></ul><img src="a.png" alt="A"></div></body></html>',
        tools: [
          { id: 'html-format', label: 'Format', primary: true, description: 'Pretty-prints HTML with indentation.', keywords: 'beautify pretty', options: [indentOption('2')], run: M.formatHtml },
          { id: 'html-minify', label: 'Minify', description: 'Removes comments and collapses whitespace.', keywords: 'compact', options: [{ key: 'removeComments', label: 'Remove comments', type: 'checkbox', default: true }], run: M.minifyHtml },
          { id: 'html-entity-encode', label: 'Entity encode', description: 'Escapes & < > " \' (and optionally non-ASCII) as HTML entities.', keywords: 'escape', options: [{ key: 'encodeNonAscii', label: 'Also non-ASCII', type: 'checkbox', default: false }], run: M.encodeHtmlEntities },
          { id: 'html-entity-decode', label: 'Entity decode', description: 'Turns HTML entities like &amp; and &copy; back into characters.', keywords: 'unescape', run: M.decodeHtmlEntities },
          { id: 'html-strip', label: 'Strip tags', description: 'Removes every tag, script, style and comment, leaving the raw text as written.', keywords: 'remove tags', run: M.stripHtmlTags },
          { id: 'html-extract-text', label: 'Extract text', description: 'Returns the readable text of the page with line breaks and decoded entities.', keywords: 'plain text', run: M.extractTextFromHtml },
        ],
      },
      {
        title: 'SQL',
        sample: 'select id,name from users where age>20 order by name;',
        tools: [
          { id: 'sql-format', label: 'Format / Beautify', primary: true, description: 'Puts each clause on its own line, indents column lists and uppercases keywords.', keywords: 'beautify pretty', options: [{ ...indentOption('4') }], run: S.formatSql },
          { id: 'sql-minify', label: 'Minify', description: 'Removes comments and collapses the query onto one line.', keywords: 'compact', run: S.minifySql },
          { id: 'sql-upper', label: 'Keywords UPPERCASE', description: 'Uppercases SQL keywords only; strings and identifiers are untouched.', run: S.sqlKeywordsUpper },
          { id: 'sql-lower', label: 'Keywords lowercase', description: 'Lowercases SQL keywords only; strings and identifiers are untouched.', run: S.sqlKeywordsLower },
        ],
      },
    ],
  },
  {
    id: 'encode',
    label: 'Encode / Decode',
    glyph: '%',
    description: 'Base64, URL, HTML entities and Unicode escapes.',
    sample: 'Hello, World! Café & <tags>',
    pairs: true,
    groups: [
      {
        title: 'Base64',
        description: 'Binary-safe text encoding used in emails, data URLs and APIs.',
        tools: [
          { id: 'base64-encode', label: 'Encode', description: 'Text → Base64 (UTF-8).', options: [{ key: 'urlSafe', label: 'URL-safe', type: 'checkbox', default: false }], run: E.base64Encode },
          { id: 'base64-decode', label: 'Decode', description: 'Base64 → text (standard and URL-safe).', run: E.base64Decode },
        ],
      },
      {
        title: 'URL',
        description: 'Percent-encoding for query strings and URL parts.',
        tools: [
          { id: 'url-encode', label: 'Encode', description: 'Text → percent-encoded (e.g. space → %20).', keywords: 'percent uri', run: E.urlEncode },
          { id: 'url-decode', label: 'Decode', description: 'Percent-encoded → text.', keywords: 'percent uri', options: [{ key: 'plusAsSpace', label: '+ means space', type: 'checkbox', default: false }], run: E.urlDecode },
        ],
      },
      {
        title: 'HTML entities',
        description: 'Make text safe to put inside HTML.',
        tools: [
          { id: 'html-encode', label: 'Encode', description: 'Escapes & < > " \' as HTML entities.', keywords: 'escape', options: [{ key: 'encodeNonAscii', label: 'Also non-ASCII', type: 'checkbox', default: false }], run: M.encodeHtmlEntities },
          { id: 'html-decode', label: 'Decode', description: 'HTML entities → characters.', keywords: 'unescape', run: M.decodeHtmlEntities },
        ],
      },
      {
        title: 'Unicode escapes',
        description: 'JavaScript/JSON style \\uXXXX escapes.',
        tools: [
          { id: 'unicode-encode', label: 'Encode', description: 'Non-ASCII characters → \\uXXXX.', options: [{ key: 'escapeAll', label: 'Escape every character', type: 'checkbox', default: false }], run: E.unicodeEncode },
          { id: 'unicode-decode', label: 'Decode', description: '\\uXXXX, \\u{XXXXX} and U+XXXX → characters.', run: E.unicodeDecode },
        ],
      },
    ],
  },
  {
    id: 'base',
    label: 'Number Base',
    glyph: '0x',
    description: 'Convert between text, binary, octal, decimal, hex and more.',
    keywords: 'binary octal decimal hex hexadecimal ascii radix base32 base36 bits bytes',
    sample: '255 1024 42',
    groups: [
      {
        title: 'Any → any',
        description: 'Each number (separated by spaces, commas or lines) is converted. Text uses UTF-8 bytes.',
        tools: [
          {
            id: 'base-convert',
            label: 'Convert',
            description: 'Converts every value from one base to another.',
            keywords: 'binary octal decimal hex ascii text bits radix',
            options: [
              { key: 'from', label: 'From', type: 'select', default: '10', choices: N.BASE_CHOICES },
              { key: 'to', label: 'To', type: 'select', default: '2', choices: N.BASE_CHOICES },
              { key: 'prefix', label: 'Add 0b / 0o / 0x prefix', type: 'checkbox', default: false },
              { key: 'uppercase', label: 'Uppercase letters', type: 'checkbox', default: true },
            ],
            run: N.convertBase,
          },
        ],
      },
    ],
  },
];

// Less common tools stay one click away behind "Show more" so each section stays scannable.
const MORE = new Set([
  'collapse-spaces', 'remove-leading-spaces', 'remove-trailing-spaces', 'tabs-to-spaces', 'spaces-to-tabs',
  'remove-empty-lines', 'normalize-line-breaks', 'remove-duplicate-words', 'indent', 'outdent',
  'reverse-text', 'reverse-words', 'reverse-characters',
  'sort-length', 'shuffle-lines', 'unique-lines', 'duplicate-lines', 'keep-last', 'remove-first', 'remove-last',
  'every-nth', 'add-suffix', 'remove-line-numbers',
  'dot', 'slash', 'train', 'alternating', 'alternating-upper', 'inverse',
  'json-escape', 'json-unescape', 'json-to-yaml', 'xml-escape', 'xml-unescape',
  'html-entity-encode', 'html-entity-decode', 'sql-upper', 'sql-lower',
  'unicode-encode', 'unicode-decode',
]);
CATEGORIES.forEach((c) => c.groups.forEach((g) => g.tools.forEach((t) => (t.more = MORE.has(t.id)))));

export const ALL_TOOLS = CATEGORIES.flatMap((category) =>
  category.groups.flatMap((group) => group.tools.map((tool) => ({ ...tool, category, group })))
);

export const TOOLS_BY_ID = Object.fromEntries(ALL_TOOLS.map((tool) => [tool.id, tool]));

export const defaultOptions = (tool) =>
  Object.fromEntries((tool.options || []).map((option) => [option.key, option.default]));

export function searchTools(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return ALL_TOOLS.filter((tool) => {
    const haystack = [tool.label, tool.description, tool.keywords, tool.group.title, tool.category.label]
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function runTool(tool, input, options) {
  const result = tool.run(input, { ...defaultOptions(tool), ...options });
  return typeof result === 'string' ? { output: result } : result;
}
