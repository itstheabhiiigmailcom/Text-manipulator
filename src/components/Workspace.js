import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TOOLS_BY_ID } from '../tools/registry';
import { runPipeline } from '../tools/pipeline';
import usePersistentState from '../usePersistentState';
import Editor from './Editor';
import { useFindReplace } from './FindReplacePanel';
import ToolSidebar from './ToolSidebar';
import './Workspace.css';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function Workspace({ showAlert }) {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = usePersistentState('textutils.input', '');
  const [storedSteps, setSteps] = usePersistentState('textutils.steps', []);
  const steps = useMemo(
    () => storedSteps.filter((s) => s.toolId === 'find-replace' || TOOLS_BY_ID[s.toolId]),
    [storedSteps]
  );
  const [toolOptions, setToolOptions] = usePersistentState('textutils.toolOptions', {});
  const [collapsed, setCollapsed] = usePersistentState('textutils.toolsCollapsed', false);
  const fr = useFindReplace(input);

  // "Try it" links from the docs arrive as /tools?select=<tool id>.
  const requested = params.get('select');
  const [initialOpen] = useState(() => {
    if (requested === 'find-replace') return 'find';
    return TOOLS_BY_ID[requested]?.category.id || 'clean';
  });
  useEffect(() => {
    if (!requested) return;
    if (TOOLS_BY_ID[requested] || requested === 'find-replace') {
      setSteps((prev) => (prev.some((s) => s.toolId === requested) ? prev : [...prev, { toolId: requested, seed: newSeed() }]));
      setCollapsed(false);
    }
    setParams({}, { replace: true });
  }, [requested, setParams, setSteps, setCollapsed]);

  const getTool = (id) => (id === fr.tool.id ? fr.tool : TOOLS_BY_ID[id]);
  const { output, results, failedAt } = useMemo(
    () => (input ? runPipeline(input, steps, getTool, toolOptions) : { output: '', results: [], failedAt: -1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, steps, toolOptions, fr.tool]
  );

  const toggleStep = (toolId) =>
    setSteps((prev) =>
      prev.some((s) => s.toolId === toolId)
        ? prev.filter((s) => s.toolId !== toolId)
        : [...prev, { toolId, seed: newSeed() }]
    );
  const findSelected = steps.some((s) => s.toolId === fr.tool.id);

  const updateOptions = (toolId, values) => setToolOptions((prev) => ({ ...prev, [toolId]: values }));

  const copy = (text, what) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showAlert(`${what} copied to clipboard.`, 'success'))
      .catch(() => showAlert('Your browser blocked clipboard access.', 'warning'));
  };

  const paste = () => {
    if (!navigator.clipboard?.readText) {
      showAlert('Your browser does not allow pasting from a button — use Ctrl+V in the Input box.', 'warning');
      return;
    }
    navigator.clipboard
      .readText()
      .then(setInput)
      .catch(() => showAlert('Clipboard access was denied — use Ctrl+V in the Input box.', 'warning'));
  };

  const useOutputAsInput = () => {
    setInput(output);
    setSteps([]);
    showAlert('Output moved to Input and the selected tools were cleared.', 'success');
  };

  const stepLabel = (step) => {
    const tool = getTool(step.toolId);
    const group = tool.group;
    return tool.category && (tool.category.layout === 'tabs' || tool.category.pairs) ? `${group.title} ${tool.label}` : tool.label;
  };

  const messages = results.map((r, i) => r.message && { i, text: r.message }).filter(Boolean);
  const failed = failedAt >= 0 && { label: stepLabel(steps[failedAt]), text: results[failedAt].error };

  const status = failed ? (
    <div className="tu-status tu-status-error" role="alert">
      Step {failedAt + 1} “{failed.label}” failed: {failed.text}
    </div>
  ) : messages.length ? (
    <div className="tu-status tu-status-success" role="status">
      {messages.map((m) => (
        <div key={m.i}>{m.text}</div>
      ))}
    </div>
  ) : null;

  return (
    <div className={`tu-workspace ${collapsed ? 'is-collapsed' : ''}`}>
      <main className="tu-main">
        <div className="tu-steps" aria-label="Selected tools">
          <span className="tu-steps-label">Applied:</span>
          {steps.length === 0 ? (
            <span className="tu-steps-empty">
              Nothing yet — pick tools from the panel on the right. They stay selected until you remove them, and the output updates as you type.
            </span>
          ) : (
            <>
              {steps.map((step, i) => (
                <span key={step.toolId} className={`tu-step ${i === failedAt ? 'is-error' : ''}`}>
                  <span className="tu-step-number">{i + 1}</span>
                  {stepLabel(step)}
                  <button type="button" className="tu-step-remove" aria-label={`Remove ${stepLabel(step)}`} onClick={() => toggleStep(step.toolId)}>
                    ×
                  </button>
                </span>
              ))}
              <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => setSteps([])}>
                Clear all
              </button>
            </>
          )}
        </div>

        <div className="tu-editors">
          <Editor
            id="input"
            label="Input"
            value={input}
            onChange={setInput}
            placeholder="Type or paste your text here…"
            highlights={fr.settings.find && fr.matches.length ? fr.matches.map((m, i) => ({ ...m, selected: fr.selected.has(i) })) : null}
            actions={
              <>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={paste}>Paste</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!input} onClick={() => copy(input, 'Input')}>Copy</button>
                <button type="button" className="btn btn-sm btn-outline-danger" disabled={!input} onClick={() => setInput('')}>Clear</button>
              </>
            }
          />
          <Editor
            id="output"
            label="Output"
            value={steps.length ? output : ''}
            readOnly
            placeholder={input ? 'Select a tool on the right to see the result here.' : 'Results appear here.'}
            status={status}
            actions={
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={!steps.length || !output}
                  onClick={useOutputAsInput}
                  title="Replace the input with this output and clear the selected tools"
                >
                  Use as input
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!steps.length || !output} onClick={() => copy(output, 'Output')}>
                  Copy
                </button>
              </>
            }
          />
        </div>
      </main>

      <ToolSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        steps={steps}
        onClearSteps={() => setSteps([])}
        fr={fr}
        findSelected={findSelected}
        onToggleFind={() => toggleStep(fr.tool.id)}
        toggleProps={{ steps, toolOptions, onToggle: toggleStep, onOptionsChange: updateOptions }}
        initialOpen={initialOpen}
      />
    </div>
  );
}
