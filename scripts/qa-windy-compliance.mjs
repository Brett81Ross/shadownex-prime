import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
const executablePath=execFileSync('bash',['-lc','command -v google-chrome || command -v chromium'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const ctx=await browser.newContext({viewport:{width:360,height:740},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 16; SM-F936U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'});
const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(String(e)));
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9Y4AAAAASUVORK5CYII=','base64');
await page.route('https://images-webcams.windy.com/**',route=>route.fulfill({status:200,contentType:'image/png',body:png}));
await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>!!window.__shadowNexPrime,null,{timeout:35000});
await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
await page.evaluate(()=>window.__shadowNexPrime.openLiveCamera({type:'CCTV',id:'WINDY-123',name:'Austrian test camera',source:'Windy Webcams',url:'https://www.windy.com/webcams/123',previewUrl:'https://images-webcams.windy.com/test.jpg'}));
await page.waitForFunction(()=>document.getElementById('liveCameraImage')?.complete);
const d=await page.evaluate(()=>{
const dialog=document.getElementById('liveCameraDialog'),img=document.getElementById('liveCameraImage'),credit=document.getElementById('liveCameraWindyCredit'),link=document.getElementById('liveCameraImageLink'),box=dialog.getBoundingClientRect();
return {open:dialog.open,creditVisible:!credit.hidden,links:[...credit.querySelectorAll('a')].map(a=>a.href),imageLink:link.href,imageLinkShown:!link.hidden,imageLoaded:img.naturalWidth>0,naturalWidth:img.naturalWidth,renderedWidth:img.getBoundingClientRect().width,naturalHeight:img.naturalHeight,renderedHeight:img.getBoundingClientRect().height,mode:img.dataset.provider,status:document.getElementById('liveCameraStatus').textContent,dialogWidth:box.width,screen:visualViewport.width};
});
console.log('WINDY_FREE_TIER_QA',JSON.stringify({data:d,pageErrors:errs}));
if(!d.open||!d.creditVisible||d.links.length!==2||!d.links.some(x=>x.includes('/webcams/add'))||d.imageLink!=='https://www.windy.com/webcams/123'||!d.imageLinkShown||!d.imageLoaded||d.renderedWidth>d.naturalWidth+0.2||d.renderedHeight>d.naturalHeight+0.2||d.dialogWidth>d.screen+2||d.mode!=='windy'||errs.length)throw Error('Windy license and safety browser gate failed');
await page.locator('#liveCameraClose').click();
await page.waitForFunction(()=>!document.getElementById('liveCameraDialog').open);
await page.evaluate(()=>window.__shadowNexPrime.openLiveCamera({type:'CCTV',id:'WINDY-123',name:'Austrian test camera',source:'Windy Webcams',url:'https://www.windy.com/webcams/123',playerUrl:'https://embed.windy.com/webcams/123/live'}));
const embed=await page.evaluate(()=>({kind:document.getElementById('liveCameraEmbed').src,creditVisible:!document.getElementById('liveCameraWindyCredit').hidden,sourceHref:document.getElementById('liveCameraSource').href}));
console.log('WINDY_EMBED_QA',JSON.stringify(embed));
if(!embed.kind.startsWith('https://embed.windy.com/')||!embed.creditVisible||embed.sourceHref!=='https://www.windy.com/webcams/123')throw Error('Windy embed attribution failed');
await ctx.close();
}finally{await browser.close();}
console.log('PASS: Windy free-tier image never enlarged, visible linked credit, provider image link, secure embed and Fold viewport');
