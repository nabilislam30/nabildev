(() => {
  const hero = document.querySelector('.case-hero');
  const main = document.querySelector('main');
  if (!hero || !main) return;

  const numbered = [...main.querySelectorAll('.case-section .kicker')].filter(el => /^\s*\d{2}\s*[—-]/.test(el.textContent || ''));
  const items = [];
  const seen = new Set();

  numbered.forEach((marker, index) => {
    const text = (marker.textContent || '').trim();
    const match = text.match(/^(\d{2})\s*[—-]\s*(.+)$/);
    if (!match) return;

    let label = match[2].trim();
    if (/^challenge$/i.test(label)) label = 'Overview';

    let target = marker.parentElement;
    if (!target || target === main) target = marker.closest('.case-section');
    if (!target) return;

    const key = `${match[1]}-${label}`;
    if (seen.has(key)) return;
    seen.add(key);

    const id = `case-section-${match[1]}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    target.id = target.id || id;
    items.push({ number: match[1], label, target });
  });

  const outcome = main.querySelector('.case-outcome-panel');
  if (outcome && !items.some(item => /^outcome$/i.test(item.label))) {
    outcome.id = outcome.id || 'case-section-outcome';
    items.push({ number: String(items.length + 1).padStart(2, '0'), label: 'Outcome', target: outcome });
  }

  if (items.length < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'case-study-nav';
  nav.setAttribute('aria-label', 'Case study sections');
  const inner = document.createElement('div');
  inner.className = 'case-study-nav-inner';

  const links = items.map((item, index) => {
    const link = document.createElement('a');
    link.href = `#${item.target.id}`;
    link.textContent = `${item.number} ${item.label}`;
    link.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    inner.appendChild(link);
    return link;
  });

  nav.appendChild(inner);
  hero.insertAdjacentElement('afterend', nav);

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
    if (!visible.length) return;

    const index = items.findIndex(item => item.target === visible[0].target);
    if (index < 0) return;

    links.forEach((link, i) => link.setAttribute('aria-current', i === index ? 'true' : 'false'));
    links[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

  items.forEach(item => observer.observe(item.target));
})();
