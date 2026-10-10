import { escapeHtml } from '../core/geo.js';
import { importanceFor } from '../core/situation.js';
import { uncertaintyFor, uncertaintyText, sourceAge, sourcePlainState, overviewVisible, buildPrimeBrief } from '../core/trust.js';

const MODE_EXPLAIN={
  overview:['Global Overview','Shows only higher-value world activity while zoomed out. Routine contacts are suppressed until you zoom closer; favorites remain visible.'],
  emergency:['Disaster & Emergency','Prioritizes earthquakes, wildfire detections/events, and public cameras. A missing source is shown as missing rather than interpreted as no emergency.'],
  aviation:['Aviation & Maritime','Focuses on public aircraft plus AIS vessels when an AISStream key is configured. Aircraft military-likely labels remain heuristic.'],
  space:['Space & Exploration','Shows estimated satellite positions, reported launches, and mapped subsea infrastructure. Satellite positions are calculated from TLEs, not direct live telemetry.'],
  infrastructure:['Infrastructure','Shows community/public-source infrastructure, subsea cables, and public cameras. Coverage completeness varies by source and region.']
};

export function installTrustEnhancements(app){
  const originalBind=app.bindUi.bind(app),originalInit=app.init.bind(app),originalRenderScope=app.renderScope.bind(app),originalRenderPulse=app.renderPulse.bind(app),originalSituationCard=app.renderSituationCard.bind(app),originalPreset=app.applyPreset.bind(app),originalWorldIntent=app.runWorldIntent.bind(app);

  app.confidenceInfo=function(meta){
    const state=this.sourceStateForMeta(meta),status=uncertaintyFor(meta,state),quality=this.qualityForMeta(meta,status),updatedAt=Number(meta.updatedAt||meta.time||state?.updatedAt)||null;
    return {status,quality,source:meta.source||state?.provenance||'Public source',updatedAt};
  };

  app.bindUi=function(){
    originalBind();this.ensureTrustUi();
    this.$('primeBriefBtn').onclick=()=>this.openPrimeBrief('Current view');
    this.$('primeBriefClose').onclick=()=>this.$('primeBriefDialog').close();
    this.$('primeBriefRefresh').onclick=()=>this.openPrimeBrief(this.lastPrimeBriefLabel||'Current view',true);
    this.$('explainClose').onclick=()=>this.$('explainDialog').close();
    this.$('moreExplainModeBtn').onclick=()=>{this.$('moreDialog').close();this.explainCurrentMode();};
  };

  app.init=async function(){
    const out=await originalInit();this.selectiveOverview=false;
    this.registry.addEventListener('change',()=>{clearTimeout(this._trustRefresh);this._trustRefresh=setTimeout(()=>{this.renderPulse();this.applySelectiveOverview();},160);});
    this.globe.viewer.camera.moveEnd.addEventListener(()=>{if(this.selectiveOverview){clearTimeout(this._overviewMove);this._overviewMove=setTimeout(()=>this.applySelectiveOverview(),180);}});
    this.renderPulse();return out;
  };

  app.renderScope=function(meta){
    const out=originalRenderScope(meta);if(!meta)return out;const box=this.$('scopeContent');if(!box)return out;
    box.querySelector('.explain-subject-btn')?.remove();const b=document.createElement('button');b.type='button';b.className='ghost-btn wide explain-subject-btn';b.textContent='EXPLAIN THIS';b.onclick=()=>this.explainSubject(meta);
    const provenance=box.querySelector('.provenance-strip');if(provenance)provenance.insertAdjacentElement('afterend',b);else box.prepend(b);return out;
  };

  app.renderPulse=function(){
    const all=this.registry.all();this.$('pulseSummary').textContent=this.registry.summary();const grid=this.$('pulseGrid');
    grid.innerHTML=all.map(x=>`<article class='pulse-card trust-source-card' data-source-id='${escapeHtml(x.id)}'><div><b>${escapeHtml(x.label)}</b><span class='status-${String(x.status).toLowerCase()}'>${escapeHtml(sourcePlainState(x))}</span></div><small>${escapeHtml(x.provenance||'Public source')} · ${escapeHtml(sourceAge(x.updatedAt))}${x.count?` · ${x.count} loaded`:''}</small><button type='button' data-explain-source='${escapeHtml(x.id)}'>EXPLAIN</button></article>`).join('');
    grid.querySelectorAll('[data-explain-source]').forEach(b=>b.onclick=()=>this.explainSource(b.dataset.explainSource));
  };

  app.renderSituationCard=function(item,host){
    originalSituationCard(item,host);const card=host.lastElementChild;if(!card)return;const status=uncertaintyFor(item.meta,{status:item.sourceStatus}),head=card.querySelector('.situation-card-head');
    if(head){const badge=document.createElement('span');badge.className=`trust-badge ${status.toLowerCase()}`;badge.textContent=status;head.insertBefore(badge,head.lastElementChild);}
    const actions=card.querySelector('.situation-actions');if(actions){const b=document.createElement('button');b.type='button';b.className='ghost-btn explain-brief-item';b.textContent='EXPLAIN';b.onclick=()=>this.explainSubject(item.meta,{rank:item.rank,sourceStatus:item.sourceStatus});actions.appendChild(b);}
  };

  app.applyPreset=async function(id){
    const out=await originalPreset(id);this.selectiveOverview=id==='overview';this.applySelectiveOverview();if(id==='overview')this.toast('Global Overview is selective: significant/favorite activity first; zoom in for routine contacts.');return out;
  };

  app.runWorldIntent=async function(raw){
    const q=String(raw||'').trim();if(/^(?:prime brief|brief this area|what matters here|what matters around here)$/i.test(q)){this.openPrimeBrief('Current view');return true;}
    if(/^(?:explain this|what is this|why am i seeing this)$/i.test(q)&&this.globe.selected?.meta){this.explainSubject(this.globe.selected.meta);return true;}
    return await originalWorldIntent(raw);
  };

  app.ensureTrustUi=function(){
    if(!document.querySelector('link[href="/src/ui/trust.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/trust.css';document.head.appendChild(l);}
    const modes=this.$('simpleHub')?.querySelector('.simple-modes');if(modes&&!this.$('primeBriefBtn'))modes.insertAdjacentHTML('afterbegin',`<button id='primeBriefBtn' class='prime-brief-trigger' type='button'>PRIME BRIEF™</button>`);
    const host=document.getElementById('app');
    if(!this.$('explainDialog'))host.insertAdjacentHTML('beforeend',`<dialog id='explainDialog' class='modal glass'><div class='modal-card compact'><div class='modal-head'><div><b id='explainTitle'>Explain This</b><small>WHAT WE KNOW · HOW WE KNOW IT · LIMITS</small></div><button id='explainClose' class='icon-btn' type='button'>✕</button></div><div id='explainBody' class='explain-body'></div></div></dialog>`);
    if(!this.$('primeBriefDialog'))host.insertAdjacentHTML('beforeend',`<dialog id='primeBriefDialog' class='modal glass prime-brief-dialog'><div class='modal-card command-card'><div class='modal-head'><div><b>Prime Brief™</b><small>WHAT MATTERS · WHY · SOURCE COVERAGE</small></div><button id='primeBriefClose' class='icon-btn' type='button'>✕</button></div><div id='primeBriefBody' class='prime-brief-body'></div><button id='primeBriefRefresh' class='ghost-btn' type='button'>REFRESH FROM LOADED SOURCES</button><div class='prime-truth-note'>Prime Brief uses only currently loaded public/open-source data. Missing or unavailable feeds are reported as coverage gaps, not interpreted as no activity.</div></div></dialog>`);
    const more=this.$('moreDialog')?.querySelector('.more-grid');if(more&&!this.$('moreExplainModeBtn'))more.insertAdjacentHTML('beforeend',`<button id='moreExplainModeBtn' class='preset-card' type='button'><strong>Explain Current Mode</strong><small>What this mode shows, hides, and cannot prove.</small></button>`);
  };

  app.sourceStateForMeta=function(meta={}){const map={AIRCRAFT:'aircraft',VESSEL:'vessels',SATELLITE:'satellites',LAUNCH:'launches',EARTHQUAKE:'earthquakes',FIRE:'fires',CCTV:'cctv',RADIO:'radio',BIKE:'bikeshare',MILITARY_SITE:'context',INFRASTRUCTURE:'context',SUBSEA_CABLE:'subsea',CABLE_LANDING:'subsea'},id=map[String(meta.type||'').toUpperCase()];return id?this.registry.get(id):null;};
  app.qualityForMeta=function(meta,status){const t=String(meta.type||'').toUpperCase();if(status==='HEURISTIC')return 'RULE-BASED CLASSIFICATION · NOT CONFIRMED';if(t==='SATELLITE')return 'PUBLIC TLE ORBIT PROPAGATION';if(t==='AIRCRAFT')return 'PUBLIC ADS-B REPORT';if(t==='VESSEL')return 'PUBLIC AIS REPORT';if(t==='EARTHQUAKE')return 'USGS EVENT RECORD';if(t==='FIRE')return 'NASA EVENT / DETECTION RECORD';if(t==='LAUNCH')return 'PUBLIC SCHEDULE / EVENT RECORD';if(t==='CCTV')return 'PUBLIC CAMERA CATALOG';if(['MILITARY_SITE','INFRASTRUCTURE','SUBSEA_CABLE','CABLE_LANDING'].includes(t))return 'COMMUNITY-MAPPED CONTEXT';return 'PUBLIC SOURCE';};

  app.explainSubject=function(meta,extra={}){
    const state=this.sourceStateForMeta(meta)||{},status=uncertaintyFor(meta,state),summary=this.humanSummary?.(meta)||String(meta.name||meta.type||'Selected subject'),limits=this.subjectLimits(meta,status);
    this.$('explainTitle').textContent=`Explain · ${meta.name||meta.type||'Subject'}`;
    this.$('explainBody').innerHTML=`<section class='explain-section'><span>PLAIN ENGLISH</span><p>${escapeHtml(summary)}</p></section><div class='explain-facts'><div><span>CERTAINTY</span><b class='trust-badge ${status.toLowerCase()}'>${status}</b></div><div><span>SOURCE</span><b>${escapeHtml(meta.source||state.provenance||'Public source')}</b></div><div><span>UPDATED</span><b>${escapeHtml(sourceAge(Number(meta.updatedAt||meta.time||state.updatedAt)))}</b></div><div><span>SOURCE STATE</span><b>${escapeHtml(sourcePlainState(state))}</b></div></div><section class='explain-section'><span>WHAT ${status} MEANS</span><p>${escapeHtml(uncertaintyText(status))}</p></section><section class='explain-section caution'><span>DO NOT ASSUME</span><p>${escapeHtml(limits)}</p></section>${extra.rank?.reasons?.length?`<section class='explain-section'><span>WHY SHOWN</span><p>${escapeHtml(extra.rank.reasons.join(' · '))}</p></section>`:''}`;
    const d=this.$('explainDialog');if(!d.open)d.showModal();
  };
  app.subjectLimits=function(meta,status){const t=String(meta.type||'').toUpperCase();if(t==='AIRCRAFT'&&meta.militaryLikely)return 'A military-likely callsign does not confirm military ownership, mission, crew, passengers, cargo, or intent.';if(t==='AIRCRAFT')return 'Public ADS-B does not necessarily provide mission, passengers, cargo, or a verified current route.';if(t==='SATELLITE')return 'The displayed position is calculated from orbital elements and is not direct live spacecraft telemetry.';if(t==='CCTV')return 'A catalog entry does not guarantee a stream is currently available, recording, or pointed at a specific event.';if(t==='FIRE')return 'A detection/event marker does not by itself establish acreage, containment, evacuation status, or threat level.';if(t==='EARTHQUAKE')return 'Magnitude and location do not by themselves determine damage at a particular building or neighborhood.';if(t==='LAUNCH')return 'Schedules can change, and a reconstruction is not live launch telemetry.';if(t==='VESSEL')return 'AIS can be delayed, incomplete, or absent; destination text is self-reported/public AIS data when available.';return status==='STALE'?'Do not treat this as current until the source refreshes.':'Coverage may be incomplete and should be interpreted with the named source and freshness.';};

  app.explainSource=function(id){const s=this.registry.get(id);if(!s)return;this.$('explainTitle').textContent=`Source · ${s.label}`;this.$('explainBody').innerHTML=`<div class='explain-facts'><div><span>STATE</span><b>${escapeHtml(sourcePlainState(s))}</b></div><div><span>PROVIDER</span><b>${escapeHtml(s.provenance||'Public source')}</b></div><div><span>LOADED</span><b>${Number(s.count)||0}</b></div><div><span>UPDATED</span><b>${escapeHtml(sourceAge(s.updatedAt))}</b></div></div><section class='explain-section'><span>CURRENT NOTE</span><p>${escapeHtml(s.note||'No additional source note.')}</p></section><section class='explain-section caution'><span>COVERAGE LIMIT</span><p>Source availability, geographic coverage, rate limits, refresh intervals, and provider outages can all make this feed partial. A missing item is not proof that it does not exist.</p></section>`;const d=this.$('explainDialog');if(!d.open)d.showModal();};
  app.explainCurrentMode=function(){const [title,body]=MODE_EXPLAIN[this.activeMode]||['Custom / Advanced','You are using custom layer choices. ShadowNex will show what the enabled public sources provide and will preserve source-specific uncertainty.'];this.$('explainTitle').textContent=`Mode · ${title}`;this.$('explainBody').innerHTML=`<section class='explain-section'><span>WHAT IT DOES</span><p>${escapeHtml(body)}</p></section><section class='explain-section caution'><span>WHAT IT DOES NOT DO</span><p>A mode changes presentation and enabled sources. It does not increase the certainty or completeness of the underlying public data.</p></section>`;const d=this.$('explainDialog');if(!d.open)d.showModal();};

  app.primeSources=function(){const out=[];for(const l of this.layers.values()){const s=this.registry.get(l.id)||{};out.push({...s,id:l.id,label:l.label,enabled:!!l.enabled});}const t=this.registry.get('traffic')||{};out.push({...t,id:'traffic',label:'Traffic',enabled:!!this.globe.trafficLayer});return out;};
  app.openPrimeBrief=function(label='Current view',refresh=false){
    const snap=this.currentSituation(),brief=buildPrimeBrief(snap,this.primeSources(),{label});this.lastPrimeBriefLabel=label;this.lastPrimeBrief={brief,snap};const body=this.$('primeBriefBody');
    body.innerHTML=`<div class='prime-assessment'><div><span>ASSESSMENT</span><strong>${escapeHtml(brief.assessment)}</strong></div><b>${brief.notable?`${brief.notable} NOTABLE`:'NO NOTABLE THRESHOLD'}</b></div><p class='prime-coverage-line'>${escapeHtml(brief.coverageText)}</p><div class='prime-items'></div><details class='prime-sources'><summary>SOURCE COVERAGE</summary><div>${brief.coverage.map(x=>`<button type='button' data-prime-source='${escapeHtml(x.id)}'><span>${escapeHtml(x.label)}</span><b>${escapeHtml(x.plain)}</b><small>${escapeHtml(x.provenance||'Public source')} · ${escapeHtml(sourceAge(x.updatedAt))}${x.note?` · ${escapeHtml(x.note)}`:''}</small></button>`).join('')||'<p>No live data layer is enabled.</p>'}</div></details>`;
    const host=body.querySelector('.prime-items');brief.items.forEach((x,i)=>{const item=snap.top[i],card=document.createElement('article');card.className='prime-item';card.innerHTML=`<div class='prime-item-head'><span class='trust-badge ${x.uncertainty.toLowerCase()}'>${escapeHtml(x.uncertainty)}</span><b>${x.importance}</b></div><strong>${escapeHtml(x.name)}</strong><p>${escapeHtml(x.summary)}</p><small>${escapeHtml(x.source)} · ${escapeHtml(sourceAge(x.updatedAt))}</small><div class='prime-item-actions'><button type='button' data-view>VIEW</button><button type='button' data-explain>EXPLAIN</button>${item?.meta?.url?'<button type="button" data-source>SOURCE</button>':''}</div>`;card.querySelector('[data-view]').onclick=()=>{if(item?.entity){this.globe.select(item.meta,item.entity);this.globe.smartFocus?.(item.meta);}this.$('primeBriefDialog').close();};card.querySelector('[data-explain]').onclick=()=>this.explainSubject(item?.meta||{}, {rank:item?.rank});const sb=card.querySelector('[data-source]');if(sb)sb.onclick=()=>window.open(item.meta.url,'_blank','noopener');host.appendChild(card);});
    body.querySelectorAll('[data-prime-source]').forEach(b=>b.onclick=()=>this.explainSource(b.dataset.primeSource));const d=this.$('primeBriefDialog');if(!d.open)d.showModal();if(refresh)this.toast('Prime Brief refreshed from currently loaded sources.');
  };

  app.applySelectiveOverview=function(){
    if(!this.layers||!this.globe?.viewer)return;const center=this.globe.focusCoordinates(),alt=this.globe.state().alt;
    for(const layer of this.layers.values()){const state=this.registry.get(layer.id)||{};for(const e of layer.entities||[]){const meta=this.contactMeta?.(e);if(!meta)continue;if(meta.type==='CLUSTER'){if(this.selectiveOverview)e.show=false;continue;}if(!this.selectiveOverview){try{e.show=true}catch{}continue;}const favorite=this.favorites?.some(f=>favoriteKey(f.meta)===favoriteKey(meta))||false,rank=importanceFor(meta,{center,sourceUpdatedAt:state.updatedAt,sourceStatus:state.status});try{e.show=overviewVisible(meta,rank,favorite,alt)}catch{}}}
    this.applyTimelineWindow?.();this.globe.requestRender?.();
  };
}
function favoriteKey(m={}){return `${String(m.type||'CONTACT').toUpperCase()}:${String(m.id||m.name||'').toUpperCase()}`;}