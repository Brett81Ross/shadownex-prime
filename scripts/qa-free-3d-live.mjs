import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const chrome=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
 const page=await ctx.newPage();const errors=[],resources=[];
 page.on('pageerror',e=>errors.push('PAGE '+String(e)));
 page.on('requestfailed',r=>{if(/reearth.land/.test(r.url()))resources.push('FAIL '+r.url()+' '+r.failure()?.errorText)});
 page.on('response',r=>{if(/reearth.land/.test(r.url())&&r.status()>=400)resources.push('HTTP '+r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 await page.locator('#navMore').click();
 const btn=page.locator('#threeDWorldBtn');
 const initial=await btn.textContent();
 if(!initial.includes('FREE COMMUNITY 3D'))throw new Error('Free no-key 3D button missing: '+initial);
 await btn.click({timeout:9000});
 await page.waitForFunction(()=>document.getElementById('threeDWorldBtn')?.disabled===false,null,{timeout:50000});
 const on=await page.evaluate(()=>{
  const globe=window.__shadowNexPrime.globe,credit=document.getElementById('world3DAttribution'),button=document.getElementById('threeDWorldBtn'),v=visualViewport;
  return {mode:globe.world3DMode,terrainStatus:globe.terrainStatus,hasBuildings:!!globe.world3DBuildings,creditsVisible:credit&&!credit.classList.contains('hidden'),label:button?.textContent,viewport:{width:v.width,offsetLeft:v.offsetLeft},mapWidth:document.getElementById('app')?.getBoundingClientRect()?.width};
 });
 console.log('FREE_3D_LIVE_ON',JSON.stringify({on,errors,resources}));
 if(on.mode!=='on'||!on.hasBuildings||!on.creditsVisible||errors.length)throw new Error('Actual 3D terrain/buildings activation did not complete; QA gate blocked.');
 await btn.click({timeout:9000});
 await page.waitForFunction(()=>document.getElementById('threeDWorldBtn')?.disabled===false,null,{timeout:30000});
 const off=await page.evaluate(()=>({mode:window.__shadowNexPrime.globe.world3DMode,terrain:window.__shadowNexPrime.globe.terrainStatus,creditsHidden:document.getElementById('world3DAttribution').classList.contains('hidden')}));
 console.log('FREE_3D_LIVE_OFF',JSON.stringify({off,resources,errors}));
 if(off.mode!=='off'||off.terrain!=='ELLIPSOID'||!off.creditsHidden||errors.length)throw new Error('Free 3D off/fallback not working');
 await ctx.close();
}finally{await browser.close()}
console.log('PASS: token-free Re:Earth terrain and 3D building streaming in actual CesiumJS, viewport-aware Android button, source credit and reset');
