import assert from 'node:assert/strict';
import * as vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fmtDistanceKm } from '../src/core/geo.js';

// Link every browser ES module without evaluating DOM-dependent top-level code.
// This catches missing exports before browsers try to run ShadowNex Prime.
const root=resolve(import.meta.dirname,'..');
const modules=new Map();
const context=vm.createContext({});
async function load(path){
  const id=resolve(path);
  assert.ok(id.startsWith(root+sep),'ES module must remain in repository');
  if(modules.has(id))return modules.get(id);
  const source=await readFile(id,'utf8');
  const mod=new vm.SourceTextModule(source,{context,identifier:id});
  modules.set(id,mod);
  return mod;
}
const entry=await load(resolve(root,'src/main.js'));
await entry.link(async(specifier,ref)=>{
  assert.ok(specifier.startsWith('.'),'no external runtime module imports: '+specifier);
  return load(resolve(dirname(ref.identifier),specifier));
});
assert.equal(entry.status,'linked','complete browser import graph must link');
assert.equal(fmtDistanceKm(80.4672),'50 mi','watch radius converts to U.S. miles');
assert.equal(fmtDistanceKm(1),'0.6 mi','small distances retain useful precision');
assert.equal(fmtDistanceKm(Number.NaN),'—','invalid distances are identified');
console.log('Browser ES module graph linked:',modules.size,'modules; distance conversion passed.');
