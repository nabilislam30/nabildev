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
  .replace('assets/styles.css?v=20260818-1309', 'assets/styles.css?v=20260826-03')
  .replaceAll('features.css?v=20260820-01', 'features.css?v=20260826-03')
  .replaceAll('features.js?v=20260820-01', 'features.js?v=20260826-03');

// Replace homepage-only refinement stylesheets with the current versions.
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-projects-20260826(?:-v2)?\.css">\n?/g, '\n');
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-content-20260827(?:-v2)?\.css">\n?/g, '\n');
html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/home-projects-20260826-v2.css">\n  <link rel="stylesheet" href="/assets/home-content-20260827-v2.css">\n</head>');

html = html
  .replace(
    '<article class="evidence-card card reveal">\n        <div class="evidence-index">01</div>',
    '<article class="evidence-card evidence-card-stable card reveal">\n        <div class="evidence-index">01</div>'
  )
  .replace(
    '<span class="kicker">AWS container platform</span>\n          <h3>Deploying a containerised application on AWS using Terraform</h3>',
    '<span class="kicker">ECS Threat Composer</span>\n          <h3 class="featured-project-title">Deploying Threat Composer on AWS ECS Fargate</h3>'
  )
  .replace(
    '<span><b>ECS Fargate</b><small>Runtime</small></span>',
    '<span><b>ECS Fargate</b><small>Serverless</small></span>'
  )
  .replace(
    '<article class="evidence-card card reveal">\n        <div class="evidence-index">02</div>',
    '<article class="evidence-card evidence-card-stable card reveal">\n        <div class="evidence-index">02</div>'
  )
  .replace(
    '<span class="kicker">Platform engineering</span>\n          <h3>Building immutable AWS infrastructure with Terraform</h3>',
    '<span class="kicker">Immutable AWS Infrastructure</span>\n          <h3 class="featured-project-title">Immutable AWS infrastructure with Terraform</h3>'
  )
  .replace(
    'End-to-end platform engineering project demonstrating how secure, versioned and immutable AWS infrastructure can be designed, deployed and operated with Terraform and GitHub Actions.',
    'Production-inspired AWS platform built with Terraform, immutable infrastructure and GitHub Actions.'
  )
  .replace(
    '<span><b>Terraform</b><small>IaC</small></span><i>→</i>\n            <span><b>AWS</b><small>Cloud</small></span><i>→</i>\n            <span><b>Linux</b><small>Bootstrap</small></span><i>→</i>\n            <span><b>Bash</b><small>Automation</small></span>',
    '<span><b>Terraform</b><small>IaC</small></span><i>→</i>\n            <span><b>AWS</b><small>Cloud</small></span><i>→</i>\n            <span><b>VPC</b><small>Network</small></span><i>→</i>\n            <span><b>Security Groups</b><small>Firewall</small></span><i>→</i>\n            <span><b>EC2</b><small>Compute</small></span>'
  );

let architectureCount = 0;
html = html.replace(
  /<div class="architecture-lab architecture-stable(?: architecture-featured(?: architecture-(?:ecs|immutable))?)? animated-architecture" data-architecture-flow>/g,
  (match) => {
    architectureCount += 1;
    if (architectureCount === 1) {
      return '<div class="architecture-lab architecture-stable architecture-featured architecture-ecs animated-architecture" data-architecture-flow>';
    }
    if (architectureCount === 2) {
      return '<div class="architecture-lab architecture-stable architecture-featured architecture-immutable animated-architecture" data-architecture-flow>';
    }
    return match;
  }
);

// Homepage Kubernetes Lab: show four representative areas and link to the full
// curriculum from the section header rather than leaving a loose text link below
// the cards.
html = html.replace(
  /<section id="lab" class="lab-section">[\s\S]*?<\/section>/,
  `<section id="lab" class="lab-section">
  <div class="container">
    <div class="section-head lab-section-head-row reveal">
      <div>
        <span class="kicker">DevOps Lab</span>
        <h2>Kubernetes hands-on Lab</h2>
        <p class="intro">Practical K8s labs covering workloads, networking, storage, security, observability and cluster operations.</p>
      </div>
      <a class="btn btn-secondary lab-section-header-cta magnetic" href="lab.html">Explore Kubernetes Lab <span>↗</span></a>
    </div>
    <div class="lab-grid">
      <article class="lab-card card reveal">
        <span class="kicker">Workloads</span>
        <h3>Pods, Deployments & Controllers</h3>
        <p>Pods, Deployments, ReplicaSets, controllers, rolling updates and workload management.</p>
        <div class="tags"><span class="tag">Pods</span><span class="tag">Deployments</span><span class="tag">ReplicaSets</span></div>
      </article>
      <article class="lab-card card reveal">
        <span class="kicker">Networking</span>
        <h3>Services, Ingress & Networking</h3>
        <p>Service discovery, load balancing, DNS, Ingress, network policies and external access.</p>
        <div class="tags"><span class="tag">Services</span><span class="tag">Ingress</span><span class="tag">DNS</span></div>
      </article>
      <article class="lab-card card reveal">
        <span class="kicker">Security</span>
        <h3>Security & Policy Management</h3>
        <p>RBAC, ServiceAccounts, pod security, NetworkPolicies and policy enforcement with Kyverno.</p>
        <div class="tags"><span class="tag">RBAC</span><span class="tag">Kyverno</span><span class="tag">NetworkPolicies</span></div>
      </article>
      <article class="lab-card card reveal">
        <span class="kicker">Operations</span>
        <h3>Observability & Cluster Operations</h3>
        <p>Logs, metrics, events, debugging, scheduling, node maintenance and workload monitoring.</p>
        <div class="tags"><span class="tag">Observability</span><span class="tag">Nodes</span><span class="tag">Troubleshooting</span></div>
      </article>
    </div>
  </div>
</section>`
);

// Make the project explanation explicit and recruiter-readable. Match any article
// carrying the evidence-principle class so older generated variants cannot win.
html = html.replace(
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

// The portfolio already demonstrates this through projects, labs and articles;
// remove the redundant marketing-style CTA.
html = html.replace(/<section class="home-cta">[\s\S]*?<\/section>\s*/g, '');

await fs.writeFile(homepage, html);
console.log('Applied authoritative homepage project, Kubernetes Lab and project-process refinements.');
