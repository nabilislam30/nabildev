import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const homepage = path.join(dist, 'index.html');
let home = await fs.readFile(homepage, 'utf8');

// Always load the newest homepage refinement stylesheet.
home = home
  .replaceAll('/assets/home-content-20260827.css', '/assets/home-content-20260827-v3.css')
  .replaceAll('assets/home-content-20260827.css', 'assets/home-content-20260827-v3.css')
  .replaceAll('/assets/home-content-20260827-v2.css', '/assets/home-content-20260827-v3.css')
  .replaceAll('assets/home-content-20260827-v2.css', 'assets/home-content-20260827-v3.css')
  .replace(/<span class="kicker">Engineering articles<\/span>/gi, '<span class="kicker">Articles</span>');

// Replace the old project-process wording field-by-field. These exact fallbacks
// deliberately do not depend on the entire article markup matching one regex.
home = home
  .replaceAll('<span class="kicker">Engineering approach</span>', '<span class="kicker">Project process</span>')
  .replaceAll('<h2>From idea to implementation.</h2>', '<h2>How each project is structured.</h2>')
  .replaceAll(
    'Each project explains what I was trying to achieve, how I built it, what I had to troubleshoot and what I learned. The implementation is available on GitHub.',
    'Each project provides an Overview, architectural design, how it was implemented and how challenges were resolved.'
  )
  .replaceAll('<span>Challenge</span>', '<span>Objectives</span>')
  .replaceAll('<span>Architecture</span>', '<span>System design</span>')
  .replaceAll('<span>Implementation</span>', '<span>Execution</span>')
  .replaceAll('<span>Troubleshooting</span>', '<span>Challenges &amp; solutions</span>')
  .replace(/<div class="principle-item micro-reveal"><strong>05<\/strong><span>Outcome<\/span><\/div>/g, '')
  .replace(/<div class="principle-item micro-reveal"><strong>06<\/strong><span>Production considerations<\/span><\/div>/g, '')
  .replace(
    '<a class="card-link" href="https://github.com/nabilislam30" target="_blank" rel="noopener noreferrer">View GitHub <span>↗</span></a>',
    '<a class="card-link" href="projects.html">View projects <span>↗</span></a>'
  );

// Remove the redundant homepage marketing CTA and the stray closing div after
// the tools marquee that can introduce layout/spacing inconsistencies.
home = home
  .replace(/<section class="home-cta">[\s\S]*?<\/section>\s*/g, '')
  .replace('</div>\n</div>\n\n<section class="evidence-section">', '</div>\n\n<section class="evidence-section">');

// Do not publish another build with the old project-process copy still present.
const forbiddenHomepageCopy = [
  'Engineering approach',
  'From idea to implementation.',
  'Each project explains what I was trying to achieve, how I built it, what I had to troubleshoot and what I learned. The implementation is available on GitHub.'
];
for (const phrase of forbiddenHomepageCopy) {
  if (home.includes(phrase)) {
    throw new Error(`Homepage refinement failed: old copy still present: ${phrase}`);
  }
}

const requiredHomepageCopy = [
  'Project process',
  'How each project is structured.',
  'Each project provides an Overview, architectural design, how it was implemented and how challenges were resolved.'
];
for (const phrase of requiredHomepageCopy) {
  if (!home.includes(phrase)) {
    throw new Error(`Homepage refinement failed: required copy missing: ${phrase}`);
  }
}

await fs.writeFile(homepage, home);

const labPage = path.join(dist, 'lab.html');
let lab = await fs.readFile(labPage, 'utf8');
lab = lab
  .replaceAll('assets/lab-page-20260827.css', 'assets/lab-page-20260827-v2.css')
  .replaceAll('/assets/lab-page-20260827.css', '/assets/lab-page-20260827-v2.css');
await fs.writeFile(labPage, lab);

console.log('Applied deterministic homepage wording, faded tools rail and Lab spacing refinements.');
