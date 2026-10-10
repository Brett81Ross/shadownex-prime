import { situationSummary } from './situation.js';

export function uncertaintyFor(meta={},sourceState={}){
  const sourceStatus=String(sourceState?.status||'').toUpperCase(),type=String(meta.type||'CONTACT').toUpperCase();
  if(['STALE','DEGRADED','UNAVAILABLE'].includes(sourceStatus))return 'STALE';
  if(type==='SATELLITE')return 'ESTIMATED';
  if(type==='AIRCRAFT'&&meta.militaryLikely)return 'HEURISTIC';
  if(type==='EARTHQUAKE'&&String(meta.status||'').toLowerCase()==='reviewed')return 'CONFIRMED';
  if(type==='LAUNCH'&&/success|failure|complete/i.test(String(meta.status||'')))return 'CONFIRMED';
  return 'REPORTED';
}
export function uncertaintyText(status='REPORTED'){
  return ({CONFIRMED:'The public source marks this event/result as reviewed or completed.',REPORTED:'This is information reported by the named public source.',ESTIMATED:'This value or position is calculated from public reference data rather than direct live telemetry.',HEURISTIC:'ShadowNex inferred this label from a rule or pattern. It is not confirmed fact.',STALE:'The source is delayed, degraded, unavailable, or older than the normal freshness window.'})[status]||'Public-source information with limited certainty metadata.';
}
export function sourceAge(updatedAt,now=Date.now()){const ts=Number(updatedAt);if(!Number.isFinite(ts)||ts<=0)return 'update time unavailable';const sec=Math.max(0,Math.round((now-ts)/1000));if(sec<60)return `${sec}s ago`;const min=Math.round(sec/60);if(min<60)return `${min}m ago`;const hr=Math.round(min/60);if(hr<48)return `${hr}h ago`;return `${Math.round(hr/24)}d ago`;}
export function sourcePlainState(state={}){const s=String(state.status||'STANDBY').toUpperCase();if(s==='LIVE')return 'Live';if(['SYNC','FALLBACK'].includes(s))return 'Checking';if(['DEGRADED','STALE'].includes(s))return 'Delayed / partial';if(s==='UNAVAILABLE')return 'Unavailable';return 'Not enabled';}
export function overviewVisible(meta={},rank={},favorite=false,cameraAlt=10000000){
  if(favorite)return true;const type=String(meta.type||'').toUpperCase(),alt=Number(cameraAlt)||10000000,score=Number(rank.score)||0;
  if(alt<1500000)return true;
  if(type==='AIRCRAFT')return !!meta.militaryLikely||score>=68;
  if(type==='EARTHQUAKE')return Number(meta.magnitude)>=4||score>=68;
  if(type==='FIRE'||type==='LAUNCH')return score>=48;
  return alt<5000000?score>=48:score>=68;
}
export function buildPrimeBrief(snapshot={},sources=[],opts={}){
  const top=(snapshot.top||[]).slice(0,4),notable=(snapshot.alerts||[]).length,label=opts.label||'Current view',enabled=sources.filter(x=>x.enabled);
  const healthy=enabled.filter(x=>x.status==='LIVE').length,partial=enabled.filter(x=>['DEGRADED','STALE','UNAVAILABLE','SYNC','FALLBACK'].includes(x.status)).length;
  const coverage=enabled.map(x=>({id:x.id,label:x.label||x.id,status:x.status||'STANDBY',plain:sourcePlainState(x),count:Number(x.count)||0,updatedAt:x.updatedAt||null,note:x.note||'',provenance:x.provenance||''}));
  const items=top.map(x=>({name:x.meta?.name||x.meta?.type||'Item',type:x.meta?.type||'CONTACT',summary:situationSummary(x.meta||{},x.rank||{}),importance:x.rank?.score||0,level:x.rank?.level||'ROUTINE',uncertainty:uncertaintyFor(x.meta||{},{status:x.sourceStatus}),source:x.meta?.source||x.sourceProvenance||'Public source',updatedAt:x.rank?.timestamp||x.sourceUpdatedAt||null,reasons:x.rank?.reasons||[]}));
  let assessment;if(!snapshot.total)assessment='No loaded contact or event in this view currently rises from the enabled public sources.';else if(notable)assessment=`${notable} notable loaded item${notable===1?'':'s'} surfaced in this view.`;else assessment=`${snapshot.total} loaded contact${snapshot.total===1?'':'s'}/event${snapshot.total===1?'':'s'} are in view, with no item crossing the current notable threshold.`;
  const coverageText=!enabled.length?'No live data layers are enabled.':partial?`${healthy} enabled source${healthy===1?'':'s'} live; ${partial} checking, delayed, or unavailable.`:`${healthy} enabled source${healthy===1?'':'s'} live.`;
  return {label,assessment,coverageText,items,coverage,total:snapshot.total||0,notable};
}