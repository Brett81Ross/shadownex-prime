// Worldwide 3D source registry. Enhanced geometry is opt-in per verified coverage area.
// Never claim high-detail geometry in areas served only by footprint extrusions.
export const WORLD_3D_BASE={
  terrain:'https://terrain.reearth.land/cesium-mesh/ellipsoid',
  buildings:'https://buildings.reearth.land/tileset.json',
  quality:'global-building-extrusions'
};
// Each approved overlay must have real verified geometry, licensing and geographic bounds.
// Deliberately empty: no unverified or paid photogrammetry endpoints are activated.
export const APPROVED_HIGH_DETAIL_OVERLAYS=Object.freeze([
  Object.freeze({
    id:'plateau-tokyo-chiyoda-lod2',
    name:'Japan MLIT PLATEAU — Chiyoda ward LOD2 buildings',
    approved:true,licenseReviewed:true,
    // Conservative activation envelope, not a surveyed coverage boundary.
    bounds:[139.73,35.67,139.79,35.71],
    tilesetUrl:'https://api.plateauview.mlit.go.jp/datacatalog/3dtiles/13101-bldg-lod2-latest/tileset.json',
    attribution:'3D City Model Data (MLIT Japan / Project PLATEAU; local government). Source: https://www.mlit.go.jp/plateau/ . PDL1.0 / CC BY 4.0 compatible.',
    geometry:'building-lod2',
    // Official documentation verified; end-to-end CORS/live tile fetch not yet verified.
    availability:'published-unverified-live'
  })
]);
export function matchingDetailSources(lon,lat,sources=APPROVED_HIGH_DETAIL_OVERLAYS){
  if(!Number.isFinite(lon)||!Number.isFinite(lat)||lon< -180||lon>180||lat< -90||lat>90)return [];
  return sources.filter(x=>x&&x.approved===true&&x.licenseReviewed===true&&
    /^https:\/\//.test(x.tilesetUrl||'')&&Array.isArray(x.bounds)&&x.bounds.length===4&&
    x.bounds.every(Number.isFinite)&&lat>=x.bounds[1]&&lat<=x.bounds[3]&&
    (x.bounds[0]<=x.bounds[2]?(lon>=x.bounds[0]&&lon<=x.bounds[2]):(lon>=x.bounds[0]||lon<=x.bounds[2])));
}
