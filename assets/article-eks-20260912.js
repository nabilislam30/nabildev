(() => {
  const sections = [...document.querySelectorAll('[data-article-section]')];
  const links = [...document.querySelectorAll('[data-article-toc-link]')];
  const progress = document.querySelector('[data-article-toc-progress]');
  if (sections.length && links.length) {
    const setActive = (id) => {
      const index = sections.findIndex(section => section.id === id);
      links.forEach(link => link.setAttribute('aria-current', link.getAttribute('href') === `#${id}` ? 'true' : 'false'));
      if (progress && index >= 0) progress.style.setProperty('--toc-progress', `${((index + 1) / sections.length) * 100}%`);
      if (progress && index >= 0) progress.style.height = `${((index + 1) / sections.length) * 100}%`;
      links[index]?.scrollIntoView({block:'nearest', inline:'nearest'});
    };
    setActive(sections[0].id);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActive(visible[0].target.id);
      }, {rootMargin:'-24% 0px -64% 0px', threshold:0});
      sections.forEach(section => observer.observe(section));
    }
  }

  document.querySelectorAll('[data-copy-code]').forEach(button => {
    button.addEventListener('click', async () => {
      const code = button.closest('.article-code')?.querySelector('code')?.textContent || '';
      try {
        await navigator.clipboard.writeText(code);
        const old = button.textContent;
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = old; }, 1100);
      } catch (_) {
        button.textContent = 'Select';
      }
    });
  });
})();
