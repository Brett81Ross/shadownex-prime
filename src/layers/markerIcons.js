// Consistent high-resolution, provider-independent map symbols.
// SVG rasterizes at 96px but displays at 22-30 CSS px for clear high-DPI Fold markers.
const palette={
  aircraft:['#00e5ff','M16 49 L42 44 48 20 Q50 13 54 20 L60 44 86 49 86 59 59 56 58 71 68 77 68 84 50 78 32 84 32 77 42 71 41 56 16 59 Z'],
  military:['#ff9e38','M16 49 L42 44 48 20 Q50 13 54 20 L60 44 86 49 86 59 59 56 58 71 68 77 68 84 50 78 32 84 32 77 42 71 41 56 16 59 Z'],
  camera:['#ffce4b','M22 35 H34 L41 27 H69 L76 35 H81 V72 H22 Z M50 42 A11 11 0 1 0 50 64 A11 11 0 1 0 50 42'],
  satellite:['#b7fa67','M39 24 L61 24 L61 38 L74 38 L74 60 L61 60 L61 74 L39 74 L39 60 L26 60 L26 38 L39 38 Z M43 43 L57 43 L57 57 L43 57 Z'],
  quake:['#ffad45','M50 15 L87 50 L50 85 L13 50 Z M28 51 L42 39 L49 56 L59 42 L72 52'],
  fire:['#ff653a','M50 14 Q66 36 61 48 Q75 43 70 63 Q64 80 50 83 Q29 83 27 64 Q25 51 40 36 Q39 54 50 57 Q57 44 50 14 Z'],
  launch:['#ef81ff','M50 12 L69 43 L60 43 L60 76 L40 76 L40 43 L31 43 Z'],
  vessel:['#57a4ff','M28 51 L72 51 L65 70 L50 81 L35 70 Z M41 28 H59 V49 H41 Z']
};
const cache=new Map();
export function mapMarker(kind,{size=26}={}){
  const key=palette[kind]?kind:'camera',n=Math.max(18,Math.min(36,Number(size)||26));
  const cacheKey=key+':'+n;
  if(cache.has(cacheKey))return cache.get(cacheKey);
  const [color,path]=palette[key];
  const stroke=key==='quake'?'stroke="white" stroke-width="7" stroke-linejoin="round"':'';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#07151e" fill-opacity=".93" stroke="'+color+'" stroke-width="5"/><path d="'+path+'" fill="white" '+stroke+' fill-rule="evenodd"/></svg>';
  const marker={image:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),width:n,height:n};
  cache.set(cacheKey,marker);return marker;
}
