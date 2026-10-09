const CACHE=new Map(),TTL=24*60*60*1000;
export default async function handler(req,res){
  if(req.method&&req.method!=='GET')return res.status(405).json({error:'GET required'});
  const u=new URL(req.url,'http://localhost'),lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon'));
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return res.status(400).json({error:'Valid lat/lon required'});
  const key=`${lat.toFixed(4)}|${lon.toFixed(4)}`,cached=CACHE.get(key);if(cached&&Date.now()-cached.at<TTL)return res.status(200).json({...cached.data,cached:true});
  try{
    const q=new URL('https://nominatim.openstreetmap.org/reverse');q.searchParams.set('lat',String(lat));q.searchParams.set('lon',String(lon));q.searchParams.set('format','jsonv2');q.searchParams.set('zoom','18');q.searchParams.set('addressdetails','1');q.searchParams.set('namedetails','1');q.searchParams.set('accept-language','en');
    const r=await fetch(q,{headers:{'User-Agent':'ShadowNexPrime/2.2.1 (CactusByte Studios)','Accept':'application/json','Accept-Language':'en-US,en;q=0.9'}});if(!r.ok)throw new Error(`Nominatim HTTP ${r.status}`);
    const d=await r.json(),a=d.address||{},locality=a.city||a.town||a.village||a.hamlet||a.municipality||null,region=a.state||a.region||null,country=a.country||null,road=a.road||a.pedestrian||a.highway||null,houseNumber=a.house_number||null,postcode=a.postcode||null,neighbourhood=a.neighbourhood||a.suburb||a.quarter||null;
    const street=[houseNumber,road].filter(Boolean).join(' '),parts=[locality,region,country].filter(Boolean),label=street||d.namedetails?.['name:en']||d.name||parts.join(', ')||d.display_name||'Mapped location';
    const data={available:!!label,label,street:street||null,road,houseNumber,neighbourhood,locality,region,postcode,country,displayName:d.display_name||null,category:d.category||null,type:d.type||null,source:'OpenStreetMap / Nominatim',language:'en',latitude:lat,longitude:lon};
    CACHE.set(key,{at:Date.now(),data});return res.status(200).json(data);
  }catch(e){return res.status(200).json({available:false,error:e?.message||String(e),source:'OpenStreetMap / Nominatim'});}
}
