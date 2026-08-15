
(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Mobile navigation
  const menu = $('.menu');
  const links = $('.nav-links');
  menu?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    links?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal animation
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    }), { threshold: .1 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('visible'));
  }

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Compact navigation and progress line
  const nav = $('[data-nav]');
  const progress = $('.scroll-progress span');
  const updateScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 32);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  updateScroll();
  addEventListener('scroll', updateScroll, { passive: true });

  // Pointer glow and card highlight
  const glow = $('.cursor-glow');
  addEventListener('pointermove', e => {
    if (glow) {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }
    const card = e.target.closest('.card');
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--card-x', `${e.clientX-r.left}px`);
      card.style.setProperty('--card-y', `${e.clientY-r.top}px`);
    }
  }, { passive: true });

  // Gentle card tilt
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (matchMedia('(pointer:coarse)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY-r.top)/r.height-.5)*-2.2;
      const ry = ((e.clientX-r.left)/r.width-.5)*2.2;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });

  // Theme toggle
  const themeButton = $('.theme-toggle');
  const themeIcon = $('.theme-toggle .theme-icon');

  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.documentElement.dataset.theme = 'light';
      themeButton?.setAttribute('aria-label', 'Switch to dark mode');
      if (themeIcon) themeIcon.textContent = '☀';
    } else {
      delete document.documentElement.dataset.theme;
      themeButton?.setAttribute('aria-label', 'Switch to light mode');
      if (themeIcon) themeIcon.textContent = '☾';
    }
  };

  const savedTheme = localStorage.getItem('nabil-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
  } else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  themeButton?.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('nabil-theme', next);
  });

  // Project filters
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    $$('.project-card[data-category]').forEach(card => {
      const show = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('filtered-out', !show);
    });
  }));

  // Command palette
  const backdrop = $('[data-command-backdrop]');
  const input = $('[data-command-input]');
  const trigger = $('.command-trigger');
  const items = $$('[data-command-item]');
  const openPalette = () => {
    if (!backdrop) return;
    backdrop.hidden = false;
    input.value = '';
    items.forEach(i => i.hidden = false);
    setTimeout(() => input.focus(), 0);
  };
  const closePalette = () => {
    if (!backdrop) return;
    backdrop.hidden = true;
    trigger?.focus();
  };
  trigger?.addEventListener('click', openPalette);
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) closePalette(); });
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      backdrop?.hidden ? openPalette() : closePalette();
    }
    if (e.key === 'Escape' && backdrop && !backdrop.hidden) closePalette();
  });
  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    items.forEach(item => item.hidden = !item.textContent.toLowerCase().includes(q));
  });

  // Internal page transition
  $$('a[href]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || href.startsWith('mailto:') || href.startsWith('http')) return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => location.href = href, 150);
  }));
})();

document.querySelectorAll('[data-arch-info]').forEach(node => {
  const lab = node.closest('.architecture-lab');
  const tooltip = lab && lab.querySelector('[data-arch-tooltip]');
  const show = () => { if (tooltip) tooltip.textContent = node.dataset.archInfo; };
  node.addEventListener('mouseenter', show);
  node.addEventListener('focus', show);
});
const journey = document.querySelector('[data-journey]');
if (journey && 'IntersectionObserver' in window) {
  const jo = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { journey.classList.add('active'); jo.disconnect(); }
  }), { threshold: .3 });
  jo.observe(journey);
}

// V12 — purposeful engineering animation controllers
(() => {
  // Scroll-linked journey — V13 smooth controller
  const journeyRoot = document.querySelector('[data-scroll-journey]');
  if (journeyRoot) {
    const navItems = [...journeyRoot.querySelectorAll('[data-journey-nav]')];
    const panels = [...journeyRoot.querySelectorAll('[data-journey-panel]')];
    const progress = journeyRoot.querySelector('[data-journey-progress]');
    let ticking = false;
    let activeIndex = -1;

    const setActiveJourneyItem = (index, continuousProgress) => {
      if (index !== activeIndex) {
        activeIndex = index;
        navItems.forEach((item, i) => item.classList.toggle('active', i === index));
        panels.forEach((panel, i) => panel.classList.toggle('active', i === index));
      }

      navItems.forEach((item, i) => {
        const dotPosition = navItems.length > 1 ? i / (navItems.length - 1) : 0;
        item.classList.toggle('passed', dotPosition < continuousProgress - 0.015);
      });

      if (progress) {
        progress.style.transform = `scaleY(${Math.max(0, Math.min(1, continuousProgress))})`;
      }
    };

    const updateJourney = () => {
      ticking = false;

      const viewportAnchor = innerHeight * 0.44;
      const rootRect = journeyRoot.getBoundingClientRect();

      // Continuous fill is based on the full journey section moving through the viewport.
      const start = viewportAnchor;
      const total = Math.max(1, rootRect.height - innerHeight * 0.34);
      const travelled = start - rootRect.top;
      const continuousProgress = Math.max(0, Math.min(1, travelled / total));

      // Pick whichever content panel is closest to the reading position.
      let closestIndex = 0;
      let closestDistance = Infinity;
      panels.forEach((panel, i) => {
        const rect = panel.getBoundingClientRect();
        const panelAnchor = rect.top + Math.min(rect.height * 0.38, 105);
        const distance = Math.abs(panelAnchor - viewportAnchor);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      // Before/after the section, lock cleanly to first/last item.
      if (rootRect.top > viewportAnchor) closestIndex = 0;
      if (rootRect.bottom < viewportAnchor + 80) closestIndex = panels.length - 1;

      setActiveJourneyItem(closestIndex, continuousProgress);
    };

    const requestJourneyUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateJourney);
      }
    };

    navItems.forEach(item => item.addEventListener('click', () => {
      const index = Number(item.dataset.journeyNav);
      const panel = panels[index];
      if (!panel) return;
      const navOffset = 118;
      const y = panel.getBoundingClientRect().top + scrollY - navOffset;
      scrollTo({ top: y, behavior: 'smooth' });
    }));

    addEventListener('scroll', requestJourneyUpdate, { passive: true });
    addEventListener('resize', requestJourneyUpdate, { passive: true });
    updateJourney();
  }

  // Architecture flow starts only when diagram enters view
  const flowTargets = [...document.querySelectorAll('[data-architecture-flow], [data-project-flow]')];
  if (flowTargets.length && 'IntersectionObserver' in window) {
    const flowObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('flow-active');
        else entry.target.classList.remove('flow-active');
      });
    }, { threshold: .35 });
    flowTargets.forEach(el => flowObserver.observe(el));
  }

  // One-time terminal typing
  const terminals = [...document.querySelectorAll('[data-terminal-once]')];
  const typeTerminal = async (terminal) => {
    if (terminal.dataset.typed === 'true') return;
    terminal.dataset.typed = 'true';
    const output = terminal.querySelector('[data-terminal-output]');
    if (!output) return;

    let lines = [];
    try { lines = JSON.parse(terminal.dataset.terminalLines || '[]'); } catch (_) {}
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      for (let i = 0; i < line.length; i++) {
        output.textContent += line[i];
        await sleep(line.startsWith('✓') ? 22 : 28 + Math.random() * 20);
      }
      if (lineIndex < lines.length - 1) output.textContent += '\n';
      await sleep(line.startsWith('$') ? 360 : 200);
    }
    terminal.classList.add('terminal-complete');
  };

  if (terminals.length && 'IntersectionObserver' in window) {
    const terminalObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeTerminal(entry.target);
          terminalObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .5 });
    terminals.forEach(t => terminalObserver.observe(t));
  }
})();
