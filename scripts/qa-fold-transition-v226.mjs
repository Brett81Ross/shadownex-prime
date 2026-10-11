// Strict Fold transition QA. Local browser only; never touches Vercel or user data.
import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const chrome=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const sizes=[{width:360,height:740},{width:840,height:620},{width:360,height:740},{width:412,height:915},{width:720,height:780},{width:412,height:915}];
try{
 const ctx=await browser.newContext({viewport:sizes[0],isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',x=>errors.push(String(x)));
 await page.goto('https://shadownex-prime.vercel.app/',{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 let failed=0;
 for(const size of sizes){
  await page.setViewportSize(size);
  await page.waitForTimeout(500);
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  const state=await page.evaluate(()=>{
   const rect=(id)=>{let node=document.getElementById(id),r=node?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
   const v=visualViewport;
   return {innerWidth,innerHeight,visual:{offsetLeft:v?.offsetLeft??0,offsetTop:v?.offsetTop??0,width:v?.width??innerWidth,height:v?.height??innerHeight,scale:v?.scale??1},root:rect('app'),globe:rect('globe'),reset:rect('resetAppBtn'),nav:rect('friendlyNav'),htmlStyle:document.documentElement.style.cssText,bodyStyle:document.body.style.cssText,rootStyle:document.getElementById('app').style.cssText};
  });
  const v=state.visual,box=state.root,nav=state.nav,reset=state.reset;
  const close=(n,a,b)=>Math.abs(n-a)<=b;
  const rootOK=box&&close(box.width,v.width,3)&&close(box.height,v.height,4)&&close(box.left,v.offsetLeft,3)&&close(box.top,v.offsetTop,3);
  const globeOK=state.globe&&close(state.globe.width,box.width,3)&&close(state.globe.height,box.height,4);
  const resetOK=reset&&reset.left>=box.left-1&&reset.right<=box.right+1&&reset.top>=box.top-1&&reset.bottom<=box.bottom+1;
  const navOK=nav&&nav.left>=box.left-1&&nav.right<=box.right+1&&nav.bottom<=box.bottom+1;
  const ok=rootOK&&globeOK&&resetOK&&navOK;
  console.log('FOLD_TRANSITION',JSON.stringify({size,ok,rootOK,globeOK,resetOK,navOK,...state}));
  if(!ok)failed++;
  await page.locator('#navLayers').click({timeout:6000});
  await page.waitForFunction(()=>document.getElementById('watchDialog')?.open);
  await page.waitForTimeout(200);
  const watch=await page.evaluate(()=>{
    const d=document.getElementById('watchDialog'),v=visualViewport,box=d.getBoundingClientRect(),save=document.getElementById('saveViewBtn').getBoundingClientRect(),close=document.getElementById('watchCloseBtn').getBoundingClientRect();
    return {box:{left:box.left,right:box.right,top:box.top,bottom:box.bottom},save:{left:save.left,right:save.right},close:{left:close.left,right:close.right},width:v.width,offsetLeft:v.offsetLeft,height:v.height,offsetTop:v.offsetTop,content:d.scrollWidth,client:d.clientWidth};
  });
  const watchOK=watch.box.left>=watch.offsetLeft-2&&watch.box.right<=watch.offsetLeft+watch.width+2&&watch.save.left>=watch.offsetLeft-2&&watch.save.right<=watch.offsetLeft+watch.width+2&&watch.close.left>=watch.offsetLeft-2&&watch.close.right<=watch.offsetLeft+watch.width+2&&watch.content<=watch.client+2;
  console.log('FOLD_WATCH',JSON.stringify({size,ok:watchOK,...watch}));
  if(!watchOK)failed++;
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 }
 if(errors.length)throw Error('JS errors: '+JSON.stringify(errors));
 if(failed)throw Error('FOLD regression: '+failed+' failed root, floating control or Watch Center checks');
 console.log('PASS: root/canvas/nav/reset/watch remain within visual viewport during folded/unfolded/Fold transitions without page reload');
 await ctx.close();
}finally{await browser.close()}
