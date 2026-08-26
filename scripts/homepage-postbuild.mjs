import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const homepage = path.join(root, 'dist', 'index.html');

let html = await fs.readFile(homepage, 'utf8');

// Make the generated homepage self-contained and cache-busted. The two newer
// featured cards must not depend on runtime JavaScript to acquire the canonical
// WordPress card structure or their final recruiter-facing titles.
html = html
  .replace('assets/styles.css?v=20260818-1309', 'assets/styles.css?v=20260826-02')
  .replaceAll('features.css?v=20260820-01', 'features.css?v=20260826-02')
  .replaceAll('features.js?v=20260820-01', 'features.js?v=20260826-02');

if (!html.includes('home-projects-20260826.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/home-projects-20260826.css">\n</head>');
}

html = html
  .replace(
    '<article class="evidence-card card reveal">\n        <div class="evidence-index">01</div>',
    '<article class="evidence-card evidence-card-stable card reveal">\n        <div class="evidence-index">01</div>'
  )
  .replace(
    '<span class="kicker">AWS container platform</span>\n          <h3>Deploying a containerised application on AWS using Terraform</h3>',
    '<span class="kicker">ECS Threat Composer</span>\n          <h3 class="featured-project-title">Deploying Threat Composer on ECS Fargate</h3>'
  )
  .replace(
    '<article class="evidence-card card reveal">\n        <div class="evidence-index">02</div>',
    '<article class="evidence-card evidence-card-stable card reveal">\n        <div class="evidence-index">02</div>'
  )
  .replace(
    '<span class="kicker">Platform engineering</span>\n          <h3>Building immutable AWS infrastructure with Terraform</h3>',
    '<span class="kicker">Immutable AWS Infrastructure</span>\n          <h3 class="featured-project-title">Immutable AWS infrastructure with Terraform</h3>'
  );

let architectureCount = 0;
html = html.replace(
  /<div class="architecture-lab architecture-stable animated-architecture" data-architecture-flow>/g,
  (match) => {
    architectureCount += 1;
    return architectureCount <= 2
      ? '<div class="architecture-lab architecture-stable architecture-featured animated-architecture" data-architecture-flow>'
      : match;
  }
);

await fs.writeFile(homepage, html);
console.log('Applied final homepage featured-project layout and cache-busting.');
