// Optional worldwide webcam discovery via Windy's free-key Webcams API v3.
// A key is never shipped to the browser; no key means no upstream calls or charges.
// API images are ephemeral; do not persist them beyond a short cache.
const cache=new Map(),TTL=2*60*1000;
export function normalizeWindyWebcam(cam){
 const loc=cam?.location||{},lat=Number(loc.latitude),lon=Number(loc.longitude);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!cam?.webcamId)return null;
 const cleanUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}};
 const official=cleanUrl(cam.urls?.detail);
 if(!official||!((h)=>h==='windy.com'||h.endsWith('.windy.com'))(new URL(official).hostname))return null;
 const player=typeof cam.player?.live==='string'?cam.player.live:cam.player?.day;
 const image=cam.images?.current?.preview||cam.images?.current?.icon||null;
 return {id:'WINDY-'+cam.webcamId,groupId:'WINDY-'+cam.webcamId,
  name:cam.title||'Global Webcam',lat,lon,source:'Windy Webcams',
  status:cam.status||'PUBLISHED',url:official,
  previewUrl:cleanUrl(image),playerUrl:cleanUrl(player),
  mediaKind:cam.player?.live?'provider-embed':'snapshot',country:loc.country||null,
  updatedAt:cam.lastUpdatedOn||null};
}
export default async function handler(req,res){
 if(req.method&&req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.WINDY_WEBCAMS_API_KEY;
 if(!key)return res.status(200).json({points:[],configured:false,source:'Windy Webcams',note:'Optional free Windy Webcams API key not configured'});
 const lat=Number(req.query?.lat),lon=Number(req.query?.lon);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:'Invalid focus coordinates'});
 const id=(Math.round(lat*100)/100)+'|'+(Math.round(lon*100)/100);
 const old=cache.get(id);if(old&&Date.now()-old.at<TTL)return res.status(200).json({...old.data,cached:true});
 const url=new URL('https://api.windy.com/webcams/api/v3/webcams');
 url.searchParams.set('nearby',lat.toFixed(4)+','+lon.toFixed(4)+',250');
 url.searchParams.set('include','images,location,player,urls');
 url.searchParams.set('limit','50');url.searchParams.set('sortKey','popularity');url.searchParams.set('sortDirection','desc');
 try{
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),12000);
  let response;try{response=await fetch(url,{headers:{'x-windy-api-key':key,Accept:'application/json'},signal:ctl.signal});}finally{clearTimeout(timer)}
  if(!response.ok)throw Error('Windy status '+response.status);
  const body=await response.json(),cams=Array.isArray(body.webcams)?body.webcams:[];
  const data={points:cams.map(normalizeWindyWebcam).filter(Boolean),configured:true,source:'Windy Webcams',updatedAt:Date.now(),providerCredit:'Webcams provided by Windy.com'};
  if(cache.size>=24)cache.delete(cache.keys().next().value);
  cache.set(id,{at:Date.now(),data});return res.status(200).json(data);
 }catch(error){return res.status(200).json({points:[],configured:true,source:'Windy Webcams',status:'DEGRADED',note:'Global webcam provider temporarily unavailable'});}
}
