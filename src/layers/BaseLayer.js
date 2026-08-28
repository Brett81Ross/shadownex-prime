export class BaseLayer {
  constructor(app,{id,label,source,description,interval=60000}){
    this.app=app;this.id=id;this.label=label;this.source=source;this.description=description;this.interval=interval;
    this.enabled=false;this.entities=[];this.timer=null;this.refreshing=false;this.generation=0;
    app.registry.define(id,label,source);
  }
  async enable(){
    if(this.enabled)return;
    this.enabled=true;this.generation++;
    this.app.registry.set(this.id,{status:'SYNC',note:'Connecting'});
    await this.cycle(this.generation);
  }
  schedule(gen,delay=this.interval){
    if(!this.enabled||gen!==this.generation)return;
    clearTimeout(this.timer);
    this.timer=setTimeout(()=>this.cycle(gen),delay);
  }
  async cycle(gen){
    if(!this.enabled||gen!==this.generation)return;
    if(document.hidden){this.schedule(gen,Math.max(this.interval,30000));return;}
    if(this.refreshing){this.schedule(gen,Math.max(5000,this.interval/2));return;}
    this.refreshing=true;
    try{await this.refresh();}
    catch(e){this.fail(e);}
    finally{
      this.refreshing=false;
      this.app.globe?.requestRender?.();
      this.schedule(gen);
    }
  }
  disable(){
    this.enabled=false;this.generation++;
    if(this.timer)clearTimeout(this.timer);this.timer=null;this.refreshing=false;
    this.clear();this.app.registry.set(this.id,{status:'STANDBY',count:0,note:'Layer disabled'});
    this.app.globe?.requestRender?.();
  }
  clear(){this.entities.forEach(e=>this.app.globe.viewer.entities.remove(e));this.entities=[];}
  fail(e){console.warn(`[${this.id}]`,e);this.app.registry.set(this.id,{status:'DEGRADED',note:e?.message||String(e)});}
  add(entity){const e=this.app.globe.viewer.entities.add(entity);this.entities.push(e);return e;}
  setHealthy(count,note=''){this.app.registry.set(this.id,{status:'LIVE',count,updatedAt:Date.now(),note});}
}
