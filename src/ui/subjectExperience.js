import { escapeHtml, fmtDistanceKm } from '../core/geo.js';
import { saveCollection, makeId } from '../core/watchStore.js';

export function installSubjectExperience(app){
  const originalBind=app.bindUi.bind(app),originalInit=app.init.bind(app),originalRenderScope=app.renderScope.bind(app),originalWorldIntent=app.runWorldIntent.bind(app);

  app.bindUi=function(){
    originalBind();this.ensureSubjectExperienceUi();
    this.$('cameraCoverageBtn').onclick=()=>{this.$('moreDialog')?.close();this.openCameraCoverage();};
    this.$('cameraCoverageClose').onclick=()=>this.$('cameraCoverageDialog').close();
    this.$('subjectSheetHandle').onclick=()=>this.$('scopePanel').classList.toggle('subject-sheet-expanded');
  };

  app.init=async function(){
    const out=await originalInit();this.installDossierRenderers();return out;
  };

  app.renderScope=function(meta){
    const out=originalRenderScope(meta),panel=this.$?.('scopePanel');
    if(panel)panel.classList.toggle('subject-sheet-open',!!meta);
    if(!meta){panel?.classList.remove('subject-sheet-expanded');return out;}
    setTimeout(()=>{this.renderSubjectActions(meta);this.renderSubjectPlacePlaceholder(meta);},0);
    return out;
  };

  app.runWorldIntent=async function(raw){
    if(/\b(?:camera|cctv)\s+(?:coverage|areas?|regions?)\b|\bwhere\s+(?:are|can i find)\s+(?:the\s+)?(?:cameras?|cctv)\b/i.test(String(raw||''))){
      this.openCameraCoverage();return true;
    }
    return await originalWorldIntent(raw);
  };

  app.ensureSubjectExperienceUi=function(){
    if(!document.querySelector('link[href="/src/ui/subjectExperience.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/subjectExperience.css';document.head.appendChild(l);}
    const panel=this.$('scopePanel');
    if(panel&&!this.$('subjectSheetHandle'))panel.insertAdjacentHTML('afterbegin',`<button id="subjectSheetHandle" class="subject-sheet-handle" type="button"><i></i><span>CONTACT DETAILS</span></button>`);
    const more=this.$('moreDialog')?.querySelector('.more-grid');
    if(more&&!this.$('cameraCoverageBtn'))more.insertAdjacentHTML('beforeend',`<button id="cameraCoverageBtn" class="preset-card" type="button"><strong>Camera Coverage</strong><small>Browse supported public camera regions, including Oklahoma City and Tulsa.</small></button>`);
    const host=document.getElementById('app');
    if(!this.$('cameraCoverageDialog'))host.insertAdjacentHTML('beforeend',`<dialog id="cameraCoverageDialog" class="modal glass"><div class="modal-card camera-coverage-card"><div class="modal-head"><div><b>Public Camera Coverage</b><small>SUPPORTED PUBLIC CATALOGS · NOT GLOBAL COVERAGE</small></div><button id="cameraCoverageClose" class="icon-btn" type="button">✕</button></div><div class="camera-coverage-note">ShadowNex only shows cameras from public catalogs that are connected and working. A place with no ShadowNex camera does not mean no camera exists there.</div><div id="cameraCoverageSources" class="camera-coverage-sources"></div><div id="cameraCoverageRegions" class="camera-coverage-regions"></div></div></dialog>`);
  };

  app.renderSubjectActions=function(meta){
    const box=this.$('scopeContent');if(!box)return;box.querySelector('.subject-action-rail')?.remove();
    const rail=document.createElement('div');rail.className='subject-action-rail';
    const add=(label,cls,fn)=>{const b=document.createElement('button');b.type='button';b.className=cls||'';b.textContent=label;b.onclick=e=>{e.stopPropagation();fn();};rail.appendChild(b);};
    if(['AIRCRAFT','VESSEL','SATELLITE'].includes(String(meta.type||'').toUpperCase()))add(this.globe.tracking?'RELEASE':'FOLLOW','primary',()=>{if(this.globe.tracking)this.globe.stopFollow();else this.globe.setTracking(true);setTimeout(()=>this.renderSubjectActions(this.globe.selected?.meta||meta),0);});
    add(this.favorites?.some?.(x=>x.key===subjectKey(meta))?'★ SAVED':'☆ FAVORITE','',()=>this.favoriteSelected?.());
    if(Number.isFinite(Number(meta.latitude))&&Number.isFinite(Number(meta.longitude)))add('WATCH 50 MI','',()=>this.watchSelectedSubjectArea(meta));
    add('PRIME HERE','',()=>this.openPrimeBrief?.(meta.name||'Selected subject'));
    add('WHERE IS THIS?','',()=>this.lookupSubjectPlace(meta));
    if(this.explainSubject)add('EXPLAIN','',()=>this.explainSubject(meta));
    const name=box.querySelector('.scope-name');if(name)name.insertAdjacentElement('afterend',rail);else box.prepend(rail);
  };

  app.watchSelectedSubjectArea=function(meta){
    const lat=Number(meta.latitude),lon=Number(meta.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon)){this.toast('This subject has no usable map position.');return;}
    const name=`${meta.name||meta.type||'Subject'} area`,area={id:makeId('area'),name,lat,lon,radiusKm:80.4672,createdAt:Date.now(),lastScan:null,hits:0,notable:0,alertsEnabled:true};
    this.watchAreas=[area,...(this.watchAreas||[])].slice(0,20);saveCollection('areas',this.watchAreas);this.scanWatchAreas?.();this.scanOperationalState?.();this.renderWatchCenter?.();this.toast(`Watching 50 miles around ${meta.name||meta.type}.`);
  };

  app.renderSubjectPlacePlaceholder=function(meta){
    const box=this.$('scopeContent');if(!box||!Number.isFinite(Number(meta.latitude))||!Number.isFinite(Number(meta.longitude)))return;
    let el=box.querySelector('.subject-place');if(!el){el=document.createElement('div');el.className='subject-place';const actions=box.querySelector('.subject-action-rail');actions?.insertAdjacentElement('afterend',el);}
    el.innerHTML='<span>MAP CONTEXT</span><b>Tap “WHERE IS THIS?” for nearby English place context.</b>';
  };

  app.lookupSubjectPlace=async function(meta){
    const box=this.$('scopeContent'),el=box?.querySelector('.subject-place');if(!el)return;
    const lat=Number(meta.latitude),lon=Number(meta.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    el.innerHTML='<span>MAP CONTEXT</span><b>Resolving nearby place…</b>';
    try{const r=await fetch(`/api/place?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`),d=await r.json();if(!d.available){el.innerHTML='<span>MAP CONTEXT</span><b>No English nearby-place context was returned.</b>';return;}el.innerHTML=`<span>MAP CONTEXT</span><b>${escapeHtml(d.label)}</b>${d.road?`<small>${escapeHtml(d.road)}</small>`:''}<small>${escapeHtml(d.source||'OpenStreetMap / Nominatim')}</small>`;}catch{el.innerHTML='<span>MAP CONTEXT</span><b>Nearby-place lookup is temporarily unavailable.</b>';}
  };

  app.openCameraCoverage=async function(){
    const d=this.$('cameraCoverageDialog'),sources=this.$('cameraCoverageSources'),regions=this.$('cameraCoverageRegions');if(!d.open)d.showModal();
    sources.innerHTML='<div class="profile-loading">Loading public camera catalogs…</div>';regions.innerHTML='';
    try{const r=await fetch('/api/cctv'),x=await r.json();const sourceMap=new Map((x.sources||[]).map(s=>[s.name,s]));
      sources.innerHTML=(x.sources||[]).map(s=>`<article class="coverage-source ${String(s.status||'').toLowerCase()}"><div><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(s.status==='LIVE'?'Catalog available':'Catalog degraded')}</small></div><b>${Number(s.count)||0}</b></article>`).join('')||'<div class="profile-empty">No camera source status returned.</div>';
      for(const region of x.regions||[]){const provider=sourceMap.get(region.provider),b=document.createElement('button');b.type='button';b.className='coverage-region';b.innerHTML=`<span><strong>${escapeHtml(region.name)}</strong><small>${escapeHtml(region.provider)} · ${provider?.status==='LIVE'?Number(provider.count||0)+' provider cameras loaded':'provider degraded'}</small></span><em>VIEW</em>`;b.onclick=async()=>{this.pushNavState?.('camera coverage');this.globe.flyTo(Number(region.lon),Number(region.lat),Number(region.alt)||180000);await this.setLayer('cctv',true);d.close();this.toast(`Public cameras enabled around ${region.name}.`);};regions.appendChild(b);}
    }catch(e){sources.innerHTML=`<div class="profile-empty">Camera coverage is temporarily unavailable: ${escapeHtml(e.message||String(e))}</div>`;}
  };

  app.installDossierRenderers=function(){
    this.aircraftProfileHtml=(meta,d)=>aircraftHtml(this,meta,d);
    this.satelliteProfileHtml=(meta,d)=>satelliteHtml(this,meta,d);
    this.vesselProfileHtml=meta=>vesselHtml(meta);
    this.cameraProfileHtml=meta=>cameraHtml(this,meta);
  };
}

function aircraftHtml(app,meta,d){const a=d.aircraft||{},r=d.route||{},o=r.origin||{},dest=r.destination||{},type=[a.manufacturer,a.type].filter(Boolean).join(' '),route=o.icao||dest.icao?`${o.name||o.icao||'Unknown origin'} → ${dest.name||dest.icao||'Unknown destination'}`:null,alt=feet(meta.altitude),spd=knots(meta.velocity),hdg=Number.isFinite(Number(meta.heading))?`${Math.round(Number(meta.heading))}°`:null;return `<div class="profile-title">AIRCRAFT DOSSIER <small>LIVE POSITION + PUBLIC REFERENCE</small></div>${app.mediaHtml?.(d.photoThumbnail||d.photo,`${meta.name||'Aircraft'} photo`)||''}<p class="profile-lead">${escapeHtml(type||a.registration||meta.name||'Public aircraft contact')}</p><div class="profile-grid">${cell('Callsign',meta.name)}${cell('Registration',a.registration)}${cell('Aircraft',type)}${cell('Registered owner',a.owner)}${cell('Mode-S / Hex',meta.id)}${cell('Altitude',alt)}${cell('Speed',spd)}${cell('Heading',hdg)}${cell('Ground state',meta.onGround?'ON GROUND':'AIRBORNE')}${route?`<div class="wide"><span>PUBLISHED ROUTE MATCH</span><b>${escapeHtml(route)}</b><small>${escapeHtml([o.iata||o.icao,dest.iata||dest.icao].filter(Boolean).join(' → '))}</small></div>`:''}</div><div class="profile-purpose"><span>MISSION / PURPOSE</span><p>${escapeHtml(d.purpose||'Specific mission/purpose is not publicly identified.')}</p></div><div class="profile-caveat">Aircraft identity and route references can be incomplete or stale. A callsign route is not proof of the aircraft’s current mission, cargo, crew, or passengers.</div>`;}

function satelliteHtml(app,meta,d){const alt=miles(meta.altitude),period=Number.isFinite(Number(meta.orbitPeriodMin))?`${Number(meta.orbitPeriodMin).toFixed(1)} min`:null,inc=Number.isFinite(Number(meta.inclinationDeg))?`${Number(meta.inclinationDeg).toFixed(1)}°`:null;return `<div class="profile-title">SATELLITE DOSSIER <small>ESTIMATED ORBIT + ENGLISH REFERENCE</small></div>${app.mediaHtml?.(d.photoThumbnail||d.photo,`${d.title||meta.name||'Satellite'} image`)||''}<p class="profile-lead">${escapeHtml(d.description||d.title||meta.name||'Public satellite')}</p><div class="profile-grid">${cell('NORAD ID',meta.noradId||meta.id)}${cell('Orbit band',meta.orbitClass)}${cell('Altitude',alt)}${cell('Orbit period',period)}${cell('Inclination',inc)}${cell('TLE epoch',meta.tleEpoch?new Date(meta.tleEpoch).toLocaleString('en-US'):null)}</div><div class="profile-purpose"><span>MISSION / PURPOSE</span><p>${escapeHtml(d.summary||'No English mission summary is available from the public reference source.')}</p></div><div class="profile-caveat">The displayed position is an estimate propagated from public TLE orbital elements, not direct live spacecraft telemetry.</div>${d.url?'<button class="ghost-btn wide profile-source" type="button">OPEN ENGLISH SOURCE</button>':''}`;}

function vesselHtml(m){const route=m.destination?`Published AIS destination: ${m.destination}${m.eta?` · ETA ${m.eta}`:''}.`:'Destination/purpose is not available in the current AIS record.';return `<div class="profile-title">VESSEL DOSSIER <small>PUBLIC AIS</small></div><p class="profile-lead">${escapeHtml(m.name||`MMSI ${m.id}`)}</p><div class="profile-grid">${cell('MMSI',m.id)}${cell('IMO',m.imo)}${cell('Call sign',m.callSign)}${cell('AIS vessel type',m.shipType)}${cell('Speed',Number.isFinite(Number(m.speed))?`${Number(m.speed).toFixed(1)} kt`:null)}${cell('Heading',Number.isFinite(Number(m.heading))?`${Math.round(Number(m.heading))}°`:null)}${cell('Course',Number.isFinite(Number(m.course))?`${Math.round(Number(m.course))}°`:null)}${cell('Dimensions',m.dimensions)}</div><div class="profile-purpose"><span>ROUTE / PURPOSE</span><p>${escapeHtml(route)}</p></div><div class="profile-caveat">AIS identity, destination, and ETA can be self-reported, delayed, incomplete, or absent.</div>`;}

function cameraHtml(app,m){return `<div class="profile-title">CAMERA DETAILS <small>${escapeHtml(m.source||'PUBLIC SOURCE')}</small></div>${app.mediaHtml?.(m.previewUrl,`${m.name||'Traffic camera'} current image`)||''}<p class="profile-lead">${escapeHtml([m.route,m.county,m.district,m.view].filter(Boolean).join(' · ')||'Published public traffic-camera location.')}</p><div class="profile-grid">${cell('Provider',m.source)}${cell('Status',m.available)}${cell('Direction',m.view)}${cell('Route / road',m.route)}${cell('County / district',m.county||m.district)}</div>${m.streamUrl?'<div class="profile-purpose"><span>LIVE CAMERA</span><p>The provider reports a public stream for this camera. Stream availability can change without notice.</p></div>':''}`;}

function cell(k,v){return v==null||v===''?'':`<div><span>${escapeHtml(String(k).toUpperCase())}</span><b>${escapeHtml(String(v))}</b></div>`;}
function feet(m){const n=Number(m);return Number.isFinite(n)?`${Math.round(n*3.28084).toLocaleString('en-US')} ft`:null;}
function miles(m){const n=Number(m);return Number.isFinite(n)?`${(n/1609.344>=100?Math.round(n/1609.344).toLocaleString('en-US'):(n/1609.344).toFixed(1))} mi`:null;}
function knots(ms){const n=Number(ms);return Number.isFinite(n)?`${Math.round(n*1.94384)} kt`:null;}
function subjectKey(m={}){return `${String(m.type||'CONTACT').toUpperCase()}:${String(m.id||m.name||'').toUpperCase()}`;}
