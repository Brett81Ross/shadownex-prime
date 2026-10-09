import {readFile} from 'node:fs/promises';
let pass=0,fail=0;const check=(ok,msg)=>{if(ok){console.log('✓',msg);pass++;}else{console.error('✗',msg);fail++;}};const read=p=>readFile(new URL(`../${p}`,import.meta.url),'utf8');
const [main,index,vercel,pkgText,inventory,checkpoint,candidate,workflow,aircraft,friendly,manifest]=await Promise.all([
  'src/main.js','index.html','vercel.json','package.json','RECONCILIATION_INVENTORY.md','RECONCILIATION_CHECKPOINT.md','RECONCILED_CANDIDATE.md','.github/workflows/atomic-qa.yml','api/aircraft.js','src/ui/friendlyUiEnhancements.js','public/manifest.webmanifest'
].map(read));
const pkg=JSON.parse(pkgText),v=JSON.parse(vercel),mf=JSON.parse(manifest);
check(v.git?.deploymentEnabled===false,'candidate keeps Vercel Git deployment locked');
check(pkg.engines?.node==='>=22 <23'&&Object.keys(pkg.dependencies||{}).length===0&&Object.keys(pkg.devDependencies||{}).length===0,'candidate keeps Node 22 and zero npm dependencies');
check(!index.includes('/src/demo-help.js')&&main.includes('installDiscoveryEnhancements(app)'),'candidate uses SBL discovery/help instead of legacy demo-help');
check(['installSblUi','installMapDecor','installSblWatch','installTrustEnhancements','installDiscoveryEnhancements'].every(x=>main.includes(`${x}(app)`)),'candidate wires SBL-01 through SBL-04 installers');
check(aircraft.includes('api.adsb.lol/v2/point/')&&aircraft.includes("OPENSKY_FALLBACK_ENABLED==='true'"),'candidate preserves ADSB.lol primary and opt-in OpenSky fallback');
check(friendly.includes('Install Android App')&&index.includes('/native-install.js'),'candidate preserves native Android install surface');
check(mf.icons?.some(x=>x.src==='/brand/shadownex-mark.webp'),'candidate preserves approved install icon');
check(inventory.includes('complete main-only audit')&&checkpoint.includes('SBL-07 reconciled candidate'),'candidate includes reconciliation audit trail');
check(candidate.includes('curated 72-file SBL overlay')&&candidate.includes('not merge or deployment authorization'),'candidate documents reconciliation method and boundary');
check(workflow.includes('reconcile-v2.2.1-sbl')&&workflow.includes('npm test')&&workflow.includes('npm run build')&&!/\brun:\s*.*(?:vercel|deploy)/i.test(workflow),'candidate branch gets full non-deploying CI gate');
console.log(`\nReconciled candidate QA: ${pass} passed, ${fail} failed`);process.exitCode=fail?1:0;
