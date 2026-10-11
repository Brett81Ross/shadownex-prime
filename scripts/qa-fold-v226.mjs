import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const chrome=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const sizes=[{width:360,height:740},{width:412,height:915},{width:720,height:780},{width:840,height:620},{width:1280,height:850}];
let failures=0;
try{
for(const size of sizes){
 const mobile=size.width<=840;
 const ctx=await browser.newContext({viewport:size,isMobile:mobile,hasTouch:mobile,userAgent:mobile?'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36':undefined});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(String(error)));
 try{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
  await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
  const buttons=[['navMore','moreDialog'],['moreSettingsBtn','settingsDialog']];
  await page.locator('#navMore').click();
  await page.waitForFunction(()=>document.getElementById('moreDialog')?.classList.contains('viewport-modal'));
  const more=await page.evaluate(()=>{
   const b=document.getElementById('moreDialog'),v=visualViewport;
   const rect=b.getBoundingClientRect(),close=document.getElementById('moreCloseBtn').getBoundingClientRect();
   return {rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},close:{left:close.left,right:close.right,top:close.top,bottom:close.bottom},visual:{left:v.offsetLeft,width:v.width,top:v.offsetTop,height:v.height},scrollWidth:b.scrollWidth,clientWidth:b.clientWidth};
  });
  const fit=x=>x.rect.left>=x.visual.left-1&&x.rect.right<=x.visual.left+x.visual.width+1&&x.close.left>=x.visual.left-1&&x.close.right<=x.visual.left+x.visual.width+1&&x.rect.top>=x.visual.top-1&&x.rect.bottom<=x.visual.top+x.visual.height+1&&x.scrollWidth<=x.clientWidth+2;
  if(!fit(more))throw Error('More modal outside visual viewport '+JSON.stringify(more));
  // This must be an actual click: should guide users to Settings when no ion token exists.
  await page.locator('#threeDWorldBtn').click({timeout:7000});
  await page.waitForFunction(()=>document.getElementById('settingsDialog')?.open);
  await page.waitForFunction(()=>document.getElementById('settingsDialog')?.classList.contains('viewport-modal'));
  const settings=await page.evaluate(()=>{
   const d=document.getElementById('settingsDialog'),r=d.getBoundingClientRect(),v=visualViewport;
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,vw:v.width,vh:v.height,vl:v.offsetLeft,vt:v.offsetTop,contentWidth:d.scrollWidth,clientWidth:d.clientWidth};
  });
  const sf=settings.left>=settings.vl-1&&settings.right<=settings.vl+settings.vw+1&&settings.top>=settings.vt-1&&settings.bottom<=settings.vt+settings.vh+1&&settings.contentWidth<=settings.clientWidth+2;
  if(!sf)throw Error('Settings modal outside visual viewport '+JSON.stringify(settings));
  await page.evaluate(()=>document.getElementById('settingsDialog').close());
  await page.locator('#navLayers').click();
  await page.waitForFunction(()=>document.getElementById('watchDialog')?.classList.contains('viewport-modal'));
  const watch=await page.evaluate(()=>{
   const d=document.getElementById('watchDialog'),r=d.getBoundingClientRect(),v=visualViewport;
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,vw:v.width,vh:v.height,vl:v.offsetLeft,vt:v.offsetTop,contentWidth:d.scrollWidth,clientWidth:d.clientWidth};
  });
  if(!(watch.left>=watch.vl-1&&watch.right<=watch.vl+watch.vw+1&&watch.top>=watch.vt-1&&watch.bottom<=watch.vt+watch.vh+1&&watch.contentWidth<=watch.clientWidth+2))throw Error('Watch modal outside visual viewport '+JSON.stringify(watch));
  if(errors.length)throw Error('Browser JS errors '+JSON.stringify(errors));
  console.log('MODAL_FOLD_QA',JSON.stringify({screen:size,ok:true,more,settings,watch,errors}));
 }catch(error){failures++;console.error('MODAL_FOLD_ERROR',JSON.stringify({screen:size,error:String(error),errors}));}
 await ctx.close();
}
}finally{await browser.close()}
if(failures)throw Error(failures+' browser viewport checks failed');
console.log('PASS: More, Settings, Watch dialogs and optional 3D token guard are usable within five visual viewports');
