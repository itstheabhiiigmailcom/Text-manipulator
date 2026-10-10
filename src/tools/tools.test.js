import * as T from './text';
import * as C from './case';
import * as F from './findReplace';
import * as J from './json';
import * as M from './markup';
import * as S from './sql';
import * as E from './encoding';
import * as B from './numberBase';
import { ALL_TOOLS, CATEGORIES, TOOLS_BY_ID, runTool, searchTools } from './registry';
import { runPipeline } from './pipeline';
import { TOOL_DOCS } from './docs';

describe('clean & format', () => {
  test('one-click Clean Text matches the README example', () => {
    expect(T.cleanText('   hello\nhello\n   world\n\n\nworld')).toBe('hello\nworld');
  });

  test('whitespace tools', () => {
    expect(T.removeExtraSpaces('  a   b\t c  ')).toBe('a b c');
    expect(T.collapseSpaces('a    b\n  c')).toBe('a b\n c');
    expect(T.removeLeadingSpaces('  a \n\tb')).toBe('a \nb');
    expect(T.removeTrailingSpaces(' a  \nb\t')).toBe(' a\nb');
    expect(T.trimLines('  a  \n b ')).toBe('a\nb');
    expect(T.tabsToSpaces('\ta\tb', { tabWidth: 4 })).toBe('    a   b');
    expect(T.spacesToTabs('        a', { tabWidth: 4 })).toBe('\t\ta');
    expect(T.normalizeLineBreaks('a\r\nb\rc\n\n\n\nd')).toBe('a\nb\nc\n\nd');
  });

  test('blank lines and duplicates', () => {
    expect(T.removeBlankLines('a\n  \n\nb')).toBe('a\nb');
    expect(T.removeEmptyLines('a\n  \n\nb')).toBe('a\n  \nb');
    expect(T.removeDuplicateLines('a\nb\na\nA')).toBe('a\nb\nA');
    expect(T.removeDuplicateLines('a\nb\na\nA', { ignoreCase: true })).toBe('a\nb');
    expect(T.removeDuplicateWords('the cat the dog\nThe cat.')).toBe('the cat dog\n');
  });

  test('indentation', () => {
    expect(T.indentLines('a\n\nb', { style: '4' })).toBe('    a\n\n    b');
    expect(T.indentLines('a', { style: 'tab' })).toBe('\ta');
    expect(T.outdentLines('    a\n  b\n\tc\nd', { style: '2' })).toBe('  a\nb\nc\nd');
  });

  test('reverse', () => {
    expect(T.reverseText('abc def')).toBe('fed cba');
    expect(T.reverseWords('abc def ghi')).toBe('ghi def abc');
    expect(T.reverseEachWord('abc def')).toBe('cba fed');
  });
});

