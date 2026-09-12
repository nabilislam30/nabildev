(() => {
  const sections = [...document.querySelectorAll('[data-article-section]')];
  const links = [...document.querySelectorAll('[data-article-toc-link]')];
  const progress = document.querySelector('[data-article-toc-progress]');

  if (sections.length && links.length) {
    const setActive = (id) => {
      const index = sections.findIndex(section => section.id === id);
      if (index < 0) return;

      links.forEach(link => {
        link.setAttribute('aria-current', link.getAttribute('href') === `#${id}` ? 'true' : 'false');
      });

      const amount = `${((index + 1) / sections.length) * 100}%`;
      if (progress) {
        progress.style.setProperty('--toc-progress', amount);
        progress.style.height = amount;
      }

      /* Deliberately do not scroll the TOC item into view here.
         The previous implementation did that on every observer update,
         which could move the document and force the reader back upward. */
    };

    setActive(sections[0].id);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        if (visible[0]) setActive(visible[0].target.id);
      }, {
        rootMargin: '-18% 0px -68% 0px',
        threshold: 0
      });

      sections.forEach(section => observer.observe(section));
    }

    links.forEach(link => {
      link.addEventListener('click', event => {
        const id = link.getAttribute('href')?.slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        history.replaceState(null, '', `#${id}`);
      });
    });
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
