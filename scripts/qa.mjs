import {readdir,readFile} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {TrailStore} from '../src/core/trails.js';
import {correlateContacts} from '../src/core/contactCorrelation.js';
import {polygonAreaKm2,polylineKm} from '../src/core/geo.js';

const root=new URL('..',import.meta.url);
const rootPath=decodeURIComponent(root.pathname);
let pass=0,fail=0;
const check=(ok,msg)=>{if(ok){console.log('PASS',msg);pass++;}else{console.error('FAIL',msg);fail++;}};

const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
check(pkg.version==='2.2.1','version is 2.2.1');
check(pkg.engines?.node==='>=22 <23','Node engine targets 22.x');
check(Object.keys(pkg.dependencies||{}).length===0&&Object.keys(pkg.devDependencies||{}).length===0,'no npm dependencies');

const files=await walk(rootPath);
const textFiles=files.filter(f=>['.js','.mjs','.html','.css','.md','.txt','.json'].includes(extname(f)));
let corpus='';
for(const f of textFiles)corpus+='\n'+await readFile(f,'utf8');

const retired=[
  String.fromCharCode(103,111,100,115,32,101,121,101),
  String.fromCharCode(103,101,118,45),
  String.fromCharCode(98,105,108,97,119,97,108,32,115,105,100,104,117)
];
check(retired.every(x=>!corpus.toLowerCase().includes(x)),'no retired brand or author seams');

const executable=await Promise.all(files.filter(f=>['.js','.mjs','.html'].includes(extname(f))).map(f=>readFile(f,'utf8')));
check(!/navigator\.serviceWorker|serviceWorker\.register|new\s+ServiceWorker/i.test(executable.join('\n')),'no service worker registration code');

const oldLicense=String.fromCharCode(77,73,84);
check(!corpus.split(/\W+/).includes(oldLicense),'no retired app-level license notice in the clean tree');
check(/All Rights Reserved/.test(corpus),'proprietary ownership notice present');
check(/THIRD_PARTY_NOTICES/.test(corpus),'third-party notices documented');

const js=files.filter(f=>['.js','.mjs'].includes(extname(f)));
let syntax=true;
for(const f of js){
  const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
  if(r.status!==0){syntax=false;console.error(r.stderr);break;}
}
check(syntax,`${js.length} JS/MJS files pass syntax checks`);

const required=[
  '/src/core/qr.js',
  '/src/core/orbit.js',
  '/api/briefing.js',
  '/api/boundary.js',
  '/api/cctv.js',
  '/api/aircraft.js',
  '/api/imagery.js',
  '/src/layers/SubseaLayer.js',
  '/src/globe/AnnotationController.js',
  '/src/globe/SceneDirector.js',
  '/src/ui/sblUi.js',
  '/src/ui/sblWatch.js',
  '/src/ui/trustEnhancements.js',
  '/src/ui/discoveryEnhancements.js'
];
for(const p of required)check(files.some(f=>f.endsWith(p)),`required module present: ${p}`);

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
check(['routeBtn','areaBtn','measureBtn','finishAnnoBtn','orbitSceneBtn','worldSceneBtn','routeSceneBtn','cockpitOverlay','scopeCloseBtn','homeBtn'].every(id=>html.includes(`id="${id}"`)),'NexDraw, SceneDirector, cockpit, close, and Home controls are present');
check(html.includes('/native-install.js'),'native Android install launcher is page-loaded');
check(!html.includes('/src/demo-help.js'),'legacy Demo/Help script is not page-loaded after SBL-04');

const trails=new TrailStore({maxPoints:3,maxAgeMs:100000,minMoveKm:0});
trails.push('a',{lat:0,lon:0},1);
trails.push('a',{lat:0,lon:1},2);
trails.push('a',{lat:0,lon:2},3);
trails.push('a',{lat:0,lon:3},4);
check(trails.get('a',4).length===3&&trails.get('a',4)[0].lon===1,'TrailStore bounds moving-contact history');

