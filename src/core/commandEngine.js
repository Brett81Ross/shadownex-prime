const PLACES={
  tokyo:[139.6917,35.6895,950000],london:[-0.1276,51.5072,700000],paris:[2.3522,48.8566,700000],
  'new york':[-74.006,40.7128,700000],nyc:[-74.006,40.7128,700000],losangeles:[-118.2437,34.0522,800000],
  'los angeles':[-118.2437,34.0522,800000],oklahoma:[-97.5164,35.4676,650000],okc:[-97.5164,35.4676,650000],
  washington:[-77.0369,38.9072,650000],moscow:[37.6173,55.7558,800000],beijing:[116.4074,39.9042,800000],
  dubai:[55.2708,25.2048,700000],sydney:[151.2093,-33.8688,800000]
};
export class CommandEngine{
 constructor(app){this.app=app;}
 async run(raw){const t=raw.trim().toLowerCase();if(!t)return 'No command received.';
   if(/\bbrief( me|ing)?\b|situational report|sitrep/.test(t))return await this.app.requestBriefing(raw);
   const boundary=t.match(/^(?:outline|draw boundary(?: of)?|show boundary(?: of)?)\s+(.{2,120})$/);if(boundary)return await this.app.outlineBoundary(boundary[1]);
   for(const [name,pos] of Object.entries(PLACES)){if(t.includes(name)){this.app.globe.flyTo(...pos);return `NexVision repositioning to ${name.toUpperCase()}.`;}}
   const coord=t.match(/(?:go to|fly to|coordinates?)\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);if(coord){this.app.globe.flyTo(Number(coord[2]),Number(coord[1]),900000);return `Repositioning to ${coord[1]}, ${coord[2]}.`;}
   const nearest=t.match(/(?:find|show|select|track)?\s*(?:the )?nearest\s+(military\s+)?(aircraft|plane|vessel|ship|satellite|earthquake|fire|launch)/);if(nearest){const map={aircraft:'AIRCRAFT',plane:'AIRCRAFT',vessel:'VESSEL',ship:'VESSEL',satellite:'SATELLITE',earthquake:'EARTHQUAKE',fire:'FIRE',launch:'LAUNCH'};const hit=this.app.findNearestContact({type:map[nearest[2]],militaryOnly:!!nearest[1]});return hit?`PrimeCorrelate selected ${hit.meta.name||hit.meta.type} at ${hit.distanceKm.toFixed(1)} km from the reference point.`:'No matching contact is available in the active feeds.';}
   const layerMap={aircraft:'aircraft',planes:'aircraft',earthquakes:'earthquakes',quakes:'earthquakes',fires:'fires',satellites:'satellites',launches:'launches',military:'context',infrastructure:'context',radio:'radio',cctv:'cctv',cameras:'cctv','bike share':'bikeshare',bikes:'bikeshare',vessels:'vessels',ships:'vessels','subsea cables':'subsea','submarine cables':'subsea',cables:'subsea',traffic:'traffic'};
   for(const [word,id] of Object.entries(layerMap)){if(t.includes(word)){const off=/hide|disable|turn off|remove/.test(t);await this.app.setLayer(id,!off);return `${off?'Disabled':'Enabled'} ${id.toUpperCase()}.`;}}
   const lens=['normal','nvg','thermal','crt'].find(x=>t.includes(x));if(lens){this.app.setLens(lens);return `ShadowLens set to ${lens.toUpperCase()}.`;}
   if(/stop track|release target|stop follow/.test(t)){this.app.globe.stopFollow();return 'Target follow released.';}
   if(/cockpit/.test(t)){if(!this.app.globe.selected)return 'Select an aircraft or moving contact first.';this.app.globe.setCockpit(true);return 'Cockpit follow engaged.';}
   if(/track|follow/.test(t)){if(!this.app.globe.selected)return 'Select a contact first.';this.app.globe.setTracking(true);return 'Target tracking engaged.';}
   if(/(?:draw|start|create).*route|route annotation/.test(t)){this.app.globe.armAnnotation('route');return 'NexDraw route armed. Tap points on the globe, then finish.';}
   if(/measure/.test(t)){this.app.globe.armAnnotation('measure');return 'NexDraw measurement armed. Tap two or more points, then finish.';}
   if(/(?:draw|create).*area|area annotation/.test(t)){this.app.globe.armAnnotation('area');return 'NexDraw area armed. Tap three or more points, then finish.';}
   if(/(?:drop|place|add).*mark/.test(t)){this.app.globe.armAnnotation('mark');return 'NexDraw mark armed. Tap the globe.';}
   if(/finish annotation|finish route|finish measure|finish area/.test(t)){this.app.globe.finishAnnotation();return 'NexDraw annotation finalized.';}
   if(/clear annotations|clear drawings|clear marks/.test(t)){this.app.globe.clearAnnotations();return 'NexDraw annotations cleared.';}
   if(/orbit target|orbit selected/.test(t)){this.app.globe.sceneDirector.orbitSelected();return 'SceneDirector target orbit started.';}
   if(/world sweep|global sweep/.test(t)){this.app.globe.sceneDirector.worldSweep();return 'SceneDirector world sweep started.';}
   if(/play route|route scene|fly route/.test(t)){this.app.globe.sceneDirector.playRoute();return 'SceneDirector route sequence started.';}
   if(/reconstruct launch|launch reconstruction|launch arc/.test(t)){this.app.globe.sceneDirector.launchReconstruction();return 'SceneDirector launch reconstruction started. Estimate only — not live telemetry.';}
   if(/stop scene|stop cinematic/.test(t)){this.app.globe.sceneDirector.stop();return 'SceneDirector stopped.';}
   if(/share/.test(t)){this.app.share();return 'Signal Share opened.';}
   return 'Command not matched locally. Try a layer, city, coordinates, ShadowLens mode, tracking, NexDraw, SceneDirector, or “brief me”.';
 }
}
