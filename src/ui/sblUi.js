import { escapeHtml } from '../core/geo.js';
import { parseWorldIntent, overallConnection, imageryZoom } from '../core/worldQuery.js';

export function installSblUi(app){
  const originalInit=app.init.bind(app),originalBind=app.bindUi.bind(app),originalSearch=app.runUniversalSearch.bind(app),originalMode=app.applyUiMode.bind(app),originalScope=app.renderScope.bind(app);
  app.bindUi=function(){
    originalBind();this.ensureSblUi();
    const run=()=>this.runSimpleSearch();this.$('simpleSearchBtn').onclick=run;this.$('simpleSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run();}});
    document.querySelectorAll('[data-simple-mode]').forEach(b=>b.onclick=()=>this.applyPreset(b.dataset.simpleMode));
    this.$('simpleConnection').onclick=()=>this.$('pulseTray').classList.remove('collapsed');
    this.$('imageryInfoBtn').onclick=()=>this.openImageryInfo();this.$('imageryInfoClose').onclick=()=>this.$('imageryInfoDialog').close();
  };
  app.init=async function(){const out=await originalInit();this.refreshSimpleConnection();this.registry.addEventListener('change',()=>this.refreshSimpleConnection());this.simpleConnectionTimer=setInterval(()=>this.refreshSimpleConnection(),15000);this.syncSimpleMode();return out;};
  app.applyUiMode=function(mode,persist=true){originalMode(mode,persist);this.syncSimpleMode();};
  app.renderScope=function(meta){const out=originalScope(meta);document.getElementById('app')?.classList.toggle('has-selection',!!meta);return out;};
  app.runUniversalSearch=async function(){const raw=this.$('searchInput').value.trim();if(raw&&await this.runWorldIntent(raw))return;return await originalSearch();};
  app.openSituationBrief=function(){return this.openSituationBriefV2();};

  app.ensureSblUi=function(){
    if(!document.querySelector('link[href=\'/src/ui/sbl.css\']')){const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/sbl.css';document.head.appendChild(l);}
    const host=document.getElementById('app');
    if(!this.$('simpleHub'))host.insertAdjacentHTML('beforeend',`<section id='simpleHub' class='simple-hub glass'><div class='simple-search'><input id='simpleSearchInput' autocomplete='off' placeholder='Search the world or ask: cameras in Oklahoma City'><button id='simpleSearchBtn' type='button'>SEARCH</button></div><div class='simple-modes'><button data-simple-mode='overview'>OVERVIEW</button><button data-simple-mode='emergency'>EMERGENCY</button><button data-simple-mode='aviation'>AVIATION</button><button data-simple-mode='space'>SPACE</button><button data-simple-mode='infrastructure'>INFRASTRUCTURE</button></div><button id='simpleConnection' class='simple-connection partial' type='button'>PARTIAL</button></section>`);
    if(!this.$('imageryInfoDialog'))host.insertAdjacentHTML('beforeend',`<dialog id='imageryInfoDialog' class='modal glass'><div class='modal-card compact'><div class='modal-head'><div><b>Imagery Information</b><small>SOURCE · CAPTURE DATE · RESOLUTION · ACCURACY</small></div><button id='imageryInfoClose' class='icon-btn' type='button'>✕</button></div><div id='imageryInfoBody' class='imagery-info-body'>Move the globe over an area and inspect the imagery.</div><div class='imagery-live-warning'>Satellite/aerial basemap imagery is not live video.</div></div></dialog>`);
    const earth=this.$('moreDialog')?.querySelector('.earth-view-switch');if(earth&&!this.$('imageryInfoBtn'))earth.insertAdjacentHTML('beforeend',`<button id='imageryInfoBtn' class='imagery-info-btn' type='button'>IMAGERY INFO</button>`);
  };
  app.syncSimpleMode=function(){document.getElementById('app')?.classList.toggle('sbl-simple',this.uiMode==='simple');};
  app.runSimpleSearch=async function(){const raw=this.$('simpleSearchInput').value.trim();if(!raw)return;if(await this.runWorldIntent(raw))return;this.openSearch();this.$('searchInput').value=raw;await originalSearch();};
  app.searchNotice=function(text){const box=this.$?.('searchResults');if(box)box.innerHTML=`<div class='search-hint'>${escapeHtml(text)}</div>`;};
  app.resolveWorldPlace=async function(name){try{const r=await fetch(`/api/boundary?q=${encodeURIComponent(name)}`),d=await r.json();if(!r.ok||!Array.isArray(d.bbox))return null;const [w,s,e,n]=d.bbox.map(Number),span=Math.max(Math.abs(e-w),Math.abs(n-s));return {name:d.name||name,lon:(w+e)/2,lat:(s+n)/2,alt:Math.max(120000,span*120000)};}catch{return null;}};
  app.runWorldIntent=async function(raw){
    const intent=parseWorldIntent(raw);if(!intent)return false;
    if(intent.kind==='biggest'){await this.setLayer('earthquakes',true);const l=this.layers.get('earthquakes'),hits=(l?.entities||[]).map(e=>({entity:e,meta:this.contactMeta?.(e)})).filter(x=>x.meta?.type==='EARTHQUAKE').sort((a,b)=>Number(b.meta.magnitude||0)-Number(a.meta.magnitude||0)),hit=hits[0];if(hit){this.globe.select(hit.meta,hit.entity);this.globe.smartFocus?.(hit.meta);this.searchNotice(`Strongest loaded earthquake: M${Number(hit.meta.magnitude||0).toFixed(1)} · ${hit.meta.name}`);this.toast(`M${Number(hit.meta.magnitude||0).toFixed(1)} · ${hit.meta.name}`);}else this.searchNotice('No earthquake event is loaded yet.');return true;}
    if(intent.kind==='contact'){await this.setLayer(intent.layer,true);const hits=this.searchActiveContacts(intent.query),hit=hits.find(x=>/ISS|ZARYA/i.test(x.meta.name||''))||hits[0];if(hit){this.globe.select(hit.meta,hit.entity);this.globe.smartFocus?.(hit.meta);this.searchNotice(`Selected ${hit.meta.name||'ISS'}.`);this.toast(`Selected ${hit.meta.name||'ISS'}.`);}else this.searchNotice('The requested satellite is not in the currently loaded orbital set.');return true;}
    if(intent.kind==='military'){await this.setLayer('aircraft',true);const hit=this.findNearestContact({type:'AIRCRAFT',militaryOnly:true,radiusKm:10000});this.searchNotice(hit?`Selected nearest military-likely aircraft: ${hit.meta.name}. Classification is heuristic.`:'No military-likely aircraft is currently loaded near this view.');this.toast(hit?`${hit.meta.name} · military-likely heuristic`:'No military-likely aircraft loaded near this view.');return true;}
    if(intent.kind==='situation'){if(intent.place){const p=await this.resolveWorldPlace(intent.place);if(!p){this.searchNotice(`Could not resolve ${intent.place}.`);return true;}this.globe.flyTo(p.lon,p.lat,p.alt);await wait(950);}this.openSituationBriefV2();if(this.$('searchDialog')?.open)this.$('searchDialog').close();return true;}
    if(intent.kind==='layer'){if(intent.place){const p=await this.resolveWorldPlace(intent.place);if(!p){this.searchNotice(`Could not resolve ${intent.place}.`);return true;}this.globe.flyTo(p.lon,p.lat,p.alt);await wait(950);}await this.setLayer(intent.layer,true);this.searchNotice(`${pretty(intent.layer)} enabled${intent.place?` around ${intent.place}`:' for the current view'}.`);this.toast(`${pretty(intent.layer)} enabled${intent.place?` around ${intent.place}`:''}.`);if(this.$('searchDialog')?.open)setTimeout(()=>this.$('searchDialog').close(),300);return true;}
    return false;
  };
  app.simpleConnectionState=function(){const rows=[];for(const l of this.layers.values())if(l.enabled)rows.push({...this.registry.get(l.id),enabled:true});if(this.globe.trafficLayer)rows.push({...this.registry.get('traffic'),enabled:true});return overallConnection(rows,navigator.onLine);};
  app.refreshSimpleConnection=function(){const b=this.$?.('simpleConnection');if(!b)return;const s=this.simpleConnectionState();b.textContent=s;b.className=`simple-connection ${s.toLowerCase()}`;};
  app.openSituationBriefV2=function(){
    const snap=this.currentSituation(),overview=this.$('situationOverview'),cards=this.$('situationCards'),state=this.simpleConnectionState();
    const defs=[['AIRCRAFT','aircraft','Air traffic'],['CCTV','cctv','Cameras'],['EARTHQUAKE','earthquakes','Earthquakes'],['FIRE','fires','Fires'],['SATELLITE','satellites','Satellites'],['VESSEL','vessels','Vessels']];
    const rows=defs.map(([type,id,title])=>{const l=this.layers.get(id),enabled=!!l?.enabled,s=this.registry.get(id),count=snap.counts[type]||0;let detail='Not enabled';if(enabled)detail=s?.status==='LIVE'?(count?`${count} loaded in this view`:'Live feed · no loaded items in this view'):`${s?.status||'CHECKING'} · ${s?.note||'coverage unavailable'}`;return `<div class='brief-source-row'><span>${escapeHtml(title)}</span><b>${escapeHtml(detail)}</b></div>`;}).join('');
    overview.innerHTML=`<div class='brief-title-row'><strong>Current view</strong><span class='brief-state ${state.toLowerCase()}'>${state}</span></div><div class='brief-source-grid'>${rows}</div><small>Coverage reflects only enabled public sources. “No loaded items” does not mean no real-world activity exists.</small>`;
    cards.innerHTML='';if(!snap.top.length)cards.innerHTML=`<div class='situation-empty'>No notable loaded contact/event is available in this view yet. A source may be disabled, delayed, unavailable, or outside its coverage.</div>`;for(const item of snap.top)this.renderSituationCard(item,cards);
    const foot=this.$('situationDialog')?.querySelector('.situation-footnote');if(foot)foot.textContent='ShadowNex reports partial truth honestly: enabled public feeds only. Missing coverage is never treated as proof of no activity.';
    const d=this.$('situationDialog');if(d&&!d.open)d.showModal();
  };
  app.openImageryInfo=async function(){
    const d=this.$('imageryInfoDialog'),box=this.$('imageryInfoBody'),p=this.globe.focusCoordinates(),z=imageryZoom(this.globe.state().alt);if(!d.open)d.showModal();
    if(this.globe.baseMapInfo().mode!=='satellite'){box.innerHTML=`<div class='imagery-card'><b>Basic Earth view</b><p>Switch to SATELLITE to inspect point-specific imagery metadata.</p></div>`;return;}
    box.innerHTML=`<div class='profile-loading'>Checking imagery metadata for the center of the current view…</div>`;
    try{const r=await fetch(`/api/imagery?lat=${p.lat.toFixed(6)}&lon=${p.lon.toFixed(6)}&z=${z}`),x=await r.json();if(!x.available){box.innerHTML=`<div class='imagery-card'><b>Esri World Imagery</b><p>${escapeHtml(x.note||x.error||'Point-specific metadata is unavailable here.')}</p><small>Imagery is not live.</small></div>`;return;}box.innerHTML=`<div class='imagery-card'><b>${escapeHtml(x.source||'Esri World Imagery')}</b>${x.description?`<p>${escapeHtml(x.description)}</p>`:''}<div class='imagery-meta-grid'>${metaCell('Capture date',x.captureDate||'Not supplied')}${metaCell('Ground resolution',resolution(x.resolutionMeters)||'Not supplied')}${metaCell('Positional accuracy',feet(x.accuracyMeters)||'Not supplied')}${metaCell('Metadata zoom',String(x.zoom))}</div><small>Center: ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} · not live imagery</small></div>`;}catch(e){box.innerHTML=`<div class='imagery-card'><b>Metadata unavailable</b><p>${escapeHtml(e.message||String(e))}</p></div>`;}
  };
}
function pretty(id){return ({cctv:'Cameras',aircraft:'Aircraft',satellites:'Satellites',fires:'Fires',earthquakes:'Earthquakes',launches:'Launches',vessels:'Vessels'})[id]||id;}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
function metaCell(k,v){return `<div><span>${escapeHtml(k.toUpperCase())}</span><b>${escapeHtml(String(v))}</b></div>`;}
function resolution(m){const n=Number(m);if(!Number.isFinite(n))return null;const inches=n*39.3701;return inches<36?`${inches.toFixed(1)} in/pixel`:`${(inches/12).toFixed(1)} ft/pixel`;}
function feet(m){const n=Number(m);return Number.isFinite(n)?`${(n*3.28084).toFixed(1)} ft`:null;}