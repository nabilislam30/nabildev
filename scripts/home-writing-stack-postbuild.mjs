import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const homepage = path.join(root, 'dist', 'index.html');

let html = await fs.readFile(homepage, 'utf8');

const stylesheet = '<link rel="stylesheet" href="/assets/home-writing-stack-20260829.css?v=20261119-1">';
if (!html.includes('home-writing-stack-20260829.css')) {
  html = html.replace('</head>', `  ${stylesheet}\n</head>`);
}

const writingSection = `<section class="writing-section">
  <div class="container split-grid writing-split-stack">
    <article class="engineering-activity-card article-preview card reveal">
      <span class="kicker">Engineering activity</span>
      <h2>What I’m building right now.</h2>
      <p class="intro compact-intro">A live snapshot of the infrastructure, automation and operational work I’m currently developing.</p>

      <div class="engineering-focus">
        <div class="engineering-focus-head">
          <span>Current focus</span>
          <b><i></i> Active</b>
        </div>
        <strong>Kubernetes automation</strong>
        <p>Working through deployment, networking, security and observability while strengthening automation around Kubernetes infrastructure.</p>
        <div class="engineering-toolchain tags" aria-label="Current engineering toolchain">
          <span class="tag">Kubernetes</span>
          <span class="tag">AWS</span>
          <span class="tag">Terraform</span>
          <span class="tag">ArgoCD</span>
        </div>
      </div>

      <div class="engineering-activity-list">
        <div class="engineering-activity-row">
          <small>Now</small>
          <div><strong>Kubernetes Lab</strong><span>Networking and policy testing</span></div>
          <b>Active</b>
        </div>
        <div class="engineering-activity-row">
          <small>Recent</small>
          <div><strong>EKS GitOps platform</strong><span>Terraform, ArgoCD and monitoring</span></div>
          <b>Built</b>
        </div>
        <div class="engineering-activity-row">
          <small>Recent</small>
          <div><strong>ECS Threat Composer</strong><span>Container deployment on Fargate</span></div>
          <b>Built</b>
        </div>
      </div>

      <a class="card-link engineering-activity-link" href="lab.html">Open DevOps Lab <span>↗</span></a>
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
  'Engineering activity',
  'What I’m building right now.',
  'engineering-activity-link',
  'Project repositories.',
  'repository-tags tags',
  'View GitHub',
  'home-writing-stack-20260829.css?v=20261119-1'
];
for (const phrase of required) {
  if (!html.includes(phrase)) {
    throw new Error(`Homepage writing stack failed: required content missing: ${phrase}`);
  }
}

await fs.writeFile(homepage, html);
console.log('Applied Engineering Activity + stacked Projects/GitHub homepage section.');
