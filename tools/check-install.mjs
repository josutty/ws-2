// Usage: node tools/check-install.mjs   — tells you in plain words whether the team is installed correctly.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const AGENTS = ['orchestrator','app-bootstrap','codebase-scanner','wireframe-analyzer','hybrid-api-config','schema-parser',
  'mock-data-generator','fsd-planner','coverage-checker','architect','store-architect','styling-engineer','test-engineer',
  'component-generator','coder','reviewer','debugger','researcher','reflector'];
const COMMANDS = ['new-project','feature','bugfix','quick','gap-fill','status','resume','approve','reject'];
let problems = 0, warnings = 0;
const ok = (m) => console.log(`✅ ${m}`);
const bad = (m, fix) => { problems++; console.log(`❌ ${m}\n   → ${fix}`); };
const warn = (m, fix) => { warnings++; console.log(`⚠️  ${m}\n   → ${fix}`); };
const list = (d, ext) => (existsSync(d) ? readdirSync(d, { recursive: true }).filter((f) => String(f).endsWith(ext)).map(String) : []);

// 1. agents
const missing = AGENTS.filter((a) => !existsSync(`.opencode/agents/${a}.md`));
if (!existsSync('.opencode')) bad('The ".opencode" folder is missing (phone file viewers and macOS Finder hide folders whose name starts with a dot, so it is easy to leave behind).', 'Unzip on the computer and copy EVERYTHING into the project root, or use agents-visible.zip (see README-OPENCODE.md).');
else if (missing.length) bad(`${missing.length} agent file(s) missing: ${missing.join(', ')}`, 'Copy the missing files into .opencode/agents/.');
else ok('All 19 agents are in .opencode/agents/');
if (existsSync('.opencode/agents/orchestrator.md') && !/^mode:\s*primary/m.test(readFileSync('.opencode/agents/orchestrator.md', 'utf8')))
  bad('orchestrator is not set as the main agent.', 'The file must contain "mode: primary" in its header.');

// 2. commands, config, rules
const noCmd = COMMANDS.filter((c) => !existsSync(`.opencode/commands/${c}.md`));
noCmd.length ? warn(`Shortcut commands missing: ${noCmd.join(', ')}`, 'Copy .opencode/commands/ from the zip (optional, but makes prompts one word).') : ok('Shortcut commands (/new-project, /status, /resume …) are there');
for (const f of ['AGENTS.md', 'PLAYBOOK.md']) existsSync(f) ? ok(`${f} found`) : bad(`${f} is missing from the project root.`, 'Copy it from the zip to the project root (next to package.json).');
try { JSON.parse(readFileSync('opencode.json', 'utf8')); ok('opencode.json is valid'); } catch { warn('opencode.json is missing or broken.', 'Copy it from the zip.'); }

// 3. models
if (existsSync('.opencode/agents')) {
  const models = new Set(AGENTS.filter((a) => existsSync(`.opencode/agents/${a}.md`)).map((a) => (readFileSync(`.opencode/agents/${a}.md`, 'utf8').match(/^model:\s*(\S+)/m) ?? [])[1]).filter(Boolean));
  models.size <= 1 ? warn(`Every agent uses the same model (${[...models][0] ?? 'none'}).`, 'Optional but recommended: edit models.json, then run: node tools/set-models.mjs') : ok(`${models.size} different models set`);
}

// 4. git
try {
  const hooks = execSync('git config core.hooksPath', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  hooks === '.githooks' ? ok('Git protection is on (no commits on main)') : warn('Git protection is not on.', 'Run once: git config core.hooksPath .githooks');
} catch { warn('Git protection is not on (or this folder is not a git repository).', 'Run: git init   then   git config core.hooksPath .githooks'); }

// 5. inputs
const fsd = existsSync('inputs/fsd-spec.md'), ux = list('inputs/ux', '.html').length, api = list('inputs/api', '.yaml').length + list('inputs/api', '.yml').length + list('inputs/api', '.json').length;
fsd ? ok('inputs/fsd-spec.md found') : warn('inputs/fsd-spec.md not found.', 'New projects need it (or tell the orchestrator "no FSD doc — use defaults").');
ux ? ok(`${ux} wireframe file(s) in inputs/ux/`) : warn('No .html wireframes in inputs/ux/.', 'Put one .html file per screen there (subfolders are fine).');
api ? ok(`${api} API file(s) in inputs/api/`) : warn('No API file in inputs/api/.', 'Optional — without it every endpoint is mocked.');

// 6. node
const major = Number(process.versions.node.split('.')[0]), minor = Number(process.versions.node.split('.')[1]);
(major > 22 || (major === 22 && minor >= 22)) ? ok(`Node ${process.versions.node}`) : warn(`Node ${process.versions.node} is older than 22.22.`, 'Projects the team builds need Node 22.22+ (or 24.15+). Install it before the first run.');

console.log(problems ? `\n${problems} problem(s) to fix before starting.` : warnings ? `\nReady to start (${warnings} optional suggestion(s) above).` : '\nEverything is in place. Start the orchestrator.');
process.exit(problems ? 1 : 0);
