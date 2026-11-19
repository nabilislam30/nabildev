import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const homepage = path.join(root, 'dist', 'index.html');

let html = await fs.readFile(homepage, 'utf8');

const stylesheet = '<link rel="stylesheet" href="/assets/home-writing-stack-20260829.css?v=20261119-2">';
if (!html.includes('home-writing-stack-20260829.css')) {
  html = html.replace('</head>', `  ${stylesheet}\n</head>`);
}

const writingSection = `<section class="writing-section engineering-activity-section">
  <div class="container">
    <div class="engineering-activity-heading reveal">
      <h2>Engineering Activity</h2>
      <p>A live view of what I’m currently building, the work I’ve recently completed and the systems I’m actively developing.</p>
    </div>

    <div class="engineering-activity-grid">
      <article class="engineering-current-card card reveal">
        <div class="engineering-focus-head">
          <span>Current focus</span>
          <b><i></i> Active</b>
        </div>

        <h3>Kubernetes automation</h3>
        <p class="engineering-focus-copy">Working through deployment, networking, security and operational patterns while continuing to strengthen automation around Kubernetes infrastructure.</p>

        <div class="engineering-toolchain tags" aria-label="Current engineering toolchain">
          <span class="tag">Kubernetes</span>
          <span class="tag">AWS</span>
          <span class="tag">Terraform</span>
          <span class="tag">ArgoCD</span>
        </div>

        <div class="engineering-activity-list" data-engineering-activity-list>
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
      </article>

      <article class="engineering-status-card card reveal" data-engineering-status>
        <span class="kicker">Engineering status</span>
        <h3>Control centre</h3>

        <div class="engineering-terminal">
          <div class="engineering-terminal-head">
            <i></i><i></i><i></i>
            <span>engineering / status</span>
          </div>
          <div class="engineering-terminal-body" aria-live="polite">
            <div class="engineering-terminal-command" data-status-line>&gt; engineering status</div>
            <div class="engineering-status-lines">
              <div data-status-line><span>projects</span><b>2 featured</b></div>
              <div data-status-line><span>lab</span><b>active</b></div>
              <div data-status-line><span>infrastructure</span><b>healthy</b></div>
              <div data-status-line><span>learning</span><b>continuous</b></div>
            </div>
            <div class="engineering-terminal-ok" data-status-line data-status-ok>✓ systems operational</div>
          </div>
        </div>
      </article>
    </div>

    <div class="engineering-activity-footer">
      <span class="engineering-journey-end"><i></i> Journey ends here</span>
      <a class="engineering-activity-link" href="https://github.com/nabilislam30" target="_blank" rel="noopener noreferrer">View GitHub <span>↗</span></a>
    </div>
  </div>
</section>`

html = html.replace(/<section class="writing-section">[\s\S]*?<\/section>/, writingSection);

const required = [
  'engineering-activity-section',
  'Engineering Activity',
  'engineering-current-card',
  'engineering-status-card',
  'Control centre',
  'data-status-line',
  'engineering-activity-link',
  'View GitHub',
  'home-writing-stack-20260829.css?v=20261119-2'
];
for (const phrase of required) {
  if (!html.includes(phrase)) {
    throw new Error(`Homepage writing stack failed: required content missing: ${phrase}`);
  }
}

await fs.writeFile(homepage, html);
console.log('Applied full-width Engineering Activity homepage section with animated control centre.');
