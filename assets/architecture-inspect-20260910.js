(() => {
  const containers = [...document.querySelectorAll('.architecture-lab, .project-mini-architecture, .case-architecture')];
  if (!containers.length) return;

  containers.forEach(container => {
    const nodes = [...container.querySelectorAll('[data-arch-info]')];
    if (!nodes.length) return;

    const tooltip = container.querySelector('[data-arch-tooltip]');
    const defaultText = tooltip?.textContent || '';
    let pinned = null;

    const render = node => {
      if (tooltip && node?.dataset.archInfo) tooltip.textContent = node.dataset.archInfo;
    };

    const restore = () => {
      if (pinned) render(pinned);
      else if (tooltip) tooltip.textContent = defaultText;
    };

    const pin = node => {
      if (pinned === node) {
        node.classList.remove('arch-node-selected');
        node.setAttribute('aria-pressed', 'false');
        pinned = null;
        restore();
        return;
      }

      nodes.forEach(item => {
        item.classList.remove('arch-node-selected');
        item.setAttribute('aria-pressed', 'false');
      });

      pinned = node;
      node.classList.add('arch-node-selected');
      node.setAttribute('aria-pressed', 'true');
      render(node);
    };

    nodes.forEach(node => {
      if (!['BUTTON', 'A'].includes(node.tagName)) {
        node.setAttribute('role', 'button');
        node.tabIndex = 0;
      }
      node.setAttribute('aria-pressed', 'false');

      node.addEventListener('click', () => pin(node));
      node.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          pin(node);
        }
      });
      node.addEventListener('mouseenter', () => render(node));
      node.addEventListener('focus', () => render(node));
      node.addEventListener('mouseleave', restore);
      node.addEventListener('blur', restore);
    });
  });
})();
