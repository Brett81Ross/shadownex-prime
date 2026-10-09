import { haversineKm } from './geo.js';

export function operationalEventKey(meta={}){
  const type=String(meta.type||'CONTACT').toUpperCase(),id=String(meta.id||'').trim();
  if(id)return `${type}:${id.toUpperCase()}`;
  const name=String(meta.name||type).trim().toUpperCase(),lat=round(meta.latitude,3),lon=round(meta.longitude,3),time=eventTime(meta);
  const bucket=Number.isFinite(time)?Math.floor(time/3600000):0;
  return `${type}:${name}:${lat}:${lon}:${bucket}`;
}
export function eventTime(meta={}){
  let t=Number(meta.updatedAt||meta.time);if(!Number.isFinite(t)&&meta.when)t=Date.parse(meta.when);if(!Number.isFinite(t)&&meta.net)t=Date.parse(meta.net);return Number.isFinite(t)?t:null;
}
export function isOperationalNotable(meta={}){
  const type=String(meta.type||'').toUpperCase();
  if(type==='EARTHQUAKE')return Number(meta.magnitude)>=4;
  if(type==='FIRE'||type==='LAUNCH')return true;
  if(type==='AIRCRAFT')return !!meta.militaryLikely;
  return false;
}
export function normalizeOperationalEvent(meta={},sourceState={},now=Date.now()){
  const key=operationalEventKey(meta),type=String(meta.type||'CONTACT').toUpperCase(),eventAt=eventTime(meta);
  return {key,type,name:String(meta.name||type),source:String(meta.source||sourceState.provenance||'Public source'),eventAt,firstSeen:now,lastSeen:now,latitude:num(meta.latitude),longitude:num(meta.longitude),magnitude:num(meta.magnitude),militaryLikely:!!meta.militaryLikely,status:meta.status||null,sourceStatus:sourceState.status||null,meta:compactOperationalMeta(meta)};
}
export function mergeOperationalHistory(history=[],events=[],now=Date.now(),max=160){
  const map=new Map(history.map(x=>[x.key,x]));
  for(const e of events){const old=map.get(e.key);map.set(e.key,old?{...old,...e,firstSeen:old.firstSeen||e.firstSeen,lastSeen:now}:e);}
  const cutoff=now-24*3600000;
  return [...map.values()].filter(x=>(Number(x.lastSeen)||0)>=cutoff).sort((a,b)=>(b.eventAt||b.lastSeen)-(a.eventAt||a.lastSeen)).slice(0,max);
}
export function historyInWindow(history=[],hours=24,now=Date.now()){
  const cutoff=now-Math.max(.0833,Number(hours)||24)*3600000;
  return history.filter(x=>(Number(x.eventAt)||Number(x.lastSeen)||0)>=cutoff).sort((a,b)=>(b.eventAt||b.lastSeen)-(a.eventAt||a.lastSeen));
}
export function scanOperationalWatch(area={},items=[],previousKeys=[]){
  const notable=[],all=[];for(const item of items){const m=item.meta||item,lat=num(m.latitude),lon=num(m.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const distanceKm=haversineKm({lat:Number(area.lat),lon:Number(area.lon)},{lat,lon});if(distanceKm>Number(area.radiusKm||0))continue;all.push(item);if(isOperationalNotable(m))notable.push({...item,key:operationalEventKey(m),distanceKm});}
  const current=[...new Set(notable.map(x=>x.key))],prev=new Set(previousKeys||[]),newNotable=notable.filter(x=>!prev.has(x.key));
  return {hits:all.length,notable:notable.length,currentKeys:current,newNotable};
}
export function parseExplicitNearMe(raw=''){
  const q=String(raw).trim().toLowerCase();if(!q)return null;
  const explicit=/\b(?:near me|around me|over me|nearby)\b/.test(q)||/\bwhat(?:'s| is)\s+(?:flying|happening)\s+(?:over|around|near)\s+me\b/.test(q);if(!explicit)return null;
  if(/\b(?:aircraft|planes?|flights?|flying)\b/.test(q))return {layer:'aircraft',kind:'layer'};
  if(/\b(?:camera|cctv)s?\b/.test(q))return {layer:'cctv',kind:'layer'};
  if(/\b(?:fires?|wildfires?)\b/.test(q))return {layer:'fires',kind:'layer'};
  if(/\b(?:earthquakes?|quakes?)\b/.test(q))return {layer:'earthquakes',kind:'layer'};
  if(/\b(?:satellites?)\b/.test(q))return {layer:'satellites',kind:'layer'};
  if(/\b(?:vessels?|ships?)\b/.test(q))return {layer:'vessels',kind:'layer'};
  return {layer:null,kind:'situation'};
}
export function alertText(areaName,meta={}){
  const type=String(meta.type||'CONTACT').toUpperCase(),name=String(meta.name||type);
  if(type==='EARTHQUAKE')return `${areaName}: M${Number(meta.magnitude||0).toFixed(1)} earthquake · ${name}`;
  if(type==='FIRE')return `${areaName}: new loaded wildfire event/detection · ${name}`;
  if(type==='LAUNCH')return `${areaName}: launch activity loaded · ${name}`;
  if(type==='AIRCRAFT'&&meta.militaryLikely)return `${areaName}: military-likely aircraft heuristic · ${name}`;
  return `${areaName}: notable loaded activity · ${name}`;
}
function compactOperationalMeta(meta={}){const keys=['type','id','name','source','latitude','longitude','altitude','magnitude','militaryLikely','status','updatedAt','time','when','net','url'];const out={};for(const k of keys)if(meta[k]!=null&&meta[k]!=='')out[k]=meta[k];return out;}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function round(v,d){const n=Number(v);return Number.isFinite(n)?n.toFixed(d):'NA';}
