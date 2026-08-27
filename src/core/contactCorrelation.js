import { haversineKm } from './geo.js';
export function correlateContacts(selected,layers,{radiusKm=250,limit=8}={}){
  if(!Number.isFinite(selected?.latitude)||!Number.isFinite(selected?.longitude))return [];
  const origin={lat:selected.latitude,lon:selected.longitude};const out=[];
  for(const layer of layers||[]){if(!layer?.enabled)continue;for(const entity of layer.entities||[]){const meta=readMeta(entity);if(!meta||sameContact(selected,meta)||!Number.isFinite(meta.latitude)||!Number.isFinite(meta.longitude))continue;const distanceKm=haversineKm(origin,{lat:meta.latitude,lon:meta.longitude});if(distanceKm>radiusKm)continue;out.push({meta,entity,layerId:layer.id,distanceKm,relation:relation(selected,meta)});}}
  return out.sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,limit);
}
function readMeta(entity){try{return entity?.properties?.snxMeta?.getValue?.()??entity?.properties?.snxMeta??entity?.snxMeta??null}catch{return null}}
function sameContact(a,b){return String(a.id||a.name||'')===String(b.id||b.name||'')&&String(a.type||'')===String(b.type||'')}
function relation(a,b){if(a.type===b.type)return a.type==='AIRCRAFT'&&a.militaryLikely===b.militaryLikely?'SAME AIR COHORT':`SAME ${a.type} FEED`;if(a.type==='AIRCRAFT'&&b.type==='SATELLITE')return 'AIR / ORBIT PROXIMITY';if(a.type==='VESSEL'&&b.type==='AIRCRAFT')return 'MARITIME / AIR PROXIMITY';if(b.type==='EARTHQUAKE'||b.type==='FIRE')return 'EVENT PROXIMITY';if(b.type==='LAUNCH')return 'SPACE ACTIVITY PROXIMITY';return 'GEOSPATIAL PROXIMITY'}
