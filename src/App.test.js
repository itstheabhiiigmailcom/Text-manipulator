import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

const goTo = (path) => window.history.pushState({}, '', path);
const typeInput = (text) => fireEvent.change(screen.getByLabelText('Input'), { target: { value: text } });
const output = () => screen.getByLabelText('Output').value;
const panel = () => screen.getByRole('complementary', { name: 'Tools panel' });
const openSection = (name) => fireEvent.click(within(panel()).getByText(name));
const tool = (name) => within(panel()).getByRole('button', { name: new RegExp(`^${name}(\\s|$)`) });

beforeEach(() => {
  localStorage.clear();
  goTo('/');
});

describe('home page', () => {
  test('keeps the simple editor with a few key actions', () => {
    render(<App />);
    const box = screen.getByLabelText('Your text');
    fireEvent.change(box, { target: { value: 'hello   world' } });
    fireEvent.click(screen.getByRole('button', { name: 'Convert to Uppercase' }));
    expect(box.value).toBe('HELLO   WORLD');
    fireEvent.click(screen.getByRole('button', { name: 'Remove Extra Spaces' }));
    expect(box.value).toBe('HELLO WORLD');
    expect(screen.getByText('2 words and 11 characters')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'More tools →' })).toHaveAttribute('href', '/tools');
  });
});

describe('navigation, docs and about', () => {
  test('the Textsmith brand is the home link and there is no separate Home link', () => {
    goTo('/about');
    render(<App />);
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Textsmith' }));
    expect(screen.getByLabelText('Your text')).toBeInTheDocument();
  });

  test('docs list every action with a live example and highlight the linked one', () => {
    goTo('/docs#tool-snake');
    render(<App />);
    const entry = document.getElementById('tool-snake');
    expect(entry).toHaveClass('is-target');
    expect(within(entry).getByText('user_first_name user_id')).toBeInTheDocument();
    expect(document.getElementById('tool-find-replace')).toBeInTheDocument();
    expect(document.getElementById('tool-base-convert')).toBeInTheDocument();
  });

  test('the contents list highlights the entry being read while scrolling', async () => {
    goTo('/docs');
    render(<App />);
    const entries = () => Array.from(document.querySelectorAll('#getting-started, .tu-doc-tool'));
    const scrollTo = (id) => {
      const index = entries().findIndex((el) => el.id === id);
      jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
        const top = (entries().indexOf(this) - index) * 300;
        return { top, bottom: top + 280, left: 0, right: 0, width: 0, height: 280 };
      });
      fireEvent.scroll(window);
    };
    const contents = within(screen.getByRole('complementary', { name: 'Contents' }));

    scrollTo('tool-sort-az');
    await waitFor(() => expect(contents.getByRole('link', { name: 'Sort A → Z' })).toHaveClass('is-active'));
    expect(contents.getByRole('link', { name: 'Lines' })).toHaveClass('is-current');

    scrollTo('tool-json-format');
    await waitFor(() => expect(contents.getByRole('link', { name: 'JSON Format' })).toHaveClass('is-active'));
    expect(contents.getByRole('link', { name: 'Sort A → Z' })).not.toHaveClass('is-active');
    jest.restoreAllMocks();
  });

  test('docs filter narrows the list', () => {
    goTo('/docs');
    render(<App />);
    fireEvent.change(screen.getByLabelText('Filter documentation'), { target: { value: 'base64' } });
    expect(document.getElementById('tool-base64-encode')).toBeInTheDocument();
    expect(document.getElementById('tool-sort-az')).not.toBeInTheDocument();
  });

  test('about page explains the goal', () => {
    goTo('/about');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Our goal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Frequently asked questions' })).toBeInTheDocument();
  });
});

