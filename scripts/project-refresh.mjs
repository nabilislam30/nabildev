import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

const homepagePath = path.join(dist, 'index.html');
let home = await fs.readFile(homepagePath, 'utf8');

if (!home.includes('/assets/project-2048-20260909.css')) {
  home = home.replace('</head>', '  <link rel="stylesheet" href="/assets/project-2048-20260909.css">\n</head>');
}

const homepageProjects = `<section class="evidence-section">
  <div class="container">
    <div class="section-head reveal">
      <div><span class="kicker">Selected projects</span><h2>Hands-on projects, explained.</h2><p class="intro">What I built, how I built it, what I worked through, and what I learned.</p></div>
    </div>

    <div class="evidence-grid">
      <article class="evidence-card evidence-card-stable card reveal">
        <div class="evidence-index">01</div>
        <div class="evidence-header">
          <span class="kicker">EKS platform</span>
          <h3 class="featured-project-title">Deploying 2048 on Amazon EKS</h3>
          <p>Built an EKS platform with Terraform, GitOps delivery, HTTPS, security scanning and monitoring.</p>
          <div class="integrated-stack-pills" aria-label="Technologies applied in the 2048 EKS platform project">
            <span><b>Terraform</b><small>IaC</small></span><i>→</i>
            <span><b>Amazon EKS</b><small>Kubernetes</small></span><i>→</i>
            <span><b>ArgoCD</b><small>GitOps</small></span><i>→</i>
            <span><b>GitHub Actions</b><small>CI/CD</small></span><i>→</i>
            <span><b>Prometheus</b><small>Monitoring</small></span>
          </div>
        </div>
        <div class="evidence-build">
          <div class="project-terminal reveal" data-terminal-once data-terminal-lines='["$ terraform plan","$ kubectl get nodes","$ kubectl get pods -A","$ argocd app list"]'>
            <div class="terminal-bar"><i></i><i></i><i></i><span>terraform / eks / argocd</span></div>
            <pre><code data-terminal-output></code><span class="terminal-cursor">▋</span></pre>
          </div>
        </div>
        <div class="architecture-column"><div class="architecture-cta"><a href="projects/2048-eks-platform.html" class="card-link">View case study <span>↗</span></a></div><div class="architecture-lab architecture-stable architecture-featured architecture-eks animated-architecture" data-architecture-flow>
          <button class="arch-node" data-arch-info="Cloudflare manages the DNS zone and ExternalDNS maintains the record for 2048.nabilenv.com.">Cloudflare DNS</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node" data-arch-info="The AWS Load Balancer Controller provisions the ALB and ACM provides HTTPS.">ALB / HTTPS</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node accent" data-arch-info="Amazon EKS runs the application and supporting Kubernetes workloads on a managed node group in private subnets.">Amazon EKS</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node" data-arch-info="The 2048 Deployment runs two replicas behind a ClusterIP Service and Kubernetes Ingress.">2048 Pods</button>
          <div class="project-arch-support"><span class="project-arch-support-label">Container image path</span><span class="arch-box">ECR</span><span class="project-arch-support-arrow" aria-hidden="true">→</span><span class="arch-box">EKS</span></div>
          <div class="arch-tooltip" data-arch-tooltip>Hover an architecture node</div>
        </div></div>
      </article>

      <article class="evidence-card evidence-card-stable card reveal">
        <div class="evidence-index">02</div>
        <div class="evidence-header">
          <span class="kicker">ECS Threat Composer</span>
          <h3 class="featured-project-title">Deploying Threat Composer on AWS ECS Fargate</h3>
          <p>Built, containerised and deployed Threat Composer using Docker, Terraform and ECS, with HTTPS and a custom domain.</p>
          <div class="integrated-stack-pills" aria-label="Technologies applied in the ECS Threat Composer project">
            <span><b>Docker</b><small>Containers</small></span><i>→</i>
            <span><b>Terraform</b><small>IaC</small></span><i>→</i>
            <span><b>ECR</b><small>Registry</small></span><i>→</i>
            <span><b>ECS Fargate</b><small>Serverless</small></span><i>→</i>
            <span><b>GitHub Actions</b><small>CI/CD</small></span>
          </div>
        </div>
        <div class="evidence-build">
          <div class="project-terminal reveal" data-terminal-once data-terminal-lines='["$ cd app","$ docker build -t threatmod .","$ docker run --rm -p 8080:80 threatmod","$ curl http://localhost:8080/health","✓ {\\"status\\":\\"ok\\"}"]'>
            <div class="terminal-bar"><i></i><i></i><i></i><span>docker / ecs / threat composer</span></div>
            <pre><code data-terminal-output></code><span class="terminal-cursor">▋</span></pre>
          </div>
        </div>
        <div class="architecture-column"><div class="architecture-cta"><a href="projects/ecs-threat-composer.html" class="card-link">View case study <span>↗</span></a></div><div class="architecture-lab architecture-stable architecture-featured architecture-ecs animated-architecture" data-architecture-flow>
          <button class="arch-node" data-arch-info="Resolves tm.nabilstack.com to the Application Load Balancer.">Route 53</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node" data-arch-info="Terminates HTTPS using ACM and forwards requests to the ECS service.">ALB / HTTPS</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node accent" data-arch-info="Runs the ARM64 NGINX application container without managing EC2 hosts.">ECS Fargate</button><i class="flow-line horizontal"><span style="animation-direction:reverse !important"></span></i>
          <button class="arch-node" data-arch-info="Stores the Docker image that ECS Fargate pulls when application tasks start.">ECR</button>
          <div class="arch-tooltip" data-arch-tooltip>Hover an architecture node</div>
        </div></div>
      </article>

      <article class="evidence-card evidence-card-stable card reveal">
        <div class="evidence-index">03</div>
        <div class="evidence-header">
          <span class="kicker">Immutable AWS Infrastructure</span>
          <h3 class="featured-project-title">Immutable AWS infrastructure with Terraform</h3>
          <p>Production-inspired AWS platform built with Terraform, immutable infrastructure and GitHub Actions.</p>
          <div class="integrated-stack-pills" aria-label="Technologies applied in the immutable AWS infrastructure project">
            <span><b>Terraform</b><small>IaC</small></span><i>→</i>
            <span><b>AWS</b><small>Platform</small></span><i>→</i>
            <span><b>Golden AMI</b><small>Immutable</small></span><i>→</i>
            <span><b>OIDC</b><small>Identity</small></span><i>→</i>
            <span><b>GitHub Actions</b><small>CI/CD</small></span>
          </div>
        </div>
        <div class="evidence-build">
          <div class="project-terminal reveal" data-terminal-once data-terminal-lines='["$ terraform fmt -check","$ trivy config .","$ terraform plan -out=tfplan","✓ reviewed plan saved"]'>
            <div class="terminal-bar"><i></i><i></i><i></i><span>terraform / aws / security</span></div>
            <pre><code data-terminal-output></code><span class="terminal-cursor">▋</span></pre>
          </div>
        </div>
        <div class="architecture-column"><div class="architecture-cta"><a href="projects/immutable-aws-infrastructure.html" class="card-link">View case study <span>↗</span></a></div><div class="architecture-lab architecture-stable architecture-featured architecture-immutable animated-architecture" data-architecture-flow>
          <button class="arch-node" data-arch-info="Public traffic enters the development workload through the load balancer.">Internet</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node" data-arch-info="Routes traffic to healthy application instances and performs health checks.">ALB</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node accent" data-arch-info="Replaceable Auto Scaling instances are launched from a Golden AMI built with AWS Image Builder.">ASG / EC2</button><i class="flow-line horizontal"><span></span></i>
          <button class="arch-node" data-arch-info="Private PostgreSQL database protected through security-group access, KMS encryption and Secrets Manager credentials.">RDS</button>
          <div class="arch-tooltip" data-arch-tooltip>Hover an architecture node</div>
        </div></div>
      </article>
    </div>
  </div>
</section>`;

