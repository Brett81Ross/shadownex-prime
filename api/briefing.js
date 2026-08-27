export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const key=process.env.OPENAI_API_KEY;if(!key)return res.status(503).json({error:'OPENAI_API_KEY is not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};const prompt=String(body.prompt||'Provide a concise situational briefing.').slice(0,1000);const snapshot=body.snapshot||{};
    const upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.6',reasoning:{effort:'low'},instructions:'You are NexCommand, the concise situational-intelligence briefing layer inside ShadowNex Prime. Use only the supplied application snapshot. Distinguish observed public data from estimates or heuristics. Do not claim access to classified systems. Keep the briefing operational, factual, and under 220 words.',input:`USER REQUEST:\n${prompt}\n\nSHADOWNEX SNAPSHOT:\n${JSON.stringify(snapshot).slice(0,14000)}`})});
    const data=await upstream.json();if(!upstream.ok)throw new Error(data?.error?.message||`OpenAI HTTP ${upstream.status}`);const text=extractText(data);return res.status(200).json({text:text||'No text returned by NexCommand.'});
  }catch(e){return res.status(500).json({error:e.message});}
}
function extractText(data){const chunks=[];for(const item of data?.output||[]){for(const c of item?.content||[]){if(c?.type==='output_text'&&c.text)chunks.push(c.text);}}return chunks.join('\n').trim();}
