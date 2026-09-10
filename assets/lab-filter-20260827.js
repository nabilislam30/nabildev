(() => {
  if (document.body?.dataset.page !== 'lab') return;

  const bar = document.querySelector('.lab-page .filter-bar');
  const cards = [...document.querySelectorAll('.lab-topic-card[data-category]')];
  const groups = [...document.querySelectorAll('.lab-topic-group[data-group]')];
  if (!bar || !cards.length || !groups.length) return;

  const buttons = [...bar.querySelectorAll('.filter[data-filter]')];

  // The All tab is a single continuous grid. Preserve numerical module order
  // even though the source remains grouped for the category-specific views.
  cards.forEach((card) => {
    const number = Number(card.querySelector('.lab-topic-no')?.textContent || '');
    if (Number.isFinite(number)) card.style.order = String(number);
  });

  const applyFilter = (filter) => {
    document.body.classList.toggle('lab-filtered-view', filter !== 'all');

    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    groups.forEach((group) => {
      const match = filter === 'all' || group.dataset.group === filter;
      group.hidden = !match;
      group.setAttribute('aria-hidden', String(!match));
    });

    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
      const match = filter === 'all' || categories.includes(filter);

      card.hidden = !match;
      card.style.display = match ? '' : 'none';
      card.classList.toggle('filtered-out', !match);
      card.setAttribute('aria-hidden', String(!match));

      if (match) card.classList.add('visible');
    });
  };

  // Capture Lab clicks before the generic Projects filter handler.
  bar.addEventListener('click', (event) => {
    const button = event.target.closest('.filter[data-filter]');
    if (!button || !bar.contains(button)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    applyFilter(button.dataset.filter || 'all');
  }, true);

  applyFilter('all');
})();
