// QA-only real-browser integration: verifies visible reset and no loss of saved data.
import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const exe=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const screens=[{width:360,height:740},{width:412,height:915},{width:720,height:780},{width:840,height:620},{width:1280,height:850}];
let failures=0;
try{
for(const size of screens){
 const mobile=size.width<=840;
 const context=await browser.newContext({viewport:size,isMobile:mobile,hasTouch:mobile,userAgent:mobile?'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36':undefined});
 await context.addInitScript(()=>{localStorage.setItem('shadownex.prime.locationStart.v1','done');});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(String(err)));
 try{
  await page.goto('https://shadownex-prime.vercel.app/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.__shadowNexPrime,{timeout:30000});
  // Quick Start is a true modal and correctly intercepts background taps.
  // Finish the onboarding overlay before testing the visible map control.
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  const before=await page.evaluate(async()=>{
   const app=window.__shadowNexPrime;
   const {saveCollection}=await import('/src/core/watchStore.js');
   app.savedViews=[{id:'qa-view',name:'Keep this view',savedAt:1234,layers:['fires']}];
   app.watchAreas=[{id:'qa-area',name:'Keep area',lat:35,lon:-97,radiusKm:80,createdAt:1234}];
   app.favorites=[{id:'qa-fav',key:'qa-fav',meta:{type:'AIRCRAFT',name:'Keep favorite'}}];
   for(const [type,arr] of [['views',app.savedViews],['areas',app.watchAreas],['favorites',app.favorites]])saveCollection(type,arr);
   app.setLens('thermal');
   app.applyUiMode('advanced');
   const keys=['shadownex.prime.savedViews.v1','shadownex.prime.watchAreas.v1','shadownex.prime.favorites.v1','shadownex.prime.settings.v2'];
   const snapshots=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
   const btn=document.getElementById('resetAppBtn'),box=btn?.getBoundingClientRect(),v=visualViewport;
   const position={left:box?.left,right:box?.right,top:box?.top,bottom:box?.bottom,width:box?.width,height:box?.height,visibleLeft:v?.offsetLeft||0,visibleTop:v?.offsetTop||0,visibleWidth:v?.width||innerWidth,visibleHeight:v?.height||innerHeight};
   const visible=!!btn&&getComputedStyle(btn).display!=='none'&&box.width>=100&&box.height>=44&&box.left>=position.visibleLeft-1&&box.right<=position.visibleLeft+position.visibleWidth+1&&box.top>=position.visibleTop-1&&box.bottom<=position.visibleTop+position.visibleHeight+1;
   return {visible,position,snapshots,uiMode:app.uiMode,showLabel:btn?.textContent};
  });
  if(!before.visible)throw new Error('Reset button not visible in visual viewport '+JSON.stringify(before.position));
  await page.locator('#resetAppBtn').click({timeout:7000});
  await page.waitForFunction(()=>document.getElementById('resetAppBtn')?.disabled===false,{timeout:25000});
  const after=await page.evaluate(()=>{
   const app=window.__shadowNexPrime;
   const keys=['shadownex.prime.savedViews.v1','shadownex.prime.watchAreas.v1','shadownex.prime.favorites.v1','shadownex.prime.settings.v2'];
   const snapshots=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
   return {snapshots,uiMode:app.uiMode,lensClass:document.getElementById('app').classList.contains('lens-normal'),baseMap:app.globe.baseMapInfo().mode,earthquakes:app.layers.get('earthquakes')?.enabled,aircraft:app.layers.get('aircraft')?.enabled,buttonLabel:document.getElementById('resetAppBtn')?.textContent,viewCount:app.savedViews.length,watchCount:app.watchAreas.length,favoriteCount:app.favorites.length};
  });
  const unchanged=JSON.stringify(before.snapshots)===JSON.stringify(after.snapshots);
  const ok=unchanged&&after.uiMode==='simple'&&after.lensClass&&after.baseMap==='satellite'&&after.earthquakes&&after.aircraft&&after.buttonLabel.includes('RESET APP')&&after.viewCount===1&&after.watchCount===1&&after.favoriteCount===1&&errors.length===0;
  console.log('VISIBLE_RESET_QA',JSON.stringify({screen:size,ok,visible:before.visible,position:before.position,unchanged,after:{...after,snapshots:undefined},errors}));
  if(!ok)failures++;
 }catch(e){failures++;console.error('RESET_QA_ERROR',JSON.stringify({screen:size,error:String(e),pageErrors:errors}));}
 await context.close();
}
}finally{await browser.close();}
if(failures)throw new Error('Reset App browser QA failed on '+failures+' viewports');
console.log('PASS: Reset App is visible, clickable, restores defaults and preserves saved data on all five viewport sizes');
