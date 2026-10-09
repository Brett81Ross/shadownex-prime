const cache=new Map();
const CACHE_MS=10000;
const ADSB_TIMEOUT_MS=5000;
const OPENSKY_TIMEOUT_MS=4500;

export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  const lat=numberParam(req.query?.lat,38.4,-85,85);
  const lon=numberParam(req.query?.lon,-98.5,-180,180);
  const radius=Math.round(numberParam(req.query?.radius,250,25,250));
  const key=`${lat.toFixed(2)}:${lon.toFixed(2)}:${radius}`;
  const cached=cache.get(key);
  if(cached&&Date.now()-cached.at<CACHE_MS)return json(res,200,cached.data,cacheHeaders());

  const errors=[];
  try{
    const data=await fetchAdsbLol(lat,lon,radius);
    remember(key,data);
    return json(res,200,data,cacheHeaders());
  }catch(e){errors.push(`ADSB.lol: ${messageOf(e)}`);}

  if(radius>120){
    try{
      const data=await fetchAdsbLol(lat,lon,120);
      data._reducedRadius=true;
      remember(key,data);
      return json(res,200,data,cacheHeaders());
    }catch(e){errors.push(`ADSB.lol reduced-radius retry: ${messageOf(e)}`);}
  }

  if(process.env.OPENSKY_FALLBACK_ENABLED==='true'){
    try{
      const data=await fetchOpenSky(lat,lon,radius);
      remember(key,data);
      return json(res,200,data,cacheHeaders());
    }catch(e){errors.push(`OpenSky fallback: ${messageOf(e)}`);}
  }

  return json(res,502,{error:'Aircraft feed temporarily unavailable',message:'All enabled aircraft sources failed.',states:[],_source:'none',_errors:errors});
}

async function fetchAdsbLol(lat,lon,radius){
  const url=`https://api.adsb.lol/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/${radius}`;
  const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'ShadowNexPrime/2.2 (+public-source-client)'},signal:AbortSignal.timeout(ADSB_TIMEOUT_MS)});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  const raw=await r.json();
  if(!Array.isArray(raw?.ac))throw new Error('Unexpected response shape');
  return normalizeAdsbLol(raw,{lat,lon,radius});
}

function normalizeAdsbLol(raw,region){
  const nowMs=Number(raw.now)||Date.now();
  const time=Math.floor(nowMs/1000);
  const states=[];
  for(const a of raw.ac||[]){
    const lat=finite(a.lat),lon=finite(a.lon);if(lat==null||lon==null)continue;
    const id=String(a.hex||'').trim();if(!id)continue;
    const onGround=a.alt_baro==='ground'||a.alt_geom==='ground';
    const baro=onGround?0:feetToMeters(a.alt_baro);
    const geo=feetToMeters(a.alt_geom);
    const speed=knotsToMps(a.gs);
    const vertical=feetPerMinToMps(a.baro_rate??a.geom_rate);
    const kind=String(a.type||'').toLowerCase();
    const positionSource=kind.includes('mlat')?2:0;
    states.push([id,String(a.flight||'').trim()||id,null,null,time,lon,lat,baro,onGround,speed,finite(a.track),vertical,null,geo,a.squawk?String(a.squawk):null,null,positionSource]);
  }
  return {time,states,_source:'ADSB.lol',_license:'ODbL-1.0',_fallback:false,_region:region};
}

async function fetchOpenSky(lat,lon,radius){
  const box=bbox(lat,lon,radius);
  const u=new URL('https://opensky-network.org/api/states/all');
  for(const [k,v] of Object.entries(box))u.searchParams.set(k,String(v));
  const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'ShadowNexPrime/2.2 (+public-source-client)'},signal:AbortSignal.timeout(OPENSKY_TIMEOUT_MS)});
  if(!r.ok)throw new Error(`HTTP ${r.status}`);
  const data=await r.json();
  if(!Array.isArray(data?.states))throw new Error('Unexpected response shape');
  return {...data,_source:'OpenSky Network',_fallback:true,_region:{lat,lon,radius}};
}

function bbox(lat,lon,radiusNm){
  const latDelta=radiusNm/60;
  const cos=Math.max(.15,Math.cos(lat*Math.PI/180));
  const lonDelta=Math.min(30,radiusNm/(60*cos));
  return {lamin:clamp(lat-latDelta,-90,90),lomin:clamp(lon-lonDelta,-180,180),lamax:clamp(lat+latDelta,-90,90),lomax:clamp(lon+lonDelta,-180,180)};
}
function numberParam(value,fallback,min,max){const n=Number(Array.isArray(value)?value[0]:value);return Number.isFinite(n)?clamp(n,min,max):fallback;}
function finite(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function feetToMeters(v){const n=finite(v);return n==null?null:n*.3048;}
function knotsToMps(v){const n=finite(v);return n==null?null:n*.514444;}
function feetPerMinToMps(v){const n=finite(v);return n==null?null:n*.00508;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function messageOf(e){return e?.name==='TimeoutError'||e?.name==='AbortError'?'request timed out':e?.message||String(e);}
function remember(key,data){cache.set(key,{at:Date.now(),data});if(cache.size>24){const oldest=cache.keys().next().value;cache.delete(oldest);}}
function cacheHeaders(){return {'Cache-Control':'public, max-age=4, s-maxage=8, stale-while-revalidate=20'};}
function json(res,status,body,headers={}){for(const [k,v] of Object.entries(headers))res.setHeader(k,v);res.status(status).json(body);}
