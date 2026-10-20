import { BaseLayer } from './BaseLayer.js';
import { mapMarker } from './markerIcons.js';
export class FireLayer extends BaseLayer{
 constructor(app){super(app,{id:'fires',label:'Active Fires',source:'NASA EONET / FIRMS',description:'Open wildfire events + optional FIRMS',interval:300000});}
 async refresh(){let points=[];let note='EONET';try{const r=await fetch('/api/fires');if(r.ok){const d=await r.json();if(d.configured&&Array.isArray(d.points)&&d.points.length){points=d.points;note='FIRMS';}}}catch{}
   if(!points.length){const r=await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=200');if(!r.ok)throw new Error(`EONET HTTP ${r.status}`);const d=await r.json();for(const e of d.events||[]){const g=e.geometry?.at(-1);if(g?.type==='Point')points.push({lon:g.coordinates[0],lat:g.coordinates[1],name:e.title,when:g.date});}}
   this.clear();const C=window.Cesium;for(const p of points.slice(0,this.app.densityLimit(200,600,1200))){const meta={type:'FIRE',name:p.name||'Fire detection',latitude:p.lat,longitude:p.lon,brightness:p.brightness,when:p.when,updatedAt:p.when?Date.parse(p.when):Date.now(),source:note==='FIRMS'?'NASA FIRMS':'NASA EONET'};this.add({position:C.Cartesian3.fromDegrees(p.lon,p.lat,50),billboard:{...mapMarker('fire',{size:this.app.compact?27:24})},properties:{snxMeta:meta}});}this.setHealthy(points.length,note);}
}
