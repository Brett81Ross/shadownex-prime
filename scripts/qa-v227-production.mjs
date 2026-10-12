import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const executablePath=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium || command -v chromium-browser'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const url='https://shadownex-prime.vercel.app/';
try{
 const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
 const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const health=await (await page.request.get(url+'api/health',{timeout:25000})).json();
 if(health.version!=='2.2.7'||health.status!=='ok')throw Error('Unexpected production release '+JSON.stringify(health));
 for(const size of [{width:360,height:740},{width:840,height:620},{width:360,height:740}]){
  await page.setViewportSize(size);await page.waitForTimeout(350);
  const geometry=await page.evaluate(()=>{
   const r=e=>{const b=e.getBoundingClientRect();return {l:b.left,r:b.right,t:b.top,b:b.bottom}};
   const root=document.getElementById('app'),reset=document.getElementById('resetAppBtn'),header=root.querySelector('.topbar'),nav=document.getElementById('friendlyNav');
   const width=visualViewport.width;
   return {root:r(root),reset:r(reset),header:r(header),nav:r(nav),width};
  });
  const g=geometry,ok=g.reset.l>=g.header.l-1&&g.reset.r<=g.header.r+1&&g.reset.t>=g.header.t-1&&g.reset.b<=g.header.b+1&&g.reset.b<g.nav.t&&g.root.r-g.root.l>=Math.min(size.width,g.width)-3;
  console.log('PRODUCTION_FOLD',JSON.stringify({size,ok,geometry:g}));
  if(!ok)throw Error('Reset/topbar/globe clipping on '+JSON.stringify(size));
 }
 const locations=[['Oklahoma City',35.4676,-97.5164],['Vienna',48.2082,16.3738],['Tokyo',35.6895,139.6917]];
 let austria;
 for(const [city,lat,lon] of locations){
  const r=await page.request.get(url+'api/webcams?lat='+lat+'&lon='+lon,{timeout:30000});
  const d=await r.json();
  const ok=r.status()===200&&d.configured===true&&d.status!=='DEGRADED'&&Array.isArray(d.points)&&d.points.length>0;
  console.log('PRODUCTION_WINDY',JSON.stringify({city,http:r.status(),ok,configured:d.configured,status:d.status||null,count:d.points?.length,source:d.source}));
  if(!ok)throw Error('Windy worldwide query failed in '+city);
  if(city==='Vienna')austria=d.points[0];
 }
 const cameras=await (await page.request.get(url+'api/cctv',{timeout:45000})).json();
 const camera=cameras.points?.find(p=>p.source==='OKTraffic / ODOT-OTA'&&typeof p.streamUrl==='string');
 if(!camera)throw Error('Live Oklahoma traffic camera not in production catalog');
 await page.evaluate(c=>window.__shadowNexPrime.globe.dispatchEvent(new CustomEvent('select',{detail:{type:'CCTV',...c}})),camera);
 await page.waitForFunction(()=>document.getElementById('liveCameraDialog')?.open,null,{timeout:7000});
 let playing=false;try{
  await page.waitForFunction(()=>{const v=document.getElementById('liveCameraVideo');return v&&!v.paused&&v.readyState>=2&&v.currentTime>0},null,{timeout:36000});
  playing=true;
 }catch{}
 const video=await page.evaluate(()=>{const v=document.getElementById('liveCameraVideo');return {name:document.getElementById('liveCameraName').textContent,status:document.getElementById('liveCameraStatus').textContent,time:v.currentTime,ready:v.readyState,mediaSrc:!!v.src}});
 console.log('PRODUCTION_OKTRAFFIC',JSON.stringify({playing,cameraId:camera.id,video}));
 if(!playing)throw Error('Production Oklahoma live video frames not confirmed');
 await page.locator('#liveCameraClose').click();
 await page.waitForFunction(()=>!document.getElementById('liveCameraDialog').open&&!window.__shadowNexPrime._cameraHls,null,{timeout:8000});
 await page.evaluate(c=>window.__shadowNexPrime.openLiveCamera({...c,type:'CCTV'}),austria);
 await page.waitForFunction(()=>document.getElementById('liveCameraDialog')?.open,null,{timeout:7000});
 const credit=await page.evaluate(()=>({creditVisible:!document.getElementById('liveCameraWindyCredit').hidden,sourceHref:document.getElementById('liveCameraSource').href,selectedName:document.getElementById('liveCameraName').textContent}));
 console.log('PRODUCTION_WINDY_VIEWER',JSON.stringify(credit));
 if(!credit.creditVisible||!credit.sourceHref.includes('windy.com/webcams/')||credit.selectedName!==austria.name)throw Error('Windy player attribution or selected source incorrect');
 if(errors.length)throw Error('Browser JS errors '+JSON.stringify(errors));
 await ctx.close();
}finally{await browser.close()}
console.log('PASS: v2.2.7 production Fold layout, live Oklahoma HLS, Windy public webcams in three global locations, provider attribution; no deployment');
