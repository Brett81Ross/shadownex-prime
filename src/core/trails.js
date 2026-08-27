export class TrailStore {
  constructor({maxPoints=28,maxAgeMs=20*60*1000,minMoveKm=.15}={}){this.maxPoints=maxPoints;this.maxAgeMs=maxAgeMs;this.minMoveKm=minMoveKm;this.map=new Map();}
  push(id,point,at=Date.now()){
    if(!id||!Number.isFinite(point?.lat)||!Number.isFinite(point?.lon))return [];
    const list=this.map.get(id)||[];const last=list.at(-1);
    if(last&&distanceApproxKm(last,point)<this.minMoveKm){last.at=at;last.alt=point.alt;return [...list];}
    list.push({lat:point.lat,lon:point.lon,alt:Number(point.alt)||0,at});
    const cutoff=at-this.maxAgeMs;while(list.length&&(list[0].at<cutoff||list.length>this.maxPoints))list.shift();
    this.map.set(id,list);return [...list];
  }
  get(id,now=Date.now()){const list=this.map.get(id)||[];const cutoff=now-this.maxAgeMs;const fresh=list.filter(p=>p.at>=cutoff);if(fresh.length)this.map.set(id,fresh);else this.map.delete(id);return [...fresh];}
  remove(id){this.map.delete(id)}
  prune(activeIds,now=Date.now()){const keep=new Set(activeIds);for(const id of this.map.keys()){if(!keep.has(id)||!this.get(id,now).length)this.map.delete(id);}}
  clear(){this.map.clear()}
}
function distanceApproxKm(a,b){const lat=(a.lat+b.lat)*.5*Math.PI/180;const dx=(b.lon-a.lon)*111.32*Math.cos(lat),dy=(b.lat-a.lat)*110.57;return Math.hypot(dx,dy)}
