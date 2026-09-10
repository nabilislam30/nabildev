(() => {
  const root = document.querySelector('body[data-case="eks"]');
  if (!root) return;

  // Deployment-flow signal: one pass when the new panel enters the viewport.
  const deployment = root.querySelector('.eks-deployment-flow');
  if (deployment) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      deployment.classList.add('is-visible');
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          deployment.classList.add('is-visible');
          observer.unobserve(deployment);
        });
      }, { threshold: 0.32 });
      observer.observe(deployment);
    } else {
      deployment.classList.add('is-visible');
    }
  }

  // Engineering decisions: compact accordion rows.
  root.querySelectorAll('.eks-decision-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.eks-decision');
      if (!item) return;
      const open = !item.classList.contains('open');
      item.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    });
  });

  // Engineering evidence: closed by default so it adds no unused vertical space.
  const evidence = root.querySelector('.eks-evidence-wrap');
  if (evidence) {
    const toggle = evidence.querySelector('.eks-evidence-toggle');
    toggle?.addEventListener('click', () => {
      const open = !evidence.classList.contains('open');
      evidence.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    const tabs = [...evidence.querySelectorAll('.eks-evidence-tab')];
    const panes = [...evidence.querySelectorAll('.eks-evidence-pane')];

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.evidenceTab;
        tabs.forEach((candidate) => {
          const active = candidate === tab;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-selected', String(active));
          candidate.tabIndex = active ? 0 : -1;
        });
        panes.forEach((pane) => {
          pane.classList.toggle('active', pane.dataset.evidencePane === target);
        });
      });
    });
  }

  // EKS case-study motion polish. This only adds state classes; it does not
  // replace the existing reveal, architecture, terminal or navigation logic.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('eks-motion-enabled');

  const motionTargets = [];
  const register = (element, className) => {
    if (!element) return;
    if (className) element.classList.add(className);
    element.classList.add('eks-motion-watch');
    motionTargets.push(element);
  };

  register(root.querySelector('.eks-facts-grid'), 'eks-motion-facts');
  root.querySelectorAll('.case-steps').forEach((list) => register(list, 'eks-motion-list'));
  register(root.querySelector('.eks-evolution-grid'), 'eks-motion-evolution');
  register(root.querySelector('.project-terminal'), 'eks-motion-terminal');
  register(root.querySelector('.case-resolution-grid'), 'eks-motion-resolutions');
  register(root.querySelector('.case-outcome-panel'), 'eks-motion-outcome');

  // Give the hero a short entrance without changing layout or spacing.
  root.querySelector('.case-hero')?.classList.add('eks-hero-motion');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    motionTargets.forEach((target) => target.classList.add('is-inview'));
    return;
  }

  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview');
      motionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  motionTargets.forEach((target) => motionObserver.observe(target));
})();
