// Long-form documentation for every tool, shown on the Docs page.
// `example` is the input used for the live example (falls back to the section sample);
// its output is produced by running the real tool, so the docs can never go stale.
// `whitespace: true` shows spaces as · and tabs as → so the change is visible.

export const TOOL_DOCS = {
  /* ---------- Clean & Format ---------- */
  'clean-text': {
    details:
      'The fastest way to tidy messy text in one click. It removes spaces at the start and end of each line, squeezes repeated spaces and tabs into one space, deletes blank lines and removes lines that appear more than once.',
    use: 'Text copied from PDFs, emails, spreadsheets or web pages.',
    example: '   hello\nhello   \n   world\n\n\nworld',
    whitespace: true,
  },
  'remove-extra-spaces': {
    details: 'Turns any run of spaces or tabs into a single space and trims both ends of every line. Line breaks are kept.',
    use: 'Fixing double spaces after copy-pasting.',
    example: '  This   has    too   many\tspaces  ',
    whitespace: true,
  },
  'collapse-spaces': {
    details: 'Only replaces two or more spaces in a row with one space. Unlike "Remove extra spaces" it leaves tabs alone and does not trim the ends of lines.',
    example: 'one    two     three',
    whitespace: true,
  },
  'remove-leading-spaces': {
    details: 'Deletes spaces and tabs at the beginning of every line, removing indentation.',
    example: '    indented\n\t\ttabbed\nnormal',
    whitespace: true,
  },
  'remove-trailing-spaces': {
    details: 'Deletes invisible spaces and tabs at the end of every line. Many code editors and git diffs flag these.',
    example: 'line one   \nline two\t',
    whitespace: true,
  },
  'trim-lines': {
    details: 'Removes spaces and tabs from both the start and the end of every line.',
    example: '   apple   \n  banana \ncherry  ',
    whitespace: true,
  },
  'tabs-to-spaces': {
    details: 'Replaces each tab with spaces so the text lines up the same way everywhere. Tab stops are respected, so columns stay aligned.',
    example: 'name\tage\nJohn\t25',
    whitespace: true,
  },
  'spaces-to-tabs': {
    details: 'Replaces every group of N spaces (default 4) with one tab character.',
    example: '    one level\n        two levels',
    whitespace: true,
  },
  'remove-blank-lines': {
    details: 'Deletes every line that is empty or contains only spaces/tabs.',
    example: 'first\n\n   \nsecond\n\nthird',
    whitespace: true,
  },
  'remove-empty-lines': {
    details: 'Deletes only lines that are completely empty. Lines that contain just spaces are kept — use "Remove blank lines" to remove those too.',
    example: 'first\n\n   \nsecond',
    whitespace: true,
  },
  'normalize-line-breaks': {
    details:
      'Converts Windows (CRLF) and old Mac (CR) line endings to standard LF, and squeezes several blank lines in a row into a single blank line.',
    example: 'paragraph one\n\n\n\nparagraph two',
  },
  'remove-duplicate-lines': {
    details: 'Keeps the first time each line appears and removes every later copy. The order of the remaining lines does not change.',
    use: 'Cleaning up lists of emails, names or IDs.',
    example: 'apple\nbanana\napple\ncherry\nbanana',
  },
  'remove-duplicate-words': {
    details: 'Keeps the first time each word appears and removes later repeats. Case and surrounding punctuation are ignored when comparing.',
    example: 'the cat and the dog and the bird',
  },
  indent: {
    details: 'Adds one level of indentation (2 spaces, 4 spaces or a tab) to every non-empty line.',
    example: 'line one\nline two',
    whitespace: true,
  },
  outdent: {
    details: 'Removes one level of indentation from every line. Lines with less indentation lose what they have.',
    example: '    four spaces\n  two spaces\nnone',
    whitespace: true,
  },
  'reverse-text': {
    details: 'Writes the whole text backwards, character by character.',
    example: 'Hello World',
  },
  'reverse-words': {
    details: 'Reverses the order of the words on each line. The words themselves are not changed.',
    example: 'one two three\nred green blue',
  },
  'reverse-characters': {
    details: 'Reverses the letters inside each word, but keeps the words in their original order.',
    example: 'Hello World',
  },

  /* ---------- Lines ---------- */
  'sort-az': {
    details: 'Sorts lines alphabetically, ignoring upper/lower case. Numbers are sorted naturally, so "item2" comes before "item10".',
    example: 'banana\nApple\nitem10\nitem2\ncherry',
  },
  'sort-za': { details: 'Sorts lines in reverse alphabetical order (Z to A).', example: 'banana\napple\ncherry' },
  'sort-length': {
    details: 'Sorts lines by how many characters they have — shortest first or longest first.',
    example: 'elephant\ncat\nhippopotamus\ndog',
  },
  'reverse-lines': { details: 'Flips the order of lines so the last line comes first.', example: 'first\nsecond\nthird' },
  'shuffle-lines': {
    details: 'Puts the lines in a random order. While the tool stays selected the order is kept stable as you type; select it again for a new shuffle.',
    use: 'Picking random winners or randomising quiz questions.',
    example: 'one\ntwo\nthree\nfour\nfive',
  },
  'remove-lines-containing': {
    details: 'Deletes every line that contains the text you type. Tick "Ignore case" to match regardless of upper/lower case.',
    example: 'INFO started\nERROR disk full\nINFO done\nerror timeout',
    options: { query: 'error' },
  },
  'keep-lines-containing': {
    details: 'Keeps only the lines that contain the text you type and removes the rest — like a simple "grep".',
    use: 'Pulling the error lines out of a log file.',
    example: 'INFO started\nERROR disk full\nINFO done\nerror timeout',
    options: { query: 'error' },
  },
  'unique-lines': {
    details: 'Keeps only the lines that appear exactly once. Any line that is repeated is removed completely (every copy). To keep one copy of each line instead, use "Remove duplicate lines".',
    example: 'apple\nbanana\napple\ncherry',
  },
  'duplicate-lines': { details: 'Repeats every line the number of times you choose.', example: 'a\nb' },
  'keep-first': { details: 'Keeps only the first N lines and removes everything after them.', example: '1\n2\n3\n4\n5', options: { count: 3 } },
  'keep-last': { details: 'Keeps only the last N lines.', example: '1\n2\n3\n4\n5', options: { count: 2 } },
  'remove-first': { details: 'Deletes the first N lines, for example a header row.', example: 'name,age\nJohn,25\nAmit,30', options: { count: 1 } },
  'remove-last': { details: 'Deletes the last N lines, for example a footer or total row.', example: '1\n2\n3\nTotal', options: { count: 1 } },
  'every-nth': {
    details: 'Keeps one line, skips the next N−1, and repeats. "Starting at line" chooses which line to begin with.',
    example: '1\n2\n3\n4\n5\n6',
    options: { step: 2, start: 2 },
  },
  'merge-lines': {
    details: 'Joins all lines into a single line, putting the separator between them. Type \\t for a tab or \\n for a new line.',
    use: 'Turning a column of values into a comma-separated list.',
    example: 'apple\nbanana\ncherry',
  },
  'split-lines': {
    details: 'Breaks text into separate lines wherever the delimiter appears. "Trim pieces" removes spaces around each piece.',
    example: 'apple, banana, cherry',
  },
  'add-prefix': { details: 'Adds the same text to the start of every line.', use: 'Making bullet lists or commenting out code.', example: 'apple\nbanana' },
  'add-suffix': { details: 'Adds the same text to the end of every line.', example: "'apple'\n'banana'" },
  'add-line-numbers': {
    details: 'Numbers every line. You can choose the starting number and the text between the number and the line.',
    example: 'apple\nbanana\ncherry',
  },
  'remove-line-numbers': {
    details: 'Removes numbers at the start of lines such as "1. ", "2) ", "3: " or "4 - ".',
    example: '1. apple\n2) banana\n3: cherry',
  },

  /* ---------- Case ---------- */
  upper: { details: 'Makes every letter a capital letter.' },
  lower: { details: 'Makes every letter a small letter.' },
  sentence: { details: 'Makes everything lowercase, then capitalises the first letter of each sentence and the word "I".', example: 'HELLO THERE. how are you? i am fine.' },
  title: { details: 'Capitalises the first letter of every word, like a book title or headline.' },
  camel: { details: 'Joins words together; the first word is lowercase and each following word starts with a capital. Common for JavaScript variables.', example: 'user first name\nUser_ID' },
  pascal: { details: 'Joins words together and capitalises every word. Common for class and component names.', example: 'user profile card' },
  snake: { details: 'Lowercase words joined with underscores. Common in Python and databases.', example: 'User First Name\nuserId' },
  kebab: { details: 'Lowercase words joined with hyphens. Common for URLs, CSS classes and file names.', example: 'My Blog Post Title' },
  constant: { details: 'Uppercase words joined with underscores, also known as SCREAMING_SNAKE_CASE. Used for constants and environment variables.', example: 'max retry count' },
  dot: { details: 'Lowercase words joined with dots. Used for config keys and translation keys.', example: 'app settings theme' },
  slash: { details: 'Lowercase words joined with slashes, like a file path or URL path.', example: 'api users profile' },
  train: { details: 'Capitalised words joined with hyphens. Used for HTTP headers.', example: 'content type' },
  alternating: { details: 'Alternates lower and upper case letter by letter, starting with lowercase. Mostly used for fun or sarcasm.' },
  'alternating-upper': { details: 'Alternates upper and lower case letter by letter, starting with uppercase.' },
  inverse: { details: 'Swaps the case of every letter: capitals become small letters and small letters become capitals.', example: 'Hello World' },

  /* ---------- Developer ---------- */
  'json-format': { details: 'Pretty-prints JSON with line breaks and indentation so it is easy to read. Invalid JSON shows the exact line and column of the problem.' },
  'json-minify': { details: 'Removes all spaces and line breaks from JSON to make it as small as possible.', example: '{\n  "name": "John",\n  "age": 25\n}' },
  'json-validate': { details: 'Checks whether the text is valid JSON. If it is not, you get the reason and the line/column where it breaks. The text itself is not changed.' },
  'json-escape': { details: 'Escapes quotes, backslashes and line breaks so the text can be placed inside a JSON string.', example: 'He said "hi"\nNew line' },
  'json-unescape': { details: 'Turns escape sequences like \\n, \\" and \\u00e9 back into the real characters.', example: '"He said \\"hi\\"\\nNew line"' },
  'json-to-csv': {
    details: 'Converts a JSON array of objects into CSV. Every key becomes a column; nested objects are written as JSON text.',
    use: 'Opening API data in Excel or Google Sheets.',
    example: '[{"name":"John","age":25},{"name":"Amit","age":30}]',
  },
  'csv-to-json': {
    details: 'Converts CSV into a JSON array of objects. The first row is used for the keys. The delimiter can be detected automatically, and numbers/true/false can be converted to real JSON types.',
    example: 'name,age,active\nJohn,25,true\nAmit,30,false',
  },
  'json-to-yaml': { details: 'Converts JSON into YAML, the format used by Docker Compose, Kubernetes and many config files.' },
  'xml-format': { details: 'Pretty-prints XML with one tag per line and indentation. The XML is checked first and errors are reported.' },
  'xml-minify': { details: 'Removes whitespace between tags (and optionally comments) to make XML as small as possible.', example: '<root>\n  <item>1</item>\n  <!-- note -->\n</root>' },
  'xml-validate': { details: 'Checks whether the XML is well-formed: every tag closed, properly nested, one root element.' },
  'xml-escape': { details: 'Replaces & < > " \' with XML entities so the text can be safely placed inside XML.', example: 'Tom & Jerry <cartoon>' },
  'xml-unescape': { details: 'Turns XML entities like &amp; and &lt; back into characters.', example: 'Tom &amp; Jerry &lt;cartoon&gt;' },
  'html-format': { details: 'Pretty-prints HTML with indentation. Contents of <script>, <style>, <pre> and <textarea> are kept exactly as they are.' },
  'html-minify': { details: 'Removes comments and extra whitespace from HTML to make pages smaller and faster.' },
  'html-entity-encode': { details: 'Escapes special characters (& < > " \') so text shows up literally on a web page instead of being treated as HTML.', example: '<b>Tom & Jerry</b>' },
  'html-entity-decode': { details: 'Turns HTML entities like &amp;, &copy; and &#233; back into readable characters.', example: '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt; &copy; 2026' },
  'html-strip': { details: 'Removes every HTML tag, plus scripts, styles and comments, leaving the raw text exactly as it was written (entities are not decoded).' },
  'html-extract-text': { details: 'Gets the readable text from a page the way a browser shows it: entities are decoded and block elements become separate lines.' },
  'sql-format': { details: 'Beautifies SQL: each clause (SELECT, FROM, WHERE…) goes on its own line, column lists are indented, AND/OR conditions are lined up and keywords are uppercased.' },
  'sql-minify': { details: 'Removes comments and puts the query on a single line with minimal spaces. Text inside quotes is never changed.', example: 'SELECT id,\n       name -- user name\nFROM users\nWHERE active = 1;' },
  'sql-upper': { details: 'Uppercases SQL keywords (SELECT, FROM, WHERE…) without touching table names, column names or quoted text.', example: "select name from users where city = 'select'" },
  'sql-lower': { details: 'Lowercases SQL keywords without touching table names, column names or quoted text.', example: 'SELECT Name FROM Users WHERE Age > 20' },

  /* ---------- Encode / Decode ---------- */
  'base64-encode': { details: 'Encodes text as Base64, a safe set of letters and digits used in emails, data URLs and APIs. "URL-safe" uses - and _ instead of + and / and drops the = padding.' },
  'base64-decode': { details: 'Decodes Base64 back into text. Both standard and URL-safe Base64 work, and missing = padding is fine.', example: 'SGVsbG8sIFdvcmxkIQ==' },
  'url-encode': { details: 'Percent-encodes text so it can be used safely in a URL or query string, e.g. a space becomes %20 and & becomes %26.', example: 'name=John Doe&city=New York' },
  'url-decode': { details: 'Turns percent-encoded text back into normal text. Tick "+ means space" for form-encoded data.', example: 'name%3DJohn%20Doe%26city%3DNew%20York' },
  'html-encode': { details: 'Same as Developer → HTML → Entity encode: escapes characters that have a special meaning in HTML.', example: '<b>Tom & Jerry</b>' },
  'html-decode': { details: 'Same as Developer → HTML → Entity decode: turns HTML entities back into characters.', example: '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;' },
  'unicode-encode': { details: 'Replaces non-ASCII characters with \\uXXXX escape codes, the format used in JavaScript and JSON source code.', example: 'Café ☕' },
  'unicode-decode': { details: 'Turns \\uXXXX, \\u{XXXXX} and U+XXXX codes back into characters.', example: 'Caf\\u00e9 \\u2615 U+1F600' },

  /* ---------- Number Base ---------- */
  'base-convert': {
    details:
      'Converts values from any base to any other: Text, Binary (2), Octal (8), Decimal (10), Hex (16), Base 32 and Base 36. Every number in the input is converted, and spaces, commas and line breaks between them are kept. Very large numbers stay exact. When "Text" is used, each character is converted through its UTF-8 bytes — so Text → Binary gives you 8-bit bytes and Hex → Text decodes bytes back into text.',
    use: 'Programming homework, debugging bytes, or reading binary/hex messages.',
    example: '255 1024 42',
    options: { from: '10', to: '16', prefix: true },
  },
};

