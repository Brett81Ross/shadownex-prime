import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GlobeController} from '../src/globe/GlobeController.js';
import {CctvLayer} from '../src/layers/CctvLayer.js';
import {installViewportDialogs} from '../src/ui/viewportDialogs.js';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [ui,css,html,source,reset]=await Promise.all(['src/ui/friendlyUiEnhancements.js','src/ui/viewportDialogs.css','index.html','src/globe/GlobeController.js','src/ui/sblWatch.js'].map(read));
assert.ok(ui.includes('installViewportDialogs()')&&css.includes('dialog.viewport-modal'),'visual viewport covers remaining dialogs');
assert.ok(ui.includes('threeDWorldBtn')&&html.includes('/src/ui/viewportDialogs.css'),'3D toggle visible');
assert.ok(ui.includes('world3DAttribution')&&css.includes('.world3d-attribution'),'source credits shown when 3D enabled');
assert.match(css,/\.world3d-attribution\s*\{[^}]*pointer-events:auto/s,'clipped 3D credits remain scrollable on mobile');
assert.ok(source.includes('CesiumTerrainProvider.fromUrl')&&source.includes('Cesium3DTileset.fromUrl'),'true terrain and building geometry');
const freeMethod=source.slice(source.indexOf('async setWorld3D('),source.indexOf('  requestRender(){',source.indexOf('async setWorld3D(')));
assert.ok(!freeMethod.includes('createOsmBuildingsAsync')&&!freeMethod.includes('createWorldTerrainAsync'),'the new 3D toggle never calls token-gated ion providers');
assert.ok(reset.includes('setWorld3D?.(false)'),'Reset App disables 3D');
assert.equal(typeof installViewportDialogs,'function');
const perfSource=await read('src/ui/ablEnhancements.js');
assert.ok(perfSource.includes('applyWorld3DPerformance?.(this.lowPower)'),'low-power transitions synchronize 3D quality');
const aircraftSource=await read('src/layers/AircraftLayer.js');
assert.ok(aircraftSource.includes('!this.app.compact||alt<350000'),'Fold callsigns reappear at close zoom');
assert.ok(aircraftSource.includes('!this.app.lowPower&&(!this.app.compact||alt<350000)'),'low-power keeps contact labels suppressed');
const symbolSource=await read('src/layers/markerIcons.js');
assert.ok(symbolSource.includes('encodeURIComponent(svg)')&&symbolSource.includes('cache.set(cacheKey,marker)'),'sharp cached SVG symbols');
for(const [layer,icon] of [['AircraftLayer','aircraft'],['CctvLayer','camera'],['SatelliteLayer','satellite'],['EarthquakeLayer','quake'],['FireLayer','fire'],['LaunchLayer','launch'],['VesselLayer','vessel']]){
 const layerSource=await read('src/layers/'+layer+'.js');
 assert.ok(layerSource.includes("from './markerIcons.js'")&&layerSource.includes("mapMarker("),'map icon helper connected for '+layer);
 assert.ok(layerSource.includes("'"+icon+"'"),'distinct symbol for '+layer);
}
const viewport=await read('src/ui/viewportDialogs.js');
assert.ok(viewport.includes('__snxResizePending')&&viewport.includes('root.__snxResizePending=false'),'Fold Cesium resize is coalesced into a single animation frame');
assert.ok(viewport.includes("root.style.removeProperty(prop)"),'Fold releases temporary viewport clamps');
const calls=[];
const C={
 CesiumTerrainProvider:{fromUrl:async(url)=>{calls.push(['terrain',url]);return {name:'free-terrain'}}},
 Cesium3DTileset:{fromUrl:async(url)=>{calls.push(['buildings',url]);return {show:true}}},
 EllipsoidTerrainProvider:class{constructor(){calls.push(['ellipsoid']);}}
};
globalThis.window={Cesium:C};
const credit={classList:{add:()=>calls.push(['hide-credits']),remove:()=>calls.push(['show-credits'])}};
globalThis.document={getElementById:()=>credit};
const globe=Object.create(GlobeController.prototype);
globe.world3DMode='off';
globe.viewer={terrainProvider:null,scene:{globe:{maximumScreenSpaceError:1.35},primitives:{add:t=>{calls.push(['add']);return t;}}}};
globe.settings={cesiumToken:''};globe.requestRender=()=>calls.push(['render']);
let result=await globe.setWorld3D(true);
assert.equal(result.ok,true,'no-token terrain and building activation works');
assert.equal(result.buildings,true);
assert.equal(globe.world3DMode,'on');
assert.ok(calls.some(a=>a[0]==='terrain'&&a[1]==='https://terrain.reearth.land/cesium-mesh/ellipsoid'));
assert.ok(calls.some(a=>a[0]==='buildings'&&a[1]==='https://buildings.reearth.land/tileset.json'));
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,2.0,'desktop has closer mountain detail');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,24,'desktop buildings use medium detail');
assert.equal(globe.world3DBuildings.dynamicScreenSpaceError,true,'building traversal adapts with distance');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,24,'initial desktop tileset refinement');
const tileMemory=await read('src/globe/GlobeController.js');
assert.ok(tileMemory.includes('maximumCacheOverflowBytes')&&tileMemory.includes('cacheBytes'),'3D building cache bounded where supported');

