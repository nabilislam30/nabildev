(() => {
  const root = document.querySelector('body[data-case-style="enhanced"]');
  if (!root) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
          const preferred = nodes.find(node => node.dataset.default === 'true') || nodes[0];
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
    root.querySelectorAll(selector).forEach(element => {
      element.classList.add(className, 'case-motion-watch');
    });
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
