const VALID = new Set(['LIVE','SYNC','DEGRADED','STALE','FALLBACK','UNAVAILABLE','STANDBY']);
export class SourceRegistry extends EventTarget {
  constructor(){ super(); this.map = new Map(); }
  define(id, label, provenance){ this.map.set(id,{id,label,provenance,status:'STANDBY',count:0,updatedAt:null,note:''}); this.emit(); }
  set(id, patch={}){
    const current=this.map.get(id); if(!current) return;
    const status=patch.status && VALID.has(patch.status) ? patch.status : current.status;
    this.map.set(id,{...current,...patch,status,updatedAt:patch.updatedAt ?? (patch.status==='LIVE'?Date.now():current.updatedAt)}); this.emit();
  }
  get(id){ return this.map.get(id); }
  all(){ return [...this.map.values()]; }
  summary(){
    const all=this.all(); const live=all.filter(x=>x.status==='LIVE').length; const bad=all.filter(x=>['DEGRADED','STALE','UNAVAILABLE'].includes(x.status)).length;
    return bad ? `${live} LIVE · ${bad} ATTENTION` : `${live} LIVE · NOMINAL`;
  }
  emit(){ this.dispatchEvent(new CustomEvent('change',{detail:this.all()})); }
}
