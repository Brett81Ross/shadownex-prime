const CACHE=new Map(),TTL=30*60*1000;
export default async function handler(req,res){
  if(req.method&&req.method!=='GET')return res.status(405).json({error:'GET required'});
  const u=new URL(req.url,'http://localhost'),lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon')),zoom=Math.max(0,Math.min(19,Number(u.searchParams.get('z'))||15));
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return res.status(400).json({error:'Valid lat/lon required'});
  const key=`${lat.toFixed(4)}|${lon.toFixed(4)}|${zoom}`,cached=CACHE.get(key);if(cached&&Date.now()-cached.at<TTL)return res.status(200).json({...cached.data,cached:true});
  try{
    const q=new URL('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/0/query');
    q.searchParams.set('where','1=1');q.searchParams.set('geometry',`${lon},${lat}`);q.searchParams.set('geometryType','esriGeometryPoint');q.searchParams.set('inSR','4326');q.searchParams.set('spatialRel','esriSpatialRelIntersects');q.searchParams.set('outFields','*');q.searchParams.set('returnGeometry','false');q.searchParams.set('f','json');
    const r=await fetch(q,{headers:{Accept:'application/json','User-Agent':'ShadowNexPrime/2.2.1 (CactusByte Studios)'}});if(!r.ok)throw new Error(`Esri metadata HTTP ${r.status}`);const d=await r.json();if(d.error)throw new Error(d.error.message||'Esri metadata query failed');
    const all=(d.features||[]).map(x=>x.attributes||{}),scoped=all.filter(a=>inZoom(a,zoom)),pool=scoped.length?scoped:all,best=pool.sort((a,b)=>resValue(a)-resValue(b))[0];
    const data=best?{available:true,source:best.NICE_NAME||best.NICE_DESC||best.SRC_DESC||'Esri World Imagery',description:best.NICE_DESC||best.SRC_DESC||null,captureDate:dateValue(best.SRC_DATE2,best.SRC_DATE),resolutionMeters:valid(best.SRC_RES),accuracyMeters:valid(best.SRC_ACC),zoom,lat,lon,metadataSource:'Esri World Imagery metadata layer'}:{available:false,source:'Esri World Imagery',zoom,lat,lon,note:'Point-specific imagery metadata was not returned for this location/scale.'};
    CACHE.set(key,{at:Date.now(),data});return res.status(200).json(data);
  }catch(e){return res.status(200).json({available:false,source:'Esri World Imagery',error:e?.message||String(e),zoom,lat,lon});}
}
function inZoom(a,z){const min=Number(a.MinMapLevel??a.MinZoomLevel),max=Number(a.MaxMapLevel??a.MaxZoomLevel);return (!Number.isFinite(min)||z>=min)&&(!Number.isFinite(max)||z<=max);}
function valid(v){const n=Number(v);return Number.isFinite(n)&&n>=0&&n<99999?n:null;}
function resValue(a){return valid(a.SRC_RES)??Number.POSITIVE_INFINITY;}
function dateValue(v,fallback){const n=Number(v);if(Number.isFinite(n)&&n>100000000000)return new Date(n).toISOString().slice(0,10);const s=String(fallback||'');return /^\d{8}$/.test(s)?`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`:null;}