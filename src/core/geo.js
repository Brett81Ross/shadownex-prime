export const DEG=Math.PI/180, RAD=180/Math.PI;
export function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
export function fmtNum(v,d=1){return Number.isFinite(v)?Number(v).toFixed(d):'—';}
export function fmtAlt(m){ if(!Number.isFinite(m)) return '—'; return m>10000?`${(m/1000).toFixed(1)} km`:`${Math.round(m)} m`; }
export function haversineKm(a,b){
  const R=6371; const p1=a.lat*DEG,p2=b.lat*DEG,dp=(b.lat-a.lat)*DEG,dl=(b.lon-a.lon)*DEG;
  const q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2; return 2*R*Math.asin(Math.sqrt(q));
}
export function cameraState(viewer){
  const c=viewer.camera.positionCartographic; return {lat:c.latitude*RAD,lon:c.longitude*RAD,alt:c.height,heading:viewer.camera.heading*RAD,pitch:viewer.camera.pitch*RAD};
}
export function rectangleDegrees(viewer){
  const r=viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid); if(!r) return null;
  return {west:r.west*RAD,south:r.south*RAD,east:r.east*RAD,north:r.north*RAD};
}
export function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
export function polylineKm(points=[]){let total=0;for(let i=1;i<points.length;i++)total+=haversineKm(points[i-1],points[i]);return total;}
export function polygonAreaKm2(points=[]){
  if(points.length<3)return 0;const R=6371;let sum=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];sum+=(b.lon-a.lon)*DEG*(2+Math.sin(a.lat*DEG)+Math.sin(b.lat*DEG));}return Math.abs(sum)*R*R/2;
}
