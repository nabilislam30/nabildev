(() => {
  const sections = [...document.querySelectorAll('[data-article-section]')];
  const links = [...document.querySelectorAll('[data-article-toc-link]')];
  const progress = document.querySelector('[data-article-toc-progress]');

  const setActive = (id) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index < 0) return;
    links.forEach((link) => {
      link.setAttribute('aria-current', link.getAttribute('href') === `#${id}` ? 'true' : 'false');
    });
    if (progress) {
      const amount = `${((index + 1) / sections.length) * 100}%`;
      progress.style.setProperty('--toc-progress', amount);
      progress.style.height = amount;
    }
  };

  if (sections.length && links.length) {
    let ticking = false;
    const updateFromScroll = () => {
      ticking = false;
      const marker = Math.min(window.innerHeight * 0.28, 230);
      let current = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section;
        else break;
      }
      setActive(current.id);
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateFromScroll);
      }
    };

    setActive(sections[0].id);
    updateFromScroll();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = link.getAttribute('href')?.slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
        setActive(id);
      });
    });
  }

  document.querySelectorAll('[data-copy-code]').forEach((button) => {
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
