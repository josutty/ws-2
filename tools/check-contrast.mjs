// Usage: node tools/check-contrast.mjs [tokens.css] [pairs.json]
// Text pairs >= 4.5:1, non-text (control borders, focus rings) >= 3:1. Exit 1 on any failure.
import { readFileSync } from 'node:fs';

const [tokensPath = 'src/shared/ui/theme/tokens.css', pairsPath = 'src/shared/ui/theme/contrast-pairs.json'] = process.argv.slice(2);
const css = readFileSync(tokensPath, 'utf8');
const pairs = JSON.parse(readFileSync(pairsPath, 'utf8'));

const block = (selector) => {
  const m = css.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`));
  if (!m) return {};
  return Object.fromEntries([...m[1].matchAll(/--color-([\w-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)]
    .map(([, name, r, g, b]) => [name, [Number(r), Number(g), Number(b)]]));
};
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const light = block(':root');
const themes = { light, dark: { ...light, ...block('.dark') } };
let failures = 0;
for (const [theme, colors] of Object.entries(themes)) {
  for (const [kind, min] of [['text', 4.5], ['nonText', 3]]) {
    for (const [fg, bg] of pairs[kind] ?? []) {
      if (!colors[fg] || !colors[bg]) { console.log(`MISSING ${theme}: --color-${fg} or --color-${bg}`); failures++; continue; }
      const r = ratio(colors[fg], colors[bg]);
      const ok = r >= min;
      if (!ok) failures++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${theme.padEnd(5)} ${kind.padEnd(7)} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
    }
  }
}
process.exit(failures ? 1 : 0);
