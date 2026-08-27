let cache={at:0,data:null};
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const key=process.env.FIRMS_MAP_KEY;if(!key)return res.status(200).json({configured:false,points:[]});
  if(cache.data&&Date.now()-cache.at<300000)return res.status(200).json(cache.data);
  try{
    const url=`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(key)}/VIIRS_SNPP_NRT/world/1`;
    const r=await fetch(url);if(!r.ok)throw new Error(`FIRMS HTTP ${r.status}`);const text=await r.text();const lines=text.trim().split(/\r?\n/);if(lines.length<2)throw new Error('FIRMS returned no rows');const head=csvLine(lines[0]);const idx=Object.fromEntries(head.map((h,i)=>[h,i]));const points=[];
    for(const line of lines.slice(1,5001)){const c=csvLine(line),lat=Number(c[idx.latitude]),lon=Number(c[idx.longitude]);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;points.push({lat,lon,brightness:Number(c[idx.bright_ti4]??c[idx.brightness]),when:`${c[idx.acq_date]||''} ${c[idx.acq_time]||''}`.trim(),name:'VIIRS fire detection'});}
    cache={at:Date.now(),data:{configured:true,points}};return res.status(200).json(cache.data);
  }catch(e){return res.status(502).json({configured:true,error:e.message,points:[]});}
}
function csvLine(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(ch===','&&!q){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out;}
