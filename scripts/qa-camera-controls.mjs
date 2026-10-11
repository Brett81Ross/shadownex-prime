import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const exe=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath:exe,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:35000});
 await p.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
 await p.evaluate(()=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const app=window.__shadowNexPrime;
  app.layers.get('cctv').catalogPoints=[
   {id:'OK-N',source:'OKTraffic / ODOT-OTA',groupId:'TEST-INTERSECTION',name:'Test North',direction:'North',streamUrl:'https://stream.oktraffic.org/delay-stream/1234.stream/playlist.m3u8'},
   {id:'OK-S',source:'OKTraffic / ODOT-OTA',groupId:'TEST-INTERSECTION',name:'Test South',direction:'South',streamUrl:'https://stream.oktraffic.org/delay-stream/5678.stream/playlist.m3u8'}];
  document.getElementById('liveCameraVideo').canPlayType=()=> 'probably';
  app.openLiveCamera({...app.layers.get('cctv').catalogPoints[0],type:'CCTV'});
 });
 await p.waitForFunction(()=>document.getElementById('liveCameraDialog')?.open);
 if(await p.locator('#liveCameraDirections button').count()!==2)throw Error('Two provider views not shown');
 await p.locator('#liveCameraDirections button').filter({hasText:'South'}).click();
 const switched=await p.evaluate(()=>({id:window.__shadowNexPrime._cameraMeta.id,src:document.getElementById('liveCameraVideo').src}));
 if(switched.id!=='OK-S'||!switched.src.includes('/5678.stream/'))throw Error('Wrong stream after direction change '+JSON.stringify(switched));
 await p.evaluate(()=>{window.__fsCalled=false;document.getElementById('liveCameraVideo').requestFullscreen=async()=>{window.__fsCalled=true}});
 await p.locator('#liveCameraFullscreen').click();
 if(!await p.evaluate(()=>window.__fsCalled))throw Error('Fullscreen not requested');
 await p.evaluate(()=>window.__shadowNexPrime.openLiveCamera({id:'SEA-1',type:'CCTV',name:'Seattle',source:'Seattle DOT',url:'https://www.seattle.gov/transportation'}));
 const fallback=await p.evaluate(()=>({link:!document.getElementById('liveCameraSource').hidden,status:document.getElementById('liveCameraStatus').textContent,videoHidden:document.getElementById('liveCameraVideo').hidden}));
 if(!fallback.link||!fallback.videoHidden||!fallback.status.includes('No direct playable'))throw Error('No official external provider fallback');
 await p.evaluate(()=>window.__shadowNexPrime.openLiveCamera({id:'IA-1',type:'CCTV',source:'Iowa DOT',name:'Iowa photo',previewUrl:'https://atmsqf.iowadot.gov/snapshots/Public/RWIS/RWIS_84-01.jpg'}));
 if(await p.evaluate(()=>document.getElementById('liveCameraImage').hidden))throw Error('Official still image not displayed');
 await p.evaluate(()=>window.__shadowNexPrime.openLiveCamera({id:'UK-1',type:'CCTV',source:'Transport for London',name:'UK JamCam',videoUrl:'https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00002.00865.mp4'}));
 if(!await p.evaluate(()=>document.getElementById('liveCameraAttribution').textContent.includes('Recent recorded clip')))throw Error('TfL clip mislabeled as live');
 await p.locator('#liveCameraClose').click();
 if(errors.length)throw Error('Browser errors '+JSON.stringify(errors));
 console.log('PASS: real UI direction, fullscreen button, external official source, Iowa snapshot, TfL clip truth-labeling');
 await ctx.close();
}finally{await browser.close()}