describe('lines', () => {
  test('sorting keeps a trailing newline at the end', () => {
    expect(T.sortAZ('b\na\nc\n')).toBe('a\nb\nc\n');
    expect(T.sortAZ('item10\nitem2\nItem1')).toBe('Item1\nitem2\nitem10');
    expect(T.sortZA('b\na\nc')).toBe('c\nb\na');
    expect(T.sortByLength('ccc\na\nbb')).toBe('a\nbb\nccc');
    expect(T.sortByLength('ccc\na\nbb', { order: 'desc' })).toBe('ccc\nbb\na');
    expect(T.reverseLines('1\n2\n3')).toBe('3\n2\n1');
  });

  test('shuffle keeps every line', () => {
    const shuffled = T.shuffleLines('a\nb\nc\nd', { random: () => 0 });
    expect(shuffled.split('\n').sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(shuffled).not.toBe('a\nb\nc\nd');
  });

  test('filtering', () => {
    expect(T.removeLinesContaining('error 1\nok\nERROR 2', { query: 'error', ignoreCase: true })).toBe('ok');
    expect(T.keepLinesContaining('error 1\nok\nERROR 2', { query: 'error', ignoreCase: false })).toBe('error 1');
    expect(() => T.keepLinesContaining('a', { query: '' })).toThrow();
    expect(T.uniqueLinesOnly('a\nb\na\nc')).toBe('b\nc');
    expect(T.duplicateLines('a\nb', { times: 2 })).toBe('a\na\nb\nb');
  });

  test('picking', () => {
    const text = '1\n2\n3\n4\n5\n6';
    expect(T.keepFirstLines(text, { count: 2 })).toBe('1\n2');
    expect(T.keepLastLines(text, { count: 2 })).toBe('5\n6');
    expect(T.removeFirstLines(text, { count: 2 })).toBe('3\n4\n5\n6');
    expect(T.removeLastLines(text, { count: 2 })).toBe('1\n2\n3\n4');
    expect(T.everyNthLine(text, { step: 2, start: 1 })).toBe('1\n3\n5');
    expect(T.everyNthLine(text, { step: 3, start: 3 })).toBe('3\n6');
  });

  test('join, split, prefix, numbering', () => {
    expect(T.mergeLines('a\n\nb\nc', { separator: ', ', skipEmpty: true })).toBe('a, b, c');
    expect(T.mergeLines('a\nb', { separator: '\\t' })).toBe('a\tb');
    expect(T.splitToLines('a, b,c', { delimiter: ',', trim: true })).toBe('a\nb\nc');
    expect(T.addPrefix('a\nb', { prefix: '- ' })).toBe('- a\n- b');
    expect(T.addSuffix('a\nb', { suffix: ';' })).toBe('a;\nb;');
    expect(T.addLineNumbers('a\nb', { start: 1, separator: '. ' })).toBe('1. a\n2. b');
    expect(T.addLineNumbers(Array(10).fill('x').join('\n')).split('\n')[0]).toBe(' 1. x');
    expect(T.removeLineNumbers('1. a\n 2) b\n10: c\n3\td')).toBe('a\nb\nc\nd');
  });
});

describe('case', () => {
  const input = 'hello world example';
  test('programming cases match the README example', () => {
    expect(C.camelCase(input)).toBe('helloWorldExample');
    expect(C.pascalCase(input)).toBe('HelloWorldExample');
    expect(C.snakeCase(input)).toBe('hello_world_example');
    expect(C.kebabCase(input)).toBe('hello-world-example');
    expect(C.constantCase(input)).toBe('HELLO_WORLD_EXAMPLE');
    expect(C.titleCase(input)).toBe('Hello World Example');
    expect(C.dotCase(input)).toBe('hello.world.example');
    expect(C.slashCase(input)).toBe('hello/world/example');
    expect(C.trainCase(input)).toBe('Hello-World-Example');
  });

  test('converts between identifier styles, line by line', () => {
    expect(C.snakeCase('helloWorld\nXMLHttpRequest\nuser-id')).toBe('hello_world\nxml_http_request\nuser_id');
    expect(C.camelCase('HELLO_WORLD')).toBe('helloWorld');
  });

  test('writing and fun cases', () => {
    expect(C.sentenceCase('HELLO WORLD. how are you? i am fine')).toBe('Hello world. How are you? I am fine');
    expect(C.alternatingCase('hello world')).toBe('hElLo WoRlD');
    expect(C.alternatingCaseUpperFirst('hello')).toBe('HeLlO');
    expect(C.inverseCase('Hello World')).toBe('hELLO wORLD');
    expect(C.upperCase('abc')).toBe('ABC');
    expect(C.lowerCase('ABC')).toBe('abc');
  });
});

describe('find & replace', () => {
  test('regex capture groups match the README example', () => {
    const text = 'User: John\nUser: Rahul\nUser: Amit';
    const re = F.buildRegex('User:\\s*(.*)', { useRegex: true });
    const matches = F.findMatches(text, re);
    expect(matches).toHaveLength(3);
    expect(F.replaceMatches(text, matches, '$1', true)).toBe('John\nRahul\nAmit');
  });

  test('plain text is escaped and $ is literal', () => {
    const re = F.buildRegex('a.b', {});
    const matches = F.findMatches('a.b axb A.B', re);
    expect(matches).toHaveLength(2);
    expect(F.replaceMatches('a.b axb A.B', matches, '$1', false)).toBe('$1 axb $1');
  });

  test('case sensitivity, whole word, selected occurrences', () => {
    const text = 'cat Cat category cat';
    expect(F.findMatches(text, F.buildRegex('cat', { caseSensitive: true }))).toHaveLength(3);
    const whole = F.findMatches(text, F.buildRegex('cat', { wholeWord: true }));
    expect(whole).toHaveLength(3);
    expect(F.replaceMatches(text, whole, 'dog', false, new Set([0, 2]))).toBe('dog Cat category dog');
  });

  test('multiline and dotAll flags', () => {
    expect(F.findMatches('a\nb', F.buildRegex('^b', { useRegex: true }))).toHaveLength(0);
    expect(F.findMatches('a\nb', F.buildRegex('^b', { useRegex: true, multiline: true }))).toHaveLength(1);
    expect(F.findMatches('a\nb', F.buildRegex('a.b', { useRegex: true, dotAll: true }))).toHaveLength(1);
  });

  test('replacement templates', () => {
    const text = 'John Smith';
    const matches = F.findMatches(text, F.buildRegex('(?<first>\\w+) (\\w+)', { useRegex: true }));
    expect(F.replaceMatches(text, matches, '$2, $<first> ($&) $$', true)).toBe('Smith, John (John Smith) $');
    expect(F.replaceMatches('a,b', F.findMatches('a,b', F.buildRegex(',', { useRegex: true })), '\\n', true)).toBe('a\nb');
  });

  test('invalid regex throws and escapeRegExp works', () => {
    expect(() => F.buildRegex('(', { useRegex: true })).toThrow();
    expect(F.escapeRegExp('a.b*(c)')).toBe('a\\.b\\*\\(c\\)');
  });
});

describe('json', () => {
  test('format, minify and validate', () => {
    expect(J.formatJson('{"name":"John","age":25}')).toBe('{\n  "name": "John",\n  "age": 25\n}');
    expect(J.minifyJson('{ "a" : [1, 2] }')).toBe('{"a":[1,2]}');
    expect(J.validateJson('{"a":1}').message).toMatch(/Valid JSON/);
    expect(() => J.validateJson('{"a":1,}')).toThrow(/Invalid JSON/);
  });

  test('escape and unescape round trip', () => {
    const raw = 'He said "hi"\n\tbye\\';
    expect(J.escapeJson(raw)).toBe('He said \\"hi\\"\\n\\tbye\\\\');
    expect(J.unescapeJson(J.escapeJson(raw))).toBe(raw);
    expect(J.unescapeJson('"a\\nb"')).toBe('a\nb');
  });

  test('CSV conversion', () => {
    const json = '[{"name":"John","age":25},{"name":"Doe, Jane","city":"Delhi"}]';
    expect(J.jsonToCsv(json)).toBe('name,age,city\nJohn,25,\n"Doe, Jane",,Delhi');
    const csv = 'name,age,active\nJohn,25,true\n"Doe, ""J""",007,false\n';
    expect(JSON.parse(J.csvToJson(csv))).toEqual([
      { name: 'John', age: 25, active: true },
      { name: 'Doe, "J"', age: '007', active: false },
    ]);
    expect(JSON.parse(J.csvToJson('a;b\n1;2'))).toEqual([{ a: 1, b: 2 }]);
  });

  test('YAML conversion', () => {
    const yaml = J.jsonToYaml('{"name":"John","age":25,"tags":["a","b"],"address":{"city":"New York"},"items":[{"id":1,"ok":true}],"empty":[],"note":"yes"}');
    expect(yaml).toBe(
      [
        'name: John',
        'age: 25',
        'tags:',
        '  - a',
        '  - b',
        'address:',
        '  city: New York',
        'items:',
        '  - id: 1',
        '    ok: true',
        'empty: []',
        'note: "yes"',
      ].join('\n')
    );
  });
});

describe('xml & html', () => {
  test('xml format, minify, validate', () => {
    const xml = '<a><b id="1">text</b><c/><d></d></a>';
    expect(M.formatXml(xml)).toBe('<a>\n  <b id="1">text</b>\n  <c/>\n  <d></d>\n</a>');
    expect(M.minifyXml('<a>\n  <b>x</b>\n  <!-- c -->\n</a>')).toBe('<a><b>x</b></a>');
    expect(M.validateXml(xml).message).toMatch(/well-formed/);
    expect(() => M.validateXml('<a><b></a>')).toThrow(/Invalid XML/);
  });

  test('xml escape/unescape', () => {
    expect(M.escapeXml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;');
    expect(M.unescapeXml('&lt;a&gt; &amp;amp; &#65;&#x42;')).toBe('<a> &amp; AB');
  });

  test('html format keeps void elements and raw blocks', () => {
    const html = '<div><p>Hi <b>there</b></p><br><img src="a.png"><script>if (a < b) {}</script></div>';
    expect(M.formatHtml(html)).toBe(
      '<div>\n  <p>\n    Hi\n    <b>there</b>\n  </p>\n  <br>\n  <img src="a.png">\n  <script>if (a < b) {}</script>\n</div>'
    );
  });

  test('html minify, entities, strip and extract', () => {
    expect(M.minifyHtml('<div>\n  <p>a   b</p>\n  <!-- x -->\n  <span>1</span> <span>2</span>\n</div>')).toBe(
      '<div><p>a b</p><span>1</span> <span>2</span></div>'
    );
    expect(M.encodeHtmlEntities('<a> & "é"')).toBe('&lt;a&gt; &amp; &quot;é&quot;');
    expect(M.encodeHtmlEntities('é', { encodeNonAscii: true })).toBe('&#233;');
    expect(M.decodeHtmlEntities('&lt;b&gt; &amp; &copy; &#233; <i>x</i>')).toBe('<b> & © é <i>x</i>');
    expect(M.stripHtmlTags('<p>Hello &amp; <b>bye</b></p><script>x()</script>')).toBe('Hello &amp; bye');
    expect(M.extractTextFromHtml('<h1>Title</h1><p>Hello &amp; <b>bye</b></p><script>x()</script>')).toBe('Title\n\nHello & bye');
  });
});

describe('sql', () => {
  test('formats the README example', () => {
    expect(S.formatSql('select id,name from users where age>20 order by name;')).toBe(
      'SELECT\n    id,\n    name\nFROM users\nWHERE age > 20\nORDER BY name;'
    );
  });

  test('handles joins, AND/OR, BETWEEN, functions and subqueries', () => {
    const sql =
      "select u.id, count(*) as total from users u left join orders o on o.user_id=u.id where u.age between 18 and 30 and u.name like 'a%' group by u.id having count(*)>1";
    expect(S.formatSql(sql)).toBe(
      [
        'SELECT',
        '    u.id,',
        '    COUNT(*) AS total',
        'FROM users u',
        'LEFT JOIN orders o ON o.user_id = u.id',
        'WHERE u.age BETWEEN 18 AND 30',
        "    AND u.name LIKE 'a%'",
        'GROUP BY u.id',
        'HAVING COUNT(*) > 1',
      ].join('\n')
    );
    expect(S.formatSql('select * from t where id in (select id from x)')).toBe(
      'SELECT\n    *\nFROM t\nWHERE id IN (\n    SELECT\n        id\n    FROM x\n)'
    );
  });

  test('minify and keyword case leave strings alone', () => {
    expect(S.minifySql("SELECT a,\n  b -- note\nFROM t WHERE x = 'select  me'")).toBe("SELECT a,b FROM t WHERE x='select  me'");
    expect(S.sqlKeywordsUpper("select name from t where x = 'from'")).toBe("SELECT name FROM t WHERE x = 'from'");
    expect(S.sqlKeywordsLower('SELECT Name FROM T')).toBe('select Name from T');
  });
});

describe('encoding', () => {
  const text = 'Hello, Café ☕ 😀';
  test.each([
    ['base64', E.base64Encode, E.base64Decode],
    ['url', E.urlEncode, E.urlDecode],
    ['unicode', E.unicodeEncode, E.unicodeDecode],
  ])('%s round trip', (_, encode, decode) => {
    expect(decode(encode(text))).toBe(text);
  });

  test('known values', () => {
    expect(E.base64Encode('Hello')).toBe('SGVsbG8=');
    expect(E.base64Decode('SGVsbG8')).toBe('Hello');
    expect(E.urlEncode('a b&c')).toBe('a%20b%26c');
    expect(E.unicodeEncode('é')).toBe('\\u00e9');
    expect(E.unicodeDecode('\\u00e9 U+1F600')).toBe('é 😀');
  });

  test('invalid input gives a readable error', () => {
    expect(() => E.base64Decode('***')).toThrow(/Invalid Base64/);
    expect(() => E.urlDecode('%E0%A4%A')).toThrow(/Invalid URL/);
  });
});

describe('number base', () => {
  const convert = (text, from, to, extra) => B.convertBase(text, { from, to, ...extra });

  test('number to number, keeping separators', () => {
    expect(convert('255 1024\n42', '10', '2')).toBe('11111111 10000000000\n101010');
    expect(convert('255, -16', '10', '16')).toBe('FF, -10');
    expect(convert('ff', '16', '10')).toBe('255');
    expect(convert('0x1F 0XFF', '16', '8', { prefix: true })).toBe('0o37 0o377');
    expect(convert('777', '8', '10')).toBe('511');
    expect(convert('zz', '36', '10')).toBe('1295');
    expect(convert('255', '10', '16', { uppercase: false, prefix: true })).toBe('0xff');
  });

  test('handles numbers beyond Number precision', () => {
    expect(convert('123456789012345678901234567890', '10', '16')).toBe('18EE90FF6C373E0EE4E3F0AD2');
    expect(convert('18EE90FF6C373E0EE4E3F0AD2', '16', '10')).toBe('123456789012345678901234567890');
  });

  test('text to and from bytes', () => {
    expect(convert('Hi', 'text', '2')).toBe('01001000 01101001');
    expect(convert('Hi', 'text', '16')).toBe('48 69');
    expect(convert('Hi', 'text', '10')).toBe('72 105');
    expect(convert('01001000 01101001', '2', 'text')).toBe('Hi');
    expect(convert('48 69', '16', 'text')).toBe('Hi');
    expect(convert(convert('Café 😀', 'text', '8'), '8', 'text')).toBe('Café 😀');
    expect(convert('9731', '10', 'text')).toBe('☃');
  });

  test('invalid digits give a readable error', () => {
    expect(() => convert('102', '2', '10')).toThrow('"102" is not a valid Binary (2) number.');
    expect(() => convert('hello', '10', '2')).toThrow(/not a valid Decimal/);
  });
});

describe('pipeline', () => {
  const getTool = (id) => TOOLS_BY_ID[id];

  test('runs selected tools in order and reports errors per step', () => {
    const steps = [{ toolId: 'remove-blank-lines', seed: 1 }, { toolId: 'sort-az', seed: 1 }, { toolId: 'upper', seed: 1 }];
    expect(runPipeline('b\n\na', steps, getTool).output).toBe('A\nB');

    const failing = runPipeline('{bad', [{ toolId: 'trim-lines', seed: 1 }, { toolId: 'json-format', seed: 1 }], getTool);
    expect(failing.failedAt).toBe(1);
    expect(failing.results[1].error).toMatch(/Invalid JSON/);
  });

  test('validators pass text through with a message, shuffle is stable for a seed', () => {
    const result = runPipeline('{"a":1}', [{ toolId: 'json-validate', seed: 1 }], getTool);
    expect(result.output).toBe('{"a":1}');
    expect(result.results[0].message).toMatch(/Valid JSON/);
    const shuffle = [{ toolId: 'shuffle-lines', seed: 42 }];
    const text = 'a\nb\nc\nd\ne\nf';
    expect(runPipeline(text, shuffle, getTool).output).toBe(runPipeline(text, shuffle, getTool).output);
  });

  test('options are passed to tools', () => {
    const steps = [{ toolId: 'base-convert', seed: 1 }];
    expect(runPipeline('255', steps, getTool, { 'base-convert': { from: '10', to: '16' } }).output).toBe('FF');
  });
});

describe('registry', () => {
  test('tool ids are unique and every tool runs on sample text', () => {
    const ids = ALL_TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    ALL_TOOLS.forEach((tool) => {
      let sample = tool.group.sample || tool.category.sample || 'hello world';
      const encoder = tool.group.tools[0];
      if (tool.category.pairs && tool.id !== encoder.id) sample = runTool(encoder, sample).output;
      const options = tool.id.includes('containing') ? { query: 'a' } : {};
      const result = runTool(tool, sample, options);
      expect(typeof (result.output ?? result.message)).toBe('string');
    });
  });

  test('every tool is documented with a working example', () => {
    ALL_TOOLS.forEach((tool) => {
      const doc = TOOL_DOCS[tool.id];
      expect(doc && doc.details).toBeTruthy();
      const input = doc.example ?? tool.group.sample ?? tool.category.sample ?? 'hello world example';
      const result = runTool(tool, input, doc.options);
      expect(result.output ?? result.message).toBeTruthy();
    });
    expect(Object.keys(TOOL_DOCS).filter((id) => !TOOLS_BY_ID[id])).toEqual([]);
  });

  test('every category has a sample and search finds tools across categories', () => {
    CATEGORIES.forEach((c) => expect(c.sample || c.groups.every((g) => g.sample)).toBeTruthy());
    expect(searchTools('base64').map((t) => t.id)).toEqual(['base64-encode', 'base64-decode']);
    expect(searchTools('screaming').map((t) => t.id)).toEqual(['constant']);
  });
});
