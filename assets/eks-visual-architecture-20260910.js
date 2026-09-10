(() => {
  const component = document.querySelector('[data-eks-visual-architecture]');
  if (!component) return;

  const flowHost = component.querySelector('[data-eks-arch-flow]');
  const info = component.querySelector('[data-eks-arch-info]');
  const tabs = [...component.querySelectorAll('[data-eks-arch-tab]')];
  const expand = component.querySelector('[data-eks-arch-expand]');
  if (!flowHost || !info || !tabs.length) return;

  const icon = {
    user: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="10" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 27c.6-6 4-9 9-9s8.4 3 9 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cloud: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 24h15a5 5 0 0 0 .3-10 8 8 0 0 0-15-1.5A5.8 5.8 0 0 0 9 24Z" fill="currentColor" opacity=".94"/></svg>',
    alb: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="7" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="23" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 11 3 3m6 0 3-3m-9 7-3 3m9-3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    eks: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 10 6v14l-10 6-10-6V9l10-6Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11h8v3h-3v7h3v3h-8v-3h3v-7h-3Z" fill="currentColor"/></svg>',
    app: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 4 10 5.5v13L16 28 6 22.5v-13L16 4Z" fill="currentColor" opacity=".24"/><path d="m6 9.5 10 5.5 10-5.5M16 15v13" fill="none" stroke="currentColor" stroke-width="2"/><path d="m16 4 10 5.5v13L16 28 6 22.5v-13L16 4Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    git: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 8v9c0 4 3 7 7 7h4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="7" r="3" fill="currentColor"/><circle cx="21" cy="24" r="3" fill="currentColor"/><circle cx="20" cy="8" r="3" fill="currentColor"/><path d="M20 11v4c0 3-2 5-5 5h-1" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    actions: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 6h14v20H9z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m13 12 7 4-7 4Z" fill="currentColor"/></svg>',
    registry: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 9h20v17H6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 5h12v4H10zM11 14h10M11 19h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    argocd: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4a12 12 0 1 0 12 12" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 5h7v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m28 5-8 8" stroke="currentColor" stroke-width="2"/><path d="m11 17 3 3 7-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  const flows = {
    traffic: [
      { id:'user', icon:'user', title:'User', sub:'Browser', label:'Request source', description:'A user opens the 2048 application in a browser and sends an HTTPS request to the public application hostname.', benefits:['Public application entry point','HTTPS request path','No direct access to worker nodes'] },
      { id:'cloudflare', icon:'cloud', title:'Cloudflare', sub:'DNS · Security', label:'DNS and edge', description:'Cloudflare hosts the DNS zone for the application. ExternalDNS keeps the application record aligned with the AWS load balancer endpoint.', benefits:['Managed public DNS','Automated DNS updates','Application hostname stays aligned'] },
      { id:'alb', icon:'alb', title:'ALB', sub:'HTTPS · ACM', label:'Traffic ingress', description:'The internet-facing Application Load Balancer terminates HTTPS using ACM and forwards requests through the Kubernetes ingress path.', benefits:['TLS termination','Health-aware routing','AWS Load Balancer Controller managed'] },
      { id:'eks', icon:'eks', title:'EKS', sub:'Kubernetes', label:'Managed Kubernetes', description:'Amazon EKS provides the managed Kubernetes control plane while the project workloads run across private worker nodes in the VPC.', benefits:['Managed control plane','Multi-AZ platform design','Private worker-node compute'] },
      { id:'app', icon:'app', title:'2048 App', sub:'Pods', label:'Application workload', description:'Kubernetes Service and application pods receive the routed traffic inside the cluster and serve the containerised 2048 application.', benefits:['Containerised workload','Kubernetes-managed replicas','Resource requests and limits'] }
    ],
    deployment: [
      { id:'gitpush', icon:'git', title:'Git push', sub:'Source', label:'Source change', description:'A source or deployment change is pushed to GitHub, starting the automated release workflow.', benefits:['Version-controlled change','Traceable commit history','Pipeline trigger'] },
      { id:'actions', icon:'actions', title:'GitHub Actions', sub:'CI/CD', label:'Build and scan', description:'GitHub Actions builds the application image, runs security scanning and authenticates to AWS through OIDC.', benefits:['OIDC authentication','Automated Trivy scanning','Repeatable image build'] },
      { id:'ecr', icon:'registry', title:'Amazon ECR', sub:'Registry', label:'Container registry', description:'The release workflow pushes the immutable application image to Amazon ECR using a Git commit-derived image tag.', benefits:['Immutable image tags','AWS-native registry','Traceable release artifact'] },
      { id:'gitstate', icon:'git', title:'Git desired state', sub:'Image tag', label:'Desired state update', description:'The workflow updates the Kubernetes image reference in Git. Git remains the source of truth for the application deployment state.', benefits:['Declarative desired state','Release change visible in Git','No direct CI deployment to cluster'] },
      { id:'argocd', icon:'argocd', title:'ArgoCD', sub:'GitOps', label:'GitOps reconciliation', description:'ArgoCD detects the Git change and reconciles the Kubernetes application toward the committed desired state.', benefits:['Automated sync','Pruning and self-healing','Git-driven deployment'] },
      { id:'eksdeploy', icon:'eks', title:'Amazon EKS', sub:'Cluster', label:'Runtime platform', description:'EKS receives the reconciled Kubernetes change and runs the updated application workload on the cluster.', benefits:['Managed Kubernetes runtime','Controlled rollout','Observable workload state'] }
    ]
  };

  let currentFlow = 'traffic';
  let selectedId = 'eks';

  const renderInfo = (node, instant = false) => {
    if (!node) return;
    const apply = () => {
      info.innerHTML = `<div class="eks-arch-info-kicker"><span class="eks-arch-info-dot"></span>${node.label}</div><h4>${node.title}</h4><p>${node.description}</p><strong>Key points</strong><ul class="eks-arch-benefits">${node.benefits.map(item => `<li>${item}</li>`).join('')}</ul>`;
      info.classList.remove('is-changing');
    };
    if (instant) return apply();
    info.classList.add('is-changing');
    window.setTimeout(apply, 115);
  };

  const renderFlow = (flowName, initial = false) => {
    const nodes = flows[flowName];
    if (!nodes) return;
    if (!nodes.some(node => node.id === selectedId)) selectedId = flowName === 'traffic' ? 'eks' : 'argocd';

    flowHost.innerHTML = nodes.map((node, index) => `${index ? '<span class="eks-arch-link" aria-hidden="true"></span>' : ''}<button class="eks-arch-node${node.id === selectedId ? ' active' : ''}" type="button" data-arch-node="${node.id}" aria-pressed="${node.id === selectedId}"><span class="eks-arch-icon">${icon[node.icon]}</span><strong>${node.title}</strong><small>${node.sub}</small></button>`).join('');

    const selected = nodes.find(node => node.id === selectedId) || nodes[0];
    renderInfo(selected, initial);

    const buttons = [...flowHost.querySelectorAll('[data-arch-node]')];
    const select = (button, temporary = false) => {
      const node = nodes.find(item => item.id === button.dataset.archNode);
      if (!node) return;
      if (!temporary) {
        selectedId = node.id;
        buttons.forEach(item => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }
      renderInfo(node);
    };

    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => select(button, true));
      button.addEventListener('focus', () => select(button, true));
      button.addEventListener('click', () => select(button, false));
    });

    flowHost.addEventListener('mouseleave', () => {
      const selectedNode = nodes.find(item => item.id === selectedId);
      renderInfo(selectedNode);
    }, { once:true });
  };

  const activateEntrance = () => {
    component.classList.remove('is-ready');
    requestAnimationFrame(() => requestAnimationFrame(() => component.classList.add('is-ready')));
  };

  const switchFlow = next => {
    if (next === currentFlow || !flows[next]) return;
    component.classList.add('is-switching');
    flowHost.classList.add('is-switching');
    window.setTimeout(() => {
      currentFlow = next;
      selectedId = next === 'traffic' ? 'eks' : 'argocd';
      tabs.forEach(tab => {
        const active = tab.dataset.eksArchTab === next;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderFlow(next);
      component.classList.remove('is-switching');
      flowHost.classList.remove('is-switching');
      activateEntrance();
    }, 170);
  };

  tabs.forEach(tab => tab.addEventListener('click', () => switchFlow(tab.dataset.eksArchTab)));

  const setExpanded = expanded => {
    component.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('eks-architecture-modal-open', expanded);
    if (expand) {
      expand.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      expand.innerHTML = expanded ? 'Close <span aria-hidden="true">×</span>' : 'Expand <span aria-hidden="true">↗</span>';
    }
  };

  expand?.addEventListener('click', () => setExpanded(!component.classList.contains('is-expanded')));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && component.classList.contains('is-expanded')) setExpanded(false);
  });

  renderFlow(currentFlow, true);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      activateEntrance();
      observer.disconnect();
    }, { threshold:.24 });
    observer.observe(component);
  } else {
    activateEntrance();
  }
})();