globe.compactDevice=true;
globe.applyWorld3DPerformance(true);
assert.equal(globe.viewer.resolutionScale,.6,'Fold low-power reduces GPU pixel budget');
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,5,'Fold low-power relaxes terrain refinement');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,64,'Fold low-power relaxes building refinement');
globe.applyWorld3DPerformance(false);
assert.equal(globe.viewer.resolutionScale,1,'normal 3D restores crisp Fold resolution');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,40,'normal Fold building detail restored');
globe.cameraMoving=true;
globe.applyWorld3DPerformance(false);
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,4,'moving Fold terrain uses reduced tile refinement');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,56,'moving Fold buildings reduce tile churn');
globe.cameraMoving=false;
globe.applyWorld3DPerformance(false);
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,3,'settled Fold terrain returns normal detail');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,40,'settled Fold buildings return normal detail');
globe.viewer.camera={positionCartographic:{height:65000}};
globe.applyWorld3DPerformance(false);
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,2.2,'settled close Fold terrain refines mountains');
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,28,'settled close Fold buildings refine geometry');
globe.cameraMoving=true;globe.applyWorld3DPerformance(false);
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,4,'camera movement has priority over close-range detail');
globe.applyWorld3DPerformance(true);
assert.equal(globe.world3DBuildings.maximumScreenSpaceError,64,'low-power has priority over close-range buildings');
globe.cameraMoving=false;globe.viewer.camera=null;globe.applyWorld3DPerformance(false);

