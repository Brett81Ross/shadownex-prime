import {readFile} from 'node:fs/promises';

let pass=0,fail=0;
const check=(ok,msg)=>{if(ok){console.log('✓',msg);pass++;}else{console.error('✗',msg);fail++;}};
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

const globe=await read('src/globe/GlobeController.js');
const main=await read('src/main.js');
const base=await read('src/layers/BaseLayer.js');
const aircraftApi=await read('api/aircraft.js');
const aircraftLayer=await read('src/layers/AircraftLayer.js');
const build=await read('scripts/build.mjs');
const help=await read('src/demo-help.js');

check(globe.includes('baseLayer:false'),'Cesium default Ion basemap is disabled');
check(globe.includes('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),'OpenStreetMap basemap is explicit');
check(globe.includes("baseColor=C.Color.fromCssColorString('#07151d')"),'globe has a visible no-imagery fallback color');
check(main.includes('Date.now()-started>12000'),'Cesium startup wait is bounded');
check(main.includes('if(app.globe?.viewer)dismissSplash()'),'splash releases when the globe viewer is ready');
check(base.includes("if(this.enabled&&!this.timer)this.timer=setInterval"),'failed initial feeds still get a retry timer');
check(aircraftApi.includes('https://api.adsb.lol/v2/point/'),'ADSB.lol is the primary bounded aircraft source');
check(aircraftApi.includes('ADSB_TIMEOUT_MS=5000'),'primary aircraft upstream timeout is bounded');
check(aircraftApi.includes("process.env.OPENSKY_FALLBACK_ENABLED==='true'"),'OpenSky fallback is explicit opt-in');
check(aircraftApi.includes("new URL('https://opensky-network.org/api/states/all')")&&aircraftApi.includes('lamin')&&aircraftApi.includes('lomax'),'optional OpenSky fallback uses a bounded region');
check(aircraftApi.includes('feetToMeters')&&aircraftApi.includes('knotsToMps')&&aircraftApi.includes('feetPerMinToMps'),'ADSB.lol units normalize into the existing aircraft state-vector contract');
check(aircraftApi.includes("_license:'ODbL-1.0'"),'ADSB.lol data license is carried in normalized responses');
check(aircraftLayer.includes('focusCoordinates()')&&aircraftLayer.includes('URLSearchParams'),'aircraft requests follow the current globe view');
check(aircraftLayer.includes('AbortSignal.timeout(13000)'),'browser aircraft request is bounded');
check(aircraftLayer.includes("source=String(data._source||'Public ADS-B')"),'aircraft provenance follows the backend source');
check(build.includes("cp(resolve(root, 'src'), resolve(out, 'src'), { recursive: true })"),'production build copies the ShadowNex source modules');
check(build.includes("cp(resolve(root, 'brand'), resolve(out, 'brand'), { recursive: true })"),'production build copies brand assets');
check(help.includes('shadownex-prime-60-second-demo.mp4'),'ShadowNex Help points to the app-specific 60-second demo');

const normalized=await mockAircraft();
const row=normalized.body?.states?.[0];
check(normalized.status===200&&normalized.requestUrl.includes('/v2/point/35.4676/-97.5164/250'),'aircraft endpoint calls the bounded ADSB.lol point API');
check(normalized.body?._source==='ADSB.lol'&&normalized.body?._license==='ODbL-1.0','aircraft response identifies ADSB.lol provenance and license');
check(Array.isArray(row)&&row[0]==='a50842'&&row[1]==='UPS2897'&&Math.abs(row[7]-10668)<.1,'aircraft normalizer preserves identity and converts altitude feet to meters');
check(Math.abs(row[9]-231.4998)<.1&&Math.abs(row[11]-2.54)<.01,'aircraft normalizer converts knots and feet/minute to SI units');

console.log(`\nGlobe + aircraft hotfix QA: ${pass} passed, ${fail} failed`);
process.exitCode=fail?1:0;

async function mockAircraft(){
  const old=globalThis.fetch;let requestUrl='';
  globalThis.fetch=async input=>{requestUrl=String(input);return {ok:true,status:200,json:async()=>({now:1779787664325,ac:[{hex:'a50842',flight:'UPS2897 ',lat:35.47,lon:-97.51,alt_baro:35000,alt_geom:35500,gs:450,track:82,baro_rate:500,squawk:'1200',type:'adsb_icao'}]})};};
  try{
    const {default:handler}=await import(`../api/aircraft.js?qa=${Date.now()}`);let status=200,body=null;
    const res={headers:{},setHeader(k,v){this.headers[k]=v},status(n){status=n;return this},json(o){body=o;return o}};
    await handler({method:'GET',query:{lat:'35.4676',lon:'-97.5164',radius:'250'}},res);
    return {status,body,requestUrl};
  }finally{globalThis.fetch=old;}
}
