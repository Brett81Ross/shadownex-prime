import { clamp, haversineKm } from './geo.js';

const TYPE_BASE={EARTHQUAKE:34,FIRE:42,LAUNCH:38,AIRCRAFT:14,VESSEL:14,SATELLITE:9,MILITARY_SITE:18,INFRASTRUCTURE:10,CCTV:7,RADIO:4,BIKE:3};

export function metaTimestamp(meta={},sourceUpdatedAt=null){
  const direct=Number(meta.updatedAt||meta.time);
  if(Number.isFinite(direct)&&direct>0)return direct;
  for(const value of [meta.when,meta.net]){const ts=Date.parse(value);if(Number.isFinite(ts))return ts;}
  const fallback=Number(sourceUpdatedAt);return Number.isFinite(fallback)&&fallback>0?fallback:null;
}

export function inViewport(meta={},bounds=null){
  const lat=Number(meta.latitude),lon=Number(meta.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return false;if(!bounds)return true;
  const north=Math.max(bounds.north,bounds.south),south=Math.min(bounds.north,bounds.south);if(lat<south||lat>north)return false;
  const west=bounds.west,east=bounds.east;return west<=east?(lon>=west&&lon<=east):(lon>=west||lon<=east);
}

export function importanceFor(meta={},opts={}){
  const now=Number(opts.now)||Date.now(),center=opts.center||null,type=String(meta.type||'CONTACT').toUpperCase();let score=TYPE_BASE[type]??8;const reasons=[];
  const timestamp=metaTimestamp(meta,opts.sourceUpdatedAt),ageMs=timestamp?Math.max(0,now-timestamp):null;
  if(ageMs!=null){if(ageMs<5*60e3){score+=18;reasons.push('updated within 5 min');}else if(ageMs<60*60e3){score+=12;reasons.push('updated within 1 hr');}else if(ageMs<24*60*60e3){score+=6;reasons.push('within the past 24 hr');}}
  let distanceKm=null;if(center&&Number.isFinite(Number(meta.latitude))&&Number.isFinite(Number(meta.longitude))){distanceKm=haversineKm(center,{lat:Number(meta.latitude),lon:Number(meta.longitude)});if(distanceKm<50){score+=20;reasons.push(`${Math.round(distanceKm)} km from map center`);}else if(distanceKm<250){score+=14;reasons.push(`${Math.round(distanceKm)} km from map center`);}else if(distanceKm<1000){score+=7;reasons.push(`${Math.round(distanceKm)} km from map center`);}}
  if(type==='EARTHQUAKE'){const mag=Number(meta.magnitude);if(Number.isFinite(mag)){score+=clamp((mag-2)*10,0,36);reasons.unshift(`M${mag.toFixed(1)} earthquake`);}}
  if(type==='FIRE'){score+=16;reasons.unshift('active wildfire report/detection');const b=Number(meta.brightness);if(Number.isFinite(b)&&b>0)score+=clamp((b-300)/8,0,12);}
  if(type==='AIRCRAFT'&&meta.militaryLikely){score+=20;reasons.unshift('military-likely callsign heuristic');}
  if(type==='LAUNCH'){const net=Date.parse(meta.net);if(Number.isFinite(net)){const dt=net-now;if(dt>=0&&dt<=24*60*60e3){score+=28;reasons.unshift('launch within 24 hr');}else if(dt>0&&dt<=72*60*60e3){score+=17;reasons.unshift('launch within 72 hr');}}}
  const sourceStatus=String(opts.sourceStatus||'').toUpperCase();if(sourceStatus==='LIVE')score+=4;if(['STALE','DEGRADED','UNAVAILABLE'].includes(sourceStatus)){score-=18;reasons.push(`source ${sourceStatus.toLowerCase()}`);}
  score=Math.round(clamp(score,0,100));return {score,distanceKm,timestamp,reasons:[...new Set(reasons)].slice(0,4),level:score>=82?'HIGH':score>=68?'NOTABLE':score>=48?'WATCH':'ROUTINE'};
}

export function situationSummary(meta={},rank={}){
  const name=String(meta.name||meta.id||meta.type||'Contact'),type=String(meta.type||'CONTACT').toUpperCase();
  if(type==='EARTHQUAKE'){const mag=Number(meta.magnitude);return `${Number.isFinite(mag)?`M${mag.toFixed(1)} earthquake`:'Earthquake'} reported near ${name}.`;}
  if(type==='FIRE')return `Active wildfire report or detection: ${name}.`;
  if(type==='AIRCRAFT'&&meta.militaryLikely)return `${name} matches a military-likely callsign heuristic. This is not confirmation of military status.`;
  if(type==='AIRCRAFT')return `${name} is current public aircraft activity in this view.`;
  if(type==='VESSEL')return `${name} is a live AIS vessel contact in this view.`;
  if(type==='SATELLITE')return `${name} is an estimated satellite position calculated from public orbital elements.`;
  if(type==='LAUNCH')return `${name} is a reported launch event${meta.net?` scheduled for ${new Date(meta.net).toLocaleString()}`:''}.`;
  if(type==='MILITARY_SITE')return `${name} is community-mapped military context from OpenStreetMap.`;
  if(type==='INFRASTRUCTURE')return `${name} is mapped infrastructure context from a public source.`;
  if(type==='CCTV')return `${name} is a public camera location.`;
  return `${name} is a ${type.toLowerCase()} contact in the current view.`;
}

export function buildSituation(items=[],opts={}){
  const ranked=items.map(item=>({...item,rank:importanceFor(item.meta,{...opts,sourceUpdatedAt:item.sourceUpdatedAt,sourceStatus:item.sourceStatus})})).sort((a,b)=>b.rank.score-a.rank.score||String(a.meta.name||'').localeCompare(String(b.meta.name||'')));
  const counts={};for(const item of ranked){const t=String(item.meta.type||'CONTACT').toUpperCase();counts[t]=(counts[t]||0)+1;}
  const limit=Math.max(1,Math.min(8,Number(opts.limit)||5)),top=ranked.slice(0,limit),alerts=ranked.filter(x=>x.rank.score>=68).slice(0,5);
  return {ranked,top,alerts,counts,total:ranked.length};
}
