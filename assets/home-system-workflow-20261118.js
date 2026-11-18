
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


(() => {
  const workflowStory = document.querySelector('[data-workflow-story]');
  if (!workflowStory) return;

  const workflowData = [
    {label:"01 · PLAN",title:"Plan",copy:"Define what needs to change and agree the engineering direction before implementation begins.",points:["Clarify requirements and priorities","Shape the technical approach","Turn the idea into a defined change"],next:"Code & Version Control"},
    {label:"02 · CODE & VERSION CONTROL",title:"Code & Version Control",copy:"Write the change, review it and keep the work traceable in version control.",points:["Create application or infrastructure changes","Review pull requests and commit history","Keep code and IaC versioned"],next:"Build & Continuous Integration"},
    {label:"03 · BUILD & CI",title:"Build & Continuous Integration",copy:"Continuous integration validates the change and produces something ready to progress.",points:["Run automated pipeline checks","Build and package artifacts","Validate infrastructure and configuration"],next:"Test"},
    {label:"04 · TEST",title:"Test",copy:"Automated checks provide evidence that the change is safe enough to release.",points:["Run functional and integration checks","Scan code, images and configuration","Stop failed changes before release"],next:"Release & Deploy"},
    {label:"05 · RELEASE & DEPLOY",title:"Release & Deploy",copy:"Promote the approved change into an environment through automated delivery.",points:["Promote a reviewed build","Apply infrastructure changes when required","Verify rollout and deployment health"],next:"Operate & Monitor"},
    {label:"06 · OPERATE & MONITOR",title:"Operate & Monitor",copy:"Observe the live system, respond to operational signals and feed what you learn back into the next planning cycle.",points:["Track metrics, logs, health and alerts","Scale and troubleshoot live workloads","Use incidents and operational evidence to shape the next change"],next:"Plan"}
  ];

  const incidentData = {
    label:"INCIDENT · RECOVERY",
    title:"Service health degraded",
    copy:"Monitoring detects a problem in the live environment. The priority shifts from delivery to restoring service safely.",
    points:["Alert triggered from live health signals","Investigate the affected service and isolate the fault","Recover the service, verify health and feed the lesson into planning"],
    next:"Plan"
  };

  const workflowNodes=[...document.querySelectorAll('[data-workflow-node]')];
  const workflowLive=document.querySelector('[data-route-live]');
  const workflowBase=document.querySelector('[data-route-base]');
  const workflowPacket=document.querySelector('[data-route-packet]');
  const workflowCount=document.querySelector('[data-workflow-count]');
  const detailIndex=document.querySelector('[data-detail-index]');
  const detailTitle=document.querySelector('[data-detail-title]');
  const detailCopy=document.querySelector('[data-detail-copy]');
  const detailPoints=document.querySelector('[data-detail-points]');
  const detailConnects=document.querySelector('[data-detail-connects]');
  const detailNext=document.querySelector('[data-detail-next]');
  const overviewNote=document.querySelector('[data-overview-note]');
  const recoveryNode=document.querySelector('[data-workflow-recovery]');
  const incidentRoute=document.querySelector('[data-incident-route]');
  const recoveryRoute=document.querySelector('[data-recovery-route]');
  const incidentNote=document.querySelector('[data-incident-note]');

  let scrollStage=-1;
  let hoverStage=null;
  let workflowTicking=false;
  let incidentTimer=null;

  function clearIncident(){
    clearTimeout(incidentTimer);
    incidentTimer=null;
    recoveryNode.classList.remove('show');
    recoveryNode.setAttribute('aria-hidden','true');
    incidentRoute.classList.remove('show');
    recoveryRoute.classList.remove('show');
    incidentNote.classList.remove('show');
    workflowNodes.forEach(node=>node.classList.remove('incident'));
  }

  function showOverview(){
    clearIncident();
    workflowNodes.forEach(node=>node.classList.remove('active','passed'));
    detailIndex.textContent="DEVOPS DELIVERY LIFECYCLE";
    detailTitle.textContent="One change, end to end.";
    detailCopy.textContent="Follow a change from planning and version control through delivery and live operation.";
    overviewNote.hidden=false;
    detailPoints.hidden=true;
    detailConnects.hidden=true;
    workflowCount.textContent="01 / 06";
    workflowLive.style.strokeDashoffset=1000;
    workflowPacket.setAttribute('cx',82);
    workflowPacket.setAttribute('cy',90);
  }

  function setDetail(item){
    detailIndex.textContent=item.label;
    detailTitle.textContent=item.title;
    detailCopy.textContent=item.copy;
    overviewNote.hidden=true;
    detailPoints.hidden=false;
    detailConnects.hidden=false;
    detailPoints.innerHTML=item.points.map(point=>'<li>'+point+'</li>').join('');
    detailNext.textContent=item.next;
  }

  function renderStage(index,source="scroll"){
    clearIncident();
    const item=workflowData[index];
    workflowNodes.forEach((node,i)=>{
      node.classList.toggle('active',i===index);
      node.classList.toggle('passed',source==="scroll" && i<index);
    });
    setDetail(item);
    workflowCount.textContent=String(index+1).padStart(2,'0')+" / 06";
    const pct=index/(workflowData.length-1);
    workflowLive.style.strokeDashoffset=1000-(1000*pct);
    try{
      const len=workflowBase.getTotalLength();
      const p=workflowBase.getPointAtLength(len*pct);
      workflowPacket.setAttribute('cx',p.x);
      workflowPacket.setAttribute('cy',p.y);
    }catch(e){}
    if(index===5 && source==="scroll") incidentTimer=setTimeout(triggerIncident,1300);
  }

  function triggerIncident(){
    if(scrollStage!==5 || hoverStage!==null)return;
    const operateNode=workflowNodes[5];
    operateNode.classList.add('incident');
    recoveryNode.classList.add('show');
    recoveryNode.setAttribute('aria-hidden','false');
    incidentRoute.classList.add('show');
    incidentNote.classList.add('show');
    setDetail(incidentData);
    workflowCount.textContent="INCIDENT";

    incidentTimer=setTimeout(()=>{
      if(scrollStage!==5 || hoverStage!==null)return;
      operateNode.classList.remove('incident');
      incidentRoute.classList.remove('show');
      recoveryRoute.classList.add('show');
      detailIndex.textContent="RECOVERY · VERIFIED";
      detailTitle.textContent="Service restored";
      detailCopy.textContent="The fault is resolved, service health is verified and the operational lesson feeds back into the next planning cycle.";
      detailPoints.innerHTML=["Restore the affected service","Verify health, traffic and alerts","Carry the learning into the next planned change"].map(point=>'<li>'+point+'</li>').join('');
      detailNext.textContent="Plan";
    },3400);
  }

  workflowNodes.forEach((node,index)=>{
    node.addEventListener('mouseenter',()=>{hoverStage=index;clearIncident();renderStage(index,"hover");});
    node.addEventListener('mouseleave',()=>{hoverStage=null;if(scrollStage<0)showOverview();else renderStage(scrollStage,"scroll");});
    node.addEventListener('focus',()=>{hoverStage=index;clearIncident();renderStage(index,"hover");});
    node.addEventListener('blur',()=>{hoverStage=null;if(scrollStage<0)showOverview();else renderStage(scrollStage,"scroll");});
    node.addEventListener('click',()=>{hoverStage=index;clearIncident();renderStage(index,"hover");});
  });

  function updateWorkflowScroll(){
    workflowTicking=false;
    if(window.innerWidth<=980)return;
    const r=workflowStory.getBoundingClientRect();
    const total=Math.max(1,r.height-window.innerHeight);
    const progressed=Math.min(1,Math.max(0,-r.top/total));
    if(progressed<0.075){
      if(scrollStage!==-1){scrollStage=-1;if(hoverStage===null)showOverview();}
      return;
    }
    const normalized=(progressed-0.075)/0.925;
    const index=Math.min(5,Math.max(0,Math.floor(normalized*6)));
    if(index!==scrollStage){scrollStage=index;if(hoverStage===null)renderStage(index,"scroll");}
  }

  function requestWorkflowUpdate(){
    if(workflowTicking)return;
    workflowTicking=true;
    requestAnimationFrame(updateWorkflowScroll);
  }

  addEventListener('scroll',requestWorkflowUpdate,{passive:true});
  addEventListener('resize',()=>{
    clearIncident();
    if(window.innerWidth<=980){scrollStage=-1;if(hoverStage===null)showOverview();}
    else requestWorkflowUpdate();
  },{passive:true});

  showOverview();
  updateWorkflowScroll();
})();
