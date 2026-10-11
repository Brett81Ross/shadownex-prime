import { BaseLayer } from './BaseLayer.js';
import { haversineKm } from '../core/geo.js';
export class CctvLayer extends BaseLayer{
 constructor(app){super(app,{id:'cctv',label:'Public CCTV',source:'OKTraffic / TfL / Caltrans / Austin / Seattle DOT / Maryland CHART',description:'Official public camera catalogs; USA and international coverage depends on source availability',interval:300000});}
 async refresh(){const r=await fetch('/api/cctv');if(!r.ok)throw new Error(`CCTV HTTP ${r.status}`);const d=await r.json();this.clear();const C=window.Cesium,limit=this.app.densityLimit(500,1300,2500),focus=this.app.globe.focusCoordinates();
let world=[];
try{
 const url='/api/webcams?lat='+encodeURIComponent(focus.lat)+'&lon='+encodeURIComponent(focus.lon);
 const response=await fetch(url);if(response.ok){const global=await response.json();world=global.points||[]}
}catch(error){console.warn('[optional global webcams]',error)}
this.catalogPoints=[...(d.points||[]),...world];const candidates=this.catalogPoints.map(c=>({...c,distance:haversineKm(focus,{lat:Number(c.lat),lon:Number(c.lon)})})).filter(c=>Number.isFinite(c.distance)).sort((a,b)=>a.distance-b.distance);let n=0;for(const c of candidates){if(n>=limit)break;const lat=Number(c.lat),lon=Number(c.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const meta={type:'CCTV',id:c.id,name:c.name||'Public Camera',view:c.direction,available:c.status,url:c.url,streamUrl:c.streamUrl,videoUrl:c.videoUrl,previewUrl:c.previewUrl,mediaKind:c.mediaKind,playerUrl:c.playerUrl,groupId:c.groupId,county:c.county,route:c.route,district:c.district,latitude:lat,longitude:lon,source:c.source,accuracy:'Public source listing; media availability varies. Windy Webcams require credit and provider link.'};const color=c.source==='OKTraffic / ODOT-OTA'?C.Color.CYAN:c.source==='Caltrans'?C.Color.DODGERBLUE:c.source==='City of Austin'?C.Color.ORANGE:c.source==='Seattle DOT'?C.Color.LIME:c.source==='Maryland CHART'?C.Color.MAGENTA:c.source==='Iowa DOT'?C.Color.YELLOW:C.Color.WHITE;this.add({position:C.Cartesian3.fromDegrees(lon,lat,30),point:{pixelSize:this.app.compact?9:7,color,outlineColor:C.Color.CYAN,outlineWidth:1},properties:{snxMeta:meta}});n++;}const src=(d.sources||[]).map(x=>`${x.name}: ${x.count}`).join(' · ')+(world.length?` · Windy global: ${world.length}`:'');this.setHealthy(n,src||'Public camera catalogs');}
}
