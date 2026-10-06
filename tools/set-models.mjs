// Usage: node tools/set-models.mjs   — writes the `model:` line of every agent from models.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const cfg = JSON.parse(readFileSync('models.json', 'utf8'));
let changed = 0;
for (const [agent, tier] of Object.entries(cfg.agents)) {
  const model = cfg.tiers[tier];
  const file = `.opencode/agents/${agent}.md`;
  if (!model || !existsSync(file)) { console.log(`skip ${agent} (no model for tier "${tier}" or file missing)`); continue; }
  const text = readFileSync(file, 'utf8');
  const next = text.replace(/^model:.*$/m, `model: ${model}`);
  if (next === text) continue;
  writeFileSync(file, next); changed++;
  console.log(`${agent.padEnd(20)} → ${model}`);
}
console.log(changed ? `${changed} agent(s) updated.` : 'Nothing to change.');
