import { runTool } from './registry';

// Deterministic random numbers so a shuffle step doesn't reshuffle on every keystroke.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Runs each selected step on the previous step's output.
// Returns the final text plus a per-step result ({ message } or { error }).
export function runPipeline(input, steps, getTool, toolOptions = {}) {
  let text = input;
  const results = [];
  for (const step of steps) {
    const tool = getTool(step.toolId);
    if (!tool) continue;
    try {
      const result = runTool(tool, text, { ...toolOptions[tool.id], random: seededRandom(step.seed) });
      if (result.output !== undefined) text = result.output;
      results.push({ message: result.message });
    } catch (e) {
      results.push({ error: e.message });
      return { output: '', results, failedAt: results.length - 1 };
    }
  }
  return { output: text, results, failedAt: -1 };
}
