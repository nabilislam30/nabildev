import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const homepage = path.join(dist, 'index.html');
let home = await fs.readFile(homepage, 'utf8');

// Force the latest homepage stylesheet filename so the live custom domain does
// not reuse the previous hard-edged tools-rail CSS.
home = home
  .replaceAll('/assets/home-content-20260827.css', '/assets/home-content-20260827-v2.css')
  .replaceAll('assets/home-content-20260827.css', 'assets/home-content-20260827-v2.css')
  .replace(/<span class="kicker">Engineering articles<\/span>/gi, '<span class="kicker">Articles</span>');

// Final authoritative replacement. Match the section by its semantic class,
// regardless of the exact class order or which earlier build variant produced it.
home = home.replace(
  /<article[^>]*class="[^"]*evidence-principle[^"]*"[^>]*>[\s\S]*?<\/article>/i,
  `<article class="evidence-principle card reveal">
    <span class="kicker">Project process</span>
    <h2>How each project is structured.</h2>
    <p class="intro compact-intro">Each project provides an Overview, architectural design, how it was implemented and how challenges were resolved.</p>
    <div class="principle-grid">
      <div class="principle-item micro-reveal"><strong>01</strong><span>Objectives</span></div>
      <div class="principle-item micro-reveal"><strong>02</strong><span>System design</span></div>
      <div class="principle-item micro-reveal"><strong>03</strong><span>Execution</span></div>
      <div class="principle-item micro-reveal"><strong>04</strong><span>Challenges &amp; solutions</span></div>
    </div>
    <a class="card-link" href="projects.html">View projects <span>↗</span></a>
  </article>`
);

// Safeguard the earlier removal of the redundant homepage marketing CTA.
home = home.replace(/<section class="home-cta">[\s\S]*?<\/section>\s*/g, '');
await fs.writeFile(homepage, home);

const labPage = path.join(dist, 'lab.html');
let lab = await fs.readFile(labPage, 'utf8');
lab = lab
  .replaceAll('assets/lab-page-20260827.css', 'assets/lab-page-20260827-v2.css')
  .replaceAll('/assets/lab-page-20260827.css', '/assets/lab-page-20260827-v2.css');
await fs.writeFile(labPage, lab);

console.log('Applied final homepage rail, Lab spacing and authoritative project/article wording refinements.');
