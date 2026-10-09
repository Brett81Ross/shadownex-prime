import { escapeHtml, haversineKm, fmtDistanceKm } from '../core/geo.js';
import { imageryZoom } from '../core/worldQuery.js';
import { explorerAltitude, detailBand, pointLabel } from '../core/worldExplorer.js';

export function installWorldExplorer(app){
  const originalBind=app.bindUi.bind(app),originalInit=app.init.bind(app),originalWorldIntent=app.runWorldIntent.bind(app);

  app.bindUi=function(){
    originalBind();this.ensureWorldExplorerUi();
    const nav=this.$('navHere');if(nav){nav.textContent='GLOBE';nav.onclick=()=>this.openWorldExplorer();}
    this.$('worldExplorerBtn').onclick=()=>{this.$('moreDialog')?.close();this.openWorldExplorer();};
    this.$('worldExplorerClose').onclick=()=>this.$('worldExplorerDialog').close();
    this.$('explorerSearchBtn').onclick=()=>this.searchWorldExplorer();
    this.$('explorerSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.searchWorldExplorer();}});
    this.$('explorerInspectCenter').onclick=()=>this.inspectWorldPoint(this.globe.focusCoordinates(),{mark:true});
    this.$('explorerTapMap').onclick=()=>this.armExplorerTap();
    this.$('explorerWhatsHere').onclick=()=>{this.$('worldExplorerDialog').close();this.openSituationBrief();};
    this.$('explorerPrime').onclick=()=>{this.$('worldExplorerDialog').close();this.openPrimeBrief?.(this.explorerPlace?.label||'Current view');};
    this.$('explorerImagery').onclick=()=>this.inspectWorldPoint(this.explorerPoint||this.globe.focusCoordinates(),{mark:true,imageryOnly:true});
    this.$('explorerCameras').onclick=()=>this.findExplorerCameras();
    this.$('explorerSave').onclick=()=>{this.saveCurrentView?.();};
    this.$('explorerWatch').onclick=()=>this.watchExplorerPoint();
    this.$('explorerClearPin').onclick=()=>this.clearExplorerMarker();
  };

  app.init=async function(){
    const out=await originalInit();this.explorerPoint=null;this.explorerPlace=null;this.explorerImagery=null;return out;
  };

  app.runWorldIntent=async function(raw){
    const text=String(raw||'').trim(),m=text.match(/^(?:explore|inspect|show me|go to)s+(.+)$/i);
    if(m&&m[1]&&!/^(?:the )?(?:iss|biggest earthquake|military)/i.test(m[1])){const hits=await this.geocodeExplorer(m[1]);if(hits.length){await this.openExplorerResult(hits[0]);return true;}}if(/^\d+\s+\S+/.test(text)){const hits=await this.geocodeExplorer(text);if(hits.length){await this.openExplorerResult(hits[0]);return true;}}
    if(/^(?:globe|world explorer|explore map)$/i.test(text)){this.openWorldExplorer();return true;}
    return await originalWorldIntent(raw);
  };

  app.ensureWorldExplorerUi=function(){
    if(!document.querySelector('link[href="/src/ui/worldExplorer.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/worldExplorer.css';document.head.appendChild(l);}
    const more=this.$('moreDialog')?.querySelector('.more-grid');
    if(more&&!this.$('worldExplorerBtn'))more.insertAdjacentHTML('afterbegin',`<button id="worldExplorerBtn" class="preset-card" type="button"><strong>World Explorer</strong><small>Inspect a place, address, imagery, and nearby public cameras.</small></button>`);
    const host=document.getElementById('app');
    if(!this.$('worldExplorerDialog'))host.insertAdjacentHTML('beforeend',`<dialog id="worldExplorerDialog" class="modal glass world-explorer-dialog"><div class="modal-card world-explorer-card"><div class="modal-head"><div><b>World Explorer</b><small>PLACE · ADDRESS · IMAGERY · CAMERAS · BRIEF</small></div><button id="worldExplorerClose" class="icon-btn" type="button">✕</button></div><div class="explorer-search"><input id="explorerSearchInput" autocomplete="off" placeholder="Search an address, landmark, city, or place"><button id="explorerSearchBtn" type="button">SEARCH</button></div><div id="explorerSearchResults" class="explorer-search-results"></div><section id="explorerPointCard" class="explorer-point-card"><div class="explorer-point-empty">Inspect the center of the globe, search a place, or tap a point on the map.</div></section><div class="explorer-actions"><button id="explorerInspectCenter" type="button">INSPECT CENTER</button><button id="explorerTapMap" type="button">TAP MAP</button><button id="explorerWhatsHere" type="button">WHAT'S HERE</button><button id="explorerPrime" type="button">PRIME BRIEF</button><button id="explorerImagery" type="button">IMAGERY INFO</button><button id="explorerCameras" type="button">CAMERAS NEARBY</button><button id="explorerSave" type="button">SAVE VIEW</button><button id="explorerWatch" type="button">WATCH 50 MI</button></div><div id="explorerCameraResults" class="explorer-camera-results"></div><button id="explorerClearPin" class="ghost-btn" type="button">CLEAR INSPECTION PIN</button><div class="explorer-truth">Imagery is not live. Camera coverage is limited to connected public catalogs. Address/place context comes from English OpenStreetMap/Nominatim results and may be incomplete.</div></div></dialog>`);
  };

  app.openWorldExplorer=function(point=null){
    const d=this.$('worldExplorerDialog');if(!d.open)d.showModal();
    if(point)this.inspectWorldPoint(point,{mark:true});
    else if(!this.explorerPoint)this.inspectWorldPoint(this.globe.focusCoordinates(),{mark:false});
  };

  app.geocodeExplorer=async function(query){
    try{const r=await fetch(`/api/geocode?q=${encodeURIComponent(query)}`),d=await r.json();return Array.isArray(d.results)?d.results:[];}catch{return [];}
  };

  app.searchWorldExplorer=async function(){
    const q=this.$('explorerSearchInput').value.trim(),host=this.$('explorerSearchResults');if(!q)return;
    host.innerHTML='<div class="profile-loading">Searching English place/address results…</div>';
    const rows=await this.geocodeExplorer(q);host.innerHTML='';
    if(!rows.length){host.innerHTML='<div class="profile-empty">No matching English place/address result was returned.</div>';return;}
    for(const row of rows){const b=document.createElement('button');b.type='button';b.className='explorer-result';b.innerHTML=`<span><strong>${escapeHtml(row.name||row.displayName||q)}</strong><small>${escapeHtml([row.road,row.locality,row.region,row.postcode,row.country].filter(Boolean).join(' · ')||row.displayName||'Mapped place')}</small></span><em>VIEW</em>`;b.onclick=()=>this.openExplorerResult(row);host.appendChild(b);}
  };

  app.openExplorerResult=async function(row){
    const d=this.$('worldExplorerDialog');if(d&&!d.open)d.showModal();const alt=explorerAltitude(row);this.pushNavState?.('world explorer');this.globe.flyTo(Number(row.lon),Number(row.lat),alt);this.showExplorerMarker({lat:Number(row.lat),lon:Number(row.lon),height:0});await this.inspectWorldPoint({lat:Number(row.lat),lon:Number(row.lon),height:0},{mark:false});this.recordActivity?.('view',`Explored ${row.name||row.displayName||'place'}`);this.toast(`Exploring ${row.name||row.locality||'mapped place'}.`);
  };

  app.armExplorerTap=function(){
    this.$('worldExplorerDialog').close();this.globe.armGroundInspect(point=>{this.showExplorerMarker(point);this.openWorldExplorer(point);});this.toast('Tap open ground on the globe to inspect that location.');
  };

  app.inspectWorldPoint=async function(point,{mark=false,imageryOnly=false}={}){
    const lat=Number(point?.lat),lon=Number(point?.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    this.explorerPoint={lat,lon,height:Number(point.height)||0};if(mark)this.showExplorerMarker(this.explorerPoint);
    const card=this.$('explorerPointCard');card.innerHTML='<div class="profile-loading">Resolving place and imagery details…</div>';
    const z=imageryZoom(this.globe.state().alt);
    const [place,imagery]=await Promise.all([this.fetchExplorerPlace(lat,lon),this.fetchExplorerImagery(lat,lon,z)]);
    this.explorerPlace=place;this.explorerImagery=imagery;this.renderExplorerPoint(imageryOnly);
  };

  app.fetchExplorerPlace=async function(lat,lon){try{const r=await fetch(`/api/place?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`);return await r.json();}catch{return {available:false,source:'OpenStreetMap / Nominatim'};}};
  app.fetchExplorerImagery=async function(lat,lon,z){try{const r=await fetch(`/api/imagery?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&z=${z}`);return await r.json();}catch{return {available:false,source:'Esri World Imagery'};}};

  app.renderExplorerPoint=function(imageryOnly=false){
    const p=this.explorerPoint,place=this.explorerPlace||{},im=this.explorerImagery||{},host=this.$('explorerPointCard');if(!p||!host)return;
    const band=detailBand(im.resolutionMeters),address=[place.street,place.neighbourhood,place.locality,place.region,place.postcode,place.country].filter(Boolean),title=pointLabel(place,p.lat,p.lon);
    const placeBlock=imageryOnly?'':`<div class="explorer-place"><span>PLACE</span><strong>${escapeHtml(title)}</strong>${address.length?`<small>${escapeHtml(address.join(' · '))}</small>`:''}<small>${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</small></div>`;
    const imageryBlock=`<div class="explorer-imagery"><div><span>IMAGERY DETAIL</span><b class="detail-${band.label.toLowerCase().replace(/\s+/g,'-')}">${escapeHtml(band.label)}</b></div><strong>${escapeHtml(im.source||'Esri World Imagery')}</strong><small>${escapeHtml(band.detail)}${im.captureDate?` · captured ${escapeHtml(im.captureDate)}`:''}</small><small>${im.accuracyMeters!=null?`Approx. positional accuracy ${(Number(im.accuracyMeters)*3.28084).toFixed(1)} ft · `:''}not live imagery</small></div>`;
    host.innerHTML=placeBlock+imageryBlock;
  };

  app.showExplorerMarker=function(point){
    const C=window.Cesium;if(!C||!this.globe?.viewer)return;if(this.explorerMarker)try{this.globe.viewer.entities.remove(this.explorerMarker)}catch{}
    this.explorerMarker=this.globe.viewer.entities.add({position:C.Cartesian3.fromDegrees(Number(point.lon),Number(point.lat),Math.max(3,Number(point.height)||3)),point:{pixelSize:14,color:C.Color.fromCssColorString('#ff6a00'),outlineColor:C.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}});
    this.globe.requestRender?.();
  };
  app.clearExplorerMarker=function(){if(this.explorerMarker)try{this.globe.viewer.entities.remove(this.explorerMarker)}catch{}this.explorerMarker=null;this.explorerPoint=null;this.explorerPlace=null;this.explorerImagery=null;this.$('explorerPointCard').innerHTML='<div class="explorer-point-empty">Inspection pin cleared.</div>';this.$('explorerCameraResults').innerHTML='';this.globe.requestRender?.();};

  app.explorerCameraHits=function(radiusKm=40.2336){
    const point=this.explorerPoint||this.globe.focusCoordinates(),layer=this.layers.get('cctv'),out=[];for(const e of layer?.entities||[]){const m=this.contactMeta?.(e);if(!m)continue;const lat=Number(m.latitude),lon=Number(m.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const distance=haversineKm({lat:point.lat,lon:point.lon},{lat,lon});if(distance<=radiusKm)out.push({entity:e,meta:m,distance});}return out.sort((a,b)=>a.distance-b.distance).slice(0,8);
  };

  app.findExplorerCameras=async function(){
    if(!this.explorerPoint)this.explorerPoint=this.globe.focusCoordinates();const host=this.$('explorerCameraResults');host.innerHTML='<div class="profile-loading">Loading nearby public-camera coverage…</div>';
    await this.setLayer('cctv',true);const hits=this.explorerCameraHits();
    if(!hits.length){host.innerHTML='<div class="profile-empty">No connected public camera is loaded within 25 miles of this point. This does not mean no cameras exist there.</div>';return;}
    host.innerHTML='<div class="explorer-camera-head">PUBLIC CAMERAS WITHIN 25 MILES</div>';
    for(const hit of hits){const b=document.createElement('button');b.type='button';b.className='explorer-camera';b.innerHTML=`<span><strong>${escapeHtml(hit.meta.name||'Public Camera')}</strong><small>${escapeHtml(hit.meta.source||'Public catalog')}</small></span><em>${escapeHtml(fmtDistanceKm(hit.distance))}</em>`;b.onclick=()=>{this.globe.select(hit.meta,hit.entity);this.globe.smartFocus?.(hit.meta);this.$('worldExplorerDialog').close();};host.appendChild(b);}
  };

  app.watchExplorerPoint=function(){
    const p=this.explorerPoint||this.globe.focusCoordinates(),name=this.explorerPlace?.label||'World Explorer point';this.watchSelectedSubjectArea?.({type:'LOCATION',name,latitude:p.lat,longitude:p.lon,source:'World Explorer'});
  };
}

function wait(ms){return new Promise(r=>setTimeout(r,ms));}
