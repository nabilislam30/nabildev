
(() => {
  const heroRoot = document.querySelector('.hero-system-design');
  if (heroRoot) {
    const stages = [
      {
        activeNode:0, returnPath:false,
        story:"The client initiates an HTTPS request.", status:"request initiated",
        mainTitle:"client / request",
        main:['$ curl -sS "$APP_URL/api/items" -o /tmp/response.json',"method: GET","path: /api/items","✓ request initiated"],
        leftTitle:"client context", left:["client: browser / mobile","scheme: HTTPS","target: $APP_HOST"],
        rightTitle:"dns resolution", right:["hostname: $APP_HOST","resolver: ready","state: queued"]
      },
      {
        activeNode:1, returnPath:false,
        story:"DNS resolves the application hostname to an IP address.", status:"dns resolved",
        mainTitle:"dns / resolution",
        main:['$ dig +short "$APP_HOST"',"203.0.113.10","TTL: 300","✓ hostname resolved"],
        leftTitle:"request context", left:["hostname: $APP_HOST","record: A / AAAA","resolver: recursive"],
        rightTitle:"network handshake", right:["target: 203.0.113.10","port: 443","state: queued"]
      },
      {
        activeNode:2, returnPath:false,
        story:"The client establishes TCP and negotiates a secure TLS session.", status:"tls established",
        mainTitle:"network / tcp + tls",
        main:['$ openssl s_client -connect "$APP_HOST:443" -servername "$APP_HOST" </dev/null',"Protocol  : TLSv1.3","Verify return code: 0 (ok)","✓ secure session established"],
        leftTitle:"dns result", left:["address: 203.0.113.10","transport: TCP","port: 443"],
        rightTitle:"application server", right:["connection: open","tls: verified","request: ready"]
      },
      {
        activeNode:3, returnPath:false,
        story:"The application server receives the request and executes the handler.", status:"request processed",
        mainTitle:"application / processing",
        main:["$ grep 'GET /api/items' /var/log/app/access.log | tail -1","GET /api/items 200","handler: items.list","✓ request processed"],
        leftTitle:"network context", left:["connection: established","tls: active","request: received"],
        rightTitle:"database query", right:["query: pending","pool: ready","state: queued"]
      },
      {
        activeNode:4, returnPath:false,
        story:"The application queries the database and receives the requested data.", status:"query complete",
        mainTitle:"database / query",
        main:['$ psql "$DATABASE_URL" -c "SELECT id, title FROM items LIMIT 1;"'," id | title"," 42 | Example item","✓ 1 row returned"],
        leftTitle:"application context", left:["handler: items.list","db connection: ready","query: issued"],
        rightTitle:"response path", right:["result: 1 row","serialization: ready","state: returning"]
      },
      {
        activeNode:0, returnPath:true,
        story:"The HTTP response returns to the client.", status:"response received",
        mainTitle:"client / response",
        main:['$ curl -sS -D - "$APP_URL/api/items" -o /dev/null',"HTTP/2 200","content-type: application/json","✓ response received"],
        leftTitle:"server result", left:["status: 200","payload: JSON","connection: reusable"],
        rightTitle:"cycle complete", right:["client: received","response: successful","state: complete"]
      }
    ];

    let current = 0;
    let paused = false;
    let typingToken = 0;

    const buttons = [...heroRoot.querySelectorAll('[data-hs-node-stage]')];
    const meter = [...heroRoot.querySelectorAll('[data-hs-meter] span')];
    const progress = heroRoot.querySelector('[data-hs-stage-progress]');
    const indexEl = heroRoot.querySelector('[data-hs-index]');
    const storyEl = heroRoot.querySelector('[data-hs-story]');
    const statusEl = heroRoot.querySelector('[data-hs-status]');
    const mainTitle = heroRoot.querySelector('[data-hs-main-title]');
    const mainBody = heroRoot.querySelector('[data-hs-main-body]');
    const leftTitle = heroRoot.querySelector('[data-hs-left-title]');
    const leftBody = heroRoot.querySelector('[data-hs-left-body]');
    const rightTitle = heroRoot.querySelector('[data-hs-right-title]');
    const rightBody = heroRoot.querySelector('[data-hs-right-body]');
    const pauseButton = heroRoot.querySelector('[data-hs-pause]');

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function typeLines(element, lines, token) {
      element.textContent = "";
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex];
        for (const char of line) {
          if (token !== typingToken) return;
          element.textContent += char;
          await sleep(7);
        }
        if (lineIndex < lines.length - 1) element.textContent += "\n";
        await sleep(40);
      }
      if (token === typingToken) {
        const cursor = document.createElement('span');
        cursor.className = 'hs-cursor';
        element.appendChild(cursor);
      }
    }

    function updateRail(stage) {
      buttons.forEach((button, index) => {
        button.classList.toggle('active', index === stage.activeNode);
        button.classList.toggle('passed', !stage.returnPath && index < stage.activeNode);
      });
      progress.style.width = stage.returnPath ? "0%" : (82 * (stage.activeNode / 4)) + "%";
    }

    async function render(index) {
      current = index;
      typingToken += 1;
      const token = typingToken;
      const stage = stages[index];

      updateRail(stage);
      indexEl.textContent = String(index + 1).padStart(2, '0') + " / 06";
      storyEl.textContent = stage.story;
      statusEl.textContent = stage.status;
      mainTitle.textContent = stage.mainTitle;
      leftTitle.textContent = stage.leftTitle;
      rightTitle.textContent = stage.rightTitle;
      leftBody.textContent = stage.left.join("\n");
      rightBody.textContent = stage.right.join("\n");

      meter.forEach((segment, meterIndex) => {
        segment.classList.remove('active', 'done');
        if (meterIndex < index) segment.classList.add('done');
        if (meterIndex === index) segment.classList.add('active');
      });

      await typeLines(mainBody, stage.main, token);
      if (token !== typingToken || paused) return;
      await sleep(110);
      if (token !== typingToken || paused) return;
      render((index + 1) % stages.length);
    }

    buttons.forEach((button, nodeIndex) => {
      button.addEventListener('click', () => {
        const stageIndex = stages.findIndex((stage) => !stage.returnPath && stage.activeNode === nodeIndex);
        if (stageIndex >= 0) render(stageIndex);
      });
    });

    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? '▶' : 'Ⅱ';
      pauseButton.setAttribute('aria-label', paused ? 'Resume request-cycle animation' : 'Pause request-cycle animation');
      if (!paused) {
        typingToken += 1;
        render(current);
      }
    });

    render(0);
  }

  const workflowRoot = document.querySelector('.home-workflow-section');
  if (workflowRoot) {
    const steps = [...workflowRoot.querySelectorAll('[data-home-workflow-stage]')];
    const nodes = [...workflowRoot.querySelectorAll('[data-home-flow-node]')];
    const progressPath = workflowRoot.querySelector('[data-home-flow-progress]');
    const basePath = workflowRoot.querySelector('[data-home-flow-base]');
    const packet = workflowRoot.querySelector('[data-home-flow-packet]');
    const stageName = workflowRoot.querySelector('[data-home-workflow-stage-name]');
    const count = workflowRoot.querySelector('[data-home-workflow-count]');
    const labels = ['PLAN','CODE','BUILD / CI','TEST','RELEASE / DEPLOY','OPERATE / MONITOR','FEEDBACK'];
    let active = -1;
    let ticking = false;

    function setStage(index) {
      if (index === active) return;
      active = index;
      steps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
      nodes.forEach((node, nodeIndex) => {
        node.classList.toggle('active', nodeIndex === index);
        node.classList.toggle('passed', nodeIndex < index);
      });

      stageName.textContent = labels[index];
      count.textContent = String(index + 1).padStart(2, '0') + ' / 07';
      const pct = index / (steps.length - 1);
      progressPath.style.strokeDashoffset = 1000 - (1000 * pct);

      try {
        const len = basePath.getTotalLength();
        const point = basePath.getPointAtLength(len * pct);
        packet.setAttribute('cx', point.x);
        packet.setAttribute('cy', point.y);
      } catch (_) {}
    }

    function update() {
      ticking = false;
      const target = innerHeight * .47;
      let best = 0;
      let distance = Infinity;

      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const nextDistance = Math.abs(center - target);
        if (nextDistance < distance) {
          distance = nextDistance;
          best = index;
        }
      });

      setStage(best);
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    addEventListener('scroll', requestUpdate, { passive:true });
    addEventListener('resize', requestUpdate, { passive:true });
    update();
  }
})();
