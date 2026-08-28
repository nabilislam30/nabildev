import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const file = path.join(root, 'dist', 'index.html');

let html = await fs.readFile(file, 'utf8');

const replacement = `
<section class="home-experience-preview-section">
  <div class="container">
    <div class="home-experience-preview-grid">
      <article class="card home-experience-preview-card reveal">
        <span class="kicker">Experience preview</span>
        <h2>My professional journey</h2>
        <p>How I progressed from second-line support to becoming a DevOps engineer.</p>
        <a class="btn btn-primary magnetic" href="experience.html">View experience <span>↗</span></a>
      </article>

      <aside class="card home-experience-preview-facts reveal" aria-label="Experience summary">
        <div class="home-experience-preview-fact">
          <small>Current</small>
          <strong>DevOps Engineer</strong>
        </div>
        <div class="home-experience-preview-fact">
          <small>Focus</small>
          <strong>Infrastructure &amp; automation</strong>
        </div>
        <div class="home-experience-preview-fact">
          <small>Learning</small>
          <strong>Projects &amp; live labs</strong>
        </div>
      </aside>
    </div>
  </div>
</section>`;

const journeyPattern = /<section class="journey-section journey-scroll-section">[\s\S]*?<\/section>/;
if (!journeyPattern.test(html)) {
  throw new Error('Homepage journey section was not found; refusing to write an incomplete preview replacement.');
}

html = html.replace(journeyPattern, replacement);

const previewCss = '<link rel="stylesheet" href="/assets/home-experience-preview-20260828.css?v=20260828-1520">';
const atmosphereCss = '<link rel="stylesheet" href="/assets/home-atmosphere-20260828.css?v=20260828-1545">';

if (!html.includes('home-experience-preview-20260828.css')) {
  html = html.replace('</head>', `${previewCss}\n</head>`);
}
if (!html.includes('home-atmosphere-20260828.css')) {
  html = html.replace('</head>', `${atmosphereCss}\n</head>`);
}

await fs.writeFile(file, html);
console.log('Replaced homepage journey timeline and applied homepage atmosphere/spacing refinements.');
