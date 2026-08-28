import { ShadowNexPrime } from './app.js';
import { installAblEnhancements } from './ui/ablEnhancements.js';
function boot(){
  const started=Date.now();
  const wait=()=>{if(window.Cesium){(()=>{const app=new ShadowNexPrime();installAblEnhancements(app);return app.init();})().catch(fatal);}else if(Date.now()-started>15000){fatal(new Error('Map engine did not load. Check your connection and reload.'));}else setTimeout(wait,80)};wait();
}
function fatal(err){console.error(err);const box=document.createElement('div');box.style.cssText='position:fixed;inset:20px;z-index:9999;background:#080d12;color:#e9fbff;border:1px solid #ff4058;padding:20px;font:14px system-ui;overflow:auto;border-radius:12px';const h=document.createElement('h2');h.style.color='#ff4058';h.textContent='ShadowNex needs a reload';const p=document.createElement('p');p.textContent='The map could not finish starting. Your settings are safe.';const pre=document.createElement('pre');pre.textContent=String(err?.message||err);const b=document.createElement('button');b.textContent='RELOAD APP';b.style.cssText='padding:12px 16px;background:#00f0ff;color:#001316;border:0;border-radius:8px;font-weight:800';b.onclick=()=>location.reload();box.append(h,p,pre,b);document.body.appendChild(box);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
