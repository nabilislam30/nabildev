(() => {
  if (document.body?.dataset.page !== 'home') return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Short system-awake opening cue. */
  const awake = document.querySelector('[data-home-system-awake]');
  if (awake) {
    if (reduceMotion) {
      awake.remove();
    } else {
      const label = awake.querySelector('[data-home-system-awake-text]');
      const bar = awake.querySelector('[data-home-system-awake-bar]');
      const states = [
        ['initialising grid','24%'],
        ['starting signal path','52%'],
        ['checking infrastructure','80%'],
        ['system ready','100%']
      ];
      let step = 0;
      const advance = () => {
        if (step >= states.length) {
          setTimeout(() => {
            awake.classList.add('done');
            setTimeout(() => awake.remove(), 320);
          }, 90);
          return;
        }
        label.textContent = states[step][0];
        bar.style.width = states[step][1];
        step += 1;
        setTimeout(advance, 125);
      };
      setTimeout(advance, 55);
    }
  }

  /* Add the four requested, domain-specific Lab sequences without changing card copy. */
  const labCards = [...document.querySelectorAll('#lab .lab-grid .lab-card')];
  const labStates = [
    ['Pending','Running','Ready'],
    ['Service','Ingress','DNS'],
    ['RBAC','Kyverno','Enforced'],
    ['Metrics','Alert','Healthy']
  ];

  labCards.slice(0,4).forEach((card,index) => {
    if (card.querySelector('.home-lab-motion')) return;
    const strip = document.createElement('div');
    strip.className = 'home-lab-motion';
    strip.setAttribute('aria-label', labStates[index].join(' to '));
    labStates[index].forEach(label => {
      const state = document.createElement('span');
      state.innerHTML = '<i></i><b>'+label+'</b>';
      strip.appendChild(state);
    });
    card.appendChild(strip);

    const states = [...strip.children];
    const run = () => {
      states.forEach(state => state.classList.remove('active','complete'));
      states.forEach((state,stateIndex) => {
        setTimeout(() => {
          states.slice(0,stateIndex).forEach(previous => {
            previous.classList.remove('active');
            previous.classList.add('complete');
          });
          state.classList.add('active');
        }, stateIndex * 360);
      });
      setTimeout(() => {
        states.forEach(state => {
          state.classList.remove('active');
          state.classList.add('complete');
        });
      }, (states.length * 360) + 160);
    };

    if (reduceMotion) {
      states.forEach(state => state.classList.add('complete'));
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      }, { threshold:.38 });
      observer.observe(card);
    } else {
      run();
    }
  });

  /* Continuous journey rail from Workflow heading to the Engineering Activity CTA. */
  const workflowHeading = document.querySelector('.workflow-section .section-head h2');
  const activityCta = document.querySelector('.writing-section .engineering-activity-card .engineering-activity-link');

  if (workflowHeading && activityCta) {
    const rail = document.createElement('div');
    rail.className = 'home-journey-rail';
    rail.setAttribute('aria-hidden','true');
    rail.innerHTML = '<span class="home-journey-track"><i class="home-journey-fill"><b class="home-journey-ball"></b></i></span>';
    document.body.appendChild(rail);

    const fill = rail.querySelector('.home-journey-fill');
    const ball = rail.querySelector('.home-journey-ball');
    const majorSections = [
      document.querySelector('.workflow-section'),
      document.querySelector('.evidence-section'),
      document.querySelector('#lab'),
      document.querySelector('.writing-section')
    ].filter(Boolean);

    let geometry = null;
    let ticking = false;
    let lastProgress = 0;
    let lastBoundary = -1;
    let finalPulsed = false;

    function pulse(type) {
      if (reduceMotion) return;
      ball.classList.remove('section-pulse','final-pulse');
      void ball.offsetWidth;
      ball.classList.add(type);
      setTimeout(
        () => ball.classList.remove(type),
        type === 'final-pulse' ? 820 : 560
      );
    }

    function measure() {
      const headingRect = workflowHeading.getBoundingClientRect();
      const ctaRect = activityCta.getBoundingClientRect();
      const container = workflowHeading.closest('.container') || workflowHeading.parentElement;
      const containerRect = container.getBoundingClientRect();

      const startY = scrollY + headingRect.top + Math.min(headingRect.height * .5, 28);
      const endY = scrollY + ctaRect.top + (ctaRect.height / 2);
      const x = innerWidth <= 820
        ? 8
        : innerWidth <= 1100
          ? Math.max(10, containerRect.left - 40)
          : Math.max(14, containerRect.left - 48);

      rail.style.left = x + 'px';
      rail.style.top = startY + 'px';
      rail.style.height = Math.max(0, endY - startY) + 'px';

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const startScroll = Math.max(0, startY - (innerHeight * .46));
      const desiredEnd = endY - (innerHeight * .72);
      const endScroll = Math.min(maxScroll, Math.max(startScroll + 1, desiredEnd));

      const boundaries = majorSections.map(section => {
        const rect = section.getBoundingClientRect();
        const sectionY = scrollY + rect.top + (rect.height * .18);
        return Math.max(0, Math.min(1, (sectionY - startY) / Math.max(1, endY - startY)));
      });

      geometry = { startScroll, endScroll, boundaries };
      update();
    }

    function update() {
      ticking = false;
      if (!geometry) return;

      const raw = (scrollY - geometry.startScroll) / Math.max(1, geometry.endScroll - geometry.startScroll);
      const progress = Math.max(0, Math.min(1, raw));

      fill.style.height = (progress * 100) + '%';
      ball.style.top = (progress * rail.clientHeight) + 'px';
      ball.style.opacity = scrollY < geometry.startScroll ? '0' : '1';

      let crossed = -1;
      geometry.boundaries.forEach((threshold,index) => {
        if (
          (lastProgress < threshold && progress >= threshold) ||
          (lastProgress > threshold && progress <= threshold)
        ) crossed = index;
      });

      if (crossed !== -1 && crossed !== lastBoundary) {
        lastBoundary = crossed;
        pulse('section-pulse');
      }

      if (progress >= .999) {
        fill.style.height = '100%';
        ball.style.top = rail.clientHeight + 'px';
        ball.style.opacity = '1';

        if (!finalPulsed) {
          finalPulsed = true;
          pulse('final-pulse');
        }
      } else {
        finalPulsed = false;
      }

      lastProgress = progress;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    addEventListener('scroll', requestUpdate, { passive:true });
    addEventListener('resize', () => requestAnimationFrame(measure), { passive:true });
    addEventListener('load', () => requestAnimationFrame(measure), { once:true });
    requestAnimationFrame(measure);
    setTimeout(measure, 300);
  }
})();