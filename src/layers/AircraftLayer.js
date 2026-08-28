import { BaseLayer } from './BaseLayer.js';
import { TrailStore } from '../core/trails.js';
import { haversineKm } from '../core/geo.js';

export class AircraftLayer extends BaseLayer{
  constructor(app){
    super(app,{id:'aircraft',label:'Aircraft',source:'OpenSky Network',description:'Live public aircraft positions',interval:22000});
    this.byId=new Map();this.clusterEntities=[];this.clusterMoveHandler=null;
    this.trails=new TrailStore({maxPoints:16,maxAgeMs:10*60*1000,minMoveKm:.45});
  }
  async enable(){if(this.enabled)return;await super.enable();if(!this.clusterMoveHandler){this.clusterMoveHandler=()=>{clearTimeout(this._clusterDelay);this._clusterDelay=setTimeout(()=>this.updateClusters(),120)};this.app.globe.viewer.camera.moveEnd.addEventListener(this.clusterMoveHandler);}this.updateClusters();}
  disable(){if(this.clusterMoveHandler)this.app.globe.viewer.camera.moveEnd.removeEventListener(this.clusterMoveHandler);this.clusterMoveHandler=null;clearTimeout(this._clusterDelay);this.clearClusters();super.disable();}
  async refresh(){
    const r=await fetch('/api/aircraft');if(!r.ok)throw new Error(`Aircraft HTTP ${r.status}`);
    const data=await r.json(),rows=data.states||[],C=window.Cesium;
    const limit=this.app.densityLimit(140,260,440);
    const focus=this.app.globe.focusCoordinates();
    const selectedId=this.app.globe.selected?.meta?.type==='AIRCRAFT'?String(this.app.globe.selected.meta.id||''):'';
    const candidates=[];
    for(const s of rows){
      const lon=Number(s[5]),lat=Number(s[6]),alt=s[7]??s[13],id=String(s[0]||'');
      if(!id||!Number.isFinite(lon)||!Number.isFinite(lat))continue;
      const distance=haversineKm({lat:focus.lat,lon:focus.lon},{lat,lon});
      candidates.push({s,id,lon,lat,alt,distance,selected:id===selectedId});
    }
    candidates.sort((a,b)=>Number(b.selected)-Number(a.selected)||a.distance-b.distance||a.id.localeCompare(b.id));
    const chosen=candidates.slice(0,limit),seen=new Set();let n=0;
    const compact=this.app.compact,pointSize=compact?9:6,militaryPointSize=compact?11:8;
    for(const row of chosen){
      const {s,id,lon,lat,alt}=row;seen.add(id);
      const callsign=(s[1]||id||'UNKNOWN').trim(),heading=Number(s[10])||0,velocity=Number(s[9])||0;
      const militaryLikely=/^(RCH|CNV|EVAC|REACH|NATO|FORTE|DUKE|VIPER|HOSS|PAT|NAVY|ARMY)/i.test(callsign);
      const meta={type:'AIRCRAFT',id,name:callsign,country:s[2],longitude:lon,latitude:lat,altitude:alt,velocity,heading,verticalRate:s[11],onGround:!!s[8],updatedAt:Number(s[4]||s[3])?Number(s[4]||s[3])*1000:Date.now(),source:'OpenSky Network',militaryLikely,cohort:militaryLikely?'MILITARY-LIKELY HEURISTIC':s[8]?'GROUND':'AIRBORNE CIVIL',accuracy:'PUBLIC ADS-B / heuristic military flag'};
      const cart=C.Cartesian3.fromDegrees(lon,lat,Math.max(Number(alt)||0,50));let rec=this.byId.get(id);
      if(!rec){
        const entity=this.add({position:cart,point:{pixelSize:militaryLikely?militaryPointSize:pointSize,color:militaryLikely?C.Color.ORANGE:C.Color.CYAN,outlineColor:C.Color.BLACK,outlineWidth:1,distanceDisplayCondition:new C.DistanceDisplayCondition(0,6500000)},label:{text:callsign,show:!compact,font:'9px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.55),pixelOffset:new C.Cartesian2(0,-13),distanceDisplayCondition:new C.DistanceDisplayCondition(0,900000)},properties:{snxMeta:meta}});
        const trailEntity=this.add({polyline:{positions:[],width:1.25,material:(militaryLikely?C.Color.ORANGE:C.Color.CYAN).withAlpha(.36),distanceDisplayCondition:new C.DistanceDisplayCondition(0,2200000)}});
        rec={entity,trailEntity,lastSeen:Date.now()};this.byId.set(id,rec);
      }else{
        rec.entity.position=cart;rec.entity.properties.snxMeta=meta;if(this.app.globe.selected?.entity===rec.entity)this.app.globe.selected.meta=meta;
        rec.entity.label.text=callsign;rec.lastSeen=Date.now();
      }
      const trail=this.trails.push(id,{lat,lon,alt:Number(alt)||0});rec.trailEntity.polyline.positions=trail.map(p=>C.Cartesian3.fromDegrees(p.lon,p.lat,Math.max(p.alt||0,60)));n++;
    }
    this.enforceCap(limit,seen);
    this.trails.prune(this.byId.keys(),Date.now());
    this.setHealthy(n,`${rows.length} states received · ${this.byId.size} rendered near view`);this.updateClusters();
  }
  removeRecord(id,rec){
    this.app.globe.viewer.entities.remove(rec.entity);this.app.globe.viewer.entities.remove(rec.trailEntity);
    this.entities=this.entities.filter(e=>e!==rec.entity&&e!==rec.trailEntity);this.byId.delete(id);this.trails.remove(id);
  }
  enforceCap(limit,seen=new Set()){
    const stale=[...this.byId.entries()].filter(([id])=>!seen.has(id)).sort((a,b)=>a[1].lastSeen-b[1].lastSeen);
    for(const [id,rec] of stale){if(this.byId.size<=limit)break;this.removeRecord(id,rec);}
    if(this.byId.size>limit){const all=[...this.byId.entries()].sort((a,b)=>a[1].lastSeen-b[1].lastSeen);for(const [id,rec] of all){if(this.byId.size<=limit)break;if(id===this.app.globe.selected?.meta?.id)continue;this.removeRecord(id,rec);}}
  }
  clearClusters(){for(const e of this.clusterEntities){try{this.app.globe.viewer.entities.remove(e)}catch{}}this.clusterEntities=[];document.getElementById('app')?.classList.remove('cluster-mode');}
  updateClusters(){if(!this.enabled||!this.app.globe?.viewer)return;const C=window.Cesium,alt=this.app.globe.state().alt||0,cluster=alt>3500000&&this.byId.size>60;this.clearClusters();if(!cluster){for(const rec of this.byId.values()){rec.entity.show=true;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=!this.app.lowPower;}this.app.globe.requestRender?.();return;}document.getElementById('app')?.classList.add('cluster-mode');const size=alt>11000000?12:alt>6500000?7:4,buckets=new Map(),selected=this.app.globe.selected?.entity;for(const rec of this.byId.values()){if(rec.entity===selected){rec.entity.show=true;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=false;continue;}const m=rec.entity.properties?.snxMeta?.getValue?.();if(!m)continue;rec.entity.show=false;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=false;const key=`${Math.floor((Number(m.latitude)+90)/size)}:${Math.floor((Number(m.longitude)+180)/size)}`,b=buckets.get(key)||{lat:0,lon:0,count:0,military:0};b.lat+=Number(m.latitude);b.lon+=Number(m.longitude);b.count++;if(m.militaryLikely)b.military++;buckets.set(key,b);}for(const b of buckets.values()){if(!b.count)continue;const lat=b.lat/b.count,lon=b.lon/b.count,color=b.military>b.count*.35?C.Color.ORANGE:C.Color.CYAN;const e=this.app.globe.viewer.entities.add({position:C.Cartesian3.fromDegrees(lon,lat,120),point:{pixelSize:Math.min(28,12+Math.log2(b.count+1)*3),color:color.withAlpha(.82),outlineColor:C.Color.BLACK,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY},label:{text:String(b.count),font:'bold 11px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.68),pixelOffset:new C.Cartesian2(0,-17),disableDepthTestDistance:Number.POSITIVE_INFINITY},properties:{snxMeta:{type:'CLUSTER',name:`${b.count} AIRCRAFT`,count:b.count,latitude:lat,longitude:lon,source:'ShadowNex aggregation'}}});this.clusterEntities.push(e);}this.app.globe.requestRender?.();}
  applyPerformanceMode(low){for(const rec of this.byId.values()){if(rec.entity?.label)rec.entity.label.show=!low&&!this.app.compact;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=!low;}if(low)this.enforceCap(this.app.densityLimit(140,260,440));this.updateClusters();this.app.globe.requestRender?.();}
  clear(){this.clearClusters();super.clear();this.byId.clear();this.trails.clear();}
}
