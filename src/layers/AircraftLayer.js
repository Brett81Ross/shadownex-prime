import { BaseLayer } from './BaseLayer.js';
import { TrailStore } from '../core/trails.js';
import { haversineKm } from '../core/geo.js';

export class AircraftLayer extends BaseLayer{
  constructor(app){
    super(app,{id:'aircraft',label:'Aircraft',source:'ADSB.lol / optional OpenSky',description:'Public ADS-B/MLAT aircraft around the current globe view',interval:22000});
    this.byId=new Map();this.clusterEntities=[];this.cameraMoveHandler=null;
    this.trails=new TrailStore({maxPoints:16,maxAgeMs:10*60*1000,minMoveKm:.45});
  }
  async enable(){
    if(this.enabled)return;
    await super.enable();
    if(!this.cameraMoveHandler){
      this.cameraMoveHandler=()=>{
        clearTimeout(this._cameraDelay);
        this._cameraDelay=setTimeout(()=>{
          this.updateClusters();
          if(this.enabled&&!this.refreshing){
            clearTimeout(this.timer);this.timer=null;
            this.cycle(this.generation);
          }
        },900);
      };
      this.app.globe.viewer.camera.moveEnd.addEventListener(this.cameraMoveHandler);
    }
    this.updateClusters();
  }
  disable(){
    if(this.cameraMoveHandler)this.app.globe.viewer.camera.moveEnd.removeEventListener(this.cameraMoveHandler);
    this.cameraMoveHandler=null;clearTimeout(this._cameraDelay);clearTimeout(this._clusterDelay);this.clearClusters();super.disable();
  }
  async refresh(){
    const focus=this.app.globe.focusCoordinates(),camera=this.app.globe.state(),radius=Math.max(75,Math.min(250,Math.round((Number(camera.alt)||1000000)/5000)));
    const q=new URLSearchParams({lat:focus.lat.toFixed(4),lon:focus.lon.toFixed(4),radius:String(radius)});
    const r=await fetch(`/api/aircraft?${q}`,{signal:AbortSignal.timeout(13000)});
    if(!r.ok){let detail='';try{const e=await r.json();detail=e?.message||e?.error||'';}catch{}throw new Error(detail||`Aircraft HTTP ${r.status}`);}
    const data=await r.json(),rows=data.states||[],C=window.Cesium,source=String(data._source||'Public ADS-B');
    const limit=this.app.densityLimit(140,260,440),focusPoint={lat:focus.lat,lon:focus.lon};
    const selectedId=this.app.globe.selected?.meta?.type==='AIRCRAFT'?String(this.app.globe.selected.meta.id||''):'';
    const candidates=[];
    for(const s of rows){
      const lon=Number(s[5]),lat=Number(s[6]),alt=s[7]??s[13],id=String(s[0]||'');
      if(!id||!Number.isFinite(lon)||!Number.isFinite(lat))continue;
      candidates.push({s,id,lon,lat,alt,distance:haversineKm(focusPoint,{lat,lon}),selected:id===selectedId});
    }
    candidates.sort((a,b)=>Number(b.selected)-Number(a.selected)||a.distance-b.distance||a.id.localeCompare(b.id));
    const chosen=candidates.slice(0,limit),seen=new Set(),compact=this.app.compact,pointSize=compact?9:6,militaryPointSize=compact?11:8;let n=0;
    for(const row of chosen){
      const {s,id,lon,lat,alt}=row;seen.add(id);
      const callsign=(s[1]||id||'UNKNOWN').trim(),heading=Number(s[10])||0,velocity=Number(s[9])||0;
      const militaryLikely=/^(RCH|CNV|EVAC|REACH|NATO|FORTE|DUKE|VIPER|HOSS|PAT|NAVY|ARMY)/i.test(callsign);
      const sourceTime=Number(s[4]||s[3]);
      const meta={type:'AIRCRAFT',id,name:callsign,country:s[2],longitude:lon,latitude:lat,altitude:alt,velocity,heading,verticalRate:s[11],onGround:!!s[8],updatedAt:sourceTime?sourceTime*1000:Date.now(),source,militaryLikely,cohort:militaryLikely?'MILITARY-LIKELY HEURISTIC':s[8]?'GROUND':'AIRBORNE CIVIL',accuracy:`PUBLIC ADS-B / MLAT · ${source} · military flag heuristic`};
      const cart=C.Cartesian3.fromDegrees(lon,lat,Math.max(Number(alt)||0,50));let rec=this.byId.get(id);
      if(!rec){
        const entity=this.add({position:cart,point:{pixelSize:militaryLikely?militaryPointSize:pointSize,color:militaryLikely?C.Color.ORANGE:C.Color.CYAN,outlineColor:C.Color.BLACK,outlineWidth:1,distanceDisplayCondition:new C.DistanceDisplayCondition(0,6500000)},label:{text:callsign,show:!compact,font:'9px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.55),pixelOffset:new C.Cartesian2(0,-13),distanceDisplayCondition:new C.DistanceDisplayCondition(0,900000)},properties:{snxMeta:meta}});
        const trailEntity=this.add({polyline:{positions:[],width:1.25,material:(militaryLikely?C.Color.ORANGE:C.Color.CYAN).withAlpha(.36),distanceDisplayCondition:new C.DistanceDisplayCondition(0,2200000)}});
        rec={entity,trailEntity,lastSeen:Date.now()};this.byId.set(id,rec);
      }else{
        rec.entity.position=cart;rec.entity.properties.snxMeta=meta;if(this.app.globe.selected?.entity===rec.entity)this.app.globe.selected.meta=meta;
        rec.entity.label.text=callsign;rec.lastSeen=Date.now();
      }
      const trail=this.trails.push(id,{lat,lon,alt:Number(alt)||0});
      rec.trailEntity.polyline.positions=trail.map(p=>C.Cartesian3.fromDegrees(p.lon,p.lat,Math.max(p.alt||0,60)));n++;
    }
    const now=Date.now();
    for(const [id,rec] of this.byId){if(seen.has(id)||now-rec.lastSeen<90000)continue;this.removeRecord(id,rec);}
    this.enforceCap(limit,seen);this.trails.prune(this.byId.keys(),now);
    const retry=data._reducedRadius?' · 120 NM retry':'',license=data._license?` · ${data._license}`:'';
    this.setHealthy(n,`${source}${license} · ${rows.length} states · ${radius} NM view${retry} · ${this.byId.size} rendered`);this.updateClusters();
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
  updateClusters(){
    if(!this.enabled||!this.app.globe?.viewer)return;
    const C=window.Cesium,alt=this.app.globe.state().alt||0,cluster=alt>3500000&&this.byId.size>60;this.clearClusters();
    if(!cluster){for(const rec of this.byId.values()){rec.entity.show=true;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=!this.app.lowPower;}this.app.globe.requestRender?.();return;}
    document.getElementById('app')?.classList.add('cluster-mode');const size=alt>11000000?12:alt>6500000?7:4,buckets=new Map(),selected=this.app.globe.selected?.entity;
    for(const rec of this.byId.values()){
      if(rec.entity===selected){rec.entity.show=true;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=false;continue;}
      const m=rec.entity.properties?.snxMeta?.getValue?.();if(!m)continue;rec.entity.show=false;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=false;
      const key=`${Math.floor((Number(m.latitude)+90)/size)}:${Math.floor((Number(m.longitude)+180)/size)}`,b=buckets.get(key)||{lat:0,lon:0,count:0,military:0};
      b.lat+=Number(m.latitude);b.lon+=Number(m.longitude);b.count++;if(m.militaryLikely)b.military++;buckets.set(key,b);
    }
    for(const b of buckets.values()){
      if(!b.count)continue;const lat=b.lat/b.count,lon=b.lon/b.count,color=b.military>b.count*.35?C.Color.ORANGE:C.Color.CYAN;
      const e=this.app.globe.viewer.entities.add({position:C.Cartesian3.fromDegrees(lon,lat,120),point:{pixelSize:Math.min(28,12+Math.log2(b.count+1)*3),color:color.withAlpha(.82),outlineColor:C.Color.BLACK,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY},label:{text:String(b.count),font:'bold 11px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.68),pixelOffset:new C.Cartesian2(0,-17),disableDepthTestDistance:Number.POSITIVE_INFINITY},properties:{snxMeta:{type:'CLUSTER',name:`${b.count} AIRCRAFT`,count:b.count,latitude:lat,longitude:lon,source:'ShadowNex aggregation'}}});
      this.clusterEntities.push(e);
    }
    this.app.globe.requestRender?.();
  }
  applyPerformanceMode(low){for(const rec of this.byId.values()){if(rec.entity?.label)rec.entity.label.show=!low&&!this.app.compact;if(rec.trailEntity?.polyline)rec.trailEntity.polyline.show=!low;}if(low)this.enforceCap(this.app.densityLimit(140,260,440));this.updateClusters();this.app.globe.requestRender?.();}
  clear(){this.clearClusters();super.clear();this.byId.clear();this.trails.clear();}
}
