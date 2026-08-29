import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const homepage = path.join(root, 'dist', 'index.html');

let html = await fs.readFile(homepage, 'utf8');

const stylesheet = '<link rel="stylesheet" href="/assets/home-writing-stack-20260829.css?v=20260829-1335">';
if (!html.includes('home-writing-stack-20260829.css')) {
  html = html.replace('</head>', `  ${stylesheet}\n</head>`);
}

const writingSection = `<section class="writing-section">
  <div class="container split-grid writing-split-stack">
    <article class="article-preview card reveal">
      <span class="kicker">Articles</span>
      <h2>What I’m learning, written down.</h2>
      <p class="intro compact-intro">Notes from things I’ve built, worked through and learned while developing my DevOps skills.</p>
      <div class="article-list micro-list">
        <a href="articles.html"><span>01</span><div><strong>Why Terraform creates <code>.terraform.lock.hcl</code></strong><small>Infrastructure as Code</small></div><b>↗</b></a>
        <a href="articles.html"><span>02</span><div><strong>What happens when you run <code>terraform apply</code>?</strong><small>Terraform</small></div><b>↗</b></a>
        <a href="articles.html"><span>03</span><div><strong>What I learned building my first Kubernetes cluster</strong><small>Kubernetes</small></div><b>↗</b></a>
        <a href="articles.html"><span>04</span><div><strong>From IT support to DevOps: what transferred</strong><small>Career engineering</small></div><b>↗</b></a>
      </div>
      <a class="card-link" href="articles.html">View all articles <span>↗</span></a>
    </article>

    <div class="writing-side-stack">
      <article class="evidence-principle card reveal">
        <span class="kicker">Projects</span>
        <h2>Inside each project.</h2>
        <p class="intro compact-intro">Each project provides an overview, architectural design, how it was implemented and how challenges were resolved.</p>
        <div class="principle-grid">
          <div class="principle-item micro-reveal"><strong>01</strong><span>Overview</span></div>
          <div class="principle-item micro-reveal"><strong>02</strong><span>Architecture</span></div>
          <div class="principle-item micro-reveal"><strong>03</strong><span>Implementation</span></div>
          <div class="principle-item micro-reveal"><strong>04</strong><span>Challenges &amp; solutions</span></div>
        </div>
        <a class="card-link" href="projects.html">View projects <span>↗</span></a>
      </article>

      <article class="github-repository-card card reveal">
        <span class="kicker">GitHub</span>
        <h2>Project repositories.</h2>
        <p class="intro compact-intro">The repositories contain the infrastructure, application code and documentation behind the projects shown here.</p>
        <div class="repository-tags tags" aria-label="Repository technologies">
          <span class="tag" tabindex="0">Terraform</span>
          <span class="tag" tabindex="0">Docker</span>
          <span class="tag" tabindex="0">AWS</span>
          <span class="tag" tabindex="0">Kubernetes</span>
        </div>
        <a class="card-link github-link" href="https://github.com/nabilislam30" target="_blank" rel="noopener noreferrer">View GitHub <span>↗</span></a>
      </article>
    </div>
  </div>
</section>`;

html = html.replace(/<section class="writing-section">[\s\S]*?<\/section>/, writingSection);

const required = [
  'writing-split-stack',
  'writing-side-stack',
  'Project repositories.',
  'repository-tags tags',
  'View GitHub',
  'home-writing-stack-20260829.css?v=20260829-1335'
];
for (const phrase of required) {
  if (!html.includes(phrase)) {
    throw new Error(`Homepage writing stack failed: required content missing: ${phrase}`);
  }
}

await fs.writeFile(homepage, html);
console.log('Applied stacked Projects + GitHub homepage writing section with glowing repository pills.');
