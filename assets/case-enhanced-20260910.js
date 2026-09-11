(() => {
  const root = document.querySelector('body[data-case-style="enhanced"]');
  if (!root) return;

  const parityHref = '../assets/case-architecture-parity-20260911.css';
  if (!document.querySelector(`link[href="${parityHref}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = parityHref;
    document.head.appendChild(link);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = window.location.pathname;

  const icons = {
    user:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 27c.6-6 4-9 9-9s8.4 3 9 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    network:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="16" r="3" fill="currentColor"/><circle cx="24" cy="9" r="3" fill="currentColor"/><circle cx="24" cy="23" r="3" fill="currentColor"/><path d="M11 16h6m2-2 3-3m-3 7 3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    gateway:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 7h20v18H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 12h12M10 17h8M10 22h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    load:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="7" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 11 3 3m6 0 3-3m-9 7-3 3m9-3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    container:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 4 10 5.5v13L16 28 6 22.5v-13L16 4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m6 9.5 10 5.5 10-5.5M16 15v13" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    app:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11h22M10 17h5v5h-5zM18 17h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    git:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8v9c0 4 3 7 7 7h4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="7" r="3" fill="currentColor"/><circle cx="21" cy="24" r="3" fill="currentColor"/><circle cx="20" cy="8" r="3" fill="currentColor"/><path d="M20 11v4c0 3-2 5-5 5h-1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    pipeline:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="5" width="20" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m13 11 8 5-8 5Z" fill="currentColor"/></svg>',
    registry:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 9h20v17H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 5h12v4H10zM11 14h10M11 19h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    compute:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="7" width="20" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 12h12M10 17h8M10 22h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    shield:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 25 8v7c0 6-3.8 10.4-9 13-5.2-2.6-9-7-9-13V8l9-4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m12 16 3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    database:'<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="8" rx="9" ry="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 8v8c0 2.2 4 4 9 4s9-1.8 9-4V8M7 16v8c0 2.2 4 4 9 4s9-1.8 9-4v-8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    terraform:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m7 7 8 5v9l-8-5V7Zm10 6 8-5v9l-8 5v-9Zm0 11 8-5v6l-8 5v-6Z" fill="currentColor"/></svg>',
    image:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="22" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="m8 23 6-6 4 4 3-3 4 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    subnet:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 11h10v10H11z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    compose:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="18" y="6" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="11.5" y="18" width="9" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    volume:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8h18v16H7z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 12h10M11 17h10M11 22h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  const configs = [
    {
      match:'ecs-threat-composer',
      flows:[
        [
          ['user','User','Browser','Request source','A user opens the Threat Composer application through its public HTTPS endpoint.',['Public entry point','HTTPS request','Browser client']],
          ['network','Route 53','DNS','DNS resolution','Route 53 resolves the custom application domain to the internet-facing load balancer.',['Custom domain','AWS DNS','ALB target']],
          ['load','ALB / HTTPS','ACM','Traffic ingress','The Application Load Balancer terminates HTTPS with ACM and forwards healthy requests to the ECS service.',['TLS termination','Health-aware routing','Public ingress'],true],
          ['container','ECS Fargate','Runtime','Container runtime','ECS Fargate runs the application container without requiring EC2 host management.',['Serverless containers','Managed task runtime','No EC2 hosts']],
          ['app','Threat Composer','Application','Application workload','The NGINX-served Threat Composer container receives routed requests from the Fargate service.',['Containerised app','NGINX runtime','Health endpoint']]
        ],
        [
          ['git','Git push','Source','Source change','Application changes are pushed to GitHub and start the release workflow.',['Version-controlled change','Traceable commit','Pipeline trigger']],
          ['pipeline','GitHub Actions','CI/CD','Build and deploy','GitHub Actions authenticates to AWS with OIDC and runs the application deployment workflow.',['OIDC authentication','Automated build','Deployment workflow'],true],
          ['registry','Amazon ECR','Registry','Container registry','The built application image is stored in Amazon ECR for deployment to ECS.',['AWS-native registry','Versioned images','Deployment artifact']],
          ['container','ECS Service','Orchestration','Service update','The ECS service is updated to use the new task definition and application image.',['Managed service','Task definition update','Health checks']],
          ['app','Fargate task','Runtime','Running release','Fargate starts the updated application task behind the load balancer.',['Updated workload','No host management','Routed through ALB']]
        ]
      ]
    },
    {
      match:'immutable-aws-infrastructure',
      flows:[
        [
          ['user','Internet','Traffic','Request source','Internet traffic reaches the public application entry point.',['Public request path','External traffic','ALB entry']],
          ['load','ALB','Load balancing','Traffic ingress','The public Application Load Balancer distributes requests across replaceable EC2 instances.',['Load distribution','Health-aware routing','Public ingress'],true],
          ['compute','ASG / EC2','Compute','Immutable compute','The Auto Scaling Group launches replaceable EC2 instances from the approved Golden AMI.',['Auto Scaling Group','Replaceable instances','Golden AMI']],
          ['shield','Security groups','Access','Tier controls','Security groups control traffic between the public load-balancing, application and database tiers.',['Scoped access','Tier isolation','Security-group rules']],
          ['database','PostgreSQL RDS','Database','Managed data tier','PostgreSQL RDS provides the private managed database tier with encryption and controlled access.',['Private database','KMS encryption','Managed backups']]
        ],
        [
          ['git','Git push','Source','Infrastructure change','Infrastructure changes are reviewed and committed to Git before deployment.',['Version-controlled IaC','Reviewable change','Traceable history']],
          ['pipeline','GitHub Actions','Automation','CI/CD workflow','GitHub Actions authenticates through OIDC and runs Terraform validation, security checks and deployment.',['OIDC','Plan and apply','Security checks']],
          ['terraform','Terraform','IaC','Infrastructure provisioning','Terraform composes the reusable modules and environment-specific configuration.',['Reusable modules','Environment state','Reviewed plans'],true],
          ['image','Image Builder','AMI pipeline','Image creation','AWS Image Builder creates the approved machine image used by the compute layer.',['Automated image build','Approved base image','Immutable artifact']],
          ['compute','Golden AMI → ASG','Compute','Immutable rollout','The Auto Scaling Group consumes the approved Golden AMI so instances are replaced rather than patched in place.',['Immutable rollout','Replaceable compute','Versioned image']]
        ]
      ]
    },
    {
      match:'terraform-wordpress',
      flows:[
        [
          ['user','User','Browser','Request source','A browser request reaches the public WordPress learning environment.',['Browser request','HTTP access','Public endpoint']],
          ['gateway','Internet Gateway','VPC edge','Internet access','The Internet Gateway provides connectivity between the VPC and the public internet.',['VPC internet edge','Public routing','Terraform managed']],
          ['subnet','Public subnet','10.0.1.0/24','Network tier','The public subnet hosts the internet-reachable EC2 learning environment and is associated with the public route table.',['10.0.1.0/24 subnet','Public routing','EC2 placement'],true],
          ['shield','Security group','Firewall','Access control','The security group controls HTTP and administrative access to the EC2 instance.',['HTTP ingress','Restricted admin access','Instance firewall']],
          ['app','EC2 + WordPress','Application','Application host','The Ubuntu EC2 instance runs Apache, PHP and WordPress installed through user data.',['Ubuntu EC2','Apache + PHP','WordPress bootstrap']]
        ],
        [
          ['terraform','Terraform','IaC','Provisioning source','Terraform defines the networking, routing, security and compute resources for the environment.',['Repeatable IaC','Declarative resources','AWS provider']],
          ['network','VPC','10.0.0.0/16','Network foundation','Terraform creates the VPC that contains the WordPress learning environment.',['10.0.0.0/16','Network boundary','Reusable configuration']],
          ['subnet','Public subnet','Network tier','Subnet provisioning','Terraform creates the public subnet and connects it to the public route path.',['Public subnet','Route-table association','Internet reachability']],
          ['shield','Security group','Access','Security provisioning','Terraform creates the security-group rules required by the learning deployment.',['HTTP rule','Administrative access','Managed in code']],
          ['app','EC2 + user data','Bootstrap','Compute provisioning','Terraform launches Ubuntu EC2 and user data installs Apache, PHP and WordPress automatically.',['EC2 provisioning','Automated bootstrap','Repeatable setup'],true]
        ]
      ]
    },
    {
      match:'redis-counter',
      flows:[
        [
          ['user','Client','Request','Request source','The client sends requests to the single NGINX entry point.',['Single public entry','HTTP request','Container network']],
          ['gateway','NGINX','Proxy','Reverse proxy','NGINX receives external traffic and reverse-proxies requests across the interchangeable web containers.',['Single proxy endpoint','Traffic distribution','Application containers remain private'],true],
          ['container','Web ×3','Flask','Scaled application','Three interchangeable web containers demonstrate horizontal scaling behind NGINX.',['Three replicas','Horizontal scaling','Stateless web tier']],
          ['database','Redis','State','Shared state','Redis stores the shared visitor count so every web container reads and writes the same state.',['Shared counter state','Low-latency store','Consistent across replicas']],
          ['volume','redis_data','Volume','Persistence','The named Redis volume preserves Redis data independently of the Redis container lifecycle.',['Named volume','Persistent data','Container-independent state']]
        ],
        [
          ['compose','Docker Compose','Stack','Stack definition','Docker Compose defines the complete local multi-container application stack.',['Declarative stack','Single compose file','Service orchestration'],true],
          ['gateway','NGINX','Proxy','Entry service','Compose starts NGINX as the request entry point for the application.',['Reverse proxy','Port exposure','Traffic routing']],
          ['container','Web ×3','Containers','Scaled service','The Compose web service is scaled to three Flask containers.',['Three web containers','Interchangeable replicas','Internal network']],
          ['database','Redis','State','Shared service','Redis runs as the shared state service used by all web containers.',['Shared counter','Service discovery','Private service']],
          ['volume','redis_data','Volume','Persistent storage','The named volume is attached to Redis so state survives container replacement.',['Named volume','Redis persistence','Reusable storage']]
        ]
      ]
    }
  ];

  const projectConfig = configs.find(config => path.includes(config.match));

  const renderConfiguredFlow = (flow, nodes) => {
    if (!flow || !nodes) return;
    flow.innerHTML = nodes.map((node, index) => {
      const [iconKey,title,sub,label,desc,points,isDefault] = node;
      const pointString = points.join('|');
      const button = `<button class="case-arch-node" type="button" data-case-arch-node data-arch-title="${title}" data-arch-label="${label}" data-arch-desc="${desc}" data-arch-points="${pointString}"${isDefault ? ' data-default="true"' : ''} aria-pressed="false"><span class="case-arch-icon">${icons[iconKey] || icons.app}</span><strong>${title}</strong><small>${sub}</small></button>`;
      return `${index ? '<span class="case-arch-link" aria-hidden="true"></span>' : ''}${button}`;
    }).join('');
  };

  const renderInfo = (panel, node, instant = false) => {
    if (!panel || !node) return;
    const apply = () => {
      const points = (node.dataset.archPoints || '').split('|').map(v => v.trim()).filter(Boolean);
      panel.innerHTML = `<div class="case-arch-info-kicker"><span class="case-arch-info-dot"></span>${node.dataset.archLabel || 'Architecture node'}</div><h4>${node.dataset.archTitle || node.querySelector('strong')?.textContent || ''}</h4><p>${node.dataset.archDesc || ''}</p>${points.length ? `<strong>Key points</strong><ul class="case-arch-benefits">${points.map(point => `<li>${point}</li>`).join('')}</ul>` : ''}`;
      panel.classList.remove('is-changing');
    };
    if (instant || reduced) return apply();
    panel.classList.add('is-changing');
    window.setTimeout(apply, 110);
  };

  root.querySelectorAll('[data-case-enhanced-architecture]').forEach(component => {
    const tabs = [...component.querySelectorAll('[data-case-arch-tab]')];
    const flows = [...component.querySelectorAll('[data-case-arch-flow]')];
    const panel = component.querySelector('[data-case-arch-info]');

    if (projectConfig) flows.forEach((flow, index) => renderConfiguredFlow(flow, projectConfig.flows[index]));

    const controls = component.querySelector('.case-arch-controls');
    let expand = component.querySelector('[data-case-arch-expand]');
    if (controls && !expand) {
      expand = document.createElement('button');
      expand.className = 'case-arch-expand';
      expand.type = 'button';
      expand.dataset.caseArchExpand = '';
      expand.setAttribute('aria-expanded','false');
      expand.innerHTML = 'Expand <span aria-hidden="true">↗</span>';
      controls.appendChild(expand);
    }

    let current = tabs.find(tab => tab.classList.contains('active'))?.dataset.caseArchTab || flows[0]?.dataset.caseArchFlow;
    let selected = null;

    const activateFlow = (name, initial = false) => {
      current = name;
      flows.forEach(flow => {
        const active = flow.dataset.caseArchFlow === name;
        flow.hidden = !active;
        flow.classList.toggle('active', active);
        if (active) {
          const nodes = [...flow.querySelectorAll('[data-case-arch-node]')];
          const preferred = nodes.find(node => node.dataset.default === 'true') || nodes[Math.min(2,nodes.length-1)] || nodes[0];
          selected = preferred;
          nodes.forEach(node => {
            const isSelected = node === selected;
            node.classList.toggle('active', isSelected);
            node.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
          });
          renderInfo(panel, selected, initial);
        }
      });
      tabs.forEach(tab => {
        const active = tab.dataset.caseArchTab === name;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      component.classList.remove('is-ready');
      requestAnimationFrame(() => requestAnimationFrame(() => component.classList.add('is-ready')));
    };

    flows.forEach(flow => {
      const nodes = [...flow.querySelectorAll('[data-case-arch-node]')];
      nodes.forEach(node => {
        const preview = () => renderInfo(panel, node);
        node.addEventListener('mouseenter', preview);
        node.addEventListener('focus', preview);
        node.addEventListener('click', () => {
          selected = node;
          nodes.forEach(candidate => {
            const active = candidate === selected;
            candidate.classList.toggle('active', active);
            candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          renderInfo(panel, selected);
        });
      });
      flow.addEventListener('mouseleave', () => selected && renderInfo(panel, selected));
    });

    tabs.forEach(tab => tab.addEventListener('click', () => {
      const name = tab.dataset.caseArchTab;
      if (!name || name === current) return;
      const activeFlow = flows.find(flow => flow.dataset.caseArchFlow === current);
      activeFlow?.classList.add('is-switching');
      window.setTimeout(() => {
        activeFlow?.classList.remove('is-switching');
        activateFlow(name);
      }, reduced ? 0 : 150);
    }));

    const setExpanded = expanded => {
      component.classList.toggle('is-expanded', expanded);
      document.body.classList.toggle('case-architecture-modal-open', expanded);
      if (expand) {
        expand.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        expand.innerHTML = expanded ? 'Close <span aria-hidden="true">×</span>' : 'Expand <span aria-hidden="true">↗</span>';
      }
    };
    expand?.addEventListener('click', () => setExpanded(!component.classList.contains('is-expanded')));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && component.classList.contains('is-expanded')) setExpanded(false);
    });

    activateFlow(current, true);

    if (!reduced && 'IntersectionObserver' in window) {
      component.classList.remove('is-ready');
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        component.classList.add('is-ready');
        observer.disconnect();
      }, { threshold: .22 });
      observer.observe(component);
    }
  });

  const registerMotion = (selector, className) => {
    root.querySelectorAll(selector).forEach(element => element.classList.add(className, 'case-motion-watch'));
  };
  registerMotion('.case-facts-grid', 'case-motion-facts');
  registerMotion('.case-steps', 'case-motion-list');
  registerMotion('.project-terminal', 'case-motion-terminal');
  registerMotion('.case-troubleshooting-grid', 'case-motion-trouble');
  registerMotion('.case-outcome-panel', 'case-motion-outcome');

  const targets = [...root.querySelectorAll('.case-motion-watch')];
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(target => target.classList.add('is-inview'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      });
    }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(target => observer.observe(target));
  }
})();
