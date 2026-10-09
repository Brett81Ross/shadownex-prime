import { escapeHtml, fmtDistanceKm } from '../core/geo.js';
import { loadCollection, saveCollection, makeId } from '../core/watchStore.js';
import { operationalEventKey, isOperationalNotable, normalizeOperationalEvent, mergeOperationalHistory, historyInWindow, scanOperationalWatch, parseExplicitNearMe, alertText } from '../core/operations.js';
import { sourcePlainState } from '../core/trust.js';

export function installOperationalEnhancements(app){
  const originalBind=app.bindUi.bind(app),originalInit=app.init.bind(app),originalRenderWatch=app.renderWatchCenter.bind(app),originalRenderAreas=app.renderWatchAreas.bind(app),originalSetWindow=app.setActivityWindow.bind(app),originalWorldIntent=app.runWorldIntent.bind(app),originalNearby=app.renderNearbyContext.bind(app);

  app.bindUi=function(){
    originalBind();this.ensureOperationalUi();
    this.$('clearWatchAlertsBtn').onclick=()=>this.clearWatchAlerts();
    this.$('clearEventHistoryBtn').onclick=()=>this.clearEventHistory();
  };

  app.init=async function(){
    const out=await originalInit();
    this.eventHistory=loadCollection('events');
    this.watchAlerts=loadCollection('alerts');
    this._operationalReady=false;
    this.registry.addEventListener('change',()=>this.scheduleOperationalScan());
    this.operationalTimer=setInterval(()=>this.scanOperationalState(),60000);
    this.scanOperationalState();
    this._operationalReady=true;
    this.renderWatchCenter();
    return out;
  };

  app.renderWatchCenter=function(){originalRenderWatch();this.renderWatchAlerts();this.renderEventHistory();this.refreshWatchAlertBadge();};
  app.renderWatchAreas=function(){
    originalRenderAreas();const host=this.$?.('watchAreasList');if(!host||!this.watchAreas?.length)return;
    const rows=[...host.querySelectorAll('.watch-item')];
    this.watchAreas.forEach((area,i)=>{const row=rows[i],actions=row?.querySelector('.watch-item-actions');if(!actions)return;area.alertsEnabled=area.alertsEnabled!==false;const b=document.createElement('button');b.type='button';b.className='watch-alert-toggle'+(area.alertsEnabled?' active':'');b.textContent=area.alertsEnabled?'ALERTS ON':'ALERTS OFF';b.onclick=()=>{area.alertsEnabled=!area.alertsEnabled;saveCollection('areas',this.watchAreas);this.renderWatchCenter();this.toast(`${area.name} alerts ${area.alertsEnabled?'enabled':'muted'}.`);};actions.insertBefore(b,actions.firstChild);});
  };
  app.setActivityWindow=function(hours){originalSetWindow(hours);this.renderEventHistory();};

  app.runWorldIntent=async function(raw){
    const near=parseExplicitNearMe(raw);
    if(near)return await this.runExplicitNearMe(near,raw);
    return await originalWorldIntent(raw);
  };

  app.renderNearbyContext=function(meta){
    originalNearby(meta);const card=this.$?.('scopeContent')?.querySelector('.plain-context-card');if(!card||!meta)return;
    card.querySelector('.context-operational')?.remove();
    const enabled=[...this.layers.values()].filter(l=>l.enabled).map(l=>({...this.registry.get(l.id),id:l.id,label:l.label}));
    const live=enabled.filter(x=>x.status==='LIVE').length,partial=enabled.filter(x=>['DEGRADED','STALE','UNAVAILABLE','SYNC','FALLBACK'].includes(x.status)).length;
    const memberships=(this.watchAreas||[]).filter(a=>insideArea(meta,a)).map(a=>a.name);
    const selectedState=this.sourceStateForMeta?.(meta);
    const box=document.createElement('div');box.className='context-operational';
    box.innerHTML=`<div><span>SELECTED SOURCE</span><b>${escapeHtml(selectedState?sourcePlainState(selectedState):'Public source')}</b></div><div><span>ENABLED COVERAGE</span><b>${live} live${partial?` · ${partial} partial`:''}</b></div><div class='wide'><span>WATCH AREA</span><b>${escapeHtml(memberships.length?memberships.join(' · '):'Not inside a saved Watch Area')}</b></div>`;
    card.appendChild(box);
  };

  app.ensureOperationalUi=function(){
    if(!document.querySelector('link[href="/src/ui/operations.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/src/ui/operations.css';document.head.appendChild(l);}
    const tabs=this.$('watchDialog')?.querySelector('.watch-tabs');
    if(tabs&&!tabs.querySelector('[data-watch-tab="alerts"]'))tabs.querySelector('[data-watch-tab="activity"]')?.insertAdjacentHTML('beforebegin',`<button data-watch-tab='alerts'>ALERTS <em id='watchAlertTabCount' class='hidden'>0</em></button>`);
    const activity=this.$('watchTabActivity');
    if(activity&&!this.$('eventHistoryList'))activity.insertAdjacentHTML('beforeend',`<section class='event-history-block'><div class='event-history-head'><div><b>LOCAL EVENT HISTORY</b><small>NOTABLE EVENTS OBSERVED FROM LOADED FEEDS ON THIS DEVICE · UP TO 24 HOURS</small></div><button id='clearEventHistoryBtn' class='ghost-btn' type='button'>CLEAR EVENTS</button></div><div class='event-history-note'>This is a local observation history, not a complete historical archive. ShadowNex only records what its enabled feeds actually loaded while the app was used.</div><div id='eventHistoryList' class='watch-list event-history-list'></div></section>`);
    if(!this.$('watchTabAlerts'))this.$('watchTabActivity')?.insertAdjacentHTML('beforebegin',`<section id='watchTabAlerts' class='watch-tab'><div class='watch-alert-head'><div><b>WATCH ALERTS</b><small>NEW NOTABLE ACTIVITY INSIDE WATCH AREAS</small></div><button id='clearWatchAlertsBtn' class='ghost-btn' type='button'>CLEAR ALERTS</button></div><div class='watch-note'>Alerts run only while ShadowNex is open and the relevant public feeds are loaded. The first scan establishes a baseline and does not alert on activity that was already present.</div><div id='watchAlertsList' class='watch-list'></div></section>`);
    document.querySelectorAll('[data-watch-tab]').forEach(b=>b.onclick=()=>this.showWatchTab(b.dataset.watchTab));
  };

  app.scheduleOperationalScan=function(){clearTimeout(this._operationalScanDelay);this._operationalScanDelay=setTimeout(()=>this.scanOperationalState(),500);};

  app.collectOperationalItems=function(){
    const items=[];for(const layer of this.layers.values()){const state=this.registry.get(layer.id)||{};for(const entity of layer.entities||[]){const meta=this.contactMeta?.(entity);if(!meta||meta.type==='CLUSTER')continue;items.push({meta,entity,layerId:layer.id,sourceState:state});}}return items;
  };

  app.scanOperationalState=function(){
    const now=Date.now(),items=this.collectOperationalItems(),notable=items.filter(x=>isOperationalNotable(x.meta));
    const oldKeys=new Set((this.eventHistory||[]).map(x=>x.key));
    const normalized=notable.map(x=>normalizeOperationalEvent(x.meta,x.sourceState,now));
    this.eventHistory=mergeOperationalHistory(this.eventHistory||[],normalized,now);
    saveCollection('events',this.eventHistory);

    if(this._operationalReady){
      for(const e of normalized)if(!oldKeys.has(e.key))this.recordActivity('intel',eventActivityText(e),e.meta);
    }

    let toastText=null;
    for(const area of this.watchAreas||[]){
      area.alertsEnabled=area.alertsEnabled!==false;
      const hadBaseline=Array.isArray(area.operationalSeen);
      const result=scanOperationalWatch(area,items,area.operationalSeen||[]);
      area.operationalHits=result.hits;area.operationalNotable=result.notable;area.lastOperationalScan=now;
      if(hadBaseline&&area.alertsEnabled&&result.newNotable.length){
        for(const hit of result.newNotable){const alert=this.createWatchAlert(area,hit,now);if(alert&&!toastText)toastText=alert.text;}
      }
      area.operationalSeen=result.currentKeys.slice(0,80);
    }
    saveCollection('areas',this.watchAreas||[]);
    saveCollection('alerts',this.watchAlerts||[]);
    if(toastText)this.toast(`Watch Alert · ${toastText}`);
    if(this.$?.('watchDialog')?.open)this.renderWatchCenter();else this.refreshWatchAlertBadge();
  };

  app.createWatchAlert=function(area,hit,now=Date.now()){
    const dedupe=`${area.id}:${hit.key}`;
    if((this.watchAlerts||[]).some(a=>a.dedupe===dedupe))return null;
    const text=alertText(area.name,hit.meta),alert={id:makeId('alert'),dedupe,time:now,areaId:area.id,areaName:area.name,eventKey:hit.key,text,read:false,distanceKm:hit.distanceKm,meta:normalizeOperationalEvent(hit.meta,hit.sourceState||{},now).meta};
    this.watchAlerts=[alert,...(this.watchAlerts||[])].slice(0,60);
    this.recordActivity('alert',text,hit.meta);
    return alert;
  };

  app.renderWatchAlerts=function(){
    const host=this.$?.('watchAlertsList');if(!host)return;const list=this.watchAlerts||[];host.innerHTML=list.length?'':'<div class="watch-empty">No Watch Alerts yet. New notable activity inside an enabled Watch Area will appear here while ShadowNex is open.</div>';
    for(const a of list){const row=document.createElement('article');row.className='watch-item operational-alert'+(a.read?' read':' unread');row.innerHTML=`<div><strong>${escapeHtml(a.text)}</strong><small>${escapeHtml(fmtDistanceKm(a.distanceKm))} from watch center · ${new Date(a.time).toLocaleString('en-US')}</small></div><div class='watch-item-actions'><button data-open>OPEN</button><button data-explain>EXPLAIN</button><button data-delete>✕</button></div>`;row.querySelector('[data-open]').onclick=()=>this.openOperationalRecord(a.eventKey,a.meta,a.id);row.querySelector('[data-explain]').onclick=()=>this.explainSubject?.(a.meta||{});row.querySelector('[data-delete]').onclick=()=>{this.watchAlerts=this.watchAlerts.filter(x=>x.id!==a.id);saveCollection('alerts',this.watchAlerts);this.renderWatchCenter();};host.appendChild(row);}
  };

  app.renderEventHistory=function(){
    const host=this.$?.('eventHistoryList');if(!host)return;const list=historyInWindow(this.eventHistory||[],this.activityWindowHours||24);
    host.innerHTML=list.length?'':'<div class="watch-empty">No locally observed notable events in this time window.</div>';
    for(const e of list.slice(0,50)){const row=document.createElement('article');row.className='watch-item event-history-item';row.innerHTML=`<div><strong>${escapeHtml(eventName(e))}</strong><small>${escapeHtml(e.source)} · ${new Date(e.eventAt||e.lastSeen).toLocaleString('en-US')} · observed locally ${new Date(e.lastSeen).toLocaleTimeString('en-US')}</small></div><div class='watch-item-actions'><button data-open>OPEN</button><button data-explain>EXPLAIN</button></div>`;row.querySelector('[data-open]').onclick=()=>this.openOperationalRecord(e.key,e.meta);row.querySelector('[data-explain]').onclick=()=>this.explainSubject?.(e.meta||{});host.appendChild(row);}
  };

  app.refreshWatchAlertBadge=function(){
    const unread=(this.watchAlerts||[]).filter(a=>!a.read).length,tab=this.$?.('watchAlertTabCount'),nav=this.$?.('navLayers');
    if(tab){tab.textContent=String(unread);tab.classList.toggle('hidden',!unread);}
    if(nav)nav.innerHTML=unread?`WATCH <b class='nav-alert-badge'>${unread}</b>`:'WATCH';
  };

  app.openOperationalRecord=function(key,meta={},alertId=null){
    if(alertId){const a=this.watchAlerts.find(x=>x.id===alertId);if(a)a.read=true;saveCollection('alerts',this.watchAlerts);this.refreshWatchAlertBadge();}
    for(const layer of this.layers.values())for(const entity of layer.entities||[]){const m=this.contactMeta?.(entity);if(m&&operationalEventKey(m)===key){this.globe.select(m,entity);this.globe.smartFocus?.(m);this.$('watchDialog')?.close();return;}}
    const lat=Number(meta?.latitude),lon=Number(meta?.longitude);if(Number.isFinite(lat)&&Number.isFinite(lon)){this.globe.flyTo(lon,lat,180000);this.$('watchDialog')?.close();this.toast('Showing last locally observed position; this event/contact is not currently loaded.');}else this.toast('This historical item is not currently loaded.');
  };

  app.clearWatchAlerts=function(){this.watchAlerts=[];saveCollection('alerts',[]);this.renderWatchCenter();};
  app.clearEventHistory=function(){this.eventHistory=[];saveCollection('events',[]);this.renderWatchCenter();};

  app.runExplicitNearMe=function(intent,raw){
    if(!navigator.geolocation){this.toast('Device location is not available here. Search a place instead.');return Promise.resolve(true);}
    this.toast('Requesting device location for this search…');
    return new Promise(resolve=>navigator.geolocation.getCurrentPosition(async pos=>{
      const lat=pos.coords.latitude,lon=pos.coords.longitude;this.globe.flyTo(lon,lat,220000);
      if(intent.layer)await this.setLayer(intent.layer,true);
      this.recordActivity('search',raw);
      if(intent.kind==='situation')setTimeout(()=>this.openPrimeBrief?.('Near me'),900);
      this.toast(intent.layer?`${layerLabel(intent.layer)} enabled near your device location.`:'Centered near your device location.');
      resolve(true);
    },()=>{this.toast('Location was not available. Search a place instead.');resolve(true);},{enableHighAccuracy:false,timeout:10000,maximumAge:300000}));
  };
}

function insideArea(meta,area){const lat=Number(meta?.latitude),lon=Number(meta?.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return false;const dlat=(lat-Number(area.lat))*69,dlon=(lon-Number(area.lon))*69*Math.cos(lat*Math.PI/180);return Math.hypot(dlat,dlon)<=Number(area.radiusKm||0)*.621371;}
function eventActivityText(e){if(e.type==='EARTHQUAKE')return `New loaded M${Number(e.magnitude||0).toFixed(1)} earthquake · ${e.name}`;if(e.type==='FIRE')return `New loaded wildfire event/detection · ${e.name}`;if(e.type==='LAUNCH')return `New loaded launch activity · ${e.name}`;if(e.type==='AIRCRAFT'&&e.militaryLikely)return `New military-likely aircraft heuristic · ${e.name}`;return `New notable loaded activity · ${e.name}`;}
function eventName(e){if(e.type==='EARTHQUAKE')return `M${Number(e.magnitude||0).toFixed(1)} · ${e.name}`;if(e.type==='AIRCRAFT'&&e.militaryLikely)return `${e.name} · military-likely heuristic`;return e.name||e.type;}
function layerLabel(id){return ({aircraft:'Aircraft',cctv:'Cameras',fires:'Fires',earthquakes:'Earthquakes',satellites:'Satellites',vessels:'Vessels'})[id]||id;}
