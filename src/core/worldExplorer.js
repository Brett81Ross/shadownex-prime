export function explorerAltitude(result={}){
  const type=String(result.type||'').toLowerCase(),category=String(result.category||'').toLowerCase(),b=Array.isArray(result.bbox)?result.bbox.map(Number):null;
  if(['house','building','residential','commercial','retail','amenity'].includes(type)||category==='building')return 1200;
  if(['road','street','neighbourhood','suburb'].includes(type))return 6000;
  if(b?.length===4&&b.every(Number.isFinite)){const span=Math.max(Math.abs(b[1]-b[0]),Math.abs(b[3]-b[2]));return Math.max(1200,Math.min(1200000,span*130000));}
  if(['city','town','village','municipality'].includes(type))return 100000;
  return 35000;
}
export function detailBand(resolutionMeters){
  const n=Number(resolutionMeters);if(!Number.isFinite(n)||n<=0)return {label:'UNKNOWN',detail:'Source did not publish point resolution.'};
  const inches=n*39.3701;if(n<=.15)return {label:'VERY HIGH',detail:`About ${inches.toFixed(1)} in/pixel`};
  if(n<=.4)return {label:'HIGH',detail:`About ${inches.toFixed(1)} in/pixel`};
  if(n<=1)return {label:'GOOD',detail:`About ${(inches/12).toFixed(1)} ft/pixel`};
  return {label:'STANDARD',detail:`About ${(inches/12).toFixed(1)} ft/pixel`};
}
export function pointLabel(place={},lat,lon){return place.street||place.label||place.displayName||`${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;}
