const KEYS={views:'shadownex.prime.savedViews.v1',areas:'shadownex.prime.watchAreas.v1',favorites:'shadownex.prime.favorites.v1',activity:'shadownex.prime.activity.v1'};
export function loadCollection(kind){try{const raw=localStorage.getItem(KEYS[kind]);const v=JSON.parse(raw||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
export function saveCollection(kind,value){try{localStorage.setItem(KEYS[kind],JSON.stringify(value));return true;}catch{return false;}}
export function makeId(prefix='item'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;}
export function compactMeta(meta={}){const keys=['type','id','name','source','latitude','longitude','altitude','militaryLikely','magnitude','status'];const out={};for(const k of keys)if(meta[k]!=null&&meta[k]!=='')out[k]=meta[k];return out;}
export function itemTimestamp(meta={}){let t=Number(meta.updatedAt||meta.time);if(!Number.isFinite(t)&&meta.when)t=Date.parse(meta.when);return Number.isFinite(t)?t:null;}
export function withinWindow(meta={},hours=24,now=Date.now()){const t=itemTimestamp(meta);if(!t)return true;return now-t<=Math.max(.0833,Number(hours)||24)*3600000;}
export function dedupePush(list,item,max=40,keyFn=x=>x.id){const key=keyFn(item),out=[item,...list.filter(x=>keyFn(x)!==key)];return out.slice(0,max);}