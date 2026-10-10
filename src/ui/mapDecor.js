import { ageAlpha } from '../core/worldQuery.js';
const SPECS={
  AIRCRAFT:['✈','#00f0ff',7000000],VESSEL:['⚓','#4aa3ff',4500000],SATELLITE:['✦','#8cff66',16000000],
  EARTHQUAKE:['≋','#ff8a00',5500000],FIRE:['▲','#ff4b2b',4500000],LAUNCH:['↑','#ff4df0',5000000],
  CCTV:['◉','#ffffff',2200000],MILITARY_SITE:['◆','#ff4058',2500000],INFRASTRUCTURE:['■','#ffd84d',2500000],CABLE_LANDING:['∿','#59ffff',2500000]
};
export function installMapDecor(app){
  const originalInit=app.init.bind(app);
  app.init=async function(){
    const out=await originalInit();this.installSmartFocus();this.decorateMapSubjects();
    this.registry.addEventListener('change',()=>{clearTimeout(this._decorDelay);this._decorDelay=setTimeout(()=>this.decorateMapSubjects(),140);});
    this.decorTimer=setInterval(()=>this.decorateMapSubjects(),15000);return out;
  };
  app.installSmartFocus=function(){
    if(this.globe.__smartFocusInstalled)return;
    this.globe.smartFocus=meta=>{const lon=Number(meta?.longitude),lat=Number(meta?.latitude);if(!Number.isFinite(lon)||!Number.isFinite(lat))return;const type=String(meta?.type||''),alt=Number(meta?.altitude)||0,heights={AIRCRAFT:180000,VESSEL:60000,CCTV:35000,EARTHQUAKE:180000,FIRE:140000,LAUNCH:110000,MILITARY_SITE:70000,INFRASTRUCTURE:70000,CABLE_LANDING:60000};this.globe.flyTo(lon,lat,type==='SATELLITE'?Math.max(700000,alt+450000):(heights[type]||180000));};
    const old=this.globe.onClick.bind(this.globe);
    this.globe.onClick=position=>{const before=this.globe.selected?.entity||null;old(position);const after=this.globe.selected;if(after?.entity&&after.entity!==before)this.globe.smartFocus(after.meta);};
    this.globe.__smartFocusInstalled=true;
  };
  app.decorateMapSubjects=function(){
    const C=window.Cesium;if(!C||!this.globe?.viewer)return;
    for(const layer of this.layers.values()){const state=this.registry.get(layer.id)||{};for(const e of layer.entities||[]){const meta=this.contactMeta?.(e),spec=SPECS[String(meta?.type||'').toUpperCase()];if(!meta||meta.type==='CLUSTER'||!spec||!e.position)continue;
      const [symbol,color,max]=spec;if(!e.__snxSubjectIcon){e.__snxSubjectIcon=icon(symbol,color);e.billboard=new C.BillboardGraphics({image:e.__snxSubjectIcon,width:this.compact?22:19,height:this.compact?22:19,disableDepthTestDistance:Number.POSITIVE_INFINITY,distanceDisplayCondition:new C.DistanceDisplayCondition(0,max)});}
      const alpha=this.globe.selected?.entity===e?1:ageAlpha(meta,state);try{e.billboard.color=C.Color.WHITE.withAlpha(alpha);if(e.point)e.point.show=false;}catch{}
    }}this.globe.requestRender?.();
  };
}
function icon(symbol,color){const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='15' fill='#071117' fill-opacity='.88' stroke='${color}' stroke-width='2'/><text x='18' y='24' text-anchor='middle' font-family='Arial,sans-serif' font-size='19' font-weight='700' fill='${color}'>${symbol}</text></svg>`;return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);}