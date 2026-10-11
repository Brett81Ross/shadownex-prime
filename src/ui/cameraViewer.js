// Media-aware worldwide camera viewer. Never label snapshots or loops as live video.
export function validatedOklahomaHls(value){
  const media=resolveCameraMedia({streamUrl:value,source:'OKTraffic / ODOT-OTA'});
  return media?.kind==='hls'?media.url:null;
}
export function resolveCameraMedia(meta){
  const source=String(meta?.source||''),raw=meta?.streamUrl||meta?.videoUrl||null;
  const parse=value=>{try{const u=new URL(String(value||''));if(u.protocol!=='https:'||u.username||u.password)return null;return u;}catch{return null}};
  const video=parse(raw);
  if(video){
    const host=video.hostname.toLowerCase(),path=video.pathname;
    const ok=source==='OKTraffic / ODOT-OTA'&&host==='stream.oktraffic.org'&&/^\/delay-stream\/[\w-]+\.stream\/playlist\.m3u8$/.test(path)&&!video.search;
    const iowa=source==='Iowa DOT'&&/^video\d*\.iowadot\.gov$/.test(host)&&path.endsWith('.m3u8');
    const caltrans=source==='Caltrans'&&(host==='dot.ca.gov'||host.endsWith('.dot.ca.gov'))&&path.endsWith('.m3u8');
    const london=source==='Transport for London'&&host==='s3-eu-west-1.amazonaws.com'&&path.startsWith('/jamcams.tfl.gov.uk/')&&path.endsWith('.mp4');
    if(ok||iowa||caltrans)return {kind:'hls',url:video.href,label:'LIVE VIDEO',provider:source};
    if(london)return {kind:'clip',url:video.href,label:'RECENT VIDEO CLIP',provider:source};
  }
  const img=parse(meta?.previewUrl);
  if(img){
    const h=img.hostname.toLowerCase();
    const allowed=source==='Iowa DOT'&&h.endsWith('.iowadot.gov')||
      source==='Transport for London'&&h==='s3-eu-west-1.amazonaws.com'&&img.pathname.startsWith('/jamcams.tfl.gov.uk/')||
      source==='Caltrans'&&(h==='dot.ca.gov'||h.endsWith('.dot.ca.gov'))||
      source==='City of Austin'&&(h.endsWith('.austintexas.gov')||h.endsWith('.texas.gov'));
    if(allowed)return {kind:'snapshot',url:img.href,label:'UPDATED CAMERA IMAGE',provider:source};
  }
  return null;
}
let hlsLoader;
function loadHls(){
 if(window.Hls)return Promise.resolve(window.Hls);
 if(hlsLoader)return hlsLoader;
 const urls=['https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js','https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.6.15/hls.min.js'];
 const next=i=>new Promise((resolve,reject)=>{
  if(i>=urls.length)return reject(Error('HLS player library unavailable'));
  const script=document.createElement('script');script.src=urls[i];script.async=true;script.crossOrigin='anonymous';
  script.onload=()=>window.Hls?resolve(window.Hls):next(i+1).then(resolve,reject);
  script.onerror=()=>{script.remove();next(i+1).then(resolve,reject)};
  document.head.append(script);
 });
 hlsLoader=next(0).catch(error=>{hlsLoader=null;throw error});return hlsLoader;
}
export function cameraDirections(meta,points=[]){
 const group=String(meta?.groupId||''),matching=group?
  points.filter(p=>p.groupId===group&&p.source===meta.source):[];
 const list=matching.length?matching:[meta];
 return list.filter(Boolean).map(c=>({
  type:'CCTV',id:c.id,name:c.name,source:c.source,view:c.direction??c.view??null,
  streamUrl:c.streamUrl,videoUrl:c.videoUrl,previewUrl:c.previewUrl,url:c.url,groupId:c.groupId,
  latitude:c.lat??c.latitude,longitude:c.lon??c.longitude,mediaKind:c.mediaKind
 })).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).sort((a,b)=>String(a.view||'').localeCompare(String(b.view||'')));
}
export function installCameraViewer(app){
 const original=app.init.bind(app);
 app.init=async function(){
  const result=await original();this.ensureLiveCameraUi();
  this.globe.addEventListener('select',e=>{if(e.detail?.type==='CCTV')this.openLiveCamera(e.detail)});
  return result;
 };
 app.ensureLiveCameraUi=function(){
  if(this.$('liveCameraDialog'))return;
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/src/ui/cameraViewer.css';document.head.append(sheet);
  const dialog=document.createElement('dialog');dialog.id='liveCameraDialog';dialog.className='modal glass live-camera-dialog';
  dialog.innerHTML=`<div class="modal-card camera-card">
  <div class="modal-head"><div><b id="liveCameraName">Public Camera</b><small id="liveCameraDirection">OFFICIAL PUBLIC SOURCE</small></div><button id="liveCameraClose" type="button" class="icon-btn" aria-label="Close camera">✕</button></div>
  <div class="camera-media"><video id="liveCameraVideo" controls autoplay muted playsinline preload="none" aria-label="Selected camera video"></video><img id="liveCameraImage" alt="Latest camera image" hidden/></div>
  <div id="liveCameraStatus" role="status" aria-live="polite">Selecting camera…</div>
  <div id="liveCameraDirections" role="group" aria-label="Available camera directions" class="camera-directions" hidden></div>
  <div class="camera-actions"><button id="liveCameraFullscreen" type="button" class="hud-btn">FULLSCREEN</button><button id="liveCameraRetry" type="button" class="hud-btn">RETRY CAMERA</button><a id="liveCameraSource" class="hud-btn" target="_blank" rel="noopener noreferrer" hidden>OFFICIAL SOURCE</a></div>
  <small id="liveCameraAttribution" class="camera-note">Public camera, provider availability varies. Live video is not guaranteed. No recording.</small></div>`;
  document.getElementById('app').append(dialog);
  this.$('liveCameraClose').onclick=()=>{this.stopLiveCamera();dialog.close()};
  this.$('liveCameraRetry').onclick=()=>this._cameraMeta&&this.openLiveCamera(this._cameraMeta);
  this.$('liveCameraFullscreen').onclick=async()=>{
   const video=this.$('liveCameraVideo'),media=this._cameraMedia;
   const target=media?.kind==='hls'||media?.kind==='clip'?video:dialog;
   try{if(target.requestFullscreen)await target.requestFullscreen();else if(video.webkitEnterFullscreen&&target===video)video.webkitEnterFullscreen();else this.$('liveCameraStatus').textContent='Fullscreen is not available on this device.'}
   catch{this.$('liveCameraStatus').textContent='Fullscreen is blocked by this browser.'}
  };
  dialog.addEventListener('close',()=>{if(!dialog.open)this.stopLiveCamera()});
  this._cameraGeneration=0;
 };
 app.stopLiveCamera=function(){
  this._cameraGeneration=(this._cameraGeneration||0)+1;
  clearTimeout(this._cameraWait);this._cameraWait=null;
  if(this._cameraHls){this._cameraHls.destroy();this._cameraHls=null}
  const v=this.$('liveCameraVideo');
  if(v){v.autoplay=false;v.onplaying=null;v.onerror=null;v.pause();v.removeAttribute('src');v.load();v.pause()}
  const img=this.$('liveCameraImage');if(img){img.onload=null;img.onerror=null;img.removeAttribute('src')}
 };
 app.cameraOptionsFor=function(meta){
  return cameraDirections(meta,this.layers?.get('cctv')?.catalogPoints||[]);
 };
 app.openLiveCamera=async function(meta){
  this.ensureLiveCameraUi();
  this.stopLiveCamera();this._cameraMeta=meta;
  const dialog=this.$('liveCameraDialog'),video=this.$('liveCameraVideo'),img=this.$('liveCameraImage'),status=this.$('liveCameraStatus');
  const media=resolveCameraMedia(meta);this._cameraMedia=media;
  this.$('liveCameraName').textContent=String(meta.name||'Public Camera');
  this.$('liveCameraDirection').textContent=String(meta.source||'Public Camera')+' · '+String(meta.view||meta.direction||'VIEW');
  const directions=this.$('liveCameraDirections'),options=this.cameraOptionsFor(meta);
  directions.replaceChildren();directions.hidden=options.length<2;
  for(const option of options){
   const button=document.createElement('button');button.type='button';button.textContent=String(option.view||option.name||option.id).slice(0,45);
   button.className=option.id===meta.id?'selected':'';button.disabled=option.id===meta.id;
   button.onclick=()=>this.openLiveCamera(option);directions.append(button);
  }
  const official=this.$('liveCameraSource');let source=null;
  try{const u=new URL(String(meta.url||''));if(u.protocol==='https:'&&u.hostname&&!u.username&&!u.password)source=u.href}catch{}
  official.hidden=!source;if(source)official.href=source;else official.removeAttribute('href');
  this.$('liveCameraRetry').disabled=!media;
  this.$('liveCameraFullscreen').disabled=!media;
  this.$('liveCameraAttribution').textContent=String(meta.source||'Public source')+' · '+(media?.kind==='hls'?'Live video may be delayed or offline.':media?.kind==='clip'?'Recent recorded clip. Not continuous live video.':media?.kind==='snapshot'?'Latest published image. Not continuous live video.':'No embeddable feed available.')+' No recording.';
  video.hidden=!media||media.kind==='snapshot';img.hidden=media?.kind!=='snapshot';
  status.textContent=media?media.label+' · CONNECTING…':'No direct playable feed available for this camera. Check the official provider.';
  if(!dialog.open)dialog.showModal();this.$('app')?.__snxFitDialogs?.();
  const generation=this._cameraGeneration;
  if(!media)return;
  if(media.kind==='snapshot'){
   img.alt='Latest published image from '+String(meta.name||meta.source||'public camera');
   img.onload=()=>{if(generation===this._cameraGeneration)status.textContent='LATEST PUBLISHED CAMERA IMAGE · NOT LIVE VIDEO'};
   img.onerror=()=>{if(generation===this._cameraGeneration)status.textContent='Camera image unavailable from provider.'};
   img.src=media.url;return;
  }
  video.autoplay=true;
  const play=()=>{video.play()?.catch?.(()=>{if(generation===this._cameraGeneration)status.textContent='Tap Play to view this camera.'})};
  video.onplaying=()=>{if(generation===this._cameraGeneration){clearTimeout(this._cameraWait);status.textContent=media.kind==='clip'?'RECENT CLIP PLAYING · NOT LIVE':'LIVE CAMERA · PLAYING'}};
  video.onerror=()=>{if(generation===this._cameraGeneration)status.textContent='Camera media is currently unavailable.'};
  this._cameraWait=setTimeout(()=>{if(generation===this._cameraGeneration&&video.readyState<2)status.textContent='No video frames received. Retry or select another view.'},16000);
  try{
   if(media.kind==='clip'||video.canPlayType('application/vnd.apple.mpegurl')){video.src=media.url;play();return}
   const Hls=await loadHls();if(generation!==this._cameraGeneration||!dialog.open)return;
   if(!Hls.isSupported())throw Error('Video streaming unsupported');
   const hls=new Hls({enableWorker:true,lowLatencyMode:false,liveSyncDurationCount:3});this._cameraHls=hls;
   hls.on(Hls.Events.MEDIA_ATTACHED,()=>{if(generation===this._cameraGeneration)hls.loadSource(media.url)});
   hls.on(Hls.Events.MANIFEST_PARSED,()=>{if(generation===this._cameraGeneration)play()});
   hls.on(Hls.Events.ERROR,(_event,data)=>{
    if(generation!==this._cameraGeneration||!data?.fatal)return;
    status.textContent='Selected camera stream is unavailable. Retry later.';
    if(data.type===Hls.ErrorTypes.NETWORK_ERROR)hls.startLoad();
    else if(data.type===Hls.ErrorTypes.MEDIA_ERROR)hls.recoverMediaError();
    else{hls.destroy();this._cameraHls=null}
   });
   hls.attachMedia(video);
  }catch(error){if(generation===this._cameraGeneration){console.warn('[camera viewer]',error);status.textContent='Video playback unavailable on this device.'}}
 };
}
