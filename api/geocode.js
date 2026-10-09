const CACHE=new Map(),TTL=24*60*60*1000;
export default async function handler(req,res){
  if(req.method&&req.method!=='GET')return res.status(405).json({error:'GET required'});
  const u=new URL(req.url,'http://localhost'),q=(u.searchParams.get('q')||'').trim();
  if(q.length<2||q.length>160)return res.status(400).json({error:'A place, address, or landmark is required'});
  const key=q.toLowerCase(),cached=CACHE.get(key);if(cached&&Date.now()-cached.at<TTL)return res.status(200).json({...cached.data,cached:true});
  try{
    const url=new URL('https://nominatim.openstreetmap.org/search');url.searchParams.set('q',q);url.searchParams.set('format','jsonv2');url.searchParams.set('limit','5');url.searchParams.set('addressdetails','1');url.searchParams.set('namedetails','1');url.searchParams.set('accept-language','en');
    const r=await fetch(url,{headers:{'User-Agent':'ShadowNexPrime/2.2.1 (CactusByte Studios)','Accept':'application/json','Accept-Language':'en-US,en;q=0.9'}});if(!r.ok)throw new Error(`Nominatim HTTP ${r.status}`);
    const rows=await r.json(),results=(Array.isArray(rows)?rows:[]).map((x,i)=>{const a=x.address||{},lat=Number(x.lat),lon=Number(x.lon),bbox=Array.isArray(x.boundingbox)?x.boundingbox.map(Number):null,english=x.namedetails?.['name:en']||x.name||x.display_name||q;return {id:`${x.place_id||i}`,name:english,displayName:x.display_name||english,lat,lon,bbox,category:x.category||null,type:x.type||null,houseNumber:a.house_number||null,road:a.road||a.pedestrian||null,locality:a.city||a.town||a.village||a.hamlet||a.municipality||null,region:a.state||null,postcode:a.postcode||null,country:a.country||null};}).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));
    const data={query:q,results,source:'OpenStreetMap / Nominatim',language:'en'};CACHE.set(key,{at:Date.now(),data});return res.status(200).json(data);
  }catch(e){return res.status(200).json({query:q,results:[],source:'OpenStreetMap / Nominatim',error:e?.message||String(e)});}
}
