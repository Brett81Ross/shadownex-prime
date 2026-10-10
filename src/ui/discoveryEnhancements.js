import { QUICK_STEPS, DEMO_STEPS, normalizeDiscoveryState, shouldTip, markTip, markMilestone, discoveryProgress } from '../core/discovery.js';

const KEY='shadownex.prime.discovery.v2';

export function installDiscoveryEnhancements(app){
  app.discoveryState=loadState();
  const originalBind=app.bindUi.bind(app);
  const originalInit=app.init.bind(app);
  const originalShowWelcome=app.showWelcome.bind(app);
  const originalFinishLocation=app.finishLocationStart?.bind(app);
  const originalRunWorld=app.runWorldIntent.bind(app);
  const originalRenderScope=app.renderScope.bind(app);
  const originalPrime=app.openPrimeBrief.bind(app);
  const originalWatch=app.openWatchCenter.bind(app);

  app.bindUi=function(){
    originalBind();
    this.ensureDiscoveryUi();

    this.$('showDemoBtn').onclick=()=>{this.$('moreDialog')?.close();this.startDemo();};
    this.$('helpTourBtn').onclick=()=>{this.$('moreDialog')?.close();this.openHelpCenter();};
    this.$('helpClose').onclick=()=>this.$('helpDialog').close();
    this.$('helpDemoBtn').onclick=()=>{this.$('helpDialog').close();this.startDemo();};
    this.$('helpQuickBtn').onclick=()=>{this.$('helpDialog').close();this.openQuickStart(true);};
    this.$('helpHintsBtn').onclick=()=>this.toggleHints();
    this.$('helpResetTipsBtn').onclick=()=>this.resetDiscoveryTips();

    this.$('quickBack').onclick=()=>this.quickStep(-1);
    this.$('quickNext').onclick=()=>this.quickStep(1);
    this.$('quickSkip').onclick=()=>this.completeQuickStart(true);
    this.$('quickClose').onclick=()=>this.completeQuickStart(true);

    this.$('demoPause').onclick=()=>this.toggleDemoPause();
    this.$('demoNext').onclick=()=>this.advanceDemo();
    this.$('demoStop').onclick=()=>this.stopDemo(false);

    this.$('tipDismiss').onclick=()=>this.closeDiscoveryTip();

    this.$('advancedStay').onclick=()=>this.$('advancedIntroDialog').close();
    this.$('advancedOpen').onclick=()=>this.confirmAdvancedMode();

    const guide=this.$('showGuideBtn');
    if(guide)guide.onclick=()=>{if(this.$('settingsDialog')?.open)this.$('settingsDialog').close();this.openQuickStart(true);};

    const toggle=this.$('toggleUiModeBtn');
    if(toggle)toggle.onclick=()=>{
      if(this.uiMode==='simple'&&!this.discoveryState.advancedIntroduced){
        this.$('moreDialog')?.close();
        this.openAdvancedIntro();
      }else{
        const next=this.uiMode==='simple'?'advanced':'simple';
        this.applyUiMode(next);
        this.$('moreDialog')?.close();
        if(next==='advanced')this.markDiscoveryMilestone('advanced');
      }
    };
  };

  app.init=async function(){
    const out=await originalInit();
    this.renderDiscoveryProgress();
    return out;
  };

  app.showWelcome=function(force=false){
    if(force){this.openQuickStart(true);return;}
    let locationDone=false;
    try{locationDone=localStorage.getItem(this.locationStartKey)==='done';}catch{}
    if(!locationDone){originalShowWelcome(false);return;}
    if(!this.discoveryState.quickStartDone)setTimeout(()=>this.openQuickStart(false),350);
  };

  if(originalFinishLocation){
    app.finishLocationStart=function(){
      originalFinishLocation();
      if(!this.discoveryState.quickStartDone)setTimeout(()=>this.openQuickStart(false),350);
    };
  }

  app.runWorldIntent=async function(raw){
    const ok=await originalRunWorld(raw);
    if(ok&&!this.demoRunning){
      this.markDiscoveryMilestone('search');
      this.maybeDiscoveryTip('after-search','Ask what matters','Prime Brief can summarize the loaded public-source activity in the current view and tell you when coverage is partial.','#primeBriefBtn');
    }
    return ok;
  };

  app.renderScope=function(meta){
    const out=originalRenderScope(meta);
    if(meta&&!this.demoRunning){
      this.markDiscoveryMilestone('selection');
      setTimeout(()=>this.maybeDiscoveryTip('after-selection','Need plain English?','Use Explain This to see what ShadowNex knows, how it knows it, and what you should not assume.','.explain-subject-btn'),250);
    }
    return out;
  };

  app.openPrimeBrief=function(...args){
    const out=originalPrime(...args);
    if(!this.demoRunning){
      this.markDiscoveryMilestone('brief');
      setTimeout(()=>this.maybeDiscoveryTip('after-brief','Save what matters','Watch Center can save this view, watch a geographic area, or favorite a subject for quick return.','#navLayers'),250);
    }
    return out;
  };

  app.openWatchCenter=function(...args){
    const out=originalWatch(...args);
    if(!this.demoRunning){
      this.markDiscoveryMilestone('watch');
      setTimeout(()=>this.maybeDiscoveryTip('after-watch','Your return point','Saved Views restore camera, layers, lens, and basemap. Watch Areas monitor only data loaded while this app is open.','#watchDialog'),250);
    }
    return out;
  };

  app.ensureDiscoveryUi=function(){
    if(!document.querySelector('link[href="/src/ui/discovery.css"]')){
      const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/discovery.css';document.head.appendChild(l);
    }
    const host=document.getElementById('app');

    const more=this.$('moreDialog')?.querySelector('.more-grid');
    if(more&&!this.$('showDemoBtn'))more.insertAdjacentHTML('afterbegin',`
      <button id="showDemoBtn" class="preset-card discovery-primary" type="button"><strong>Show Me ShadowNex</strong><small>About 35 seconds. See the core experience without changing your saved setup.</small></button>
      <button id="helpTourBtn" class="preset-card" type="button"><strong>Help & Guide</strong><small>Quick Start, feature map, contextual hints, and the guided tour.</small></button>`);

    if(!this.$('quickStartV2Dialog'))host.insertAdjacentHTML('beforeend',`
      <dialog id="quickStartV2Dialog" class="modal glass discovery-quick">
        <div class="modal-card compact">
          <div class="modal-head"><div><b>ShadowNex Quick Start</b><small>3 STEPS · SKIP ANYTIME</small></div><button id="quickClose" class="icon-btn" type="button">✕</button></div>
          <div id="quickProgress" class="quick-progress"></div>
          <div id="quickBody" class="quick-body"></div>
          <div class="quick-actions"><button id="quickSkip" class="ghost-btn" type="button">SKIP</button><button id="quickBack" class="ghost-btn" type="button">BACK</button><button id="quickNext" class="hud-btn" type="button">NEXT</button></div>
        </div>
      </dialog>`);

    if(!this.$('helpDialog'))host.insertAdjacentHTML('beforeend',`
      <dialog id="helpDialog" class="modal glass discovery-help">
        <div class="modal-card">
          <div class="modal-head"><div><b>ShadowNex Help</b><small>START SIMPLE · GO DEEPER WHEN YOU WANT</small></div><button id="helpClose" class="icon-btn" type="button">✕</button></div>
          <div id="helpProgress" class="help-progress"></div>
          <div class="help-map">
            <article><b>SEARCH & EXPLORE</b><p>Ask for a place or subject in plain English. ShadowNex can move the globe and enable the right data source.</p></article>
            <article><b>UNDERSTAND</b><p>Tap a subject for its profile. Explain This separates facts, estimates, heuristics, source age, and limits.</p></article>
            <article><b>BRIEF & WATCH</b><p>Prime Brief ranks what matters. Watch Center stores views, areas, favorites, activity, and time windows.</p></article>
            <article><b>ADVANCED</b><p>Drawing, measurement, scenes, map lenses, full layers, and diagnostics stay available without crowding Simple Mode.</p></article>
          </div>
          <div class="help-actions"><button id="helpDemoBtn" class="hud-btn" type="button">SHOW ME SHADOWNEX</button><button id="helpQuickBtn" class="ghost-btn" type="button">QUICK START</button><button id="helpHintsBtn" class="ghost-btn" type="button">HINTS</button><button id="helpResetTipsBtn" class="ghost-btn" type="button">RESET TIPS</button></div>
        </div>
      </dialog>`);

    if(!this.$('advancedIntroDialog'))host.insertAdjacentHTML('beforeend',`
      <dialog id="advancedIntroDialog" class="modal glass advanced-intro">
        <div class="modal-card compact">
          <div class="modal-head"><div><b>Advanced Controls</b><small>THE SAME DATA · MORE DIRECT CONTROL</small></div></div>
          <p>Advanced Mode does not make the data more certain. It exposes more controls for users who want to inspect and manipulate the map directly.</p>
          <div class="advanced-intro-grid">
            <div><b>DRAW & MEASURE</b><small>Marks, routes, areas, distance, and boundaries.</small></div>
            <div><b>SCENES</b><small>Orbit targets, world sweep, route playback, and reconstructed launch arcs.</small></div>
            <div><b>MAP LENSES</b><small>Normal, NVG, thermal-style, and CRT presentation modes.</small></div>
            <div><b>RAW CONTROLS</b><small>Full layer list, source status, technical details, and diagnostics.</small></div>
          </div>
          <div class="modal-actions"><button id="advancedStay" class="ghost-btn" type="button">STAY SIMPLE</button><button id="advancedOpen" class="hud-btn" type="button">OPEN ADVANCED</button></div>
        </div>
      </dialog>`);

    if(!this.$('demoCoach'))host.insertAdjacentHTML('beforeend',`
      <section id="demoCoach" class="demo-coach glass hidden" aria-live="polite">
        <div class="demo-head"><span>SHOW ME SHADOWNEX</span><b id="demoCounter">1 / 6</b></div>
        <strong id="demoTitle"></strong><p id="demoBody"></p>
        <div id="demoProgress" class="demo-progress"></div>
        <div class="demo-actions"><button id="demoPause" type="button">PAUSE</button><button id="demoNext" type="button">NEXT</button><button id="demoStop" type="button">STOP</button></div>
      </section>`);

    if(!this.$('discoveryTip'))host.insertAdjacentHTML('beforeend',`
      <aside id="discoveryTip" class="discovery-tip glass hidden">
        <div><b id="tipTitle"></b><p id="tipBody"></p></div><button id="tipDismiss" type="button">GOT IT</button>
      </aside>`);
  };

  app.loadDiscoveryState=function(){this.discoveryState=loadState();return this.discoveryState;};
  app.saveDiscoveryState=function(){saveState(this.discoveryState);this.renderDiscoveryProgress();};
  app.markDiscoveryMilestone=function(id){
    if(this.demoRunning)return;
    this.discoveryState=markMilestone(this.discoveryState,id);
    this.saveDiscoveryState();
    const p=discoveryProgress(this.discoveryState);
    if(p.readyForAdvanced)this.maybeDiscoveryTip('advanced-ready','Advanced tools are ready when you are','You have the core loop down. More → Advanced Controls adds drawing, scenes, lenses, and raw diagnostics without replacing Simple Mode.','#navMore');
  };

  app.maybeDiscoveryTip=function(id,title,body,target){
    if(this.demoRunning||!shouldTip(this.discoveryState,id))return;
    this.closeDiscoveryTip();
    this.discoveryState=markTip(this.discoveryState,id);this.saveDiscoveryState();
    this.$('tipTitle').textContent=title;this.$('tipBody').textContent=body;
    this.$('discoveryTip').classList.remove('hidden');
    const el=document.querySelector(target);if(el){el.classList.add('discovery-highlight');this._tipTarget=el;}
  };
  app.closeDiscoveryTip=function(){this.$?.('discoveryTip')?.classList.add('hidden');this._tipTarget?.classList.remove('discovery-highlight');this._tipTarget=null;};

  app.openQuickStart=function(force=false){
    this.quickIndex=0;this.quickForced=force;this.renderQuickStart();
    const d=this.$('quickStartV2Dialog');if(d&&!d.open)d.showModal();
  };
  app.renderQuickStart=function(){
    const step=QUICK_STEPS[this.quickIndex]||QUICK_STEPS[0],host=this.$('quickBody');
    host.innerHTML=`<span class="quick-kicker">STEP ${this.quickIndex+1} OF ${QUICK_STEPS.length}</span><h3>${step.title}</h3><p>${step.body}</p><div class="quick-example">${step.example}</div>`;
    this.$('quickProgress').innerHTML=QUICK_STEPS.map((_,i)=>`<i class="${i===this.quickIndex?'active':''}"></i>`).join('');
    this.$('quickBack').disabled=this.quickIndex===0;
    this.$('quickNext').textContent=this.quickIndex===QUICK_STEPS.length-1?'START EXPLORING':'NEXT';
  };
  app.quickStep=function(delta){
    if(delta>0&&this.quickIndex===QUICK_STEPS.length-1){this.completeQuickStart(false);return;}
    this.quickIndex=Math.max(0,Math.min(QUICK_STEPS.length-1,this.quickIndex+delta));this.renderQuickStart();
  };
  app.completeQuickStart=function(skipped=false){
    this.discoveryState={...normalizeDiscoveryState(this.discoveryState),quickStartDone:true};this.saveDiscoveryState();
    try{localStorage.setItem(this.onboardKey,'done');}catch{}
    this.$('quickStartV2Dialog')?.close();
    if(!this.quickForced)this.toast(skipped?'Quick Start skipped. Help is always under More.':'You’re ready. Search, tap, brief, and watch.');
  };

  app.openHelpCenter=function(){this.renderDiscoveryProgress();const d=this.$('helpDialog');if(d&&!d.open)d.showModal();};
  app.renderDiscoveryProgress=function(){
    if(!this.$)return;const p=discoveryProgress(this.discoveryState);
    const h=this.$('helpProgress');if(h)h.innerHTML=`<span>CORE EXPERIENCE</span><b>${p.count} / ${p.total}</b><small>${p.readyForAdvanced?'Advanced tools are available when you want them.':'Use Search, select a subject, Prime Brief, and Watch to learn the core flow.'}</small>`;
    const hb=this.$('helpHintsBtn');if(hb)hb.textContent=this.discoveryState.hintsEnabled===false?'TURN HINTS ON':'TURN HINTS OFF';
  };
  app.toggleHints=function(){this.discoveryState={...normalizeDiscoveryState(this.discoveryState),hintsEnabled:this.discoveryState.hintsEnabled===false};this.saveDiscoveryState();if(this.discoveryState.hintsEnabled===false)this.closeDiscoveryTip();this.renderDiscoveryProgress();};
  app.resetDiscoveryTips=function(){this.discoveryState={...normalizeDiscoveryState(this.discoveryState),tipSeen:{},hintsEnabled:true};this.saveDiscoveryState();this.closeDiscoveryTip();this.toast('Contextual hints reset.');};

  app.openAdvancedIntro=function(){const d=this.$('advancedIntroDialog');if(d&&!d.open)d.showModal();};
  app.confirmAdvancedMode=function(){
    this.discoveryState={...normalizeDiscoveryState(this.discoveryState),advancedIntroduced:true};this.saveDiscoveryState();
    this.$('advancedIntroDialog')?.close();this.applyUiMode('advanced');this.markDiscoveryMilestone('advanced');this.toast('Advanced Controls opened. Simple Mode is always one tap away.');
  };

  app.startDemo=function(){
    if(this.demoRunning)return;
    for(const d of document.querySelectorAll('dialog[open]'))try{d.close()}catch{}
    this.closeDiscoveryTip();
    this.demoRunning=true;this.demoPaused=false;this.demoIndex=0;this.demoRestoreState=this.captureCurrentState?.()||null;this.demoRestoreUiMode=this.uiMode;
    document.getElementById('app')?.classList.add('demo-running');
    this.$('demoCoach').classList.remove('hidden');
    this.applyUiMode('simple',false);
    this.runDemoStep();
  };
  app.runDemoStep=function(){
    clearTimeout(this.demoTimer);this.clearDemoHighlight();
    const step=DEMO_STEPS[this.demoIndex];if(!step){this.stopDemo(true);return;}
    this.$('demoCounter').textContent=`${this.demoIndex+1} / ${DEMO_STEPS.length}`;this.$('demoTitle').textContent=step.title;this.$('demoBody').textContent=step.body;
    this.$('demoProgress').innerHTML=DEMO_STEPS.map((_,i)=>`<i class="${i<=this.demoIndex?'active':''}"></i>`).join('');
    const target=document.querySelector(step.target);if(target){target.classList.add('demo-highlight');this._demoTarget=target;}
    if(step.action==='overview'){this._restoringState=true;try{this.globe.home(true);}finally{setTimeout(()=>{this._restoringState=false;},100);}}
    if(!this.demoPaused)this.demoTimer=setTimeout(()=>this.advanceDemo(),5500);
  };
  app.advanceDemo=function(){if(!this.demoRunning)return;this.demoIndex++;if(this.demoIndex>=DEMO_STEPS.length){this.stopDemo(true);return;}this.runDemoStep();};
  app.toggleDemoPause=function(){if(!this.demoRunning)return;this.demoPaused=!this.demoPaused;this.$('demoPause').textContent=this.demoPaused?'RESUME':'PAUSE';clearTimeout(this.demoTimer);if(!this.demoPaused)this.demoTimer=setTimeout(()=>this.advanceDemo(),5500);};
  app.clearDemoHighlight=function(){this._demoTarget?.classList.remove('demo-highlight');this._demoTarget=null;};
  app.stopDemo=async function(completed=false){
    if(!this.demoRunning)return;clearTimeout(this.demoTimer);this.clearDemoHighlight();this.demoRunning=false;this.demoPaused=false;
    this.$('demoCoach').classList.add('hidden');this.$('demoPause').textContent='PAUSE';document.getElementById('app')?.classList.remove('demo-running');
    if(this.demoRestoreState&&this.restoreState)await this.restoreState(this.demoRestoreState);
    if(this.demoRestoreUiMode)this.applyUiMode(this.demoRestoreUiMode,false);
    if(completed){this.discoveryState={...normalizeDiscoveryState(this.discoveryState),demoCompleted:true};this.saveDiscoveryState();this.toast('Tour complete. Your previous ShadowNex view was restored.');}
    else this.toast('Tour stopped. Your previous ShadowNex view was restored.');
    this.demoRestoreState=null;
  };
}

function loadState(){try{return normalizeDiscoveryState(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{return normalizeDiscoveryState(null);}}
function saveState(state){try{localStorage.setItem(KEY,JSON.stringify(normalizeDiscoveryState(state)));}catch{}}
