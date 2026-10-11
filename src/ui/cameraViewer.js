// Opens the exact public Oklahoma CCTV HLS feed, never the generic map homepage.
export function validatedOklahomaHls(value){
  try{const u=new URL(String(value||''));return u.protocol==='https:'&&u.hostname==='stream.oktraffic.org'&&/^\/delay-stream\/[a-zA-Z0-9_-]+\.stream\/playlist\.m3u8$/.test(u.pathname)&&!u.search&&!u.hash?u.href:null;}catch{return null}
}
let loader;
function loadHls(){
  if(window.Hls)return Promise.resolve(window.Hls);
  if(loader)return loader;
  const urls=['https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js','https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.6.15/hls.min.js'];
  const tryNext=i=>new Promise((resolve,reject)=>{
    if(i>=urls.length)return reject(new Error('HLS playback library unavailable'));
    const s=document.createElement('script');s.src=urls[i];s.async=true;s.crossOrigin='anonymous';
    s.onload=()=>window.Hls?resolve(window.Hls):tryNext(i+1).then(resolve,reject);
    s.onerror=()=>{s.remove();tryNext(i+1).then(resolve,reject)};
    document.head.append(s);
  });
  loader=tryNext(0).catch(e=>{loader=null;throw e});return loader;
}
export function installCameraViewer(app){
  const original=app.init.bind(app);
  app.init=async function(){
    const out=await original();this.ensureLiveCameraUi();
    this.globe.addEventListener('select',e=>{if(e.detail?.type==='CCTV'&&String(e.detail.id||'').startsWith('OK-'))this.openLiveCamera(e.detail)});
    return out;
  };
  app.ensureLiveCameraUi=function(){
    if(this.$('liveCameraDialog'))return;
    const link=document.createElement('link');link.rel='stylesheet';link.href='/src/ui/cameraViewer.css';document.head.append(link);
    const dialog=document.createElement('dialog');dialog.id='liveCameraDialog';dialog.className='modal glass live-camera-dialog';
    dialog.innerHTML=`<div class="modal-card camera-card"><div class="modal-head"><div><b id="liveCameraName">Oklahoma Traffic Camera</b><small id="liveCameraDirection">OKTRAFFIC · PUBLIC CAMERA</small></div><button id="liveCameraClose" class="icon-btn" type="button" aria-label="Close live camera">✕</button></div><div class="camera-video-wrap"><video id="liveCameraVideo" controls autoplay muted playsinline preload="none" aria-label="Oklahoma live traffic camera"></video></div><div id="liveCameraStatus" role="status" aria-live="polite">Connecting…</div><button id="liveCameraRetry" class="hud-btn" type="button">RETRY LIVE VIDEO</button><small class="camera-note">Public OKTraffic / ODOT–OTA video. Feeds may be delayed or unavailable. No recording.</small></div>`;
    document.getElementById('app').append(dialog);
    this.$('liveCameraClose').onclick=()=>dialog.close();
    this.$('liveCameraRetry').onclick=()=>this._cameraMeta&&this.openLiveCamera(this._cameraMeta);
    dialog.addEventListener('close',()=>this.stopLiveCamera());
    this._cameraGeneration=0;
  };
  app.stopLiveCamera=function(){
    this._cameraGeneration=(this._cameraGeneration||0)+1;
    clearTimeout(this._cameraWait);
    if(this._cameraHls){this._cameraHls.destroy();this._cameraHls=null;}
    const v=this.$('liveCameraVideo');if(v){v.pause();v.removeAttribute('src');v.load();}
  };
  app.openLiveCamera=async function(meta){
    this.ensureLiveCameraUi();this.stopLiveCamera();this._cameraMeta=meta;
    const d=this.$('liveCameraDialog'),video=this.$('liveCameraVideo'),status=this.$('liveCameraStatus');
    this.$('liveCameraName').textContent=String(meta.name||'Oklahoma Traffic Camera');
    this.$('liveCameraDirection').textContent='OKTRAFFIC · '+String(meta.view||'LIVE CAMERA').toUpperCase();
    if(!d.open)d.showModal();
    const generation=this._cameraGeneration,stream=validatedOklahomaHls(meta.streamUrl);
    this.$('liveCameraRetry').disabled=!stream;
    status.textContent=stream?'Connecting to this camera’s video stream…':'No direct video published for this camera.';
    if(!stream)return;
    const play=()=>video.play().catch(()=>{if(generation===this._cameraGeneration)status.textContent='Tap Play to start this live camera.'});
    video.onplaying=()=>{if(generation===this._cameraGeneration){clearTimeout(this._cameraWait);status.textContent='LIVE CAMERA · PLAYING'}};
    video.onerror=()=>{if(generation===this._cameraGeneration)status.textContent='Camera feed unavailable. Try again later.'};
    this._cameraWait=setTimeout(()=>{if(generation===this._cameraGeneration&&video.readyState<2)status.textContent='No live frames yet. Retry or select another camera.'},16000);
    try{
      if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=stream;play();return;}
      const Hls=await loadHls();if(generation!==this._cameraGeneration||!d.open)return;
      if(!Hls.isSupported())throw Error('HLS playback unsupported on this device');
      const hls=new Hls({enableWorker:true,lowLatencyMode:false,liveSyncDurationCount:3});this._cameraHls=hls;
      hls.on(Hls.Events.MEDIA_ATTACHED,()=>{if(generation===this._cameraGeneration)hls.loadSource(stream)});
      hls.on(Hls.Events.MANIFEST_PARSED,()=>{if(generation===this._cameraGeneration)play()});
      hls.on(Hls.Events.ERROR,(_event,data)=>{
        if(generation!==this._cameraGeneration||!data?.fatal)return;
        status.textContent='This camera feed is unavailable now. Retry later.';
        if(data.type===Hls.ErrorTypes.NETWORK_ERROR)hls.startLoad();
        else if(data.type===Hls.ErrorTypes.MEDIA_ERROR)hls.recoverMediaError();
        else hls.destroy();
      });
      hls.attachMedia(video);
    }catch(e){if(generation===this._cameraGeneration){console.warn('[traffic camera]',e);status.textContent='Live video unavailable on this device.'}}
  };
}
