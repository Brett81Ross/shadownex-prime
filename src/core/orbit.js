// Independent two-body TLE visual propagator. It intentionally does not claim SGP4 precision.
import { DEG, RAD } from './geo.js';
const MU=398600.4418; // km^3/s^2
export function parseTle(name,l1,l2){
  const yy=Number(l1.slice(18,20)); const day=Number(l1.slice(20,32)); const year=yy<57?2000+yy:1900+yy;
  const epoch=new Date(Date.UTC(year,0,1)+(day-1)*86400000);
  return {name:name.trim(),epoch,inc:Number(l2.slice(8,16))*DEG,raan:Number(l2.slice(17,25))*DEG,ecc:Number(`0.${l2.slice(26,33).trim()}`),argp:Number(l2.slice(34,42))*DEG,M0:Number(l2.slice(43,51))*DEG,n:Number(l2.slice(52,63))};
}
export function propagate(orb,date=new Date()){
  const nRad=orb.n*2*Math.PI/86400; const a=Math.cbrt(MU/(nRad*nRad)); const dt=(date-orb.epoch)/1000; let M=(orb.M0+nRad*dt)%(2*Math.PI); if(M<0)M+=2*Math.PI;
  let E=M; for(let i=0;i<8;i++) E-= (E-orb.ecc*Math.sin(E)-M)/(1-orb.ecc*Math.cos(E));
  const nu=2*Math.atan2(Math.sqrt(1+orb.ecc)*Math.sin(E/2),Math.sqrt(1-orb.ecc)*Math.cos(E/2)); const r=a*(1-orb.ecc*Math.cos(E));
  const u=orb.argp+nu, co=Math.cos(orb.raan),so=Math.sin(orb.raan),ci=Math.cos(orb.inc),si=Math.sin(orb.inc),cu=Math.cos(u),su=Math.sin(u);
  const x=r*(co*cu-so*su*ci), y=r*(so*cu+co*su*ci), z=r*(su*si);
  const gmst=gmstRad(date), cg=Math.cos(gmst),sg=Math.sin(gmst); const xe=cg*x+sg*y, ye=-sg*x+cg*y, ze=z;
  const lon=Math.atan2(ye,xe), p=Math.hypot(xe,ye), lat=Math.atan2(ze,p); const alt=Math.sqrt(xe*xe+ye*ye+ze*ze)-6378.137;
  return {lat:lat*RAD,lon:lon*RAD,altKm:alt};
}
function gmstRad(d){
  const jd=d.getTime()/86400000+2440587.5; const T=(jd-2451545.0)/36525; let deg=280.46061837+360.98564736629*(jd-2451545)+0.000387933*T*T-T*T*T/38710000; deg=((deg%360)+360)%360; return deg*DEG;
}
export function parseTleText(text,limit=250){
  const lines=text.split(/\r?\n/).map(x=>x.trimEnd()).filter(Boolean); const out=[];
  for(let i=0;i+2<lines.length && out.length<limit;i++){
    if(lines[i+1]?.startsWith('1 ')&&lines[i+2]?.startsWith('2 ')){ try{out.push(parseTle(lines[i],lines[i+1],lines[i+2]));}catch{} i+=2; }
  }
  return out;
}
