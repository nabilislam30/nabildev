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
  .replace(/assets\/styles\.css\?v=[^"]+/, 'assets/styles.css?v=20260910-1434')
  .replaceAll('features.css?v=20260820-01', 'features.css?v=20260826-03')
  .replaceAll('features.js?v=20260820-01', 'features.js?v=20260826-03');

// Replace homepage-only refinement stylesheets with the current versions.
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-projects-20260826(?:-v2)?\.css">\n?/g, '\n');
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-content-20260827(?:-v2)?\.css">\n?/g, '\n');
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/home-project-number-20260828\.css(?:\?v=[^"]+)?">\n?/g, '\n');
html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/home-projects-20260826-v2.css">\n  <link rel="stylesheet" href="/assets/home-content-20260827-v2.css">\n  <link rel="stylesheet" href="/assets/home-project-number-20260828.css?v=20260828-1628">\n</head>');

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

// Homepage Kubernetes Lab: four representative areas, a route to the full Lab
// page, and a direct evidence link to the public Kubernetes lab repository.
html = html.replace(
  /<section id="lab" class="lab-section">[\s\S]*?<\/section>/,
  `<section id="lab" class="lab-section">
  <div class="container">
    <div class="section-head lab-section-head-row reveal">
      <div>
        <span class="kicker">DevOps Lab</span>
        <h2>Hands-on lab</h2>
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
    <div class="lab-section-cta reveal">
      <a class="card-link" href="https://github.com/nabilislam30/K8s-labs" target="_blank" rel="noopener noreferrer">View lab repository <span>↗</span></a>
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

// Visual project-insight carousel. Keep this as part of the authoritative
// homepage build so Cloudflare serves the section without client-side content
// rewriting. Existing copies are removed first to keep the build idempotent.
html = html.replace(/\s*<link rel="stylesheet" href="\/assets\/project-insights-20260910\.css(?:\?v=[^"]+)?">\n?/g, '\n');
html = html.replace(/\s*<script src="\/assets\/project-insights-20260910\.js(?:\?v=[^"]+)?"><\/script>\n?/g, '\n');
html = html.replace(/\s*<section class="project-insights-section"[\s\S]*?<\/section>\s*/g, '\n');

html = html.replace(
  '</head>',
  '  <link rel="stylesheet" href="/assets/project-insights-20260910.css?v=20260910-1505">\n</head>'
);

const projectInsights = `<section class="project-insights-section" data-project-insights aria-labelledby="project-insights-title">
  <div class="container insights-shell">
    <div class="insights-head reveal">
      <div class="insights-heading-copy">
        <span class="kicker">Project insights</span>
        <h2 id="project-insights-title">Inside the engineering.</h2>
        <p>A closer look at the delivery flows and infrastructure patterns behind selected projects.</p>
      </div>
      <div class="insights-actions" aria-label="Project insight carousel controls">
        <button class="insight-arrow" type="button" data-insights-prev aria-label="Previous insight">←</button>
        <button class="insight-arrow" type="button" data-insights-next aria-label="Next insight">→</button>
        <a class="insights-all-link" href="projects.html">View projects <span>↗</span></a>
      </div>
    </div>

    <div class="insights-viewport">
      <div class="insights-track" data-insights-track tabindex="0" aria-label="Project insight cards">
        <article class="project-insight-card" data-insight-card>
          <div class="insight-visual"><img src="/assets/insights/eks-gitops.svg" alt="GitOps release flow from GitHub Actions through ECR and ArgoCD to Amazon EKS"></div>
          <div class="insight-body">
            <div class="insight-meta"><span class="kicker">Amazon EKS</span><span class="insight-number">01</span></div>
            <h3>GitOps delivery to EKS</h3>
            <p>GitHub Actions builds and scans the application image, ECR stores it, and ArgoCD reconciles the Kubernetes deployment from Git.</p>
            <div class="insight-footer"><div class="insight-tags"><span>ArgoCD</span><span>ECR</span><span>GitHub Actions</span></div><a class="insight-case-link" href="projects/2048-eks-platform.html">Open case study <span>↗</span></a></div>
          </div>
        </article>

        <article class="project-insight-card" data-insight-card>
          <div class="insight-visual"><img src="/assets/insights/ecs-request-path.svg" alt="HTTPS request path through Route 53 and an Application Load Balancer to ECS Fargate"></div>
          <div class="insight-body">
            <div class="insight-meta"><span class="kicker">ECS Fargate</span><span class="insight-number">02</span></div>
            <h3>HTTPS traffic to Fargate</h3>
            <p>Route 53 resolves the application domain, the ALB terminates HTTPS and forwards traffic only to healthy Fargate tasks running the container.</p>
            <div class="insight-footer"><div class="insight-tags"><span>Route 53</span><span>ALB</span><span>Fargate</span></div><a class="insight-case-link" href="projects/ecs-threat-composer.html">Open case study <span>↗</span></a></div>
          </div>
        </article>

        <article class="project-insight-card" data-insight-card>
          <div class="insight-visual"><img src="/assets/insights/immutable-terraform.svg" alt="Immutable infrastructure delivery using Terraform, a Golden AMI and an Auto Scaling Group"></div>
          <div class="insight-body">
            <div class="insight-meta"><span class="kicker">Terraform</span><span class="insight-number">03</span></div>
            <h3>Replace rather than patch</h3>
            <p>Infrastructure changes are reviewed through Terraform and new EC2 instances are launched from a versioned Golden AMI instead of being changed in place.</p>
            <div class="insight-footer"><div class="insight-tags"><span>Terraform</span><span>Golden AMI</span><span>Auto Scaling</span></div><a class="insight-case-link" href="projects/immutable-aws-infrastructure.html">Open case study <span>↗</span></a></div>
          </div>
        </article>
      </div>
    </div>

    <div class="insight-progress" aria-hidden="true"><span data-insights-current>01</span><div class="insight-progress-line"><span data-insights-progress></span></div><span>03</span></div>
  </div>
</section>`;

html = html.replace(
  '<section class="journey-section journey-scroll-section">',
  `${projectInsights}\n<section class="journey-section journey-scroll-section">`
);

html = html.replace(
  '</body>',
  '  <script src="/assets/project-insights-20260910.js?v=20260910-1505"></script>\n</body>'
);

await fs.writeFile(homepage, html);
console.log('Applied authoritative homepage project, insight carousel, Kubernetes Lab and project-process refinements.');
