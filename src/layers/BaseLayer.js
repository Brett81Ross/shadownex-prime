export class BaseLayer {
  constructor(app,{id,label,source,description,interval=60000}){this.app=app;this.id=id;this.label=label;this.source=source;this.description=description;this.interval=interval;this.enabled=false;this.entities=[];this.timer=null;app.registry.define(id,label,source);}
  async enable(){if(this.enabled)return;this.enabled=true;this.app.registry.set(this.id,{status:'SYNC',note:'Connecting'});try{await this.refresh();this.timer=setInterval(()=>this.refresh().catch(e=>this.fail(e)),this.interval);}catch(e){this.fail(e);}}
  disable(){this.enabled=false;if(this.timer)clearInterval(this.timer);this.timer=null;this.clear();this.app.registry.set(this.id,{status:'STANDBY',count:0,note:'Layer disabled'});}
  clear(){this.entities.forEach(e=>this.app.globe.viewer.entities.remove(e));this.entities=[];}
  fail(e){console.warn(`[${this.id}]`,e);this.app.registry.set(this.id,{status:'DEGRADED',note:e?.message||String(e)});}
  add(entity){const e=this.app.globe.viewer.entities.add(entity);this.entities.push(e);return e;}
  setHealthy(count,note=''){this.app.registry.set(this.id,{status:'LIVE',count,updatedAt:Date.now(),note});}
}
