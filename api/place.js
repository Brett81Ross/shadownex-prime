const CACHE=new Map(),TTL=24*60*60*1000;
export default async function handler(req,res){
  if(req.method&&req.method!=='GET')return res.status(405).json({error:'GET required'});
  const u=new URL(req.url,'http://localhost'),lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon'));
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return res.status(400).json({error:'Valid lat/lon required'});
  const key=`${lat.toFixed(3)}|${lon.toFixed(3)}`,cached=CACHE.get(key);if(cached&&Date.now()-cached.at<TTL)return res.status(200).json({...cached.data,cached:true});
  try{
    const q=new URL('https://nominatim.openstreetmap.org/reverse');q.searchParams.set('lat',String(lat));q.searchParams.set('lon',String(lon));q.searchParams.set('format','jsonv2');q.searchParams.set('zoom','14');q.searchParams.set('addressdetails','1');q.searchParams.set('accept-language','en');
    const r=await fetch(q,{headers:{'User-Agent':'ShadowNexPrime/2.2.1 (CactusByte Studios)','Accept':'application/json','Accept-Language':'en-US,en;q=0.9'}});if(!r.ok)throw new Error(`Nominatim HTTP ${r.status}`);
    const d=await r.json(),a=d.address||{},locality=a.city||a.town||a.village||a.hamlet||a.municipality||null,region=a.state||a.region||null,country=a.country||null,road=a.road||a.highway||null;
    const parts=[locality,region,country].filter(Boolean),data={available:!!parts.length||!!d.display_name,label:parts.join(', ')||d.display_name||'Mapped location',road,locality,region,country,source:'OpenStreetMap / Nominatim',latitude:lat,longitude:lon};
    CACHE.set(key,{at:Date.now(),data});return res.status(200).json(data);
  }catch(e){return res.status(200).json({available:false,error:e?.message||String(e),source:'OpenStreetMap / Nominatim'});}
}
