import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const labPath = path.join(root, 'dist', 'lab.html');
let lab = await fs.readFile(labPath, 'utf8');

lab = lab
  .replaceAll('assets/lab-page-20260827-v2.css', 'assets/lab-page-20260827-v3.css')
  .replaceAll('/assets/lab-page-20260827-v2.css', '/assets/lab-page-20260827-v3.css');

const gridOpen = '<div class="lab-curriculum-grid">';
const gridStart = lab.indexOf(gridOpen);
if (gridStart === -1) throw new Error('Lab grouping failed: curriculum grid not found.');

const contentStart = gridStart + gridOpen.length;
const tail = lab.slice(contentStart);
const articleRe = /<article class="card lab-topic-card reveal">[\s\S]*?<\/article>/g;
const cards = new Map();
let lastEnd = -1;
let match;

while ((match = articleRe.exec(tail))) {
  const number = match[0].match(/<span class="lab-topic-no">(\d{2})<\/span>/)?.[1];
  if (number) cards.set(number, match[0]);
  lastEnd = contentStart + match.index + match[0].length;
  if (cards.size === 12) break;
}

if (cards.size !== 12 || lastEnd === -1) {
  throw new Error(`Lab grouping failed: expected 12 cards, found ${cards.size}.`);
}

const gridClose = lab.indexOf('</div>', lastEnd);
if (gridClose === -1) throw new Error('Lab grouping failed: curriculum grid closing tag not found.');

const groups = [
  ['workloads', 'Workloads &amp; Configuration', ['01','03','04']],
  ['networking', 'Networking &amp; Access', ['02','05','06','11']],
  ['security', 'Security &amp; Policy', ['07','08']],
  ['operations', 'Operations', ['09','10','12']]
];

const groupedMarkup = `<div class="lab-groups">\n${groups.map(([slug, title, ids]) => `  <section class="lab-topic-group" data-group="${slug}" aria-labelledby="lab-group-${slug}">\n    <div class="lab-group-heading reveal"><h3 id="lab-group-${slug}">${title}</h3></div>\n    <div class="lab-curriculum-grid">\n${ids.map(id => `      ${cards.get(id)}`).join('\n')}\n    </div>\n  </section>`).join('\n\n')}\n</div>`;

lab = lab.slice(0, gridStart) + groupedMarkup + lab.slice(gridClose + 6);

const required = [
  'lab-page-20260827-v3.css',
  'Workloads &amp; Configuration',
  'Networking &amp; Access',
  'Security &amp; Policy',
  '>Operations</h3>',
  'data-group="networking"'
];
for (const phrase of required) {
  if (!lab.includes(phrase)) throw new Error(`Lab grouping failed: missing ${phrase}`);
}

await fs.writeFile(labPath, lab);
console.log('Grouped Kubernetes Lab topics and enabled interactive tag styling.');
