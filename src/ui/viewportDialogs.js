// Bind remaining application dialogs to the visual (rather than Android layout) viewport.
// The welcome/location and situation dialogs already have dedicated positioning.
export function installViewportDialogs(){
  const root=document.getElementById('app');
  if(!root||root.__snxViewportDialogs)return;
  root.__snxViewportDialogs=true;
  const excluded=new Set(['locationStartDialog','situationDialog']);
  const layout=()=>{
    const v=window.visualViewport;
    // Some Android browser and Fold configurations expose an inflated layout viewport
    // (e.g. 720 CSS px for 360 visible px). Constrain the whole app surface to the
    // visible viewport; otherwise focusing a control pans the document horizontally.
    const screenWidth=Math.max(1,v?.width||window.innerWidth);
    const screenHeight=Math.max(1,v?.height||window.innerHeight);
    if(v&&Math.abs(window.innerWidth-screenWidth)>8&&Math.abs(v.scale-1)<0.01){
      document.documentElement.style.width=screenWidth+'px';
      document.body.style.width=screenWidth+'px';
      root.style.width=screenWidth+'px';
      root.style.height=screenHeight+'px';
      root.style.position='fixed';
      root.style.left='0';
      root.style.top='0';
      root.style.maxWidth=screenWidth+'px';
      root.style.maxHeight=screenHeight+'px';
      window.requestAnimationFrame(()=>{
        try{window.__shadowNexPrime?.globe?.viewer?.resize()}catch{}
      });
    }
    const width=Math.max(1,v?.width||window.innerWidth);
    const height=Math.max(1,v?.height||window.innerHeight);
    const left=v?.offsetLeft||0,top=v?.offsetTop||0;
    for(const d of root.querySelectorAll('dialog.modal[open]')){
      if(excluded.has(d.id))continue;
      const compact=!!d.querySelector('.modal-card.compact');
      const targetWidth=Math.max(1,Math.min(compact?420:720,width-16));
      d.classList.add('viewport-modal');
      d.style.left=(left+width/2)+'px';
      d.style.top=(top+height/2)+'px';
      d.style.width=targetWidth+'px';
      d.style.maxWidth=Math.max(1,width-16)+'px';
      d.style.maxHeight=Math.max(1,height-16)+'px';
    }
  };
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.attributeName==='open'||r.type==='childList'))layout();
  });
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  window.visualViewport?.addEventListener('resize',layout);
  window.visualViewport?.addEventListener('scroll',layout);
  window.addEventListener('resize',layout);
  root.__snxFitDialogs=layout;
  layout();
}
