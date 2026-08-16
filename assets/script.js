(() => {
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation
  const menu=$('.menu'), navLinks=$('.nav-links');
  menu?.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{navLinks?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));

  // Reveal once
  if('IntersectionObserver' in window && !reduceMotion){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.1});
    $$('.reveal').forEach(el=>io.observe(el));
  } else $$('.reveal').forEach(el=>el.classList.add('visible'));

  // Staggered micro reveals
  const micro=$$('.micro-reveal');
  if(micro.length){
    if(!('IntersectionObserver' in window)||reduceMotion) micro.forEach(el=>el.classList.add('micro-visible'));
    else {
      const groups=new Map();
      micro.forEach(el=>{const group=el.closest('.applied-stack,.journey-panels,.principle-grid')||el.parentElement;if(!groups.has(group))groups.set(group,[]);groups.get(group).push(el);});
      const mio=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;(groups.get(e.target)||[]).forEach((el,i)=>setTimeout(()=>el.classList.add('micro-visible'),i*75));mio.unobserve(e.target);}),{threshold:.1});
      groups.forEach((_,g)=>mio.observe(g));
    }
  }

  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  // Nav compaction + progress, one animation frame per scroll batch
  const nav=$('[data-nav]'), progress=$('.scroll-progress span');
  let scrollTick=false;
  const updateGlobalScroll=()=>{scrollTick=false;nav?.classList.toggle('scrolled',scrollY>32);const max=document.documentElement.scrollHeight-innerHeight;if(progress)progress.style.width=`${max>0?scrollY/max*100:0}%`;};
  const requestGlobalScroll=()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateGlobalScroll);}};
  addEventListener('scroll',requestGlobalScroll,{passive:true});addEventListener('resize',requestGlobalScroll,{passive:true});updateGlobalScroll();

  // Theme (pre-applied in <head>, this controls the button only)
  const themeButton=$('.theme-toggle'), themeIcon=$('.theme-icon');
  const applyTheme=theme=>{if(theme==='light')document.documentElement.dataset.theme='light';else delete document.documentElement.dataset.theme;themeButton?.setAttribute('aria-label',theme==='light'?'Switch to dark mode':'Switch to light mode');if(themeIcon)themeIcon.textContent=theme==='light'?'☀':'☾';};
  applyTheme(document.documentElement.dataset.theme==='light'?'light':'dark');
  themeButton?.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';applyTheme(next);try{localStorage.setItem('nabil-theme',next)}catch(e){}});

  // Smooth project filtering; layout reads only on click.
  $$('.filter').forEach(button=>button.addEventListener('click',async()=>{
    const grid=$('.project-grid'), cards=$$('.project-card[data-category]');if(!grid||!cards.length||grid.dataset.filtering==='true')return;
    grid.dataset.filtering='true';const filter=button.dataset.filter;const current=cards.filter(c=>!c.classList.contains('filtered-out'));const next=cards.filter(c=>filter==='all'||c.dataset.category.split(' ').includes(filter));const nextSet=new Set(next);const leaving=current.filter(c=>!nextSet.has(c));
    $$('.filter').forEach(b=>b.classList.remove('active'));button.classList.add('active');leaving.forEach(c=>c.classList.add('filter-leave'));if(leaving.length&&!reduceMotion)await new Promise(r=>setTimeout(r,145));
    const first=new Map(current.filter(c=>!leaving.includes(c)).map(c=>[c,c.getBoundingClientRect()]));cards.forEach(c=>{c.classList.toggle('filtered-out',!nextSet.has(c));c.classList.remove('filter-leave');});
    requestAnimationFrame(()=>{if(!reduceMotion)next.forEach(c=>{const last=c.getBoundingClientRect(),before=first.get(c);if(before)c.animate([{transform:`translate(${before.left-last.left}px,${before.top-last.top}px)`,opacity:.8},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});else c.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:240,easing:'ease-out'});});setTimeout(()=>grid.dataset.filtering='false',310);});
  }));

  // Command palette
  const backdrop=$('[data-command-backdrop]'), input=$('[data-command-input]'), trigger=$('.command-trigger'), mod=$('[data-command-mod]');
  const isMac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);if(mod)mod.textContent=isMac?'⌘':'Ctrl';let selected=0;
  const visibleItems=()=>$$('[data-command-item]').filter(i=>!i.hidden);const paint=()=>{const v=visibleItems();selected=Math.max(0,Math.min(selected,v.length-1));v.forEach((it,i)=>it.classList.toggle('keyboard-selected',i===selected));v[selected]?.scrollIntoView({block:'nearest'});};
  const open=()=>{if(!backdrop)return;backdrop.hidden=false;if(input)input.value='';$$('[data-command-item]').forEach(i=>i.hidden=false);selected=0;paint();setTimeout(()=>input?.focus(),0)};const close=()=>{if(backdrop)backdrop.hidden=true;trigger?.focus()};
  trigger?.addEventListener('click',open);backdrop?.addEventListener('click',e=>{if(e.target===backdrop)close()});addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();backdrop?.hidden?open():close();return}if(!backdrop||backdrop.hidden)return;const v=visibleItems();if(e.key==='Escape')close();else if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(selected+1,v.length-1);paint()}else if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(selected-1,0);paint()}else if(e.key==='Enter'&&document.activeElement===input&&v[selected]){e.preventDefault();v[selected].click()}});
  input?.addEventListener('input',()=>{const q=input.value.toLowerCase().trim();$$('[data-command-item]').forEach(it=>it.hidden=!it.textContent.toLowerCase().includes(q));selected=0;paint()});

  // Preserve standard browser behaviours such as Ctrl/Cmd/Shift click.
  $$('a[href]').forEach(a=>a.addEventListener('click',e=>{const href=a.getAttribute('href');if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download')||!href||href.startsWith('#')||a.target==='_blank'||href.startsWith('mailto:')||/^https?:/i.test(href))return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.href=href,130)}));

  // Architecture hover descriptions.
  $$('[data-arch-info]').forEach(node=>{const tooltip=node.closest('.architecture-lab')?.querySelector('[data-arch-tooltip]');const show=()=>{if(tooltip)tooltip.textContent=node.dataset.archInfo};node.addEventListener('mouseenter',show);node.addEventListener('focus',show)});

  // Architecture flows only animate while visible.
  const flows=$$('[data-architecture-flow],[data-project-flow]');if(flows.length&&'IntersectionObserver' in window&&!reduceMotion){const fio=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('flow-active',e.isIntersecting)),{threshold:.3});flows.forEach(el=>fio.observe(el))}else flows.forEach(el=>el.classList.add('flow-active'));

  // Smooth journey: cached geometry + one synchronized reading line.
  const journey=$('[data-scroll-journey]');
  if(journey){
    const navItems=$$('[data-journey-nav]',journey);
    const panels=$$('[data-journey-panel]',journey);
    const bar=$('[data-journey-progress]',journey);

    let anchors=[];
    let anchorOffset=0;
    let jTick=false;
    let active=-1;

    const clamp=n=>Math.max(0,Math.min(1,n));

    const setActive=(idx,prog)=>{
      if(idx!==active){
        active=idx;
        navItems.forEach((it,i)=>{
          it.classList.toggle('active',i===idx);
          it.classList.toggle('passed',i<idx);
        });
        panels.forEach((p,i)=>p.classList.toggle('active',i===idx));
      }else{
        navItems.forEach((it,i)=>it.classList.toggle('passed',i<idx));
      }
      if(bar)bar.style.transform=`scaleY(${prog})`;
    };

    const updateJourney=()=>{
      jTick=false;
      if(!anchors.length)return;

      // A higher reading line makes the response feel immediate:
      // roughly one third of the viewport from the top.
      const readingY=scrollY+anchorOffset;

      let idx=0;
      for(let i=0;i<anchors.length;i++){
        if(readingY>=anchors[i])idx=i;
        else break;
      }

      const first=anchors[0];
      const last=anchors[anchors.length-1];
      const prog=last>first?clamp((readingY-first)/(last-first)):0;

      setActive(idx,prog);
    };

    const requestJourney=()=>{
      if(!jTick){
        jTick=true;
        requestAnimationFrame(updateJourney);
      }
    };

    const measure=()=>{
      const sy=scrollY;
      anchorOffset=innerHeight*.34;

      // Cache one activation point per panel. These values are only
      // recalculated on initial layout / resize, never every scroll frame.
      anchors=panels.map(p=>{
        const r=p.getBoundingClientRect();
        return sy+r.top+Math.min(r.height*.26,72);
      });

      updateJourney();
    };

    navItems.forEach(it=>it.addEventListener('click',()=>{
      const i=Number(it.dataset.journeyNav);
      if(!Number.isFinite(i)||!anchors[i])return;
      scrollTo({
        top:Math.max(0,anchors[i]-anchorOffset),
        behavior:reduceMotion?'auto':'smooth'
      });
    }));

    addEventListener('scroll',requestJourney,{passive:true});
    addEventListener('resize',()=>requestAnimationFrame(measure),{passive:true});
    addEventListener('load',()=>requestAnimationFrame(measure),{once:true});

    if(document.fonts?.ready){
      document.fonts.ready.then(()=>requestAnimationFrame(measure));
    }

    requestAnimationFrame(measure);
  }

  // One-time terminal typing.
  const terminals=$$('[data-terminal-once]');const typeTerminal=async t=>{if(t.dataset.typed==='true')return;t.dataset.typed='true';const out=t.querySelector('[data-terminal-output]');if(!out)return;let lines=[];try{lines=JSON.parse(t.dataset.terminalLines||'[]')}catch(e){}if(reduceMotion){out.textContent=lines.join('\n');t.classList.add('terminal-complete');return}const sleep=ms=>new Promise(r=>setTimeout(r,ms));for(let li=0;li<lines.length;li++){for(const ch of lines[li]){out.textContent+=ch;await sleep(lines[li].startsWith('✓')?18:25)}if(li<lines.length-1)out.textContent+='\n';await sleep(lines[li].startsWith('$')?300:160)}t.classList.add('terminal-complete')};
  if(terminals.length&&'IntersectionObserver' in window){const tio=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){typeTerminal(e.target);tio.unobserve(e.target)}}),{threshold:.45});terminals.forEach(t=>tio.observe(t))}else terminals.forEach(typeTerminal);
})();


