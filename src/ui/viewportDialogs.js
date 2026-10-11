// Bind remaining application dialogs to the visual (rather than Android layout) viewport.
// The welcome/location and situation dialogs already have dedicated positioning.
export function installViewportDialogs(){
  const root=document.getElementById('app');
  if(!root||root.__snxViewportDialogs)return;
  root.__snxViewportDialogs=true;
  const excluded=new Set(['locationStartDialog','situationDialog']);
  const layout=()=>{
    const v=window.visualViewport;
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
