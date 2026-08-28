import { cameraState, rectangleDegrees } from '../core/geo.js';
import { AnnotationController } from './AnnotationController.js';
import { SceneDirector } from './SceneDirector.js';
export class GlobeController extends EventTarget {
  constructor(container,settings){super();this.container=container;this.settings=settings;this.viewer=null;this.selected=null;this.tracking=false;this.cockpit=false;this.annotation=null;this.sceneDirector=null;this.followTimer=null;this.baseMapLayer=null;this.baseMapProvider=null;this.baseMapStatus='LOADING';this.baseMapName='Keyless Earth';this.baseMapErrors=0;this.terrainStatus='ELLIPSOID';this.selectionMarker=null;}
  async init(){
    if(!window.Cesium)throw new Error('Cesium runtime did not load.');
    const C=window.Cesium,compact=matchMedia('(max-width: 900px)').matches||navigator.maxTouchPoints>0;
    if(this.settings.cesiumToken)C.Ion.defaultAccessToken=this.settings.cesiumToken;
    this.viewer=new C.Viewer(this.container,{animation:false,timeline:false,baseLayer:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,selectionIndicator:false,shouldAnimate:false,requestRenderMode:true,maximumRenderTimeChange:1});
    this.viewer.scene.globe.show=true;this.viewer.scene.globe.baseColor=C.Color.fromCssColorString('#0d3242');this.viewer.scene.globe.depthTestAgainstTerrain=true;this.viewer.scene.globe.enableLighting=false;this.viewer.scene.globe.showGroundAtmosphere=true;this.viewer.scene.fxaa=true;this.viewer.scene.requestRenderMode=true;this.viewer.scene.maximumRenderTimeChange=1;if(this.viewer.scene.skyAtmosphere)this.viewer.scene.skyAtmosphere.show=true;
    this.installKeylessBaseMap();
    if(compact){this.viewer.resolutionScale=.72;try{this.viewer.scene.globe.tileCacheSize=80}catch{}}
    try{if(this.settings.cesiumToken){this.viewer.terrainProvider=await C.createWorldTerrainAsync();this.terrainStatus='ION TERRAIN';}}catch(e){this.terrainStatus='ELLIPSOID';console.warn('[terrain]',e);}
    this.home(false);
    this.annotation=new AnnotationController(this);this.sceneDirector=new SceneDirector(this,this.annotation);
    const handler=new C.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(m=>this.onClick(m.position),C.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(()=>this.annotation?.finish(),C.ScreenSpaceEventType.RIGHT_CLICK);
    this.viewer.camera.moveEnd.addEventListener(()=>{this.dispatchEvent(new CustomEvent('camera',{detail:cameraState(this.viewer)}));this.requestRender();});
    this.viewer.scene.preRender.addEventListener(()=>this.updateFollow());
    const canvas=this.viewer.scene.canvas;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.dispatchEvent(new CustomEvent('stability',{detail:{state:'lost',message:'Graphics context paused. Tap reload if the map does not recover.'}}));});
    canvas.addEventListener('webglcontextrestored',()=>{this.requestRender();this.dispatchEvent(new CustomEvent('stability',{detail:{state:'restored',message:'Map graphics recovered.'}}));});
    this.requestRender();return this;
  }
  installKeylessBaseMap(){
    const C=window.Cesium;
    try{
      const provider=new C.UrlTemplateImageryProvider({url:C.buildModuleUrl('Assets/Textures/NaturalEarthII')+'/{z}/{x}/{reverseY}.jpg',tilingScheme:new C.GeographicTilingScheme(),maximumLevel:5,credit:'Natural Earth II · CesiumJS'});
      const layer=this.viewer.imageryLayers.addImageryProvider(provider,0);layer.alpha=1;layer.brightness=.98;layer.contrast=1.03;
      this.baseMapProvider=provider;this.baseMapLayer=layer;this.baseMapStatus='READY';this.baseMapName='Natural Earth II';
      provider.errorEvent?.addEventListener?.(()=>{this.baseMapErrors++;if(this.baseMapErrors===3){this.baseMapStatus='FALLBACK';this.baseMapName='Fallback Earth';this.dispatchEvent(new CustomEvent('stability',{detail:{state:'warning',message:'Earth imagery is having trouble loading. ShadowNex is keeping a visible fallback globe underneath live contacts.'}}));this.requestRender();}});
    }catch(e){this.baseMapStatus='FALLBACK';this.baseMapName='Fallback Earth';console.warn('[basemap]',e);this.dispatchEvent(new CustomEvent('stability',{detail:{state:'warning',message:'Earth imagery could not load. ShadowNex is showing a visible fallback globe instead of a blank field.'}}));}
  }
  baseMapInfo(){return {status:this.baseMapStatus,name:this.baseMapName,terrain:this.terrainStatus};}
  requestRender(){try{this.viewer?.scene?.requestRender()}catch{}}
  onClick(position){if(this.annotation?.isArmed()){this.annotation.handleClick(position);return;}const picked=this.viewer.scene.pick(position);const meta=picked?.id?.properties?.snxMeta?.getValue?.()??picked?.id?.snxMeta??picked?.primitive?.snxMeta;if(meta?.type==='CLUSTER'){const alt=Math.max(650000,(this.state().alt||6000000)*.42);this.flyTo(Number(meta.longitude),Number(meta.latitude),alt);return;}if(meta)this.select(meta,picked.id||picked.primitive);else if(this.selected)this.clearSelection();}
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
