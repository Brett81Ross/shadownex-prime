const SUBJECTS=[
  {layer:'cctv',re:/\b(cameras?|cctv)\b/i},
  {layer:'aircraft',re:/\b(aircraft|planes?|flights?)\b/i},
  {layer:'satellites',re:/\b(satellites?)\b/i},
  {layer:'fires',re:/\b(fires?|wildfires?)\b/i},
  {layer:'earthquakes',re:/\b(earthquakes?|quakes?)\b/i},
  {layer:'launches',re:/\b(launches?|rockets?)\b/i},
  {layer:'vessels',re:/\b(vessels?|ships?)\b/i}
];
export function parseWorldIntent(raw=''){
  const text=String(raw).trim(),lower=text.toLowerCase();if(!text)return null;
  if(/\b(biggest|largest|strongest)\b.*\b(earthquake|quake)s?\b/.test(lower))return {kind:'biggest',layer:'earthquakes'};
  if(/\b(iss|international space station)\b/.test(lower))return {kind:'contact',layer:'satellites',query:'ISS'};
  if(/\bmilitary(?:-likely| likely)?\b.*\b(aircraft|plane|flight)s?\b/.test(lower))return {kind:'military',layer:'aircraft'};
  if(/\bwhat(?:'s| is)\s+happening\b/i.test(text)){const m=text.match(/\b(?:around|near|in|at)\s+(.+)$/i);return {kind:'situation',place:clean(m?.[1]||'')};}
  const subject=SUBJECTS.find(x=>x.re.test(text));if(!subject)return null;
  const here=/\b(here|nearby|around here|near me)\b/i.test(text),m=text.match(/\b(?:near|around|over|in|at)\s+(.+)$/i);
  let place=clean(m?.[1]||'');if(/^(here|nearby|me)$/i.test(place))place='';
  if(!place&&!here)place=clean(text.replace(/^(?:please\s+)?(?:show me|show|find|display|track)\s+/i,'').replace(subject.re,'').replace(/\b(?:today|right now|now|live|current|all|the)\b/gi,' '));
  return {kind:'layer',layer:subject.layer,place,here};
}
function clean(v=''){return String(v).replace(/[?.!]+$/,'').replace(/\s+/g,' ').trim();}
export function overallConnection(items=[],online=true){
  if(!online)return 'OFFLINE';const active=items.filter(x=>x.enabled);if(!active.length)return 'PARTIAL';
  const bad=new Set(['DEGRADED','STALE','UNAVAILABLE']),live=active.filter(x=>x.status==='LIVE').length,badCount=active.filter(x=>bad.has(x.status)).length;
  if(!live&&badCount===active.length)return 'OFFLINE';return badCount||active.some(x=>['SYNC','FALLBACK','STANDBY'].includes(x.status))?'PARTIAL':'LIVE';
}
export function imageryZoom(alt=1000000){const a=Math.max(8,Number(alt)||1000000);return Math.max(0,Math.min(19,Math.round(19-Math.log2(a/80))));}
export function ageAlpha(meta={},state={},now=Date.now()){
  if(['DEGRADED','STALE','UNAVAILABLE'].includes(String(state.status||'')))return .32;
  const limits={AIRCRAFT:[90000,180000],VESSEL:[120000,300000],EARTHQUAKE:[21600000,86400000],FIRE:[21600000,86400000]}[String(meta.type||'').toUpperCase()];if(!limits)return 1;
  let ts=Number(meta.updatedAt||meta.time);if(!Number.isFinite(ts)&&meta.when)ts=Date.parse(meta.when);if(!Number.isFinite(ts))ts=Number(state.updatedAt);if(!Number.isFinite(ts))return 1;
  const age=Math.max(0,now-ts);return age>limits[1]?.32:age>limits[0]?.62:1;
}