import { cameraState, rectangleDegrees } from '../core/geo.js';
import { AnnotationController } from './AnnotationController.js';
import { SceneDirector } from './SceneDirector.js';
export class GlobeController extends EventTarget {
  constructor(container,settings){super();this.container=container;this.settings=settings;this.viewer=null;this.selected=null;this.tracking=false;this.cockpit=false;this.annotation=null;this.sceneDirector=null;this.followTimer=null;this.baseMapLayer=null;this.baseMapProvider=null;this.baseMapStatus='LOADING';this.baseMapName='Keyless Earth';this.baseMapErrors=0;this.terrainStatus='ELLIPSOID';this.selectionMarker=null;this.baseMapMode='satellite';this.world3DMode='off';this.world3DBuildings=null;this.world3DTerrain=null;this.compactDevice=false;this._collisionSuppressed=[];this._collisionTimer=null;}
  async init(){
    if(!window.Cesium)throw new Error('Cesium runtime did not load.');
    const C=window.Cesium,compact=matchMedia('(max-width: 900px)').matches||navigator.maxTouchPoints>0;
    this.compactDevice=compact;
    if(this.settings.cesiumToken)C.Ion.defaultAccessToken=this.settings.cesiumToken;
    this.viewer=new C.Viewer(this.container,{animation:false,timeline:false,baseLayer:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,selectionIndicator:false,shouldAnimate:false,requestRenderMode:true,maximumRenderTimeChange:1});
    this.viewer.scene.globe.show=true;this.viewer.scene.globe.baseColor=C.Color.fromCssColorString('#0d3242');this.viewer.scene.globe.depthTestAgainstTerrain=true;this.viewer.scene.globe.enableLighting=false;this.viewer.scene.globe.showGroundAtmosphere=true;this.viewer.scene.fxaa=true;this.viewer.scene.requestRenderMode=true;this.viewer.scene.maximumRenderTimeChange=1;if(this.viewer.scene.skyAtmosphere)this.viewer.scene.skyAtmosphere.show=true;
    this.installSatelliteBaseMap();
    if(compact){this.viewer.resolutionScale=.82;try{this.viewer.scene.globe.tileCacheSize=120}catch{}}else{try{this.viewer.scene.globe.tileCacheSize=220}catch{}}try{this.viewer.scene.screenSpaceCameraController.minimumZoomDistance=8;this.viewer.scene.globe.maximumScreenSpaceError=1.35}catch{}
    try{if(this.settings.cesiumToken){this.viewer.terrainProvider=await C.createWorldTerrainAsync();this.terrainStatus='ION TERRAIN';}}catch(e){this.terrainStatus='ELLIPSOID';console.warn('[terrain]',e);}
    this.home(false);
    this.annotation=new AnnotationController(this);this.sceneDirector=new SceneDirector(this,this.annotation);
    const handler=new C.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(m=>this.onClick(m.position),C.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(()=>this.annotation?.finish(),C.ScreenSpaceEventType.RIGHT_CLICK);
    this.viewer.camera.moveEnd.addEventListener(()=>{this.dispatchEvent(new CustomEvent('camera',{detail:cameraState(this.viewer)}));this.scheduleMarkerCollision();this.requestRender();});
    this.viewer.scene.preRender.addEventListener(()=>this.updateFollow());
    const canvas=this.viewer.scene.canvas;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.dispatchEvent(new CustomEvent('stability',{detail:{state:'lost',message:'Graphics context paused. Tap reload if the map does not recover.'}}));});
    canvas.addEventListener('webglcontextrestored',()=>{this.requestRender();this.dispatchEvent(new CustomEvent('stability',{detail:{state:'restored',message:'Map graphics recovered.'}}));});
    this.requestRender();return this;
  }
  installSatelliteBaseMap(){
    const C=window.Cesium;
    try{
      if(this.baseMapLayer){try{this.viewer.imageryLayers.remove(this.baseMapLayer,true)}catch{}}
      const provider=new C.UrlTemplateImageryProvider({url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',maximumLevel:19,credit:'Esri, Vantor, Earthstar Geographics, USDA, USGS, CNES/Airbus DS, GeoEye, AeroGRID, IGN, and the GIS User Community'});
      const layer=this.viewer.imageryLayers.addImageryProvider(provider,0);layer.alpha=1;layer.brightness=1;layer.contrast=1.02;
      this.baseMapProvider=provider;this.baseMapLayer=layer;this.baseMapStatus='READY';this.baseMapName='Esri World Imagery';this.baseMapMode='satellite';this.baseMapErrors=0;
      provider.errorEvent?.addEventListener?.(()=>{this.baseMapErrors++;if(this.baseMapErrors===6)this.dispatchEvent(new CustomEvent('stability',{detail:{state:'warning',message:'Detailed satellite imagery is having trouble loading. Use More → Basic Earth if needed.'}}));});
      this.requestRender();return true;
    }catch(e){console.warn('[satellite basemap]',e);this.installKeylessBaseMap();return false;}
  }
  setBaseMap(mode='satellite'){
    if(mode==='satellite')return this.installSatelliteBaseMap();
    if(this.baseMapLayer){try{this.viewer.imageryLayers.remove(this.baseMapLayer,true)}catch{}this.baseMapLayer=null;}
    this.installKeylessBaseMap();this.requestRender();return true;
  }
  installKeylessBaseMap(){
    const C=window.Cesium;
    try{
      const provider=new C.UrlTemplateImageryProvider({url:C.buildModuleUrl('Assets/Textures/NaturalEarthII')+'/{z}/{x}/{reverseY}.jpg',tilingScheme:new C.GeographicTilingScheme(),maximumLevel:5,credit:'Natural Earth II · CesiumJS'});
      const layer=this.viewer.imageryLayers.addImageryProvider(provider,0);layer.alpha=1;layer.brightness=.98;layer.contrast=1.03;
      this.baseMapProvider=provider;this.baseMapLayer=layer;this.baseMapStatus='READY';this.baseMapName='Natural Earth II';this.baseMapMode='basic';
      provider.errorEvent?.addEventListener?.(()=>{this.baseMapErrors++;if(this.baseMapErrors===3){this.baseMapStatus='FALLBACK';this.baseMapName='Fallback Earth';this.dispatchEvent(new CustomEvent('stability',{detail:{state:'warning',message:'Earth imagery is having trouble loading. ShadowNex is keeping a visible fallback globe underneath live contacts.'}}));this.requestRender();}});
    }catch(e){this.baseMapStatus='FALLBACK';this.baseMapName='Fallback Earth';console.warn('[basemap]',e);this.dispatchEvent(new CustomEvent('stability',{detail:{state:'warning',message:'Earth imagery could not load. ShadowNex is showing a visible fallback globe instead of a blank field.'}}));}
  }
  baseMapInfo(){return {status:this.baseMapStatus,name:this.baseMapName,mode:this.baseMapMode,terrain:this.terrainStatus};}
  // $0 Community 3D preview: public open-data services, no ion token or paid API.
  // Upstream hosts are best-effort; this remains opt-in and OFF by default.
  async setWorld3D(enabled){
    const C=window.Cesium;
    if(!this.viewer||!C)return {ok:false,reason:'3D viewer unavailable.'};
    const epoch=this._world3DEpoch=(this._world3DEpoch||0)+1;
    const credit=document.getElementById('world3DAttribution');
    if(!enabled){
      if(this.world3DBuildings)this.world3DBuildings.show=false;
      this.viewer.terrainProvider=new C.EllipsoidTerrainProvider();
      this.viewer.scene.globe.maximumScreenSpaceError=1.35;
      this.world3DMode='off';this.terrainStatus='ELLIPSOID';
      if(this.compactDevice)this.viewer.resolutionScale=.82;
      credit?.classList.add('hidden');this.requestRender();
      return {ok:true,enabled:false};
    }
    const withTimeout=(task,label)=>new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error(label+' timed out')),18000);
      Promise.resolve(task).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
    });
    try{
      const terrain=this.world3DTerrain||await withTimeout(C.CesiumTerrainProvider.fromUrl(
        'https://terrain.reearth.land/cesium-mesh/ellipsoid',
        {requestVertexNormals:false,requestWaterMask:false}
      ),'3D terrain');
      if(epoch!==this._world3DEpoch)return {ok:false,reason:'3D activation was cancelled.'};
      this.world3DTerrain=terrain;
      this.viewer.terrainProvider=terrain;
      // Fold: draw CSS-pixel-sharp 3D contacts without full device-pixel-ratio GPU cost.
      if(this.compactDevice)this.viewer.resolutionScale=1;
      this.terrainStatus='COMMUNITY TERRAIN';
      // Balance mountain detail against tile churn and Fold GPU memory.
      this.viewer.scene.globe.maximumScreenSpaceError=this.compactDevice?3.0:2.0;
      this.world3DMode='terrain-only';
      credit?.classList.remove('hidden');this.requestRender();
    }catch(error){
      console.warn('[free 3d terrain]',error);
      if(epoch===this._world3DEpoch){this.world3DMode='off';if(this.compactDevice)this.viewer.resolutionScale=.82;credit?.classList.add('hidden');}
      return {ok:false,reason:'Free terrain service unavailable. Original map remains available.'};
    }
    try{
      if(!this.world3DBuildings){
        const tileset=await withTimeout(C.Cesium3DTileset.fromUrl(
          'https://buildings.reearth.land/tileset.json'
        ),'3D buildings');
        if(epoch!==this._world3DEpoch)return {ok:false,reason:'3D activation was cancelled.'};
        // Larger error on touch/Fold devices reduces costly building tile refinement.
        tileset.maximumScreenSpaceError=this.compactDevice?40:24;
        tileset.dynamicScreenSpaceError=true;
        this.world3DBuildings=this.viewer.scene.primitives.add(tileset);
      }else this.world3DBuildings.show=true;
      this.world3DBuildings.maximumScreenSpaceError=this.compactDevice?40:24;
      this.world3DMode='on';this.requestRender();
      return {ok:true,enabled:true,buildings:true};
    }catch(error){
      console.warn('[free 3d buildings]',error);
      if(epoch!==this._world3DEpoch)return {ok:false,reason:'3D activation was cancelled.'};
      this.world3DMode='terrain-only';this.requestRender();
      return {ok:true,enabled:true,buildings:false,reason:'3D terrain is available; community buildings are temporarily unavailable.'};
    }
  }
  requestRender(){try{this.viewer?.scene?.requestRender()}catch{}}
  // A short repeated tap cycles real contacts that share the same screen pixels.
  // Keep source entities/coordinates unchanged; do not turn a selected halo into a hit.
  scheduleMarkerCollision(){
    clearTimeout(this._collisionTimer);
    this._collisionTimer=setTimeout(()=>this.updateMarkerCollisions(),120);
  }
  updateMarkerCollisions(){
    const viewer=this.viewer,scene=viewer?.scene;
    // Restore only values that this display-only pass previously suppressed.
    for(const item of this._collisionSuppressed||[]){
      if(item.entity?.billboard)item.entity.billboard.show=item.billboardShow;
      if(item.entity?.label&&item.labelShow!==undefined)item.entity.label.show=item.labelShow;
    }
    this._collisionSuppressed=[];
    if(!scene?.cartesianToCanvasCoordinates||!scene.canvas||!viewer.entities?.values)return;
    if((Number(this.state()?.alt)||0)<80000)return;
    const visible=x=>x?.getValue?x.getValue(viewer.clock?.currentTime):x;
    const candidates=[],all=viewer.entities.values;
    for(const entity of all.slice(0,3000)){
      if(!entity?.billboard||entity.show===false||entity===this.selectionMarker)continue;
      if(visible(entity.billboard.show)===false)continue;
      const meta=entity.properties?.snxMeta?.getValue?.(viewer.clock?.currentTime)??entity.snxMeta;
      if(!meta?.type)continue;
      const pos=visible(entity.position);
      if(!pos)continue;
      let xy;try{xy=scene.cartesianToCanvasCoordinates(pos)}catch{continue;}
      if(!xy||!Number.isFinite(xy.x)||!Number.isFinite(xy.y)||xy.x<0||xy.y<0||xy.x>scene.canvas.clientWidth||xy.y>scene.canvas.clientHeight)continue;
      const priority=entity===this.selected?.entity?1000:meta.type==='CLUSTER'?150:meta.type==='FIRE'?100:meta.type==='EARTHQUAKE'?90:meta.type==='CCTV'?80:meta.type==='AIRCRAFT'?70:50;
      candidates.push({entity,meta,xy,priority});
    }
    candidates.sort((a,b)=>b.priority-a.priority);
    const cell=36,buckets=new Map(),occupied=[];
    for(const item of candidates){
      const {xy,entity}=item,gx=Math.floor(xy.x/cell),gy=Math.floor(xy.y/cell);
      let collision=false;
      for(let x=gx-1;x<=gx+1&&!collision;x++)for(let y=gy-1;y<=gy+1;y++){
        for(const other of buckets.get(x+':'+y)||[]){
          if(Math.hypot(xy.x-other.x,xy.y-other.y)<30){collision=true;break;}
        }
        if(collision)break;
      }
      if(collision){
        const billboardShow=visible(entity.billboard.show);
        const labelShow=entity.label?visible(entity.label.show):undefined;
        entity.billboard.show=false;
        if(entity.label)entity.label.show=false;
        this._collisionSuppressed.push({entity,meta:item.meta,xy,billboardShow,labelShow});
      }else{
        const key=gx+':'+gy,points=buckets.get(key)||[];points.push(xy);buckets.set(key,points);occupied.push(item);
      }
    }
    this.requestRender();
  }
  markerHits(position){
    const scene=this.viewer.scene;
    const hits=typeof scene.drillPick==='function'?scene.drillPick(position,16):[scene.pick(position)];
    const found=[],seen=new Set();
    for(const hit of hits||[]){
      const entity=hit?.id||hit?.primitive;
      if(!entity||entity===this.selectionMarker)continue;
      const meta=entity.properties?.snxMeta?.getValue?.()??entity.snxMeta;
      if(!meta?.type)continue;
      if(seen.has(entity))continue;
      seen.add(entity);found.push({entity,meta});
    }
    // A suppressed symbol is still tappable at its original projected location.
    for(const item of this._collisionSuppressed||[]){
      if(Math.hypot(position.x-item.xy.x,position.y-item.xy.y)>20)continue;
      if(item.entity===this.selectionMarker||seen.has(item.entity))continue;
      seen.add(item.entity);found.push({entity:item.entity,meta:item.meta});
    }
    return found;
  }
  onClick(position){
    if(this.annotation?.isArmed()){this.annotation.handleClick(position);return;}
    const hits=this.markerHits(position);
    if(!hits.length){this._markerTap=null;if(this.selected)this.clearSelection();return;}
    const now=Date.now(),previous=this._markerTap;
    const sameSpot=previous&&now-previous.at<1800&&Math.hypot(position.x-previous.x,position.y-previous.y)<=20;
    const sameContacts=sameSpot&&hits.length===previous.entities.length&&hits.every((hit,i)=>hit.entity===previous.entities[i]);
    const index=sameContacts?(previous.index+1)%hits.length:0;
    this._markerTap={x:position.x,y:position.y,at:now,index,entities:hits.map(hit=>hit.entity)};
    const {meta,entity}=hits[index];
    if(meta.type==='CLUSTER'){this._markerTap=null;const alt=Math.max(650000,(this.state().alt||6000000)*.42);this.flyTo(Number(meta.longitude),Number(meta.latitude),alt);return;}
    this.select(meta,entity);
    if(hits.length>1&&this.selectionMarker){const C=window.Cesium;this.selectionMarker.label={text:(index+1)+' / '+hits.length,font:'bold 12px monospace',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:new C.Color(0,0,0,.9),pixelOffset:new C.Cartesian2(0,-25),disableDepthTestDistance:Number.POSITIVE_INFINITY};this.requestRender();}
  }
  select(meta,entity){this.selected={meta,entity};this.setSelectionMarker(entity);this.dispatchEvent(new CustomEvent('select',{detail:meta}));this.requestRender();}
  clearSelection(){this.selected=null;this.tracking=false;this.cockpit=false;this.stopFollowLoop();if(this.selectionMarker){try{this.viewer.entities.remove(this.selectionMarker)}catch{}this.selectionMarker=null;}try{this.viewer.camera.lookAtTransform(window.Cesium.Matrix4.IDENTITY)}catch{}this.dispatchFollow();this.dispatchEvent(new CustomEvent('select',{detail:null}));this.requestRender();}
  setSelectionMarker(entity){const C=window.Cesium;if(this.selectionMarker){try{this.viewer.entities.remove(this.selectionMarker)}catch{}this.selectionMarker=null;}const position=entity?.position;if(!position)return;this.selectionMarker=this.viewer.entities.add({position,point:{pixelSize:20,color:C.Color.TRANSPARENT,outlineColor:C.Color.WHITE,outlineWidth:2,disableDepthTestDistance:Number.POSITIVE_INFINITY}});}
  home(animate=true){if(!this.viewer)return;const C=window.Cesium;this.stopFollow();this.sceneDirector?.stop(false);this.annotation?.cancel();const view={destination:C.Cartesian3.fromDegrees(-98.5,38.4,15000000),orientation:{heading:0,pitch:C.Math.toRadians(-90),roll:0}};if(animate)this.viewer.camera.flyTo({...view,duration:this.settings.reduceMotion?0:.8,complete:()=>this.requestRender()});else this.viewer.camera.setView(view);this.requestRender();}
  setTracking(on){this.tracking=!!on;if(!on)this.cockpit=false;this.tracking?this.startFollowLoop():this.stopFollowLoop();this.dispatchFollow();}
  setCockpit(on){this.cockpit=!!on;this.tracking=!!on;this.tracking?this.startFollowLoop():this.stopFollowLoop();this.dispatchFollow();}
  startFollowLoop(){if(this.followTimer)return;this.followTimer=setInterval(()=>{if(!this.tracking)return this.stopFollowLoop();this.requestRender();},50);}
  stopFollowLoop(){if(this.followTimer)clearInterval(this.followTimer);this.followTimer=null;}
  dispatchFollow(){this.dispatchEvent(new CustomEvent('follow',{detail:{tracking:this.tracking,cockpit:this.cockpit,meta:this.selected?.meta||null}}));}
  updateFollow(){if(!this.tracking||!this.selected?.entity)return;const C=window.Cesium,entity=this.selected.entity;let pos;try{pos=entity.position?.getValue?.(this.viewer.clock.currentTime)||entity.position;}catch{return}if(!pos)return;if(this.cockpit){const meta=this.selected.meta||{},cart=C.Cartographic.fromCartesian(pos),dest=C.Cartesian3.fromRadians(cart.longitude,cart.latitude,Math.max(cart.height+40,100));this.viewer.camera.setView({destination:dest,orientation:{heading:C.Math.toRadians(Number(meta.heading)||0),pitch:C.Math.toRadians(-4),roll:0}});}else this.viewer.camera.lookAt(pos,new C.HeadingPitchRange(0,C.Math.toRadians(-30),Math.max(1500,Number(this.selected.meta?.altitude)||5000)));}
  stopFollow(){this.tracking=false;this.cockpit=false;this.stopFollowLoop();try{this.viewer.camera.lookAtTransform(window.Cesium.Matrix4.IDENTITY)}catch{}this.dispatchFollow();this.requestRender();}
  armAnnotation(mode){this.stopFollow();this.annotation?.arm(mode)}
  finishAnnotation(){const out=this.annotation?.finish();this.requestRender();return out}
  cancelAnnotation(){this.annotation?.cancel();this.requestRender()}
  clearAnnotations(){this.annotation?.clear();this.requestRender()}
  flyTo(lon,lat,alt=1200000){this.stopFollow();this.sceneDirector?.stop(false);this.viewer.camera.flyTo({destination:window.Cesium.Cartesian3.fromDegrees(lon,lat,alt),duration:this.settings.reduceMotion?0:.9,complete:()=>this.requestRender()});this.requestRender();}
  focusCoordinates(){const C=window.Cesium,canvas=this.viewer.scene.canvas,center=new C.Cartesian2(canvas.clientWidth/2,canvas.clientHeight/2),cart=this.viewer.camera.pickEllipsoid(center,this.viewer.scene.globe.ellipsoid);if(cart){const p=C.Cartographic.fromCartesian(cart);return {lat:C.Math.toDegrees(p.latitude),lon:C.Math.toDegrees(p.longitude)}}const s=this.state();return {lat:s.lat,lon:s.lon}}
  state(){return cameraState(this.viewer)}
  rectangle(){return rectangleDegrees(this.viewer)}
  setTraffic(key,on){const C=window.Cesium;if(this.trafficLayer){this.viewer.imageryLayers.remove(this.trafficLayer,true);this.trafficLayer=null;}if(!on||!key){this.requestRender();return;}const provider=new C.UrlTemplateImageryProvider({url:`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?tileSize=256&key=${encodeURIComponent(key)}`,maximumLevel:18,credit:'TomTom Traffic'});this.trafficLayer=this.viewer.imageryLayers.addImageryProvider(provider);this.trafficLayer.alpha=.65;this.requestRender();}
}