const layers=[
  {id:'aircraft',enabled:true,entities:[{properties:{snxMeta:{type:'AIRCRAFT',id:'b',name:'B',latitude:0,longitude:1}}}]},
  {id:'fires',enabled:true,entities:[{properties:{snxMeta:{type:'FIRE',id:'f',name:'F',latitude:0,longitude:.5}}}]}
];
const hits=correlateContacts({type:'AIRCRAFT',id:'a',latitude:0,longitude:0},layers,{radiusKm:200,limit:5});
check(hits.length===2&&hits[0].meta.type==='FIRE'&&hits[0].distanceKm<hits[1].distanceKm,'PrimeCorrelate ranks nearby cross-feed contacts');

check(Math.abs(polylineKm([{lat:0,lon:0},{lat:0,lon:1}])-111.2)<1,'NexDraw distance math is sane');
check(polygonAreaKm2([{lat:0,lon:0},{lat:0,lon:1},{lat:1,lon:1},{lat:1,lon:0}])>12000,'NexDraw polygon-area math is sane');

const scene=await readFile(new URL('../src/globe/SceneDirector.js',import.meta.url),'utf8');
check(scene.includes('RECONSTRUCTED ESTIMATE — NOT LIVE TELEMETRY')&&scene.includes('launchReconstruction'),'launch reconstruction is explicit about estimate-only status');

const cctv=await mockCctv();
check(cctv.status===200&&cctv.body.points.length===6,'CCTV normalizer accepts six mocked public camera providers');
check(new Set(cctv.body.points.map(x=>x.source)).size===6,'CCTV mock preserves six distinct source attributions');
check(cctv.body.points.some(x=>x.source==='OKTraffic / ODOT-OTA'),'Oklahoma camera provider is present in normalized CCTV output');

console.log(`\nQA: ${pass} passed, ${fail} failed`);
process.exitCode=fail?1:0;

async function mockCctv(){
  const old=globalThis.fetch;
  globalThis.fetch=async input=>{
    const u=String(input);
    if(u.includes('oktraffic.org/api/CameraPoles'))return ok([{id:'p1',name:'OKC Pole',mapCameras:[{id:'ok1',location:'I-35 at SE 44th',latitude:35.4201,longitude:-97.489,status:'In Service',direction:'North',streamDictionary:{streamName:'OKC Cam',streamSrc:'https://example.invalid/ok.m3u8'}}]}]);
    if(u.includes('api.tfl.gov.uk'))return ok([{id:'t1',commonName:'London',lat:51.5,lon:-.1,additionalProperties:[{key:'available',value:'true'}]}]);
    if(u.includes('caltrans-gis'))return ok({features:[{geometry:{coordinates:[-121,37]},properties:{OBJECTID:7,locationName:'CA Cam',longitude:-121,latitude:37,inService:'true'}}]});
    if(u.includes('austintexas'))return ok({features:[{id:'a1',geometry:{coordinates:[-97.7,30.2]},properties:{camera_id:'A1',location_name:'Austin Cam',camera_status:'TURNED_ON'}}]});
    if(u.includes('services.arcgis.com'))return ok({features:[{geometry:{coordinates:[-122.33,47.61]},properties:{OBJECTID:8,NAME:'Seattle Cam',URL:'https://example.invalid/sea',SERVSTAT:'In Service'}}]});
    if(u.includes('mdgeodata.md.gov'))return ok({features:[{geometry:{coordinates:[-76.61,39.29]},properties:{OBJECTID:9,location:'Baltimore Cam',county:'Baltimore',url:'https://example.invalid/md',lat:39.29,long:-76.61}}]});
    throw new Error('unexpected mock URL '+u);
  };
  try{
    const {default:handler}=await import('../api/cctv.js?qa='+Date.now());
    let status=200,body=null;
    const res={status(n){status=n;return this},json(o){body=o;return o}};
    await handler({method:'GET',url:'/api/cctv'},res);
    return {status,body};
  }finally{globalThis.fetch=old;}
}
function ok(data){return {ok:true,status:200,json:async()=>data};}

async function walk(dir){
  const out=[];
  for(const e of await readdir(dir,{withFileTypes:true})){
    if(e.name==='.git'||e.name==='node_modules'||e.name==='dist')continue;
    const p=join(dir,e.name);
    if(e.isDirectory())out.push(...await walk(p));else out.push(p);
  }
  return out;
}