globe.cameraMoving=true;
globe.applyWorld3DPerformance(true);
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,5,'low-power takes precedence during camera movement');
globe.cameraMoving=false;
globe.applyWorld3DPerformance(false);
globe.compactDevice=false;
const loaded=calls.filter(a=>a[0]==='buildings').length;
result=await globe.setWorld3D(false);assert.equal(result.ok,true);
assert.equal(globe.world3DMode,'off');assert.equal(globe.world3DBuildings.show,false);
assert.equal(globe.terrainStatus,'ELLIPSOID');
assert.ok(source.includes('this._preWorld3DTerrain'),'3D mode saves original terrain provider');
assert.ok(source.includes('this._preWorld3DTerrainStatus'),'3D mode preserves original terrain status');
assert.equal((await globe.setWorld3D(true)).ok,true);
assert.equal(calls.filter(a=>a[0]==='buildings').length,loaded,'reuse tileset for reopening');
assert.equal(calls.filter(a=>a[0]==='terrain').length,1,'reuse community terrain on 3D reopen without another network request');
await globe.setWorld3D(false);globe.world3DBuildings=null;
globe.compactDevice=true;
C.Cesium3DTileset.fromUrl=async()=>{throw new Error('simulated 3D building outage')};
result=await globe.setWorld3D(true);
assert.equal(result.ok,true,'terrain still works if building tiles fail');
assert.equal(result.buildings,false);
assert.equal(globe.world3DMode,'terrain-only');
assert.equal(globe.viewer.scene.globe.maximumScreenSpaceError,3.0,'Fold terrain tile budget');
await globe.setWorld3D(false);
globe.world3DTerrain=null; // Force new upstream request for outage-path test; normal toggles reuse cache.
C.CesiumTerrainProvider.fromUrl=async()=>{throw new Error('simulated terrain outage')};
result=await globe.setWorld3D(true);
assert.equal(result.ok,false,'no flat fake 3D when terrain is offline');
assert.equal(globe.world3DMode,'off');
assert.ok((await globe.setWorld3D(false)).ok,'can reset after failed terrain activation');
// Multi-contact tapping must preserve actual source entities and coordinates.
const picked=(id,type='AIRCRAFT')=>({id:{properties:{snxMeta:{getValue:()=>({type,id,latitude:35,longitude:-97})}}}});
const clickGlobe=Object.create(GlobeController.prototype);
const first=picked('a'),second=picked('b');
let selected=[],cleared=0,fly=[];
clickGlobe.viewer={scene:{drillPick:()=>[first,second,first]}};
clickGlobe.select=(meta,entity)=>selected.push([meta.id,entity]);
clickGlobe.clearSelection=()=>{cleared++;clickGlobe.selected=null;};
clickGlobe.flyTo=(...args)=>fly.push(args);
clickGlobe.state=()=>({alt:2000000});
clickGlobe.onClick({x:20,y:40});clickGlobe.onClick({x:20,y:40});clickGlobe.onClick({x:20,y:40});
assert.deepEqual(selected.map(x=>x[0]),['a','b','a'],'repeated taps cycle overlapping unique contacts');
assert.equal(clickGlobe.markerHits({x:20,y:40}).length,2,'duplicate picked primitives are ignored');
clickGlobe.onClick({x:200,y:400});assert.equal(selected.at(-1)[0],'a','different tap location restarts cycle');
clickGlobe.selectionMarker=first.id;assert.equal(clickGlobe.markerHits({x:20,y:40}).length,1,'selection halo ignored');
clickGlobe.selectionMarker=null;
clickGlobe.viewer.scene.drillPick=()=>[];clickGlobe.selected={meta:{type:'AIRCRAFT'}};clickGlobe.onClick({x:20,y:40});assert.equal(cleared,1,'empty tap clears selection');
clickGlobe.viewer.scene.drillPick=()=>[picked('cluster','CLUSTER')];clickGlobe.onClick({x:20,y:40});assert.equal(fly.length,1,'cluster tap retains fly-to behavior');
let annotations=0;clickGlobe.annotation={isArmed:()=>true,handleClick:()=>annotations++};clickGlobe.viewer.scene.drillPick=()=>{throw Error('should not pick while drawing')};
clickGlobe.onClick({x:20,y:40});assert.equal(annotations,1);
// Camera display clustering must not mutate source metadata or lose contacts.
const added=[],removed=[];let cameraAltitude=1000000;
const cameraViewer={entities:{add:x=>{const entity={...x,show:true};added.push(entity);return entity;},remove:e=>removed.push(e)}};
const cameraApp={compact:true,lowPower:false,globe:{viewer:cameraViewer,state:()=>({alt:cameraAltitude}),requestRender:()=>{}},registry:{define:()=>{}}};
const cameras=Object.create(CctvLayer.prototype);
cameras.app=cameraApp;cameras.enabled=true;cameras.cameraClusters=[];
cameras.cameraEntities=[
 {show:true,properties:{snxMeta:{getValue:()=>({type:'CCTV',id:'c1',latitude:35,longitude:-97})}}},
 {show:true,properties:{snxMeta:{getValue:()=>({type:'CCTV',id:'c2',latitude:35.0001,longitude:-97.0001})}}},
 {show:true,properties:{snxMeta:{getValue:()=>({type:'CCTV',id:'c3',latitude:35.0002,longitude:-97.0002})}}}
];
C.Cartesian3={fromDegrees:(lon,lat,alt)=>({lon,lat,alt})};
C.Cartesian2=class{constructor(x,y){this.x=x;this.y=y;}};
C.Color=class{constructor(){}};C.Color.WHITE={};
cameras.updateCameraClusters();
assert.equal(cameras.cameraClusters.length,1,'dense nearby cameras form one display cluster');
assert.equal(cameras.cameraClusters[0].properties.snxMeta.count,3,'camera cluster reports original source count');
assert.ok(cameras.cameraEntities.every(e=>e.show===false),'cluster hides individual visuals, not metadata');
assert.equal(cameras.cameraEntities[0].properties.snxMeta.getValue().id,'c1','camera source identity unchanged');
cameraAltitude=150000;cameras.updateCameraClusters();
assert.equal(cameras.cameraClusters.length,0,'camera markers expand at close zoom');
assert.ok(cameras.cameraEntities.every(e=>e.show===true),'all camera markers restored');
assert.equal(removed.length,1,'old cluster is disposed');
// ABL #9 screen-space collision: display-only hiding must preserve touch access.
const contact=(id,type,x,y)=>({show:true,position:{x,y},billboard:{show:true},label:{show:true},properties:{snxMeta:{getValue:()=>({id,type,latitude:35,longitude:-97})}}});
const air=contact('air','AIRCRAFT',100,100),cam=contact('cam','CCTV',110,103),quake=contact('quake','EARTHQUAKE',300,250),fire=contact('fire','FIRE',112,100);
const collisionGlobe=Object.create(GlobeController.prototype);
collisionGlobe.viewer={clock:{currentTime:0},entities:{values:[air,cam,quake,fire]},scene:{canvas:{clientWidth:800,clientHeight:600},cartesianToCanvasCoordinates:p=>p,drillPick:()=>[{id:fire}]}};
collisionGlobe.requestRender=()=>{};collisionGlobe.state=()=>({alt:1000000});collisionGlobe._collisionSuppressed=[];
collisionGlobe.updateMarkerCollisions();
assert.deepEqual(collisionGlobe._collisionSuppressed.map(x=>x.meta.id).sort(),['air','cam'],'cross-layer overlap hides lower-priority display symbols');
assert.equal(fire.billboard.show,true,'higher-priority fire stays visible');
assert.equal(quake.billboard.show,true,'distant contact remains visible');
assert.deepEqual(collisionGlobe.markerHits({x:110,y:100}).map(x=>x.meta.id).sort(),['air','cam','fire'],'suppressed contacts remain tappable without coordinate changes');
collisionGlobe.state=()=>({alt:20000});collisionGlobe.updateMarkerCollisions();
assert.ok([air,cam,quake,fire].every(x=>x.billboard.show===true&&x.label.show===true),'close zoom restores every suppressed symbol and label');
collisionGlobe.viewer.entities.values=[air,cam];collisionGlobe.state=()=>({alt:1000000});collisionGlobe.selected={entity:air};
collisionGlobe.updateMarkerCollisions();
assert.equal(air.billboard.show,true,'selected contact always wins screen-space collision');
assert.equal(cam.billboard.show,false,'other contact is still suppressed');
// Cesium LabelGraphics often omits the show property; restore its default-visible state.
cam.label.show=undefined;collisionGlobe.selected={entity:fire};collisionGlobe.viewer.entities.values=[cam,fire];collisionGlobe.updateMarkerCollisions();
collisionGlobe.state=()=>({alt:10000});collisionGlobe.updateMarkerCollisions();
assert.equal(cam.label.show,true,'implicit Cesium label visibility restored after collision');
console.log('PASS: free 3D has no paid providers, correct attribution, reversible terrain/buildings and safe degraded fallbacks');
