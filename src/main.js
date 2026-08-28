import { ShadowNexPrime } from './app.js';
function dismissSplash(){
  const splash=document.getElementById('brandSplash');
  if(!splash)return;
  splash.classList.add('out');
  window.setTimeout(()=>splash.remove(),450);
}
function boot(){
  const wait=()=>{
    if(window.Cesium){new ShadowNexPrime().init().then(dismissSplash).catch(fatal);}
    else setTimeout(wait,60);
  };
  wait();
}
function fatal(err){
  dismissSplash();
  console.error(err);
  const box=document.createElement('div');
  box.style.cssText='position:fixed;inset:20px;z-index:9999;background:#080d12;color:#e9fbff;border:1px solid #ff4058;padding:20px;font:14px system-ui;overflow:auto';
  box.innerHTML=`<h2 style="color:#ff4058">ShadowNex initialization failed</h2><pre>${String(err?.stack||err)}</pre>`;
  document.body.appendChild(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
