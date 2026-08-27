import { BaseLayer } from './BaseLayer.js';
export class BikeLayer extends BaseLayer{
 constructor(app){super(app,{id:'bikeshare',label:'Bike Share',source:'CityBik.es',description:'Bike-share network locations',interval:900000});}
 async refresh(){const r=await fetch('https://api.citybik.es/v2/networks');if(!r.ok)throw new Error(`CityBik.es HTTP ${r.status}`);const d=await r.json();this.clear();const C=window.Cesium;let n=0;for(const x of d.networks||[]){const loc=x.location||{},lat=Number(loc.latitude),lon=Number(loc.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;const meta={type:'BIKESHARE',id:x.id,name:x.name,city:loc.city,country:loc.country,href:x.href,latitude:lat,longitude:lon,source:'CityBik.es'};this.add({position:C.Cartesian3.fromDegrees(lon,lat,40),point:{pixelSize:5,color:C.Color.AQUAMARINE,outlineColor:C.Color.BLACK,outlineWidth:1},properties:{snxMeta:meta}});n++;if(n>=this.app.densityLimit(120,300,700))break;}this.setHealthy(n,'Network hubs');}
}
