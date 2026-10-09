import {readFile} from 'node:fs/promises';
let pass=0,fail=0;const check=(ok,msg)=>{if(ok){console.log('✓',msg);pass++;}else{console.error('✗',msg);fail++;}};const read=p=>readFile(new URL(`../${p}`,import.meta.url),'utf8');

const [env,manifest,workflow,notices,inventory,pkgText,index,build]=await Promise.all([
  '.env.example','public/manifest.webmanifest','.github/workflows/atomic-qa.yml','THIRD_PARTY_NOTICES.md','RECONCILIATION_INVENTORY.md','package.json','index.html','scripts/build.mjs'
].map(read));

check(env.includes('ADSB.lol is the default public ADS-B/MLAT source')&&env.includes('OPENSKY_FALLBACK_ENABLED=false'),'environment contract documents ADSB.lol primary and opt-in OpenSky fallback');
const mf=JSON.parse(manifest);
check(mf.icons?.some(x=>x.src==='/brand/shadownex-mark.webp'&&x.purpose.includes('maskable')),'manifest preserves approved ShadowNex install icon');
check(workflow.includes('branches: [main, qa/reconcile-v2.2.1-sbl-07-r3]')&&workflow.includes('workflow_dispatch:')&&workflow.includes('npm test')&&workflow.includes('npm run build')&&!/vercel|deploy/i.test(workflow.replace('Verify deterministic static build','')),'QA harness workflow tests/builds without deployment');
check(notices.includes('Open Data Commons Open Database License (ODbL) v1.0')&&notices.includes('OpenSky fallback is disabled by default'),'aircraft third-party license/terms boundary is explicit');
check(inventory.includes('complete main-only audit')&&inventory.includes('no known main-only application feature left to copy blindly'),'inventory records convergence conclusion');
check(index.includes('/native-install.js')&&build.includes("cp(resolve(root, 'native-install.js')"),'native installer remains in deterministic static build');
const pkg=JSON.parse(pkgText);check(pkg.scripts.test.includes('qa-convergence.mjs')&&pkg.engines?.node==='>=22 <23'&&Object.keys(pkg.dependencies||{}).length===0,'convergence QA is chained with Node 22 and zero runtime dependencies');

const normalized=await mockAircraft();
const row=normalized.body?.states?.[0];
check(normalized.status===200&&normalized.requestUrl.includes('/v2/point/35.4676/-97.5164/250'),'aircraft endpoint calls bounded ADSB.lol point API around requested view');
check(normalized.body?._source==='ADSB.lol'&&normalized.body?._license==='ODbL-1.0','aircraft response preserves ADSB.lol provenance and license');
check(Array.isArray(row)&&row[0]==='a50842'&&row[1]==='UPS2897'&&Math.abs(row[7]-10668)<.1,'aircraft normalizer preserves identity and converts altitude feet to meters');
check(Math.abs(row[9]-231.4998)<.1&&Math.abs(row[11]-2.54)<.01,'aircraft normalizer converts knots and feet/minute to internal SI units');

console.log(`\nSBL-06 convergence QA: ${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;

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
