/* ShadowNex Prime™ — Cactus🌵Byte Demo & Help Standard */
(()=>{
  'use strict';
  const KEY='cbs_demo_seen:shadownex-prime:1';
  const DISMISS='cbs_demo_dismissed:shadownex-prime:1';
  const steps=[
    ['Explore the globe','Drag to rotate, scroll or pinch to zoom, and use the globe as the main spatial view for active intelligence layers.'],
    ['Choose NexVision™ layers','Open the layer panel and enable the public-source feeds you want to see. Layer availability can change; NexPulse shows feed health.'],
    ['Inspect with PrimeScope™','Select a contact or marker on the globe to open PrimeScope. Use Track or Cockpit when those actions are available for the selected contact.'],
    ['Change ShadowLens™','Switch between Normal, NVG, Thermal and CRT display modes. These are visualization filters, not literal night-vision or thermal sensor feeds from your device.'],
    ['Mark and measure with NexDraw™','Use Mark, Route, Area and Measure to annotate the map. Finish the active drawing before starting another tool.'],
    ['Use SceneDirector™','Orbit a selected contact, run a world sweep, play a saved route, or stop an active scene movement.'],
    ['Check NexPulse™ and NexCommand™','NexPulse shows source/feed status. NexCommand accepts shortcuts such as “show aircraft”, “go to Tokyo”, “thermal mode” and “brief me”.'],
    ['Tune Settings and share','Settings stores optional public-service keys on this device. Signal Share creates a link/QR for the app. Public-source data may be delayed, incomplete or unavailable.']
  ];
  const css=document.createElement('style');
  css.textContent=`
    .snx-help-trigger{min-width:38px!important;padding:8px 10px!important;font-weight:900!important}
    .snx-help-backdrop{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.82);display:none;align-items:flex-end;justify-content:center;padding-top:env(safe-area-inset-top)}
    .snx-help-backdrop.open{display:flex}.snx-help-panel{width:min(100%,760px);max-height:92dvh;overflow:auto;background:linear-gradient(160deg,#071015,#04080c);color:#e9fbff;border:1px solid rgba(62,220,255,.34);border-bottom:0;border-radius:26px 26px 0 0;padding:18px 16px calc(24px + env(safe-area-inset-bottom));box-shadow:0 -28px 80px rgba(0,0,0,.75)}
    .snx-help-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.snx-help-kicker{font:800 9px system-ui;letter-spacing:.2em;color:#52dff6}.snx-help-head h2{margin:4px 0 0;font:900 21px system-ui}.snx-help-x{width:40px;height:40px;border-radius:50%;border:1px solid rgba(62,220,255,.28);background:#0a151c;color:#fff;font-size:22px}.snx-help-sub{color:#8daab5;font:12px/1.5 system-ui}.snx-help-video{border:1px solid rgba(62,220,255,.28);border-radius:17px;padding:10px;background:#071219}.snx-help-video video{display:block;width:100%;max-height:62dvh;border-radius:12px;background:#000}.snx-help-video small{display:block;padding-top:8px;color:#829ea8;text-align:center;font:10px/1.4 system-ui}.snx-help-steps{display:grid;gap:9px;margin-top:13px}.snx-help-step{border:1px solid rgba(62,220,255,.18);border-radius:15px;padding:12px;background:rgba(8,22,29,.88)}.snx-help-step strong{display:block;color:#52dff6;font:800 12px system-ui}.snx-help-step span{display:block;margin-top:4px;color:#9bb1ba;font:11px/1.45 system-ui}.snx-help-note{margin-top:13px;border:1px solid rgba(255,196,82,.28);border-radius:14px;padding:11px;background:rgba(54,39,7,.45);color:#e8cb83;font:11px/1.45 system-ui}.snx-help-check{display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:#8daab5;font:11px/1.4 system-ui}.snx-help-done{width:100%;margin-top:13px;border:0;border-radius:13px;padding:13px;background:linear-gradient(135deg,#55e7ff,#70ffcf);color:#031015;font-weight:950}
    @media(min-width:760px){.snx-help-backdrop{align-items:center;padding:24px}.snx-help-panel{border-bottom:1px solid rgba(62,220,255,.34);border-radius:26px;max-height:88vh}}
  `;
  document.head.appendChild(css);
  const trigger=document.createElement('button');trigger.type='button';trigger.className='hud-btn snx-help-trigger';trigger.textContent='?';trigger.setAttribute('aria-label','How to use ShadowNex Prime');trigger.title='How to use ShadowNex Prime';
  (document.querySelector('.top-actions')||document.querySelector('.topbar')||document.body).appendChild(trigger);
  const backdrop=document.createElement('div');backdrop.className='snx-help-backdrop';backdrop.innerHTML=`<section class="snx-help-panel" role="dialog" aria-modal="true" aria-labelledby="snxHelpTitle"><div class="snx-help-head"><div><div class="snx-help-kicker">SHADOWNEX PRIME™ · v2.2.0 DEMO & HELP</div><h2 id="snxHelpTitle">Global Situational Intelligence</h2></div><button class="snx-help-x" aria-label="Close help">×</button></div><p class="snx-help-sub">A quick walkthrough of the fastest way to navigate ShadowNex Prime and understand what each intelligence surface does.</p><div class="snx-help-video"><video controls playsinline preload="metadata"><source src="https://cactusbyte-studios.vercel.app/demos/shadownex-prime-60-second-demo.mp4" type="video/mp4">Your browser could not play the 60-second demo.</video><small>ShadowNex Prime™ · Cactus🌵Byte Studios™ · All Rights Reserved</small></div><div class="snx-help-steps">${steps.map((s,i)=>`<div class="snx-help-step"><strong>${i+1}. ${s[0]}</strong><span>${s[1]}</span></div>`).join('')}</div><div class="snx-help-note"><strong>Data note:</strong> ShadowNex Prime combines public/open-source feeds and visualization tools. Feed health, timing and completeness vary by source; the interface should not be treated as classified, guaranteed real-time, or emergency-response data.</div><label class="snx-help-check"><input type="checkbox" class="snx-help-dont"><span>Don’t show this automatically again. The ? button always reopens Help.</span></label><button class="snx-help-done">ENTER SHADOWNEX</button></section>`;document.body.appendChild(backdrop);
  const dont=backdrop.querySelector('.snx-help-dont');
  const close=()=>{try{if(dont.checked)localStorage.setItem(DISMISS,'1')}catch{}backdrop.classList.remove('open');};
  const open=(auto=false)=>{backdrop.classList.add('open');if(auto)try{localStorage.setItem(KEY,'1')}catch{}};
  trigger.onclick=()=>open(false);backdrop.querySelector('.snx-help-x').onclick=close;backdrop.querySelector('.snx-help-done').onclick=close;backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
  try{if(localStorage.getItem(KEY)!=='1'&&localStorage.getItem(DISMISS)!=='1')setTimeout(()=>open(true),1100)}catch{}
})();
