(() => {
  if (document.body?.dataset.page !== 'lab') return;

  const bar = document.querySelector('.lab-page .filter-bar');
  const cards = [...document.querySelectorAll('.lab-topic-card[data-category]')];
  if (!bar || !cards.length) return;

  const buttons = [...bar.querySelectorAll('.filter[data-filter]')];

  const applyFilter = (filter) => {
    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
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
