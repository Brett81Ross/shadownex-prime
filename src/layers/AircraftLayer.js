import { BaseLayer } from './BaseLayer.js';
import { TrailStore } from '../core/trails.js';
import { haversineKm } from '../core/geo.js';

export class AircraftLayer extends BaseLayer{
  constructor(app){
    super(app,{id:'aircraft',label:'Aircraft',source:'OpenSky Network',description:'Live public aircraft positions',interval:22000});
    this.byId=new Map();
    this.trails=new TrailStore({maxPoints:16,maxAgeMs:10*60*1000,minMoveKm:.45});
  }
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
    const compact=this.app.compact;
    for(const row of chosen){
      const {s,id,lon,lat,alt}=row;seen.add(id);
      const callsign=(s[1]||id||'UNKNOWN').trim(),heading=Number(s[10])||0,velocity=Number(s[9])||0;
      const militaryLikely=/^(RCH|CNV|EVAC|REACH|NATO|FORTE|DUKE|VIPER|HOSS|PAT|NAVY|ARMY)/i.test(callsign);
      const meta={type:'AIRCRAFT',id,name:callsign,country:s[2],longitude:lon,latitude:lat,altitude:alt,velocity,heading,verticalRate:s[11],onGround:!!s[8],source:'OpenSky Network',militaryLikely,cohort:militaryLikely?'MILITARY-LIKELY HEURISTIC':s[8]?'GROUND':'AIRBORNE CIVIL',accuracy:'PUBLIC ADS-B / heuristic military flag'};
      const cart=C.Cartesian3.fromDegrees(lon,lat,Math.max(Number(alt)||0,50));let rec=this.byId.get(id);
      if(!rec){
        const entity=this.add({position:cart,point:{pixelSize:militaryLikely?8:6,color:militaryLikely?C.Color.ORANGE:C.Color.CYAN,outlineColor:C.Color.BLACK,outlineWidth:1,distanceDisplayCondition:new C.DistanceDisplayCondition(0,6500000)},label:{text:callsign,show:!compact,font:'9px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.55),pixelOffset:new C.Cartesian2(0,-13),distanceDisplayCondition:new C.DistanceDisplayCondition(0,900000)},properties:{snxMeta:meta}});
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
    this.setHealthy(n,`${rows.length} states received · ${this.byId.size} rendered near view`);
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
  clear(){super.clear();this.byId.clear();this.trails.clear();}
}
