let cache={at:0,data:null};
export default async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
  if(cache.data&&Date.now()-cache.at<12000)return json(res,200,cache.data,{'Cache-Control':'s-maxage=10, stale-while-revalidate=20'});
  try{
    const r=await fetch('https://opensky-network.org/api/states/all',{headers:{'User-Agent':'ShadowNex-Prime/2.0'},signal:AbortSignal.timeout(8000)});
    if(!r.ok)throw new Error(`OpenSky HTTP ${r.status}`);const data=await r.json();cache={at:Date.now(),data};return json(res,200,data,{'Cache-Control':'s-maxage=10, stale-while-revalidate=20'});
  }catch(e){return json(res,502,{error:e?.name==='TimeoutError'?'OpenSky request timed out':e.message,states:[]});}
}
function json(res,status,body,headers={}){for(const [k,v] of Object.entries(headers))res.setHeader(k,v);res.status(status).json(body);}