// V23 — lightweight dark-mode pointer light.
// requestAnimationFrame only; no getBoundingClientRect and no card-by-card pointer work.
(() => {
  const light = document.querySelector('.pointer-light');
  if (!light || window.matchMedia('(pointer:coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let pointerX = -999;
  let pointerY = -999;
  let framePending = false;

  const renderPointerLight = () => {
    framePending = false;
    const x = pointerX - 130;
    const y = pointerY - 130;
    light.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const requestRender = () => {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(renderPointerLight);
    }
  };

  window.addEventListener('pointermove', (event) => {
    if (document.documentElement.dataset.theme === 'light') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    light.classList.add('is-visible');
    requestRender();
  }, { passive:true });

  document.documentElement.addEventListener('mouseleave', () => {
    light.classList.remove('is-visible');
  });

  window.addEventListener('blur', () => {
    light.classList.remove('is-visible');
  });
})();


// V29 — graceful fallback for externally sourced brand SVGs.
document.querySelectorAll('img[data-fallback]').forEach(img=>{
  img.addEventListener('error',()=>{
    const fallback=img.dataset.fallback;
    if(!fallback || img.dataset.fallbackUsed==='true') return;
    img.dataset.fallbackUsed='true';
    img.src=fallback;
  },{once:false});
});
