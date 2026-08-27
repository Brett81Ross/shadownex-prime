const CACHE=new Map(),TTL=24*60*60*1000;
export default async function handler(req,res){
  if(req.method&&req.method!=='GET')return res.status(405).json({error:'GET required'});
  const q=new URL(req.url,'http://localhost').searchParams.get('q')?.trim();if(!q||q.length<2||q.length>120)return res.status(400).json({error:'A place name is required'});
  const key=q.toLowerCase(),cached=CACHE.get(key);if(cached&&Date.now()-cached.at<TTL)return res.status(200).json({...cached.data,cached:true});
  try{const url=new URL('https://nominatim.openstreetmap.org/search');url.searchParams.set('q',q);url.searchParams.set('format','geojson');url.searchParams.set('polygon_geojson','1');url.searchParams.set('limit','1');url.searchParams.set('addressdetails','0');const r=await fetch(url,{headers:{'User-Agent':'ShadowNexPrime/2.1 (CactusByte Studios)','Accept':'application/geo+json,application/json'}});if(!r.ok)throw new Error(`Nominatim HTTP ${r.status}`);const d=await r.json(),f=d.features?.[0];if(!f?.geometry)return res.status(404).json({error:'No boundary geometry found'});const data={name:f.properties?.display_name||q,geometry:f.geometry,bbox:f.bbox||null,source:'OpenStreetMap / Nominatim'};CACHE.set(key,{at:Date.now(),data});return res.status(200).json(data);}catch(e){return res.status(502).json({error:e.message||'Boundary lookup failed'});}
}
