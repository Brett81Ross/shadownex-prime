// QA-only read-only live startup check. Never deploys or mutates production.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';

const url='http://127.0.0.1:4173/';
const chrome=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
console.log('Using Chrome:',chrome);
const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
for(const mode of ['desktop','android-webview-like']){
 const isMobile=mode!=='desktop';
 const context=await browser.newContext({viewport:isMobile?{width:393,height:820}:{width:1440,height:900},isMobile,hasTouch:isMobile,userAgent:isMobile?'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36 CactusByteNative/1.0':undefined});
 const page=await context.newPage();
 const errs=[];
 page.on('pageerror',e=>errs.push('PAGEERROR '+String(e?.stack||e)));
 page.on('console',msg=>{if(msg.type()==='error')errs.push('CONSOLE '+msg.text().slice(0,450))});
 page.on('requestfailed',req=>errs.push('REQUESTFAIL '+req.url().slice(0,220)+' '+String(req.failure()?.errorText||'')));
 page.on('response',res=>{if(res.status()>=400)errs.push('HTTP '+res.status()+' '+res.url().slice(0,250))});
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
  console.log(mode,'navigation HTTP',response?.status());
  await page.waitForTimeout(26000);
  const state=await page.evaluate(()=>({
   readyState:document.readyState,
   currentUrl:location.href,
   cesiumLoaded:!!window.Cesium,
   appBooted:!!window.__shadowNexPrime,
   splashStillVisible:!!document.getElementById('brandSplash'),
   splashText:document.querySelector('#brandSplash .splash-status')?.textContent||'',
   recoveryButton:!!document.getElementById('startupRetry'),
   errorPanelHeading:[...document.querySelectorAll('h2')].map(el=>el.textContent).find(s=>s.includes('reload'))||'',
   canvasCount:document.querySelectorAll('canvas').length,
   webglAvailable:(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return String(e)}})()
  }));
  console.log('BOOT_DIAG',mode,JSON.stringify(state));
  if (!state.appBooted || state.splashStillVisible) throw new Error('Browser startup gate failed: '+JSON.stringify(state));
 }catch(e){errs.push('NAVIGATION '+String(e?.stack||e));}
 console.log('BOOT_ERRORS',mode,JSON.stringify(errs.slice(0,40)));
 await context.close();
}
}finally{await browser.close();}