export const FIND_REPLACE_DOC = {
  details:
    'Find & Replace searches the input and highlights every match in yellow. Turn on "Apply replacement to output" to replace them; the output updates live as you type. Untick a match in the list to skip it, or use "First only" to replace just the first one.',
  options: [
    ['Match case', 'Treat upper and lower case as different ("Cat" will not match "cat").'],
    ['Whole word', 'Only match complete words ("cat" will not match "category").'],
    ['Regex', 'Treat the Find box as a regular expression for powerful pattern matching.'],
    ['^ $ per line', 'With Regex on: ^ and $ match the start and end of every line instead of the whole text.'],
    ['. matches newline', 'With Regex on: the dot (.) also matches line breaks.'],
    ['Escape', 'Adds backslashes before special regex characters in the Find box so they are matched literally.'],
  ],
  tokens: [
    ['$1, $2 …', 'Text captured by the first, second … group ( ) in the regex.'],
    ['$<name>', 'Text captured by a named group (?<name>…).'],
    ['$&', 'The whole match.'],
    ['\\n, \\t', 'A new line or a tab.'],
    ['$$', 'A literal dollar sign.'],
  ],
  example: { input: 'User: John\nUser: Rahul\nUser: Amit', find: 'User:\\s*(.*)', replace: '$1', output: 'John\nRahul\nAmit' },
};