home = home.replace(
  /<section class="evidence-section">[\s\S]*?<\/section>\s*<section class="journey-section/,
  `${homepageProjects}\n\n<section class="journey-section`
);

const requiredHome = [
  'Deploying 2048 on Amazon EKS',
  'projects/2048-eks-platform.html',
  'architecture-eks',
  'Deploying Threat Composer on AWS ECS Fargate',
  'Immutable AWS infrastructure with Terraform'
];
for (const value of requiredHome) {
  if (!home.includes(value)) throw new Error(`2048 homepage refresh failed: missing ${value}`);
}
if (home.includes('Automating a WordPress infrastructure deployment')) {
  throw new Error('2048 homepage refresh failed: WordPress is still in Selected projects.');
}
await fs.writeFile(homepagePath, home);

const projectsPath = path.join(dist, 'projects.html');
let projects = await fs.readFile(projectsPath, 'utf8');
projects = projects
  .replace(
    'DevOps project case studies covering Terraform, AWS, ECS Fargate, immutable infrastructure, Docker and infrastructure engineering.',
    'DevOps project case studies covering Amazon EKS, Kubernetes, Terraform, AWS, ECS Fargate, GitOps, containers and infrastructure engineering.'
  );

const projectShowcase = `<section class="project-showcase"><div class="container">
    <div class="filter-bar reveal" role="group" aria-label="Filter projects">
      <button class="filter active" data-filter="all">All</button>
      <button class="filter" data-filter="cloud">Cloud</button>
      <button class="filter" data-filter="terraform">Terraform</button>
      <button class="filter" data-filter="containers">Containers</button>
      <button class="filter" data-filter="kubernetes">Kubernetes</button>
      <button class="filter" data-filter="cicd">CI/CD</button>
    </div>
    <div class="project-grid">
<article class="card project-card reveal" data-category="cloud terraform containers kubernetes cicd"><span class="project-number">01</span><span class="kicker">Terraform · EKS · GitOps</span><h3>2048 on Amazon EKS</h3><p>Production-style EKS platform with Terraform, GitOps delivery, HTTPS, monitoring and security scanning.</p><div class="tags"><span class="tag">Terraform</span><span class="tag">EKS</span><span class="tag">ArgoCD</span><span class="tag">GitHub Actions</span><span class="tag">Prometheus</span></div><div class="arch" data-project-flow><div class="arch-row"><span class="arch-box">Cloudflare DNS</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">ALB / HTTPS</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Amazon EKS</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">2048 Pods</span></div><div class="project-arch-support"><span class="project-arch-support-label">Container image path</span><span class="arch-box">ECR</span><span class="project-arch-support-arrow" aria-hidden="true">→</span><span class="arch-box">EKS</span></div></div><p><a href="https://github.com/nabilislam30/2048-eks-platform" target="_blank" rel="noopener noreferrer">View repository ↗</a></p><a class="project-case-link" href="projects/2048-eks-platform.html">View case study <span>↗</span></a></article>
<article class="card project-card reveal" data-category="cloud terraform containers cicd"><span class="project-number">02</span><span class="kicker">Docker · Terraform · ECS Fargate</span><h3>Deploying Threat Composer on AWS ECS Fargate</h3><p>Built, containerised and deployed Threat Composer using Docker, Terraform and ECS Fargate, with ECR, HTTPS, a custom domain and GitHub Actions deployment workflows.</p><div class="tags"><span class="tag">Docker</span><span class="tag">Terraform</span><span class="tag">ECR</span><span class="tag">ECS Fargate</span><span class="tag">GitHub Actions</span></div><div class="arch" data-project-flow><div class="arch-row"><span class="arch-box">Client</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Route 53</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">ALB / HTTPS</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">ECS Fargate</span></div><div class="project-arch-support"><span class="project-arch-support-label">Container image path</span><span class="arch-box">ECR</span><span class="project-arch-support-arrow" aria-hidden="true">→</span><span class="arch-box">ECS Fargate</span></div></div><p><a href="https://github.com/nabilislam30/ecs-threat-composer" target="_blank" rel="noopener noreferrer">View repository ↗</a></p><a class="project-case-link" href="projects/ecs-threat-composer.html">View case study <span>↗</span></a></article>
<article class="card project-card reveal" data-category="cloud terraform cicd"><span class="project-number">03</span><span class="kicker">Terraform · AWS · Platform Engineering</span><h3>Immutable AWS infrastructure with Terraform</h3><p>Production-inspired AWS platform built with Terraform, immutable infrastructure and GitHub Actions.</p><div class="tags"><span class="tag">Terraform</span><span class="tag">AWS</span><span class="tag">Golden AMI</span><span class="tag">OIDC</span><span class="tag">GitHub Actions</span></div><div class="arch" data-project-flow><div class="arch-row"><span class="arch-box">Internet</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">ALB</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">ASG / EC2</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">RDS</span></div><div class="project-arch-support"><span class="project-arch-support-label">Immutable image path</span><span class="arch-box">Image Builder</span><span class="project-arch-support-arrow" aria-hidden="true">→</span><span class="arch-box">Golden AMI</span><span class="project-arch-support-arrow" aria-hidden="true">→</span><span class="arch-box">ASG / EC2</span></div></div><p><a href="https://github.com/nabilislam30/immutable-aws-infrastructure-terraform" target="_blank" rel="noopener noreferrer">View repository ↗</a></p><a class="project-case-link" href="projects/immutable-aws-infrastructure.html">View case study <span>↗</span></a></article>
<article class="card project-card reveal" data-category="cloud terraform"><span class="project-number">04</span><span class="kicker">Terraform · AWS</span><h3>WordPress infrastructure deployment</h3><p>A complete Terraform build containing a VPC, public subnet, internet gateway, route table, security group and EC2 bootstrap process.</p><div class="tags"><span class="tag">Terraform</span><span class="tag">AWS</span><span class="tag">VPC</span><span class="tag">Security Groups</span><span class="tag">EC2</span></div><div class="arch" data-project-flow><div class="arch-row"><span class="arch-box">Internet</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Gateway</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Public Subnet</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">EC2 + WordPress</span></div></div><p><a href="https://github.com/nabilislam30/Wordpress-Deployment-with-Terraform" target="_blank" rel="noopener noreferrer">View repository ↗</a></p><a class="project-case-link" href="projects/terraform-wordpress.html">View case study <span>↗</span></a></article>
<article class="card project-card reveal" data-category="containers"><span class="project-number">05</span><span class="kicker">Docker · NGINX · Redis</span><h3>Containerised counter application</h3><p>A Docker Compose stack using NGINX, Redis and multiple web containers to demonstrate routing, shared state and horizontal scaling.</p><div class="tags"><span class="tag">Docker</span><span class="tag">Compose</span><span class="tag">NGINX</span><span class="tag">Redis</span></div><div class="arch" data-project-flow><div class="arch-row"><span class="arch-box">Client</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">NGINX</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Web 1</span><span class="arch-box">Web 2</span><span class="arch-box">Web 3</span></div><div class="line flow-project-line"><span></span></div><div class="arch-row"><span class="arch-box">Redis</span></div></div><p><a href="https://github.com/nabilislam30/redis-counter-app" target="_blank" rel="noopener noreferrer">View repository ↗</a></p><a class="project-case-link" href="projects/redis-counter.html">View case study <span>↗</span></a></article>
</div></div></section>`;

projects = projects.replace(/<section class="project-showcase">[\s\S]*?<\/section>\s*<\/main>/, `${projectShowcase}</main>`);

const requiredProjects = [
  'data-filter="kubernetes"',
  '2048 on Amazon EKS',
  'projects/2048-eks-platform.html',
  '<span class="project-number">05</span>'
];
for (const value of requiredProjects) {
  if (!projects.includes(value)) throw new Error(`2048 projects refresh failed: missing ${value}`);
}
await fs.writeFile(projectsPath, projects);

console.log('Added 2048 EKS platform to homepage and Projects page.');
