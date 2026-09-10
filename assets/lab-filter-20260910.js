(() => {
  if (document.body?.dataset.page !== 'lab') return;

  const bar = document.querySelector('.lab-page .filter-bar');
  const cards = [...document.querySelectorAll('.lab-topic-card[data-category]')];
  const heading = document.querySelector('[data-lab-active-heading]');
  if (!bar || !cards.length || !heading) return;

  const buttons = [...bar.querySelectorAll('.filter[data-filter]')];
  const labels = {
    workloads: 'Workloads & Configuration',
    networking: 'Networking & Access',
    security: 'Security & Policy',
    operations: 'Operations'
  };

  const applyFilter = (filter) => {
    document.body.dataset.labFilter = filter;

    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const showHeading = filter !== 'all' && Boolean(labels[filter]);
    heading.hidden = !showHeading;
    heading.textContent = showHeading ? labels[filter] : '';

    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
      const match = filter === 'all' || categories.includes(filter);
      card.hidden = !match;
      card.classList.toggle('filtered-out', !match);
      card.setAttribute('aria-hidden', String(!match));
      if (match) card.classList.add('visible');
    });
  };

  bar.addEventListener('click', (event) => {
    const button = event.target.closest('.filter[data-filter]');
    if (!button || !bar.contains(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    applyFilter(button.dataset.filter || 'all');
  }, true);

  applyFilter('all');
})();
