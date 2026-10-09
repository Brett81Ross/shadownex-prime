import {readFile,readdir} from 'node:fs/promises';
import {extname,join} from 'node:path';
let pass=0,fail=0;const check=(ok,msg)=>{if(ok){console.log('✓',msg);pass++;}else{console.error('✗',msg);fail++;}};
const root=new URL('..',import.meta.url),pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')),vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8')),main=await readFile(new URL('../src/main.js',import.meta.url),'utf8'),build=await readFile(new URL('../scripts/build.mjs',import.meta.url),'utf8'),abl=await readFile(new URL('../ATOMIC_BUILD.md',import.meta.url),'utf8'),checkpoint=await readFile(new URL('../RECONCILIATION_CHECKPOINT.md',import.meta.url),'utf8');
check(pkg.engines?.node==='>=22 <23','release gate keeps Node 22');
check(Object.keys(pkg.dependencies||{}).length===0&&Object.keys(pkg.devDependencies||{}).length===0,'release gate keeps zero npm dependencies');
check(vercel.git?.deploymentEnabled===false,'Git-triggered Vercel deployment remains locked');
check(vercel.outputDirectory==='dist'&&String(vercel.buildCommand).includes('scripts/build.mjs'),'Vercel still publishes deterministic dist output');
check(build.includes("resolve(root, 'dist')")&&build.includes("cp(resolve(root, 'src')"),'build script still constructs dist from the independent source tree');
const installers=['installAblEnhancements','installIntelligenceEnhancements','installSituationEnhancements','installProfileEnhancements','installFriendlyUiEnhancements','installUnitEnhancements','installSblUi','installMapDecor','installSblWatch','installTrustEnhancements','installDiscoveryEnhancements'];
check(installers.every(x=>main.includes(`${x}(app)`)),'all staged enhancement installers are wired');
check(['qa-sbl.mjs','qa-sbl-watch.mjs','qa-sbl-trust.mjs','qa-sbl-discovery.mjs','qa-reconciliation.mjs'].every(x=>pkg.scripts.test.includes(x)),'all SBL QA gates are chained');
check(['SBL-01','SBL-02','SBL-03','SBL-04'].every(x=>abl.includes(x)),'atomic build records every SBL checkpoint');
check(checkpoint.includes('NO BLIND MERGE')&&checkpoint.includes('Production deployment is a separate approval'),'reconciliation checkpoint preserves explicit merge/deploy boundaries');
const src=await collect(new URL('../src/',import.meta.url));let executable='';for(const u of src.filter(x=>['.js','.mjs'].includes(extname(x.pathname))))executable+='\n'+await readFile(u,'utf8');
check(!/navigator\.serviceWorker|serviceWorker\.register|new\s+ServiceWorker/i.test(executable),'no service worker code entered the staged source');
console.log(`\nReconciliation gate QA: ${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;
async function collect(url){const out=[];for(const e of await readdir(url,{withFileTypes:true})){const child=new URL(e.name+(e.isDirectory()?'/':''),url);if(e.isDirectory())out.push(...await collect(child));else out.push(child);}return out;}
