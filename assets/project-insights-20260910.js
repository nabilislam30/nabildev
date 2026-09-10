(() => {
  const root = document.querySelector('[data-project-insights]');
  if (!root) return;

  const track = root.querySelector('[data-insights-track]');
  const cards = [...root.querySelectorAll('[data-insight-card]')];
  const prev = root.querySelector('[data-insights-prev]');
  const next = root.querySelector('[data-insights-next]');
  const progress = root.querySelector('[data-insights-progress]');
  const currentLabel = root.querySelector('[data-insights-current]');
  if (!track || !cards.length || !prev || !next) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let frame = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const update = (index) => {
    activeIndex = clamp(index, 0, cards.length - 1);
    prev.disabled = activeIndex === 0;
    next.disabled = activeIndex === cards.length - 1;
    prev.setAttribute('aria-disabled', String(prev.disabled));
    next.setAttribute('aria-disabled', String(next.disabled));
    if (progress) progress.style.transform = `translateX(${activeIndex * 100}%)`;
    if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  const nearestIndex = () => {
    const left = track.scrollLeft;
    let best = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const delta = Math.abs(card.offsetLeft - left);
      if (delta < distance) {
        distance = delta;
        best = index;
      }
    });
    return best;
  };

  const goTo = (index) => {
    const target = clamp(index, 0, cards.length - 1);
    track.scrollTo({
      left: cards[target].offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
    update(target);
  };

  prev.addEventListener('click', () => goTo(activeIndex - 1));
  next.addEventListener('click', () => goTo(activeIndex + 1));

  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(nearestIndex()));
  }, { passive: true });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
  });

  window.addEventListener('resize', () => update(nearestIndex()), { passive: true });
  update(0);
})();
