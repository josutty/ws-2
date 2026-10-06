// Usage: node tools/list-html-elements.mjs <file.html>
// One line per user-visible building block: index | tag | role | #id | data-component | data-state | text
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const [file] = process.argv.slice(2);
if (!file) { console.error('usage: node tools/list-html-elements.mjs <file.html>'); process.exit(2); }
const doc = new JSDOM(readFileSync(file, 'utf8')).window.document;
const sel = 'h1,h2,h3,h4,button,a[href],input,select,textarea,img,table,form,nav,dialog,[role],[data-component],[data-state],[id]';
doc.querySelectorAll(sel).forEach((el, i) => {
  const text = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('placeholder') || el.textContent || '')
    .trim().replace(/\s+/g, ' ').slice(0, 60);
  console.log([i, el.tagName.toLowerCase(), el.getAttribute('role') ?? '', el.id ? `#${el.id}` : '',
    el.getAttribute('data-component') ?? '', el.getAttribute('data-state') ?? '', text].join(' | '));
});