describe('tools page', () => {
  beforeEach(() => goTo('/tools'));

  test('selected tools stay highlighted, stack in order and update live', () => {
    render(<App />);
    typeInput('b\n\na');
    const removeBlank = tool('Remove blank lines');
    fireEvent.click(removeBlank);
    expect(removeBlank).toHaveAttribute('aria-pressed', 'true');
    expect(output()).toBe('b\na');

    openSection('Lines');
    fireEvent.click(tool('Sort A → Z'));
    expect(output()).toBe('a\nb');

    typeInput('d\n\nc');
    expect(output()).toBe('c\nd');

    openSection('Clean & Format');
    fireEvent.click(tool('Remove blank lines'));
    expect(tool('Remove blank lines')).toHaveAttribute('aria-pressed', 'false');
    expect(output()).toBe('\nc\nd');
  });

  test('removing a step from the applied bar deselects it', () => {
    render(<App />);
    typeInput('x');
    fireEvent.click(tool('Clean Text'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Clean Text' }));
    expect(tool('Clean Text')).toHaveAttribute('aria-pressed', 'false');
    expect(output()).toBe('');
  });

  test('options appear for a selected tool and apply live', () => {
    render(<App />);
    openSection('Lines');
    typeInput('1\n2\n3\n4\n5');
    fireEvent.click(tool('Keep first N lines'));
    fireEvent.change(within(panel()).getByLabelText('N'), { target: { value: '2' } });
    expect(output()).toBe('1\n2');
  });

  test('less common tools are behind "Show more"', () => {
    render(<App />);
    expect(within(panel()).queryByRole('button', { name: /Reverse text/ })).not.toBeInTheDocument();
    fireEvent.click(within(panel()).getByRole('button', { name: /Show \d+ more tools/ }));
    expect(tool('Reverse text')).toBeInTheDocument();
  });

  test('regex find & replace applies to the output with per-match selection', () => {
    render(<App />);
    openSection('Find & Replace');
    typeInput('User: John\nUser: Rahul\nUser: Amit');
    fireEvent.click(within(panel()).getByRole('button', { name: /Regex/ }));
    fireEvent.change(screen.getByLabelText('Find'), { target: { value: 'User:\\s*(.*)' } });
    fireEvent.change(screen.getByLabelText('Replace with'), { target: { value: '$1' } });
    fireEvent.click(screen.getByRole('button', { name: /Apply replacement/ }));
    expect(output()).toBe('John\nRahul\nAmit');

    fireEvent.click(within(panel()).getAllByRole('checkbox')[0]);
    expect(output()).toBe('User: John\nRahul\nAmit');
    expect(screen.getByRole('button', { name: /Replacing in output/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('developer tools show errors without crashing', () => {
    render(<App />);
    openSection('Developer');
    typeInput('{"name":"John","age":25}');
    fireEvent.click(tool('Format'));
    expect(output()).toBe('{\n  "name": "John",\n  "age": 25\n}');
    typeInput('{bad');
    expect(screen.getByRole('alert')).toHaveTextContent(/JSON Format.*failed: Invalid JSON/);
  });

  test('number base converter converts any to any', () => {
    render(<App />);
    openSection('Number Base');
    typeInput('255 10');
    fireEvent.click(tool('Convert'));
    expect(output()).toBe('11111111 1010');
    fireEvent.change(within(panel()).getByLabelText('To'), { target: { value: '16' } });
    expect(output()).toBe('FF A');
    fireEvent.change(within(panel()).getByLabelText('From'), { target: { value: 'text' } });
    typeInput('Hi');
    expect(output()).toBe('48 69');
  });

  test('only one section is open at a time', () => {
    render(<App />);
    const header = (name) => within(panel()).getByText(name).closest('button');
    expect(header('Clean & Format')).toHaveAttribute('aria-expanded', 'true');
    openSection('Lines');
    expect(header('Lines')).toHaveAttribute('aria-expanded', 'true');
    expect(header('Clean & Format')).toHaveAttribute('aria-expanded', 'false');
    openSection('Lines');
    expect(header('Lines')).toHaveAttribute('aria-expanded', 'false');
  });

  test('hovering an action shows a description with a link to its docs', async () => {
    render(<App />);
    fireEvent.mouseEnter(tool('Remove blank lines').parentElement);
    const card = await screen.findByRole('tooltip');
    expect(card).toHaveTextContent('Removes lines that are empty or contain only whitespace.');
    expect(within(card).getByRole('link', { name: /Learn more/ })).toHaveAttribute('href', '/docs#tool-remove-blank-lines');
  });

  test('selections survive leaving the page', () => {
    const { unmount } = render(<App />);
    typeInput('b\na');
    fireEvent.click(tool('Clean Text'));
    unmount();
    render(<App />);
    expect(tool('Clean Text')).toHaveAttribute('aria-pressed', 'true');
    expect(output()).toBe('b\na');
  });

  test('"Try it" from the docs selects the tool and opens its section', () => {
    goTo('/tools?select=sort-za');
    render(<App />);
    expect(tool('Sort Z → A')).toHaveAttribute('aria-pressed', 'true');
  });

  test('search finds tools across sections and the panel collapses', () => {
    render(<App />);
    typeInput('hello world example');
    fireEvent.change(screen.getByLabelText('Search all tools'), { target: { value: 'snake' } });
    fireEvent.click(tool('snake_case'));
    expect(output()).toBe('hello_world_example');

    fireEvent.click(screen.getByRole('button', { name: 'Hide tools panel' }));
    expect(screen.queryByRole('complementary', { name: 'Tools panel' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show tools panel' }));
    expect(panel()).toBeInTheDocument();
  });
});
