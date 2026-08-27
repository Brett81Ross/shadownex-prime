const KEY = 'shadownex.prime.settings.v2';
const defaults = { cesiumToken:'', tomtomKey:'', aisKey:'', reduceMotion:false, markerDensity:'normal', lens:'normal' };
export function loadSettings(){
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...defaults }; }
}
export function saveSettings(next){ localStorage.setItem(KEY, JSON.stringify({ ...defaults, ...next })); }
export function resetSettings(){ localStorage.removeItem(KEY); return { ...defaults }; }
export { defaults as defaultSettings };
