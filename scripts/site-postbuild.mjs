import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const homepage = path.join(dist, 'index.html');
let home = await fs.readFile(homepage, 'utf8');

// Always load the newest homepage refinement stylesheet and a fresh copy of the
// main runtime script. The custom domain must not be able to reuse an older
// script that rewrites the generated homepage after load.
home = home
  .replaceAll('/assets/home-content-20260827.css', '/assets/home-content-20260827-v6.css')
  .replaceAll('assets/home-content-20260827.css', 'assets/home-content-20260827-v6.css')
  .replaceAll('/assets/home-content-20260827-v2.css', '/assets/home-content-20260827-v6.css')
  .replaceAll('assets/home-content-20260827-v2.css', 'assets/home-content-20260827-v6.css')
  .replaceAll('/assets/home-content-20260827-v3.css', '/assets/home-content-20260827-v6.css')
  .replaceAll('assets/home-content-20260827-v3.css', 'assets/home-content-20260827-v6.css')
  .replaceAll('/assets/home-content-20260827-v4.css', '/assets/home-content-20260827-v6.css')
  .replaceAll('assets/home-content-20260827-v4.css', 'assets/home-content-20260827-v6.css')
  .replaceAll('/assets/home-content-20260827-v5.css', '/assets/home-content-20260827-v6.css')
  .replaceAll('assets/home-content-20260827-v5.css', 'assets/home-content-20260827-v6.css')
  .replace(/\/?assets\/home-content-20260827-v6\.css(?:\?v=[^"']+)?/g, '/assets/home-content-20260827-v6.css?v=20260829-1330')
  .replace(/assets\/script\.js(?:\?v=[^"']+)?/g, 'assets/script.js?v=20260827-04')
  .replace(/<span class="kicker">Engineering articles<\/span>/gi, '<span class="kicker">Articles</span>');

// Keep this homepage card direct and recruiter-readable regardless of which
// earlier build layer produced the section markup.
home = home
  .replaceAll('<span class="kicker">Engineering approach</span>', '<span class="kicker">Projects</span>')
  .replaceAll('<span class="kicker">Project process</span>', '<span class="kicker">Projects</span>')
  .replaceAll('<h2>From idea to implementation.</h2>', '<h2>Inside each project.</h2>')
  .replaceAll('<h2>How each project is structured.</h2>', '<h2>Inside each project.</h2>')
  .replaceAll(
    'Each project explains what I was trying to achieve, how I built it, what I had to troubleshoot and what I learned. The implementation is available on GitHub.',
    'Each project provides an overview, architectural design, how it was implemented and how challenges were resolved.'
  )
  .replaceAll(
    'Each project provides an Overview, architectural design, how it was implemented and how challenges were resolved.',
    'Each project provides an overview, architectural design, how it was implemented and how challenges were resolved.'
  )
  .replaceAll('<span>Challenge</span>', '<span>Overview</span>')
  .replaceAll('<span>Objectives</span>', '<span>Overview</span>')
  .replaceAll('<span>System design</span>', '<span>Architecture</span>')
  .replaceAll('<span>Execution</span>', '<span>Implementation</span>')
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

// Do not publish another build with any superseded copy still present.
const forbiddenHomepageCopy = [
  'Engineering approach',
  'Project process',
  'From idea to implementation.',
  'How each project is structured.',
  'Each project explains what I was trying to achieve, how I built it, what I had to troubleshoot and what I learned. The implementation is available on GitHub.'
];
for (const phrase of forbiddenHomepageCopy) {
  if (home.includes(phrase)) {
    throw new Error(`Homepage refinement failed: old copy still present: ${phrase}`);
  }
}

const requiredHomepageCopy = [
  '<span class="kicker">Projects</span>',
  'Inside each project.',
  'Each project provides an overview, architectural design, how it was implemented and how challenges were resolved.',
  '<span>Overview</span>',
  '<span>Architecture</span>',
  '<span>Implementation</span>',
  '<span>Challenges &amp; solutions</span>',
  'assets/script.js?v=20260827-04',
  'home-content-20260827-v6.css?v=20260829-1330'
];
for (const phrase of requiredHomepageCopy) {
  if (!home.includes(phrase)) {
    throw new Error(`Homepage refinement failed: required copy missing: ${phrase}`);
  }
}

await fs.writeFile(homepage, home);

// Remove obsolete homepage JavaScript that used to rewrite generated content in
// the browser after load. The build output is now the single source of truth.
const runtimeScriptPath = path.join(dist, 'assets', 'script.js');
let runtimeScript = await fs.readFile(runtimeScriptPath, 'utf8');
runtimeScript = runtimeScript.replace(
  /\/\/ Homepage — integrate the applied engineering stack directly into evidence cards\.[\s\S]*?\/\/ Back\/forward cache \+ mobile touch QA\./,
  '// Back/forward cache + mobile touch QA.'
);

const forbiddenRuntimeCopy = [
  "kicker.textContent = 'Engineering approach'",
  "heading.textContent = 'From idea to implementation.'",
  "link.textContent = 'View GitHub '"
];
for (const phrase of forbiddenRuntimeCopy) {
  if (runtimeScript.includes(phrase)) {
    throw new Error(`Runtime cleanup failed: legacy homepage override still present: ${phrase}`);
  }
}
await fs.writeFile(runtimeScriptPath, runtimeScript);

const labPage = path.join(dist, 'lab.html');
let lab = await fs.readFile(labPage, 'utf8');
lab = lab
  .replaceAll('assets/lab-page-20260827.css', 'assets/lab-page-20260827-v2.css')
  .replaceAll('/assets/lab-page-20260827.css', '/assets/lab-page-20260827-v2.css')
  .replaceAll('<title>Kubernetes Hands-on Lab — Nabil Islam</title>', '<title>Hands-on Lab — Nabil Islam</title>')
  .replaceAll('content="Kubernetes Hands-on Lab — Nabil Islam"', 'content="Hands-on Lab — Nabil Islam"')
  .replaceAll('<h1>Kubernetes hands-on Lab</h1>', '<h1>Hands-on lab</h1>')
  .replaceAll('<span class="kicker">Kubernetes curriculum</span>', '<span class="kicker">Kubernetes</span>')
  .replaceAll('<h2>What I’m working through.</h2>', '<h2>What the lab covers.</h2>')
  .replaceAll(
    'The lab combines Kubernetes concepts with practical exercises across application workloads, cluster networking, security, troubleshooting and day-to-day operations.',
    'The modules progress from core workloads to cluster operations, with configuration and troubleshooting built into each area.'
  )
  .replace(/\s*<div class="lab-note reveal">[\s\S]*?<\/div>\s*/g, '\n');

const forbiddenLabCopy = [
  'Kubernetes hands-on Lab',
  'Kubernetes curriculum',
  'What I’m working through.',
  'Lab format',
  'Concepts followed by hands-on exercises.'
];
for (const phrase of forbiddenLabCopy) {
  if (lab.includes(phrase)) {
    throw new Error(`Lab refinement failed: old copy still present: ${phrase}`);
  }
}

const requiredLabCopy = [
  '<h1>Hands-on lab</h1>',
  '<span class="kicker">Kubernetes</span>',
  '<h2>What the lab covers.</h2>',
  'The modules progress from core workloads to cluster operations, with configuration and troubleshooting built into each area.'
];
for (const phrase of requiredLabCopy) {
  if (!lab.includes(phrase)) {
    throw new Error(`Lab refinement failed: required copy missing: ${phrase}`);
  }
}

await fs.writeFile(labPage, lab);

console.log('Applied final homepage wording, seamless centred tools rail, cache-busted runtime, and simplified Lab content.');
