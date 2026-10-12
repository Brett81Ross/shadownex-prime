import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const executablePath=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const target='https://shadownex-prime.vercel.app/';
const regions=[['Oklahoma City',35.4676,-97.5164],['Vienna',48.2082,16.3738],['Tokyo',35.6762,139.6503]];
try{
 const context=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:45000});
 await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 const release=await page.evaluate(()=>({version:document.documentElement?.getAttribute('data-version'),title:document.title,app:!!window.__shadowNexPrime}));
 const response=await page.request.get(target+'api/health',{timeout:35000});
 const health=await response.json();
 if(health.version!=='2.2.7'||health.status!=='ok')throw Error('Unexpected production health '+JSON.stringify(health));
 console.log('PRODUCTION_VERSION',JSON.stringify({version:health.version,health:health.status,appStarted:release.app}));
 let first;
 for(const [name,lat,lon] of regions){
   const resp=await page.request.get(target+'api/webcams?lat='+lat+'&lon='+lon,{timeout:36000});
   if(!resp.ok())throw Error(name+' webcam HTTP '+resp.status());
   const data=await resp.json();const pts=data.points||[];
   const summary={region:name,configured:data.configured,status:data.status||'OK',count:pts.length,source:data.source,hasPlayer:pts.filter(p=>!!p.playerUrl).length,hasPreview:pts.filter(p=>!!p.previewUrl).length};
   console.log('WINDY_REGION',JSON.stringify(summary));
   if(!data.configured||data.status==='DEGRADED'||!pts.length||pts.some(x=>x.source!=='Windy Webcams'))throw Error('Windy activation failed in '+name);
   if(!first)first=pts.find(p=>p.playerUrl)||pts[0];
 }
 if(!first)throw Error('No Windy camera');
 await page.evaluate(meta=>window.__shadowNexPrime.openLiveCamera({...meta,type:'CCTV'}),first);
 await page.waitForFunction(()=>document.getElementById('liveCameraDialog')?.open,null,{timeout:9000});
 const overlay=await page.evaluate(()=>{
  const d=document.getElementById('liveCameraDialog'),v=visualViewport,r=d.getBoundingClientRect(),credit=document.getElementById('liveCameraWindyCredit'),source=document.getElementById('liveCameraSource'),player=document.getElementById('liveCameraEmbed'),image=document.getElementById('liveCameraImage');
  return {open:d.open,left:r.left,right:r.right,visualLeft:v.offsetLeft,visualRight:v.offsetLeft+v.width,credit:!credit.hidden,source:source.href,playerShown:!player.hidden,playerSrc:player.src,imageShown:!image.hidden,status:document.getElementById('liveCameraStatus').textContent};
 });
 console.log('WINDY_PLAYER_DIALOG',JSON.stringify({open:overlay.open,withinVisible:overlay.left>=overlay.visualLeft-2&&overlay.right<=overlay.visualRight+2,credit:overlay.credit,sourceValid:overlay.source.startsWith('https://'),player:overlay.playerShown?'embed':overlay.imageShown?'snapshot':'none',status:overlay.status}));
 if(!overlay.open||overlay.left<overlay.visualLeft-2||overlay.right>overlay.visualRight+2||!overlay.credit||!overlay.source.startsWith('https://')||(!overlay.playerShown&&!overlay.imageShown))throw Error('Windy player dialog layout/attribution failed');
 await page.locator('#liveCameraClose').click();
 for(const size of [{width:840,height:620},{width:360,height:740}]){
   await page.setViewportSize(size);await page.waitForTimeout(400);
   const ui=await page.evaluate(()=>{
    const bound=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
    return {reset:bound(document.getElementById('resetAppBtn')),header:bound(document.querySelector('.topbar')),nav:bound(document.getElementById('friendlyNav')),root:bound(document.getElementById('app')),viewport:visualViewport.width};
   });
   const pass=ui.reset.left>=ui.header.left-2&&ui.reset.right<=ui.header.right+2&&ui.reset.bottom<=ui.header.bottom+2&&ui.reset.bottom<ui.nav.top&&ui.root.right>=ui.viewport-4;
   console.log('FOLD_HEADER',JSON.stringify({size,pass}));
   if(!pass)throw Error('Fold Reset/header placement failed '+JSON.stringify(ui));
 }
 if(errors.length)throw Error('Production page errors '+JSON.stringify(errors.slice(0,5)));
 console.log('PASS: live v2.2.7 Windy OKC/Vienna/Tokyo, viewer credit/media, and Fold sizing');
 await context.close();
}finally{await browser.close()}
