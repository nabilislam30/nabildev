(() => {
  const isTouchNavigation = window.matchMedia('(pointer:coarse)').matches || window.matchMedia('(max-width:820px)').matches;

  // On touch/mobile, bypass the existing animated link interception and leave
  // navigation/history to the browser. stopPropagation does not cancel the
  // anchor's native default action, but prevents the later target listener from
  // replacing it with the 130ms JavaScript transition.
  if (isTouchNavigation) {
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || /^https?:/i.test(href)) return;
      event.stopPropagation();
    }, true);
  }

  // ------------------------------
  // Pagefind site search
  // ------------------------------
  const navActions = document.querySelector('.nav-actions');
  let pagefindPromise;

  const createSearchUi = () => {
    if (!navActions || document.querySelector('[data-site-search-trigger]')) return;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'site-search-trigger';
    trigger.setAttribute('data-site-search-trigger', '');
    trigger.setAttribute('aria-label', 'Search projects and articles');
    trigger.title = 'Search projects and articles';
    trigger.innerHTML = '<span aria-hidden="true">⌕</span>';

    const commandTrigger = navActions.querySelector('.command-trigger');
    navActions.insertBefore(trigger, commandTrigger || navActions.firstChild);

    const backdrop = document.createElement('div');
    backdrop.className = 'site-search-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML = `
      <div class="site-search-panel" role="dialog" aria-modal="true" aria-label="Search nabildev.com">
        <div class="site-search-input-row">
          <span class="site-search-prompt" aria-hidden="true">&gt;_</span>
          <input class="site-search-input" type="search" autocomplete="off" placeholder="Search Terraform, Kubernetes, Docker…" aria-label="Search projects and articles">
          <button class="site-search-close" type="button" aria-label="Close search">Esc</button>
        </div>
        <div class="site-search-status" aria-live="polite">Search projects, case studies and articles.</div>
        <div class="site-search-results"></div>
      </div>`;
    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('.site-search-input');
    const results = backdrop.querySelector('.site-search-results');
    const status = backdrop.querySelector('.site-search-status');
    const closeButton = backdrop.querySelector('.site-search-close');
    let searchTimer = 0;

    const loadPagefind = () => {
      if (!pagefindPromise) {
        pagefindPromise = import('/pagefind/pagefind.js').then(async (pagefind) => {
          await pagefind.init();
          return pagefind;
        });
      }
      return pagefindPromise;
    };

    const close = () => {
      backdrop.hidden = true;
      input.value = '';
      results.replaceChildren();
      status.textContent = 'Search projects, case studies and articles.';
      trigger.focus();
    };

    const open = async () => {
      backdrop.hidden = false;
      requestAnimationFrame(() => input.focus());
      try {
        await loadPagefind();
      } catch (error) {
        status.textContent = 'Search is unavailable until the Pagefind build has completed.';
      }
    };

    const renderResults = async (term) => {
      const query = term.trim();
      results.replaceChildren();
      if (query.length < 2) {
        status.textContent = 'Type at least two characters to search.';
        return;
      }

      status.textContent = 'Searching…';
      try {
        const pagefind = await loadPagefind();
        const response = await pagefind.search(query);
        const loaded = await Promise.all(response.results.slice(0, 7).map((result) => result.data()));

        if (!loaded.length) {
          status.textContent = `No results for “${query}”.`;
          return;
        }

        status.textContent = `${response.results.length} result${response.results.length === 1 ? '' : 's'} for “${query}”.`;
        loaded.forEach((data) => {
          const link = document.createElement('a');
          link.className = 'site-search-result';
          link.href = data.url;

          const type = data.url.includes('/projects/') ? 'Project' : data.url.includes('articles') ? 'Articles' : 'Page';
          const typeEl = document.createElement('small');
          typeEl.textContent = type;
          const title = document.createElement('strong');
          title.textContent = data.meta?.title || data.url;
          const excerpt = document.createElement('span');
          excerpt.textContent = data.plain_excerpt || '';

          link.append(typeEl, title, excerpt);
          results.appendChild(link);
        });
      } catch (error) {
        status.textContent = 'Search could not load. Refresh once the latest deployment is complete.';
      }
    };

    trigger.addEventListener('click', open);
    closeButton.addEventListener('click', close);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) close();
    });
    input.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => renderResults(input.value), 180);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !backdrop.hidden) close();
      if (event.key === '/' && backdrop.hidden && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) {
        event.preventDefault();
        open();
      }
    });
    window.addEventListener('pageshow', () => {
      backdrop.hidden = true;
    });
  };

  createSearchUi();

  // ------------------------------
  // Project-specific reproducible snippets
  // ------------------------------
  const projectSnippets = {
    '/projects/terraform-wordpress.html': {
      kicker: 'Reproduce this project',
      title: 'Clone and deploy the learning environment.',
      note: 'Requires Terraform and authenticated AWS credentials. Review the Terraform plan before applying infrastructure in your own account.',
      commands: [
        'git clone https://github.com/nabilislam30/Wordpress-Deployment-with-Terraform.git',
        'cd Wordpress-Deployment-with-Terraform',
        'terraform init',
        'terraform plan',
        'terraform apply'
      ]
    },
    '/projects/redis-counter.html': {
      kicker: 'Reproduce this project',
      title: 'Clone and run the multi-container stack.',
      note: 'Requires Docker with Docker Compose. The final command confirms that the counter endpoint is responding locally.',
      commands: [
        'git clone https://github.com/nabilislam30/redis-counter-app.git',
        'cd redis-counter-app',
        'docker compose up -d',
        'docker compose up -d --scale web=3',
        'curl http://localhost:5050/count'
      ]
    },
    '/projects/kubernetes-eks.html': {
      kicker: 'Useful lab commands',
      title: 'Reconnect to the EKS learning cluster and inspect it.',
      note: 'These commands reconnect kubectl to the existing learning cluster and inspect resources; they do not provision the EKS cluster itself.',
      commands: [
        'aws eks update-kubeconfig --region eu-west-2 --name nabil-eks-cluster',
        'kubectl get nodes',
        'kubectl get pods -A',
        'kubectl get svc -A'
      ]
    },
    '/projects/ci-cd-pipeline.html': {
      kicker: 'Pipeline snippet',
      title: 'Validate Terraform and save the reviewed plan.',
      note: 'This mirrors the validation and planning stage described above. The approved pipeline applies the saved tfplan artifact rather than generating a new plan at apply time.',
      commands: [
        'terraform fmt -check -recursive',
        'terraform init',
        'terraform validate',
        'terraform plan -out=tfplan'
      ]
    }
  };

  const config = projectSnippets[window.location.pathname];
  const implementationContainer = document.querySelector('.case-section.alt .container');
  if (config && implementationContainer && !document.querySelector('[data-project-snippet]')) {
    const card = document.createElement('div');
    card.className = 'project-reproduce card reveal visible';
    card.setAttribute('data-project-snippet', '');

    const heading = document.createElement('div');
    heading.className = 'project-reproduce-head';
    heading.innerHTML = `<div><span class="kicker">${config.kicker}</span><h3>${config.title}</h3><p>${config.note}</p></div>`;

    const snippet = document.createElement('div');
    snippet.className = 'project-snippet';
    const bar = document.createElement('div');
    bar.className = 'project-snippet-bar';
    bar.innerHTML = '<span>shell</span>';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'project-copy-button';
    copy.textContent = 'Copy commands';
    copy.setAttribute('aria-label', `Copy commands for ${config.title}`);
    bar.appendChild(copy);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = config.commands.join('\n');
    pre.appendChild(code);
    snippet.append(bar, pre);
    card.append(heading, snippet);
    implementationContainer.appendChild(card);

    copy.addEventListener('click', async () => {
      const text = config.commands.join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      copy.textContent = 'Copied ✓';
      copy.classList.add('copied');
      window.setTimeout(() => {
        copy.textContent = 'Copy commands';
        copy.classList.remove('copied');
      }, 1500);
    });
  }
})();
