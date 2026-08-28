import { cameraState, rectangleDegrees } from '../core/geo.js';
import { AnnotationController } from './AnnotationController.js';
import { SceneDirector } from './SceneDirector.js';
export class GlobeController extends EventTarget {
  constructor(container,settings){ super(); this.container=container; this.settings=settings; this.viewer=null; this.selected=null; this.tracking=false; this.cockpit=false; this.annotation=null; this.sceneDirector=null; }
  async init(){
    if(!window.Cesium) throw new Error('Cesium runtime did not load.');
    const C=window.Cesium;
    if(this.settings.cesiumToken) C.Ion.defaultAccessToken=this.settings.cesiumToken;
    this.viewer=new C.Viewer(this.container,{animation:false,timeline:false,baseLayer:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,selectionIndicator:false,shouldAnimate:true});
    this.viewer.scene.globe.show=true;
    this.viewer.scene.globe.baseColor=C.Color.fromCssColorString('#07151d');
    try{
      const provider=new C.UrlTemplateImageryProvider({url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',maximumLevel:19,credit:'© OpenStreetMap contributors'});
      const layer=this.viewer.imageryLayers.addImageryProvider(provider);
      layer.brightness=.72;layer.contrast=1.08;layer.saturation=.72;layer.gamma=.96;
    }catch(e){console.warn('[basemap] OpenStreetMap imagery unavailable; using globe fallback.',e);}
    this.viewer.scene.globe.depthTestAgainstTerrain=true; this.viewer.scene.fxaa=true; this.viewer.scene.requestRenderMode=false;
    try { if(this.settings.cesiumToken) this.viewer.terrainProvider=await C.createWorldTerrainAsync(); } catch(e) { console.warn('[terrain] Cesium terrain unavailable; using ellipsoid.',e); }
    this.viewer.camera.setView({destination:C.Cartesian3.fromDegrees(-98.5,38.4,11500000),orientation:{heading:0,pitch:C.Math.toRadians(-62),roll:0}});
    this.viewer.scene.requestRender();
    this.annotation=new AnnotationController(this);this.sceneDirector=new SceneDirector(this,this.annotation);
    const handler=new C.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(m=>this.onClick(m.position),C.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(()=>this.annotation?.finish(),C.ScreenSpaceEventType.RIGHT_CLICK);
    this.viewer.camera.moveEnd.addEventListener(()=>this.dispatchEvent(new CustomEvent('camera',{detail:cameraState(this.viewer)})));
    this.viewer.scene.preRender.addEventListener(()=>this.updateFollow());
    return this;
  }
  onClick(position){
    if(this.annotation?.isArmed()){this.annotation.handleClick(position);return;}
    const picked=this.viewer.scene.pick(position); const meta=picked?.id?.properties?.snxMeta?.getValue?.() ?? picked?.id?.snxMeta ?? picked?.primitive?.snxMeta;
    if(meta) this.select(meta,picked.id || picked.primitive);
  }
  select(meta,entity){ this.selected={meta,entity}; this.dispatchEvent(new CustomEvent('select',{detail:meta})); }
  clearSelection(){this.selected=null;this.tracking=false;this.cockpit=false;this.dispatchEvent(new CustomEvent('select',{detail:null}));}
  setTracking(on){this.tracking=!!on;if(!on)this.cockpit=false;this.dispatchFollow();}
  setCockpit(on){this.cockpit=!!on;this.tracking=!!on;this.dispatchFollow();}
  dispatchFollow(){this.dispatchEvent(new CustomEvent('follow',{detail:{tracking:this.tracking,cockpit:this.cockpit,meta:this.selected?.meta||null}}));}
  updateFollow(){
    if(!this.tracking||!this.selected?.entity) return; const C=window.Cesium; const entity=this.selected.entity; let pos;
    try{pos=entity.position?.getValue?.(this.viewer.clock.currentTime) || entity.position;}catch{return} if(!pos)return;
    if(this.cockpit){
      const meta=this.selected.meta||{}; const cart=C.Cartographic.fromCartesian(pos); const dest=C.Cartesian3.fromRadians(cart.longitude,cart.latitude,Math.max(cart.height+40,100));
      this.viewer.camera.setView({destination:dest,orientation:{heading:C.Math.toRadians(Number(meta.heading)||0),pitch:C.Math.toRadians(-4),roll:0}});
    }else this.viewer.camera.lookAt(pos,new C.HeadingPitchRange(0,C.Math.toRadians(-30),Math.max(1500,Number(this.selected.meta?.altitude)||5000)));
  }
  stopFollow(){this.tracking=false;this.cockpit=false;try{this.viewer.camera.lookAtTransform(window.Cesium.Matrix4.IDENTITY)}catch{}this.dispatchFollow();}
  armAnnotation(mode){this.stopFollow();this.annotation?.arm(mode)}
  finishAnnotation(){return this.annotation?.finish()}
  cancelAnnotation(){this.annotation?.cancel()}
  clearAnnotations(){this.annotation?.clear()}
  flyTo(lon,lat,alt=1200000){this.stopFollow();this.sceneDirector?.stop(false);this.viewer.camera.flyTo({destination:window.Cesium.Cartesian3.fromDegrees(lon,lat,alt),duration:this.settings.reduceMotion?0:.9});}
  focusCoordinates(){const C=window.Cesium,canvas=this.viewer.scene.canvas,center=new C.Cartesian2(canvas.clientWidth/2,canvas.clientHeight/2),cart=this.viewer.camera.pickEllipsoid(center,this.viewer.scene.globe.ellipsoid);if(cart){const p=C.Cartographic.fromCartesian(cart);return {lat:C.Math.toDegrees(p.latitude),lon:C.Math.toDegrees(p.longitude)}}const s=this.state();return {lat:s.lat,lon:s.lon}}
  state(){return cameraState(this.viewer)}
  rectangle(){return rectangleDegrees(this.viewer)}
  setTraffic(key,on){
    const C=window.Cesium;if(this.trafficLayer){this.viewer.imageryLayers.remove(this.trafficLayer,true);this.trafficLayer=null;} if(!on||!key)return;
    const provider=new C.UrlTemplateImageryProvider({url:`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?tileSize=256&key=${encodeURIComponent(key)}`,maximumLevel:18,credit:'TomTom Traffic'});this.trafficLayer=this.viewer.imageryLayers.addImageryProvider(provider);this.trafficLayer.alpha=.65;
  }
}
