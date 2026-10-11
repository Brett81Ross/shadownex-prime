// QA-only: verify both reported dialogs fit common Android/Fold viewport sizes.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
const chrome=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const sizes=[{width:360,height:740},{width:412,height:915},{width:720,height:780},{width:840,height:620},{width:1000,height:700}];
let fail=0;
try{
for(const v of sizes){
 const ctx=await browser.newContext({viewport:v,hasTouch:true,isMobile:true});
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:40000});
  const result=await page.evaluate(()=>{
   const app=window.__shadowNexPrime;
   const geometry=ids=>ids.map(id=>{
    const node=document.getElementById(id);
    if(!node)return {id,missing:true};
    const rect=node.getBoundingClientRect();
    return {id,left:+rect.left.toFixed(1),right:+rect.right.toFixed(1),top:+rect.top.toFixed(1),bottom:+rect.bottom.toFixed(1),width:+rect.width.toFixed(1),clientWidth:node.clientWidth,scrollWidth:node.scrollWidth};
   });
   const d=app.$('locationStartDialog');if(!d.open)d.showModal();
   const location=geometry(['locationStartDialog','locationStartClose','locationNearBtn','locationSearchBtn','locationExploreBtn']);
   d.close();
   app.openSituationBrief();
   const briefing=geometry(['situationDialog','situationCloseBtn','situationOverview','situationCards']);
   app.$('situationDialog').close();
   return {vw:innerWidth,vh:innerHeight,visualWidth:visualViewport?.width??innerWidth,location,briefing};
  });
  const visible=(r,w,h)=>r.every(x=>!x.missing&&x.left>=-1&&x.right<=w+1&&x.top>=-1&&x.top<h&&x.width>0&&x.scrollWidth<=x.clientWidth+2);
  const ok=visible(result.location,result.vw,result.vh)&&visible(result.briefing,result.vw,result.vh)&&errors.length===0;
  console.log('FOLD_LAYOUT',v.width+'x'+v.height,JSON.stringify({ok,...result,errors}));
  if(!ok)fail++;
 }catch(e){console.error('FOLD_FAILURE',v.width+'x'+v.height,e.stack||String(e));fail++}
 await ctx.close();
}
}finally{await browser.close()}
if(fail)throw new Error('Dialog viewport regression: '+fail+' size(s) failed');
console.log('PASS: both dialogs contained across five mobile/Fold viewport sizes');
