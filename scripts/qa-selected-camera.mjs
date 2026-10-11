import { chromium } from 'playwright-core';
import {execFileSync} from 'node:child_process';
const executablePath=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
try{
 const context=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage(),errors=[],streamResponses=[];
 page.on('pageerror',error=>errors.push(String(error)));
 page.on('requestfailed',r=>{if(/stream.oktraffic.org|jsdelivr|cloudflare/.test(r.url()))streamResponses.push({url:r.url().slice(0,200),failed:r.failure()?.errorText})});
 page.on('response',r=>{if(/stream.oktraffic.org/.test(r.url())&&r.status()>=400)streamResponses.push({url:r.url().slice(0,200),status:r.status()})});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const reset=await page.evaluate(()=>{
   const root=document.getElementById('app'),btn=document.getElementById('resetAppBtn'),bar=root.querySelector('.topbar'),nav=document.getElementById('friendlyNav');
   const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
   return {parent:btn.parentElement.className,btn:rect(btn),header:rect(bar),nav:rect(nav)};
 });
 const fits=reset.parent.includes('topbar')&&reset.btn.left>=reset.header.left-1&&reset.btn.right<=reset.header.right+1&&reset.btn.bottom<=reset.header.bottom+1&&reset.btn.bottom<reset.nav.top;
 console.log('RESET_HEADER_QA',JSON.stringify({fits,reset}));if(!fits)throw Error('Reset App overlaps navigation or is outside header');
 const catalog=await page.request.get('https://shadownex-prime.vercel.app/api/cctv',{timeout:50000});
 if(!catalog.ok())throw Error('Public camera catalog unreachable '+catalog.status());
 const points=(await catalog.json()).points||[];
 const camera=points.find(x=>x.source==='OKTraffic / ODOT-OTA'&&/^https:\/\/stream\.oktraffic\.org\//.test(x.streamUrl||''));
 if(!camera)throw Error('No public Oklahoma camera HLS address in provider');
 await page.evaluate(camera=>{
   const app=window.__shadowNexPrime;
   app.globe.dispatchEvent(new CustomEvent('select',{detail:{type:'CCTV',id:camera.id,name:camera.name,streamUrl:camera.streamUrl,view:camera.direction,url:camera.url}}));
 },camera);
 await page.waitForFunction(()=>document.getElementById('liveCameraDialog')?.open,null,{timeout:7000});
 const initial=await page.evaluate(()=>({title:document.getElementById('liveCameraName').textContent,source:document.getElementById('liveCameraDirection').textContent}));
 if(initial.title!==camera.name)throw Error('Wrong camera opened '+JSON.stringify({initial,camera:camera.name}));
 let playing=false;try{await page.waitForFunction(()=>{
   const video=document.getElementById('liveCameraVideo');return video&&!video.paused&&video.readyState>=2&&video.currentTime>0;
 },null,{timeout:42000});playing=true}catch{}
 const state=await page.evaluate(()=>{
  const v=document.getElementById('liveCameraVideo'),d=document.getElementById('liveCameraDialog'),r=d.getBoundingClientRect(),view=visualViewport;
  return {open:d.open,status:document.getElementById('liveCameraStatus').textContent,ready:v.readyState,time:v.currentTime,paused:v.paused,error:v.error?.message||null,hls:!!window.Hls,player:!!window.__shadowNexPrime._cameraHls,modal:{left:r.left,right:r.right,viewportWidth:view.width,viewportOffset:view.offsetLeft}};
 });
 console.log('OKTRAFFIC_LIVE_PLAYBACK',JSON.stringify({camera:{id:camera.id,name:camera.name,streamUrl:camera.streamUrl},playing,state,streamResponses:streamResponses.slice(0,12),errors}));
 if(!playing||errors.length||state.modal.left<state.modal.viewportOffset-2||state.modal.right>state.modal.viewportOffset+state.modal.viewportWidth+2)throw Error('Actual selected camera playback/viewport failed');
 await page.locator('#liveCameraClose').click();
 await page.waitForFunction(()=>document.getElementById('liveCameraVideo')?.getAttribute('src')===null&&!window.__shadowNexPrime._cameraHls,null,{timeout:8000});
 const stopped=await page.evaluate(()=>({dialogOpen:document.getElementById('liveCameraDialog').open,hlsAlive:!!window.__shadowNexPrime._cameraHls,paused:document.getElementById('liveCameraVideo').paused,ready:document.getElementById('liveCameraVideo').readyState,hasSource:!!document.getElementById('liveCameraVideo').getAttribute('src'),network:document.getElementById('liveCameraVideo').networkState}));
 console.log('CAMERA_CLEANUP',JSON.stringify(stopped));
 if(stopped.dialogOpen||stopped.hlsAlive||stopped.hasSource||stopped.ready!==0)throw Error('Camera media network source did not release on close');
 // Also force the HLS.js/MSE fallback used by Android browsers without native HLS support.
 await page.evaluate(()=>{const v=document.getElementById('liveCameraVideo');v.canPlayType=()=>'';});
 await page.evaluate(camera=>{
   window.__shadowNexPrime.openLiveCamera({type:'CCTV',id:camera.id,name:camera.name,streamUrl:camera.streamUrl,view:camera.direction});
 },camera);
 await page.waitForFunction(()=>!!window.Hls&&!!window.__shadowNexPrime._cameraHls,null,{timeout:35000});
 let fallbackPlaying=false;
 try{await page.waitForFunction(()=>{
   const v=document.getElementById('liveCameraVideo');return v&&!v.paused&&v.readyState>=2&&v.currentTime>0;
 },null,{timeout:32000});fallbackPlaying=true}catch{}
 const fallback=await page.evaluate(()=>({hlsLoaded:!!window.Hls,hlsInstance:!!window.__shadowNexPrime._cameraHls,status:document.getElementById('liveCameraStatus').textContent,ready:document.getElementById('liveCameraVideo').readyState,time:document.getElementById('liveCameraVideo').currentTime}));
 console.log('OKTRAFFIC_HLSJS_FALLBACK',JSON.stringify({playing:fallbackPlaying,fallback,errors,streamResponses:streamResponses.slice(-12)}));
 if(!fallbackPlaying)throw Error('HLS.js fallback failed to play selected Oklahoma traffic camera');
 await page.locator('#liveCameraClose').click();
 await page.waitForFunction(()=>!window.__shadowNexPrime._cameraHls,null,{timeout:6000});
 await context.close();
}finally{await browser.close()}
console.log('PASS: exact selected Oklahoma camera live video plays in Chromium, header Reset remains clear, close releases stream');
